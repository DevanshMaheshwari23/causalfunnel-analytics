import React from "react";
import { NavLink } from "react-router-dom";

const styles = {
  nav: { background: "#1e293b", borderBottom: "1px solid #334155", padding: "0 24px", display: "flex", alignItems: "center", height: "60px", gap: "8px" },
  brand: { color: "#38bdf8", fontWeight: 700, fontSize: "1.2rem", marginRight: "24px", textDecoration: "none" },
  link: { color: "#94a3b8", textDecoration: "none", padding: "8px 16px", borderRadius: "6px", fontSize: "0.9rem", fontWeight: 500, transition: "all 0.2s" },
  activeLink: { color: "#38bdf8", background: "rgba(56,189,248,0.1)" },
};

export default function Navbar() {
  return (
    <nav style={styles.nav}>
      <a href="/" style={styles.brand}>⚡ CausalFunnel</a>
      {[
        { to: "/", label: "📊 Overview" },
        { to: "/sessions", label: "👥 Sessions" },
        { to: "/heatmap", label: "🔥 Heatmap" },
      ].map(({ to, label }) => (
        <NavLink key={to} to={to} end style={({ isActive }) => ({ ...styles.link, ...(isActive ? styles.activeLink : {}) })}>
          {label}
        </NavLink>
      ))}
    </nav>
  );
}
