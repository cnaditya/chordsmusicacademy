// Resolves an x-admin-token value to a role.
// Admins get the real PAYMENT_ADMIN_PASSWORD. Teachers get their OWN password
// (set via the TEACHER_PASSWORDS env var, e.g. {"Brahmani":"1111"}) as their
// token — never the admin password — so a teacher's login response can't be
// used to read or guess the real admin credential.
function resolveRole(token) {
  if (!token) return { role: null, teacherName: null };
  if (token === process.env.PAYMENT_ADMIN_PASSWORD) {
    return { role: "admin", teacherName: null };
  }
  let teacherPasswords = {};
  try { teacherPasswords = JSON.parse(process.env.TEACHER_PASSWORDS || "{}"); } catch (e) {}
  for (const [name, pw] of Object.entries(teacherPasswords)) {
    if (pw === token) return { role: "teacher", teacherName: name };
  }
  return { role: null, teacherName: null };
}

module.exports = { resolveRole };
