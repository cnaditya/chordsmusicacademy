exports.handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, x-admin-token",
    "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
    "Content-Type": "application/json",
  };

  if (event.httpMethod === "OPTIONS") return { statusCode: 200, headers, body: "" };

  const adminToken = event.headers["x-admin-token"] || "";
  if (!adminToken || adminToken !== process.env.PAYMENT_ADMIN_PASSWORD) {
    return { statusCode: 401, headers, body: JSON.stringify({ error: "Unauthorized" }) };
  }

  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_KEY = process.env.SUPABASE_SECRET_KEY;

  const sbHeaders = {
    apikey: SUPABASE_KEY,
    Authorization: `Bearer ${SUPABASE_KEY}`,
    "Content-Type": "application/json",
    Prefer: "return=representation",
  };

  try {
    let body = {};
    try { body = JSON.parse(event.body || "{}"); } catch { body = {}; }

    const { action } = body;

    // GET notes for a student
    if (action === "get_notes" || event.httpMethod === "GET") {
      const student_id = body.student_id || event.queryStringParameters?.student_id;
      if (!student_id) return { statusCode: 400, headers, body: JSON.stringify({ error: "student_id required" }) };

      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/crm_notes?student_id=eq.${student_id}&order=created_at.desc`,
        { headers: sbHeaders }
      );
      const data = await res.json();

      return {
        statusCode: 200, headers,
        body: JSON.stringify({ success: true, notes: Array.isArray(data) ? data : [] }),
      };
    }

    // ADD note
    if (action === "add_note") {
      const { student_id, content } = body;
      if (!student_id || !content) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: "student_id and content required" }) };
      }

      const res = await fetch(`${SUPABASE_URL}/rest/v1/crm_notes`, {
        method: "POST",
        headers: sbHeaders,
        body: JSON.stringify({ student_id, content: content.trim() }),
      });
      const data = await res.json();

      if (res.status >= 400) {
        return { statusCode: res.status, headers, body: JSON.stringify({ error: data?.message || "Insert failed" }) };
      }

      const inserted = Array.isArray(data) ? data[0] : data;
      return { statusCode: 200, headers, body: JSON.stringify({ success: true, note: inserted }) };
    }

    // DELETE note
    if (action === "delete_note") {
      const { id } = body;
      if (!id) return { statusCode: 400, headers, body: JSON.stringify({ error: "id required" }) };

      await fetch(`${SUPABASE_URL}/rest/v1/crm_notes?id=eq.${id}`, {
        method: "DELETE",
        headers: sbHeaders,
      });

      return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };
    }

    return { statusCode: 400, headers, body: JSON.stringify({ error: "Unknown action" }) };
  } catch (err) {
    console.error("Notes error:", err);
    return { statusCode: 500, headers, body: JSON.stringify({ error: "Server error", detail: err.message }) };
  }
};
