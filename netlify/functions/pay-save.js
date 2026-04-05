exports.handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Content-Type": "application/json",
  };

  if (event.httpMethod === "OPTIONS") return { statusCode: 200, headers, body: "" };
  if (event.httpMethod !== "POST") return { statusCode: 405, headers, body: JSON.stringify({ error: "Method not allowed" }) };

  try {
    const { code, record_id, transaction_id, screenshot_url } = JSON.parse(event.body || "{}");
    if (!code || !record_id) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: "code and record_id are required" }) };
    }

    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_KEY = process.env.SUPABASE_SECRET_KEY;
    const cleanCode = code.toUpperCase().trim();

    // Verify student owns this record
    const stuRes = await fetch(
      `${SUPABASE_URL}/rest/v1/payment_students?access_code=eq.${encodeURIComponent(cleanCode)}&is_active=eq.true&select=id`,
      {
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
        },
      }
    );
    const students = await stuRes.json();
    if (!Array.isArray(students) || students.length === 0) {
      return { statusCode: 403, headers, body: JSON.stringify({ error: "Invalid access code" }) };
    }
    const studentId = students[0].id;

    // Verify the record belongs to this student
    const recCheckRes = await fetch(
      `${SUPABASE_URL}/rest/v1/payment_records?id=eq.${encodeURIComponent(record_id)}&student_id=eq.${studentId}&select=id,status`,
      {
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
        },
      }
    );
    const recCheck = await recCheckRes.json();
    if (!Array.isArray(recCheck) || recCheck.length === 0) {
      return { statusCode: 403, headers, body: JSON.stringify({ error: "Record not found or access denied" }) };
    }
    if (recCheck[0].status === "verified") {
      return { statusCode: 400, headers, body: JSON.stringify({ error: "This payment has already been verified" }) };
    }

    // Update the record to submitted
    const updateRes = await fetch(
      `${SUPABASE_URL}/rest/v1/payment_records?id=eq.${encodeURIComponent(record_id)}`,
      {
        method: "PATCH",
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
          "Content-Type": "application/json",
          Prefer: "return=representation",
        },
        body: JSON.stringify({
          status: "submitted",
          transaction_id: (transaction_id || "").trim() || null,
          screenshot_url: (screenshot_url || "").trim() || null,
          student_marked_at: new Date().toISOString(),
        }),
      }
    );

    const updated = await updateRes.json();
    if (!Array.isArray(updated) || updated.length === 0) {
      return { statusCode: 500, headers, body: JSON.stringify({ error: "Failed to save payment" }) };
    }

    return { statusCode: 200, headers, body: JSON.stringify({ success: true, record: updated[0] }) };
  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: "Server error. Please try again." }) };
  }
};
