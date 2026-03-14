// ─── gameUtils.js ────────────────────────────────────────────────────────────
// Pure helper functions: no React, no state, no side effects.
// Import what you need: { formatTime, getPieceValue, getPieceSymbol,
//                         getSquaresInRadius, getPieceId,
//                         seededRandom, getDailyPuzzleNumber }

import { PIECE_VALUES } from "./gameConstants";

// ── Time ─────────────────────────────────────────────────────────────────────

export function formatTime(s) {
  const m = Math.floor(s / 60);
  return `${m}:${(s % 60).toString().padStart(2, "0")}`;
}

// ── Piece helpers ─────────────────────────────────────────────────────────────

export function getPieceValue(p) {
  return PIECE_VALUES[p] || 0;
}

export function getPieceSymbol(p) {
  return ({ p: "♟", n: "♞", b: "♝", r: "♜", q: "♛", k: "♚" }[p] || p);
}

// Generates a stable ID for tracking Asura piece lives across respawns.
// e.g. "b_p_3", "b_n_0", "b_r_1"
export function getPieceId(square, piece) {
  const files = ["a", "b", "c", "d", "e", "f", "g", "h"];
  if (piece.type === "p") {
    return `${piece.color}_p_${files.indexOf(square[0])}`;
  }
  return `${piece.color}_${piece.type}_${files.indexOf(square[0]) < 4 ? 0 : 1}`;
}

// ── Board geometry ────────────────────────────────────────────────────────────

// Returns all squares within a Chebyshev (king-move) radius of a centre square.
export function getSquaresInRadius(center, radius) {
  const files = ["a", "b", "c", "d", "e", "f", "g", "h"];
  const fi = files.indexOf(center[0]);
  const r = parseInt(center[1]);
  const sqs = [];
  for (let f = fi - radius; f <= fi + radius; f++) {
    for (let rr = r - radius; rr <= r + radius; rr++) {
      if (f >= 0 && f < 8 && rr >= 1 && rr <= 8) {
        sqs.push(files[f] + rr);
      }
    }
  }
  return sqs;
}

// ── Daily puzzle ──────────────────────────────────────────────────────────────

export function seededRandom(seed) {
  let s = seed;
  return function () {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

export function getDailyPuzzleNumber() {
  const epoch = new Date("2026-03-07").getTime();
  return Math.floor((Date.now() - epoch) / (1000 * 60 * 60 * 24)) + 1;
}