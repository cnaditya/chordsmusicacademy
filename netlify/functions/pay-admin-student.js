// Handles: seed all students, add single student, update student
const { resolveRole } = require("./_shared/auth");
const { sign } = require("./_shared/leaveSign");
const { countClassDaysInRange } = require("./_shared/schedule");
const { decideLeave } = require("./_shared/leaveApply");
const { computeCycle } = require("./_shared/leaves");

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
      // Teachers get their OWN password back as their token, never the admin
      // password — their access is scoped down below (crm_get + crm_mark_attendance only).
      let teacherPasswords = {};
      try { teacherPasswords = JSON.parse(process.env.TEACHER_PASSWORDS || "{}"); } catch(e) {}
      if (name && teacherPasswords[name] && teacherPasswords[name] === password) {
        return { statusCode: 200, headers, body: JSON.stringify({ success: true, role: "teacher", name, token: password }) };
      }
      return { statusCode: 401, headers, body: JSON.stringify({ error: "Wrong password" }) };
    }
    // Public: look up student by phone for leave portal
    if (preBody.action === "crm_lookup_student") {
      const { phone } = preBody;
      if (!phone) return { statusCode: 400, headers, body: JSON.stringify({ error: "phone required" }) };
      const digits = phone.replace(/\D/g,'').slice(-10);
      const r = await fetch(`${SUPABASE_URL}/rest/v1/crm_students?phone=like.*${digits}&is_active=eq.true&select=id,name,student_id,instrument,mode,teacher`, { headers: SB_H_PRE });
      const rows = await r.json();
      if (!Array.isArray(rows) || !rows.length) return { statusCode: 404, headers, body: JSON.stringify({ error: "Student not found" }) };
      return { statusCode: 200, headers, body: JSON.stringify({ success: true, student: rows[0] }) };
    }

    // Public: registration form creates a trial student directly in the CRM
    if (preBody.action === "crm_public_trial") {
      const { name, phone, email, instrument, level, mode, notes, dob, address, guardian } = preBody;
      const digits = String(phone || "").replace(/\D/g, "").slice(-10);
      if (!name || digits.length < 10) return { statusCode: 400, headers, body: JSON.stringify({ error: "name and valid phone required" }) };

      const dup = await fetch(`${SUPABASE_URL}/rest/v1/crm_students?phone=like.*${digits}&is_active=eq.true&select=id,student_id,status`, { headers: SB_H_PRE });
      const existing = await dup.json();
      if (Array.isArray(existing) && existing.length) {
        return { statusCode: 200, headers, body: JSON.stringify({ success: true, duplicate: true, student_id: existing[0].student_id }) };
      }

      const year = new Date().getFullYear();
      const cr = await fetch(`${SUPABASE_URL}/rest/v1/crm_students?student_id=like.CMA-${year}-*&select=student_id`, { headers: SB_H_PRE });
      const countRows = await cr.json();
      const studentId = `CMA-${year}-${String((Array.isArray(countRows) ? countRows.length : 0) + 1).padStart(3, "0")}`;

      const payload = {
        student_id: studentId,
        name: String(name).trim(),
        phone: digits,
        email: email || "",
        instrument: instrument || "",
        level: level || "",
        mode: mode || "offline",
        status: "trial",
        is_active: true,
        enrollment_date: new Date().toISOString().slice(0, 10),
        amount_due: 0,
        notes: [dob && `DOB: ${dob}`, address && `Address: ${address}`, guardian && `Guardian: ${guardian}`, notes && `Preferred timing / notes: ${notes}`, "Source: registration form (trial)"].filter(Boolean).join(" | "),
      };
      const ins = await fetch(`${SUPABASE_URL}/rest/v1/crm_students`, {
        method: "POST", headers: { ...SB_H_PRE, "Content-Type": "application/json", Prefer: "return=representation" },
        body: JSON.stringify(payload),
      });
      const created = await ins.json();
      if (!ins.ok) return { statusCode: 400, headers, body: JSON.stringify({ error: (created && created.message) || "Insert failed" }) };

      const secret = process.env.ADS_DASHBOARD_PASSWORD;
      if (secret) {
        try {
          await fetch('https://chordsmusicacademy.in/.netlify/functions/send-whatsapp-alert', {
            method: 'POST', headers: { 'x-ads-token': secret, 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: `New trial registration: ${payload.name} (${studentId}) for ${payload.instrument || 'instrument not given'}, ${payload.level || 'level not given'}, ${payload.mode}. Phone ${digits}. Timing: ${notes || 'not given'}. Open CRM to schedule the trial.` }),
          });
        } catch (e) { /* alert failure must not block the registration */ }
      }
      return { statusCode: 200, headers, body: JSON.stringify({ success: true, student_id: studentId }) };
    }

    // Public: joining form, sent by the owner after a successful trial.
    // Turns an existing trial (matched by phone) or a new entry into an active enrolment.
    if (preBody.action === "crm_public_join") {
      const { name, phone, email, instrument, level, mode, dob, address, guardian, class_days, class_time, plan, start_date } = preBody;
      const digits = String(phone || "").replace(/\D/g, "").slice(-10);
      const months = parseInt(plan, 10);
      if (!name || digits.length < 10 || !class_days || ![3, 6, 12].includes(months)) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: "name, valid phone, class_days and plan (3, 6 or 12 months) required" }) };
      }

      const SB_W_PRE = { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`, "Content-Type": "application/json", Prefer: "return=representation" };
      const found = await fetch(`${SUPABASE_URL}/rest/v1/crm_students?phone=like.*${digits}&is_active=eq.true&select=id,student_id,status`, { headers: SB_H_PRE });
      const existing = await found.json();
      if (Array.isArray(existing) && existing.length && existing[0].status === "active") {
        await fetch(`${SUPABASE_URL}/rest/v1/crm_notes`, {
          method: "POST", headers: SB_W_PRE,
          body: JSON.stringify({ student_id: existing[0].id, content: `Joining form submitted again. Not changed automatically, please check. Classes: ${class_days}${class_time ? " " + class_time : ""}, plan ${months} months.` }),
        });
        return { statusCode: 200, headers, body: JSON.stringify({ success: true, duplicate: true, student_id: existing[0].student_id }) };
      }

      const startStr = start_date || new Date().toISOString().slice(0, 10);
      const dueBase = new Date(startStr + "T00:00:00");
      dueBase.setMonth(dueBase.getMonth() + months);
      const dueDate = dueBase.toISOString().slice(0, 10);
      const fields = {
        name: String(name).trim(),
        phone: digits,
        email: email || "",
        instrument: instrument || "",
        level: level || "",
        mode: mode || "offline",
        status: "active",
        is_active: true,
        class_days,
        class_time: class_time || "",
        payment_type: `${months} Months`,
        total_classes_per_cycle: months * 8,
        enrollment_date: startStr,
        cycle_start: startStr,
        leaves_taken: 0,
        due_date: dueDate,
      };

      let studentDbId, studentId;
      if (existing.length) {
        studentDbId = existing[0].id;
        studentId = existing[0].student_id;
        const upd = await fetch(`${SUPABASE_URL}/rest/v1/crm_students?id=eq.${studentDbId}`, { method: "PATCH", headers: SB_W_PRE, body: JSON.stringify(fields) });
        if (upd.status >= 400) return { statusCode: 400, headers, body: JSON.stringify({ error: "Update failed" }) };
      } else {
        const year = new Date().getFullYear();
        const cr = await fetch(`${SUPABASE_URL}/rest/v1/crm_students?student_id=like.CMA-${year}-*&select=student_id`, { headers: SB_H_PRE });
        const countRows = await cr.json();
        studentId = `CMA-${year}-${String((Array.isArray(countRows) ? countRows.length : 0) + 1).padStart(3, "0")}`;
        const ins = await fetch(`${SUPABASE_URL}/rest/v1/crm_students`, { method: "POST", headers: SB_W_PRE, body: JSON.stringify({ ...fields, student_id: studentId, amount_due: 0 }) });
        const created = await ins.json();
        if (!ins.ok) return { statusCode: 400, headers, body: JSON.stringify({ error: (created && created.message) || "Insert failed" }) };
        studentDbId = Array.isArray(created) ? created[0].id : created.id;
      }

      const details = [dob && `DOB: ${dob}`, address && `Address: ${address}`, guardian && `Guardian: ${guardian}`].filter(Boolean).join(", ");
      await fetch(`${SUPABASE_URL}/rest/v1/crm_notes`, {
        method: "POST", headers: SB_W_PRE,
        body: JSON.stringify({ student_id: studentDbId, content: `Joined via joining form. Classes: ${class_days}${class_time ? " " + class_time : ""}. Plan: ${months} months (${months * 8} classes). First due: ${dueDate}.${details ? " " + details + "." : ""}` }),
      });

      const secret = process.env.ADS_DASHBOARD_PASSWORD;
      if (secret) {
        try {
          await fetch("https://chordsmusicacademy.in/.netlify/functions/send-whatsapp-alert", {
            method: "POST", headers: { "x-ads-token": secret, "Content-Type": "application/json" },
            body: JSON.stringify({ message: `Joined: ${fields.name} (${studentId}), ${instrument || "instrument not given"}, ${months} months, ${class_days}${class_time ? " " + class_time : ""}. Phone ${digits}. Payment still to collect. Open CRM.` }),
          });
        } catch (e) { /* alert failure must not block the joining */ }
      }
      return { statusCode: 200, headers, body: JSON.stringify({ success: true, student_id: studentId, due_date: dueDate }) };
    }

    // Public: student submits leave request
    if (preBody.action === "crm_submit_leave") {
      const { student_db_id, student_id, student_name, date_from, date_to, selected_dates, reason } = preBody;
      if (!student_db_id || !date_from || !date_to) return { statusCode: 400, headers, body: JSON.stringify({ error: "student_db_id, date_from, date_to required" }) };
      const payload = { student_db_id, student_id: student_id||'', student_name: student_name||'', date_from, date_to, selected_dates: selected_dates||'', reason: reason||'', status: 'pending' };
      const r = await fetch(`${SUPABASE_URL}/rest/v1/crm_leaves`, {
        method: 'POST', headers: { ...SB_H_PRE, 'Content-Type': 'application/json', Prefer: 'return=representation' },
        body: JSON.stringify(payload)
      });
      const result = await r.json();
      if (!r.ok) return { statusCode: 400, headers, body: JSON.stringify({ error: result.message || 'Failed to submit leave' }) };

      const leaveId = Array.isArray(result) ? result[0]?.id : result?.id;
      const secret = process.env.ADS_DASHBOARD_PASSWORD;
      if (leaveId && secret) {
        const base = `https://chordsmusicacademy.in/.netlify/functions/leave-decide?id=${leaveId}`;
        const approveUrl = `${base}&action=approve&sig=${sign(leaveId, 'approve', secret)}`;
        const rejectUrl = `${base}&action=reject&sig=${sign(leaveId, 'reject', secret)}`;
        const when = selected_dates ? selected_dates : `${date_from} to ${date_to}`;
        const msg = `Leave request: ${student_name || 'Student'} (${student_id || ''}) for ${when}. Reason: ${reason || 'not given'}. Approve: ${approveUrl} | Reject: ${rejectUrl}`;
        try {
          await fetch('https://chordsmusicacademy.in/.netlify/functions/send-whatsapp-alert', {
            method: 'POST',
            headers: { 'x-ads-token': secret, 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: msg }),
          });
        } catch (e) { /* notification failure must not block the leave being saved */ }
      }
      return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };
    }

  } catch(e) { /* fall through to normal auth */ }

  // Teachers get a scoped-down token (their own password, see crm_validate_role
  // above) that only works for the two actions attend.html actually uses —
  // marking attendance and looking up a student. Everything else (payments,
  // deletes, revenue, bills, leads, other teachers' data) requires full admin.
  const TEACHER_ALLOWED_ACTIONS = new Set(["crm_get", "crm_mark_attendance"]);
  const adminToken = event.headers["x-admin-token"] || "";
  const { role } = resolveRole(adminToken);

  let gateAction = "";
  try { gateAction = JSON.parse(event.body || "{}").action || ""; } catch (e) {}

  if (role === "admin") {
    // full access
  } else if (role === "teacher" && TEACHER_ALLOWED_ACTIONS.has(gateAction)) {
    // scoped access
  } else if (role === "teacher") {
    return { statusCode: 403, headers, body: JSON.stringify({ error: "Teachers can only mark attendance" }) };
  } else {
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
    // --- Delete a student (soft delete, matches crm_students — recoverable) ---
    if (action === "delete") {
      const { id } = JSON.parse(event.body || "{}");
      if (!id) return { statusCode: 400, headers, body: JSON.stringify({ error: "id required" }) };
      const delRes = await fetch(
        `${SUPABASE_URL}/rest/v1/payment_students?id=eq.${encodeURIComponent(id)}`,
        {
          method: "PATCH",
          headers: {
            apikey: SUPABASE_KEY,
            Authorization: `Bearer ${SUPABASE_KEY}`,
            "Content-Type": "application/json",
            Prefer: "return=minimal",
          },
          body: JSON.stringify({ is_active: false }),
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
      const thisMonth = new Date().toISOString().slice(0,7); // "2026-09"
      const [r, notesR] = await Promise.all([
        fetch(`${SUPABASE_URL}/rest/v1/crm_students?is_active=eq.true&select=id,status,mode,instrument,amount_due,due_date,enrollment_date,name,student_id,teacher,class_days,class_time,level,phone`, { headers: SB_H }),
        fetch(`${SUPABASE_URL}/rest/v1/crm_notes?content=like.*%E2%82%B9*&created_at=gte.${thisMonth}-01&select=student_id,content,created_at&order=created_at.desc&limit=500`, { headers: SB_H }),
      ]);
      const all = await r.json();
      if (!Array.isArray(all)) {
        if (r.status === 404 || (all && all.code === "42P01")) return { statusCode: 404, headers, body: JSON.stringify({ error: "table_not_found" }) };
        return { statusCode: 500, headers, body: JSON.stringify({ error: "Unexpected response", raw: JSON.stringify(all) }) };
      }
      const notes = await notesR.json();
      const recent = [...all].sort((a, b) => new Date(b.enrollment_date || 0) - new Date(a.enrollment_date || 0)).slice(0, 5);
      const activeStudents = all.filter(s=>s.status==="active");
      const studentMap = Object.fromEntries(all.map(s=>[s.id, s]));
      const offlineIds = new Set(all.filter(s=>s.mode==="offline").map(s=>s.id));
      const parseAmt = c => { const m = (c||'').match(/₹([\d,]+)/); return m ? parseInt(m[1].replace(/,/g,'')) : 0; };
      const offlineNotes = (Array.isArray(notes)?notes:[]).filter(n=>offlineIds.has(n.student_id));
      const collected_offline = offlineNotes.reduce((sum,n)=>sum+parseAmt(n.content),0);
      const collected_breakdown = offlineNotes.map(n => {
        const stu = studentMap[n.student_id] || {};
        return { name: stu.name||'Unknown', student_id: stu.student_id||'', amount: parseAmt(n.content), date: (n.created_at||'').slice(0,10), note: n.content||'' };
      }).filter(x=>x.amount>0);
      // All active offline/online students — full month forecast regardless of specific due_date
      const allActiveOffline = activeStudents.filter(s => s.mode==="offline");
      const allActiveOnline  = activeStudents.filter(s => s.mode==="online");
      const stats = {
        total: all.length,
        active: activeStudents.length,
        trial: all.filter(s=>s.status==="trial").length,
        paused: all.filter(s=>s.status==="paused").length,
        dropped: all.filter(s=>s.status==="dropped").length,
        online: allActiveOnline.length,
        offline: allActiveOffline.length,
        revenue_this_month: activeStudents.reduce((sum,s)=>sum+(s.amount_due||0),0),
        revenue_online: allActiveOnline.reduce((sum,s)=>sum+(s.amount_due||0),0),
        revenue_offline: allActiveOffline.reduce((sum,s)=>sum+(s.amount_due||0),0),
        revenue_offline_count: allActiveOffline.length,
        revenue_online_count: allActiveOnline.length,
        collected_offline,
        collected_breakdown,
        estimated_due_list: allActiveOffline.map(s=>({ id:s.id, name:s.name, student_id:s.student_id, instrument:s.instrument, teacher:s.teacher, due_date:s.due_date, amount_due:s.amount_due, mode:s.mode })),
      };
      const instruments = {};
      all.forEach(s => { if (s.instrument) instruments[s.instrument] = (instruments[s.instrument]||0)+1; });
      const days = ["sun","mon","tue","wed","thu","fri","sat"];
      const todayStudents = all.filter(s => s.class_days && s.class_days.toLowerCase().includes(days[new Date().getDay()]));
      // Dues: overdue or due within 7 days, with a due_date and amount_due set
      const today = new Date(); today.setHours(0,0,0,0);
      const dueStudents = all.filter(s => s.due_date && s.amount_due > 0 && s.mode === 'offline' && (s.status === 'active' || s.status === 'trial')).map(s => {
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
      const todayIso = new Date().toISOString().slice(0, 10);
      const cyclePt = String(stu.payment_type || '').toLowerCase();
      let cycleMonths = 3;
      const cm = cyclePt.match(/(\d+)\s*month/);
      if (cm) cycleMonths = parseInt(cm[1]);
      else if (cyclePt.includes('month')) cycleMonths = 1;
      else if (cyclePt.includes('quarter')) cycleMonths = 3;
      else if (cyclePt.includes('half')) cycleMonths = 6;
      else if (cyclePt.includes('annual') || cyclePt.includes('year')) cycleMonths = 12;
      let cycleStart = stu.enrollment_date;
      if (stu.due_date) {
        const cs = new Date(stu.due_date + 'T00:00:00');
        cs.setMonth(cs.getMonth() - cycleMonths);
        cycleStart = cs.toISOString().slice(0, 10);
      }
      const lvR = await fetch(`${SUPABASE_URL}/rest/v1/crm_leaves?student_db_id=eq.${id}&status=eq.approved&select=*`, { headers: SB_H });
      const lvRows = await lvR.json().catch(() => []);
      const approvedLeaves = Array.isArray(lvRows) ? lvRows : [];
      const cyc = computeCycle(stu, approvedLeaves, todayIso);
      const class_status = {
        scheduled_to_date: cyc.scheduled,
        leaves_taken: cyc.leavesTaken,
        used: cyc.used,
        total: cyc.total,
        remaining: cyc.remaining,
      };
      return { statusCode: 200, headers, body: JSON.stringify({ success: true, student: stu, class_status, attendance: Array.isArray(attendance)?attendance:[], notes: Array.isArray(notes)?notes:[] }) };
    }

    if (action === "crm_add") {
      const { student: s } = JSON.parse(event.body);
      if (!s || !s.name) return { statusCode: 400, headers, body: JSON.stringify({ error: "name required" }) };
      const year = new Date().getFullYear();
      const cr = await fetch(`${SUPABASE_URL}/rest/v1/crm_students?student_id=like.CMA-${year}-*&select=student_id`, { headers: SB_H });
      const existing = await cr.json();
      s.student_id = `CMA-${year}-${String((Array.isArray(existing)?existing.length:0)+1).padStart(3,"0")}`;
      if (!s.enrollment_date) s.enrollment_date = new Date().toISOString().split("T")[0];
      if (!s.cycle_start) s.cycle_start = s.enrollment_date;
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

    if (action === "crm_mark_paid") {
      // Marks a student paid and auto-advances due_date by their billing
      // cycle length (parsed from payment_type), so staff don't have to
      // manually compute the next due date each time.
      const { id, amount } = JSON.parse(event.body || "{}");
      if (!id) return { statusCode: 400, headers, body: JSON.stringify({ error: "id required" }) };

      const r = await fetch(`${SUPABASE_URL}/rest/v1/crm_students?id=eq.${id}`, { headers: SB_H });
      const rows = await r.json();
      const student = Array.isArray(rows) ? rows[0] : null;
      if (!student) return { statusCode: 404, headers, body: JSON.stringify({ error: "Student not found" }) };

      const pt = (student.payment_type || "").toLowerCase();
      let months = 3; // default: quarterly, the most common package
      const explicit = pt.match(/(\d+)\s*month/);
      if (explicit) months = parseInt(explicit[1]);
      else if (pt.includes("month")) months = 1; // "monthly"
      else if (pt.includes("quarter")) months = 3;
      else if (pt.includes("half")) months = 6;
      else if (pt.includes("annual") || pt.includes("year")) months = 12;

      const base = student.due_date ? new Date(student.due_date + "T00:00:00") : new Date();
      base.setMonth(base.getMonth() + months);
      const newDueDate = base.toISOString().slice(0, 10);

      const paidAmount = amount !== undefined ? amount : student.amount_due;

      const upd = await fetch(`${SUPABASE_URL}/rest/v1/crm_students?id=eq.${id}`, {
        method: "PATCH", headers: SB_M,
        body: JSON.stringify({ amount_due: 0, due_date: newDueDate, cycle_start: student.due_date || new Date().toISOString().slice(0, 10), leaves_taken: 0 }),
      });
      if (upd.status >= 400) {
        const err = await upd.json();
        return { statusCode: upd.status, headers, body: JSON.stringify({ error: err.message || "Update failed" }) };
      }

      await fetch(`${SUPABASE_URL}/rest/v1/crm_notes`, {
        method: "POST", headers: SB_M,
        body: JSON.stringify({
          student_id: id,
          content: `Rs.${paidAmount} received - marked paid. Due date advanced to ${newDueDate} (${months}-month cycle).`,
        }),
      });

      return { statusCode: 200, headers, body: JSON.stringify({ success: true, new_due_date: newDueDate, months_advanced: months }) };
    }

    if (action === "crm_enroll") {
      // Converts a trial student into an active enrolment after the trial.
      const { id, class_days, class_time, payment_type, start_date, paid } = JSON.parse(event.body || "{}");
      if (!id || !class_days || !payment_type) return { statusCode: 400, headers, body: JSON.stringify({ error: "id, class_days and payment_type required" }) };

      const pt = String(payment_type).toLowerCase();
      let months = 3;
      const explicit = pt.match(/(\d+)\s*month/);
      if (explicit) months = parseInt(explicit[1]);
      else if (pt.includes("month")) months = 1;
      else if (pt.includes("quarter")) months = 3;
      else if (pt.includes("half")) months = 6;
      else if (pt.includes("annual") || pt.includes("year")) months = 12;

      const startStr = start_date || new Date().toISOString().slice(0, 10);
      const dueBase = new Date(startStr + "T00:00:00");
      dueBase.setMonth(dueBase.getMonth() + months);
      const dueDate = dueBase.toISOString().slice(0, 10);

      const upd = await fetch(`${SUPABASE_URL}/rest/v1/crm_students?id=eq.${id}`, {
        method: "PATCH", headers: SB_M,
        body: JSON.stringify({
          status: "active",
          class_days,
          class_time: class_time || "",
          payment_type,
          total_classes_per_cycle: months * 8,
          enrollment_date: startStr,
          cycle_start: startStr,
          leaves_taken: 0,
          amount_due: paid ? 0 : undefined,
          due_date: dueDate,
        }),
      });
      if (upd.status >= 400) {
        const err = await upd.json().catch(() => ({}));
        return { statusCode: upd.status, headers, body: JSON.stringify({ error: err.message || "Enroll failed" }) };
      }
      await fetch(`${SUPABASE_URL}/rest/v1/crm_notes`, {
        method: "POST", headers: SB_M,
        body: JSON.stringify({ student_id: id, content: `Enrolled after trial. Classes: ${class_days}${class_time ? ' ' + class_time : ''}. Cycle: ${payment_type} (${months * 8} classes). Next due: ${dueDate}.` }),
      });
      return { statusCode: 200, headers, body: JSON.stringify({ success: true, due_date: dueDate }) };
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

    if (action === "crm_enrollments") {
      const { from: fromRaw, to: toRaw } = JSON.parse(event.body || "{}");
      const from = fromRaw || new Date().toISOString().slice(0,7) + '-01';
      const to   = toRaw   || new Date().toISOString().slice(0,10);
      const url = `${SUPABASE_URL}/rest/v1/crm_students?enrollment_date=gte.${from}&enrollment_date=lte.${to}&order=enrollment_date.desc&select=id,name,student_id,instrument,teacher,mode,status,enrollment_date,amount_due`;
      const r = await fetch(url, { headers: SB_H });
      const rows = await r.json();
      return { statusCode: 200, headers, body: JSON.stringify({ success: true, rows: Array.isArray(rows) ? rows : [] }) };
    }

    if (action === "crm_revenue_trend") {
      const [offR, notesR] = await Promise.all([
        fetch(`${SUPABASE_URL}/rest/v1/crm_students?mode=eq.offline&select=id`, { headers: SB_H }),
        fetch(`${SUPABASE_URL}/rest/v1/crm_notes?content=like.*%E2%82%B9*&select=student_id,content,created_at&order=created_at.desc&limit=2000`, { headers: SB_H }),
      ]);
      const offlineStudents = await offR.json();
      const notes = await notesR.json();
      const offlineIds = new Set((Array.isArray(offlineStudents) ? offlineStudents : []).map(s => s.id));
      const parseAmt = c => { const m = c.match(/₹([\d,]+)/); return m ? parseInt(m[1].replace(/,/g,'')) : 0; };
      const monthly = {};
      (Array.isArray(notes) ? notes : []).filter(n => offlineIds.has(n.student_id)).forEach(n => {
        const month = (n.created_at||'').slice(0,7);
        if (month) monthly[month] = (monthly[month]||0) + parseAmt(n.content||'');
      });
      const now = new Date();
      const result = [];
      for (let i = 11; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
        const label = d.toLocaleDateString('en-IN',{month:'short'}) + " '" + String(d.getFullYear()).slice(2);
        result.push({ month: key, label, revenue: monthly[key]||0 });
      }
      return { statusCode: 200, headers, body: JSON.stringify({ success: true, months: result }) };
    }

    if (action === "crm_get_leaves") {
      const { student_db_id, status } = JSON.parse(event.body || "{}");
      let url = `${SUPABASE_URL}/rest/v1/crm_leaves?order=date_from.desc&limit=200&select=*`;
      if (student_db_id) url += `&student_db_id=eq.${student_db_id}`;
      if (status && status !== 'all') url += `&status=eq.${status}`;
      const r = await fetch(url, { headers: SB_H });
      const rows = await r.json();
      return { statusCode: 200, headers, body: JSON.stringify({ success: true, leaves: Array.isArray(rows) ? rows : [] }) };
    }

    if (action === "crm_update_leave") {
      const { id, status: st, admin_note } = JSON.parse(event.body || "{}");
      if (!id || !st) return { statusCode: 400, headers, body: JSON.stringify({ error: "id and status required" }) };
      if (st !== "approved" && st !== "rejected") {
        return { statusCode: 400, headers, body: JSON.stringify({ error: "status must be approved or rejected" }) };
      }
      const out = await decideLeave({ SUPABASE_URL, H: SB_H, leaveId: id, action: st === "approved" ? "approve" : "reject", adminNote: admin_note || "" });
      if (out.error) return { statusCode: 400, headers, body: JSON.stringify({ error: out.error === "already_decided" ? `Already ${out.status}` : out.error }) };
      return { statusCode: 200, headers, body: JSON.stringify({ success: true, status: out.status, reason: out.reason || null, remaining: out.remaining ?? null, due_date: out.dueDate || null, student_messaged: !!(out.msg && out.msg.sent) }) };
    }

    if (action === "crm_bills_list") {
      const r = await fetch(`${SUPABASE_URL}/rest/v1/crm_bills?order=created_at.desc&limit=500`, { headers: SB_H });
      const bills = await r.json();
      return { statusCode: 200, headers, body: JSON.stringify({ success: true, bills: Array.isArray(bills) ? bills : [] }) };
    }

    if (action === "crm_bill_create") {
      const { bill } = JSON.parse(event.body || "{}");
      if (!bill || !bill.customer_name) return { statusCode: 400, headers, body: JSON.stringify({ error: "customer_name required" }) };
      // Auto-generate bill number: INV-YYYY-NNN
      const year = new Date().getFullYear();
      const cntR = await fetch(`${SUPABASE_URL}/rest/v1/crm_bills?bill_no=like.INV-${year}-*&select=bill_no`, { headers: SB_H });
      const existing = await cntR.json();
      const nextNo = String((Array.isArray(existing) ? existing.length : 0) + 1).padStart(3, '0');
      bill.bill_no = `INV-${year}-${nextNo}`;
      const r = await fetch(`${SUPABASE_URL}/rest/v1/crm_bills`, {
        method: 'POST', headers: { ...SB_H, 'Content-Type': 'application/json', Prefer: 'return=representation' },
        body: JSON.stringify(bill)
      });
      const result = await r.json();
      if (!r.ok) return { statusCode: 400, headers, body: JSON.stringify({ error: (Array.isArray(result)?result[0]:result)?.message || 'Failed to create bill' }) };
      const created = Array.isArray(result) ? result[0] : result;
      return { statusCode: 200, headers, body: JSON.stringify({ success: true, bill: created }) };
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
      const { student_id, content, created_at } = JSON.parse(event.body);
      if (!student_id || !content) return { statusCode: 400, headers, body: JSON.stringify({ error: "student_id and content required" }) };
      const payload = { student_id, content };
      if (created_at) payload.created_at = created_at; // optional backdating, e.g. logging a late receipt
      const r = await fetch(`${SUPABASE_URL}/rest/v1/crm_notes`, { method:"POST", headers:SB_M, body:JSON.stringify(payload) });
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

    // AiSensy-based actions (crm_aisensy_sync/send/test) removed 2026-10-01 —
    // AiSensy membership lapsed; WhatsApp now goes through the direct Meta
    // Cloud API (see netlify/functions/send-whatsapp-alert.js and fee-reminders.js).

    return { statusCode: 400, headers, body: JSON.stringify({ error: "Invalid action" }) };
  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: "Server error", detail: err.message }) };
  }
};
