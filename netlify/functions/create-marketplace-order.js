// Creates a Razorpay order for a marketplace item. Price is looked up server-side
// from ITEMS (never trusted from the client) so a buyer can't tamper with the amount.
const ITEMS = {
  "volt-876": {
    title: "Universal Audio Volt 876 Audio Interface",
    price: 62000, // INR
  },
};

exports.handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Content-Type": "application/json",
  };

  if (event.httpMethod === "OPTIONS") return { statusCode: 200, headers, body: "" };
  if (event.httpMethod !== "POST") return { statusCode: 405, headers, body: JSON.stringify({ error: "Method not allowed" }) };

  try {
    const { item_slug } = JSON.parse(event.body || "{}");
    const item = ITEMS[item_slug];
    if (!item) return { statusCode: 400, headers, body: JSON.stringify({ error: "Unknown item" }) };

    const KEY_ID = process.env.RAZORPAY_KEY_ID;
    const KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;
    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_KEY = process.env.SUPABASE_SECRET_KEY;

    const credentials = Buffer.from(`${KEY_ID}:${KEY_SECRET}`).toString("base64");
    const res = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Basic ${credentials}` },
      body: JSON.stringify({
        amount: item.price * 100,
        currency: "INR",
        notes: { item_slug, title: item.title },
      }),
    });
    const order = await res.json();
    if (!res.ok) throw new Error(order.error?.description || "Razorpay error");

    await fetch(`${SUPABASE_URL}/rest/v1/marketplace_orders`, {
      method: "POST",
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify({
        item_slug,
        razorpay_order_id: order.id,
        amount: item.price,
        status: "created",
      }),
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ order_id: order.id, amount: item.price * 100, key_id: KEY_ID, title: item.title }),
    };
  } catch (e) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: String(e.message || e) }) };
  }
};
