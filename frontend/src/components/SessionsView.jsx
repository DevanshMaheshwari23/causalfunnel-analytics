import React, { useEffect, useState } from "react";
import axios from "axios";

const API_URL = "https://causalfunnel-analytics-jcug.onrender.com/api";

const tableHeaderStyle = { textAlign: "left", padding: "12px 16px", color: "#64748b", fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: "1px solid #334155" };
const tdStyle = { padding: "12px 16px", color: "#cbd5e1", fontSize: "0.88rem", borderBottom: "1px solid #1e293b" };
const badgeStyle = (color) => ({ background: color + "22", color, borderRadius: "4px", padding: "2px 8px", fontSize: "0.78rem", fontWeight: 600 });

function formatDate(d) { return new Date(d).toLocaleString(); }
function formatDuration(s) {
  if (!s || s < 0) return "< 1s";
  if (s < 60) return `${Math.round(s)}s`;
  return `${Math.floor(s / 60)}m ${Math.round(s % 60)}s`;
}

export default function SessionsView() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [events, setEvents] = useState([]);
  const [evLoading, setEvLoading] = useState(false);

  useEffect(() => {
    axios.get(`${API}/sessions`).then((r) => { setSessions(r.data.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const openSession = (sid) => {
    setSelected(sid);
    setEvLoading(true);
    axios.get(`${API}/sessions/${sid}/events`).then((r) => { setEvents(r.data.data); setEvLoading(false); }).catch(() => setEvLoading(false));
  };

  return (
    <div>
      <h1 style={{ fontSize: "1.6rem", fontWeight: 700, marginBottom: "24px", color: "#f1f5f9" }}>Sessions</h1>
      <div style={{ display: "flex", gap: "24px", flexWrap: "wrap" }}>
        <div style={{ flex: 2, minWidth: "400px", background: "#1e293b", borderRadius: "12px", border: "1px solid #334155", overflow: "hidden" }}>
          {loading ? (
            <p style={{ color: "#94a3b8", padding: "24px" }}>Loading sessions...</p>
          ) : sessions.length === 0 ? (
            <p style={{ color: "#64748b", padding: "24px" }}>No sessions yet. Open the demo page to start tracking.</p>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={tableHeaderStyle}>Session ID</th>
                  <th style={tableHeaderStyle}>Events</th>
                  <th style={tableHeaderStyle}>Duration</th>
                  <th style={tableHeaderStyle}>Last Seen</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map((s) => (
                  <tr key={s.session_id} onClick={() => openSession(s.session_id)}
                    style={{ cursor: "pointer", background: selected === s.session_id ? "rgba(56,189,248,0.08)" : "transparent", transition: "background 0.15s" }}
                    onMouseEnter={(e) => { if (selected !== s.session_id) e.currentTarget.style.background = "#0f172a"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = selected === s.session_id ? "rgba(56,189,248,0.08)" : "transparent"; }}>
                    <td style={{ ...tdStyle, fontFamily: "monospace", fontSize: "0.78rem", color: "#38bdf8" }}>{s.session_id.substring(0, 20)}…</td>
                    <td style={tdStyle}>
                      <span style={badgeStyle("#a78bfa")}>{s.total_events}</span>
                      <span style={{ ...badgeStyle("#34d399"), marginLeft: "4px" }}>👁 {s.page_views}</span>
                      <span style={{ ...badgeStyle("#fb923c"), marginLeft: "4px" }}>🖱 {s.clicks}</span>
                    </td>
                    <td style={tdStyle}>{formatDuration(s.duration_seconds)}</td>
                    <td style={{ ...tdStyle, color: "#64748b" }}>{formatDate(s.last_seen)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        {selected && (
          <div style={{ flex: 1, minWidth: "320px", background: "#1e293b", borderRadius: "12px", border: "1px solid #334155", padding: "20px", maxHeight: "600px", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h2 style={{ fontSize: "1rem", fontWeight: 600, color: "#f1f5f9" }}>User Journey</h2>
              <button onClick={() => setSelected(null)} style={{ background: "transparent", border: "none", color: "#64748b", cursor: "pointer", fontSize: "1.2rem" }}>✕</button>
            </div>
            {evLoading ? <p style={{ color: "#94a3b8" }}>Loading events...</p> : (
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {events.map((ev, i) => (
                  <div key={ev._id} style={{ background: "#0f172a", borderRadius: "8px", padding: "12px", borderLeft: `3px solid ${ev.event_type === "click" ? "#fb923c" : "#38bdf8"}` }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                      <span style={{ fontSize: "0.75rem", fontWeight: 600, color: ev.event_type === "click" ? "#fb923c" : "#38bdf8" }}>
                        {i + 1}. {ev.event_type === "click" ? "🖱 Click" : "👁 Page View"}
                      </span>
                      <span style={{ fontSize: "0.72rem", color: "#475569" }}>{formatDate(ev.timestamp)}</span>
                    </div>
                    <div style={{ fontSize: "0.78rem", color: "#64748b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{ev.page_url}</div>
                    {ev.event_type === "click" && <div style={{ fontSize: "0.75rem", color: "#94a3b8", marginTop: "4px" }}>📍 x: {ev.x}, y: {ev.y}</div>}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
