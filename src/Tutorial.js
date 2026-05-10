import { useState, useEffect, useCallback } from "react";
import { Chess } from "chess.js";
import { Chessboard } from "react-chessboard";

// ─── Card definitions (tutorial subset) ──────────────────────────────────────
const RAHU   = { id: "RAHU",  name: "Rahu",  color: "#9333ea", tier: 1, cost: 7,  description: "Pass through pieces for 2 moves",                                                              image: "/images/rahu.jpg"  };
const GURU   = { id: "GURU",  name: "Guru",  color: "#a855f7", tier: 2, cost: 9,  description: "Spawn a real duplicate left or right — it moves and can capture for 2 turns before it dissolves", image: "/images/guru.jpg"  };
const BUDHA  = { id: "BUDHA", name: "Budha", color: "#3b82f6", tier: 3, cost: 10, description: "One piece can move twice in one turn. But not if the first move is a capture.",               image: "/images/budha.jpg" };

// ─── Starting FEN ─────────────────────────────────────────────────────────────
const INITIAL_FEN = "2kr3r/1ppb1ppp/p1nb1n2/3ppq2/3P3P/1PN1QPP1/PBP1P1B1/R3K1NR w KQkq - 0 1";

// ─── Tutorial steps ───────────────────────────────────────────────────────────
// type: "move"         — player drags piece from `from` to `to`
// type: "select_card"  — player must open Āhvān and select `card`
// type: "activate"     — player clicks `targetSquare` to apply selected card
// type: "power_move"   — player drags powered piece from `from` to `to`
// type: "power_move2"  — Budha's second move
// type: "complete"     — tutorial finished

const STEPS = [
  {
    id: "move1_capture",
    type: "move",
    from: "d4", to: "e5",
    title: "Move 1 — Capture the pawn",
    body: "Drag your d4 pawn to e5 to capture the black pawn. This will unlock your first celestial power.",
    highlightSquares: ["d4", "e5"],
    availableCards: [],
    botReply: { from: "d6", to: "e5" },
    flashMsg: "Pawn captured! ✨ Rahu awakens — Tier 1 unlocked!",
    flashColor: "#9333ea",
  },
  {
    id: "move2_select",
    type: "select_card",
    card: RAHU,
    title: "Move 2 — Summon Rahu",
    body: "Open Āhvān and select Rahu. Your g2 bishop will be empowered to pass through pieces.",
    highlightSquares: [],
    availableCards: [RAHU],
    pulseAhvan: true,
  },
  {
    id: "move2_activate",
    type: "activate",
    card: RAHU,
    targetSquare: "g2",
    title: "Move 2 — Empower the bishop",
    body: "Tap your g2 bishop to activate Rahu on it.",
    highlightSquares: ["g2"],
    availableCards: [RAHU],
  },
  {
    id: "move2_capture",
    type: "power_move",
    card: RAHU,
    from: "g2", to: "c6",
    title: "Move 2 — Bishop takes knight",
    body: "Drag your powered bishop from g2 to c6 to capture the black knight.",
    highlightSquares: ["g2", "c6"],
    availableCards: [RAHU],
    botReply: { from: "b7", to: "c6" },
    flashMsg: "Knight captured! 🪐 Guru awakens — Tier 2 unlocked!",
    flashColor: "#a855f7",
  },
  {
    id: "move3_select",
    type: "select_card",
    card: GURU,
    title: "Move 3 — Summon Guru",
    body: "Open Āhvān and select Guru. Your h4 pawn will spawn a duplicate on g4 — ready to strike.",
    highlightSquares: [],
    availableCards: [RAHU, GURU],
    pulseAhvan: true,
  },
  {
    id: "move3_activate",
    type: "activate",
    card: GURU,
    targetSquare: "h4",
    title: "Move 3 — Empower the pawn",
    body: "Tap your h4 pawn to activate Guru. A duplicate will appear on g4.",
    highlightSquares: ["h4"],
    availableCards: [RAHU, GURU],
  },
  {
    id: "move3_capture",
    type: "power_move",
    card: GURU,
    from: "g4", to: "f5",
    title: "Move 3 — Duplicate takes the queen!",
    body: "The duplicate pawn is on g4. Drag it to f5 to capture the black queen!",
    highlightSquares: ["g4", "f5"],
    availableCards: [RAHU, GURU],
    botReply: { from: "g7", to: "g6" },
    flashMsg: "Queen captured! 🔥 Budha awakens — Tier 3 unlocked!",
    flashColor: "#3b82f6",
  },
  {
    id: "move4_select",
    type: "select_card",
    card: BUDHA,
    title: "Move 4 — Summon Budha",
    body: "Open Āhvān and select Budha. Your e3 queen will be granted two moves this turn — enough for checkmate.",
    highlightSquares: [],
    availableCards: [RAHU, GURU, BUDHA],
    pulseAhvan: true,
  },
  {
    id: "move4_activate",
    type: "activate",
    card: BUDHA,
    targetSquare: "e3",
    title: "Move 4 — Empower the queen",
    body: "Tap your e3 queen to activate Budha — it will move twice this turn.",
    highlightSquares: ["e3"],
    availableCards: [RAHU, GURU, BUDHA],
  },
  {
    id: "move4_first",
    type: "power_move",
    card: BUDHA,
    from: "e3", to: "a7",
    title: "Move 4 — Queen to a7",
    body: "Drag your queen to a7. That's the first of two moves — one more to deliver checkmate.",
    highlightSquares: ["e3", "a7"],
    availableCards: [RAHU, GURU, BUDHA],
    botReply: null,
    flashMsg: "First move done! Now finish it...",
    flashColor: "#3b82f6",
  },
  {
    id: "move4_checkmate",
    type: "power_move2",
    card: BUDHA,
    from: "a7", to: "a8",
    title: "Move 4 — Checkmate!",
    body: "Now drag your queen to a8. The king is trapped — checkmate!",
    highlightSquares: ["a7", "a8"],
    availableCards: [RAHU, GURU, BUDHA],
    flashMsg: "Checkmate! ♟️ The cosmos bows to you.",
    flashColor: "#fbbf24",
  },
  {
    id: "complete",
    type: "complete",
    title: "You are ready",
    body: "",
    highlightSquares: [],
    availableCards: [],
  },
];

export default function Tutorial({ onBack }) {
  const [game, setGame]                       = useState(() => new Chess(INITIAL_FEN));
  const [stepIdx, setStepIdx]                 = useState(0);
  const [showOverlay, setShowOverlay]         = useState(false);
  const [selectedCard, setSelectedCard]       = useState(null);
  const [activatedSquare, setActivatedSquare] = useState(null);
  const [flash, setFlash]                     = useState(null);
  const [boardWidth, setBoardWidth]           = useState(360);
  const [visible, setVisible]                 = useState(false);
  const [botThinking, setBotThinking]         = useState(false);

  const step = STEPS[stepIdx];

  useEffect(() => { setTimeout(() => setVisible(true), 60); }, []);

  useEffect(() => {
    const update = () => setBoardWidth(Math.min(window.innerWidth, 480) - 16);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  // ── Flash ────────────────────────────────────────────────────────────────────
  const showFlash = (msg, color = "#fbbf24") => {
    setFlash({ msg, color });
    setTimeout(() => setFlash(null), 2200);
  };

  // ── Bot reply (force-moves regardless of chess rules) ────────────────────────
  const doBotReply = useCallback((g, reply) => {
    if (!reply) return;
    setBotThinking(true);
    setTimeout(() => {
      const clone = new Chess(g.fen());
      const piece = clone.get(reply.from);
      if (piece) {
        clone.remove(reply.from);
        clone.remove(reply.to); // remove any piece on target
        clone.put(piece, reply.to);
      }
      setGame(clone);
      setBotThinking(false);
    }, 900);
  }, []);

  // ── Advance step ─────────────────────────────────────────────────────────────
  const advance = useCallback(() => {
    setStepIdx(i => Math.min(i + 1, STEPS.length - 1));
  }, []);

  // ── Piece drop ───────────────────────────────────────────────────────────────
  const onPieceDrop = useCallback((sourceSquare, targetSquare) => {
    if (botThinking) return false;

    if (step.type === "move" || step.type === "power_move") {
      if (sourceSquare !== step.from || targetSquare !== step.to) {
        showFlash(`Try ${step.from.toUpperCase()} → ${step.to.toUpperCase()}`, "#888");
        return false;
      }
      const clone = new Chess(game.fen());
      const piece = clone.get(sourceSquare);
      if (!piece) return false;
      clone.remove(sourceSquare);
      clone.remove(targetSquare);
      clone.put(piece, targetSquare);
      setGame(clone);
      if (step.flashMsg) showFlash(step.flashMsg, step.flashColor);
      if (step.botReply) doBotReply(clone, step.botReply);
      setActivatedSquare(null);
      setTimeout(advance, step.botReply ? 1100 : 400);
      return true;
    }

    if (step.type === "power_move2") {
      if (sourceSquare !== step.from || targetSquare !== step.to) {
        showFlash(`Move your queen to ${step.to.toUpperCase()}`, "#888");
        return false;
      }
      const clone = new Chess(game.fen());
      const piece = clone.get(sourceSquare);
      if (!piece) return false;
      clone.remove(sourceSquare);
      clone.remove(targetSquare);
      clone.put(piece, targetSquare);
      setGame(clone);
      if (step.flashMsg) showFlash(step.flashMsg, step.flashColor);
      setTimeout(advance, 900);
      return true;
    }

    showFlash("Follow the hint above ✦", "#888");
    return false;
  }, [game, step, advance, doBotReply, botThinking]);

  // ── Square click (activate step) ─────────────────────────────────────────────
  const onSquareClick = useCallback((square) => {
    if (step.type !== "activate") return;
    if (square !== step.targetSquare) {
      showFlash(`Tap the highlighted square: ${step.targetSquare.toUpperCase()}`, "#888");
      return;
    }

    // Guru: place duplicate one file left of h4 → g4
    if (step.card.id === "GURU") {
      const clone = new Chess(game.fen());
      const piece = clone.get(square);
      if (piece) {
        const files = "abcdefgh";
        const fi = files.indexOf(square[0]);
        const rank = square[1];
        const dupFile = fi > 0 ? files[fi - 1] : files[fi + 1];
        const dupSquare = `${dupFile}${rank}`;
        if (!clone.get(dupSquare)) {
          clone.put({ type: piece.type, color: piece.color }, dupSquare);
          setGame(clone);
          showFlash("Duplicate summoned on g4! 🪐", "#a855f7");
        }
      }
    } else {
      showFlash(`${step.card.name} activated! ✨`, step.card.color);
    }

    setActivatedSquare(square);
    setTimeout(advance, 700);
  }, [step, game, advance]);

  // ── Square styles ─────────────────────────────────────────────────────────────
  const customSquareStyles = {};
  (step.highlightSquares || []).forEach((sq, i) => {
    customSquareStyles[sq] = {
      backgroundColor: i === 0 ? "rgba(251,191,36,0.45)" : "rgba(239,68,68,0.45)",
      borderRadius: "4px",
    };
  });
  if (step.type === "activate" && step.targetSquare) {
    customSquareStyles[step.targetSquare] = {
      backgroundColor: `${step.card.color}55`,
      boxShadow: `inset 0 0 0 3px ${step.card.color}`,
      borderRadius: "4px",
    };
  }
  if (activatedSquare && step.type !== "activate") {
    customSquareStyles[activatedSquare] = {
      boxShadow: `inset 0 0 0 3px ${step.card?.color || "#fbbf24"}`,
      borderRadius: "4px",
    };
  }

  const isComplete    = step.type === "complete";
  const pulseAhvan    = !!step.pulseAhvan && !showOverlay;
  const progressSteps = STEPS.filter(s => s.type !== "complete");
  const progressIdx   = progressSteps.findIndex(s => s.id === step.id);
  const tierLabel     = t => ({ 1: "I", 2: "II", 3: "III" }[t]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Crimson+Pro:ital,wght@0,300;0,400;1,300;1,400&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        .tut-root{min-height:100vh;background:#060810;color:#e8dfc8;font-family:'Crimson Pro',Georgia,serif;display:flex;flex-direction:column;align-items:center;overflow-x:hidden;padding-bottom:env(safe-area-inset-bottom);}
        .tut-nav{width:100%;display:flex;align-items:center;justify-content:space-between;padding:14px 20px;background:rgba(6,8,16,0.95);backdrop-filter:blur(12px);border-bottom:1px solid rgba(255,215,100,0.1);position:sticky;top:0;z-index:50;}
        .tut-nav-title{font-family:'Cinzel',serif;font-size:11px;letter-spacing:0.3em;color:#c8973a;text-transform:uppercase;}
        .tut-nav-back{font-family:'Cinzel',serif;font-size:11px;color:#060810;background:#c8973a;padding:7px 16px;border-radius:50px;border:none;cursor:pointer;}
        .tut-progress{display:flex;gap:5px;padding:12px 16px 0;width:100%;}
        .tut-pip{height:3px;border-radius:2px;background:rgba(255,255,255,0.1);flex:1;transition:background 0.4s;}
        .tut-pip.done{background:#c8973a;}
        .tut-pip.active{background:rgba(200,151,58,0.5);}
        .tut-hint{width:calc(100% - 32px);margin:12px 16px 0;padding:14px 16px;border-radius:14px;border:1px solid rgba(255,215,100,0.15);background:rgba(255,255,255,0.04);opacity:0;transform:translateY(8px);transition:opacity 0.4s,transform 0.4s;}
        .tut-hint.show{opacity:1;transform:translateY(0);}
        .tut-hint-title{font-family:'Cinzel',serif;font-size:13px;color:#f5e9c8;margin-bottom:5px;letter-spacing:0.05em;}
        .tut-hint-body{font-size:14px;color:#a89060;line-height:1.6;}
        .tut-board-wrap{margin-top:12px;border-radius:8px;overflow:hidden;box-shadow:0 8px 40px rgba(0,0,0,0.6);}
        .tut-thinking{width:calc(100% - 32px);margin:8px 16px 0;padding:8px 14px;border-radius:10px;background:rgba(233,69,96,0.1);border:1px solid rgba(233,69,96,0.25);font-size:12px;color:#e94560;font-family:'Cinzel',serif;text-align:center;letter-spacing:0.05em;}
        .tut-bot{position:fixed;bottom:calc(20px + env(safe-area-inset-bottom));left:0;right:0;display:flex;align-items:center;justify-content:space-between;padding:0 20px;pointer-events:none;}
        .tut-menu-btn{pointer-events:auto;padding:10px 18px;font-size:12px;font-family:'Cinzel',serif;background:#e94560;color:#fff;border:none;border-radius:20px;cursor:pointer;font-weight:bold;box-shadow:0 4px 15px rgba(233,69,96,0.5);}
        .tut-ahvan-btn{pointer-events:auto;height:52px;border-radius:26px;padding:0 20px;background:#c8973a;border:none;font-size:14px;font-family:'Cinzel',serif;cursor:pointer;display:flex;align-items:center;gap:6px;color:#060810;font-weight:bold;box-shadow:0 4px 20px rgba(200,151,58,0.55);white-space:nowrap;}
        .tut-ahvan-btn.pulse{animation:ahvanPulse 1.4s infinite;}
        @keyframes ahvanPulse{0%,100%{box-shadow:0 4px 20px rgba(200,151,58,0.55);transform:scale(1);}50%{box-shadow:0 4px 36px rgba(200,151,58,0.95);transform:scale(1.05);}}
        .tut-flash{position:fixed;top:80px;left:50%;transform:translateX(-50%);padding:10px 22px;border-radius:20px;font-family:'Cinzel',serif;font-size:13px;font-weight:600;color:#000;z-index:500;pointer-events:none;animation:flashIn 0.2s ease,flashOut 0.3s ease 1.9s forwards;white-space:nowrap;}
        @keyframes flashIn{from{opacity:0;transform:translateX(-50%) translateY(-8px);}to{opacity:1;transform:translateX(-50%) translateY(0);}}
        @keyframes flashOut{from{opacity:1;}to{opacity:0;}}
        .tut-overlay{position:fixed;inset:0;background:rgba(0,0,0,0.78);backdrop-filter:blur(4px);z-index:300;display:flex;flex-direction:column;justify-content:flex-end;padding-bottom:calc(20px + env(safe-area-inset-bottom));}
        .tut-overlay-inner{background:#0f172a;border-top:1px solid rgba(255,215,100,0.15);border-radius:24px 24px 0 0;padding:20px 16px;animation:slideUp 0.32s cubic-bezier(0.34,1.56,0.64,1);}
        @keyframes slideUp{from{transform:translateY(100%);}to{transform:translateY(0);}}
        .tut-overlay-title{font-family:'Cinzel',serif;font-size:12px;letter-spacing:0.25em;color:#c8973a;text-align:center;margin-bottom:16px;text-transform:uppercase;}
        .tut-card-row{display:flex;gap:10px;justify-content:center;flex-wrap:wrap;margin-bottom:16px;}
        .tut-card{width:88px;border-radius:12px;overflow:hidden;border:2px solid rgba(255,255,255,0.08);cursor:pointer;transition:border-color 0.2s,transform 0.15s,box-shadow 0.2s;position:relative;background:#1e293b;flex-shrink:0;}
        .tut-card.selected{transform:scale(1.05);}
        .tut-card.locked{opacity:0.35;cursor:default;pointer-events:none;}
        .tut-card img{width:100%;height:108px;object-fit:cover;display:block;}
        .tut-card-footer{padding:6px 8px;background:rgba(0,0,0,0.65);}
        .tut-card-name{font-family:'Cinzel',serif;font-size:10px;color:#f5e9c8;margin-bottom:2px;}
        .tut-card-desc{font-size:9px;color:#888;line-height:1.3;}
        .tut-card-tier{position:absolute;top:5px;left:5px;background:rgba(0,0,0,0.8);color:#ffd700;font-family:'Cinzel',serif;font-size:9px;padding:2px 5px;border-radius:4px;}
        .tut-card-cost{position:absolute;top:5px;right:5px;background:rgba(0,0,0,0.8);color:#ffd700;font-size:9px;font-weight:bold;padding:2px 5px;border-radius:4px;}
        .tut-use-btn{display:block;width:100%;padding:13px;font-family:'Cinzel',serif;font-size:13px;letter-spacing:0.08em;border:none;border-radius:12px;cursor:pointer;font-weight:600;margin-bottom:10px;transition:opacity 0.2s;}
        .tut-use-btn:disabled{opacity:0.35;cursor:default;}
        .tut-cancel-btn{display:block;width:100%;padding:10px;font-size:12px;color:#555;background:none;border:none;cursor:pointer;font-family:'Cinzel',serif;letter-spacing:0.05em;}
        .tut-complete{display:flex;flex-direction:column;align-items:center;justify-content:center;flex:1;padding:40px 32px;text-align:center;gap:20px;opacity:0;transform:translateY(20px);transition:opacity 0.6s,transform 0.6s;}
        .tut-complete.show{opacity:1;transform:translateY(0);}
        .tut-complete-glyph{font-size:64px;animation:floatG 3s ease-in-out infinite;}
        @keyframes floatG{0%,100%{transform:translateY(0);}50%{transform:translateY(-10px);}}
        .tut-complete-title{font-family:'Cinzel',serif;font-size:28px;color:#f5e9c8;letter-spacing:0.05em;}
        .tut-complete-sub{font-size:16px;color:#a89060;line-height:1.7;max-width:280px;}
        .tut-complete-btn{padding:16px 40px;font-family:'Cinzel',serif;font-size:14px;letter-spacing:0.1em;background:#c8973a;color:#060810;border:none;border-radius:50px;cursor:pointer;font-weight:700;box-shadow:0 4px 24px rgba(200,151,58,0.5);}
      `}</style>

      <div className="tut-root">

        <div className="tut-nav">
          <div className="tut-nav-title">✦ Tutorial</div>
          <button className="tut-nav-back" onClick={onBack}>✕ Exit</button>
        </div>

        {flash && <div className="tut-flash" style={{ backgroundColor: flash.color }}>{flash.msg}</div>}

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
            <div className="tut-progress">
              {progressSteps.map((s, i) => (
                <div key={s.id} className={`tut-pip ${i < progressIdx ? "done" : i === progressIdx ? "active" : ""}`} />
              ))}
            </div>

            <div className={`tut-hint ${visible ? "show" : ""}`}>
              <div className="tut-hint-title">{step.title}</div>
              <div className="tut-hint-body">{step.body}</div>
            </div>

            {botThinking && <div className="tut-thinking">👹 Black is responding...</div>}

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
                arePiecesDraggable={!botThinking}
              />
            </div>

            <div className="tut-bot">
              <button className="tut-menu-btn" onClick={onBack}>✕ Menu</button>
              <button
                className={`tut-ahvan-btn ${pulseAhvan ? "pulse" : ""}`}
                onClick={() => {
                  if (step.type === "select_card") setShowOverlay(true);
                  else showFlash("Make your board move first ✦", "#888");
                }}
              >
                ✨ Āhvān
              </button>
            </div>

            {showOverlay && (
              <div className="tut-overlay" onClick={e => { if (e.target === e.currentTarget) { setShowOverlay(false); setSelectedCard(null); } }}>
                <div className="tut-overlay-inner">
                  <div className="tut-overlay-title">✦ Celestial Powers ✦</div>
                  <div className="tut-card-row">
                    {[RAHU, GURU, BUDHA].map(card => {
                      const unlocked = step.availableCards.some(c => c.id === card.id);
                      const isTarget = step.card?.id === card.id;
                      return (
                        <div
                          key={card.id}
                          className={`tut-card ${!unlocked ? "locked" : ""} ${selectedCard?.id === card.id ? "selected" : ""}`}
                          style={{
                            borderColor: selectedCard?.id === card.id ? card.color : "rgba(255,255,255,0.08)",
                            boxShadow: isTarget && unlocked && !selectedCard ? `0 0 20px ${card.color}99` : selectedCard?.id === card.id ? `0 0 14px ${card.color}66` : "none",
                          }}
                          onClick={() => unlocked && setSelectedCard(selectedCard?.id === card.id ? null : card)}
                        >
                          <div className="tut-card-tier">Tier {tierLabel(card.tier)}</div>
                          <div className="tut-card-cost">{card.cost}s</div>
                          <img src={`${process.env.PUBLIC_URL}${card.image}`} alt={card.name} />
                          <div className="tut-card-footer">
                            <div className="tut-card-name">{card.name}</div>
                            <div className="tut-card-desc">{card.description}</div>
                          </div>
                          {!unlocked && (
                            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.55)", fontSize: "18px" }}>🔒</div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <button
                    className="tut-use-btn"
                    disabled={!selectedCard}
                    style={{ backgroundColor: selectedCard ? selectedCard.color : "#333", color: selectedCard ? "#000" : "#666" }}
                    onClick={() => {
                      if (!selectedCard) return;
                      if (selectedCard.id !== step.card?.id) {
                        showFlash(`Select ${step.card?.name} for this step`, "#888");
                        return;
                      }
                      setShowOverlay(false);
                      setSelectedCard(null);
                      advance();
                    }}
                  >
                    Use {selectedCard?.name ?? "Power"}
                  </button>
                  <button className="tut-cancel-btn" onClick={() => { setShowOverlay(false); setSelectedCard(null); }}>← Back</button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}