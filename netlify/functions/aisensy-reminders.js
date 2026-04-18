// Scheduled daily at 9am IST (3:30am UTC) — sends WhatsApp fee reminders via AiSensy
// Schedule defined in netlify.toml: [functions."aisensy-reminders"] schedule = "30 3 * * *"
//
// TEMPLATES TO CREATE IN AISENSY (Manage → Templates):
//
// 1. Name: fee_reminder_advance
//    Body: Hi {{1}}, your Chords Music Academy fee of {{2}} is due on {{3}}. Please pay at chordsmusicacademy.in/pay 🎵
//
// 2. Name: fee_reminder_tomorrow
//    Body: Hi {{1}}, your Chords Music Academy fee of {{2}} is due tomorrow ({{3}}). Please pay today at chordsmusicacademy.in/pay 🎵
//
// 3. Name: fee_overdue
//    Body: Hi {{1}}, your Chords Music Academy fee of {{2}} was due on {{3}}. Kindly clear your dues at chordsmusicacademy.in/pay 🎵

async function sendAiSensy(phone, campaignName, params, studentName) {
  const key = process.env.AISENSY_API_KEY;
  if (!key) { console.error("AISENSY_API_KEY not set"); return null; }

  // Normalize phone to international format (no + prefix)
  let p = String(phone || "").replace(/\D/g, "");
  if (!p || p.length < 7) return null;
  if (p.length === 10) p = "91" + p;                      // 10-digit Indian → add 91
  else if (p.startsWith("0") && p.length === 11) p = "91" + p.slice(1); // 011-digit → drop 0, add 91

  try {
    const res = await fetch("https://backend.aisensy.com/campaign/t1/api/v2", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        apiKey: key,
        campaignName,
        destination: p,
        userName: studentName || "Student",
        templateParams: params,
        source: "cma-crm",
        media: {},
        buttons: [],
        carouselCards: [],
        location: {},
      }),
    });
    const text = await res.text();
    console.log(`AiSensy → ${studentName} (${p}) [${campaignName}]: ${res.status} ${text}`);
    return { status: res.status, body: text };
  } catch (err) {
    console.error(`AiSensy send error for ${studentName}:`, err.message);
    return null;
  }
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
  });
}

exports.handler = async (event) => {
  try {
    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_KEY = process.env.SUPABASE_SECRET_KEY;

    // Fetch active students who owe fees and have a due date set
    const r = await fetch(
      `${SUPABASE_URL}/rest/v1/crm_students?is_active=eq.true&amount_due=gt.0&due_date=not.is.null&select=id,name,phone,amount_due,due_date`,
      { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } }
    );
    const students = await r.json();
    if (!Array.isArray(students)) {
      console.error("Failed to fetch students:", students);
      return { statusCode: 500, body: "Failed to fetch students" };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const sent = [];
    const skipped = [];

    for (const s of students) {
      if (!s.phone) { skipped.push({ name: s.name, reason: "no phone" }); continue; }

      const due = new Date(s.due_date);
      due.setHours(0, 0, 0, 0);
      const diff = Math.round((due - today) / 86400000); // positive = days until due, negative = days overdue

      const amount = `Rs.${s.amount_due}`;
      const dueStr = formatDate(s.due_date);
      let template = null;

      if (diff === 3) {
        template = { name: "fee_reminder_advance", params: [s.name, amount, dueStr] };
      } else if (diff === 1) {
        template = { name: "fee_reminder_tomorrow", params: [s.name, amount, dueStr] };
      } else if (diff === -1 || diff === -3 || diff === -7) {
        template = { name: "fee_overdue", params: [s.name, amount, dueStr] };
      } else if (diff <= -14 && Math.abs(diff) % 7 === 0) {
        // Weekly reminders after 14 days overdue
        template = { name: "fee_overdue", params: [s.name, amount, dueStr] };
      }

      if (template) {
        await sendAiSensy(s.phone, template.name, template.params, s.name);
        sent.push({ name: s.name, template: template.name, diff });
      } else {
        skipped.push({ name: s.name, reason: `diff=${diff} (no reminder today)` });
      }
    }

    console.log(`Fee reminders: ${sent.length} sent, ${skipped.length} skipped`);
    return {
      statusCode: 200,
      body: JSON.stringify({ sent: sent.length, skipped: skipped.length, results: sent }),
    };
  } catch (err) {
    console.error("aisensy-reminders error:", err);
    return { statusCode: 500, body: err.message };
  }
};
