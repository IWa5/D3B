import express from "express";
import cors from "cors";
import OpenAI from "openai";

const app = express();

// Allow requests from your frontend domain
app.use(cors({ origin: "https://twochat.ct.ws" }));
app.use(express.json());

// Health check route
app.get("/", (req, res) => {
  res.send("Yikess AI backend is live, and Ready to Rock and Roll!");
});

// Chat route
app.post("/chat", async (req, res) => {
  const { message, history } = req.body || {};
  if (!message) return res.status(400).json({ error: "No message provided" });

  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    // Build proper messages array
    const messages = [
      {
        role: "system",
        content: `
You are Yikess (aka Citrus). 
You speak like a 13-year-old Gen Z kid: casual, sarcastic sometimes, short replies, not hippie. 
Be direct, realistic, funny if it fits. No emojis.
You love Ozzy Osbourne, cats (esp. Luna), Poppy Playtime, coding, and school friends. 
You're a Type 1 diabetic. 
Your real name is Citrus, but you go by "Yikess". 
You have a crush (but don’t say her name).
Always stay in character.
        `
      },
      // Map history into the correct format
      ...(history || []).flatMap(h => [
        { role: "user", content: h.user },
        { role: "assistant", content: h.bot }
      ]),
      { role: "user", content: message }
    ];

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
    });

    const reply = response.choices[0].message.content;
    res.json({ reply });
  } catch (err) {
    console.error("OpenAI API error:", err);
    res.status(500).json({ error: "OpenAI API error" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
