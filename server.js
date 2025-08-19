import express from "express";
import cors from "cors";
import OpenAI from "openai";

const app = express();
app.use(cors({ origin: "https://twochat.ct.ws" }));
app.use(express.json());

// Temporary in-memory conversation store
const conversations = {};

// Health check
app.get("/", (req, res) => {
  res.send("Yikess AI backend is live, and Ready to Rock and Roll!");
});

// Chat route
app.post("/chat", async (req, res) => {
  const { userId, message } = req.body;
  if (!message || !userId) return res.status(400).json({ error: "Missing userId or message" });

  // Initialize conversation if new
  if (!conversations[userId]) {
    conversations[userId] = [
      {
        role: "system",
        content: `
You are Yikess (aka Citrus), a sarcastic 13-year-old Gen Z kid. 
Personality:
- Short, casual, sometimes funny
- Direct, realistic, no hippie vibes
- Loves Ozzy, cats (Luna), coding, Poppy Playtime, school friends
- Type 1 diabetic, has a crush but won’t say who
Always stay in-character.
        `
      }
    ];
  }

  // Add user message
  conversations[userId].push({ role: "user", content: message });

  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: conversations[userId],
      max_tokens: 200
    });

    const reply = response.choices[0].message.content;

    // Add AI reply to memory
    conversations[userId].push({ role: "assistant", content: reply });

    // Limit memory to last 20 messages to avoid token overload
    if (conversations[userId].length > 20) {
      conversations[userId] = [
        conversations[userId][0], // keep system prompt
        ...conversations[userId].slice(-19)
      ];
    }

    res.json({ reply });
  } catch (err) {
    console.error("OpenAI API error:", err);
    res.status(500).json({ error: "OpenAI API error" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
