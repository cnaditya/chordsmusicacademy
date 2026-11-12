// Admin-only: add / update / delete / mark-sold marketplace items.
// Auth: x-admin-token header, same password as the rest of the CMA admin tools.
exports.handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, x-admin-token",
    "Content-Type": "application/json",
  };
  if (event.httpMethod === "OPTIONS") return { statusCode: 200, headers, body: "" };

  const adminToken = event.headers["x-admin-token"] || "";
  if (!adminToken || adminToken !== process.env.PAYMENT_ADMIN_PASSWORD) {
    return { statusCode: 401, headers, body: JSON.stringify({ error: "Unauthorized" }) };
  }

  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_KEY = process.env.SUPABASE_SECRET_KEY;
  const SB = { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`, "Content-Type": "application/json" };

  try {
    const body = JSON.parse(event.body || "{}");
    const { action } = body;

    if (action === "list_all") {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/marketplace_items?order=created_at.desc&select=*`, { headers: SB });
      const items = await res.json();
      return { statusCode: 200, headers, body: JSON.stringify({ items }) };
    }

    if (action === "add") {
      const { title, category, price, condition, description, images } = body;
      if (!title || !price) return { statusCode: 400, headers, body: JSON.stringify({ error: "title and price required" }) };
      const slug = title.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") + "-" + Date.now().toString(36);
      const res = await fetch(`${SUPABASE_URL}/rest/v1/marketplace_items`, {
        method: "POST",
        headers: { ...SB, Prefer: "return=representation" },
        body: JSON.stringify({
          slug, title, category: category || "other", price: Number(price),
          condition: condition || "", description: description || "",
          images: Array.isArray(images) ? images : (images ? [images] : []),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Insert failed");
      return { statusCode: 200, headers, body: JSON.stringify({ success: true, item: data[0] }) };
    }

    if (action === "update") {
      const { id, ...fields } = body;
      if (!id) return { statusCode: 400, headers, body: JSON.stringify({ error: "id required" }) };
      delete fields.action;
      const res = await fetch(`${SUPABASE_URL}/rest/v1/marketplace_items?id=eq.${encodeURIComponent(id)}`, {
        method: "PATCH", headers: { ...SB, Prefer: "return=minimal" }, body: JSON.stringify(fields),
      });
      if (!res.ok) throw new Error("Update failed");
      return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };
    }

    if (action === "delete") {
      const { id } = body;
      if (!id) return { statusCode: 400, headers, body: JSON.stringify({ error: "id required" }) };
      const res = await fetch(`${SUPABASE_URL}/rest/v1/marketplace_items?id=eq.${encodeURIComponent(id)}`, {
        method: "DELETE", headers: SB,
      });
      if (!res.ok) throw new Error("Delete failed");
      return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };
    }

    return { statusCode: 400, headers, body: JSON.stringify({ error: "Unknown action" }) };
  } catch (e) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: String(e.message || e) }) };
  }
};
