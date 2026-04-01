exports.handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Content-Type": "application/json",
  };

  if (event.httpMethod === "OPTIONS") return { statusCode: 200, headers, body: "" };
  if (event.httpMethod !== "POST") return { statusCode: 405, headers, body: JSON.stringify({ error: "Method not allowed" }) };

  try {
    const { code, full_name, dob, grade, instrument, video_link } = JSON.parse(event.body || "{}");

    if (!code || !full_name || !dob || !grade || !instrument || !video_link) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: "All fields are required" }) };
    }

    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_KEY = process.env.SUPABASE_SECRET_KEY;
    const cleanCode = code.toUpperCase().trim();

    // Verify code exists
    const checkRes = await fetch(
      `${SUPABASE_URL}/rest/v1/exam_submissions?access_code=eq.${encodeURIComponent(cleanCode)}&select=id`,
      {
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
        },
      }
    );
    const existing = await checkRes.json();
    if (!Array.isArray(existing) || existing.length === 0) {
      return { statusCode: 404, headers, body: JSON.stringify({ error: "Invalid access code" }) };
    }

    // Update the row
    const updateRes = await fetch(
      `${SUPABASE_URL}/rest/v1/exam_submissions?access_code=eq.${encodeURIComponent(cleanCode)}`,
      {
        method: "PATCH",
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
          "Content-Type": "application/json",
          Prefer: "return=representation",
        },
        body: JSON.stringify({
          full_name: full_name.trim(),
          dob: dob.trim(),
          grade,
          instrument,
          video_link: video_link.trim(),
          submitted_at: new Date().toISOString(),
        }),
      }
    );

    const updated = await updateRes.json();
    if (!Array.isArray(updated) || updated.length === 0) {
      return { statusCode: 500, headers, body: JSON.stringify({ error: "Failed to save submission" }) };
    }

    return { statusCode: 200, headers, body: JSON.stringify({ success: true, submission: updated[0] }) };
  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: "Server error. Please try again." }) };
  }
};
