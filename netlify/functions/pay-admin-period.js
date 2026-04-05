// Creates billing period records for all active monthly students
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
    const { period } = JSON.parse(event.body || "{}");
    if (!period) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: "period is required (e.g. 'April 2025')" }) };
    }

    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_KEY = process.env.SUPABASE_SECRET_KEY;

    // Fetch all active monthly students
    const stuRes = await fetch(
      `${SUPABASE_URL}/rest/v1/payment_students?is_active=eq.true&payment_type=eq.monthly&select=id,name,amount_due,billing_day`,
      {
        headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
      }
    );
    const students = await stuRes.json();
    if (!Array.isArray(students) || students.length === 0) {
      return { statusCode: 200, headers, body: JSON.stringify({ success: true, created: 0, message: "No active monthly students found" }) };
    }

    // Check which students already have a record for this period
    const existRes = await fetch(
      `${SUPABASE_URL}/rest/v1/payment_records?billing_period=eq.${encodeURIComponent(period)}&select=student_id`,
      {
        headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
      }
    );
    const existing = await existRes.json();
    const alreadyHas = new Set((Array.isArray(existing) ? existing : []).map((r) => r.student_id));

    const toInsert = students
      .filter((s) => !alreadyHas.has(s.id))
      .map((s) => ({
        student_id: s.id,
        billing_period: period,
        amount_due: s.amount_due,
        status: "pending",
      }));

    if (toInsert.length === 0) {
      return { statusCode: 200, headers, body: JSON.stringify({ success: true, created: 0, message: "All students already have records for this period" }) };
    }

    const insRes = await fetch(
      `${SUPABASE_URL}/rest/v1/payment_records`,
      {
        method: "POST",
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
          "Content-Type": "application/json",
          Prefer: "return=representation",
        },
        body: JSON.stringify(toInsert),
      }
    );
    const inserted = await insRes.json();
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true, created: Array.isArray(inserted) ? inserted.length : 0, period }),
    };
  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: "Server error" }) };
  }
};
