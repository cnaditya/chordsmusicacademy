// Scheduled daily at 9am IST (3:30am UTC) — sends WhatsApp fee reminders via Meta's
// direct Cloud API. Replaces aisensy-reminders.js (removed 2026-10-01 — AiSensy
// membership lapsed and reminders had stopped going out).
// Schedule defined in netlify.toml: [functions."fee-reminders"] schedule = "30 3 * * *"
//
// Templates (created directly via the Graph API, status PENDING as of 2026-10-01 —
// check approval with GET /{waba_id}/message_templates before relying on this):
//
// 1. fee_reminder_advance (UTILITY)
//    "Hi {{1}}, your Chords Music Academy fee of {{2}} is due on {{3}}. Please pay at chordsmusicacademy.in/pay"
//
// 2. fee_reminder_tomorrow (UTILITY)
//    "Hi {{1}}, your Chords Music Academy fee of {{2}} is due tomorrow ({{3}}). Please pay today at chordsmusicacademy.in/pay"
//
// 3. fee_overdue (UTILITY)
//    "Hi {{1}}, your Chords Music Academy fee of {{2}} was due on {{3}}. Kindly clear your dues at chordsmusicacademy.in/pay"

const API_VERSION = "v23.0";

async function sendWhatsAppTemplate(phone, templateName, params, studentName) {
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;

  let p = String(phone || "").replace(/\D/g, "");
  if (!p || p.length < 7) return null;
  if (p.length === 10) p = "91" + p;
  else if (p.startsWith("0") && p.length === 11) p = "91" + p.slice(1);

  try {
    const res = await fetch(`https://graph.facebook.com/${API_VERSION}/${phoneNumberId}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: p,
        type: "template",
        template: {
          name: templateName,
          language: { code: "en_US" },
          components: [
            {
              type: "body",
              parameters: params.map((text) => ({ type: "text", text: String(text) })),
            },
          ],
        },
      }),
    });
    const text = await res.text();
    console.log(`WhatsApp → ${studentName} (${p}) [${templateName}]: ${res.status} ${text}`);
    return { status: res.status, body: text };
  } catch (err) {
    console.error(`WhatsApp send error for ${studentName}:`, err.message);
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
      const diff = Math.round((due - today) / 86400000);

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
        template = { name: "fee_overdue", params: [s.name, amount, dueStr] };
      }

      if (template) {
        await sendWhatsAppTemplate(s.phone, template.name, template.params, s.name);
        sent.push({ name: s.name, template: template.name, diff });
      } else {
        skipped.push({ name: s.name, reason: `diff=${diff} (no reminder today)` });
      }
    }

    console.log(`Fee reminders: ${sent.length} sent, ${skipped.length} skipped`);

    // Always notify Aaditya after the run, even if nothing was sent — he asked
    // to be informed every time, not asked for approval beforehand.
    await notifyAaditya(sent);

    return {
      statusCode: 200,
      body: JSON.stringify({ sent: sent.length, skipped: skipped.length, results: sent }),
    };
  } catch (err) {
    console.error("fee-reminders error:", err);
    await notifyAaditya(null, err.message);
    return { statusCode: 500, body: err.message };
  }
};

async function notifyAaditya(sent, errorMessage) {
  let message;
  if (errorMessage) {
    message = `Fee reminders run failed today: ${errorMessage}`;
  } else if (!sent || sent.length === 0) {
    message = "Fee reminders ran today — no students were due a reminder.";
  } else {
    const lines = sent.map((s) => `${s.name} (${s.template.replace("fee_", "").replace(/_/g, " ")})`);
    message = `Fee reminders sent today to ${sent.length} student(s): ${lines.join(", ")}`;
  }

  try {
    const res = await fetch("https://chordsmusicacademy.in/.netlify/functions/send-whatsapp-alert", {
      method: "POST",
      headers: { "x-ads-token": process.env.ADS_DASHBOARD_PASSWORD, "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });
    const text = await res.text();
    console.log(`Notify Aaditya: ${res.status} ${text}`);
  } catch (err) {
    console.error("Failed to notify Aaditya:", err.message);
  }
}
