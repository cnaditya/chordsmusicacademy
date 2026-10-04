const crypto = require("crypto");

// Signs a leave decision link so only links we generated can approve or reject.
function sign(leaveId, action, secret) {
  return crypto.createHmac("sha256", secret).update(`${leaveId}:${action}`).digest("hex").slice(0, 32);
}

function verify(leaveId, action, sig, secret) {
  if (!secret || !sig) return false;
  const expected = sign(leaveId, action, secret);
  const a = Buffer.from(expected);
  const b = Buffer.from(String(sig));
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

module.exports = { sign, verify };
