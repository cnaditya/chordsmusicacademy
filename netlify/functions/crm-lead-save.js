// Public endpoint — no admin token required
// Called from registration.html when a student submits the form
exports.handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Content-Type": "application/json",
  };

  if (event.httpMethod === "OPTIONS") return { statusCode: 200, headers, body: "" };
  if (event.httpMethod !== "POST") return { statusCode: 405, headers, body: JSON.stringify({ error: "Method not allowed" }) };

  try {
    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_KEY = process.env.SUPABASE_SECRET_KEY;

    const data = JSON.parse(event.body || "{}");
    if (!data.full_name) return { statusCode: 400, headers, body: JSON.stringify({ error: "name required" }) };

    const res = await fetch(`${SUPABASE_URL}/rest/v1/crm_leads`, {
      method: "POST",
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify({
        reg_id: data.reg_id || null,
        full_name: data.full_name,
        phone: data.phone || null,
        email: data.email || null,
        dob: data.dob || null,
        address: data.address || null,
        guardian: data.guardian || null,
        instrument: data.instrument || null,
        level: data.level || null,
        mode: data.mode || null,
        notes: data.notes || null,
        status: "new",
      }),
    });

    if (res.status >= 400) {
      const err = await res.text();
      return { statusCode: res.status, headers, body: JSON.stringify({ error: err }) };
    }

    return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };
  } catch (err) {
    console.error("crm-lead-save error:", err);
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};
