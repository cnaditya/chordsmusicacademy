// One-tap leave approve/reject link sent to the admin on WhatsApp.
// URL: /.netlify/functions/leave-decide?id=<leave id>&action=approve|reject&sig=<hmac>
const { verify } = require("./_shared/leaveSign");
const { decideLeave } = require("./_shared/leaveApply");

const page = (title, message, ok) => ({
  statusCode: 200,
  headers: { "Content-Type": "text/html; charset=utf-8" },
  body: `<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><meta charset="UTF-8"><title>${title}</title>
<style>body{font-family:-apple-system,sans-serif;background:#f4f6f0;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;padding:20px;}
.box{background:#fff;border-radius:14px;padding:28px;max-width:420px;text-align:center;box-shadow:0 4px 20px rgba(0,0,0,.08);}
h1{font-size:1.3rem;color:${ok ? "#1a7f37" : "#b03030"};margin-bottom:10px;}p{color:#334;line-height:1.5;}</style></head>
<body><div class="box"><h1>${title}</h1><p>${message}</p></div></body></html>`,
});

exports.handler = async (event) => {
  const q = event.queryStringParameters || {};
  const { id, action, sig } = q;
  const secret = process.env.ADS_DASHBOARD_PASSWORD;
  if (!id || !["approve", "reject"].includes(action) || !verify(id, action, sig, secret)) {
    return page("Invalid link", "This link is not valid or has been altered.", false);
  }

  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_KEY = process.env.SUPABASE_SECRET_KEY;
  const H = { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` };

  const out = await decideLeave({ SUPABASE_URL, H, leaveId: id, action });
  if (out.error === "not_found") return page("Not found", "This leave request no longer exists.", false);
  if (out.error === "already_decided") {
    return page("Already decided", `This leave was already ${out.status}.`, out.status === "approved");
  }

  if (out.status === "approved") {
    const extra = out.remaining !== null && out.remaining !== undefined
      ? ` ${out.student || "Student"} has ${out.remaining} classes left. New due date: ${out.dueDate}.`
      : "";
    const note = out.msg && out.msg.sent ? " The student has been messaged." : " The student could not be messaged yet.";
    return page("Leave approved", `${out.student || "Student"}'s leave was approved.${extra}${note}`, true);
  }
  const why = out.reason ? ` Reason: ${out.reason}.` : "";
  return page("Leave rejected", `${out.student || "Student"}'s leave was rejected.${why}`, false);
};
