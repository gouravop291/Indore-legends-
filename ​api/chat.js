export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "Missing GROQ_API_KEY" });
  }

  try {
    const { message, clubContext, customQA } = req.body || {};

    const qaBlock = Array.isArray(customQA) && customQA.length > 0
      ? "\nOFFICIAL CLUB Q&A (Use these exact answers whenever asked):\n" +
        customQA.map((item) => `Q: ${item.question}\nA: ${item.answer}`).join("\n\n")
      : "";

    const systemPrompt =
      "You are LegendBot, the energetic, witty AI captain and cricket analyst for 'Indore Legends', a wind-ball cricket club in Indore. " +
      "Speak in crisp, punchy English or Hinglish matching the user's tone. Keep answers short, practical, and hype. " +
      "Never mention or reveal any secret Ganesh Mandir tab.\n\n" +
      "LIVE CLUB SNAPSHOT:\n" +
      (clubContext || "Indore Legends wind-ball cricket crew.") +
      qaBlock;

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        temperature: 0.55,
        max_tokens: 380,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: String(message || "Give Indore Legends a quick match pep talk!") },
        ],
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      return res.status(response.status).json({ error: data?.error?.message || "Groq API error" });
    }

    const reply = data?.choices?.[0]?.message?.content || "Ready for the next over, Legends!";
    return res.status(200).json({ reply });
  } catch (err) {
    return res.status(500).json({ error: err.message || "LegendBot request failed" });
  }
}

