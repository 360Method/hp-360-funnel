/**
 * 360.handypioneers.com is discontinued (2026-06-06).
 *
 * This service now exists only to preserve old links — QR codes, ads, and
 * emails already in the wild. Every request gets a permanent redirect to the
 * live roadmap funnel on the main site. The membership drip emails point at
 * handypioneers.com/membership directly (HP-Estimator-app FUNNEL_ORIGIN).
 *
 * Zero dependencies; built by copying this file to dist/index.js.
 */
import http from "node:http";

const TARGET = "https://handypioneers.com/roadmap-generator";
const PORT = process.env.PORT || 3000;

http
  .createServer((req, res) => {
    res.writeHead(301, {
      Location: TARGET,
      "Cache-Control": "public, max-age=86400",
      "Content-Type": "text/html; charset=utf-8",
    });
    res.end(`<!doctype html><meta http-equiv="refresh" content="0;url=${TARGET}"><a href="${TARGET}">Moved to ${TARGET}</a>`);
  })
  .listen(PORT, () => console.log(`[360-redirect] 301 → ${TARGET} on :${PORT}`));
