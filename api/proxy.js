// api/proxy.js — Vercel Serverless Proxy
// Fetches external embed pages, strips X-Frame-Options, returns clean HTML
// Usage: /api/proxy?url=https://vidsrc.to/embed/movie/550

const https = require("https");
const http  = require("http");
const { URL } = require("url");

// ── Allowed streaming domains only
const ALLOWED = [
  "vidsrc.to", "vidsrc.me", "vidsrc.xyz", "vidsrc.net",
  "2embed.cc", "2embed.org", "embed.su",
  "multiembed.mov", "autoembed.co", "player.autoembed.co",
  "embed.smashystream.com", "smashy.stream",
  "moviesapi.club", "superembed.stream",
  "vidlink.pro", "vidplay.online",
  "frembed.xyz", "doodstream.com",
];

function isAllowed(urlStr) {
  try {
    const host = new URL(urlStr).hostname.replace(/^www\./, "");
    return ALLOWED.some(d => host === d || host.endsWith("." + d));
  } catch { return false; }
}

function fetchUrl(urlStr) {
  return new Promise((resolve, reject) => {
    const parsed  = new URL(urlStr);
    const lib     = parsed.protocol === "https:" ? https : http;
    const options = {
      hostname : parsed.hostname,
      path     : parsed.pathname + parsed.search,
      method   : "GET",
      headers  : {
        "User-Agent"      : "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept"          : "text/html,application/xhtml+xml,*/*;q=0.9",
        "Accept-Language" : "hi-IN,hi;q=0.9,en;q=0.8",
        "Referer"         : "https://www.google.com/",
        "Origin"          : "https://www.google.com",
      },
      rejectUnauthorized: false,
    };

    const req = lib.request(options, res => {
      // Follow redirects
      if ([301,302,303,307,308].includes(res.statusCode) && res.headers.location) {
        return fetchUrl(res.headers.location).then(resolve).catch(reject);
      }

      let body = "";
      res.setEncoding("utf8");
      res.on("data", chunk => body += chunk);
      res.on("end", () => resolve({
        status      : res.statusCode,
        contentType : res.headers["content-type"] || "text/html",
        body,
      }));
    });

    req.on("error", reject);
    req.setTimeout(15000, () => { req.destroy(); reject(new Error("Timeout")); });
    req.end();
  });
}

module.exports = async function handler(req, res) {
  // CORS — allow all origins so iframe works from any domain
  res.setHeader("Access-Control-Allow-Origin",  "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "*");
  res.setHeader("X-Frame-Options",              "ALLOWALL");
  res.setHeader("Content-Security-Policy",      "frame-ancestors *");

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  const rawUrl = req.query?.url;
  if (!rawUrl) {
    res.status(400).json({ error: "No URL provided" });
    return;
  }

  let targetUrl;
  try {
    targetUrl = decodeURIComponent(rawUrl);
    new URL(targetUrl); // validate
  } catch {
    res.status(400).json({ error: "Invalid URL" });
    return;
  }

  if (!isAllowed(targetUrl)) {
    res.status(403).json({ error: "Domain not allowed" });
    return;
  }

  try {
    const { status, contentType, body } = await fetchUrl(targetUrl);

    // Rewrite relative URLs so assets load from original domain
    const base    = new URL(targetUrl);
    const baseUrl = base.protocol + "//" + base.host;
    const rewritten = body
      .replace(/(src|href)=["']\/(?!\/)/gi, `$1="${baseUrl}/`)
      .replace(/(src|href)=["'](?!http|\/\/|data:|#|javascript)/gi, `$1="${baseUrl}/`);

    res.setHeader("Content-Type", contentType);
    res.status(status).send(rewritten);

  } catch (err) {
    res.status(502).json({ error: "Fetch failed: " + err.message });
  }
};
                          
