exports.handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, x-admin-token",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Content-Type": "application/json",
  };

  if (event.httpMethod === "OPTIONS") return { statusCode: 200, headers, body: "" };

  const adminToken = event.headers["x-admin-token"] || "";
  if (!adminToken || adminToken !== process.env.PAYMENT_ADMIN_PASSWORD) {
    return { statusCode: 401, headers, body: JSON.stringify({ error: "Unauthorized" }) };
  }

  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_KEY = process.env.SUPABASE_SECRET_KEY;

  if (!SUPABASE_URL || !SUPABASE_KEY) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: "Missing env vars" }) };
  }

  const parseJson = async (res) => {
    const text = await res.text();
    try { return JSON.parse(text); } catch { return text; }
  };

  const sbGet = async (path) => {
    const res = await fetch(`${SUPABASE_URL}/rest/v1${path}`, {
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
      },
    });
    const data = await parseJson(res);
    return { status: res.status, data };
  };

  const sbPost = async (path, body) => {
    const res = await fetch(`${SUPABASE_URL}/rest/v1${path}`, {
      method: "POST",
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify(body),
    });
    const data = await parseJson(res);
    return { status: res.status, data };
  };

  const sbPatch = async (path, body) => {
    const res = await fetch(`${SUPABASE_URL}/rest/v1${path}`, {
      method: "PATCH",
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify(body),
    });
    const data = await parseJson(res);
    return { status: res.status, data };
  };

  const sbDelete = async (path) => {
    const res = await fetch(`${SUPABASE_URL}/rest/v1${path}`, {
      method: "DELETE",
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
      },
    });
    return { status: res.status };
  };

  try {
    let body = {};
    try { body = JSON.parse(event.body || "{}"); } catch { body = {}; }

    const { action } = body;

    // ── PING (debug) ──────────────────────────────────────────────────────────
    if (action === "ping") {
      return { statusCode: 200, headers, body: JSON.stringify({ success: true, env: { url: !!SUPABASE_URL, key: !!SUPABASE_KEY } }) };
    }

    // ── LIST ──────────────────────────────────────────────────────────────────
    if (action === "list") {
      const { status, instrument, teacher, mode, search, is_active } = body;
      let filters = [];

      if (is_active !== undefined) filters.push(`is_active=eq.${is_active}`);
      else filters.push("is_active=eq.true");

      if (status && status !== "all") filters.push(`status=eq.${status}`);
      if (instrument && instrument !== "all") filters.push(`instrument=eq.${encodeURIComponent(instrument)}`);
      if (teacher && teacher !== "all") filters.push(`teacher=eq.${encodeURIComponent(teacher)}`);
      if (mode && mode !== "all") filters.push(`mode=eq.${mode}`);
      if (search) {
        const s = encodeURIComponent(search);
        filters.push(`or=(name.ilike.*${s}*,phone.ilike.*${s}*,email.ilike.*${s}*,student_id.ilike.*${s}*)`);
      }

      const qs = filters.length ? `?${filters.join("&")}&order=created_at.desc` : "?order=created_at.desc";
      const { status: httpStatus, data } = await sbGet(`/crm_students${qs}`);

      if (httpStatus === 404 || (data && data.code === "42P01")) {
        return { statusCode: 404, headers, body: JSON.stringify({ error: "table_not_found" }) };
      }

      return { statusCode: 200, headers, body: JSON.stringify({ success: true, students: Array.isArray(data) ? data : [] }) };
    }

    // ── GET single student with attendance + notes ────────────────────────────
    if (action === "get") {
      const { id } = body;
      if (!id) return { statusCode: 400, headers, body: JSON.stringify({ error: "id required" }) };

      const [stuRes, attRes, notesRes] = await Promise.all([
        sbGet(`/crm_students?id=eq.${id}`),
        sbGet(`/crm_attendance?student_id=eq.${id}&order=date.desc&limit=60`),
        sbGet(`/crm_notes?student_id=eq.${id}&order=created_at.desc`),
      ]);

      const student = Array.isArray(stuRes.data) ? stuRes.data[0] : null;
      if (!student) return { statusCode: 404, headers, body: JSON.stringify({ error: "Student not found" }) };

      return {
        statusCode: 200, headers,
        body: JSON.stringify({
          success: true,
          student,
          attendance: Array.isArray(attRes.data) ? attRes.data : [],
          notes: Array.isArray(notesRes.data) ? notesRes.data : [],
        }),
      };
    }

    // ── ADD student ───────────────────────────────────────────────────────────
    if (action === "add") {
      const { student } = body;
      if (!student || !student.name) return { statusCode: 400, headers, body: JSON.stringify({ error: "name required" }) };

      // Auto-generate student_id: CMA-YYYY-NNN
      const year = new Date().getFullYear();
      const countRes = await sbGet(`/crm_students?student_id=like.CMA-${year}-*&select=student_id`);
      const existing = Array.isArray(countRes.data) ? countRes.data : [];
      const seq = String(existing.length + 1).padStart(3, "0");
      student.student_id = `CMA-${year}-${seq}`;

      if (!student.enrollment_date) student.enrollment_date = new Date().toISOString().split("T")[0];

      const { status: httpStatus, data } = await sbPost("/crm_students", student);

      if (httpStatus >= 400) {
        return { statusCode: httpStatus, headers, body: JSON.stringify({ error: (data && data.message) || "Insert failed" }) };
      }

      const inserted = Array.isArray(data) ? data[0] : data;
      return { statusCode: 200, headers, body: JSON.stringify({ success: true, student: inserted }) };
    }

    // ── UPDATE student ────────────────────────────────────────────────────────
    if (action === "update") {
      const { id, student } = body;
      if (!id || !student) return { statusCode: 400, headers, body: JSON.stringify({ error: "id and student required" }) };

      delete student.id;
      delete student.student_id;
      delete student.created_at;

      const { status: httpStatus, data } = await sbPatch(`/crm_students?id=eq.${id}`, student);

      if (httpStatus >= 400) {
        return { statusCode: httpStatus, headers, body: JSON.stringify({ error: (data && data.message) || "Update failed" }) };
      }

      const updated = Array.isArray(data) ? data[0] : data;
      return { statusCode: 200, headers, body: JSON.stringify({ success: true, student: updated }) };
    }

    // ── DELETE (soft) ─────────────────────────────────────────────────────────
    if (action === "delete") {
      const { id } = body;
      if (!id) return { statusCode: 400, headers, body: JSON.stringify({ error: "id required" }) };

      const { status: httpStatus, data } = await sbPatch(`/crm_students?id=eq.${id}`, { is_active: false });

      if (httpStatus >= 400) {
        return { statusCode: httpStatus, headers, body: JSON.stringify({ error: (data && data.message) || "Delete failed" }) };
      }

      return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };
    }

    // ── MARK ATTENDANCE ───────────────────────────────────────────────────────
    if (action === "mark_attendance") {
      const { student_id, date, status: attStatus, note } = body;
      if (!student_id || !date) return { statusCode: 400, headers, body: JSON.stringify({ error: "student_id and date required" }) };

      // Delete existing for that student+date first, then insert
      await sbDelete(`/crm_attendance?student_id=eq.${student_id}&date=eq.${date}`);

      const { status: httpStatus, data } = await sbPost("/crm_attendance", {
        student_id,
        date,
        status: attStatus || "present",
        note: note || null,
      });

      if (httpStatus >= 400) {
        return { statusCode: httpStatus, headers, body: JSON.stringify({ error: (data && data.message) || "Attendance insert failed" }) };
      }

      return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };
    }

    // ── ADD NOTE ──────────────────────────────────────────────────────────────
    if (action === "add_note") {
      const { student_id, content } = body;
      if (!student_id || !content) return { statusCode: 400, headers, body: JSON.stringify({ error: "student_id and content required" }) };

      const { status: httpStatus, data } = await sbPost("/crm_notes", { student_id, content });

      if (httpStatus >= 400) {
        return { statusCode: httpStatus, headers, body: JSON.stringify({ error: (data && data.message) || "Note insert failed" }) };
      }

      const inserted = Array.isArray(data) ? data[0] : data;
      return { statusCode: 200, headers, body: JSON.stringify({ success: true, note: inserted }) };
    }

    // ── DASHBOARD STATS ───────────────────────────────────────────────────────
    if (action === "dashboard") {
      // DEBUG: test if function runs at all without Supabase
      const testRes = { statusCode: 200, headers, body: JSON.stringify({ success: true, _debug: "no_supabase", stats: { total: 0, active: 0, trial: 0, paused: 0, dropped: 0, online: 0, offline: 0, revenue_this_month: 0 }, instruments: {}, recent: [], todayStudents: [] }) };
      // Attempt real Supabase call, fall back to debug if it throws
      let allRes;
      try {
        allRes = await sbGet("/crm_students?is_active=eq.true&select=id,status,mode,instrument,amount_due,enrollment_date,name,student_id,teacher,class_days,class_time,level");
      } catch (sbErr) {
        return { statusCode: 500, headers, body: JSON.stringify({ error: "Supabase fetch failed", detail: sbErr.message, url_set: !!SUPABASE_URL, key_set: !!SUPABASE_KEY }) };
      }

      if (allRes.status === 404 || (allRes.data && allRes.data.code === "42P01")) {
        return { statusCode: 404, headers, body: JSON.stringify({ error: "table_not_found" }) };
      }

      const all = Array.isArray(allRes.data) ? allRes.data : [];
      const recent = [...all].sort((a, b) => new Date(b.enrollment_date || 0) - new Date(a.enrollment_date || 0)).slice(0, 5);

      const stats = {
        total: all.length,
        active: all.filter(s => s.status === "active").length,
        trial: all.filter(s => s.status === "trial").length,
        paused: all.filter(s => s.status === "paused").length,
        dropped: all.filter(s => s.status === "dropped").length,
        online: all.filter(s => s.mode === "online").length,
        offline: all.filter(s => s.mode === "offline").length,
        revenue_this_month: all.filter(s => s.status === "active").reduce((sum, s) => sum + (s.amount_due || 0), 0),
      };

      const instruments = {};
      all.forEach(s => {
        if (s.instrument) instruments[s.instrument] = (instruments[s.instrument] || 0) + 1;
      });

      const days = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
      const todayDay = days[new Date().getDay()];
      const todayStudents = all.filter(s => {
        if (!s.class_days) return false;
        return s.class_days.toLowerCase().includes(todayDay);
      });

      return {
        statusCode: 200, headers,
        body: JSON.stringify({ success: true, stats, instruments, recent, todayStudents }),
      };
    }

    return { statusCode: 400, headers, body: JSON.stringify({ error: "Unknown action" }) };

  } catch (err) {
    console.error("CRM error:", err);
    return { statusCode: 500, headers, body: JSON.stringify({ error: "Server error", detail: err.message }) };
  }
};
