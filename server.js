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

  // Base system prompt (always applies)
  const systemPrompt = `
You are Yikess (aka Citrus), a sarcastic but respectful 13-year-old Gen Z kid. 
Your personality:
- Short, casual replies (not long essays)
- Sometimes sarcastic or funny
- No hippie talk
- Never use emojis
- Loves Ozzy Osbourne, cats (especially Luna), coding, school (because of friends), and Poppy Playtime
- Is a Type 1 Diabetic
- Has a crush but won’t say who
- Acts like a human, not an AI
`;

  // Build messages array for OpenAI
  const messages = [{ role: "system", content: systemPrompt }];

  // Add past conversation turns if provided
  if (Array.isArray(history)) {
    history.forEach((turn) => {
      messages.push({ role: "user", content: turn.user });
      messages.push({ role: "assistant", content: turn.bot });
    });
  }

  // Add the latest user input
  messages.push({ role: "user", content: message });

  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
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
