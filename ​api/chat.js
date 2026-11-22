export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const groqKey = process.env.GROQ_API_KEY;
  if (!groqKey) {
    return res.status(500).json({ error: "Missing GROQ_API_KEY in Vercel Environment Variables." });
  }

  try {
    const { message, clubContext, customQA } = req.body || {};
    const userText = String(message || "Give Indore Legends an IPL-style match hype!");

    // Optional live IPL / International / Domestic scores via CricketData.org (free 100 calls/day)
    let liveScoresBlock = "";
    const cricketApiKey = process.env.CRICKET_API_KEY;
    const asksLiveScore = /score|ipl|cricbuzz|india|match|live|domestic|ranji|t20|odi|test|rcb|mi|csk/i.test(userText);

    if (cricketApiKey && asksLiveScore) {
      try {
        const scoreRes = await fetch(
          `https://api.cricapi.com/v1/currentMatches?apikey=${encodeURIComponent(cricketApiKey)}&offset=0`
        );
        const scoreJson = await scoreRes.json();
        if (Array.isArray(scoreJson?.data) && scoreJson.data.length > 0) {
          const topMatches = scoreJson.data.slice(0, 6).map((m) => {
            const scores = Array.isArray(m.score)
              ? m.score.map((s) => `${s.inning}: ${s.r}/${s.w} (${s.o} ov)`).join(" | ")
              : "Score not started";
            return `- ${m.name} (${m.matchType || "Cricket"}) — ${m.status} — ${scores}`;
          });
          liveScoresBlock = "\nLIVE INTERNATIONAL / IPL / DOMESTIC SCORES RIGHT NOW:\n" + topMatches.join("\n");
        }
      } catch {
        // Silently continue if live cricket API is unreachable
      }
    }

    const qaBlock =
      Array.isArray(customQA) && customQA.length > 0
        ? "\nOFFICIAL INDORE LEGENDS Q&A (Follow these exact answers):\n" +
          customQA.map((q) => `Q: ${q.question}\nA: ${q.answer}`).join("\n\n")
        : "";

    const systemPrompt =
      "You are LegendBot, the electric IPL-commentator-style AI captain and cricket analyst for 'Indore Legends', a wind-ball cricket club playing at Desi Turf Limbodi, Indore. " +
      "Respond with high energy, crisp cricket stats, and punchy English or Hinglish matching the user. " +
      "Always use the LIVE CLUB SNAPSHOT below to answer questions about scores, players, caps, fines, dues, or schedules. " +
      "For IPL, International, or Domestic live scores, use LIVE SCORES if provided; if no live score feed is attached, clearly say live feed isn't linked yet and tell them to tap the Cricbuzz button right below. " +
      "STRICT PRIVACY RULE: Never mention, hint at, or reveal any Ganesh Mandir tab or private chat.\n\n" +
      "LIVE INDORE LEGENDS SNAPSHOT:\n" +
      (clubContext || "Indore Legends Cricket Club") +
      liveScoresBlock +
      qaBlock;

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${groqKey}`,
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        temperature: 0.55,
        max_tokens: 420,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userText },
        ],
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      return res.status(response.status).json({ error: data?.error?.message || "Groq API error" });
    }

    const reply = data?.choices?.[0]?.message?.content || "Ready for the next big over, Legends!";
    return res.status(200).json({ reply, hasLiveFeed: Boolean(liveScoresBlock) });
  } catch (err) {
    return res.status(500).json({ error: err.message || "LegendBot request failed" });
  }
}
