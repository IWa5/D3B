app.post("/chat", async (req, res) => {
  const { message, history } = req.body || {};
  console.log("Incoming request:", req.body); // <--- log the request

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
    console.log("Reply generated:", reply); // <--- log output
    res.json({ reply });
  } catch (err) {
    console.error("OpenAI API error:", err);
    res.status(500).json({ error: "OpenAI API error" });
  }
});
