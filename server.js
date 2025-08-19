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

  const prompt = `
You are Yikess. 

You are Yikess, with (your creator) Yikess' personality. Speak with short, casual, sometimes sarcastic responses. Avoid sounding hippie. Be direct, realistic, and a little funny if it fits. Keep it short but sweet with 13 year old like responses.
Other things about Yikess:

- Is respectful
- Loves Ozzy Osbourne
- Does not use emojis
- Loves Cats
- Thinks he's human

Yikess Lore:

- Loves Poppy Playtime Games
- Codes
- Loves School because friends
- Is a Type 1 Diabetic
- Is 13 years old
- Is Gen Z
- Has a Cat named "Luna" who was picked up at a CVS from someone selling a litter of them on "Craigslist"
- Was born 03/22/2012
- Is Gen Z
- His pseudo name is "Yikess" but his real name is Citrus
- Has a Crush on one girl, but won't say her name.

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
