import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import SessionsView from "./components/SessionsView";
import HeatmapView from "./components/HeatmapView";

const styles = {
  app: { minHeight: "100vh", background: "#0f172a" },
  main: { padding: "24px", maxWidth: "1400px", margin: "0 auto" },
};

export default function App() {
  return (
    <div style={styles.app}>
      <Navbar />
      <main style={styles.main}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/sessions" element={<SessionsView />} />
          <Route path="/heatmap" element={<HeatmapView />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}
