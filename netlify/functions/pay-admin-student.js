// Handles: seed all students, add single student, update student
const STUDENTS = [
  { name:'Gayatri',    phone:'919178619761',  plan:'monthly_5000', payment_type:'monthly', amount:5000, billing_day:1,  class_days:'Mon, Thu', class_time:'6:30am',  teacher:'Aditya' },
  { name:'Pratham',    phone:'6422462803',    plan:'monthly_5000', payment_type:'monthly', amount:5000, billing_day:1,  class_days:'Mon',      class_time:'6:30am',  teacher:'Aditya' },
  { name:'Kanvas',     phone:'919848161839',  plan:'monthly_5000', payment_type:'monthly', amount:5000, billing_day:1,  class_days:'Mon, Thu', class_time:'7:10am',  teacher:'Aditya' },
  { name:'Adhyasri',   phone:'919948144200',  plan:'monthly_6000', payment_type:'monthly', amount:6000, billing_day:1,  class_days:'Mon',      class_time:'6:00am',  teacher:'Aditya' },
  { name:'Harshith',   phone:'13172204227',   plan:'monthly_4500', payment_type:'monthly', amount:4500, billing_day:1,  class_days:'Wed',      class_time:'5:50am',  teacher:'Aditya' },
  { name:'Siri',       phone:'14694716690',   plan:'monthly_5000', payment_type:'monthly', amount:5000, billing_day:1,  class_days:'Wed, Fri', class_time:'7:10am',  teacher:'Aditya' },
  { name:'Nainika',    phone:'19257918375',   plan:'monthly_6000', payment_type:'monthly', amount:6000, billing_day:1,  class_days:'Mon, Thu', class_time:'9:40am',  teacher:'Aditya' },
  { name:'Pavan',      phone:'971557246627',  plan:'monthly_4500', payment_type:'monthly', amount:4500, billing_day:1,  class_days:'Sat',      class_time:'5:50am',  teacher:'Aditya' },
  { name:'Pranathi',   phone:'17329257487',   plan:'monthly_6000', payment_type:'monthly', amount:6000, billing_day:1,  class_days:'Mon, Thu', class_time:'9:10am',  teacher:'Aditya' },
  { name:'Parinita',   phone:'919739054346',  plan:'monthly_6000', payment_type:'monthly', amount:6000, billing_day:1,  class_days:'Mon, Thu', class_time:'7:50am',  teacher:'Aditya' },
  { name:'Ujjwal',     phone:'919848822650',  plan:'monthly_6000', payment_type:'monthly', amount:6000, billing_day:1,  class_days:'Mon, Thu', class_time:'8:30am',  teacher:'Aditya' },
  { name:'Cherika',    phone:'919030941993',  plan:'monthly_6000', payment_type:'monthly', amount:6000, billing_day:1,  class_days:'Wed, Fri', class_time:'8:30am',  teacher:'Aditya' },
  { name:'Revanth',    phone:'919618971986',  plan:'monthly_6000', payment_type:'monthly', amount:6000, billing_day:1,  class_days:'Mon, Thu', class_time:'7:40am',  teacher:'Aditya' },
  { name:'Kanisha',    phone:'919618971986',  plan:'monthly_6000', payment_type:'monthly', amount:6000, billing_day:15, class_days:'Sun',      class_time:'7:40pm',  teacher:'Aditya', notes:'Billing on 15th of every month' },
  { name:'Sriram',     phone:'919000000001',  plan:'monthly_5000', payment_type:'monthly', amount:5000, billing_day:1,  class_days:'Mon',      class_time:'5:50am',  teacher:'Aditya' },
  { name:'Sanvi',      phone:'919000000002',  plan:'monthly_5000', payment_type:'monthly', amount:5000, billing_day:1,  class_days:'Fri',      class_time:'5:50am',  teacher:'Aditya' },
  { name:'Ryan',       phone:'919000000003',  plan:'monthly_5000', payment_type:'monthly', amount:5000, billing_day:1,  class_days:'Wed, Sat', class_time:'8:30am',  teacher:'Aditya' },
  { name:'Nainika',    phone:'919000000004',  plan:'monthly_6000', payment_type:'monthly', amount:6000, billing_day:1,  class_days:'Wed, Thu', class_time:'9:10am',  teacher:'Aditya' },
  { name:'Devisri',    phone:'917986755373',  plan:'monthly_6000', payment_type:'monthly', amount:6000, billing_day:1,  class_days:'Tue',      class_time:'4pm',     teacher:'Brahmani' },
  { name:'Meghana',    phone:'919490461651',  plan:'monthly_6000', payment_type:'monthly', amount:6000, billing_day:1,  class_days:'Tue',      class_time:'4pm',     teacher:'Brahmani' },
  { name:'Karthikeya', phone:'14699967116',   plan:'monthly_5000', payment_type:'monthly', amount:5000, billing_day:1,  class_days:'Tue',      class_time:'7:10am',  teacher:'Brahmani' },
  { name:'Vedanth',    phone:'919618971986',  plan:'monthly_5000', payment_type:'monthly', amount:5000, billing_day:1,  class_days:'Tue',      class_time:'7:10am',  teacher:'Brahmani' },
  { name:'Kavin',      phone:'919348883284',  plan:'monthly_6000', payment_type:'monthly', amount:6000, billing_day:1,  class_days:'Tue',      class_time:'7:10am',  teacher:'Brahmani' },
  { name:'Aanya',      phone:'17029576123',   plan:'monthly_6000', payment_type:'monthly', amount:6000, billing_day:1,  class_days:'Tue',      class_time:'6:20pm',  teacher:'Brahmani' },
  { name:'Surya',      phone:'18162868085',   plan:'monthly_6000', payment_type:'monthly', amount:6000, billing_day:1,  class_days:'Tue',      class_time:'5:40pm',  teacher:'Brahmani' },
  { name:'Eeshwar',    phone:'15107096563',   plan:'monthly_6000', payment_type:'monthly', amount:6000, billing_day:1,  class_days:'Tue',      class_time:'5:40pm',  teacher:'Brahmani' },
  { name:'Hanish',     phone:'919000000005',  plan:'monthly_5000', payment_type:'monthly', amount:5000, billing_day:1,  class_days:'Tue, Thu', class_time:'5:40pm',  teacher:'Brahmani' },
  { name:'Siyant',     phone:'919000000006',  plan:'monthly_5000', payment_type:'monthly', amount:5000, billing_day:1,  class_days:'Tue, Thu', class_time:'6:20pm',  teacher:'Brahmani' },
  { name:'Padmavati',  phone:'919000000007',  plan:'monthly_5000', payment_type:'monthly', amount:5000, billing_day:1,  class_days:'Tue, Thu', class_time:'7pm',     teacher:'Brahmani' },
  { name:'Amukta',     phone:'919000000008',  plan:'monthly_5000', payment_type:'monthly', amount:5000, billing_day:1,  class_days:'Tue',      class_time:'7:40pm',  teacher:'Brahmani' },
  { name:'Ishita',     phone:'919000000009',  plan:'monthly_5000', payment_type:'monthly', amount:5000, billing_day:1,  class_days:'Sat, Sun', class_time:'5:40pm',  teacher:'Brahmani' },
  { name:'Krishika',   phone:'919000000010',  plan:'monthly_5000', payment_type:'monthly', amount:5000, billing_day:1,  class_days:'Wed, Sun', class_time:'7:40pm',  teacher:'Brahmani' },
  { name:'Adhya Sri',  phone:'919000000011',  plan:'monthly_5000', payment_type:'monthly', amount:5000, billing_day:1,  class_days:'Sun',      class_time:'8:20pm',  teacher:'Brahmani' },
  { name:'Hanvitha',   phone:'919000000012',  plan:'monthly_5000', payment_type:'monthly', amount:5000, billing_day:1,  class_days:'Thu',      class_time:'3pm',     teacher:'Brahmani' },
  { name:'Mihira',     phone:'919000000013',  plan:'monthly_5000', payment_type:'monthly', amount:5000, billing_day:1,  class_days:'Mon, Thu', class_time:'3pm',     teacher:'Brahmani' },
  { name:'Chaitanya',  phone:'919000000014',  plan:'monthly_5000', payment_type:'monthly', amount:5000, billing_day:1,  class_days:'Sun',      class_time:'8:20pm',  teacher:'Brahmani' },
];

function generateCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "PAY-";
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

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
    const { action, student } = JSON.parse(event.body || "{}");
    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_KEY = process.env.SUPABASE_SECRET_KEY;

    // --- Seed all pre-loaded students ---
    if (action === "seed") {
      // Fetch existing codes to avoid duplicates
      const existRes = await fetch(
        `${SUPABASE_URL}/rest/v1/payment_students?select=access_code`,
        {
          headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
        }
      );
      const existingRaw = await existRes.json();
      const existingCodes = new Set((Array.isArray(existingRaw) ? existingRaw : []).map((r) => r.access_code));

      // Fetch existing names to avoid duplicates
      const existNamesRes = await fetch(
        `${SUPABASE_URL}/rest/v1/payment_students?select=name`,
        {
          headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
        }
      );
      const existNamesRaw = await existNamesRes.json();
      const existingNames = new Set((Array.isArray(existNamesRaw) ? existNamesRaw : []).map((r) => r.name.toLowerCase()));

      const toInsert = STUDENTS.filter((s) => !existingNames.has(s.name.toLowerCase())).map((s) => {
        let code;
        do { code = generateCode(); } while (existingCodes.has(code));
        existingCodes.add(code);
        return {
          access_code: code,
          name: s.name,
          phone: s.phone,
          instrument: "Piano",
          plan: s.plan,
          payment_type: s.payment_type,
          amount_due: s.amount,
          billing_day: s.billing_day || 1,
          classes_attended: 0,
          total_classes_per_cycle: s.payment_type === "quarterly" ? 24 : 8,
          class_days: s.class_days || "",
          class_time: s.class_time || "",
          teacher: s.teacher || "Aditya",
          notes: s.notes || null,
          is_active: true,
        };
      });

      if (toInsert.length === 0) {
        return { statusCode: 200, headers, body: JSON.stringify({ success: true, inserted: 0, message: "All students already seeded" }) };
      }

      const insRes = await fetch(
        `${SUPABASE_URL}/rest/v1/payment_students`,
        {
          method: "POST",
          headers: {
            apikey: SUPABASE_KEY,
            Authorization: `Bearer ${SUPABASE_KEY}`,
            "Content-Type": "application/json",
            Prefer: "return=representation",
          },
          body: JSON.stringify(toInsert),
        }
      );
      const inserted = await insRes.json();
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, inserted: Array.isArray(inserted) ? inserted.length : 0, students: inserted }),
      };
    }

    // --- Add a single new student ---
    if (action === "add") {
      if (!student || !student.name || !student.plan || !student.amount_due) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: "name, plan, and amount_due are required" }) };
      }

      // Generate unique code
      const existRes = await fetch(
        `${SUPABASE_URL}/rest/v1/payment_students?select=access_code`,
        {
          headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
        }
      );
      const existingRaw = await existRes.json();
      const existingCodes = new Set((Array.isArray(existingRaw) ? existingRaw : []).map((r) => r.access_code));
      let code;
      do { code = generateCode(); } while (existingCodes.has(code));

      const payload = {
        access_code: code,
        name: student.name.trim(),
        phone: student.phone || null,
        instrument: student.instrument || "Piano",
        plan: student.plan,
        payment_type: student.payment_type || "monthly",
        amount_due: parseInt(student.amount_due),
        billing_day: parseInt(student.billing_day) || 1,
        classes_attended: 0,
        total_classes_per_cycle: student.payment_type === "quarterly" ? 24 : 8,
        class_days: student.class_days || "",
        class_time: student.class_time || "",
        teacher: student.teacher || "Aditya",
        notes: student.notes || null,
        is_active: true,
      };

      const insRes = await fetch(
        `${SUPABASE_URL}/rest/v1/payment_students`,
        {
          method: "POST",
          headers: {
            apikey: SUPABASE_KEY,
            Authorization: `Bearer ${SUPABASE_KEY}`,
            "Content-Type": "application/json",
            Prefer: "return=representation",
          },
          body: JSON.stringify(payload),
        }
      );
      const inserted = await insRes.json();
      if (!Array.isArray(inserted) || inserted.length === 0) {
        return { statusCode: 500, headers, body: JSON.stringify({ error: "Failed to add student" }) };
      }
      return { statusCode: 200, headers, body: JSON.stringify({ success: true, student: inserted[0] }) };
    }

    // --- Update existing student ---
    if (action === "update") {
      const { id, student } = JSON.parse(event.body || "{}"); // re-parse to get id field
      if (!id || !student) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: "id and student required" }) };
      }
      const planAmounts = { monthly_4500:4500, monthly_5000:5000, monthly_6000:6000, quarterly_15000:15000 };
      const payload = {};
      if (student.name) payload.name = student.name.trim();
      if (student.phone !== undefined) payload.phone = student.phone || null;
      if (student.teacher) payload.teacher = student.teacher;
      if (student.plan) { payload.plan = student.plan; payload.amount_due = planAmounts[student.plan] || student.amount_due; }
      if (student.billing_day) payload.billing_day = parseInt(student.billing_day);
      if (student.class_days !== undefined) payload.class_days = student.class_days;
      if (student.class_time !== undefined) payload.class_time = student.class_time;
      if (student.instrument) payload.instrument = student.instrument;
      if (student.notes !== undefined) payload.notes = student.notes || null;

      const updRes = await fetch(
        `${SUPABASE_URL}/rest/v1/payment_students?id=eq.${encodeURIComponent(id)}`,
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
      if (!updRes.ok) {
        const err = await updRes.text();
        return { statusCode: 500, headers, body: JSON.stringify({ error: "Update failed: " + err }) };
      }
      const updated = await updRes.json();
      return { statusCode: 200, headers, body: JSON.stringify({ success: true, student: Array.isArray(updated) ? updated[0] : updated }) };
    }

    return { statusCode: 400, headers, body: JSON.stringify({ error: "Invalid action" }) };
  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: "Server error" }) };
  }
};
