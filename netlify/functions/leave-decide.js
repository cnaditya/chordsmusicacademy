// One-tap leave approve/reject link sent to the admin on WhatsApp.
// URL: /.netlify/functions/leave-decide?id=<leave id>&action=approve|reject&sig=<hmac>
const { verify } = require("./_shared/leaveSign");
const { countClassDaysInRange } = require("./_shared/schedule");

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

  const lr = await fetch(`${SUPABASE_URL}/rest/v1/crm_leaves?id=eq.${encodeURIComponent(id)}&select=*`, { headers: H });
  const leaves = await lr.json();
  const leave = Array.isArray(leaves) ? leaves[0] : null;
  if (!leave) return page("Not found", "This leave request no longer exists.", false);
  if (leave.status !== "pending") {
    return page("Already decided", `This leave was already ${leave.status}.`, leave.status === "approved");
  }

  const newStatus = action === "approve" ? "approved" : "rejected";
  let leavesTaken = null;

  if (newStatus === "approved" && leave.student_db_id) {
    const sr = await fetch(`${SUPABASE_URL}/rest/v1/crm_students?id=eq.${leave.student_db_id}&select=leaves_taken,class_days`, { headers: H });
    const srows = await sr.json();
    const stu = Array.isArray(srows) ? srows[0] : null;
    const current = stu ? (stu.leaves_taken || 0) : 0;
    const added = leave.selected_dates
      ? leave.selected_dates.split(",").filter(Boolean).reduce((n, d) => n + countClassDaysInRange(stu?.class_days, d, d), 0)
      : countClassDaysInRange(stu?.class_days, leave.date_from, leave.date_to);
    leavesTaken = current + added;
    await fetch(`${SUPABASE_URL}/rest/v1/crm_students?id=eq.${leave.student_db_id}`, {
      method: "PATCH", headers: { ...H, "Content-Type": "application/json", Prefer: "return=minimal" },
      body: JSON.stringify({ leaves_taken: leavesTaken }),
    });
  }

  await fetch(`${SUPABASE_URL}/rest/v1/crm_leaves?id=eq.${encodeURIComponent(id)}`, {
    method: "PATCH", headers: { ...H, "Content-Type": "application/json", Prefer: "return=minimal" },
    body: JSON.stringify({ status: newStatus }),
  });

  const extra = leavesTaken !== null ? ` ${leave.student_name || "Student"} now has ${leavesTaken} leave class(es) used.` : "";
  return page(
    newStatus === "approved" ? "Leave approved" : "Leave rejected",
    `${leave.student_name || "Student"}'s leave (${leave.date_from} to ${leave.date_to}) was ${newStatus}.${extra}`,
    newStatus === "approved"
  );
};
