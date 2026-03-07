// api/daily-puzzle.js

const { Ratelimit } = require("@upstash/ratelimit");
const { Redis } = require("@upstash/redis");
const puzzles = require("../public/chessuranga_puzzles.json");

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(20, "1 m"),
});

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Cache-Control", "public, s-maxage=3600");

  const ip = req.headers["x-forwarded-for"] ?? "anonymous";
  const { success } = await ratelimit.limit(ip);
  if (!success) return res.status(429).json({ error: "Too many requests" });

  const dayNum = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
  const puzzle = puzzles[dayNum % puzzles.length];

  res.status(200).json(puzzle);
};