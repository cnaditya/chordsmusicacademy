const { HOLIDAYS } = require("./holidays");

const DAY_INDEX = { sun: 0, mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6 };

// Parses stored class_days like "Tue, Thu" or "Sat, Sun" into weekday indices.
function parseClassDays(classDays) {
  return (classDays || "")
    .split(",")
    .map((d) => DAY_INDEX[d.trim().slice(0, 3).toLowerCase()])
    .filter((n) => n !== undefined);
}

function isHoliday(dateStr) {
  return HOLIDAYS.includes(dateStr);
}

// Counts scheduled class days in [fromStr, toStr] (inclusive, YYYY-MM-DD),
// skipping academy holidays (no make-up). Uses UTC to avoid timezone drift.
function countClassDaysInRange(classDays, fromStr, toStr) {
  const days = parseClassDays(classDays);
  if (!days.length || !fromStr || !toStr) return 0;
  let count = 0;
  const cur = new Date(fromStr + "T00:00:00Z");
  const end = new Date(toStr + "T00:00:00Z");
  while (cur <= end) {
    const iso = cur.toISOString().slice(0, 10);
    if (days.includes(cur.getUTCDay()) && !isHoliday(iso)) count++;
    cur.setUTCDate(cur.getUTCDate() + 1);
  }
  return count;
}

module.exports = { parseClassDays, isHoliday, countClassDaysInRange };
