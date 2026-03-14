// ─── useStockfish.js ──────────────────────────────────────────────────────────
// Custom hook that manages Stockfish worker lifecycle.
// Returns { stockfish, stockfishRef, stockfishMoveRef }
// - stockfish       : state flag { initialized, random? } — use to trigger bot moves
// - stockfishRef    : ref to the Worker (or fallback object)
// - stockfishMoveRef: ref where the worker writes its best move string

import { useState, useEffect, useRef } from "react";

const STOCKFISH_URL = "https://cdnjs.cloudflare.com/ajax/libs/stockfish.js/10.0.2/stockfish.js";

const SKILL_MAP = { initiate: 0, shishya: 5, acharya: 12, guru: 20 };

export function useStockfish(gameMode, gameStarted, shukraDifficulty) {
  const [stockfish, setStockfish] = useState(null);
  const stockfishRef = useRef(null);
  const stockfishMoveRef = useRef(null);

  useEffect(() => {
    const needsBot = gameMode === "asura" || gameMode === "shukracharya";
    if (!needsBot || !gameStarted || stockfishRef.current) return;

    let worker = null;

    fetch(STOCKFISH_URL)
      .then(res => res.text())
      .then(text => {
        const blob = new Blob([text], { type: "application/javascript" });
        const url = URL.createObjectURL(blob);
        worker = new Worker(url);
        worker.postMessage("uci");

        if (gameMode === "asura") {
          worker.postMessage("setoption name Skill Level value 4");
        } else if (gameMode === "shukracharya") {
          const skill = SKILL_MAP[shukraDifficulty] ?? 10;
          worker.postMessage(`setoption name Skill Level value ${skill}`);
        }

        worker.postMessage("isready");

        worker.onmessage = (e) => {
          if (typeof e.data === "string" && e.data.startsWith("bestmove")) {
            const move = e.data.split(" ")[1];
            if (move && move !== "(none)") stockfishMoveRef.current = move;
          }
        };

        stockfishRef.current = worker;
        setStockfish({ initialized: true });
      })
      .catch(() => {
        // Fallback: random move mode
        stockfishRef.current = { initialized: true, random: true };
        setStockfish({ initialized: true, random: true });
      });

    return () => {
      if (worker) {
        worker.terminate();
        stockfishRef.current = null;
      }
    };
  }, [gameMode, gameStarted, shukraDifficulty]);

  return { stockfish, stockfishRef, stockfishMoveRef };
}