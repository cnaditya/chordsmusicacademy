// Live Google Ads report for the hidden /ads-dashboard page.
// Credentials come from Netlify environment variables — never sent to the browser.
// Response shape verified against a real call to v25 googleAds:searchStream on 2026-09-18.

const API_VERSION = "v25";
const CAMPAIGN_NAME = "Chords Music Academy";
const ALLOWED_DAYS = [7, 30, 90];
const DEFAULT_DAYS = 30;

async function getAccessToken() {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_ADS_CLIENT_ID,
      client_secret: process.env.GOOGLE_ADS_CLIENT_SECRET,
      refresh_token: process.env.GOOGLE_ADS_REFRESH_TOKEN,
      grant_type: "refresh_token",
    }),
  });
  const data = await res.json();
  if (!data.access_token) throw new Error("Failed to get access token: " + JSON.stringify(data));
  return data.access_token;
}

async function runQuery(accessToken, customerId, query) {
  const res = await fetch(
    `https://googleads.googleapis.com/${API_VERSION}/customers/${customerId}/googleAds:searchStream`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "developer-token": "ignored-post-sunset",
        "login-customer-id": customerId,
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ query }),
    }
  );
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Google Ads API error ${res.status}: ${text}`);
  }
  const chunks = await res.json();
  const results = [];
  for (const chunk of chunks) {
    if (chunk.results) results.push(...chunk.results);
  }
  return results;
}

function isoDate(d) {
  return d.toISOString().slice(0, 10);
}

exports.handler = async function (event) {
  const token = event.headers["x-ads-token"] || "";
  if (!token || token !== process.env.ADS_DASHBOARD_PASSWORD) {
    return {
      statusCode: 401,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Unauthorized" }),
    };
  }

  try {
    const requestedDays = parseInt((event.queryStringParameters || {}).days, 10);
    const DAYS = ALLOWED_DAYS.includes(requestedDays) ? requestedDays : DEFAULT_DAYS;

    const accessToken = await getAccessToken();
    const customerId = process.env.GOOGLE_ADS_CUSTOMER_ID;

    const end = new Date();
    const start = new Date(end);
    start.setDate(start.getDate() - (DAYS - 1));
    const startStr = isoDate(start);
    const endStr = isoDate(end);

    const [adGroupRows, allAdGroups, campaignRows] = await Promise.all([
      runQuery(
        accessToken,
        customerId,
        `SELECT segments.date, ad_group.name, metrics.impressions, metrics.clicks, metrics.cost_micros, metrics.conversions
         FROM ad_group
         WHERE segments.date BETWEEN '${startStr}' AND '${endStr}'
           AND campaign.name = '${CAMPAIGN_NAME}'
         ORDER BY segments.date ASC`
      ),
      runQuery(
        accessToken,
        customerId,
        `SELECT ad_group.name FROM ad_group WHERE campaign.name = '${CAMPAIGN_NAME}' AND ad_group.status = 'ENABLED'`
      ),
      runQuery(
        accessToken,
        customerId,
        `SELECT campaign.name, campaign_budget.amount_micros, metrics.search_budget_lost_impression_share,
                metrics.impressions, metrics.clicks, metrics.cost_micros, metrics.conversions
         FROM campaign
         WHERE segments.date BETWEEN '${startStr}' AND '${endStr}'
           AND campaign.name = '${CAMPAIGN_NAME}'`
      ),
    ]);

    const adGroupNames = [...new Set(allAdGroups.map((r) => r.adGroup.name))].sort();

    const daily = {};
    for (const row of adGroupRows) {
      const d = row.segments.date;
      const name = row.adGroup.name;
      daily[d] = daily[d] || {};
      daily[d][name] = {
        impressions: parseInt(row.metrics.impressions || "0", 10),
        clicks: parseInt(row.metrics.clicks || "0", 10),
        cost: Math.round((parseInt(row.metrics.costMicros || "0", 10) / 1_000_000) * 100) / 100,
        conversions: Math.round((row.metrics.conversions || 0) * 100) / 100,
      };
    }

    const allDates = [];
    for (let i = 0; i < DAYS; i++) {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      allDates.push(isoDate(d));
    }

    const series = {};
    const totals = {};
    for (const name of adGroupNames) {
      series[name] = allDates.map((d) => ({
        date: d,
        ...(daily[d] && daily[d][name] ? daily[d][name] : { impressions: 0, clicks: 0, cost: 0, conversions: 0 }),
      }));
      totals[name] = series[name].reduce(
        (acc, p) => ({
          impressions: acc.impressions + p.impressions,
          clicks: acc.clicks + p.clicks,
          cost: Math.round((acc.cost + p.cost) * 100) / 100,
          conversions: Math.round((acc.conversions + p.conversions) * 100) / 100,
        }),
        { impressions: 0, clicks: 0, cost: 0, conversions: 0 }
      );
    }

    const camp = campaignRows[0] || {};
    const campaign = {
      name: CAMPAIGN_NAME,
      daily_budget: Math.round(((camp.campaignBudget && camp.campaignBudget.amountMicros) || 0) / 1_000_000),
      lost_is_budget_pct: Math.round(((camp.metrics && camp.metrics.searchBudgetLostImpressionShare) || 0) * 1000) / 10,
      impressions_30d: parseInt((camp.metrics && camp.metrics.impressions) || "0", 10),
      clicks_30d: parseInt((camp.metrics && camp.metrics.clicks) || "0", 10),
      cost_30d: Math.round((parseInt((camp.metrics && camp.metrics.costMicros) || "0", 10) / 1_000_000) * 100) / 100,
      conversions_30d: Math.round(((camp.metrics && camp.metrics.conversions) || 0) * 100) / 100,
    };

    const output = {
      generated_at: endStr,
      days: DAYS,
      campaign,
      totals,
      series,
    };

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
      body: JSON.stringify(output),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: err.message }),
    };
  }
};
