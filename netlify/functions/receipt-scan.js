// Scans a receipt image using Claude vision and extracts student/payment data
exports.handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, x-admin-token",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Content-Type": "application/json",
  };

  if (event.httpMethod === "OPTIONS") return { statusCode: 200, headers, body: "" };

  const adminToken = event.headers["x-admin-token"] || "";
  if (!adminToken || adminToken !== process.env.PAYMENT_ADMIN_PASSWORD) {
    return { statusCode: 401, headers, body: JSON.stringify({ error: "Unauthorized" }) };
  }

  const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
  if (!ANTHROPIC_API_KEY) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: "ANTHROPIC_API_KEY not configured in Netlify env vars" }) };
  }

  try {
    let body = {};
    try { body = JSON.parse(event.body || "{}"); } catch { body = {}; }
    const { image, mimeType = "image/jpeg" } = body;

    if (!image) return { statusCode: 400, headers, body: JSON.stringify({ error: "image base64 required" }) };

    const prompt = `You are reading a music academy fee receipt or bill. Extract the following fields and return ONLY valid JSON — no markdown, no explanation, just the JSON object.

{
  "receipt_number": "string or null",
  "student_name": "string or null",
  "amount": number or null,
  "date": "YYYY-MM-DD or null",
  "instrument": "string or null",
  "months": number or null,
  "towards": "raw text from the receipt for the 'Towards' field, or null"
}

Rules:
- amount: numeric rupees value only (no currency symbols, no commas) — read from "Rs." line or written words
- date: convert any format to YYYY-MM-DD. Examples: "26-04-26" → "2026-04-26", "26/04/2026" → "2026-04-26". Two-digit years starting with 2 are 20xx.
- months: extract from the Towards field — "3 months" → 3, "6 months" → 6, "1 year" → 12, "monthly" → 1. null if not clear.
- instrument: extract from Towards field. Common ones: Piano, Keyboard, Guitar, Violin, Drums, Vocals, Flute. Return the exact instrument name.
- student_name: the name written after "Received with thanks from"
- receipt_number: the receipt/bill number printed on the form
- If a field is unclear or not present, use null`;

    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 512,
        messages: [{
          role: "user",
          content: [
            {
              type: "image",
              source: { type: "base64", media_type: mimeType, data: image },
            },
            { type: "text", text: prompt },
          ],
        }],
      }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error?.message || `Claude API error ${res.status}`);

    const text = data.content?.[0]?.text || "";
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Could not parse receipt — unexpected Claude response");

    const extracted = JSON.parse(jsonMatch[0]);
    return { statusCode: 200, headers, body: JSON.stringify({ success: true, data: extracted }) };

  } catch (err) {
    console.error("receipt-scan error:", err);
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};
