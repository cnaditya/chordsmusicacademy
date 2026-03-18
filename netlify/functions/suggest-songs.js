exports.handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Content-Type": "application/json",
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 1024,
        messages: [
          {
            role: "user",
            content: `You are a music expert. List 6 popular/trending songs for each language: Telugu, Hindi, Tamil, English.

Return ONLY valid JSON, no extra text:
{
  "Telugu": [{"song":"Song Name","movie":"Movie/Album","artist":"Singer"},{"song":"...","movie":"...","artist":"..."},{"song":"...","movie":"...","artist":"..."},{"song":"...","movie":"...","artist":"..."},{"song":"...","movie":"...","artist":"..."},{"song":"...","movie":"...","artist":"..."}],
  "Hindi": [6 songs same format],
  "Tamil": [6 songs same format],
  "English": [6 songs same format]
}

Include popular 2024-2025 songs. Telugu & Tamil: film songs. Hindi: Bollywood hits. English: global pop hits.`,
          },
        ],
      }),
    });

    const data = await response.json();
    const text = data.content[0].text.trim();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Invalid AI response");
    const songs = JSON.parse(jsonMatch[0]);

    return { statusCode: 200, headers, body: JSON.stringify({ success: true, songs }) };
  } catch (error) {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
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
            { song: "Kesariya", movie: "Brahmastra", artist: "Arijit Singh" },
            { song: "Raataan Lambiyan", movie: "Shershaah", artist: "Jubin Nautiyal" },
            { song: "Tere Vaaste", movie: "Zara Hatke Zara Bachke", artist: "Varun Jain" },
            { song: "Apna Bana Le", movie: "Bhediya", artist: "Arijit Singh" },
            { song: "Teri Baaton Mein", movie: "Teri Baaton Mein", artist: "Asees Kaur" },
            { song: "Naina", movie: "Crew", artist: "Diljit Dosanjh" },
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
            { song: "As It Was", movie: "Single", artist: "Harry Styles" },
            { song: "Shivers", movie: "Single", artist: "Ed Sheeran" },
            { song: "Blinding Lights", movie: "Single", artist: "The Weeknd" },
            { song: "Stay", movie: "Single", artist: "The Kid LAROI & Justin Bieber" },
            { song: "Unholy", movie: "Single", artist: "Sam Smith" },
          ],
        },
      }),
    };
  }
};
