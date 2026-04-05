exports.handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Content-Type": "application/json",
  };

  if (event.httpMethod === "OPTIONS") return { statusCode: 200, headers, body: "" };
  if (event.httpMethod !== "POST") return { statusCode: 405, headers, body: JSON.stringify({ error: "Method not allowed" }) };

  const adminToken = event.headers["x-admin-token"] || "";
  if (!adminToken || adminToken !== process.env.PAYMENT_ADMIN_PASSWORD) {
    return { statusCode: 401, headers, body: JSON.stringify({ error: "Unauthorized" }) };
  }

  try {
    const { record_id, status, admin_notes } = JSON.parse(event.body || "{}");
    if (!record_id || !status) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: "record_id and status are required" }) };
    }

    const validStatuses = ["pending", "submitted", "verified", "overdue"];
    if (!validStatuses.includes(status)) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: "Invalid status" }) };
    }

    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_KEY = process.env.SUPABASE_SECRET_KEY;

    const payload = { status };
    if (admin_notes !== undefined) payload.admin_notes = admin_notes;
    if (status === "verified") payload.admin_verified_at = new Date().toISOString();

    const updateRes = await fetch(
      `${SUPABASE_URL}/rest/v1/payment_records?id=eq.${encodeURIComponent(record_id)}`,
      {
        method: "PATCH",
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
          "Content-Type": "application/json",
          Prefer: "return=representation",
        },
        body: JSON.stringify(payload),
      }
    );

    const updated = await updateRes.json();
    if (!Array.isArray(updated) || updated.length === 0) {
      return { statusCode: 500, headers, body: JSON.stringify({ error: "Failed to update record" }) };
    }

    return { statusCode: 200, headers, body: JSON.stringify({ success: true, record: updated[0] }) };
  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: "Server error" }) };
  }
};
