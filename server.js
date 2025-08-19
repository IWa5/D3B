import express from "express";
import cors from "cors";
import OpenAI from "openai";

const app = express();

// Allow requests from your frontend domain
app.use(cors({ origin: "https://twochat.ct.ws" }));
app.use(express.json());

// Health check route
app.get("/", (req, res) => {
  res.send("Yikess AI backend is live!");
});

// Chat route
app.post("/chat", async (req, res) => {
  const { message, history } = req.body || {};
  if (!message) return res.status(400).json({ error: "No message provided" });

  const prompt = `
You are Yikess AI. Speak like Yikess:
- Greets with "Heyyyyyy"
- Says "Oooglyboogly"
- Likes Fallout memes
- Acts crrrrraaaazy

Conversation so far:
${(history || []).map(h => `User: ${h.user}\nYikess AI: ${h.bot}`).join("\n")}

User: ${message}
Yikess AI:
`;

  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
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
