(function () {
  "use strict";

  const BACKEND_URL = "http://localhost:5000/api";
  const SESSION_KEY = "cf_session_id";
  const BATCH_INTERVAL = 3000;
  let eventQueue = [];
  let flushTimer = null;

  function getSessionId() {
    let sid = localStorage.getItem(SESSION_KEY);
    if (!sid) {
      sid = "sess_" + Math.random().toString(36).substring(2) + "_" + Date.now().toString(36);
      localStorage.setItem(SESSION_KEY, sid);
    }
    return sid;
  }

  function buildBaseEvent(type) {
    return {
      session_id: getSessionId(),
      event_type: type,
      page_url: window.location.href,
      timestamp: new Date().toISOString(),
      user_agent: navigator.userAgent,
      screen_width: window.innerWidth,
      screen_height: window.innerHeight,
    };
  }

  function flushQueue() {
    if (eventQueue.length === 0) return;
    const payload = [...eventQueue];
    eventQueue = [];
    if (navigator.sendBeacon) {
      const blob = new Blob([JSON.stringify({ events: payload })], { type: "application/json" });
      navigator.sendBeacon(BACKEND_URL + "/events/batch", blob);
    } else {
      fetch(BACKEND_URL + "/events/batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ events: payload }),
        keepalive: true,
      }).catch(() => {});
    }
  }

  function scheduleFlush() {
    if (flushTimer) return;
    flushTimer = setTimeout(function () {
      flushTimer = null;
      flushQueue();
    }, BATCH_INTERVAL);
  }

  function queueEvent(event) {
    eventQueue.push(event);
    scheduleFlush();
  }

  function trackPageView() {
    queueEvent(buildBaseEvent("page_view"));
  }

  function trackClick(e) {
    const evt = buildBaseEvent("click");
    evt.x = e.clientX;
    evt.y = e.clientY;
    evt.x_pct = parseFloat(((e.clientX / window.innerWidth) * 100).toFixed(2));
    evt.y_pct = parseFloat(((e.clientY / window.innerHeight) * 100).toFixed(2));
    queueEvent(evt);
  }

  function init() {
    trackPageView();
    document.addEventListener("click", trackClick, true);
    window.addEventListener("visibilitychange", function () {
      if (document.visibilityState === "hidden") flushQueue();
    });
    window.addEventListener("beforeunload", flushQueue);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
