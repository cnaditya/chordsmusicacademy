const Anthropic = require("@anthropic-ai/sdk");

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

exports.handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json",
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }

  try {
    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: `You are a music expert. List the 6 most popular/trending songs RIGHT NOW for each of these languages: Telugu, Hindi, Tamil, English.

Return ONLY a valid JSON object in this exact format, no extra text:
{
  "Telugu": [
    {"song": "Song Name", "movie": "Movie/Album Name", "artist": "Singer Name"},
    ...6 songs
  ],
  "Hindi": [...6 songs],
  "Tamil": [...6 songs],
  "English": [...6 songs]
}

Focus on songs that are trending in 2024-2025. Include a mix of film songs and independent releases. For English include current global hits.`,
        },
      ],
    });

    const text = message.content[0].text.trim();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Invalid response format");

    const songs = JSON.parse(jsonMatch[0]);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true, songs }),
    };
  } catch (error) {
    console.error("Error:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: error.message,
        songs: {
          Telugu: [
            { song: "Samajavaragamana", movie: "Ala Vaikunthapurramuloo", artist: "Sid Sriram" },
            { song: "Buttabomma", movie: "Ala Vaikunthapurramuloo", artist: "Armaan Malik" },
            { song: "Naatu Naatu", movie: "RRR", artist: "Rahul Sipligunj" },
            { song: "Srivalli", movie: "Pushpa", artist: "Sid Sriram" },
            { song: "Oo Antava", movie: "Pushpa", artist: "Indravathi Chauhan" },
            { song: "Kaacha Badam", movie: "Independent", artist: "Bhuban Badyakar" },
          ],
          Hindi: [
            { song: "Tum Se", movie: "Sanam Teri Kasam", artist: "Arijit Singh" },
            { song: "Kesariya", movie: "Brahmastra", artist: "Arijit Singh" },
            { song: "Raataan Lambiyan", movie: "Shershaah", artist: "Jubin Nautiyal" },
            { song: "Apna Bana Le", movie: "Bhediya", artist: "Arijit Singh" },
            { song: "Tere Vaaste", movie: "Zara Hatke Zara Bachke", artist: "Varun Jain" },
            { song: "Teri Baaton Mein", movie: "Teri Baaton Mein Aisa Uljha Jiya", artist: "Asees Kaur" },
          ],
          Tamil: [
            { song: "Kaavaalaa", movie: "Jailer", artist: "Anirudh" },
            { song: "Ranjithame", movie: "Varisu", artist: "Vijay Yesudas" },
            { song: "Arabic Kuthu", movie: "Beast", artist: "Anirudh" },
            { song: "Chellamma", movie: "Doctor", artist: "Leon James" },
            { song: "Rowdy Baby", movie: "Maari 2", artist: "Dhanush" },
            { song: "Kannaana Kanney", movie: "Viswasam", artist: "D. Imman" },
          ],
          English: [
            { song: "Flowers", movie: "Single", artist: "Miley Cyrus" },
            { song: "Unholy", movie: "Single", artist: "Sam Smith & Kim Petras" },
            { song: "As It Was", movie: "Single", artist: "Harry Styles" },
            { song: "Shivers", movie: "Single", artist: "Ed Sheeran" },
            { song: "Stay", movie: "Single", artist: "The Kid LAROI & Justin Bieber" },
            { song: "Blinding Lights", movie: "Single", artist: "The Weeknd" },
          ],
        },
      }),
    };
  }
};
