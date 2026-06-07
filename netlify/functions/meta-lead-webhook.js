// Meta (Instagram / Facebook) Lead Ads webhook
// GET  → webhook verification handshake with Meta
// POST → new lead submitted on Instagram ad → save to Supabase crm_leads

exports.handler = async (event) => {
  const jsonHeaders = { "Content-Type": "application/json" };

  // ── Webhook verification ─────────────────────────────────────────────────
  // Meta sends a GET with hub.mode=subscribe to confirm the endpoint is ours
  if (event.httpMethod === "GET") {
    const p = event.queryStringParameters || {};
    if (p["hub.mode"] === "subscribe" && p["hub.verify_token"] === process.env.META_VERIFY_TOKEN) {
      return { statusCode: 200, headers: { "Content-Type": "text/plain" }, body: p["hub.challenge"] };
    }
    return { statusCode: 403, headers: jsonHeaders, body: JSON.stringify({ error: "Forbidden — verify token mismatch" }) };
  }

  // ── Lead received ────────────────────────────────────────────────────────
  if (event.httpMethod === "POST") {
    try {
      const body = JSON.parse(event.body || "{}");

      for (const entry of (body.entry || [])) {
        for (const change of (entry.changes || [])) {
          if (change.field !== "leadgen") continue;

          const { leadgen_id, form_id } = change.value || {};
          if (!leadgen_id) continue;

          // Fetch full lead details from Meta Graph API
          const metaRes = await fetch(
            `https://graph.facebook.com/v20.0/${leadgen_id}?access_token=${process.env.META_PAGE_ACCESS_TOKEN}`
          );
          const metaData = await metaRes.json();

          if (!metaData.field_data) {
            console.error("No field_data for lead", leadgen_id, JSON.stringify(metaData));
            continue;
          }

          // Map Meta form fields to our schema
          const f = {};
          (metaData.field_data || []).forEach(item => {
            f[item.name] = (item.values || [])[0] || "";
          });

          const full_name = f["full_name"] || f["name"] || "";
          const phone     = f["phone_number"] || f["phone"] || f["whatsapp_number"] || "";
          const email     = f["email"] || "";

          // Custom field: what they're enquiring about
          // In your Lead Ad form, name this question field: enquiry_type
          // Options you set: "Studio Rental", "Music Classes", "Both"
          const enquiry = f["enquiry_type"] || f["interested_in"] || f["i_am_interested_in"] || "";

          if (!full_name) continue;

          // Build notes string shown in CRM
          const noteParts = ["📱 Instagram Lead Ad"];
          if (enquiry) noteParts.push(`Enquiry: ${enquiry}`);
          if (form_id)  noteParts.push(`Form ID: ${form_id}`);

          // Determine mode tag for CRM filter
          // "studio" for studio leads, "online" for academy leads
          const isStudio = enquiry.toLowerCase().includes("studio");
          const crmMode  = isStudio ? "studio" : "online";

          const SUPABASE_URL = process.env.SUPABASE_URL;
          const SUPABASE_KEY = process.env.SUPABASE_SECRET_KEY;

          const saveRes = await fetch(`${SUPABASE_URL}/rest/v1/crm_leads`, {
            method: "POST",
            headers: {
              apikey: SUPABASE_KEY,
              Authorization: `Bearer ${SUPABASE_KEY}`,
              "Content-Type": "application/json",
              Prefer: "return=minimal",
            },
            body: JSON.stringify({
              full_name,
              phone,
              email,
              notes: noteParts.join(" | "),
              mode:   crmMode,
              status: "new",
            }),
          });

          if (saveRes.status >= 400) {
            const errText = await saveRes.text();
            console.error("Supabase insert error:", saveRes.status, errText);
          } else {
            console.log("Saved lead:", full_name, phone, crmMode);
          }
        }
      }

      // Meta requires a 200 response quickly — always return success
      return { statusCode: 200, headers: jsonHeaders, body: JSON.stringify({ success: true }) };

    } catch (err) {
      console.error("meta-lead-webhook error:", err);
      // Still return 200 so Meta doesn't retry infinitely
      return { statusCode: 200, headers: jsonHeaders, body: JSON.stringify({ received: true }) };
    }
  }

  return { statusCode: 405, headers: jsonHeaders, body: JSON.stringify({ error: "Method not allowed" }) };
};
