exports.handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Content-Type": "application/json",
  };

  if (event.httpMethod === "OPTIONS") return { statusCode: 200, headers, body: "" };
  if (event.httpMethod !== "POST") return { statusCode: 405, headers, body: JSON.stringify({ error: "Method not allowed" }) };

  try {
    const { code } = JSON.parse(event.body || "{}");
    if (!code) return { statusCode: 400, headers, body: JSON.stringify({ error: "Access code required" }) };

    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_KEY = process.env.SUPABASE_SECRET_KEY;

    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/exam_submissions?access_code=eq.${encodeURIComponent(code.toUpperCase().trim())}&select=*`,
      {
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
        },
      }
    );

    const data = await res.json();

    if (!Array.isArray(data) || data.length === 0) {
      return { statusCode: 404, headers, body: JSON.stringify({ error: "Invalid access code. Please check with your teacher." }) };
    }

    return { statusCode: 200, headers, body: JSON.stringify({ success: true, submission: data[0] }) };
  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: "Server error. Please try again." }) };
  }
};
