// Computes tonight's per-student attendance/package message for the "My Online Classes"
// artifact, faithfully porting that artifact's cycle() / current() / message() logic
// (including pause support and "timed" monthly/period packages, added 2026-10-16) so the
// numbers can never drift from what the app itself shows.
// Called by the "Online Classes Nightly Attendance" cloud routine, which supplies the raw
// artifact data (students/slots/months/phones) fetched via its own ArtifactData access —
// this function has no access to the artifact database itself.
//
// IMPORTANT: this is a manual port of the artifact's JS. If the artifact's own cycle/message
// logic changes again, re-check this file against it before trusting another nightly run —
// see project_online_classes_attendance.md in memory.

const TARGET = 8;

function pad(n) { return String(n).padStart(2, "0"); }
function iso(d) { return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; }
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
function dayKeyOf(d) { return DAYS[(d.getDay() + 6) % 7]; }
function mins(t) { return (+t.slice(0, 2)) * 60 + (+t.slice(3, 5)); }
function norm(s) { return String(s || "").trim().toLowerCase(); }
function parseISO(s) { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d); }
function ymOf(d) { return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`; }
function monthName(ym) { const [y, m] = ym.split("-").map(Number); return new Date(y, m - 1, 1).toLocaleDateString("en-IN", { month: "long", year: "numeric" }); }
function dm(s) { return parseISO(s).toLocaleDateString("en-IN", { day: "numeric", month: "short" }); }
function dmy(s) { return parseISO(s).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }); }
function addDays(s, n) { const d = parseISO(s); d.setDate(d.getDate() + n); return iso(d); }
function inr(n) { return "₹" + Number(n || 0).toLocaleString("en-IN"); }
function addMonthsEnd(s, n) { const d = parseISO(s); return addDays(iso(new Date(d.getFullYear(), d.getMonth() + n, d.getDate())), -1); }

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
    const slug = s => norm(s).replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "student";
    function cyclesOf(name) {
      const d = S.students[slug(name)];
      return (d && Array.isArray(d.cycles) && d.cycles.length) ? d.cycles : null;
    }
    function pausesOf(name) {
      const d = S.students[slug(name)];
      return (d && Array.isArray(d.pauses)) ? d.pauses : [];
    }
    function pausedOn(name, date) {
      return pausesOf(name).some(p => date >= p.from && (!p.until || date <= p.until));
    }
    function pauseNow(name) {
      return pausesOf(name).find(p => !p.until || p.until >= todayISO) || null;
    }
    function pausedDays(name, a, b) {
      let n = 0;
      for (const p of pausesOf(name)) {
        const s = p.from > a ? p.from : a;
        let e = p.until || todayISO;
        if (e > b) e = b;
        if (e >= s) n += Math.round((parseISO(e) - parseISO(s)) / 86400000) + 1;
      }
      return n;
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

    function cycle(stu, start, size, until, perMonth) {
      const timed = !!until;
      if (timed) until = addDays(until, pausedDays(stu.name, start, until));
      size = +size || TARGET;
      const out = [], ex = allExtras(norm(stu.name));
      let c = 0, end = null, date = start, extraBal = 0, perM = 0, pers = [];
      for (let i = 0; i < 1200 && (timed ? date <= until : c < size); i++, date = addDays(date, 1)) {
        const dk = dayKeyOf(parseISO(date));
        const marks = (S.months[date.slice(0, 7)] && S.months[date.slice(0, 7)].marks) || {};
        const day = [];
        for (const s of stu.slots) if (s.day === dk && activeOn(s, date) && !pausedOn(stu.name, date)) {
          const key = s.id + "|" + date;
          day.push({ key, date, time: s.time, status: marks[key] || (isPast(date, s.time) ? "done" : "upcoming") });
        }
        for (const x of ex) if (x.date === date) {
          day.push({ key: "x|" + x.id, extraId: x.id, date, time: x.time || "00:00", status: isPast(date, x.time || "00:00") ? "done" : "upcoming", extra: true, mk: x.kind === "makeup", forDate: x.forDate || null });
        }
        day.sort((a, b) => a.time.localeCompare(b.time));
        for (const s of day) {
          if (!timed && c >= size) break;
          out.push(s);
          if (s.status === "done" || s.status === "upcoming") { c++; s.nth = c; if (!timed && c === size) end = date; }
        }
      }
      const done = out.filter(s => s.status === "done").length;
      if (timed) {
        const pm = +perMonth || TARGET, periods = [];
        let ps = start, ext = 0;
        for (let k = 0; ps <= until && k < 60; k++) {
          let pe = addMonthsEnd(start, k + 1);
          if (pe > until) pe = until;
          const dn = out.filter(s => s.status === "done" && s.date >= ps && s.date <= pe).length;
          const cur = todayISO >= ps && todayISO <= pe, fut = todayISO < ps;
          const full = pe === addMonthsEnd(start, k + 1);
          const q = full ? pm : Math.round(pm * ((parseISO(pe) - parseISO(ps)) / 86400000 + 1) / 30.44);
          periods.push({ ps, pe, done: dn, quota: q, cur, fut });
          if (!fut) ext += cur ? Math.max(0, dn - q) : dn - q;
          ps = addDays(pe, 1);
        }
        extraBal = ext; perM = pm; pers = periods;
      }
      if (timed) {
        return {
          perMonth: perM, extra: extraBal, periods: pers, start, list: out, done, counted: c, end: until,
          size: Math.max(c, 1), timed: true, until, daysLeft: Math.round((parseISO(until) - parseISO(todayISO)) / 86400000),
          complete: todayISO > until,
          sleave: out.filter(s => s.status === "sleave"), mleave: out.filter(s => s.status === "mleave"),
        };
      }
      return {
        start, list: out, done, counted: c, end, size, complete: done >= size,
        sleave: out.filter(s => s.status === "sleave"), mleave: out.filter(s => s.status === "mleave"),
      };
    }

    function current(stu) {
      const cs = cyclesOf(stu.name), last = cs ? cs[cs.length - 1] : null;
      const start = cs ? cs[cs.length - 1].start : `${ymOf(now)}-01`;
      const pz = pauseNow(stu.name);
      const base = cycle(stu, start, last && last.size, last && last.until, last && last.perMonth);
      const over = (!base.timed && base.complete && base.end && base.end < todayISO)
        ? cycle(stu, addDays(base.end, 1), 999).list.filter(x => x.status === "done" && x.date <= todayISO)
        : [];
      return { ...base, over, pause: pz, paused: !!pz && pz.from <= todayISO, amount: (last && last.amount) || 0, unset: !cs, paidOn: cs ? cs[cs.length - 1].paidOn : null };
    }

    function nextStart(r) {
      if (!r.end) return todayISO;
      if (r.start.endsWith("-01") && r.end.slice(0, 7) === r.start.slice(0, 7)) {
        const d = parseISO(r.end);
        return iso(new Date(d.getFullYear(), d.getMonth() + 1, 1));
      }
      return addDays(r.end, 1);
    }
    function soonOf(r) {
      return !r.complete && (r.timed ? r.daysLeft <= Math.min(14, Math.round((parseISO(r.until) - parseISO(r.start)) / 86400000 / 4)) : r.size - r.done <= 2);
    }

    function message(stu, r) {
      const first = stu.name.split(/\s+/)[0];
      if (r.timed) {
        const ym = ymOf(now), mon = monthName(ym);
        const L = [`Hi ${first}, your class update:`, ``,
          `Prepaid package: ${dmy(r.start)} – ${dmy(r.until)}${r.amount ? ` (${inr(r.amount)})` : ""}`,
          `Classes attended so far: ${r.done}`];
        const dd = r.list.filter(s => s.status === "done" && s.date.startsWith(ym)).map(s => dm(s.date));
        if (dd.length) L.push(`Classes in ${mon}: ${dd.join(", ")}`);
        const lv = r.sleave.filter(s => s.date.startsWith(ym));
        if (lv.length) L.push(`Leave taken: ${lv.map(s => dm(s.date)).join(", ")}`);
        const ml = r.mleave.filter(s => s.date.startsWith(ym));
        if (ml.length) L.push(`Cancelled by me: ${ml.map(s => dm(s.date)).join(", ")}`);
        L.push(``, r.complete
          ? `Your package ended on ${dmy(r.until)}. Please renew to continue classes. Thank you!`
          : soonOf(r)
            ? `Your package is valid till ${dmy(r.until)}. Please renew before then. Thank you!`
            : `Your package is valid till ${dmy(r.until)}.`);
        return L.join("\n");
      }
      const nx = r.end ? cycle(stu, nextStart(r), 1).end : null;
      const lines = [`Hi ${first}, your class update:`, ``,
        `Prepaid package: ${r.size} one-to-one classes${r.amount ? ` (${inr(r.amount)})` : ""} from ${dm(r.start)}`,
        `Classes used: ${r.done}/${r.size}`];
      const dd = r.list.filter(s => s.status === "done").map(s => dm(s.date));
      if (dd.length) lines.push(`Classes done: ${dd.join(", ")}`);
      if (r.sleave.length) lines.push(`Leave taken: ${r.sleave.map(s => dm(s.date)).join(", ")}`);
      if (r.mleave.length) lines.push(`Cancelled by me: ${r.mleave.map(s => dm(s.date)).join(", ")}`);
      if (r.complete) {
        lines.push(``, `All ${r.size} prepaid classes are used (${dm(r.start)} – ${dm(r.end)}).`);
        if (r.over && r.over.length) lines.push(`Classes taken after that: ${r.over.length} (${r.over.map(s => dm(s.date)).join(", ")})`);
        lines.push(`Please renew your package${nx && nx >= todayISO && !(r.over && r.over.length) ? ` before your next class on ${dm(nx)}` : ""}. Thank you!`);
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
