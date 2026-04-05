exports.handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Content-Type": "application/json",
  };

  if (event.httpMethod === "OPTIONS") return { statusCode: 200, headers, body: "" };

  const adminToken = event.headers["x-admin-token"] || "";
  if (!adminToken || adminToken !== process.env.PAYMENT_ADMIN_PASSWORD) {
    return { statusCode: 401, headers, body: JSON.stringify({ error: "Unauthorized" }) };
  }

  try {
    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_KEY = process.env.SUPABASE_SECRET_KEY;

    const period = event.queryStringParameters?.period || "";

    // Fetch all active students
    const stuRes = await fetch(
      `${SUPABASE_URL}/rest/v1/payment_students?is_active=eq.true&order=name.asc&select=*`,
      {
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
        },
      }
    );
    const students = await stuRes.json();
    if (!Array.isArray(students)) {
      return { statusCode: 500, headers, body: JSON.stringify({ error: "Failed to fetch students" }) };
    }

    // Fetch payment records for the given period (or all if no period specified)
    let recordsUrl = `${SUPABASE_URL}/rest/v1/payment_records?order=created_at.desc&select=*`;
    if (period) {
      recordsUrl = `${SUPABASE_URL}/rest/v1/payment_records?billing_period=eq.${encodeURIComponent(period)}&order=created_at.desc&select=*`;
    }

    const recRes = await fetch(recordsUrl, {
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
      },
    });
    const records = await recRes.json();

    // Fetch distinct billing periods
    const periodsRes = await fetch(
      `${SUPABASE_URL}/rest/v1/payment_records?select=billing_period&order=billing_period.desc`,
      {
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
        },
      }
    );
    const periodsRaw = await periodsRes.json();
    const periods = [...new Set((Array.isArray(periodsRaw) ? periodsRaw : []).map((r) => r.billing_period))];

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        students,
        records: Array.isArray(records) ? records : [],
        periods,
      }),
    };
  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: "Server error" }) };
  }
};
