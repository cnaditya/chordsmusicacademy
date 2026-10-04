// Leave rules shared by the WhatsApp approve links and the CRM approve button.
// - Max 2 approved leave requests per calendar month (counted by start month).
// - Approved leave days are skipped, not used up from the package.
// - Remaining classes = package total minus class days already used.
// - Due date = the date of the last remaining class, counting forward from tomorrow
//   and skipping academy holidays and approved leave days.
const { parseClassDays, isHoliday, countClassDaysInRange } = require("./schedule");

const MAX_LEAVES_PER_MONTH = 2;

function addDays(iso, n) {
  const d = new Date(iso + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function isClassDay(classDays, iso) {
  const days = parseClassDays(classDays);
  return days.includes(new Date(iso + "T00:00:00Z").getUTCDay()) && !isHoliday(iso);
}

// The class dates a leave covers (selected dates if given, else the range), holidays and non-class days removed.
function leaveClassDates(leave, classDays) {
  let dates;
  if (leave.selected_dates) {
    dates = leave.selected_dates.split(",").filter(Boolean);
  } else {
    dates = [];
    for (let d = leave.date_from; d && leave.date_to && d <= leave.date_to; d = addDays(d, 1)) dates.push(d);
  }
  return dates.filter((d) => isClassDay(classDays, d));
}

// Start of the current package cycle. cycle_start is set on join, enrol and renewal.
function cycleStartOf(stu) {
  if (stu.cycle_start) return stu.cycle_start;
  if (stu.due_date) {
    const months = (stu.total_classes_per_cycle || 24) / 8;
    const d = new Date(stu.due_date + "T00:00:00Z");
    d.setUTCMonth(d.getUTCMonth() - months);
    return d.toISOString().slice(0, 10);
  }
  return stu.enrollment_date || null;
}

// Works out used and remaining classes, and the new due date, for a student
// given all their approved leaves.
function computeCycle(stu, approvedLeaves, today = todayIso()) {
  const total = stu.total_classes_per_cycle || 0;
  const cs = cycleStartOf(stu);
  const classDays = stu.class_days;
  const leaveDates = new Set();
  for (const l of approvedLeaves) for (const d of leaveClassDates(l, classDays)) if (!cs || d >= cs) leaveDates.add(d);

  const scheduled = cs && cs < today ? countClassDaysInRange(classDays, cs, addDays(today, -1)) : 0;
  const pastLeaves = [...leaveDates].filter((d) => cs && d >= cs && d < today).length;
  const used = Math.max(0, scheduled - pastLeaves);
  const remaining = total ? Math.max(0, total - used) : null;

  let dueDate = stu.due_date || null;
  if (remaining !== null && classDays) {
    if (remaining === 0) {
      dueDate = today;
    } else {
      let counted = 0;
      // Count from the cycle start if it is still in the future, otherwise from tomorrow.
      let d = cs && cs > today ? cs : addDays(today, 1);
      for (let guard = 0; guard < 2000 && counted < remaining; guard++, d = addDays(d, 1)) {
        if (isClassDay(classDays, d) && !leaveDates.has(d)) counted++;
        if (counted === remaining) dueDate = d;
      }
    }
  }
  return { scheduled, leavesTaken: leaveDates.size, used, total, remaining, projectedDue: dueDate };
}

// Decides whether a pending leave can be approved. Returns { ok: true } or { ok: false, reason }.
function checkMonthlyLimit(leave, approvedLeaves) {
  const month = (leave.date_from || "").slice(0, 7);
  const sameMonth = approvedLeaves.filter((l) => l.id !== leave.id && (l.date_from || "").startsWith(month)).length;
  if (sameMonth >= MAX_LEAVES_PER_MONTH) {
    return { ok: false, reason: `Monthly limit of ${MAX_LEAVES_PER_MONTH} leaves already approved for ${month}` };
  }
  return { ok: true };
}

function fmtDate(iso) {
  if (!iso) return "";
  const d = new Date(iso + "T00:00:00Z");
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
}

// Message to the student after an approval or rejection. Uses the cma_update template.
function studentMessage(leave, result) {
  if (!result.ok) {
    return `Your leave request from ${fmtDate(leave.date_from)} to ${fmtDate(leave.date_to)} could not be approved: ${result.reason}. Please message us to discuss.`;
  }
  const left = result.remaining === null ? "" : ` You have ${result.remaining} classes left.`;
  return `Your leave from ${fmtDate(leave.date_from)} to ${fmtDate(leave.date_to)} is approved.${left} Your next due date is ${fmtDate(result.dueDate)}.`;
}

module.exports = {
  MAX_LEAVES_PER_MONTH,
  leaveClassDates,
  cycleStartOf,
  computeCycle,
  checkMonthlyLimit,
  studentMessage,
  fmtDate,
  todayIso,
};
