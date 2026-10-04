// Sends a WhatsApp alert via Meta's direct Cloud API (not AiSensy).
// Used by the scheduled Ads-monitoring routine to message Aaditya proactively.
// Credentials come from Netlify environment variables — never sent to the browser.
// Reuses ADS_DASHBOARD_PASSWORD as the caller auth token since this is only ever
// invoked by the same trusted routine that reads the ads dashboard.

const API_VERSION = "v23.0";
const TEMPLATE_NAME = "cma_alert";
const TEMPLATE_LANGUAGE = "en_US";

exports.handler = async function (event) {
  const token = event.headers["x-ads-token"] || "";
  if (!token || token !== process.env.ADS_DASHBOARD_PASSWORD) {
    return { statusCode: 401, body: JSON.stringify({ error: "Unauthorized" }) };
  }

  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  let message, to;
  try {
    const parsed = JSON.parse(event.body || "{}");
    message = parsed.message;
    to = parsed.to || process.env.WHATSAPP_ALERT_RECIPIENT;
  } catch (e) {
    return { statusCode: 400, body: JSON.stringify({ error: "Invalid JSON body" }) };
  }

  if (!message || !to) {
    return { statusCode: 400, body: JSON.stringify({ error: "Missing message or recipient" }) };
  }

  // WhatsApp template variables reject line breaks, tabs and long runs of spaces,
  // and cap the length, so flatten the text and keep it under the limit.
  message = String(message).replace(/\s+/g, " ").trim().slice(0, 900);

  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;

  const res = await fetch(
    `https://graph.facebook.com/${API_VERSION}/${phoneNumberId}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to,
        type: "template",
        template: {
          name: TEMPLATE_NAME,
          language: { code: TEMPLATE_LANGUAGE },
          components: [
            {
              type: "body",
              parameters: [{ type: "text", text: message }],
            },
          ],
        },
      }),
    }
  );

  const data = await res.json();
  if (!res.ok) {
    return { statusCode: res.status, body: JSON.stringify({ error: data }) };
  }

  return { statusCode: 200, body: JSON.stringify({ ok: true, result: data }) };
};
