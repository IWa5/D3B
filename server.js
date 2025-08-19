import express from "express";
import cors from "cors";
import OpenAI from "openai";

const app = express();
app.use(cors());
app.use(express.json());

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.post("/chat", async (req, res) => {
  const { message, history } = req.body;

  const prompt = `
You are Yikess AI. Speak like Yikess:
- Greets with "Heyyyyyy"
- Says "Oooglyboogly"
- Likes Fallout memes
- Acts crrrrraaaazy
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

Here is the conversation so far:
${history.map(h => `User: ${h.user}\nYikess AI: ${h.bot}`).join("\n")}

User: ${message}
Yikess AI:
`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
    });

    res.json({ reply: response.choices[0].message.content });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "API Error" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
