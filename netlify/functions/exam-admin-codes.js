exports.handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Content-Type": "application/json",
  };

  if (event.httpMethod === "OPTIONS") return { statusCode: 200, headers, body: "" };
  if (event.httpMethod !== "POST") return { statusCode: 405, headers, body: JSON.stringify({ error: "Method not allowed" }) };

  // Verify admin password
  const adminToken = event.headers["x-admin-token"] || "";
  if (!adminToken || adminToken !== process.env.EXAM_ADMIN_PASSWORD) {
    return { statusCode: 401, headers, body: JSON.stringify({ error: "Unauthorized" }) };
  }

  try {
    const { count } = JSON.parse(event.body || "{}");
    const num = Math.min(Math.max(parseInt(count) || 10, 1), 100);

    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_KEY = process.env.SUPABASE_SECRET_KEY;

    // Generate unique codes in TRN-XXXXXX format
    const CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    const codes = [];
    for (let i = 0; i < num; i++) {
      let suffix = "";
      for (let j = 0; j < 6; j++) {
        suffix += CHARS[Math.floor(Math.random() * CHARS.length)];
      }
      codes.push({ access_code: "TRN-" + suffix });
    }

    const res = await fetch(`${SUPABASE_URL}/rest/v1/exam_submissions`, {
      method: "POST",
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify(codes),
    });

    const data = await res.json();
    if (!Array.isArray(data)) {
      return { statusCode: 500, headers, body: JSON.stringify({ error: data.message || "Failed to generate codes" }) };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true, codes: data.map((d) => d.access_code) }),
    };
  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: "Server error" }) };
  }
};
