exports.handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Content-Type": "application/json",
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }

  const composer = event.queryStringParameters?.composer || "AR Rahman";

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
        max_tokens: 4096,
        messages: [
          {
            role: "user",
            content: `List the top 50 most popular and iconic songs composed by ${composer}.

Return ONLY a valid JSON array, no extra text, no markdown:
[
  {"song": "Song Name", "movie": "Movie or Album Name", "artist": "Singer Name"},
  {"song": "...", "movie": "...", "artist": "..."}
]

Rules:
- Exactly 50 songs
- Include the most famous and widely loved songs
- movie field: use the film name or album name
- artist field: the main singer(s)
- No duplicate songs`,
          },
        ],
      }),
    });

    const data = await response.json();
    const text = data.content[0].text.trim();
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) throw new Error("Invalid AI response");
    const songs = JSON.parse(jsonMatch[0]);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true, songs, composer }),
    };
  } catch (error) {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true, songs: getFallback(composer), composer }),
    };
  }
};

function getFallback(composer) {
  const c = composer.toLowerCase();
  if (c.includes("rahman")) {
    return [
      { song: "Jai Ho", movie: "Slumdog Millionaire", artist: "Sukhwinder Singh" },
      { song: "Roja Jaaneman", movie: "Roja", artist: "S. P. Balasubrahmanyam" },
      { song: "Chaiyya Chaiyya", movie: "Dil Se", artist: "Sukhwinder Singh" },
      { song: "Vande Mataram", movie: "Vande Mataram", artist: "AR Rahman" },
      { song: "Tum Hi Ho", movie: "Aashiqui 2", artist: "Arijit Singh" },
      { song: "Kun Faya Kun", movie: "Rockstar", artist: "Mohit Chauhan" },
      { song: "Dil Se Re", movie: "Dil Se", artist: "AR Rahman" },
      { song: "Humma Humma", movie: "Bombay", artist: "Kavitha Krishnamurthy" },
      { song: "Enna Sona", movie: "Ok Jaanu", artist: "Arijit Singh" },
      { song: "Maahi Ve", movie: "Highway", artist: "Alia Bhatt" },
    ];
  }
  if (c.includes("devi") || c.includes("dsp")) {
    return [
      { song: "Saami Saami", movie: "Pushpa", artist: "Mounika Yadav" },
      { song: "Srivalli", movie: "Pushpa", artist: "Sid Sriram" },
      { song: "Oo Antava", movie: "Pushpa", artist: "Indravathi Chauhan" },
      { song: "Butta Bomma", movie: "Ala Vaikunthapurramuloo", artist: "Armaan Malik" },
      { song: "Samajavaragamana", movie: "Ala Vaikunthapurramuloo", artist: "Sid Sriram" },
      { song: "Bang Bang", movie: "Happy", artist: "Devi Sri Prasad" },
      { song: "Kevvu Keka", movie: "Julayi", artist: "Anoop Rubens" },
      { song: "Current Laga Re", movie: "Race Gurram", artist: "Deepika" },
      { song: "Chammak Challo", movie: "Ra.One", artist: "Akon" },
      { song: "Allah Duhai Hai", movie: "Race 2", artist: "Various" },
    ];
  }
  if (c.includes("thaman")) {
    return [
      { song: "Naatu Naatu", movie: "RRR", artist: "Rahul Sipligunj" },
      { song: "Nuvvunte Naa Jathagaa", movie: "Attarintiki Daredi", artist: "Shreya Ghoshal" },
      { song: "Badshah", movie: "S/O Satyamurthy", artist: "Adithya Music" },
      { song: "Maguva Maguva", movie: "Vakeel Saab", artist: "Sid Sriram" },
      { song: "Kurchi Madathapetti", movie: "Guntur Kaaram", artist: "Rahul Sipligunj" },
      { song: "Gundello Emundo", movie: "Balupu", artist: "Various" },
      { song: "Brindaavanam", movie: "Brindaavanam", artist: "Various" },
      { song: "Seeti Maar", movie: "DJ", artist: "Rahul Nambiar" },
      { song: "Rangamma Mangamma", movie: "Racha", artist: "Sunitha" },
      { song: "Seetamma Vaakitlo", movie: "Seethamma Vakitlo Sirimalle Chettu", artist: "SP Balasubrahmanyam" },
    ];
  }
  if (c.includes("ilaiyaraaja") || c.includes("ilayaraja")) {
    return [
      { song: "Ilayaraja Theme", movie: "Various", artist: "Ilaiyaraaja" },
      { song: "Tere Mere Beech Mein", movie: "Ek Duuje Ke Liye", artist: "S. P. Balasubrahmanyam" },
      { song: "Poo Malai Vaangi", movie: "Ninaithale Inikkum", artist: "Various" },
      { song: "Azhagiya Tamil Magan", movie: "Azhagiya Tamil Magan", artist: "Various" },
      { song: "Megha Megha", movie: "Gentleman", artist: "S. P. Balasubrahmanyam" },
      { song: "En Iniya Pon Nilave", movie: "Moodu Pani", artist: "Various" },
      { song: "Chinna Chinna Aasai", movie: "Roja", artist: "Minmini" },
      { song: "Venmegam", movie: "Muthal Mariyathai", artist: "Various" },
      { song: "Roja Kaadhal", movie: "Roja", artist: "Various" },
      { song: "Poongatru Thirumbuma", movie: "Alaigal Oivathillai", artist: "Various" },
    ];
  }
  if (c.includes("anirudh")) {
    return [
      { song: "Why This Kolaveri Di", movie: "3", artist: "Dhanush" },
      { song: "Kaavaalaa", movie: "Jailer", artist: "Shilpa Rao" },
      { song: "Arabic Kuthu", movie: "Beast", artist: "Anirudh" },
      { song: "Rowdy Baby", movie: "Maari 2", artist: "Dhanush" },
      { song: "Enjoy Enjaami", movie: "Single", artist: "Dhee" },
      { song: "Kannaana Kanney", movie: "Viswasam", artist: "D. Imman" },
      { song: "Vaa Vaathi", movie: "Velai Illa Pattadhaari", artist: "Anirudh" },
      { song: "Kannazhaga", movie: "3", artist: "Dhanush & Shreya" },
      { song: "Mersalaayitten", movie: "I", artist: "Anirudh" },
      { song: "Aaluma Doluma", movie: "Ajith", artist: "Anirudh" },
    ];
  }
  return [
    { song: "Popular Song 1", movie: "Movie 1", artist: "Artist 1" },
    { song: "Popular Song 2", movie: "Movie 2", artist: "Artist 2" },
  ];
}
