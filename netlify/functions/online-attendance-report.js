// Computes tonight's per-student attendance/package message for the "My Online Classes"
// artifact, faithfully porting that artifact's cycle() / current() / message() logic so the
// numbers (classes done/remaining, renewal dates) can never drift from what the app itself shows.
// Called by the "Online Classes Nightly Attendance" cloud routine, which supplies the raw
// artifact data (students/slots/months/phones) fetched via its own ArtifactData access —
// this function has no access to the artifact database itself.

const TARGET = 8;

function pad(n) { return String(n).padStart(2, "0"); }
function iso(d) { return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; }
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
function dayKeyOf(d) { return DAYS[(d.getDay() + 6) % 7]; }
function mins(t) { return (+t.slice(0, 2)) * 60 + (+t.slice(3, 5)); }
function norm(s) { return String(s || "").trim().toLowerCase(); }
function parseISO(s) { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d); }
function ymOf(d) { return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`; }
function dm(s) { return parseISO(s).toLocaleDateString("en-IN", { day: "numeric", month: "short" }); }
function addDays(s, n) { const d = parseISO(s); d.setDate(d.getDate() + n); return iso(d); }
function inr(n) { return "₹" + Number(n || 0).toLocaleString("en-IN"); }

// All date math below must run in IST, since the artifact runs client-side in IST for the owner.
function nowIST() {
  return new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
}
function todayISO_IST() { return iso(nowIST()); }

exports.handler = async function (event) {
  const headers = { "Content-Type": "application/json" };
  const token = event.headers["x-ads-token"] || "";
  if (!token || token !== process.env.ADS_DASHBOARD_PASSWORD) {
    return { statusCode: 401, headers, body: JSON.stringify({ error: "Unauthorized" }) };
  }

  try {
    const { students: studentsDoc, slots, months, phones } = JSON.parse(event.body || "{}");
    if (!slots || !months) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: "slots and months required" }) };
    }
    const S = { slots, months, students: studentsDoc || {}, phones: phones || {} };
    const todayISO = todayISO_IST();
    const now = nowIST();

    function activeOn(slot, date) {
      return (!slot.from || date >= slot.from) && (!slot.until || date <= slot.until);
    }
    function currentSlots() {
      return Object.entries(S.slots).map(([id, s]) => ({ id, ...s })).filter(s => !s.until || s.until >= todayISO);
    }
    const slug = s => norm(s).replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "student";
    function cyclesOf(name) {
      const d = S.students[slug(name)];
      return (d && Array.isArray(d.cycles) && d.cycles.length) ? d.cycles : null;
    }
    function studentsLive() {
      const map = {};
      for (const [id, s] of Object.entries(S.slots)) {
        if (s.kind === "group" || !s.name) continue;
        const k = norm(s.name);
        (map[k] = map[k] || { name: s.name.trim(), slots: [], live: false }).slots.push({ id, ...s });
        if (!s.until || s.until >= todayISO) map[k].live = true;
      }
      return Object.values(map).filter(x => x.live);
    }
    function allExtras(key) {
      const o = [];
      for (const m of Object.values(S.months)) for (const x of (m && m.extras) || []) if (norm(x.name) === key) o.push(x);
      return o;
    }
    function isPast(date, time) {
      if (date !== todayISO) return date < todayISO;
      return now.getHours() * 60 + now.getMinutes() >= mins(time);
    }
    function cycle(stu, start, size) {
      size = +size || TARGET;
      const out = [], ex = allExtras(norm(stu.name));
      let c = 0, end = null, date = start;
      for (let i = 0; i < 1200 && c < size; i++, date = addDays(date, 1)) {
        const dk = dayKeyOf(parseISO(date));
        const marks = (S.months[date.slice(0, 7)] && S.months[date.slice(0, 7)].marks) || {};
        const day = [];
        for (const s of stu.slots) if (s.day === dk && activeOn(s, date)) {
          const key = s.id + "|" + date;
          day.push({ key, date, time: s.time, status: marks[key] || (isPast(date, s.time) ? "done" : "upcoming") });
        }
        for (const x of ex) if (x.date === date) {
          day.push({ key: "x|" + x.id, extraId: x.id, date, time: x.time || "00:00", status: isPast(date, x.time || "00:00") ? "done" : "upcoming", extra: true, mk: x.kind === "makeup", forDate: x.forDate || null });
        }
        day.sort((a, b) => a.time.localeCompare(b.time));
        for (const s of day) {
          if (c >= size) break;
          out.push(s);
          if (s.status === "done" || s.status === "upcoming") { c++; s.nth = c; if (c === size) end = date; }
        }
      }
      const done = out.filter(s => s.status === "done").length;
      return {
        start, list: out, done, counted: c, end, size, complete: done >= size,
        sleave: out.filter(s => s.status === "sleave"), mleave: out.filter(s => s.status === "mleave"),
      };
    }
    function current(stu) {
      const cs = cyclesOf(stu.name), last = cs ? cs[cs.length - 1] : null;
      const start = cs ? cs[cs.length - 1].start : `${ymOf(now)}-01`;
      return { ...cycle(stu, start, last && last.size), amount: (last && last.amount) || 0, unset: !cs };
    }
    function nextStart(r) {
      if (!r.end) return todayISO;
      if (r.start.endsWith("-01") && r.end.slice(0, 7) === r.start.slice(0, 7)) {
        const d = parseISO(r.end);
        return iso(new Date(d.getFullYear(), d.getMonth() + 1, 1));
      }
      return addDays(r.end, 1);
    }
    function message(stu, r) {
      const first = stu.name.split(/\s+/)[0];
      const nx = r.end ? cycle(stu, nextStart(r), 1).end : null;
      const lines = [`Hi ${first}, your class update:`, ``,
        `Prepaid package: ${r.size} one-to-one classes${r.amount ? ` (${inr(r.amount)})` : ""} from ${dm(r.start)}`,
        `Classes used: ${r.done}/${r.size}`];
      const dd = r.list.filter(s => s.status === "done").map(s => dm(s.date));
      if (dd.length) lines.push(`Classes done: ${dd.join(", ")}`);
      if (r.sleave.length) lines.push(`Leave taken: ${r.sleave.map(s => dm(s.date)).join(", ")}`);
      if (r.mleave.length) lines.push(`Cancelled by me: ${r.mleave.map(s => dm(s.date)).join(", ")}`);
      if (r.complete) {
        lines.push(``, `All ${r.size} prepaid classes are used (${dm(r.start)} – ${dm(r.end)}).`,
          `Please renew your package${nx ? ` before your next class on ${dm(nx)}` : ""}. Thank you!`);
      } else {
        lines.push(`Classes remaining: ${r.size - r.done}`);
        if (r.end && r.counted >= r.size) {
          lines.push(`Last class of this package: ${dm(r.end)}`,
            `Please renew${nx ? ` before ${dm(nx)}` : " after that"} to continue.`);
        }
      }
      return lines.join("\n");
    }

    const todayDay = dayKeyOf(now);
    const allLive = studentsLive();
    const hadClassToday = allLive.filter(stu =>
      stu.slots.some(s => s.day === todayDay && activeOn(s, todayISO))
    );

    const sendable = [];
    const missing_phone = [];
    for (const stu of hadClassToday) {
      const r = current(stu);
      const phone = S.phones[norm(stu.name)] || "";
      const text = message(stu, r);
      if (phone) sendable.push({ name: stu.name, phone, message: text });
      else missing_phone.push(stu.name);
    }

    return {
      statusCode: 200, headers,
      body: JSON.stringify({ success: true, date: todayISO, day: todayDay, sendable, missing_phone }),
    };
  } catch (e) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: String(e) }) };
  }
};
