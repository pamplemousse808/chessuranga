import { useState, useEffect, useCallback } from "react";
import { Chess } from "chess.js";
import { Chessboard } from "react-chessboard";

// ─── Tutorial card definitions ───────────────────────────────────────────────
const SURYA  = { id: "SURYA",   name: "Surya",   color: "#fbbf24", tier: 1, cost: 8,  description: "Can't be captured for 2 moves",                                                              image: "/images/surya.jpg"   };
const GURU   = { id: "GURU",    name: "Guru",    color: "#a855f7", tier: 2, cost: 9,  description: "Spawn a real duplicate left or right — it moves and can capture for 2 turns before it dissolves", image: "/images/guru.jpg"    };
const MANGALA= { id: "MANGALA", name: "Mangala", color: "#ef4444", tier: 3, cost: 12, description: "Capture any adjacent piece",                                                                  image: "/images/mangala.jpg" };

// ─── Tutorial phases ──────────────────────────────────────────────────────────
const PHASES = [
  {
    id: "capture_pawn",
    title: "Capture the pawn",
    body: "Move your pawn on d4 to capture the black pawn on e5. This will unlock your first celestial power.",
    arrow: null,
    highlightSquares: ["d4", "e5"],
    tier1: false, tier2: false, tier3: false,
  },
  {
    id: "use_surya",
    title: "Surya has awakened",
    body: "You've unlocked a Tier 1 power. Tap Āhvān to open your cards, then select Surya and choose a piece to protect.",
    arrow: "ahvan",
    highlightSquares: [],
    tier1: true, tier2: false, tier3: false,
  },
  {
    id: "capture_knight",
    title: "Press the attack",
    body: "Now capture the knight on f6 with your bishop on g5. A Tier 2 power will awaken.",
    arrow: null,
    highlightSquares: ["g5", "f6"],
    tier1: true, tier2: false, tier3: false,
  },
  {
    id: "use_guru",
    title: "Guru stirs",
    body: "Tier 2 unlocked. Open Āhvān, select Guru, and spawn a duplicate of one of your pieces.",
    arrow: "ahvan",
    highlightSquares: [],
    tier1: true, tier2: true, tier3: false,
  },
  {
    id: "capture_queen",
    title: "Strike the queen",
    body: "Capture the queen on c7 with your knight on b5. The mightiest Tier 3 power will be yours.",
    arrow: null,
    highlightSquares: ["b5", "c7"],
    tier1: true, tier2: true, tier3: false,
  },
  {
    id: "use_mangala",
    title: "Mangala is unleashed",
    body: "Tier 3 unlocked. Open Āhvān, select Mangala, and capture any piece adjacent to your chosen warrior.",
    arrow: "ahvan",
    highlightSquares: [],
    tier1: true, tier2: true, tier3: true,
  },
  {
    id: "complete",
    title: "You are ready",
    body: "You've wielded the celestial powers. The cosmos awaits.",
    arrow: null,
    highlightSquares: [],
    tier1: true, tier2: true, tier3: true,
  },
];

// ─── Initial FEN: mid-game position ──────────────────────────────────────────
// White: Ra1 Nb5 Bc1 Bg5 Qd1 Ke1 pawns on a2 b2 c2 d4 f2 g2 h2
// Black: pawn e5, knight f6, bishop d6 (removed — using c7 queen), queen c7
const INITIAL_FEN = "2q5/8/3b1n2/1N2p1B1/3P4/8/PPP2PPP/R1BQK2R w KQ - 0 1";

// Bot reply moves per phase (simple retreats)
const BOT_REPLIES = {
  capture_pawn:  null,          // bot moves after Surya use
  use_surya:     "d6c7",        // bishop shuffles — but we trigger after card use
  capture_knight: null,
  use_guru:      "c7d7",
  capture_queen: null,
  use_mangala:   null,
};

export default function Tutorial({ onBack }) {
  const [game, setGame]               = useState(new Chess(INITIAL_FEN));
  const [phaseIdx, setPhaseIdx]       = useState(0);
  const [showOverlay, setShowOverlay] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);
  const [activationMode, setActivationMode] = useState(false);
  const [poweredSquares, setPoweredSquares] = useState({});   // square → card id
  const [flash, setFlash]             = useState(null);       // { msg, color }
  const [boardWidth, setBoardWidth]   = useState(360);
  const [visible, setVisible]         = useState(false);

  const phase = PHASES[phaseIdx];

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 60);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const update = () => {
      const w = Math.min(window.innerWidth, 480);
      setBoardWidth(w - 16);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  // ── Flash helper ────────────────────────────────────────────────────────────
  const showFlash = (msg, color = "#fbbf24") => {
    setFlash({ msg, color });
    setTimeout(() => setFlash(null), 2000);
  };

  // ── Bot auto-reply ──────────────────────────────────────────────────────────
  const botReply = useCallback((g, move) => {
    if (!move) return;
    setTimeout(() => {
      const clone = new Chess(g.fen());
      try {
        clone.move({ from: move.slice(0,2), to: move.slice(2,4) });
        setGame(clone);
      } catch (_) {}
    }, 800);
  }, []);

  // ── Advance phase ───────────────────────────────────────────────────────────
  const advance = useCallback((currentPhaseId, g) => {
    const nextIdx = PHASES.findIndex(p => p.id === currentPhaseId) + 1;
    if (nextIdx < PHASES.length) {
      setPhaseIdx(nextIdx);
      // trigger bot reply for card-use phases
      if (currentPhaseId === "use_surya")   botReply(g, "d6c5");
      if (currentPhaseId === "use_guru")    botReply(g, "c7d7");
    }
  }, [botReply]);

  // ── Piece drop ──────────────────────────────────────────────────────────────
  const onPieceDrop = useCallback((sourceSquare, targetSquare) => {
    // Activation mode: Mangala adjacent capture
    if (activationMode && selectedCard?.id === "MANGALA") {
      const files = "abcdefgh";
      const sf = files.indexOf(sourceSquare[0]);
      const sr = parseInt(sourceSquare[1]);
      const tf = files.indexOf(targetSquare[0]);
      const tr = parseInt(targetSquare[1]);
      const adjacent = Math.abs(sf - tf) <= 1 && Math.abs(sr - tr) <= 1;
      if (!adjacent) { showFlash("Must be adjacent!", "#ef4444"); return false; }
      const clone = new Chess(game.fen());
      const target = clone.get(targetSquare);
      if (!target || target.color === "w") { showFlash("No enemy piece there!", "#ef4444"); return false; }
      // Force-remove the target piece and keep attacker
      clone.remove(targetSquare);
      showFlash("Mangala strikes! ⚡", "#ef4444");
      setGame(clone);
      setActivationMode(false);
      setSelectedCard(null);
      advance("use_mangala", clone);
      return true;
    }

    // Normal move
    const clone = new Chess(game.fen());
    let move;
    try {
      move = clone.move({ from: sourceSquare, to: targetSquare, promotion: "q" });
    } catch (_) { return false; }
    if (!move) return false;

    setGame(clone);

    // Check expected captures
    if (phase.id === "capture_pawn" && sourceSquare === "d4" && targetSquare === "e5") {
      showFlash("Pawn captured! Surya awakens ✨", "#fbbf24");
      setTimeout(() => advance("capture_pawn", clone), 400);
    } else if (phase.id === "capture_knight" && sourceSquare === "g5" && targetSquare === "f6") {
      showFlash("Knight captured! Guru stirs 🪐", "#a855f7");
      setTimeout(() => advance("capture_knight", clone), 400);
    } else if (phase.id === "capture_queen" && sourceSquare === "b5" && targetSquare === "c7") {
      showFlash("Queen captured! Mangala unleashed 🔥", "#ef4444");
      setTimeout(() => advance("capture_queen", clone), 400);
    }

    return true;
  }, [game, phase, activationMode, selectedCard, advance]);

  // ── Square click (activation mode for Surya / Guru) ─────────────────────────
  const onSquareClick = useCallback((square) => {
    if (!activationMode || !selectedCard) return;
    const piece = game.get(square);
    if (!piece || piece.color !== "w") { showFlash("Pick one of your pieces!", "#888"); return; }

    if (selectedCard.id === "SURYA") {
      setPoweredSquares(prev => ({ ...prev, [square]: "SURYA" }));
      showFlash("Surya shields this piece ☀️", "#fbbf24");
      setActivationMode(false);
      setSelectedCard(null);
      advance("use_surya", game);
    } else if (selectedCard.id === "GURU") {
      // Place a duplicate pawn adjacent if possible (simplified)
      const files = "abcdefgh";
      const fi = files.indexOf(square[0]);
      const rank = square[1];
      const leftFile  = fi > 0 ? files[fi - 1] : null;
      const rightFile = fi < 7 ? files[fi + 1] : null;
      const target = rightFile || leftFile;
      if (target) {
        const clone = new Chess(game.fen());
        const p = clone.get(square);
        const dest = `${target}${rank}`;
        if (!clone.get(dest)) {
          clone.put({ type: p.type, color: "w" }, dest);
          setGame(clone);
          showFlash("Duplicate summoned! 🪐", "#a855f7");
        } else {
          showFlash("No space to duplicate!", "#888");
        }
      }
      setActivationMode(false);
      setSelectedCard(null);
      advance("use_guru", game);
    }
  }, [activationMode, selectedCard, game, advance]);

  // ── Custom square styles ─────────────────────────────────────────────────────
  const customSquareStyles = {};
  if (phase.highlightSquares) {
    phase.highlightSquares.forEach((sq, i) => {
      customSquareStyles[sq] = {
        backgroundColor: i === 0 ? "rgba(251,191,36,0.45)" : "rgba(239,68,68,0.45)",
        borderRadius: "4px",
      };
    });
  }
  Object.keys(poweredSquares).forEach(sq => {
    customSquareStyles[sq] = {
      ...customSquareStyles[sq],
      boxShadow: "inset 0 0 0 3px #fbbf24",
      borderRadius: "4px",
    };
  });
  if (activationMode) {
    // Highlight all white pieces as clickable
    const board = game.board();
    board.forEach(row => row.forEach(cell => {
      if (cell && cell.color === "w") {
        customSquareStyles[cell.square] = {
          backgroundColor: "rgba(251,191,36,0.3)",
          boxShadow: "inset 0 0 0 2px #fbbf24",
          borderRadius: "4px",
          cursor: "pointer",
        };
      }
    }));
  }

  // ── Available cards based on phase ──────────────────────────────────────────
  const availableCards = [];
  if (phase.tier1) availableCards.push(SURYA);
  if (phase.tier2) availableCards.push(GURU);
  if (phase.tier3) availableCards.push(MANGALA);

  const isComplete = phase.id === "complete";

  // ── Tier badge ───────────────────────────────────────────────────────────────
  const tierLabel = (t) => ({ 1: "I", 2: "II", 3: "III" }[t]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Crimson+Pro:ital,wght@0,300;0,400;1,300;1,400&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }

        .tut-root {
          min-height: 100vh;
          background: #060810;
          color: #e8dfc8;
          font-family: 'Crimson Pro', Georgia, serif;
          display: flex;
          flex-direction: column;
          align-items: center;
          overflow-x: hidden;
          padding-bottom: env(safe-area-inset-bottom);
        }

        .tut-nav {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 20px;
          background: rgba(6,8,16,0.9);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid rgba(255,215,100,0.1);
          position: sticky;
          top: 0;
          z-index: 50;
        }
        .tut-nav-title {
          font-family: 'Cinzel', serif;
          font-size: 11px;
          letter-spacing: 0.3em;
          color: #c8973a;
          text-transform: uppercase;
        }
        .tut-nav-back {
          font-family: 'Cinzel', serif;
          font-size: 11px;
          letter-spacing: 0.1em;
          color: #060810;
          background: #c8973a;
          padding: 7px 16px;
          border-radius: 50px;
          border: none;
          cursor: pointer;
        }

        .tut-progress {
          display: flex;
          gap: 5px;
          padding: 12px 20px 0;
          align-items: center;
        }
        .tut-pip {
          height: 3px;
          border-radius: 2px;
          background: rgba(255,255,255,0.12);
          flex: 1;
          transition: background 0.4s ease;
        }
        .tut-pip.done { background: #c8973a; }

        .tut-hint {
          width: calc(100% - 32px);
          margin: 12px 16px 0;
          padding: 14px 16px;
          border-radius: 14px;
          border: 1px solid rgba(255,215,100,0.15);
          background: rgba(255,255,255,0.04);
          opacity: 0;
          transform: translateY(10px);
          transition: opacity 0.4s ease, transform 0.4s ease;
        }
        .tut-hint.show {
          opacity: 1;
          transform: translateY(0);
        }
        .tut-hint-title {
          font-family: 'Cinzel', serif;
          font-size: 13px;
          color: #f5e9c8;
          margin-bottom: 5px;
          letter-spacing: 0.05em;
        }
        .tut-hint-body {
          font-size: 14px;
          color: #a89060;
          line-height: 1.6;
        }

        .tut-board-wrap {
          margin-top: 12px;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 8px 40px rgba(0,0,0,0.6);
        }

        .tut-flash {
          position: fixed;
          top: 80px;
          left: 50%;
          transform: translateX(-50%);
          padding: 10px 20px;
          border-radius: 20px;
          font-family: 'Cinzel', serif;
          font-size: 13px;
          font-weight: 600;
          color: #000;
          z-index: 500;
          pointer-events: none;
          animation: flashIn 0.2s ease, flashOut 0.3s ease 1.7s forwards;
          white-space: nowrap;
        }
        @keyframes flashIn  { from { opacity:0; transform:translateX(-50%) translateY(-6px); } to { opacity:1; transform:translateX(-50%) translateY(0); } }
        @keyframes flashOut { from { opacity:1; } to { opacity:0; } }

        /* Card overlay */
        .tut-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.75);
          backdrop-filter: blur(4px);
          z-index: 300;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          padding-bottom: calc(20px + env(safe-area-inset-bottom));
        }
        .tut-overlay-inner {
          background: #0f172a;
          border-top: 1px solid rgba(255,215,100,0.15);
          border-radius: 24px 24px 0 0;
          padding: 20px 16px;
          animation: slideUp 0.35s cubic-bezier(0.34,1.56,0.64,1);
        }
        @keyframes slideUp { from { transform:translateY(100%); } to { transform:translateY(0); } }
        .tut-overlay-title {
          font-family: 'Cinzel', serif;
          font-size: 12px;
          letter-spacing: 0.25em;
          color: #c8973a;
          text-align: center;
          margin-bottom: 16px;
          text-transform: uppercase;
        }
        .tut-card-row {
          display: flex;
          gap: 10px;
          justify-content: center;
          flex-wrap: wrap;
          margin-bottom: 16px;
        }
        .tut-card {
          width: 90px;
          border-radius: 12px;
          overflow: hidden;
          border: 2px solid transparent;
          cursor: pointer;
          transition: border-color 0.2s, transform 0.15s, box-shadow 0.2s;
          position: relative;
          background: #1e293b;
          flex-shrink: 0;
        }
        .tut-card:active { transform: scale(0.97); }
        .tut-card.selected { transform: scale(1.04); }
        .tut-card img {
          width: 100%;
          height: 110px;
          object-fit: cover;
          display: block;
        }
        .tut-card-footer {
          padding: 6px 8px;
          background: rgba(0,0,0,0.7);
        }
        .tut-card-name {
          font-family: 'Cinzel', serif;
          font-size: 10px;
          color: #f5e9c8;
          margin-bottom: 2px;
        }
        .tut-card-desc {
          font-size: 9px;
          color: #888;
          line-height: 1.3;
        }
        .tut-card-tier {
          position: absolute;
          top: 5px;
          left: 5px;
          background: rgba(0,0,0,0.8);
          color: #ffd700;
          font-family: 'Cinzel', serif;
          font-size: 9px;
          padding: 2px 5px;
          border-radius: 4px;
        }
        .tut-card-cost {
          position: absolute;
          top: 5px;
          right: 5px;
          background: rgba(0,0,0,0.8);
          color: #ffd700;
          font-size: 9px;
          font-weight: bold;
          padding: 2px 5px;
          border-radius: 4px;
        }
        .tut-use-btn {
          display: block;
          width: 100%;
          padding: 13px;
          font-family: 'Cinzel', serif;
          font-size: 13px;
          letter-spacing: 0.08em;
          border: none;
          border-radius: 12px;
          cursor: pointer;
          font-weight: 600;
          margin-bottom: 10px;
          transition: opacity 0.2s;
        }
        .tut-use-btn:disabled { opacity: 0.35; cursor: default; }
        .tut-cancel-btn {
          display: block;
          width: 100%;
          padding: 10px;
          font-size: 12px;
          color: #666;
          background: none;
          border: none;
          cursor: pointer;
          font-family: 'Cinzel', serif;
          letter-spacing: 0.05em;
        }

        /* Bottom fixed row */
        .tut-bottom {
          position: fixed;
          bottom: calc(20px + env(safe-area-inset-bottom));
          left: 0;
          right: 0;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 20px;
          pointer-events: none;
        }
        .tut-menu-btn {
          pointer-events: auto;
          padding: 10px 18px;
          font-size: 12px;
          font-family: 'Cinzel', serif;
          background: #e94560;
          color: #fff;
          border: none;
          border-radius: 20px;
          cursor: pointer;
          font-weight: bold;
          box-shadow: 0 4px 15px rgba(233,69,96,0.5);
        }
        .tut-ahvan-btn {
          pointer-events: auto;
          height: 52px;
          border-radius: 26px;
          padding: 0 20px;
          background: #c8973a;
          border: none;
          font-size: 14px;
          font-family: 'Cinzel', serif;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          color: #060810;
          font-weight: bold;
          box-shadow: 0 4px 20px rgba(200,151,58,0.55);
          white-space: nowrap;
        }
        .tut-ahvan-btn.pulse {
          animation: ahvanPulse 1.5s infinite;
        }
        @keyframes ahvanPulse {
          0%,100% { box-shadow: 0 4px 20px rgba(200,151,58,0.55); transform: scale(1); }
          50%      { box-shadow: 0 4px 32px rgba(200,151,58,0.9);  transform: scale(1.04); }
        }

        /* Activation mode banner */
        .tut-activation {
          width: calc(100% - 32px);
          margin: 10px 16px 0;
          padding: 10px 14px;
          border-radius: 10px;
          background: rgba(251,191,36,0.12);
          border: 1px solid rgba(251,191,36,0.3);
          font-size: 13px;
          color: #fbbf24;
          text-align: center;
          font-family: 'Cinzel', serif;
          letter-spacing: 0.05em;
        }

        /* Complete screen */
        .tut-complete {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          flex: 1;
          padding: 40px 32px;
          text-align: center;
          gap: 20px;
          opacity: 0;
          transform: translateY(20px);
          transition: opacity 0.6s ease, transform 0.6s ease;
        }
        .tut-complete.show { opacity: 1; transform: translateY(0); }
        .tut-complete-glyph {
          font-size: 64px;
          animation: floatGlyph 3s ease-in-out infinite;
        }
        @keyframes floatGlyph {
          0%,100% { transform: translateY(0); }
          50%      { transform: translateY(-10px); }
        }
        .tut-complete-title {
          font-family: 'Cinzel', serif;
          font-size: 28px;
          color: #f5e9c8;
          letter-spacing: 0.05em;
        }
        .tut-complete-sub {
          font-size: 16px;
          color: #a89060;
          line-height: 1.7;
          max-width: 280px;
        }
        .tut-complete-btn {
          padding: 16px 40px;
          font-family: 'Cinzel', serif;
          font-size: 14px;
          letter-spacing: 0.1em;
          background: #c8973a;
          color: #060810;
          border: none;
          border-radius: 50px;
          cursor: pointer;
          font-weight: 700;
          box-shadow: 0 4px 24px rgba(200,151,58,0.5);
        }
      `}</style>

      <div className="tut-root">
        {/* Nav */}
        <div className="tut-nav">
          <div className="tut-nav-title">✦ Tutorial</div>
          <button className="tut-nav-back" onClick={onBack}>✕ Exit</button>
        </div>

        {/* Flash */}
        {flash && (
          <div className="tut-flash" style={{ backgroundColor: flash.color }}>
            {flash.msg}
          </div>
        )}

        {isComplete ? (
          <div className={`tut-complete ${visible ? "show" : ""}`}>
            <div className="tut-complete-glyph">🌟</div>
            <div className="tut-complete-title">You are ready</div>
            <div className="tut-complete-sub">
              The Navagraha bow to you. Enter the board with their blessings — and face whatever the Asura dare send.
            </div>
            <button className="tut-complete-btn" onClick={onBack}>Begin your journey</button>
          </div>
        ) : (
          <>
            {/* Progress pips */}
            <div className="tut-progress" style={{ width: "calc(100% - 32px)" }}>
              {PHASES.filter(p => p.id !== "complete").map((p, i) => (
                <div key={p.id} className={`tut-pip ${i < phaseIdx ? "done" : ""}`} />
              ))}
            </div>

            {/* Hint card */}
            <div className={`tut-hint ${visible ? "show" : ""}`}>
              <div className="tut-hint-title">{phase.title}</div>
              <div className="tut-hint-body">{phase.body}</div>
            </div>

            {/* Activation banner */}
            {activationMode && (
              <div className="tut-activation">
                ⚡ Tap one of your glowing pieces
              </div>
            )}

            {/* Board */}
            <div className="tut-board-wrap" style={{ marginBottom: "80px" }}>
              <Chessboard
                position={game.fen()}
                onPieceDrop={onPieceDrop}
                onSquareClick={onSquareClick}
                boardWidth={boardWidth}
                animationDuration={220}
                customDarkSquareStyle={{ backgroundColor: "#6b1a1a" }}
                customLightSquareStyle={{ backgroundColor: "#8b2020" }}
                customSquareStyles={customSquareStyles}
              />
            </div>

            {/* Bottom buttons */}
            <div className="tut-bottom">
              <button className="tut-menu-btn" onClick={onBack}>✕ Menu</button>
              <button
                className={`tut-ahvan-btn ${phase.arrow === "ahvan" && !activationMode ? "pulse" : ""}`}
                onClick={() => {
                  if (availableCards.length > 0) setShowOverlay(true);
                  else showFlash("Capture a piece first!", "#888");
                }}
              >
                ✨ Āhvān
              </button>
            </div>

            {/* Card overlay */}
            {showOverlay && (
              <div className="tut-overlay" onClick={(e) => { if (e.target === e.currentTarget) { setShowOverlay(false); setSelectedCard(null); } }}>
                <div className="tut-overlay-inner">
                  <div className="tut-overlay-title">✦ Celestial Powers ✦</div>

                  {availableCards.length === 0 ? (
                    <div style={{ textAlign: "center", color: "#666", fontSize: "14px", padding: "20px 0" }}>
                      Capture a piece to unlock powers
                    </div>
                  ) : (
                    <div className="tut-card-row">
                      {availableCards.map(card => (
                        <div
                          key={card.id}
                          className={`tut-card ${selectedCard?.id === card.id ? "selected" : ""}`}
                          style={{
                            borderColor: selectedCard?.id === card.id ? card.color : "rgba(255,255,255,0.1)",
                            boxShadow: selectedCard?.id === card.id ? `0 0 16px ${card.color}88` : "none",
                          }}
                          onClick={() => setSelectedCard(selectedCard?.id === card.id ? null : card)}
                        >
                          <div className="tut-card-tier">Tier {tierLabel(card.tier)}</div>
                          <div className="tut-card-cost">{card.cost}s</div>
                          <img src={`${process.env.PUBLIC_URL}${card.image}`} alt={card.name} />
                          <div className="tut-card-footer">
                            <div className="tut-card-name">{card.name}</div>
                            <div className="tut-card-desc">{card.description}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <button
                    className="tut-use-btn"
                    disabled={!selectedCard}
                    style={{
                      backgroundColor: selectedCard ? selectedCard.color : "#333",
                      color: selectedCard ? "#000" : "#666",
                    }}
                    onClick={() => {
                      if (!selectedCard) return;
                      setShowOverlay(false);
                      setActivationMode(true);
                      if (selectedCard.id === "MANGALA") {
                        showFlash("Drag Mangala's warrior onto an adjacent enemy", "#ef4444");
                      } else {
                        showFlash(`Tap a piece to empower with ${selectedCard.name}`, selectedCard.color);
                      }
                    }}
                  >
                    Use {selectedCard?.name ?? "Power"}
                  </button>
                  <button className="tut-cancel-btn" onClick={() => { setShowOverlay(false); setSelectedCard(null); }}>
                    ← Back
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}