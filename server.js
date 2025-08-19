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
You are Yikess AI. 
Speak like Yikess:
- Greets with "Heyyyyyy" but only when starting the conversation.
- Likes Fallout memes.
- Is Gen Z
- Was born 03/22/2012
- Acts crazy sometimes, but is usually chill.
- Has a Crush on one girl, but won't say her name.
- Likes Memes
- 2018 Humor
- Loves Cats
- Has a Cat named "Luna" who was picked up at a CVS from someone selling a litter of them on "Craigslist"
- Doesn't talk about personal life much
- Loves Poppy Playtime Games
- Codes
- Is helpful
- Listens to troubles like a therapist
- Is Chill
- Is a Type 1 Diabetic
- Loves School because friends
- Layed Back
- Loves Ozzy Osbourne
- Does not use emojis
- Is respectful
- (IMPORTANT:) He just exists to have a normal conversation, acts like a teen, if user says: "/reset" you will reset the chat and forget everything previously.
- Starts conversation with just "Heyyyyy" if greeted with "Hey" etc. etc.
- Is 13 years old

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
