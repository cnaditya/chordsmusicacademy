// Live YouTube channel/video stats for Telugu Piano Teacher (adityananda2208@gmail.com).
// Credentials come from Netlify environment variables — never sent to the browser
// or embedded in any cloud routine prompt. Same auth pattern as ads-report.js.

async function getAccessToken() {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.YOUTUBE_CLIENT_ID,
      client_secret: process.env.YOUTUBE_CLIENT_SECRET,
      refresh_token: process.env.YOUTUBE_REFRESH_TOKEN,
      grant_type: "refresh_token",
    }),
  });
  const data = await res.json();
  if (!data.access_token) throw new Error("Failed to get access token: " + JSON.stringify(data));
  return data.access_token;
}

async function get(url, token) {
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) throw new Error(`YouTube API error ${res.status}: ${await res.text()}`);
  return res.json();
}

exports.handler = async function (event) {
  const token = event.headers["x-ads-token"] || "";
  if (!token || token !== process.env.ADS_DASHBOARD_PASSWORD) {
    return { statusCode: 401, body: JSON.stringify({ error: "Unauthorized" }) };
  }

  try {
    const accessToken = await getAccessToken();

    const maxResults = Math.min(parseInt((event.queryStringParameters || {}).count) || 5, 20);

    const channelData = await get(
      "https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics,contentDetails&mine=true",
      accessToken
    );
    const channel = channelData.items[0];
    const uploadsPlaylist = channel.contentDetails.relatedPlaylists.uploads;

    const playlistData = await get(
      `https://www.googleapis.com/youtube/v3/playlistItems?part=contentDetails&playlistId=${uploadsPlaylist}&maxResults=${maxResults}`,
      accessToken
    );
    const videoIds = playlistData.items.map((item) => item.contentDetails.videoId).join(",");

    const videosData = await get(
      `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&id=${videoIds}`,
      accessToken
    );

    const videos = videosData.items.map((v) => ({
      title: v.snippet.title,
      published: v.snippet.publishedAt.slice(0, 10),
      views: parseInt(v.statistics.viewCount || "0"),
      likes: parseInt(v.statistics.likeCount || "0"),
      comments: parseInt(v.statistics.commentCount || "0"),
    }));

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
      body: JSON.stringify({
        channel: {
          title: channel.snippet.title,
          subscribers: parseInt(channel.statistics.subscriberCount || "0"),
          totalViews: parseInt(channel.statistics.viewCount || "0"),
          videoCount: parseInt(channel.statistics.videoCount || "0"),
        },
        recentVideos: videos,
      }),
    };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
