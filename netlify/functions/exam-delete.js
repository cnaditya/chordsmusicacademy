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
    const cleanCode = code.toUpperCase().trim();

    // Clear submission fields but keep the access code row intact
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/exam_submissions?access_code=eq.${encodeURIComponent(cleanCode)}`,
      {
        method: "PATCH",
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
          "Content-Type": "application/json",
          Prefer: "return=minimal",
        },
        body: JSON.stringify({
          full_name: null,
          dob: null,
          grade: null,
          instrument: null,
          video_link: null,
          submitted_at: null,
        }),
      }
    );

    if (!res.ok) {
      return { statusCode: 500, headers, body: JSON.stringify({ error: "Failed to delete submission" }) };
    }

    return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };
  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: "Server error. Please try again." }) };
  }
};
