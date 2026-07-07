import { useMemo, useState } from "react";

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

function Stars({ rating, onRate }) {
  return (
    <div style={{ display: "flex", gap: 3, marginTop: 8 }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span
          key={n}
          role="button"
          aria-label={`Rate ${n} star${n > 1 ? "s" : ""}`}
          onClick={() => onRate(n)}
          style={{ cursor: "pointer", fontSize: 16, lineHeight: 1, color: n <= rating ? "#f59e0b" : "#d1d5db" }}
        >
          ★
        </span>
      ))}
    </div>
  );
}

function toCsvCell(value) {
  return `"${String(value ?? "").replace(/"/g, '""')}"`;
}

export default function Home() {
  const [context, setContext] = useState(DEFAULT_CTX);
  const [voc, setVoc] = useState(DEFAULT_VOC);
  const [headlines, setHeadlines] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(null);
  const [sortByRating, setSortByRating] = useState(false);
  const [ratedOnly, setRatedOnly] = useState(false);

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
      setHeadlines(data.headlines.map((h, i) => ({ ...h, id: i, rating: 0 })));
    } catch (e) {
      setError(e.message || "Generation failed. Try again.");
    }
    setLoading(false);
  };

  const rate = (id, rating) => {
    setHeadlines((prev) => prev.map((h) => (h.id === id ? { ...h, rating } : h)));
  };

  const copy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 1500);
  };

  const displayed = useMemo(() => {
    let list = ratedOnly ? headlines.filter((h) => h.rating > 0) : headlines;
    if (sortByRating) list = [...list].sort((a, b) => b.rating - a.rating);
    return list;
  }, [headlines, sortByRating, ratedOnly]);

  const exportCSV = () => {
    const rows = [
      ["Headline", "Framework", "Reasoning", "Rating"],
      ...displayed.map((h) => [h.headline, h.framework, h.reasoning, h.rating || ""]),
    ];
    const csv = rows.map((row) => row.map(toCsvCell).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "headlines.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "2rem 1.5rem", fontFamily: "system-ui, sans-serif" }}>
      <h1 style={{ fontSize: 24, fontWeight: 600, marginBottom: 6 }}>VoC Headline Engine</h1>
      <p style={{ fontSize: 15, fontWeight: 500, color: "#374151", marginBottom: 10 }}>
        Turn real user frustration into high-converting landing page headlines
      </p>
      <p style={{ fontSize: 14, color: "#6b7280", lineHeight: 1.6, marginBottom: 14 }}>
        This tool takes raw Voice of Customer language — Reddit threads, reviews, support tickets — and generates 12
        headline variants across 6 copywriting frameworks. Use the output to run A/B or multi-armed bandit tests on
        your landing page.
      </p>
      <ol style={{ fontSize: 14, color: "#6b7280", lineHeight: 1.8, paddingLeft: 20, marginBottom: 28 }}>
        <li>Describe your product in the context field</li>
        <li>Paste real user quotes from Reddit, reviews, or support tickets</li>
        <li>Generate, rate, filter, and export your headline variants</li>
      </ol>

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
        <>
          <div style={{ display: "flex", gap: 8, marginTop: 24, marginBottom: 12 }}>
            <button onClick={() => setSortByRating((v) => !v)} style={toggleBtnStyle(sortByRating)}>
              Sort by rating
            </button>
            <button onClick={() => setRatedOnly((v) => !v)} style={toggleBtnStyle(ratedOnly)}>
              Rated only
            </button>
            <button onClick={exportCSV} style={exportBtnStyle}>
              Export CSV
            </button>
          </div>

          <div style={{ display: "grid", gap: 10 }}>
            {displayed.map((h) => (
              <div key={h.id} style={cardStyle}>
                <div style={{ flex: 1 }}>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      color: FRAMEWORK_COLORS[h.framework] || "#6b7280",
                    }}
                  >
                    {h.framework}
                  </span>
                  <p style={{ fontSize: 17, fontWeight: 500, margin: "6px 0 4px", lineHeight: 1.4 }}>{h.headline}</p>
                  <p style={{ fontSize: 13, color: "#9ca3af", margin: 0 }}>{h.reasoning}</p>
                  <Stars rating={h.rating} onRate={(r) => rate(h.id, r)} />
                </div>
                <button onClick={() => copy(h.headline, h.id)} style={copyBtnStyle}>
                  {copied === h.id ? "✓" : "Copy"}
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

const labelStyle = { fontSize: 13, color: "#6b7280", display: "block", marginBottom: 6 };
const textareaStyle = { width: "100%", padding: "10px 12px", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 14, boxSizing: "border-box", fontFamily: "inherit", resize: "vertical" };
const btnStyle = { background: "#111", color: "#fff", border: "none", borderRadius: 8, padding: "10px 20px", fontSize: 14, fontWeight: 500, cursor: "pointer" };
const cardStyle = { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: "14px 16px", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 };
const copyBtnStyle = { flexShrink: 0, background: "transparent", border: "1px solid #e5e7eb", borderRadius: 6, padding: "6px 12px", fontSize: 13, cursor: "pointer" };
const toggleBtnStyle = (active) => ({
  background: active ? "#111" : "transparent",
  color: active ? "#fff" : "#111",
  border: "1px solid #e5e7eb",
  borderRadius: 8,
  padding: "8px 14px",
  fontSize: 13,
  fontWeight: 500,
  cursor: "pointer",
});
const exportBtnStyle = { background: "transparent", color: "#111", border: "1px solid #e5e7eb", borderRadius: 8, padding: "8px 14px", fontSize: 13, fontWeight: 500, cursor: "pointer" };
