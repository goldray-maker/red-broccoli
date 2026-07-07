const SYSTEM = `You are a senior CRO specialist and conversion copywriter. Generate landing page H1 headline variants for an AI no-code app-building platform based on real user Voice of Customer (VoC) data.

Generate exactly 12 H1 variants using these frameworks (2 per framework):
- Pain-led: mirror the user's exact frustration in their own words
- Outcome-led: promise a specific, tangible result
- Contrast: old way vs new way / before vs after
- Specificity: concrete timeframes or numbers
- Empowerment: give the user agency
- Anti-category: position against hiring devs or traditional building

Rules:
- Max 8 words per headline
- Use the user's actual language from VoC
- No generic claims: no "powerful", "seamless", "easy", "fast"
- No punctuation at end unless question
- Each headline must be distinct

Return ONLY a valid JSON array, no markdown, no explanation:
[{"headline":"...","framework":"Pain-led","reasoning":"one sentence"}]`;

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { context, voc } = req.body;

  if (!context || !voc) {
    return res.status(400).json({ error: "Missing context or voc" });
  }

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-5",
        max_tokens: 4000,
        system: SYSTEM,
        messages: [
          {
            role: "user",
            content: `Product context: ${context}\n\nVoC data:\n${voc}\n\nGenerate 12 H1 variants now.`,
          },
        ],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Anthropic API error:", data);
      return res.status(502).json({ error: data.error?.message || "Anthropic API request failed" });
    }

    const text = data.content?.find((b) => b.type === "text")?.text || "";
    const clean = text.replace(/```json|```/g, "").trim();
    const headlines = JSON.parse(clean);

    return res.status(200).json({ headlines });
  } catch (e) {
    console.error("Generation failed:", e);
    return res.status(500).json({ error: e.message || "Generation failed" });
  }
}
