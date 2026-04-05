/*
 * SUPABASE SETUP — run this SQL in your Supabase SQL editor before using this portal.
 *
 * CREATE TABLE payment_students (
 *   id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
 *   access_code text UNIQUE NOT NULL,
 *   name text NOT NULL,
 *   phone text,
 *   instrument text DEFAULT 'Piano',
 *   plan text NOT NULL,
 *   payment_type text DEFAULT 'monthly',
 *   amount_due integer NOT NULL,
 *   billing_day integer DEFAULT 1,
 *   classes_attended integer DEFAULT 0,
 *   total_classes_per_cycle integer DEFAULT 8,
 *   last_class_date date,
 *   class_days text,
 *   class_time text,
 *   teacher text DEFAULT 'Aditya',
 *   notes text,
 *   is_active boolean DEFAULT true,
 *   created_at timestamptz DEFAULT now()
 * );
 *
 * CREATE TABLE payment_records (
 *   id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
 *   student_id uuid REFERENCES payment_students(id) ON DELETE CASCADE,
 *   billing_period text NOT NULL,
 *   amount_due integer NOT NULL,
 *   status text DEFAULT 'pending',
 *   transaction_id text,
 *   screenshot_url text,
 *   student_marked_at timestamptz,
 *   admin_verified_at timestamptz,
 *   admin_notes text,
 *   created_at timestamptz DEFAULT now()
 * );
 */

exports.handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Content-Type": "application/json",
  };

  if (event.httpMethod === "OPTIONS") return { statusCode: 200, headers, body: "" };
  if (event.httpMethod !== "GET") return { statusCode: 405, headers, body: JSON.stringify({ error: "Method not allowed" }) };

  const code = (event.queryStringParameters?.code || "").toUpperCase().trim();
  if (!code) return { statusCode: 400, headers, body: JSON.stringify({ error: "Access code required" }) };

  try {
    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_KEY = process.env.SUPABASE_SECRET_KEY;

    // Fetch student by access code
    const stuRes = await fetch(
      `${SUPABASE_URL}/rest/v1/payment_students?access_code=eq.${encodeURIComponent(code)}&is_active=eq.true&select=*`,
      {
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
        },
      }
    );
    const students = await stuRes.json();
    if (!Array.isArray(students) || students.length === 0) {
      return { statusCode: 404, headers, body: JSON.stringify({ error: "Invalid access code" }) };
    }
    const student = students[0];

    // Fetch last 3 payment records for this student
    const recRes = await fetch(
      `${SUPABASE_URL}/rest/v1/payment_records?student_id=eq.${student.id}&order=created_at.desc&limit=3&select=*`,
      {
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
        },
      }
    );
    const records = await recRes.json();

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true, student, records: Array.isArray(records) ? records : [] }),
    };
  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: "Server error" }) };
  }
};
