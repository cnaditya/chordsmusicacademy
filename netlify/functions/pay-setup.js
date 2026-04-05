/*
 * One-time setup function — creates payment_students and payment_records tables
 * Called from admin page "Setup Database" button
 */
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

  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_KEY = process.env.SUPABASE_SECRET_KEY;

  // Use Supabase's rpc/sql endpoint to run raw SQL
  const sql = `
    CREATE TABLE IF NOT EXISTS payment_students (
      id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
      access_code text UNIQUE NOT NULL,
      name text NOT NULL,
      phone text,
      instrument text DEFAULT 'Piano',
      plan text NOT NULL,
      payment_type text DEFAULT 'monthly',
      amount_due integer NOT NULL,
      billing_day integer DEFAULT 1,
      classes_attended integer DEFAULT 0,
      total_classes_per_cycle integer DEFAULT 8,
      last_class_date date,
      class_days text,
      class_time text,
      teacher text DEFAULT 'Aditya',
      notes text,
      is_active boolean DEFAULT true,
      created_at timestamptz DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS payment_records (
      id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
      student_id uuid REFERENCES payment_students(id) ON DELETE CASCADE,
      billing_period text NOT NULL,
      amount_due integer NOT NULL,
      status text DEFAULT 'pending',
      transaction_id text,
      screenshot_url text,
      student_marked_at timestamptz,
      admin_verified_at timestamptz,
      admin_notes text,
      created_at timestamptz DEFAULT now()
    );
  `;

  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
      method: "POST",
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query: sql }),
    });

    // The rpc/exec_sql may not exist on all Supabase plans — try direct table check instead
    if (!res.ok) {
      // Fallback: just try to select from the table — if it works, tables exist
      const checkRes = await fetch(
        `${SUPABASE_URL}/rest/v1/payment_students?limit=1`,
        {
          headers: {
            apikey: SUPABASE_KEY,
            Authorization: `Bearer ${SUPABASE_KEY}`,
          },
        }
      );

      if (checkRes.ok) {
        return { statusCode: 200, headers, body: JSON.stringify({ success: true, message: "Tables already exist and are accessible." }) };
      } else {
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            success: false,
            needs_manual: true,
            message: "Tables need to be created manually. Please run the SQL below in your Supabase SQL editor.",
            sql: sql.trim()
          })
        };
      }
    }

    return { statusCode: 200, headers, body: JSON.stringify({ success: true, message: "Tables created successfully." }) };
  } catch (err) {
    // Tables likely don't exist — return the SQL for manual run
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: false,
        needs_manual: true,
        message: "Could not auto-create tables. Please run the SQL in Supabase SQL editor.",
        sql: sql.trim()
      })
    };
  }
};
