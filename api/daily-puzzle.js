// api/daily-puzzle.js
//
// Serves a deterministic daily puzzle from the local puzzle bank.
// No external API calls — instant, free, offline-capable.
//
// Place this file at: /api/daily-puzzle.js (project root, same level as /src)
// Place puzzle bank at: /public/chessuranga_puzzles.json

import puzzles from "../public/chessuranga_puzzles.json" assert { type: "json" };

export default function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Cache-Control", "public, s-maxage=3600");

  // Deterministic daily pick — same puzzle for everyone on the same UTC day
  const dayNum = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
  const puzzle = puzzles[dayNum % puzzles.length];

  res.status(200).json(puzzle);
}