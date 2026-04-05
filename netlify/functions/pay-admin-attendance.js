// Increment or reset classes_attended for quarterly students
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
    const { student_id, action } = JSON.parse(event.body || "{}");
    if (!student_id || !action) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: "student_id and action are required" }) };
    }
    if (!["increment", "reset"].includes(action)) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: "action must be 'increment' or 'reset'" }) };
    }

    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_KEY = process.env.SUPABASE_SECRET_KEY;

    // Fetch current student data
    const stuRes = await fetch(
      `${SUPABASE_URL}/rest/v1/payment_students?id=eq.${encodeURIComponent(student_id)}&select=id,classes_attended,total_classes_per_cycle,payment_type`,
      {
        headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
      }
    );
    const students = await stuRes.json();
    if (!Array.isArray(students) || students.length === 0) {
      return { statusCode: 404, headers, body: JSON.stringify({ error: "Student not found" }) };
    }
    const stu = students[0];

    let payload = {};
    if (action === "increment") {
      payload.classes_attended = (stu.classes_attended || 0) + 1;
      payload.last_class_date = new Date().toISOString().split("T")[0];
    } else if (action === "reset") {
      payload.classes_attended = 0;
      payload.last_class_date = null;
    }

    const updateRes = await fetch(
      `${SUPABASE_URL}/rest/v1/payment_students?id=eq.${encodeURIComponent(student_id)}`,
      {
        method: "PATCH",
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
          "Content-Type": "application/json",
          Prefer: "return=representation",
        },
        body: JSON.stringify(payload),
      }
    );
    const updated = await updateRes.json();
    if (!Array.isArray(updated) || updated.length === 0) {
      return { statusCode: 500, headers, body: JSON.stringify({ error: "Failed to update attendance" }) };
    }

    return { statusCode: 200, headers, body: JSON.stringify({ success: true, student: updated[0] }) };
  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: "Server error" }) };
  }
};
