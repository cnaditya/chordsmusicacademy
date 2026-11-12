const crypto = require("crypto");

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
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      buyer_name,
      buyer_phone,
      buyer_email,
      buyer_address,
    } = JSON.parse(event.body || "{}");

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: "Missing payment fields" }) };
    }

    const KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;
    const expected = crypto
      .createHmac("sha256", KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expected !== razorpay_signature) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: "Signature verification failed" }) };
    }

    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_KEY = process.env.SUPABASE_SECRET_KEY;

    await fetch(`${SUPABASE_URL}/rest/v1/marketplace_orders?razorpay_order_id=eq.${encodeURIComponent(razorpay_order_id)}`, {
      method: "PATCH",
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify({
        razorpay_payment_id,
        status: "paid",
        buyer_name: buyer_name || null,
        buyer_phone: buyer_phone || null,
        buyer_email: buyer_email || null,
        buyer_address: buyer_address || null,
      }),
    });

    return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };
  } catch (e) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: String(e.message || e) }) };
  }
};
