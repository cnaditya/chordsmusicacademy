// Applies an approve or reject decision to a leave request, updates the student's
// class count and due date, and messages the student. Used by both the WhatsApp
// approve links (leave-decide.js) and the CRM approve button (pay-admin-student.js).
const { computeCycle, checkMonthlyLimit, studentMessage, todayIso } = require("./leaves");
const { normalizePhone } = require("./normalizePhone");

const API_VERSION = "v23.0";

// Sends one line to the student through the approved cma_update template.
async function messageStudent(phone, text) {
  const to = normalizePhone(phone);
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
  if (!to || !phoneNumberId || !accessToken) return { sent: false, error: "missing phone or WhatsApp settings" };
  try {
    const res = await fetch(`https://graph.facebook.com/${API_VERSION}/${phoneNumberId}/messages`, {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to,
        type: "template",
        template: {
          name: "cma_update",
          language: { code: "en_US" },
          components: [
            { type: "header", parameters: [{ type: "text", text: "Leave update" }] },
            { type: "body", parameters: [{ type: "text", text: String(text).replace(/\s+/g, " ").trim().slice(0, 900) }] },
          ],
        },
      }),
    });
    const data = await res.json();
    return res.ok ? { sent: true } : { sent: false, error: data };
  } catch (e) {
    return { sent: false, error: String(e) };
  }
}

// H is the Supabase headers object (apikey + Authorization).
async function decideLeave({ SUPABASE_URL, H, leaveId, action, adminNote }) {
  const JSON_H = { ...H, "Content-Type": "application/json", Prefer: "return=minimal" };
  const lr = await fetch(`${SUPABASE_URL}/rest/v1/crm_leaves?id=eq.${encodeURIComponent(leaveId)}&select=*`, { headers: H });
  const rows = await lr.json();
  const leave = Array.isArray(rows) ? rows[0] : null;
  if (!leave) return { error: "not_found" };
  if (leave.status !== "pending") return { error: "already_decided", status: leave.status };

  const stuR = leave.student_db_id
    ? await fetch(`${SUPABASE_URL}/rest/v1/crm_students?id=eq.${leave.student_db_id}&select=*`, { headers: H })
    : null;
  const stuRows = stuR ? await stuR.json() : [];
  const stu = Array.isArray(stuRows) ? stuRows[0] : null;

  const setLeave = (status, note) =>
    fetch(`${SUPABASE_URL}/rest/v1/crm_leaves?id=eq.${encodeURIComponent(leaveId)}`, {
      method: "PATCH", headers: JSON_H, body: JSON.stringify({ status, admin_note: note || leave.admin_note || "" }),
    });

  if (action === "reject") {
    await setLeave("rejected", adminNote);
    const msg = await maybeMessage(stu, leave, { ok: false, reason: adminNote || "not approved this time" });
    return { status: "rejected", student: leave.student_name, msg };
  }

  // Approve: check the monthly limit and recalculate the class count and due date.
  let approvedLeaves = [];
  if (stu) {
    const ar = await fetch(
      `${SUPABASE_URL}/rest/v1/crm_leaves?student_db_id=eq.${stu.id}&status=eq.approved&select=*`,
      { headers: H }
    );
    const ap = await ar.json();
    approvedLeaves = Array.isArray(ap) ? ap : [];
  }

  if (stu) {
    const limit = checkMonthlyLimit(leave, approvedLeaves);
    if (!limit.ok) {
      await setLeave("rejected", limit.reason);
      const msg = await maybeMessage(stu, leave, { ok: false, reason: limit.reason });
      return { status: "rejected", reason: limit.reason, student: leave.student_name, msg };
    }
  }

  let result = { ok: true, remaining: null, dueDate: null };
  if (stu) {
    const cyc = computeCycle(stu, [...approvedLeaves, leave], todayIso());
    result = { ok: true, remaining: cyc.remaining, dueDate: cyc.dueDate };
    await fetch(`${SUPABASE_URL}/rest/v1/crm_students?id=eq.${stu.id}`, {
      method: "PATCH", headers: JSON_H,
      body: JSON.stringify({ leaves_taken: cyc.leavesTaken, due_date: cyc.dueDate }),
    });
  }
  await setLeave("approved", adminNote);
  const msg = await maybeMessage(stu, leave, result);
  return { status: "approved", student: leave.student_name, remaining: result.remaining, dueDate: result.dueDate, msg };
}

async function maybeMessage(stu, leave, result) {
  if (!stu || !stu.phone) return { sent: false, error: "no phone on student record" };
  return messageStudent(stu.phone, studentMessage(leave, result));
}

module.exports = { decideLeave, messageStudent };
