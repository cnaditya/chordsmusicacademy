exports.handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Content-Type": "application/json",
  };

  if (event.httpMethod === "OPTIONS") return { statusCode: 200, headers, body: "" };
  if (event.httpMethod !== "POST") return { statusCode: 405, headers, body: JSON.stringify({ error: "Method not allowed" }) };

  const adminToken = event.headers["x-admin-token"] || "";
  if (!adminToken || adminToken !== process.env.EXAM_ADMIN_PASSWORD) {
    return { statusCode: 401, headers, body: JSON.stringify({ error: "Unauthorized" }) };
  }

  try {
    const { codes } = JSON.parse(event.body || "{}");
    if (!Array.isArray(codes) || codes.length === 0) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: "codes array required" }) };
    }

    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_KEY = process.env.SUPABASE_SECRET_KEY;

    // Delete rows where access_code is in the list and full_name is null (unsubmitted only)
    const inList = codes.map(c => '"' + c.toUpperCase().trim() + '"').join(',');
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/exam_submissions?access_code=in.(${inList})&full_name=is.null`,
      {
        method: "DELETE",
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
          Prefer: "return=minimal",
        },
      }
    );

    if (!res.ok) {
      const err = await res.text();
      return { statusCode: 500, headers, body: JSON.stringify({ error: "Delete failed: " + err }) };
    }

    return { statusCode: 200, headers, body: JSON.stringify({ success: true, deleted: codes.length }) };
  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: "Server error" }) };
  }
};
