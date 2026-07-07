import { useState } from "react";

const DEFAULT_VOC = `You think you're building an app, but you're juggling design, debugging, copywriting, onboarding, and analytics all at once. Ten hats, each slowing the others down.

My biggest challenge isn't the build — it's finding the energy to keep going.

How difficult screenshots and ASO felt compared to actually building the app.

Build your app to solve a real problem.

I want to launch something but I don't know where to start.`;

const DEFAULT_CTX =
  "AI app-building platform for non-technical founders, solo entrepreneurs, and business operators who want to launch without hiring developers.";

const FRAMEWORK_COLORS = {
  "Pain-led": "#dc2626",
  "Outcome-led": "#16a34a",
  Contrast: "#2563eb",
  Specificity: "#7c3aed",
  Empowerment: "#b45309",
  "Anti-category": "#6b7280",
};

export default function Home() {
  const [context, setContext] = useState(DEFAULT_CTX);
  const [voc, setVoc] = useState(DEFAULT_VOC);
  const [headlines, setHeadlines] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(null);

  const generate = async () => {
    setLoading(true);
    setError("");
    setHeadlines([]);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ context, voc }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setHeadlines(data.headlines);
    } catch (e) {
      setError("Generation failed. Try again.");
    }
    setLoading(false);
  };

  const copy = (text, i) => {
    navigator.clipboard.writeText(text);
    setCopied(i);
    setTimeout(() => setCopied(null), 1500);
  };

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "2rem 1.5rem", fontFamily: "system-ui, sans-serif" }}>
      <h1 style={{ fontSize: 22, fontWeight: 600, marginBottom: 4 }}>VoC Headline Engine</h1>
      <p style={{ fontSize: 14, color: "#6b7280", marginBottom: 24 }}>
        Paste Reddit pain points → generate 12 psychologically-backed H1 variants for A/B testing
      </p>

      <div style={{ display: "grid", gap: 16, marginBottom: 20 }}>
        <div>
          <label style={labelStyle}>Product context</label>
          <textarea
            value={context}
            onChange={(e) => setContext(e.target.value)}
            rows={2}
            style={textareaStyle}
          />
        </div>
        <div>
          <label style={labelStyle}>VoC data — Reddit quotes, reviews, support tickets</label>
          <textarea
            value={voc}
            onChange={(e) => setVoc(e.target.value)}
            rows={8}
            style={textareaStyle}
          />
        </div>
      </div>

      <button onClick={generate} disabled={loading} style={btnStyle}>
        {loading ? "Generating..." : "Generate headlines →"}
      </button>

      {error && <p style={{ color: "#dc2626", fontSize: 14, marginTop: 12 }}>{error}</p>}

      {headlines.length > 0 && (
        <div style={{ marginTop: 24, display: "grid", gap: 10 }}>
          {headlines.map((h, i) => (
            <div key={i} style={cardStyle}>
              <div style={{ flex: 1 }}>
                <span style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: FRAMEWORK_COLORS[h.framework] || "#6b7280" }}>
                  {h.framework}
                </span>
                <p style={{ fontSize: 17, fontWeight: 500, margin: "6px 0 4px", lineHeight: 1.4 }}>{h.headline}</p>
                <p style={{ fontSize: 13, color: "#9ca3af", margin: 0 }}>{h.reasoning}</p>
              </div>
              <button onClick={() => copy(h.headline, i)} style={copyBtnStyle}>
                {copied === i ? "✓" : "Copy"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const labelStyle = { fontSize: 13, color: "#6b7280", display: "block", marginBottom: 6 };
const textareaStyle = { width: "100%", padding: "10px 12px", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 14, boxSizing: "border-box", fontFamily: "inherit", resize: "vertical" };
const btnStyle = { background: "#111", color: "#fff", border: "none", borderRadius: 8, padding: "10px 20px", fontSize: 14, fontWeight: 500, cursor: "pointer" };
const cardStyle = { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: "14px 16px", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 };
const copyBtnStyle = { flexShrink: 0, background: "transparent", border: "1px solid #e5e7eb", borderRadius: 6, padding: "6px 12px", fontSize: 13, cursor: "pointer" };
