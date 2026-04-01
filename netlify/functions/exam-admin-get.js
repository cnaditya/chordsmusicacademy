exports.handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Content-Type": "application/json",
  };

  if (event.httpMethod === "OPTIONS") return { statusCode: 200, headers, body: "" };

  // Verify admin password
  const adminToken = event.headers["x-admin-token"] || "";
  if (!adminToken || adminToken !== process.env.EXAM_ADMIN_PASSWORD) {
    return { statusCode: 401, headers, body: JSON.stringify({ error: "Unauthorized" }) };
  }

  try {
    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_KEY = process.env.SUPABASE_SECRET_KEY;

    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/exam_submissions?select=*&order=created_at.asc`,
      {
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
        },
      }
    );

    const data = await res.json();
    if (!Array.isArray(data)) {
      return { statusCode: 500, headers, body: JSON.stringify({ error: "Failed to fetch submissions" }) };
    }

    return { statusCode: 200, headers, body: JSON.stringify({ success: true, submissions: data }) };
  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: "Server error" }) };
  }
};
