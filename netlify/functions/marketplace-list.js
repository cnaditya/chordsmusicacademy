// Public: returns active marketplace items (optionally filtered by category/search).
exports.handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Content-Type": "application/json",
  };
  if (event.httpMethod === "OPTIONS") return { statusCode: 200, headers, body: "" };

  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_KEY = process.env.SUPABASE_SECRET_KEY;

  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/marketplace_items?is_active=eq.true&order=created_at.desc&select=*`,
      { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } }
    );
    const items = await res.json();
    if (!res.ok) throw new Error(items.message || "Supabase error");
    return { statusCode: 200, headers, body: JSON.stringify({ items }) };
  } catch (e) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: String(e.message || e) }) };
  }
};
