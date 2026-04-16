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
      // TEST: skip fetch entirely - return empty dashboard to check if code reaches here
      return { statusCode: 200, headers, body: JSON.stringify({ success: true, _test: "no_fetch", stats: { total:0,active:0,trial:0,paused:0,dropped:0,online:0,offline:0,revenue_this_month:0 }, instruments:{}, recent:[], todayStudents:[] }) };
      const r = await fetch(`${SUPABASE_URL}/rest/v1/crm_students?is_active=eq.true&select=id,status,mode,instrument,amount_due,enrollment_date,name,student_id,teacher,class_days,class_time,level`, { headers: SB_H });
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
      return { statusCode: 200, headers, body: JSON.stringify({ success: true, stats, instruments, recent, todayStudents }) };
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

    if (action === "crm_delete") {
      const { id } = JSON.parse(event.body);
      if (!id) return { statusCode: 400, headers, body: JSON.stringify({ error: "id required" }) };
      const r = await fetch(`${SUPABASE_URL}/rest/v1/crm_students?id=eq.${id}`, { method:"PATCH", headers:SB_M, body:JSON.stringify({ is_active: false }) });
      if (r.status >= 400) return { statusCode: r.status, headers, body: JSON.stringify({ error: "Delete failed" }) };
      return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };
    }

    if (action === "crm_mark_attendance") {
      const { student_id, date, status: attStatus, note } = JSON.parse(event.body);
      if (!student_id || !date) return { statusCode: 400, headers, body: JSON.stringify({ error: "student_id and date required" }) };
      await fetch(`${SUPABASE_URL}/rest/v1/crm_attendance?student_id=eq.${student_id}&date=eq.${date}`, { method:"DELETE", headers:SB_H });
      const r = await fetch(`${SUPABASE_URL}/rest/v1/crm_attendance`, { method:"POST", headers:SB_M, body:JSON.stringify({ student_id, date, status: attStatus||"present", note: note||null }) });
      if (r.status >= 400) return { statusCode: r.status, headers, body: JSON.stringify({ error: "Attendance failed" }) };
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

    return { statusCode: 400, headers, body: JSON.stringify({ error: "Invalid action" }) };
  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: "Server error", detail: err.message }) };
  }
};
