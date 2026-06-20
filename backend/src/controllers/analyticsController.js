const Event = require("../models/Event");

const trackEvent = async (req, res) => {
  try {
    const { session_id, event_type, page_url, timestamp, x, y, user_agent, screen_width, screen_height } = req.body;

    if (!session_id || !event_type || !page_url) {
      return res.status(400).json({ success: false, message: "session_id, event_type, and page_url are required" });
    }
    if (!["page_view", "click"].includes(event_type)) {
      return res.status(400).json({ success: false, message: "event_type must be page_view or click" });
    }
    if (event_type === "click" && (x === undefined || y === undefined)) {
      return res.status(400).json({ success: false, message: "x and y coordinates are required for click events" });
    }

    const event = await Event.create({
      session_id,
      event_type,
      page_url,
      timestamp: timestamp ? new Date(timestamp) : new Date(),
      x: event_type === "click" ? x : null,
      y: event_type === "click" ? y : null,
      user_agent: user_agent || "",
      screen_width: screen_width || null,
      screen_height: screen_height || null,
    });

    return res.status(201).json({ success: true, data: event });
  } catch (error) {
    console.error("trackEvent error:", error.message);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

const trackEventsBatch = async (req, res) => {
  try {
    const { events } = req.body;
    if (!events || !Array.isArray(events) || events.length === 0) {
      return res.status(400).json({ success: false, message: "events array is required" });
    }
    const sanitized = events.map((e) => ({
      session_id: e.session_id,
      event_type: e.event_type,
      page_url: e.page_url,
      timestamp: e.timestamp ? new Date(e.timestamp) : new Date(),
      x: e.event_type === "click" ? e.x : null,
      y: e.event_type === "click" ? e.y : null,
      user_agent: e.user_agent || "",
      screen_width: e.screen_width || null,
      screen_height: e.screen_height || null,
    }));
    const inserted = await Event.insertMany(sanitized, { ordered: false });
    return res.status(201).json({ success: true, inserted: inserted.length });
  } catch (error) {
    console.error("trackEventsBatch error:", error.message);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

const getSessions = async (req, res) => {
  try {
    const sessions = await Event.aggregate([
      {
        $group: {
          _id: "$session_id",
          total_events: { $sum: 1 },
          page_views: { $sum: { $cond: [{ $eq: ["$event_type", "page_view"] }, 1, 0] } },
          clicks: { $sum: { $cond: [{ $eq: ["$event_type", "click"] }, 1, 0] } },
          first_seen: { $min: "$timestamp" },
          last_seen: { $max: "$timestamp" },
          pages_visited: { $addToSet: "$page_url" },
        },
      },
      {
        $project: {
          session_id: "$_id",
          total_events: 1,
          page_views: 1,
          clicks: 1,
          first_seen: 1,
          last_seen: 1,
          pages_visited: { $size: "$pages_visited" },
          duration_seconds: { $divide: [{ $subtract: ["$last_seen", "$first_seen"] }, 1000] },
        },
      },
      { $sort: { last_seen: -1 } },
    ]);
    return res.status(200).json({ success: true, data: sessions });
  } catch (error) {
    console.error("getSessions error:", error.message);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

const getSessionEvents = async (req, res) => {
  try {
    const { session_id } = req.params;
    if (!session_id) {
      return res.status(400).json({ success: false, message: "session_id is required" });
    }
    const events = await Event.find({ session_id }).sort({ timestamp: 1 }).lean();
    if (events.length === 0) {
      return res.status(404).json({ success: false, message: "No events found for this session" });
    }
    return res.status(200).json({ success: true, session_id, total: events.length, data: events });
  } catch (error) {
    console.error("getSessionEvents error:", error.message);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

const getHeatmapData = async (req, res) => {
  try {
    const { page_url } = req.query;
    if (!page_url || page_url === "_") {
      const allPages = await Event.distinct("page_url");
      return res.status(200).json({ success: true, data: [], all_pages: allPages });
    }
    const clicks = await Event.find(
      { page_url, event_type: "click" },
      { x: 1, y: 1, timestamp: 1, session_id: 1, screen_width: 1, screen_height: 1, _id: 0 }
    ).sort({ timestamp: -1 }).lean();
    const allPages = await Event.distinct("page_url");
    return res.status(200).json({ success: true, page_url, total_clicks: clicks.length, data: clicks, all_pages: allPages });
  } catch (error) {
    console.error("getHeatmapData error:", error.message);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

const getStats = async (req, res) => {
  try {
    const [total_events, total_sessions_arr, total_clicks, page_breakdown] = await Promise.all([
      Event.countDocuments(),
      Event.distinct("session_id"),
      Event.countDocuments({ event_type: "click" }),
      Event.aggregate([
        { $group: { _id: "$page_url", visits: { $sum: 1 } } },
        { $sort: { visits: -1 } },
        { $limit: 10 },
      ]),
    ]);
    return res.status(200).json({
      success: true,
      data: {
        total_events,
        total_sessions: total_sessions_arr.length,
        total_clicks,
        total_page_views: total_events - total_clicks,
        top_pages: page_breakdown,
      },
    });
  } catch (error) {
    console.error("getStats error:", error.message);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = { trackEvent, trackEventsBatch, getSessions, getSessionEvents, getHeatmapData, getStats };
