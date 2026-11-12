const crypto = require("crypto");
exports.handler = async () => {
  const KEY_ID = process.env.RAZORPAY_KEY_ID || "";
  const KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || "";
  const hash = (s) => crypto.createHash("sha256").update(s).digest("hex");
  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      key_id_present: !!KEY_ID,
      key_id_len: KEY_ID.length,
      key_id_hash: hash(KEY_ID),
      key_id_hash_matches_expected: hash(KEY_ID) === "5a5727f271c3fd02beaa6dac118fae80cb6aeba63edbe07a1f52e7aec186353f",
      key_secret_present: !!KEY_SECRET,
      key_secret_len: KEY_SECRET.length,
      key_secret_hash_matches_expected: hash(KEY_SECRET) === "76956ef34d3a62b28fa56edcce5418f38b7e364385c1a196dbfa327a525809cd",
    }),
  };
};
