import React, { useEffect, useState, useRef, useCallback } from "react";
import axios from "axios";

const API = "http://localhost:5002/api";

export default function HeatmapView() {
  const [pages, setPages] = useState([]);
  const [selectedPage, setSelectedPage] = useState("");
  const [clicks, setClicks] = useState([]);
  const [loading, setLoading] = useState(false);
  const canvasRef = useRef(null);

  useEffect(() => {
    axios.get(`${API}/heatmap?page_url=_`).catch(() => {}).then((r) => {
      if (r && r.data && r.data.all_pages) {
        setPages(r.data.all_pages);
        if (r.data.all_pages.length > 0) setSelectedPage(r.data.all_pages[0]);
      }
    });
  }, []);

  useEffect(() => {
    if (!selectedPage || selectedPage === "_") return;
    setLoading(true);
    axios.get(`${API}/heatmap?page_url=${encodeURIComponent(selectedPage)}`)
      .then((r) => { setClicks(r.data.data || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [selectedPage]);

  const drawHeatmap = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || clicks.length === 0) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width;
    const H = canvas.height;
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = "#0f172a";
    ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = "#1e293b";
    ctx.lineWidth = 1;
    for (let x = 0; x < W; x += 50) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
    for (let y = 0; y < H; y += 50) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
    clicks.forEach((c) => {
      const refW = c.screen_width || 1366;
      const refH = c.screen_height || 768;
      const px = (c.x / refW) * W;
      const py = (c.y / refH) * H;
      const radius = 20;
      const grad = ctx.createRadialGradient(px, py, 0, px, py, radius);
      grad.addColorStop(0, "rgba(251, 146, 60, 0.8)");
      grad.addColorStop(0.4, "rgba(251, 191, 36, 0.4)");
      grad.addColorStop(1, "rgba(251, 191, 36, 0)");
      ctx.beginPath();
      ctx.fillStyle = grad;
      ctx.arc(px, py, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
      ctx.arc(px, py, 3, 0, Math.PI * 2);
      ctx.fill();
    });
  }, [clicks]);

  useEffect(() => { drawHeatmap(); }, [drawHeatmap]);

  return (
    <div>
      <h1 style={{ fontSize: "1.6rem", fontWeight: 700, marginBottom: "24px", color: "#f1f5f9" }}>Click Heatmap</h1>
      <div style={{ background: "#1e293b", borderRadius: "12px", border: "1px solid #334155", padding: "20px", marginBottom: "24px", display: "flex", gap: "16px", alignItems: "center", flexWrap: "wrap" }}>
        <div>
          <label style={{ display: "block", fontSize: "0.8rem", color: "#64748b", marginBottom: "6px", textTransform: "uppercase" }}>Select Page URL</label>
          {pages.length === 0 ? (
            <p style={{ color: "#64748b", fontSize: "0.85rem" }}>No pages tracked yet. Open the demo page first.</p>
          ) : (
            <select value={selectedPage} onChange={(e) => setSelectedPage(e.target.value)}
              style={{ background: "#0f172a", color: "#e2e8f0", border: "1px solid #475569", borderRadius: "6px", padding: "8px 12px", fontSize: "0.88rem", minWidth: "320px", cursor: "pointer" }}>
              {pages.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          )}
        </div>
        <div style={{ color: "#94a3b8", fontSize: "0.85rem" }}>{loading ? "Loading..." : `${clicks.length} clicks recorded`}</div>
      </div>
      <div style={{ background: "#1e293b", borderRadius: "12px", border: "1px solid #334155", padding: "20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <h2 style={{ fontSize: "1rem", fontWeight: 600, color: "#f1f5f9" }}>Click Distribution</h2>
          <div style={{ display: "flex", gap: "16px", fontSize: "0.78rem", color: "#94a3b8" }}>
            <span>⬜ Grid (50px)</span>
            <span style={{ color: "#fb923c" }}>● Click hotspot</span>
          </div>
        </div>
        {clicks.length === 0 && !loading ? (
          <div style={{ textAlign: "center", padding: "80px 0", color: "#475569" }}>
            <div style={{ fontSize: "3rem", marginBottom: "16px" }}>🖱️</div>
            <p>No click data for this page yet.</p>
            <p style={{ fontSize: "0.85rem", marginTop: "8px" }}>Visit the demo page and click around to see the heatmap.</p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <canvas ref={canvasRef} width={800} height={500} style={{ borderRadius: "8px", display: "block", maxWidth: "100%" }} />
          </div>
        )}
      </div>
      {clicks.length > 0 && (
        <div style={{ background: "#1e293b", borderRadius: "12px", border: "1px solid #334155", padding: "20px", marginTop: "24px" }}>
          <h2 style={{ fontSize: "1rem", fontWeight: 600, color: "#f1f5f9", marginBottom: "16px" }}>Recent Clicks</h2>
          <div style={{ maxHeight: "240px", overflowY: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>{["Session", "X", "Y", "Timestamp"].map((h) => <th key={h} style={{ textAlign: "left", padding: "8px 12px", color: "#64748b", fontSize: "0.78rem", textTransform: "uppercase", borderBottom: "1px solid #334155" }}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {clicks.slice(0, 50).map((c, i) => (
                  <tr key={i}>
                    <td style={{ padding: "8px 12px", color: "#38bdf8", fontFamily: "monospace", fontSize: "0.75rem", borderBottom: "1px solid #1e293b" }}>{c.session_id?.substring(0, 16)}…</td>
                    <td style={{ padding: "8px 12px", color: "#94a3b8", fontSize: "0.85rem", borderBottom: "1px solid #1e293b" }}>{c.x}</td>
                    <td style={{ padding: "8px 12px", color: "#94a3b8", fontSize: "0.85rem", borderBottom: "1px solid #1e293b" }}>{c.y}</td>
                    <td style={{ padding: "8px 12px", color: "#64748b", fontSize: "0.78rem", borderBottom: "1px solid #1e293b" }}>{new Date(c.timestamp).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
