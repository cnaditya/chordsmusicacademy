// Normalizes a phone number to international format with no leading "+"
// (e.g. "9876543210" -> "919876543210"). Returns null if the input doesn't
// look like a usable phone number.
function normalizePhone(phone) {
  let p = String(phone || "").replace(/\D/g, "");
  if (!p || p.length < 7) return null;
  if (p.length === 10) p = "91" + p;
  else if (p.startsWith("0") && p.length === 11) p = "91" + p.slice(1);
  return p;
}

module.exports = { normalizePhone };
