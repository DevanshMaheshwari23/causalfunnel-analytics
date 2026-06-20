import React, { useEffect, useState } from "react";
import axios from "axios";

const API_URL = "https://causalfunnel-analytics-jcug.onrender.com/api";

const cardStyle = { background: "#1e293b", border: "1px solid #334155", borderRadius: "12px", padding: "24px", flex: 1, minWidth: "180px" };
const statNum = { fontSize: "2.2rem", fontWeight: 700, color: "#38bdf8", marginBottom: "4px" };
const statLabel = { color: "#94a3b8", fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.05em" };

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios.get(`${API}/stats`)
      .then((r) => { setStats(r.data.data); setLoading(false); })
      .catch(() => { setError("Failed to load stats"); setLoading(false); });
  }, []);

  if (loading) return <p style={{ color: "#94a3b8", textAlign: "center", marginTop: "80px" }}>Loading...</p>;
  if (error) return <p style={{ color: "#f87171", textAlign: "center", marginTop: "80px" }}>{error}</p>;

  return (
    <div>
      <h1 style={{ fontSize: "1.6rem", fontWeight: 700, marginBottom: "24px", color: "#f1f5f9" }}>Analytics Overview</h1>
      <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", marginBottom: "32px" }}>
        {[
          { label: "Total Sessions", value: stats.total_sessions },
          { label: "Total Events", value: stats.total_events },
          { label: "Page Views", value: stats.total_page_views },
          { label: "Total Clicks", value: stats.total_clicks },
        ].map(({ label, value }) => (
          <div key={label} style={cardStyle}>
            <div style={statNum}>{value.toLocaleString()}</div>
            <div style={statLabel}>{label}</div>
          </div>
        ))}
      </div>
      <div style={{ ...cardStyle, flex: "none" }}>
        <h2 style={{ fontSize: "1.1rem", fontWeight: 600, marginBottom: "16px", color: "#f1f5f9" }}>Top Pages</h2>
        {stats.top_pages.length === 0 ? (
          <p style={{ color: "#64748b" }}>No data yet. Open the demo page to start tracking.</p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #334155" }}>
                <th style={{ textAlign: "left", padding: "8px 12px", color: "#64748b", fontSize: "0.8rem" }}>Page URL</th>
                <th style={{ textAlign: "right", padding: "8px 12px", color: "#64748b", fontSize: "0.8rem" }}>Visits</th>
              </tr>
            </thead>
            <tbody>
              {stats.top_pages.map((p) => (
                <tr key={p._id} style={{ borderBottom: "1px solid #1e293b" }}>
                  <td style={{ padding: "10px 12px", color: "#94a3b8", fontSize: "0.85rem", maxWidth: "400px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p._id}</td>
                  <td style={{ padding: "10px 12px", color: "#38bdf8", fontWeight: 600, textAlign: "right" }}>{p.visits}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
