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

  // ── Pre-auth public actions (no token needed) ─────────────────────────────
  try {
    const preBody = JSON.parse(event.body || "{}");
    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_KEY = process.env.SUPABASE_SECRET_KEY;
    const SB_H_PRE = { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` };

    // Return teacher roles from TEACHER_PASSWORDS env var keys (what shows on login screen)
    if (preBody.action === "crm_teachers_list") {
      let teacherPasswords = {};
      try { teacherPasswords = JSON.parse(process.env.TEACHER_PASSWORDS || "{}"); } catch(e) {}
      const teachers = Object.keys(teacherPasswords);
      const adminPhone = process.env.ADMIN_PHONE || '';
      return { statusCode: 200, headers, body: JSON.stringify({ success: true, teachers, adminPhone }) };
    }

    // Validate admin or teacher login — returns token + role + name
    if (preBody.action === "crm_validate_role") {
      const { name, password } = preBody;
      if (!password) return { statusCode: 401, headers, body: JSON.stringify({ error: "Password required" }) };
      // Admin check
      if (password === process.env.PAYMENT_ADMIN_PASSWORD) {
        return { statusCode: 200, headers, body: JSON.stringify({ success: true, role: "admin", name: "Admin", token: process.env.PAYMENT_ADMIN_PASSWORD }) };
      }
      // Teacher check — TEACHER_PASSWORDS env var: {"Brahmani":"1111","OtherTeacher":"2222"}
      let teacherPasswords = {};
      try { teacherPasswords = JSON.parse(process.env.TEACHER_PASSWORDS || "{}"); } catch(e) {}
      if (name && teacherPasswords[name] && teacherPasswords[name] === password) {
        return { statusCode: 200, headers, body: JSON.stringify({ success: true, role: "teacher", name, token: process.env.PAYMENT_ADMIN_PASSWORD }) };
      }
      return { statusCode: 401, headers, body: JSON.stringify({ error: "Wrong password" }) };
    }
  } catch(e) { /* fall through to normal auth */ }

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
    // --- Delete a student ---
    if (action === "delete") {
      const { id } = JSON.parse(event.body || "{}");
      if (!id) return { statusCode: 400, headers, body: JSON.stringify({ error: "id required" }) };
      const delRes = await fetch(
        `${SUPABASE_URL}/rest/v1/payment_students?id=eq.${encodeURIComponent(id)}`,
        {
          method: "DELETE",
          headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`, Prefer: "return=minimal" },
        }
      );
      if (!delRes.ok) {
        const err = await delRes.text();
        return { statusCode: 500, headers, body: JSON.stringify({ error: "Delete failed: " + err }) };
      }
      return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };
    }

    if (action === "update") {
      const { id, student } = JSON.parse(event.body || "{}"); // re-parse to get id field
      if (!id || !student) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: "id and student required" }) };
      }
      const payload = {};
      if (student.name) payload.name = student.name.trim();
      if (student.phone !== undefined) payload.phone = student.phone || null;
      if (student.teacher) payload.teacher = student.teacher;
      if (student.payment_type) payload.payment_type = student.payment_type;
      if (student.amount_due) payload.amount_due = parseInt(student.amount_due);
      if (student.due_date !== undefined) payload.due_date = student.due_date || null;
      if (student.total_classes_per_cycle) payload.total_classes_per_cycle = parseInt(student.total_classes_per_cycle);
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

      // If amount changed, update pending payment records too
      if (payload.amount_due) {
        await fetch(
          `${SUPABASE_URL}/rest/v1/payment_records?student_id=eq.${encodeURIComponent(id)}&status=eq.pending`,
          {
            method: "PATCH",
            headers: {
              apikey: SUPABASE_KEY,
              Authorization: `Bearer ${SUPABASE_KEY}`,
              "Content-Type": "application/json",
              Prefer: "return=minimal",
            },
            body: JSON.stringify({ amount_due: payload.amount_due }),
          }
        );
      }

      return { statusCode: 200, headers, body: JSON.stringify({ success: true, student: Array.isArray(updated) ? updated[0] : updated }) };
    }

    // ═══════════════════════════════════════════════════════════════════════
    // CRM ACTIONS
    // ═══════════════════════════════════════════════════════════════════════
    const SB_H = { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` };
    const SB_M = { ...SB_H, "Content-Type": "application/json", Prefer: "return=representation" };

    if (action === "crm_dashboard") {
      const r = await fetch(`${SUPABASE_URL}/rest/v1/crm_students?is_active=eq.true&select=id,status,mode,instrument,amount_due,due_date,enrollment_date,name,student_id,teacher,class_days,class_time,level,phone`, { headers: SB_H });
      const all = await r.json();
      if (!Array.isArray(all)) {
        if (r.status === 404 || (all && all.code === "42P01")) return { statusCode: 404, headers, body: JSON.stringify({ error: "table_not_found" }) };
        return { statusCode: 500, headers, body: JSON.stringify({ error: "Unexpected response", raw: JSON.stringify(all) }) };
      }
      const recent = [...all].sort((a, b) => new Date(b.enrollment_date || 0) - new Date(a.enrollment_date || 0)).slice(0, 5);
      const stats = { total: all.length, active: all.filter(s=>s.status==="active").length, trial: all.filter(s=>s.status==="trial").length, paused: all.filter(s=>s.status==="paused").length, dropped: all.filter(s=>s.status==="dropped").length, online: all.filter(s=>s.mode==="online").length, offline: all.filter(s=>s.mode==="offline").length, revenue_this_month: all.filter(s=>s.status==="active").reduce((sum,s)=>sum+(s.amount_due||0),0) };
      const instruments = {};
      all.forEach(s => { if (s.instrument) instruments[s.instrument] = (instruments[s.instrument]||0)+1; });
      const days = ["sun","mon","tue","wed","thu","fri","sat"];
      const todayStudents = all.filter(s => s.class_days && s.class_days.toLowerCase().includes(days[new Date().getDay()]));
      // Dues: overdue or due within 7 days, with a due_date and amount_due set
      const today = new Date(); today.setHours(0,0,0,0);
      const dueStudents = all.filter(s => s.due_date && s.amount_due > 0 && (s.status === 'active' || s.status === 'trial')).map(s => {
        const d = new Date(s.due_date); d.setHours(0,0,0,0);
        return { ...s, days_diff: Math.round((d - today) / 86400000) };
      }).filter(s => s.days_diff <= 7).sort((a,b) => a.days_diff - b.days_diff);
      return { statusCode: 200, headers, body: JSON.stringify({ success: true, stats, instruments, recent, todayStudents, dueStudents }) };
    }

    if (action === "crm_list") {
      const { status: st, instrument, teacher, mode, search, is_active } = JSON.parse(event.body);
      let f = [is_active !== undefined ? `is_active=eq.${is_active}` : "is_active=eq.true"];
      if (st && st !== "all") f.push(`status=eq.${st}`);
      if (instrument && instrument !== "all") f.push(`instrument=eq.${encodeURIComponent(instrument)}`);
      if (teacher && teacher !== "all") f.push(`teacher=eq.${encodeURIComponent(teacher)}`);
      if (mode && mode !== "all") f.push(`mode=eq.${mode}`);
      if (search) { const s = encodeURIComponent(search); f.push(`or=(name.ilike.*${s}*,phone.ilike.*${s}*,email.ilike.*${s}*,student_id.ilike.*${s}*)`); }
      const r = await fetch(`${SUPABASE_URL}/rest/v1/crm_students?${f.join("&")}&order=created_at.desc`, { headers: SB_H });
      const data = await r.json();
      if (r.status === 404 || (data && data.code === "42P01")) return { statusCode: 404, headers, body: JSON.stringify({ error: "table_not_found" }) };
      return { statusCode: 200, headers, body: JSON.stringify({ success: true, students: Array.isArray(data) ? data : [] }) };
    }

    if (action === "crm_get") {
      const { id } = JSON.parse(event.body);
      if (!id) return { statusCode: 400, headers, body: JSON.stringify({ error: "id required" }) };
      const [sr, ar, nr] = await Promise.all([
        fetch(`${SUPABASE_URL}/rest/v1/crm_students?id=eq.${id}`, { headers: SB_H }),
        fetch(`${SUPABASE_URL}/rest/v1/crm_attendance?student_id=eq.${id}&order=date.desc&limit=60`, { headers: SB_H }),
        fetch(`${SUPABASE_URL}/rest/v1/crm_notes?student_id=eq.${id}&order=created_at.desc`, { headers: SB_H }),
      ]);
      const students = await sr.json();
      const attendance = await ar.json();
      const notes = await nr.json();
      const stu = Array.isArray(students) ? students[0] : null;
      if (!stu) return { statusCode: 404, headers, body: JSON.stringify({ error: "Not found" }) };
      return { statusCode: 200, headers, body: JSON.stringify({ success: true, student: stu, attendance: Array.isArray(attendance)?attendance:[], notes: Array.isArray(notes)?notes:[] }) };
    }

    if (action === "crm_add") {
      const { student: s } = JSON.parse(event.body);
      if (!s || !s.name) return { statusCode: 400, headers, body: JSON.stringify({ error: "name required" }) };
      const year = new Date().getFullYear();
      const cr = await fetch(`${SUPABASE_URL}/rest/v1/crm_students?student_id=like.CMA-${year}-*&select=student_id`, { headers: SB_H });
      const existing = await cr.json();
      s.student_id = `CMA-${year}-${String((Array.isArray(existing)?existing.length:0)+1).padStart(3,"0")}`;
      if (!s.enrollment_date) s.enrollment_date = new Date().toISOString().split("T")[0];
      const r = await fetch(`${SUPABASE_URL}/rest/v1/crm_students`, { method:"POST", headers:SB_M, body:JSON.stringify(s) });
      const data = await r.json();
      if (r.status >= 400) return { statusCode: r.status, headers, body: JSON.stringify({ error: (data&&data.message)||"Insert failed" }) };
      return { statusCode: 200, headers, body: JSON.stringify({ success: true, student: Array.isArray(data)?data[0]:data }) };
    }

    if (action === "crm_update") {
      const { id, student: s } = JSON.parse(event.body);
      if (!id || !s) return { statusCode: 400, headers, body: JSON.stringify({ error: "id and student required" }) };
      delete s.id; delete s.student_id; delete s.created_at;
      const r = await fetch(`${SUPABASE_URL}/rest/v1/crm_students?id=eq.${id}`, { method:"PATCH", headers:SB_M, body:JSON.stringify(s) });
      const data = await r.json();
      if (r.status >= 400) return { statusCode: r.status, headers, body: JSON.stringify({ error: (data&&data.message)||"Update failed" }) };
      return { statusCode: 200, headers, body: JSON.stringify({ success: true, student: Array.isArray(data)?data[0]:data }) };
    }

    if (action === "crm_upload_photo") {
      const { student_id, file_base64 } = JSON.parse(event.body);
      if (!student_id || !file_base64) return { statusCode: 400, headers, body: JSON.stringify({ error: "student_id and file_base64 required" }) };
      const buffer = Buffer.from(file_base64, 'base64');
      const path = `${student_id}.jpg`;
      const r = await fetch(`${SUPABASE_URL}/storage/v1/object/student-photos/${path}`, {
        method: 'PUT',
        headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`, 'Content-Type': 'image/jpeg', 'x-upsert': 'true' },
        body: buffer,
      });
      if (r.status >= 400) {
        const err = await r.json().catch(() => ({}));
        return { statusCode: r.status, headers, body: JSON.stringify({ error: err.message || 'Photo upload failed' }) };
      }
      const photo_url = `${SUPABASE_URL}/storage/v1/object/public/student-photos/${path}?t=${Date.now()}`;
      return { statusCode: 200, headers, body: JSON.stringify({ success: true, photo_url }) };
    }

    if (action === "crm_delete") {
      const { id } = JSON.parse(event.body);
      if (!id) return { statusCode: 400, headers, body: JSON.stringify({ error: "id required" }) };
      const r = await fetch(`${SUPABASE_URL}/rest/v1/crm_students?id=eq.${id}`, { method:"PATCH", headers:SB_M, body:JSON.stringify({ is_active: false }) });
      if (r.status >= 400) return { statusCode: r.status, headers, body: JSON.stringify({ error: "Delete failed" }) };
      return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };
    }

    if (action === "crm_attendance_today") {
      const { date } = JSON.parse(event.body);
      const d = date || new Date().toISOString().slice(0,10);
      const [studR, attR, cntR] = await Promise.all([
        fetch(`${SUPABASE_URL}/rest/v1/crm_students?is_active=eq.true&order=name.asc`, { headers: SB_H }),
        fetch(`${SUPABASE_URL}/rest/v1/crm_attendance?date=eq.${d}`, { headers: SB_H }),
        fetch(`${SUPABASE_URL}/rest/v1/crm_attendance?status=eq.present&select=student_id`, { headers: SB_H }),
      ]);
      const students = await studR.json();
      const attendance = await attR.json();
      const allPresent = await cntR.json();
      // Build present_counts: { student_id: count }
      const present_counts = {};
      (Array.isArray(allPresent) ? allPresent : []).forEach(r => {
        present_counts[r.student_id] = (present_counts[r.student_id] || 0) + 1;
      });
      return { statusCode: 200, headers, body: JSON.stringify({
        success: true,
        students: Array.isArray(students) ? students : [],
        attendance: Array.isArray(attendance) ? attendance : [],
        present_counts,
        date: d
      })};
    }

    if (action === "crm_mark_attendance") {
      const { student_id, date, status: attStatus, note, marked_time } = JSON.parse(event.body || "{}");
      if (!student_id || !date) return { statusCode: 400, headers, body: JSON.stringify({ error: "student_id and date required" }) };
      await fetch(`${SUPABASE_URL}/rest/v1/crm_attendance?student_id=eq.${student_id}&date=eq.${date}`, { method:"DELETE", headers:SB_H });
      const r = await fetch(`${SUPABASE_URL}/rest/v1/crm_attendance`, { method:"POST", headers:SB_M, body:JSON.stringify({ student_id, date, status: attStatus||"present", note: note||null, marked_time: marked_time||null }) });
      if (r.status >= 400) {
        const errBody = await r.json().catch(()=>({}));
        return { statusCode: r.status, headers, body: JSON.stringify({ error: errBody.message || errBody.error || "Attendance insert failed" }) };
      }

      // Return class progress stats for immediate display
      const [cntR, stuR] = await Promise.all([
        fetch(`${SUPABASE_URL}/rest/v1/crm_attendance?student_id=eq.${student_id}&status=eq.present`, {
          headers: { ...SB_H, "Prefer": "count=exact", "Range": "0-0" }
        }),
        fetch(`${SUPABASE_URL}/rest/v1/crm_students?id=eq.${student_id}&select=name,phone,parent_name,parent_phone,total_classes_per_cycle,classes_offset`, { headers: SB_H })
      ]);
      const cRange = cntR.headers.get("content-range") || "";
      const rawCount = parseInt(cRange.split("/")[1] || "0") || 0;
      const stuArr = await stuR.json();
      const stu = Array.isArray(stuArr) ? stuArr[0] : {};
      const total = stu.total_classes_per_cycle || 0;
      const presentCount = rawCount + (stu.classes_offset || 0); // include pre-tracking classes
      return { statusCode: 200, headers, body: JSON.stringify({
        success: true,
        present_count: presentCount,
        total_classes: total || null,
        remaining: total ? Math.max(0, total - presentCount) : null,
        student: stu
      })};
    }

    if (action === "crm_get_next_receipt_no") {
      const r = await fetch(`${SUPABASE_URL}/rest/v1/crm_notes?content=like.Receipt%20%23*&select=content&order=created_at.desc&limit=100`, { headers: SB_H });
      const notes = await r.json();
      let maxNo = 1000;
      if (Array.isArray(notes)) {
        notes.forEach(n => {
          const m = (n.content || '').match(/Receipt #(\d+)/);
          if (m) { const no = parseInt(m[1]); if (no > maxNo) maxNo = no; }
        });
      }
      return { statusCode: 200, headers, body: JSON.stringify({ success: true, next: maxNo + 1 }) };
    }

    if (action === "crm_renewal_due") {
      // Students whose present count >= total_classes_per_cycle
      const [studR, attR] = await Promise.all([
        fetch(`${SUPABASE_URL}/rest/v1/crm_students?is_active=eq.true&select=id,name,phone,parent_name,parent_phone,total_classes_per_cycle,teacher,instrument`, { headers: SB_H }),
        fetch(`${SUPABASE_URL}/rest/v1/crm_attendance?status=eq.present&select=student_id`, { headers: SB_H })
      ]);
      const students = await studR.json();
      const attendance = await attR.json();
      if (!Array.isArray(students)) return { statusCode: 200, headers, body: JSON.stringify({ success: true, due: [] }) };
      const counts = {};
      (Array.isArray(attendance) ? attendance : []).forEach(a => { counts[a.student_id] = (counts[a.student_id]||0) + 1; });
      const due = students.filter(s => s.total_classes_per_cycle > 0 && ((counts[s.id]||0) + (s.classes_offset||0)) >= s.total_classes_per_cycle)
        .map(s => ({ ...s, present_count: (counts[s.id]||0) + (s.classes_offset||0) }));
      return { statusCode: 200, headers, body: JSON.stringify({ success: true, due }) };
    }

    if (action === "crm_clear_attendance") {
      const { student_id, date } = JSON.parse(event.body || "{}");
      if (!student_id || !date) return { statusCode: 400, headers, body: JSON.stringify({ error: "student_id and date required" }) };
      await fetch(`${SUPABASE_URL}/rest/v1/crm_attendance?student_id=eq.${student_id}&date=eq.${date}`, { method: "DELETE", headers: SB_H });
      return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };
    }

    if (action === "crm_add_note") {
      const { student_id, content } = JSON.parse(event.body);
      if (!student_id || !content) return { statusCode: 400, headers, body: JSON.stringify({ error: "student_id and content required" }) };
      const r = await fetch(`${SUPABASE_URL}/rest/v1/crm_notes`, { method:"POST", headers:SB_M, body:JSON.stringify({ student_id, content }) });
      const data = await r.json();
      if (r.status >= 400) return { statusCode: r.status, headers, body: JSON.stringify({ error: (data&&data.message)||"Note failed" }) };
      return { statusCode: 200, headers, body: JSON.stringify({ success: true, note: Array.isArray(data)?data[0]:data }) };
    }

    // ── LEADS ─────────────────────────────────────────────────────────────────
    if (action === "crm_leads_list") {
      const r = await fetch(`${SUPABASE_URL}/rest/v1/crm_leads?order=created_at.desc`, { headers: SB_H });
      const data = await r.json();
      if (r.status === 404 || (data && data.code === "42P01")) return { statusCode: 404, headers, body: JSON.stringify({ error: "table_not_found" }) };
      return { statusCode: 200, headers, body: JSON.stringify({ success: true, leads: Array.isArray(data) ? data : [] }) };
    }

    if (action === "crm_lead_bulk_add") {
      const { leads: bulkLeads, mode: bulkMode } = JSON.parse(event.body);
      if (!Array.isArray(bulkLeads) || !bulkLeads.length) return { statusCode: 400, headers, body: JSON.stringify({ error: "leads array required" }) };

      // Fetch existing phones to skip duplicates
      const exRes = await fetch(`${SUPABASE_URL}/rest/v1/crm_leads?select=phone`, { headers: SB_H });
      const exData = await exRes.json();
      const existingPhones = new Set((Array.isArray(exData) ? exData : []).map(r => (r.phone || '').replace(/\D/g, '')));

      const toInsert = [];
      const skipped = [];
      for (const l of bulkLeads) {
        const digits = (l.phone || '').replace(/\D/g, '');
        if (!digits || existingPhones.has(digits)) { skipped.push(l.phone); continue; }
        existingPhones.add(digits);
        toInsert.push({
          full_name: l.full_name || digits,
          phone:     digits.length === 10 ? '91' + digits : digits,
          mode:      bulkMode || l.mode || 'studio',
          notes:     l.notes || null,
          status:    'new',
        });
      }

      if (!toInsert.length) return { statusCode: 200, headers, body: JSON.stringify({ success: true, added: 0, skipped: skipped.length }) };

      const r = await fetch(`${SUPABASE_URL}/rest/v1/crm_leads`, {
        method: "POST",
        headers: { ...SB_M, Prefer: "return=minimal" },
        body: JSON.stringify(toInsert),
      });
      if (r.status >= 400) {
        const err = await r.text();
        return { statusCode: r.status, headers, body: JSON.stringify({ error: err }) };
      }
      return { statusCode: 200, headers, body: JSON.stringify({ success: true, added: toInsert.length, skipped: skipped.length }) };
    }

    if (action === "crm_lead_add") {
      const { lead } = JSON.parse(event.body);
      if (!lead || !lead.full_name) return { statusCode: 400, headers, body: JSON.stringify({ error: "full_name required" }) };
      const r = await fetch(`${SUPABASE_URL}/rest/v1/crm_leads`, {
        method: "POST",
        headers: { ...SB_M, Prefer: "return=representation" },
        body: JSON.stringify({
          full_name: lead.full_name.trim(),
          phone:     lead.phone   || null,
          email:     lead.email   || null,
          mode:      lead.mode    || null,
          notes:     lead.notes   || null,
          status:    "new",
        }),
      });
      const data = await r.json();
      if (r.status >= 400) return { statusCode: r.status, headers, body: JSON.stringify({ error: (data&&data.message)||"Insert failed" }) };
      return { statusCode: 200, headers, body: JSON.stringify({ success: true, lead: Array.isArray(data)?data[0]:data }) };
    }

    if (action === "crm_lead_status") {
      const { id, status: st } = JSON.parse(event.body);
      if (!id) return { statusCode: 400, headers, body: JSON.stringify({ error: "id required" }) };
      const r = await fetch(`${SUPABASE_URL}/rest/v1/crm_leads?id=eq.${id}`, { method:"PATCH", headers:SB_M, body:JSON.stringify({ status: st }) });
      if (r.status >= 400) return { statusCode: r.status, headers, body: JSON.stringify({ error: "Update failed" }) };
      return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };
    }

    if (action === "crm_lead_convert") {
      const { id, student } = JSON.parse(event.body);
      if (!id || !student || !student.name) return { statusCode: 400, headers, body: JSON.stringify({ error: "id and student required" }) };
      const year = new Date().getFullYear();
      const cr = await fetch(`${SUPABASE_URL}/rest/v1/crm_students?student_id=like.CMA-${year}-*&select=student_id`, { headers: SB_H });
      const existing = await cr.json();
      student.student_id = `CMA-${year}-${String((Array.isArray(existing)?existing.length:0)+1).padStart(3,"0")}`;
      if (!student.enrollment_date) student.enrollment_date = new Date().toISOString().split("T")[0];
      const sr = await fetch(`${SUPABASE_URL}/rest/v1/crm_students`, { method:"POST", headers:SB_M, body:JSON.stringify(student) });
      const sdata = await sr.json();
      if (sr.status >= 400) return { statusCode: sr.status, headers, body: JSON.stringify({ error: (sdata&&sdata.message)||"Insert failed" }) };
      await fetch(`${SUPABASE_URL}/rest/v1/crm_leads?id=eq.${id}`, { method:"PATCH", headers:SB_M, body:JSON.stringify({ status: "converted" }) });
      return { statusCode: 200, headers, body: JSON.stringify({ success: true, student: Array.isArray(sdata)?sdata[0]:sdata }) };
    }

    // ── AISENSY SYNC ──────────────────────────────────────────────────────────
    if (action === "crm_aisensy_sync") {
      const AISENSY_KEY = process.env.AISENSY_API_KEY;
      if (!AISENSY_KEY) return { statusCode: 500, headers, body: JSON.stringify({ error: "AISENSY_API_KEY not configured" }) };

      function normPhone(phone) {
        let p = String(phone || "").replace(/\D/g, "");
        if (!p || p.length < 7) return null;
        if (p.length === 10) p = "91" + p;
        else if (p.startsWith("0") && p.length === 11) p = "91" + p.slice(1);
        return p;
      }

      async function addContact(phone, name, tags) {
        const p = normPhone(phone);
        if (!p) return null;
        const res = await fetch("https://backend.aisensy.com/campaign/t1/api/v2", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            apiKey: AISENSY_KEY,
            campaignName: "contact_sync",
            destination: p,
            userName: name || "Contact",
            templateParams: [name || "there"],
            source: "cma-crm-sync",
            media: {},
            buttons: [],
            carouselCards: [],
            location: {},
          }),
        });
        return { phone: p, name, status: res.status };
      }

      // Fetch all active CRM students
      const sr = await fetch(`${SUPABASE_URL}/rest/v1/crm_students?is_active=eq.true&select=name,phone`, { headers: SB_H });
      const students = await sr.json();

      // Fetch all leads
      const lr = await fetch(`${SUPABASE_URL}/rest/v1/crm_leads?select=full_name,phone`, { headers: SB_H });
      const leads = await lr.json();

      const results = [];
      const contacts = [
        ...(Array.isArray(students) ? students.map(s => ({ name: s.name, phone: s.phone, type: "student" })) : []),
        ...(Array.isArray(leads) ? leads.map(l => ({ name: l.full_name, phone: l.phone, type: "lead" })) : []),
      ];

      for (const c of contacts) {
        if (!c.phone) continue;
        const r = await addContact(c.phone, c.name, [c.type]);
        if (r) results.push(r);
      }

      return { statusCode: 200, headers, body: JSON.stringify({ success: true, synced: results.length, results }) };
    }

    // ── AISENSY SEND FROM CRM ────────────────────────────────────────────────
    if (action === "crm_aisensy_send") {
      const { phone, name, amount, due_date, template } = JSON.parse(event.body);
      const AISENSY_KEY = process.env.AISENSY_API_KEY;
      if (!AISENSY_KEY) return { statusCode: 500, headers, body: JSON.stringify({ error: "AISENSY_API_KEY not configured" }) };
      let p = String(phone || "").replace(/\D/g, "");
      if (p.length === 10) p = "91" + p;
      else if (p.startsWith("0") && p.length === 11) p = "91" + p.slice(1);
      const dueStr = due_date ? new Date(due_date).toLocaleDateString("en-IN", { day:"numeric", month:"short", year:"numeric" }) : "soon";
      const res = await fetch("https://backend.aisensy.com/campaign/t1/api/v2", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          apiKey: AISENSY_KEY,
          campaignName: template || "fee_reminder_advance",
          destination: p,
          userName: name,
          templateParams: [name, `Rs.${amount}`, dueStr],
          source: "cma-crm",
          media: {}, buttons: [], carouselCards: [], location: {},
        }),
      });
      const text = await res.text();
      return { statusCode: 200, headers, body: JSON.stringify({ success: true, wa_status: res.status, wa_response: text }) };
    }

    // ── AISENSY SEND TEST ─────────────────────────────────────────────────────
    if (action === "crm_aisensy_test") {
      const { phone, name } = JSON.parse(event.body);
      const AISENSY_KEY = process.env.AISENSY_API_KEY;
      if (!AISENSY_KEY) return { statusCode: 500, headers, body: JSON.stringify({ error: "AISENSY_API_KEY not configured" }) };
      let p = String(phone || "").replace(/\D/g, "");
      if (p.length === 10) p = "91" + p;
      const res = await fetch("https://backend.aisensy.com/campaign/t1/api/v2", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          apiKey: AISENSY_KEY,
          campaignName: "fee_reminder_advance",
          destination: p,
          userName: name || "Test",
          templateParams: [name || "Student", "Rs.5000", "30 Apr 2026"],
          source: "cma-test",
          media: {}, buttons: [], carouselCards: [], location: {},
        }),
      });
      const text = await res.text();
      return { statusCode: 200, headers, body: JSON.stringify({ status: res.status, response: text }) };
    }

    return { statusCode: 400, headers, body: JSON.stringify({ error: "Invalid action" }) };
  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: "Server error", detail: err.message }) };
  }
};
