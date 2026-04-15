exports.handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, x-admin-token",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
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
    if (event.httpMethod === "GET") {
      const student_id = event.queryStringParameters?.student_id;
      const month = event.queryStringParameters?.month; // YYYY-MM format
      if (!student_id) return { statusCode: 400, headers, body: JSON.stringify({ error: "student_id required" }) };

      let url = `/rest/v1/crm_attendance?student_id=eq.${student_id}&order=date.desc`;
      if (month) {
        url += `&date=gte.${month}-01&date=lt.${month}-32`;
      }

      const res = await fetch(`${SUPABASE_URL}${url}`, { headers: sbHeaders });
      const data = await res.json();

      return {
        statusCode: 200, headers,
        body: JSON.stringify({ success: true, attendance: Array.isArray(data) ? data : [] }),
      };
    }

    if (event.httpMethod === "POST") {
      let body = {};
      try { body = JSON.parse(event.body || "{}"); } catch { body = {}; }

      const { action, student_id, date, status, note } = body;

      if (action === "mark" || !action) {
        if (!student_id || !date) {
          return { statusCode: 400, headers, body: JSON.stringify({ error: "student_id and date required" }) };
        }

        // Delete existing entry for the same student+date
        await fetch(`${SUPABASE_URL}/rest/v1/crm_attendance?student_id=eq.${student_id}&date=eq.${date}`, {
          method: "DELETE",
          headers: sbHeaders,
        });

        const res = await fetch(`${SUPABASE_URL}/rest/v1/crm_attendance`, {
          method: "POST",
          headers: sbHeaders,
          body: JSON.stringify({ student_id, date, status: status || "present", note: note || null }),
        });
        const data = await res.json();

        if (res.status >= 400) {
          return { statusCode: res.status, headers, body: JSON.stringify({ error: data?.message || "Failed" }) };
        }

        return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };
      }

      if (action === "delete") {
        const { id } = body;
        if (!id) return { statusCode: 400, headers, body: JSON.stringify({ error: "id required" }) };

        await fetch(`${SUPABASE_URL}/rest/v1/crm_attendance?id=eq.${id}`, {
          method: "DELETE",
          headers: sbHeaders,
        });

        return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };
      }

      // Monthly summary for a student
      if (action === "monthly_summary") {
        const { student_id: sid, month: mon } = body;
        if (!sid || !mon) return { statusCode: 400, headers, body: JSON.stringify({ error: "student_id and month required" }) };

        const res = await fetch(
          `${SUPABASE_URL}/rest/v1/crm_attendance?student_id=eq.${sid}&date=gte.${mon}-01&date=lte.${mon}-31&order=date.asc`,
          { headers: sbHeaders }
        );
        const data = await res.json();

        const records = Array.isArray(data) ? data : [];
        const present = records.filter(r => r.status === "present").length;
        const absent = records.filter(r => r.status === "absent").length;

        return {
          statusCode: 200, headers,
          body: JSON.stringify({ success: true, records, present, absent, total: records.length }),
        };
      }
    }

    return { statusCode: 405, headers, body: JSON.stringify({ error: "Method not allowed" }) };
  } catch (err) {
    console.error("Attendance error:", err);
    return { statusCode: 500, headers, body: JSON.stringify({ error: "Server error", detail: err.message }) };
  }
};
