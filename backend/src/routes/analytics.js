const express = require("express");
const router = express.Router();
const { trackEvent, trackEventsBatch, getSessions, getSessionEvents, getHeatmapData, getStats } = require("../controllers/analyticsController");

router.post("/events", trackEvent);
router.post("/events/batch", trackEventsBatch);
router.get("/sessions", getSessions);
router.get("/sessions/:session_id/events", getSessionEvents);
router.get("/heatmap", getHeatmapData);
router.get("/stats", getStats);

module.exports = router;
