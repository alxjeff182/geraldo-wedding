import type { VercelRequest, VercelResponse } from "@vercel/node";

/** Serves ICS inline so macOS can open it via webcal:// → Calendar.app */
export default function handler(req: VercelRequest, res: VercelResponse) {
  const raw = typeof req.query.ics === "string" ? req.query.ics : "";
  let body = "";

  if (raw) {
    try {
      const padded = raw.replace(/-/g, "+").replace(/_/g, "/");
      const pad = padded.length % 4 === 0 ? "" : "=".repeat(4 - (padded.length % 4));
      body = Buffer.from(padded + pad, "base64").toString("utf8");
    } catch {
      body = "";
    }
  }

  if (!body.startsWith("BEGIN:VCALENDAR")) {
    res.status(400).send("Invalid calendar payload");
    return;
  }

  res.setHeader("Content-Type", "text/calendar; charset=utf-8");
  res.setHeader("Content-Disposition", "inline; filename=\"wedding.ics\"");
  res.setHeader("Cache-Control", "no-store");
  res.status(200).send(body);
}
