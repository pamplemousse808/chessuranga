import { useState, useEffect, useRef } from "react";
import { Chessboard } from "react-chessboard";
import { Chess } from "chess.js";

// ── Mobile detection ──────────────────────────────────────────────────────────
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);
  return isMobile;
}

const SHARED_DECK = [
  { id: "RAHU", name: "Rahu", color: "#9333ea", radius: 3, tier: 1, cost: 7, description: "Pass through pieces for 2 moves", image: "/images/rahu.jpg" },
  { id: "KETU", name: "Ketu", color: "#f97316", radius: 3, tier: 1, cost: 8, description: "When captured: +12s you, -12s opponent", image: "/images/ketu.jpg" },
  { id: "SURYA", name: "Surya", color: "#fbbf24", radius: 2, tier: 1, cost: 8, description: "Can't be captured for 2 moves", image: "/images/surya.jpg" },
  { id: "CHANDRA", name: "Chandra", color: "#e5e7eb", radius: 2, tier: 2, cost: 10, description: "Place 1-2 clones on rank (2nd = +5s)", image: "/images/chandra.jpg" },
  { id: "GURU", name: "Guru", color: "#a855f7", radius: 2, tier: 2, cost: 9, description: "Resurrect your piece where it died", image: "/images/guru.jpg" },
  { id: "SHUKRA", name: "Shukra", color: "#ec4899", radius: 2, tier: 2, cost: 11, description: "Triple time on next 2 captures", image: "/images/shukra.jpg" },
  { id: "BUDHA", name: "Budha", color: "#3b82f6", radius: 1, tier: 3, cost: 10, description: "Two moves (not if first captures)", image: "/images/budha.jpg" },
  { id: "MANGALA", name: "Mangala", color: "#ef4444", radius: 1, tier: 3, cost: 12, description: "Capture any adjacent piece", image: "/images/mangala.jpg" },
  { id: "SHANI", name: "Shani", color: "#1f2937", radius: 1, tier: 3, cost: 14, description: "Freeze enemy piece for 2 turns", image: "/images/shani.jpg" },
];

// ── HowToPlay ─────────────────────────────────────────────────────────────────
function HowToPlay() {
  const [activeTab, setActiveTab] = useState("asura");
  const sharedTop = (
    <>
      <div style={{ marginBottom: "14px" }}>
        <div style={{ fontWeight: "bold", fontSize: "15px", marginBottom: "6px" }}>🔓 Unlocking Powers</div>
        <div style={{ fontSize: "13px", opacity: 0.9, lineHeight: "1.8" }}>
          <div>♟ Capture a <strong>pawn</strong> → Tier 1</div>
          <div>♞ Capture a <strong>knight or bishop</strong> → Tier 2</div>
          <div>♜ Capture a <strong>rook or queen</strong> → Tier 3</div>
        </div>
      </div>
      <div style={{ marginBottom: "14px" }}>
        <div style={{ fontWeight: "bold", fontSize: "15px", marginBottom: "4px" }}>⏱️ Watch the Clock</div>
        <div style={{ fontSize: "13px", opacity: 0.9, lineHeight: "1.5" }}>
          Using Navagraha powers costs you time. But capturing enemies earns it back — so play bold!
        </div>
      </div>
    </>
  );
  const footer = (
    <div style={{ textAlign: "center", fontSize: "14px", fontWeight: "bold", borderTop: "2px solid rgba(255,255,255,0.3)", paddingTop: "12px" }}>
      Good luck. The cosmos is counting on you. 🙏
    </div>
  );
  return (
    <div style={{ maxWidth: "400px", margin: "0 auto" }}>
      <div style={{ display: "flex", marginBottom: "0", borderRadius: "12px 12px 0 0", overflow: "hidden" }}>
        <button onClick={() => setActiveTab("asura")} style={{ flex: 1, padding: "12px", fontSize: "14px", fontWeight: "bold", border: "none", cursor: "pointer", backgroundColor: activeTab === "asura" ? "#ff4444" : "#3a2a2a", color: "#fff" }}>👹 Asura Horde</button>
        <button onClick={() => setActiveTab("shukra")} style={{ flex: 1, padding: "12px", fontSize: "14px", fontWeight: "bold", border: "none", cursor: "pointer", backgroundColor: activeTab === "shukra" ? "#e8d5a3" : "#2a2a1a", color: activeTab === "shukra" ? "#1a0a00" : "#fff" }}>☄️ Shukracharya</button>
      </div>
      <div style={{ backgroundColor: activeTab === "asura" ? "#ff4444" : "#c8a96e", border: `3px solid ${activeTab === "asura" ? "#ff6b6b" : "#e8d5a3"}`, borderTop: "none", borderRadius: "0 0 16px 16px", padding: "24px", color: activeTab === "asura" ? "#fff" : "#1a0a00", boxShadow: activeTab === "asura" ? "0 0 40px rgba(255,68,68,0.4)" : "0 0 40px rgba(232,213,163,0.3)", textAlign: "left" }}>
        {activeTab === "asura" ? (
          <>
            <div style={{ marginBottom: "14px" }}><div style={{ fontWeight: "bold", fontSize: "15px", marginBottom: "4px" }}>⚔️ Your Quest</div><div style={{ fontSize: "13px", opacity: 0.9, lineHeight: "1.5" }}>The Demon King has invaded — and for reasons best not questioned, challenged you to a game of chess.</div></div>
            <div style={{ marginBottom: "14px" }}><div style={{ fontWeight: "bold", fontSize: "15px", marginBottom: "4px" }}>🌟 Your Allies</div><div style={{ fontSize: "13px", opacity: 0.9, lineHeight: "1.5" }}>The celestial Navagraha have descended to lend you their cosmic powers. Hoss!!</div></div>
            {sharedTop}
            <div style={{ marginBottom: "18px" }}><div style={{ fontWeight: "bold", fontSize: "15px", marginBottom: "4px" }}>☠️ Beware</div><div style={{ fontSize: "13px", opacity: 0.9, lineHeight: "1.5" }}>The demon horde regenerates. Slay them once and they'll return. Only by truly overwhelming them can you win.</div></div>
            {footer}
          </>
        ) : (
          <>
            <div style={{ marginBottom: "14px" }}><div style={{ fontWeight: "bold", fontSize: "15px", marginBottom: "4px" }}>☄️ Your Challenge</div><div style={{ fontSize: "13px", opacity: 0.9, lineHeight: "1.5" }}>Take on Shukracharya, Guru of the Asuras — the mastermind behind the horde.</div></div>
            <div style={{ marginBottom: "14px" }}><div style={{ fontWeight: "bold", fontSize: "15px", marginBottom: "4px" }}>🌟 Your Allies</div><div style={{ fontSize: "13px", opacity: 0.9, lineHeight: "1.5" }}>The Navagraha have granted you their cosmic powers. Use them wisely — you'll need every one.</div></div>
            {sharedTop}
            {footer}
          </>
        )}
      </div>
    </div>
  );
}

// ── Mobile Card Overlay ───────────────────────────────────────────────────────
function MobileCardOverlay({
  show, onClose, tier1Unlocked, tier2Unlocked, tier3Unlocked,
  selectedCard, onSelectCard, gameMode, getCardCost, currentTurn,
  usedCards, cardCooldowns
}) {
  if (!show) return null;
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 300, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
      <div onClick={onClose} style={{ position: "absolute", inset: 0, backgroundColor: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }} />
      <div style={{ position: "relative", backgroundColor: "#0f172a", borderRadius: "24px 24px 0 0", padding: "16px 16px 40px", maxHeight: "75vh", overflowY: "auto", boxShadow: "0 -8px 40px rgba(0,0,0,0.8)" }}>
        <div style={{ width: "40px", height: "4px", backgroundColor: "#334155", borderRadius: "2px", margin: "0 auto 16px" }} />
        <h3 style={{ color: "#e2e8f0", textAlign: "center", margin: "0 0 16px", fontSize: "16px" }}>🌟 Navagraha Powers</h3>
        {[1, 2, 3].map(tier => {
          const tierCards = SHARED_DECK.filter(c => c.tier === tier);
          const isUnlocked = (tier === 1 && tier1Unlocked) || (tier === 2 && tier2Unlocked) || (tier === 3 && tier3Unlocked);
          return (
            <div key={tier} style={{ marginBottom: "16px" }}>
              <div style={{ fontSize: "11px", color: "#64748b", marginBottom: "8px", textAlign: "center", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                Tier {tier} {!isUnlocked && "🔒"}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px" }}>
                {tierCards.map(card => {
                  const isUsed = (gameMode === "asura" || gameMode === "shukracharya") ? !!cardCooldowns[card.id] : usedCards.includes(card.id);
                  const cooldown = cardCooldowns[card.id];
                  const isSelected = selectedCard?.id === card.id;
                  const cost = getCardCost(card);
                  const canUse = isUnlocked && !isUsed && currentTurn === "w";
                  return (
                    <div
                      key={card.id}
                      onClick={() => {
                        if (canUse) {
                          onSelectCard(isSelected ? null : card);
                          if (!isSelected) onClose();
                        }
                      }}
                      style={{ borderRadius: "10px", overflow: "hidden", border: isSelected ? "3px solid #fff" : "2px solid #1e293b", opacity: isUsed ? 0.4 : 1, cursor: canUse ? "pointer" : "default", position: "relative", aspectRatio: "3/4" }}
                    >
                      {isUnlocked ? (
                        <>
                          <img src={card.image} alt={card.name} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", filter: isUsed ? "grayscale(80%)" : "none" }} />
                          <div style={{ position: "absolute", top: "4px", right: "4px", backgroundColor: "rgba(0,0,0,0.85)", color: "#ffd700", fontSize: "10px", fontWeight: "bold", padding: "2px 4px", borderRadius: "5px" }}>{cost}s</div>
                          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, backgroundColor: "rgba(0,0,0,0.8)", padding: "4px 5px" }}>
                            <div style={{ fontSize: "10px", fontWeight: "bold", color: "#fff" }}>{card.name}</div>
                            <div style={{ fontSize: "8px", color: "#aaa", lineHeight: "1.2" }}>{card.description}</div>
                          </div>
                          {cooldown && (
                            <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", backgroundColor: "rgba(0,0,0,0.8)", color: "#fff", fontWeight: "bold", fontSize: "20px", borderRadius: "50%", width: "36px", height: "36px", display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid #a855f7" }}>{cooldown}</div>
                          )}
                        </>
                      ) : (
                        <div style={{ width: "100%", height: "100%", backgroundColor: "#1e293b", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px" }}>🔒</div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Main App ──────────────────────────────────────────────────────────────────
function App() {
  const isMobile = useIsMobile();

  const [game, setGame] = useState(new Chess());
  const [moveFrom, setMoveFrom] = useState("");
  const [whiteTime, setWhiteTime] = useState(100);
  const [blackTime, setBlackTime] = useState(100);
  const [startingTime, setStartingTime] = useState(100);
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [moveCount, setMoveCount] = useState(0);
  const [shukraDifficulty, setShukraDifficulty] = useState(null);
  const [showShukraSelect, setShowShukraSelect] = useState(false);
  const [guruPickerMode, setGuruPickerMode] = useState(null);
  const [gameMode, setGameMode] = useState(null);
  const [whiteCaptured, setWhiteCaptured] = useState([]);
  const [blackCaptured, setBlackCaptured] = useState([]);
  const [captureHistory, setCaptureHistory] = useState([]);
  const [usedCards, setUsedCards] = useState([]);
  const [tier1Unlocked, setTier1Unlocked] = useState(false);
  const [tier2Unlocked, setTier2Unlocked] = useState(false);
  const [tier3Unlocked, setTier3Unlocked] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);
  const [cardCooldowns, setCardCooldowns] = useState({});
  const [activeTiles, setActiveTiles] = useState([]);
  const [poweredPieces, setPoweredPieces] = useState({});
  const [frozenPieces, setFrozenPieces] = useState({});
  const [chandraMode, setChandraMode] = useState(null);
  const [chandraPlacementMode, setChandraPlacementMode] = useState(null);
  const [guruMode, setGuruMode] = useState(null);
  const [resurrectedPieces, setResurrectedPieces] = useState({});
  const [shaniMode, setShaniMode] = useState(null);
  const [activationMode, setActivationMode] = useState(false);
  const [chaosModeShown, setChaosModeShown] = useState({ white: false, black: false });
  const [showChaosPopup, setShowChaosPopup] = useState(false);
  const [asuraLives, setAsuraLives] = useState({});
  const [stockfish, setStockfish] = useState(null);
  const stockfishRef = useRef(null);
  const stockfishMoveRef = useRef(null);
  const poweredPiecesRef = useRef(poweredPieces);
  const [waitingForBot, setWaitingForBot] = useState(false);
  const [gameOverDismissed, setGameOverDismissed] = useState(false);
  // Mobile UI state
  const [showCardOverlay, setShowCardOverlay] = useState(false);

  useEffect(() => {
    if ((gameMode === "asura" || gameMode === "shukracharya") && gameStarted && !stockfishRef.current) {
      let worker = null;
      fetch("https://cdnjs.cloudflare.com/ajax/libs/stockfish.js/10.0.2/stockfish.js")
        .then(res => res.text())
        .then(text => {
          const blob = new Blob([text], { type: "application/javascript" });
          const url = URL.createObjectURL(blob);
          worker = new Worker(url);
          worker.postMessage("uci");
          if (gameMode === "asura") worker.postMessage("setoption name Skill Level value 4");
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
          stockfishRef.current = { initialized: true, random: true };
          setStockfish({ initialized: true, random: true });
        });
      return () => { if (worker) { worker.terminate(); stockfishRef.current = null; } };
    }
  }, [gameMode, gameStarted]);

  useEffect(() => {
    if (gameMode === "asura" && gameStarted && Object.keys(asuraLives).length === 0) {
      const lives = {};
      for (let i = 0; i < 8; i++) lives[`b_p_${i}`] = 3;
      lives["b_n_0"] = 2; lives["b_n_1"] = 2;
      lives["b_b_0"] = 2; lives["b_b_1"] = 2;
      lives["b_r_0"] = 1; lives["b_r_1"] = 1;
      lives["b_q_0"] = 0; lives["b_k_0"] = 0;
      setAsuraLives(lives);
    }
  }, [gameMode, gameStarted, asuraLives]);

  useEffect(() => {
    if (gameOver || !gameStarted) return;
    const timer = setInterval(() => {
      if (game.turn() === "w") {
        setWhiteTime(prev => {
          if (prev <= 1) { setGameOver(true); setWinner("black"); return 0; }
          if (prev === 30 && !chaosModeShown.white) { setChaosModeShown(p => ({ ...p, white: true })); setShowChaosPopup(true); setTimeout(() => setShowChaosPopup(false), 3000); }
          return prev - 1;
        });
      } else {
        setBlackTime(prev => {
          if (prev <= 1) { setGameOver(true); setWinner("white"); return 0; }
          if (prev === 30 && !chaosModeShown.black) { setChaosModeShown(p => ({ ...p, black: true })); setShowChaosPopup(true); setTimeout(() => setShowChaosPopup(false), 3000); }
          return prev - 1;
        });
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [game, gameOver, gameStarted, chaosModeShown]);

  useEffect(() => { poweredPiecesRef.current = poweredPieces; }, [poweredPieces]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!gameStarted || moveCount === 0) return;
    const updatedTiles = activeTiles.map(t => { const n = t.turnsRemaining - 0.5; return { ...t, turnsRemaining: n, expired: (t.whiteActivated && t.blackActivated) || n <= 0 }; }).filter(t => !t.expired);
    setActiveTiles(updatedTiles);
    const updatedFrozen = {};
    Object.keys(frozenPieces).forEach(sq => { const tl = frozenPieces[sq].turnsLeft - 0.5; if (tl > 0) updatedFrozen[sq] = { turnsLeft: tl }; });
    setFrozenPieces(updatedFrozen);
    if (chandraMode) { const n = chandraMode.turnsLeft - 0.5; if (n <= 0) setChandraMode(null); else setChandraMode({ ...chandraMode, turnsLeft: n }); }
    const updatedPowered = {};
    Object.keys(poweredPieces).forEach(sq => { const p = poweredPieces[sq]; const n = p.usesLeft - 0.5; if (n > 0) updatedPowered[sq] = { ...p, usesLeft: n }; });
    setPoweredPieces(updatedPowered);
    const updatedRes = {};
    Object.keys(resurrectedPieces).forEach(sq => { const tl = resurrectedPieces[sq].turnsLeft - 0.5; if (tl > 0) updatedRes[sq] = { ...resurrectedPieces[sq], turnsLeft: tl }; });
    setResurrectedPieces(updatedRes);
    if (gameMode === "asura") {
      setCardCooldowns(prev => { const u = { ...prev }; Object.keys(u).forEach(id => { u[id] -= 1; if (u[id] <= 0) delete u[id]; }); return u; });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [moveCount]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if ((gameMode === "asura" || gameMode === "shukracharya") && gameStarted && !gameOver && game.turn() === "b" && !waitingForBot && stockfish) {
      makeAsuraMove();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [game, gameStarted, gameOver, gameMode, waitingForBot, stockfish]);

  function formatTime(s) { const m = Math.floor(s / 60); return `${m}:${(s % 60).toString().padStart(2, "0")}`; }
  function getPieceValue(p) { return ({ p: 2, n: 4, b: 4, r: 6, q: 8 }[p] || 0); }
  function getMaterialValue(p) { return ({ p: 1, n: 3, b: 3, r: 5, q: 9 }[p] || 0); }
  function calculateMaterialScore() { let w = 0, b = 0; whiteCaptured.forEach(p => w += getMaterialValue(p)); blackCaptured.forEach(p => b += getMaterialValue(p)); return { white: w, black: b }; }
  function calculateFinalScore() { const m = calculateMaterialScore(); let w = m.white, b = m.black; if (winner === "white") w += 10; else if (winner === "black") b += 10; return { white: w, black: b }; } function addTime(player, seconds) { if (player === "w") setWhiteTime(p => Math.min(p + seconds, startingTime)); else setBlackTime(p => Math.min(p + seconds, startingTime)); }
  function subtractTime(player, seconds) { if (player === "w") setWhiteTime(p => Math.max(p - seconds, 0)); else setBlackTime(p => Math.max(p - seconds, 0)); }

  function getCardCost(card) {
    const ct = game.turn() === "w" ? whiteTime : blackTime;
    const chaos = ct < 30;
    const asuraDiscount = gameMode === "asura" ? 0.5 : 1;
    return chaos ? Math.ceil(card.cost * asuraDiscount * 0.5) : Math.ceil(card.cost * asuraDiscount);
  }

  function checkTierUnlocks(cp) {
    if (cp === "p" && !tier1Unlocked) setTier1Unlocked(true);
    if ((cp === "n" || cp === "b") && !tier2Unlocked) { setTier1Unlocked(true); setTier2Unlocked(true); }
    if ((cp === "r" || cp === "q") && !tier3Unlocked) { setTier1Unlocked(true); setTier2Unlocked(true); setTier3Unlocked(true); }
  }

  function getSquaresInRadius(center, radius) {
    const files = ["a", "b", "c", "d", "e", "f", "g", "h"];
    const fi = files.indexOf(center[0]); const r = parseInt(center[1]); const sqs = [];
    for (let f = fi - radius; f <= fi + radius; f++) for (let rr = r - radius; rr <= r + radius; rr++) if (f >= 0 && f < 8 && rr >= 1 && rr <= 8) sqs.push(files[f] + rr);
    return sqs;
  }

  function getPiecesInZones() {
    const result = []; const ct = game.turn();
    activeTiles.forEach(tile => {
      getSquaresInRadius(tile.square, tile.radius).forEach(sq => {
        const piece = game.get(sq);
        if (piece && piece.color === ct) {
          const pc = piece.color === "w" ? "white" : "black";
          const alreadyActivated = (pc === "white" && tile.whiteActivated) || (pc === "black" && tile.blackActivated);
          if (!alreadyActivated && !poweredPieces[sq]) result.push({ square: sq, tileId: tile.square, tileType: tile.type, color: piece.color });
        }
      });
    });
    return result;
  }

  function placeTile(square) {
    if (!selectedCard) return;
    const card = selectedCard; const cost = getCardCost(card);
    subtractTime(game.turn(), cost);
    const newTile = { square, type: card.id, name: card.name, color: card.color + "66", radius: card.radius, turnsRemaining: 3, whiteActivated: false, blackActivated: false, whiteActivatedPiece: null, blackActivatedPiece: null };
    setActiveTiles([...activeTiles, newTile]);
    if (gameMode === "asura" || gameMode === "shukracharya") setCardCooldowns(prev => ({ ...prev, [card.id]: 6 }));
    else setUsedCards([...usedCards, card.id]);
    setSelectedCard(null);
  }

  function activateTileForPiece(square) {
    const piece = game.get(square); if (!piece) return;
    const playerColor = piece.color === "w" ? "white" : "black";
    let powerType = null; let tileSquare = null;
    const updatedTiles = activeTiles.map(tile => {
      const inRange = getSquaresInRadius(tile.square, tile.radius).includes(square);
      if (inRange) {
        if (playerColor === "white" && !tile.whiteActivated) { powerType = tile.type; tileSquare = tile.square; return { ...tile, whiteActivated: true, whiteActivatedPiece: square }; }
        else if (playerColor === "black" && !tile.blackActivated) { powerType = tile.type; tileSquare = tile.square; return { ...tile, blackActivated: true, blackActivatedPiece: square }; }
      }
      return tile;
    });
    setActiveTiles(updatedTiles);
    if (powerType) {
      if (powerType === "CHANDRA") { setChandraPlacementMode({ square, piece, rank: parseInt(square[1]), mirages: [] }); setActivationMode(false); return; }
      if (powerType === "GURU") {
        const tr = SHARED_DECK.find(c => c.id === "GURU").radius;
        const sir = getSquaresInRadius(tileSquare, tr);
        const avail = captureHistory.filter(cap => { const occ = game.get(cap.square); return cap.color === piece.color && sir.includes(cap.square) && (!occ || occ.color !== piece.color); });
        if (avail.length === 0) { alert("No pieces to resurrect in range!"); setActivationMode(false); return; }
        setGuruMode({ tileSquare, playerColor: piece.color, availableResurrections: avail }); setActivationMode(false); return;
      }
      if (powerType === "SHANI") {
        const shaniRadius = SHARED_DECK.find(c => c.id === "SHANI").radius;
        const searchCenter = tileSquare || square;
        const sir = getSquaresInRadius(searchCenter, shaniRadius);
        const enemies = [];
        const ec = piece.color === "w" ? "b" : "w";
        sir.forEach(sq => {
          const tp = game.get(sq);
          if (tp && tp.color === ec && !frozenPieces[sq]) {
            enemies.push({ square: sq, piece: tp });
          }
        });
        console.log("SHANI activated from", square, "tileSquare:", tileSquare, "enemies found:", enemies.length);
        if (enemies.length === 0) { alert("No enemy pieces to freeze in range!"); setActivationMode(false); return; }
        setShaniMode({ tileSquare: searchCenter, playerColor: piece.color, enemyPieces: enemies });
        setActivationMode(false);
        return;
      }
      const np = { ...poweredPieces };
      let usesLeft = 1;
      if (powerType === "RAHU") usesLeft = 2;
      if (powerType === "SURYA") usesLeft = 2;
      if (powerType === "SHUKRA") usesLeft = 2;
      if (powerType === "MANGALA") usesLeft = 3;
      np[square] = { power: powerType, usesLeft, color: piece.color };
      setPoweredPieces(np);
    }
    setActivationMode(false);
  }

  function updateTileActivations(newGame) {
    const updated = activeTiles.map(tile => {
      let t = { ...tile };
      if (t.whiteActivatedPiece) { const p = newGame.get(t.whiteActivatedPiece); if (!p || p.color !== "w") t.whiteActivatedPiece = null; }
      if (t.blackActivatedPiece) { const p = newGame.get(t.blackActivatedPiece); if (!p || p.color !== "b") t.blackActivatedPiece = null; }
      return t;
    });
    setActiveTiles(updated);
  }

  function wouldGiveCheck(gameCopy, square) {
    const piece = gameCopy.get(square); if (!piece) return false;
    const ec = piece.color === "w" ? "b" : "w"; let ks = null;
    for (let f of ["a", "b", "c", "d", "e", "f", "g", "h"]) { for (let r = 1; r <= 8; r++) { const sq = f + r; const p = gameCopy.get(sq); if (p && p.type === "k" && p.color === ec) { ks = sq; break; } } if (ks) break; }
    if (!ks) return false;
    try { const m = gameCopy.move({ from: square, to: ks }); if (m) { gameCopy.undo(); return true; } } catch { return false; }
    return false;
  }

  function getPieceId(square, piece) {
    const files = ["a", "b", "c", "d", "e", "f", "g", "h"];
    if (piece.type === "p") return `${piece.color}_p_${files.indexOf(square[0])}`;
    return `${piece.color}_${piece.type}_${files.indexOf(square[0]) < 4 ? 0 : 1}`;
  }

  function respawnAsuraPiece(pieceId, pieceType) {
    setTimeout(() => {
      setGame(prevGame => {
        const ng = new Chess(prevGame.fen());
        const parts = pieceId.split("_"); const type = parts[1]; const index = parseInt(parts[2]);
        const files = ["a", "b", "c", "d", "e", "f", "g", "h"];
        let sq = null;
        if (type === "p") { sq = files[index] + "7"; if (ng.get(sq)) sq = files[index] + "6"; }
        else if (type === "n") sq = index === 0 ? "b8" : "g8";
        else if (type === "b") sq = index === 0 ? "c8" : "f8";
        else if (type === "r") sq = index === 0 ? "a8" : "h8";
        else if (type === "q") sq = "d8";
        else if (type === "k") sq = "e8";
        if (ng.get(sq)) {
          if (type === "p") { for (let rank of ["7", "6", "5"]) { const s = files[index] + rank; if (!ng.get(s)) { sq = s; break; } } }
          else { for (let rank of ["8", "7", "6"]) { for (let file of files) { const s = file + rank; if (!ng.get(s)) { sq = s; break; } } if (sq && !ng.get(sq)) break; } }
        }
        if (sq && !ng.get(sq) && ng.turn() === "w") ng.put({ type: pieceType, color: "b" }, sq);
        return ng;
      });
    }, 2000);
  }

  function handleMove(from, to, promotion = "q") {
    try {
      if (resurrectedPieces[from] || resurrectedPieces[to]) return null;
      if (chandraMode && chandraMode.mirages.includes(from)) return null;

      if (chandraMode && from === chandraMode.realSquare) {
        const cleanGame = new Chess(game.fen());
        chandraMode.mirages.forEach(sq => { if (cleanGame.get(sq)) cleanGame.remove(sq); });
        setGame(cleanGame); setChandraMode(null);
        const gc = new Chess(cleanGame.fen()); const piece = gc.get(from); if (!piece) return null;
        const cp = gc.get(to);
        const mo = { from, to }; const p2 = gc.get(from);
        if (p2?.type === "p") { const tr = parseInt(to[1]); if ((p2.color === "w" && tr === 8) || (p2.color === "b" && tr === 1)) mo.promotion = "q"; }
        const move = gc.move(mo); if (!move) return null;
        if (cp) { addTime(gc.turn() === "w" ? "b" : "w", getPieceValue(cp.type)); if (gc.turn() === "w") setBlackCaptured(p => [...p, cp.type]); else setWhiteCaptured(p => [...p, cp.type]); checkTierUnlocks(cp.type); }
        setGame(gc); setMoveCount(p => p + 1);
        if (gc.isCheckmate()) { setGameOver(true); setWinner(gc.turn() === "w" ? "black" : "white"); }
        return gc;
      }

      if (chandraMode && game.get(to)) {
        const isMirage = chandraMode.mirages.includes(to); const isReal = to === chandraMode.realSquare;
        if (isMirage) {
          const gc = new Chess(game.fen());
          chandraMode.mirages.forEach(sq => { if (gc.get(sq)) gc.remove(sq); });
          const move = gc.move({ from, to, promotion }); if (!move) return null;
          setChandraMode(null); setGame(gc); updateTileActivations(gc); setMoveCount(p => p + 1);
          if (gc.isCheckmate()) { setGameOver(true); setWinner(gc.turn() === "w" ? "black" : "white"); }
          return gc;
        } else if (isReal) {
          const cleanGame = new Chess(game.fen());
          chandraMode.mirages.forEach(sq => { if (cleanGame.get(sq)) cleanGame.remove(sq); });
          setGame(cleanGame); setChandraMode(null);
          const gc = new Chess(cleanGame.fen()); const piece = gc.get(from); if (!piece) return null;
          const cp = gc.get(to); const power = poweredPieces[from];
          const move = gc.move({ from, to, promotion }); if (!move) return null;
          if (cp) {
            let tb = getPieceValue(cp.type); const cpHadKetu = poweredPieces[to]?.power === "KETU";
            if (power?.power === "SHUKRA" && power.usesLeft > 0) tb *= 3;
            const np = {}; Object.keys(poweredPieces).forEach(sq => { if (poweredPieces[sq]?.power && sq !== to) np[sq] = poweredPieces[sq]; }); setPoweredPieces(np);
            if (cpHadKetu) { addTime(gc.turn() === "w" ? "b" : "w", 12); subtractTime(gc.turn() === "w" ? "w" : "b", 12); } else addTime(gc.turn() === "w" ? "b" : "w", tb);
            setCaptureHistory(p => [...p, { piece: cp.type, square: to, color: cp.color }]);
            if (gc.turn() === "w") setBlackCaptured(p => [...p, cp.type]); else setWhiteCaptured(p => [...p, cp.type]);
            checkTierUnlocks(cp.type);
          }
          setGame(gc); setMoveCount(p => p + 1);
          if (gc.isCheckmate()) { setGameOver(true); setWinner(gc.turn() === "w" ? "black" : "white"); }
          return gc;
        }
      }

      const piece = game.get(from); if (!piece) return null;
      const cp = game.get(to); const power = poweredPieces[from];
      if (frozenPieces[from]) return null;
      if (cp && poweredPieces[to]?.power === "SURYA" && poweredPieces[to].usesLeft > 0) return null;

      const files = ["a", "b", "c", "d", "e", "f", "g", "h"];
      let moveWasMade = false; let gc = new Chess(game.fen());

      if (power?.power === "RAHU" && power.usesLeft > 0) {
        const ff = files.indexOf(from[0]), fr = parseInt(from[1]), tf = files.indexOf(to[0]), tr = parseInt(to[1]);
        let valid = false;
        if (piece.type === "p") { const dir = piece.color === "w" ? 1 : -1; const sr = piece.color === "w" ? 2 : 7; if (ff === tf && !cp && (tr === fr + dir || (fr === sr && tr === fr + 2 * dir))) valid = true; else if (Math.abs(ff - tf) === 1 && tr === fr + dir && cp) valid = true; }
        else if (piece.type === "n") { const fd = Math.abs(tf - ff), rd = Math.abs(tr - fr); if ((fd === 2 && rd === 1) || (fd === 1 && rd === 2)) valid = true; }
        else if (piece.type === "b") { if (Math.abs(tf - ff) === Math.abs(tr - fr)) valid = true; }
        else if (piece.type === "r") { if (ff === tf || fr === tr) valid = true; }
        else if (piece.type === "q") { if (Math.abs(tf - ff) === Math.abs(tr - fr) || ff === tf || fr === tr) valid = true; }
        else if (piece.type === "k") { if (Math.abs(tf - ff) <= 1 && Math.abs(tr - fr) <= 1) valid = true; }
        if (valid) {
          if (cp && cp.color === piece.color) return null;
          gc.remove(from); if (cp) gc.remove(to); gc.put({ type: piece.type, color: piece.color }, to);
          const fp = gc.fen().split(" "); fp[1] = fp[1] === "w" ? "b" : "w"; gc.load(fp.join(" ")); moveWasMade = true;
        }
      }

      if (!moveWasMade && power?.power === "MANGALA" && power.usesLeft > 0) {
        const ff = files.indexOf(from[0]), fr = parseInt(from[1]), tf = files.indexOf(to[0]), tr = parseInt(to[1]);
        if (Math.abs(tf - ff) <= 1 && Math.abs(tr - fr) <= 1 && cp && cp.color !== piece.color) {
          gc.remove(from); gc.remove(to); gc.put({ type: piece.type, color: piece.color }, to);
          const fp = gc.fen().split(" "); fp[1] = fp[1] === "w" ? "b" : "w"; gc.load(fp.join(" ")); moveWasMade = true;
        }
      }

      if (!moveWasMade) { const m = gc.move({ from, to, promotion }); if (!m) return null; }
      if (power?.power === "BUDHA" && !cp && power.usesLeft === 1) { const fp = gc.fen().split(" "); fp[1] = fp[1] === "w" ? "b" : "w"; gc.load(fp.join(" ")); }

      if (cp) {
        let tb = getPieceValue(cp.type); const cpHadKetu = poweredPieces[to]?.power === "KETU";
        if (power?.power === "SHUKRA" && power.usesLeft > 0) tb *= 3;
        const np2 = {}; Object.keys(poweredPieces).forEach(sq => { if (poweredPieces[sq]?.power && sq !== to) np2[sq] = poweredPieces[sq]; }); setPoweredPieces(np2);
        if (cpHadKetu) { addTime(game.turn() === "w" ? "b" : "w", 12); subtractTime(game.turn(), 12); } else addTime(game.turn(), tb);
        if (gameMode === "asura" && cp.color === "b") {
          const pid = getPieceId(to, cp); const lr = asuraLives[pid] || 0;
          if (lr > 0) { setAsuraLives({ ...asuraLives, [pid]: lr - 1 }); respawnAsuraPiece(pid, cp.type); }
        }
        setCaptureHistory(p => [...p, { piece: cp.type, square: to, color: cp.color }]);
        if (game.turn() === "w") setWhiteCaptured(p => [...p, cp.type]); else setBlackCaptured(p => [...p, cp.type]);
        checkTierUnlocks(cp.type);
      }

      const np3 = { ...poweredPieces };
      if (cp && np3[to]) delete np3[to];
      if (power) {
        delete np3[from]; let nu = power.usesLeft - 1;
        if (power.power === "BUDHA" && cp) nu = 0;
        if (nu > 0) np3[to] = { ...power, usesLeft: nu };
      }
      const cleanPP = {}; Object.keys(np3).forEach(sq => { if (np3[sq]?.power) cleanPP[sq] = np3[sq]; }); setPoweredPieces(cleanPP);
      setGame(gc); updateTileActivations(gc); setMoveCount(p => p + 1);
      if (gc.isCheckmate()) { setGameOver(true); setWinner(gc.turn() === "w" ? "black" : "white"); }
      return gc;
    } catch (e) { console.error("Move error:", e); return null; }
  }

  function performResurrection(resurrection, square) {
    const occupant = game.get(square);
    if (occupant && occupant.color !== guruMode.playerColor) {
      setCaptureHistory(p => [...p, { piece: occupant.type, square, color: occupant.color }]);
      if (occupant.color === "b") setWhiteCaptured(p => [...p, occupant.type]); else setBlackCaptured(p => [...p, occupant.type]);
      checkTierUnlocks(occupant.type);
    }
    const ng = new Chess(game.fen()); ng.put({ type: resurrection.piece, color: guruMode.playerColor }, square); setGame(ng);
    setResurrectedPieces({ ...resurrectedPieces, [square]: { turnsLeft: 2, resurrectedFrom: resurrection } });
    setCaptureHistory(captureHistory.filter(c => !(c.square === square && c.piece === resurrection.piece && c.color === resurrection.color)));
    setGuruMode(null); setGuruPickerMode(null);
  }

  function makeAsuraMove() {
    setWaitingForBot(true); stockfishMoveRef.current = null;
    const sf = stockfishRef.current;
    if (!sf || sf.random) {
      setTimeout(() => {
        const cg = new Chess(game.fen()); const moves = cg.moves({ verbose: true }); if (!moves.length) { setWaitingForBot(false); return; }
        const safe = moves.filter(m => !(poweredPiecesRef.current[m.to]?.power === "SURYA" && poweredPiecesRef.current[m.to].usesLeft > 0));
        const mu = safe.length > 0 ? safe : moves; const rm = mu[Math.floor(Math.random() * mu.length)];
        const ng = new Chess(game.fen()); const rcp = ng.get(rm.to); const res = ng.move({ from: rm.from, to: rm.to, promotion: "q" });
        if (res) {
          if (rcp) { setCaptureHistory(p => [...p, { piece: rcp.type, square: rm.to, color: rcp.color }]); if (rcp.color === "w") setWhiteCaptured(p => [...p, rcp.type]); checkTierUnlocks(rcp.type); }
          setGame(ng); setMoveCount(p => p + 1); if (ng.isCheckmate()) { setGameOver(true); setWinner("white"); }
        }
        setWaitingForBot(false);
      }, 1200); return;
    }
    const depthMap = { shishya: 5, acharya: 8, guru: 12 };
    const depth = gameMode === "shukracharya" ? (depthMap[shukraDifficulty] || 8) : 3;
    sf.postMessage(`position fen ${game.fen()}`); sf.postMessage(`go depth ${depth}`);
    const poll = setInterval(() => {
      if (stockfishMoveRef.current) {
        clearInterval(poll); const ms = stockfishMoveRef.current; stockfishMoveRef.current = null;
        const ng = new Chess(game.fen());
        const isSP = poweredPiecesRef.current[ms.slice(2, 4)]?.power === "SURYA" && poweredPiecesRef.current[ms.slice(2, 4)].usesLeft > 0;
        let fm = { from: ms.slice(0, 2), to: ms.slice(2, 4), promotion: ms[4] || "q" };
        if (isSP) { const cg2 = new Chess(game.fen()); const mv2 = cg2.moves({ verbose: true }); const sf2 = mv2.filter(m => !(poweredPiecesRef.current[m.to]?.power === "SURYA" && poweredPiecesRef.current[m.to].usesLeft > 0)); const fb = sf2.length > 0 ? sf2 : mv2; const alt = fb[Math.floor(Math.random() * fb.length)]; fm = { from: alt.from, to: alt.to, promotion: alt.promotion || "q" }; }
        const scp = ng.get(fm.to); const res = ng.move(fm);
        if (res) {
          if (scp) { setCaptureHistory(p => [...p, { piece: scp.type, square: ms.slice(2, 4), color: scp.color }]); if (scp.color === "w") setWhiteCaptured(p => [...p, scp.type]); checkTierUnlocks(scp.type); }
          setGame(ng); setMoveCount(p => p + 1); if (ng.isCheckmate()) { setGameOver(true); setWinner("white"); }
        }
        setWaitingForBot(false);
      }
    }, 50);
    setTimeout(() => { clearInterval(poll); if (waitingForBot) setWaitingForBot(false); }, 8000);
  }

  function onSquareClick(square) {
    if (gameOver || !gameStarted) return;
    if ((gameMode === "asura" || gameMode === "shukracharya") && game.turn() === "b") return;
    if (selectedCard) { placeTile(square); return; }
    if (guruMode) {
      const res = guruMode.availableResurrections.filter(r => r.square === square);
      if (res.length === 1) performResurrection(res[0], square);
      else if (res.length > 1) setGuruPickerMode({ square, options: res });
      return;
    }
    if (shaniMode) { const tp = shaniMode.enemyPieces.find(p => p.square === square); if (tp) { setFrozenPieces({ ...frozenPieces, [square]: { turnsLeft: 4 } }); setShaniMode(null); } return; }
    if (chandraPlacementMode) {
      const cr = parseInt(square[1]);
      if (cr === chandraPlacementMode.rank) {
        const piece = game.get(square);
        if (chandraPlacementMode.piece.type === "b") {
          const files = ["a", "b", "c", "d", "e", "f", "g", "h"];
          const of2 = files.indexOf(chandraPlacementMode.square[0]), or = parseInt(chandraPlacementMode.square[1]);
          const oIL = (of2 + or) % 2 === 0, cf = files.indexOf(square[0]);
          if (oIL !== ((cf + cr) % 2 === 0)) return;
        }
        if (!piece || square === chandraPlacementMode.square) {
          if (square === chandraPlacementMode.square) return;
          if (chandraPlacementMode.mirages.includes(square)) setChandraPlacementMode({ ...chandraPlacementMode, mirages: chandraPlacementMode.mirages.filter(s => s !== square) });
          else if (chandraPlacementMode.mirages.length < 2) setChandraPlacementMode({ ...chandraPlacementMode, mirages: [...chandraPlacementMode.mirages, square] });
        }
      }
      return;
    }
    if (activationMode) { const piz = getPiecesInZones(); const pInZ = piz.find(p => p.square === square); if (pInZ) { const piece = game.get(square); if (piece && piece.color === game.turn()) { activateTileForPiece(square); return; } } return; }
    if (!moveFrom) { const piece = game.get(square); if (piece && piece.color === game.turn()) { if (frozenPieces[square]) return; setMoveFrom(square); } return; }
    const tp2 = game.get(square); if (tp2 && tp2.color === game.turn()) { if (frozenPieces[square]) return; setMoveFrom(square); return; }
    const mp = game.get(moveFrom); if (!mp || mp.color !== game.turn()) { setMoveFrom(""); return; }
    handleMove(moveFrom, square);
    setMoveFrom("");
  }

  function onPieceDrop(sourceSquare, targetSquare) {
    if (gameOver || !gameStarted || selectedCard || activationMode || chandraPlacementMode || guruMode || shaniMode) return false;
    if ((gameMode === "asura" || gameMode === "shukracharya") && game.turn() === "b") return false;
    if (chandraMode) {
      if (chandraMode.mirages.includes(sourceSquare)) return false;
      if (chandraMode.mirages.includes(targetSquare)) { const ng = new Chess(game.fen()); chandraMode.mirages.forEach(sq => ng.remove(sq)); setGame(ng); setChandraMode(null); return false; }
    }
    const result = handleMove(sourceSquare, targetSquare); setMoveFrom(""); return result !== null;
  }

  function confirmChandraPlacement() {
    if (!chandraPlacementMode || chandraPlacementMode.mirages.length === 0) return;
    const cost = 10 + (chandraPlacementMode.mirages.length === 2 ? 5 : 0);
    subtractTime(game.turn(), cost);
    const gc = new Chess(game.fen());
    if (wouldGiveCheck(gc, chandraPlacementMode.square)) { alert("CHANDRA cannot give check! Power auto-revealed."); setChandraPlacementMode(null); return; }
    const ng = new Chess(game.fen());
    chandraPlacementMode.mirages.forEach(sq => ng.put({ type: chandraPlacementMode.piece.type, color: chandraPlacementMode.piece.color }, sq));
    setGame(ng);
    setChandraMode({ realSquare: chandraPlacementMode.square, piece: chandraPlacementMode.piece, mirages: chandraPlacementMode.mirages, turnsLeft: 4, color: chandraPlacementMode.piece.color });
    setChandraPlacementMode(null);
  }

  function startGame(mode, difficulty = null) {
    const time = (mode === "asura" || mode === "shukracharya") ? 300 : 100;
    setStartingTime(time); setWhiteTime(time); setBlackTime(time);
    setGameMode(mode); setGameStarted(true); setShowShukraSelect(false);
    if (difficulty) setShukraDifficulty(difficulty);
  }

  function resetGame() {
    setGame(new Chess()); setWhiteTime(startingTime); setBlackTime(startingTime);
    setGameOver(false); setWinner(null); setGameStarted(false); setGameMode(null); setMoveFrom("");
    setActiveTiles([]); setMoveCount(0); setWhiteCaptured([]); setBlackCaptured([]); setCaptureHistory([]);
    setTier1Unlocked(false); setTier2Unlocked(false); setTier3Unlocked(false);
    setUsedCards([]); setSelectedCard(null); setChaosModeShown({ white: false, black: false });
    setPoweredPieces({}); setFrozenPieces({}); setActivationMode(false);
    setChandraMode(null); setChandraPlacementMode(null); setGuruMode(null); setResurrectedPieces({});
    setShaniMode(null); setAsuraLives({}); setWaitingForBot(false);
    setShukraDifficulty(null); setShowShukraSelect(false); setGuruPickerMode(null); setCardCooldowns({});
    setShowCardOverlay(false); setGameOverDismissed(false);
    if (stockfishRef.current?.terminate) stockfishRef.current.terminate();
    stockfishRef.current = null; setStockfish(null);
  }

  const theme = {
    background: gameMode === "asura" ? "#0a0a0a" : gameMode === "shukracharya" ? "#0d0a1a" : "#1a1a2e",
    darkSquare: gameMode === "asura" ? "#8b0000" : gameMode === "shukracharya" ? "#4a3060" : "#4a5568",
    lightSquare: gameMode === "asura" ? "#3a0000" : gameMode === "shukracharya" ? "#d4c5e8" : "#cbd5e0",
    accent: gameMode === "asura" ? "#ff4444" : gameMode === "shukracharya" ? "#e8d5a3" : "#4ecca3",
    text: gameMode === "asura" ? "#ff6b6b" : gameMode === "shukracharya" ? "#e8d5a3" : "#eee",
  };

  const customStyles = {};
  const piecesInZones = getPiecesInZones();

  activeTiles.forEach(tile => {
    getSquaresInRadius(tile.square, tile.radius).forEach(sq => { customStyles[sq] = { backgroundColor: tile.color, boxShadow: sq === tile.square ? `inset 0 0 20px ${tile.color}` : "" }; });
    if (tile.whiteActivatedPiece) customStyles[tile.whiteActivatedPiece] = { ...(customStyles[tile.whiteActivatedPiece] || {}), border: "3px solid #4ecca3", boxShadow: "inset 0 0 10px rgba(78,204,163,0.8)" };
    if (tile.blackActivatedPiece) customStyles[tile.blackActivatedPiece] = { ...(customStyles[tile.blackActivatedPiece] || {}), border: "3px solid #4ecca3", boxShadow: "inset 0 0 10px rgba(78,204,163,0.8)" };
  });
  Object.keys(poweredPieces).forEach(sq => { const p = poweredPieces[sq]; if (!p?.power) return; const card = SHARED_DECK.find(c => c.id === p.power); if (card) customStyles[sq] = { ...(customStyles[sq] || {}), border: `4px solid ${card.color}`, boxShadow: `0 0 20px ${card.color}, inset 0 0 15px ${card.color}88` }; });
  Object.keys(frozenPieces).forEach(sq => { customStyles[sq] = { ...(customStyles[sq] || {}), border: "4px solid #1f2937", backgroundColor: "rgba(31,41,55,0.7)", boxShadow: "inset 0 0 20px rgba(31,41,55,0.9)" }; });
  Object.keys(resurrectedPieces).forEach(sq => { customStyles[sq] = { ...(customStyles[sq] || {}), border: "4px solid #a855f7", boxShadow: "0 0 25px #a855f7, inset 0 0 20px rgba(168,85,247,0.6)", animation: "resurrectPulse 2s infinite" }; });
  if (guruMode) guruMode.availableResurrections.forEach(r => { customStyles[r.square] = { ...(customStyles[r.square] || {}), backgroundColor: "rgba(168,85,247,0.4)", border: "3px dashed #a855f7", boxShadow: "0 0 20px rgba(168,85,247,0.6)", cursor: "pointer" }; });
  if (shaniMode) shaniMode.enemyPieces.forEach(ep => { customStyles[ep.square] = { ...(customStyles[ep.square] || {}), backgroundColor: "rgba(31,41,55,0.5)", border: "3px dashed #1f2937", boxShadow: "0 0 20px rgba(31,41,55,0.8)", cursor: "pointer" }; });
  if (chandraPlacementMode) {
    const files = ["a", "b", "c", "d", "e", "f", "g", "h"];
    files.forEach(f => { const sq = f + chandraPlacementMode.rank; if (!game.get(sq) && sq !== chandraPlacementMode.square) customStyles[sq] = { ...(customStyles[sq] || {}), backgroundColor: "rgba(229,231,235,0.3)", border: "2px dashed #e5e7eb" }; });
    chandraPlacementMode.mirages.forEach(ms => { customStyles[ms] = { ...(customStyles[ms] || {}), backgroundColor: "rgba(229,231,235,0.6)", border: "3px solid #e5e7eb", boxShadow: "0 0 15px #e5e7eb" }; });
    customStyles[chandraPlacementMode.square] = { ...(customStyles[chandraPlacementMode.square] || {}), border: "3px solid #ffd700", boxShadow: "0 0 20px #ffd700" };
  }
  if (chandraMode) chandraMode.mirages.forEach(ms => { customStyles[ms] = { ...(customStyles[ms] || {}), boxShadow: "0 0 10px rgba(229,231,235,0.6)" }; });
  if (activationMode) piecesInZones.forEach(pi => { customStyles[pi.square] = { ...(customStyles[pi.square] || {}), border: "3px solid #ffd700", boxShadow: "0 0 15px #ffd700, inset 0 0 10px rgba(255,215,0,0.3)", animation: "pulse 1.5s infinite" }; });
  if (moveFrom && !selectedCard) customStyles[moveFrom] = { ...(customStyles[moveFrom] || {}), backgroundColor: "rgba(255,255,0,0.5)" };

  const finalScore = gameOver ? calculateFinalScore() : null;
  const currentMaterial = calculateMaterialScore();
  const getPieceSymbol = p => ({ p: "♟", n: "♞", b: "♝", r: "♜", q: "♛", k: "♚" }[p] || p);
  const trulyDeadCount = gameMode === "asura" ? Object.values(asuraLives).filter(l => l === 0).length : 0;

  // ── Board size ────────────────────────────────────────────────────────────
  const boardSize = isMobile ? Math.min(window.innerWidth - 16, 480) : 600;

  // ── Active special mode label for mobile banner ───────────────────────────
  const specialModeLabel = activationMode ? "⚡ Tap a glowing piece to activate"
    : chandraPlacementMode ? "🌙 Tap empty squares on this rank to place clones"
      : guruMode ? "🪐 Tap a death square to resurrect"
        : shaniMode ? "🪐 Tap an enemy piece to freeze"
          : selectedCard ? `✨ ${selectedCard.name} selected — tap the board to place`
            : null;

  return (
    <>
      <style>{`
        @keyframes pulse {
          0%, 100% { box-shadow: 0 0 10px #ffd700, inset 0 0 10px rgba(255,215,0,0.3); }
          50% { box-shadow: 0 0 25px #ffd700, inset 0 0 20px rgba(255,215,0,0.5); }
        }
        @keyframes resurrectPulse {
          0%, 100% { box-shadow: 0 0 15px #a855f7, inset 0 0 15px rgba(168,85,247,0.5); }
          50% { box-shadow: 0 0 35px #a855f7, inset 0 0 25px rgba(168,85,247,0.7); }
        }
        @keyframes bannerPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        * { box-sizing: border-box; }
      `}</style>

      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", backgroundColor: theme.background, color: theme.text, padding: isMobile ? "8px" : "20px" }}>

        {/* ── Mode selection ── */}
        {!gameStarted && (
          <div style={{ textAlign: "center", maxWidth: isMobile ? "100%" : "900px", margin: "0 auto", padding: isMobile ? "0 8px" : "0" }}>
            <img src="/images/chessuranga.jpg" alt="Chessuranga" style={{ width: "100%", borderRadius: "16px", display: "block", marginBottom: "24px", boxShadow: "0 0 60px rgba(100,60,255,0.4)" }} />
            <div style={{ display: "flex", gap: isMobile ? "12px" : "20px", justifyContent: "center", flexWrap: "wrap", marginBottom: "40px", alignItems: "flex-start" }}>

              {/* PvP */}
              <div style={{ textAlign: "center", maxWidth: "200px" }}>
                <button onClick={() => startGame("pvp")} style={{ padding: "16px 24px", fontSize: "16px", backgroundColor: "#4ecca3", color: "#000", border: "none", borderRadius: "10px", cursor: "pointer", fontWeight: "bold", width: "100%", marginBottom: "8px" }}>🌟 Play vs Friend</button>
                <p style={{ fontSize: "11px", color: "#ddd", lineHeight: "1.4", margin: 0 }}>100-second bullet chess with celestial powers</p>
              </div>

              {/* Shukracharya */}
              <div style={{ textAlign: "center", maxWidth: "200px" }}>
                {!showShukraSelect ? (
                  <>
                    <button onClick={() => setShowShukraSelect(true)} style={{ padding: "16px 24px", fontSize: "16px", backgroundColor: "#e8d5a3", color: "#1a0a00", border: "none", borderRadius: "10px", cursor: "pointer", fontWeight: "bold", width: "100%", marginBottom: "8px" }}>☄️ Face Shukracharya</button>
                    <p style={{ fontSize: "11px", color: "#ddd", lineHeight: "1.4", margin: 0 }}>Guru of the Asuras. Face the master behind the horde in a 1v1.</p>
                  </>
                ) : (
                  <div style={{ backgroundColor: "rgba(232,213,163,0.15)", border: "2px solid #e8d5a3", borderRadius: "12px", padding: "16px", textAlign: "center" }}>
                    <p style={{ color: "#e8d5a3", fontWeight: "bold", fontSize: "13px", marginBottom: "12px", marginTop: 0 }}>Choose your challenge:</p>
                    {[{ key: "shishya", label: "🌱 Shishya", sub: "Student · ~1400 ELO" }, { key: "acharya", label: "📚 Acharya", sub: "Teacher · ~1700 ELO" }, { key: "guru", label: "🔱 Guru", sub: "Master · ~2000 ELO" }].map(({ key, label, sub }) => (
                      <div key={key} style={{ marginBottom: "8px" }}>
                        <button onClick={() => startGame("shukracharya", key)} style={{ padding: "10px 16px", fontSize: "14px", backgroundColor: "#e8d5a3", color: "#1a0a00", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold", width: "100%", marginBottom: "2px" }}>{label}</button>
                        <p style={{ fontSize: "13px", color: "#ddd", margin: 0 }}>{sub}</p>
                      </div>
                    ))}
                    <button onClick={() => setShowShukraSelect(false)} style={{ marginTop: "6px", fontSize: "11px", background: "none", border: "none", color: "#aaa", cursor: "pointer", textDecoration: "underline" }}>← back</button>
                  </div>
                )}
              </div>

              {/* Asura */}
              <div style={{ textAlign: "center", maxWidth: "200px" }}>
                <button onClick={() => startGame("asura")} style={{ padding: "16px 24px", fontSize: "16px", backgroundColor: "#ff4444", color: "#fff", border: "none", borderRadius: "10px", cursor: "pointer", fontWeight: "bold", width: "100%", marginBottom: "8px" }}>👹 Fight the Asura Horde</button>
                <p style={{ fontSize: "11px", color: "#ddd", lineHeight: "1.4", margin: 0 }}>They are endless. They are relentless. Are you ready?</p>
              </div>
            </div>
            <HowToPlay />
          </div>
        )}

        {/* ── GAME SCREEN ── */}
        {gameStarted && !isMobile && (
          /* ════════════════════════════════════
             DESKTOP LAYOUT (unchanged)
          ════════════════════════════════════ */
          <div style={{ display: "flex", gap: "30px", alignItems: "flex-start", justifyContent: "center", width: "100%", maxWidth: "1400px", margin: "0 auto" }}>

            {/* LEFT: cards */}
            <div style={{ width: "280px", display: "flex", flexDirection: "column", gap: "15px" }}>
              <div style={{ padding: "10px", backgroundColor: "#16213e", borderRadius: "8px", fontSize: "14px", minHeight: "110px" }}>
                {selectedCard ? (
                  <>
                    <strong style={{ fontSize: "16px" }}>{selectedCard.name}</strong>
                    <div style={{ fontSize: "22px", color: "#ffd700", marginTop: "5px", fontWeight: "bold" }}>{getCardCost(selectedCard)}s</div>
                    <div style={{ fontSize: "15px", color: "#aaa", marginTop: "5px" }}>{selectedCard.description}</div>
                    <div style={{ fontSize: "13px", color: "#aaa", marginTop: "5px" }}>Click board to place</div>
                  </>
                ) : (
                  <div style={{ color: "#555", fontSize: "13px", marginTop: "10px", textAlign: "center" }}>Select a card to see its power</div>
                )}
                {gameOver && gameOverDismissed && (
                  <div onClick={() => setGameOverDismissed(false)} style={{ position: "fixed", top: "12px", left: "50%", transform: "translateX(-50%)", backgroundColor: theme.accent, color: "#000", padding: "8px 20px", borderRadius: "20px", fontSize: "13px", fontWeight: "bold", cursor: "pointer", zIndex: 300, boxShadow: "0 4px 15px rgba(0,0,0,0.4)" }}>
                    {winner === "white" ? "🌟 You won!" : "👹 You lost!"} · tap to see result
                  </div>
                )}
              </div>

              {!selectedCard && !chandraPlacementMode && !guruMode && !shaniMode && piecesInZones.length > 0 && (
                <div>
                  {activationMode ? (
                    <>
                      <div style={{ fontSize: "12px", color: "#ffd700", marginBottom: "10px", padding: "10px", backgroundColor: "#16213e", borderRadius: "8px" }}>💡 Click glowing piece to activate!</div>
                      <button onClick={() => setActivationMode(false)} style={{ width: "100%", padding: "10px", fontSize: "12px", backgroundColor: "#e94560", color: "#fff", border: "none", borderRadius: "5px", cursor: "pointer", fontWeight: "bold" }}>Skip Activation</button>
                    </>
                  ) : (
                    <button onClick={() => setActivationMode(true)} style={{ width: "100%", padding: "12px", fontSize: "13px", backgroundColor: "#ffd700", color: "#000", border: "none", borderRadius: "5px", cursor: "pointer", fontWeight: "bold" }}>Activate Power ({piecesInZones.length})</button>
                  )}
                </div>
              )}

              {guruMode && (
                <div style={{ padding: "10px", backgroundColor: "#16213e", borderRadius: "8px" }}>
                  <div style={{ fontSize: "14px", fontWeight: "bold", marginBottom: "10px", color: "#a855f7" }}>🪐 GURU</div>
                  <div style={{ fontSize: "12px", color: "#aaa", marginBottom: "10px" }}>Click a death square to resurrect:</div>
                  <div style={{ fontSize: "11px", color: "#888", marginBottom: "10px" }}>{guruMode.availableResurrections.map((r, i) => <div key={i}>{getPieceSymbol(r.piece)} at {r.square}</div>)}</div>
                  <button onClick={() => setGuruMode(null)} style={{ width: "100%", padding: "8px", fontSize: "12px", backgroundColor: "#e94560", color: "#fff", border: "none", borderRadius: "5px", cursor: "pointer" }}>Cancel</button>
                </div>
              )}

              {shaniMode && (
                <div style={{ padding: "10px", backgroundColor: "#16213e", borderRadius: "8px" }}>
                  <div style={{ fontSize: "14px", fontWeight: "bold", marginBottom: "10px", color: "#94a3b8" }}>🪐 SHANI</div>
                  <div style={{ fontSize: "12px", color: "#aaa", marginBottom: "10px" }}>Click enemy piece to freeze for 2 turns:</div>
                  <div style={{ fontSize: "11px", color: "#888", marginBottom: "10px" }}>{shaniMode.enemyPieces.map((p, i) => <div key={i}>{getPieceSymbol(p.piece.type)} at {p.square}</div>)}</div>
                  <button onClick={() => setShaniMode(null)} style={{ width: "100%", padding: "8px", fontSize: "12px", backgroundColor: "#e94560", color: "#fff", border: "none", borderRadius: "5px", cursor: "pointer" }}>Cancel</button>
                </div>
              )}

              {chandraPlacementMode && (
                <div style={{ padding: "10px", backgroundColor: "#16213e", borderRadius: "8px" }}>
                  <div style={{ fontSize: "14px", fontWeight: "bold", marginBottom: "10px", color: "#e5e7eb" }}>🌙 CHANDRA</div>
                  <div style={{ fontSize: "12px", color: "#aaa", marginBottom: "10px" }}>Click empty squares on rank {chandraPlacementMode.rank} to place {chandraPlacementMode.mirages.length}/2 clones</div>
                  <div style={{ fontSize: "11px", color: "#888", marginBottom: "10px" }}>Real piece: {chandraPlacementMode.square}</div>
                  {chandraPlacementMode.mirages.length === 2 && <div style={{ fontSize: "11px", color: "#ffd700", marginBottom: "10px" }}>+5s penalty for 2nd clone</div>}
                  <div style={{ display: "flex", gap: "5px" }}>
                    <button onClick={confirmChandraPlacement} disabled={chandraPlacementMode.mirages.length === 0} style={{ flex: 1, padding: "8px", fontSize: "12px", backgroundColor: chandraPlacementMode.mirages.length > 0 ? "#4ecca3" : "#555", color: chandraPlacementMode.mirages.length > 0 ? "#000" : "#888", border: "none", borderRadius: "5px", cursor: chandraPlacementMode.mirages.length > 0 ? "pointer" : "not-allowed", fontWeight: "bold" }}>Confirm</button>
                    <button onClick={() => setChandraPlacementMode(null)} style={{ flex: 1, padding: "8px", fontSize: "12px", backgroundColor: "#e94560", color: "#fff", border: "none", borderRadius: "5px", cursor: "pointer" }}>Cancel</button>
                  </div>
                </div>
              )}

              {chandraMode && (
                <div style={{ padding: "10px", backgroundColor: "#16213e", borderRadius: "8px", fontSize: "12px", color: "#e5e7eb" }}>
                  <div style={{ fontWeight: "bold", marginBottom: "5px" }}>🌙 CHANDRA ACTIVE</div>
                  <div style={{ color: "#aaa" }}>{Math.ceil(chandraMode.turnsLeft / 2)} turns left</div>
                </div>
              )}

              <div>
                <h3 style={{ marginBottom: "10px", textAlign: "center", fontSize: "16px" }}>🌟 Navagraha</h3>
                {[1, 2, 3].map(tier => {
                  const tierCards = SHARED_DECK.filter(c => c.tier === tier);
                  const isUnlocked = (tier === 1 && tier1Unlocked) || (tier === 2 && tier2Unlocked) || (tier === 3 && tier3Unlocked);
                  return (
                    <div key={tier} style={{ marginBottom: "15px" }}>
                      <div style={{ fontSize: "11px", marginBottom: "5px", color: "#888", textAlign: "center" }}>Tier {tier} {!isUnlocked && "🔒"}</div>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "5px" }}>
                        {tierCards.map(card => {
                          const isUsed = (gameMode === "asura" || gameMode === "shukracharya") ? !!cardCooldowns[card.id] : usedCards.includes(card.id);
                          const cooldown = cardCooldowns[card.id];
                          const isSelected = selectedCard?.id === card.id;
                          return (
                            <div key={card.id} onClick={() => { if (isUnlocked && !isUsed && !gameOver && game.turn() === "w") setSelectedCard(isSelected ? null : card); }} style={{ aspectRatio: "3/4", backgroundColor: isUnlocked ? card.color : "#333", border: isSelected ? "3px solid #fff" : "2px solid #555", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", cursor: (isUnlocked && !isUsed && game.turn() === "w") ? "pointer" : "default", opacity: isUsed ? 0.4 : 1, overflow: "hidden", padding: 0, position: "relative" }}>
                              {isUnlocked ? (
                                <>
                                  <img src={card.image} alt={card.name} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", filter: isUsed ? "grayscale(80%)" : "none" }} />
                                  {cooldown && <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", backgroundColor: "rgba(0,0,0,0.75)", color: "#fff", fontWeight: "bold", fontSize: "22px", borderRadius: "50%", width: "36px", height: "36px", display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid #a855f7" }}>{cooldown}</div>}
                                </>
                              ) : "🔒"}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* CENTER: board */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <h1 style={{ marginBottom: "20px", fontSize: "32px" }}>{gameMode === "asura" ? "⚔️ ASURA HORDE ⚔️" : "Chessuranga"}</h1>
              {showChaosPopup && <div onClick={() => setShowChaosPopup(false)} style={{ position: "absolute", top: "10px", left: "50%", transform: "translateX(-50%)", backgroundColor: "#ff6b6b", padding: "12px 24px", borderRadius: "15px", zIndex: 1000, textAlign: "center", border: "3px solid #fff", boxShadow: "0 0 30px rgba(255,107,107,0.5)", cursor: "pointer" }}><h2 style={{ margin: 0, fontSize: "20px" }}>🔥 CHAOS MODE — All cards half price! 🔥</h2><p style={{ margin: "4px 0 0 0", fontSize: "11px", opacity: 0.8 }}>tap to dismiss</p></div>}
              {gameOver && finalScore && !gameOverDismissed && (
                <div onClick={() => setGameOverDismissed(true)} style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", backgroundColor: "#16213e", padding: "40px", borderRadius: "15px", zIndex: 1000, textAlign: "center", border: `3px solid ${theme.accent}` }}>
                  <h2 style={{ marginBottom: "20px", fontSize: "32px" }}>{gameMode === "asura" ? (winner === "white" ? "🌟 The Navagraha Prevail! 🌟" : "👹 The Asura Reign! 👹") : `${winner === "white" ? "White" : "Black"} Wins!`}</h2>
                  {gameMode !== "asura" && <><p style={{ fontSize: "20px", marginBottom: "10px" }}>White Score: {finalScore.white}</p><p style={{ fontSize: "20px", marginBottom: "30px" }}>Black Score: {finalScore.black}</p></>}
                  <button onClick={resetGame} style={{ padding: "15px 30px", fontSize: "18px", backgroundColor: theme.accent, border: "none", borderRadius: "5px", cursor: "pointer", color: "#000", fontWeight: "bold" }}>Main Menu</button>
                  <p style={{ marginTop: "12px", fontSize: "11px", color: "#888", cursor: "pointer" }}>
                    or tap this popup to review the board
                  </p>
                </div>
              )}
              <div style={{ fontSize: "32px", fontWeight: "bold", marginBottom: "10px", color: blackTime < 30 ? "#ff6b6b" : theme.text }}>{gameMode === "asura" ? "👹 Asura" : "Black"}: {formatTime(blackTime)}</div>

              {guruPickerMode && (
                <div style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)", backgroundColor: "#1a1a2e", border: "2px solid #a855f7", borderRadius: "16px", padding: "24px", zIndex: 1000, textAlign: "center", boxShadow: "0 0 40px rgba(168,85,247,0.5)" }}>
                  <h3 style={{ color: "#a855f7", marginBottom: "16px" }}>✨ Choose which piece to resurrect</h3>
                  <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
                    {guruPickerMode.options.map((res, i) => {
                      const symbols = { p: "♟", n: "♞", b: "♝", r: "♜", q: "♛" };
                      return (
                        <button key={i} onClick={() => performResurrection(res, guruPickerMode.square)} style={{ padding: "16px 24px", fontSize: "32px", backgroundColor: "rgba(168,85,247,0.2)", border: "2px solid #a855f7", borderRadius: "12px", cursor: "pointer", color: "#fff", display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
                          {symbols[res.piece] || res.piece}
                          <span style={{ fontSize: "12px", color: "#aaa" }}>{res.piece === "n" ? "Knight" : res.piece === "b" ? "Bishop" : res.piece === "r" ? "Rook" : res.piece === "q" ? "Queen" : "Pawn"}</span>
                        </button>
                      );
                    })}
                  </div>
                  <button onClick={() => { setGuruPickerMode(null); setGuruMode(null); }} style={{ marginTop: "16px", fontSize: "12px", background: "none", border: "none", color: "#aaa", cursor: "pointer", textDecoration: "underline" }}>cancel</button>
                </div>
              )}

              <div style={{ width: "600px", height: "600px", flexShrink: 0 }}>
                <Chessboard position={game.fen()} onPieceDrop={onPieceDrop} onSquareClick={onSquareClick} animationDuration={300} customSquareStyles={customStyles} customDarkSquareStyle={{ backgroundColor: theme.darkSquare }} customLightSquareStyle={{ backgroundColor: theme.lightSquare }} boardWidth={600} />
              </div>
              <div style={{ fontSize: "32px", fontWeight: "bold", marginTop: "10px", color: whiteTime < 30 ? "#ff6b6b" : theme.text }}>🌟 You: {formatTime(whiteTime)}</div>
              {!gameOver && <p style={{ marginTop: "15px", fontSize: "16px" }}>Turn: {game.turn() === "w" ? (gameMode === "asura" ? "You" : "White") : (gameMode === "asura" ? "Asura" : "Black")}{activationMode && <span style={{ color: "#ffd700", marginLeft: "10px" }}>⚡ ACTIVATION</span>}{chandraPlacementMode && <span style={{ color: "#e5e7eb", marginLeft: "10px" }}>🌙 CLONES</span>}{guruMode && <span style={{ color: "#a855f7", marginLeft: "10px" }}>🪐 RESURRECT</span>}{shaniMode && <span style={{ color: "#94a3b8", marginLeft: "10px" }}>🪐 FREEZE</span>}{waitingForBot && <span style={{ color: "#ff6b6b", marginLeft: "10px" }}>👹 Thinking...</span>}</p>}
              {!gameOver && <button onClick={resetGame} style={{ marginTop: "15px", padding: "10px 20px", fontSize: "14px", backgroundColor: "#e94560", color: "#fff", border: "none", borderRadius: "5px", cursor: "pointer", fontWeight: "bold" }}>Main Menu</button>}
            </div>

            {/* RIGHT: score + captures */}
            <div style={{ width: "180px", display: "flex", flexDirection: "column", gap: "15px" }}>
              {gameMode === "asura" ? (
                <div style={{ padding: "15px", backgroundColor: "#16213e", borderRadius: "8px", border: "2px solid #ff4444" }}>
                  <div style={{ fontWeight: "bold", marginBottom: "10px", fontSize: "14px", color: "#ff4444", textAlign: "center" }}>👹 Asura Status</div>
                  <div style={{ textAlign: "center", fontSize: "24px", fontWeight: "bold", color: "#ff6b6b" }}>{trulyDeadCount}/16</div>
                  <div style={{ textAlign: "center", fontSize: "11px", color: "#aaa", marginTop: "5px" }}>Truly Slain</div>
                </div>
              ) : (
                <div style={{ padding: "15px", backgroundColor: "#16213e", borderRadius: "8px", textAlign: "center" }}>
                  <div style={{ fontSize: "14px", color: "#888", marginBottom: "10px" }}>Score</div>
                  <div style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "5px" }}>{currentMaterial.white}</div>
                  <div style={{ fontSize: "12px", color: "#888", marginBottom: "10px" }}>vs</div>
                  <div style={{ fontSize: "24px", fontWeight: "bold" }}>{currentMaterial.black}</div>
                </div>
              )}
              <div>
                <div style={{ fontSize: "12px", color: "#888", marginBottom: "5px" }}>{gameMode === "asura" ? "You captured:" : "White captured:"}</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "5px", padding: "10px", backgroundColor: "#16213e", borderRadius: "8px", minHeight: "80px" }}>{whiteCaptured.map((p, i) => <span key={i} style={{ fontSize: "20px" }}>{getPieceSymbol(p)}</span>)}</div>
              </div>
              <div>
                <div style={{ fontSize: "12px", color: "#888", marginBottom: "5px" }}>{gameMode === "asura" ? "Asura captured:" : "Black captured:"}</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "5px", padding: "10px", backgroundColor: "#16213e", borderRadius: "8px", minHeight: "80px" }}>{blackCaptured.map((p, i) => <span key={i} style={{ fontSize: "20px" }}>{getPieceSymbol(p)}</span>)}</div>
              </div>
              <div style={{ padding: "12px", backgroundColor: "#16213e", borderRadius: "8px", fontSize: "12px" }}>
                <div style={{ fontWeight: "bold", marginBottom: "8px", fontSize: "13px" }}>⏱️ Card Costs {gameMode === "asura" && <span style={{ color: "#4ecca3" }}>(50% off!)</span>}</div>
                <div style={{ marginBottom: "4px", color: "#aaa" }}>Tier 1: {gameMode === "asura" ? "4s" : "7-8s"}</div>
                <div style={{ marginBottom: "4px", color: "#aaa" }}>Tier 2: {gameMode === "asura" ? "5-6s" : "9-11s"}</div>
                <div style={{ marginBottom: "8px", color: "#aaa" }}>Tier 3: {gameMode === "asura" ? "5-7s" : "10-14s"}</div>
                <div style={{ fontSize: "11px", color: "#888", fontStyle: "italic" }}>Final 30s: All cards 50% off</div>
              </div>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════
            MOBILE LAYOUT
        ════════════════════════════════════ */}
        {gameStarted && isMobile && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%", maxWidth: "500px", margin: "0 auto", position: "relative" }}>

            {/* Game over overlay */}
            {gameOver && finalScore && !gameOverDismissed && (
              <div onClick={() => setGameOverDismissed(true)} style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)", backgroundColor: "#16213e", padding: "32px 24px", borderRadius: "15px", zIndex: 500, textAlign: "center", border: `3px solid ${theme.accent}`, width: "88vw", maxWidth: "380px" }}>
                <h2 style={{ marginBottom: "16px", fontSize: "24px" }}>{gameMode === "asura" ? (winner === "white" ? "🌟 The Navagraha Prevail! 🌟" : "👹 The Asura Reign! 👹") : `${winner === "white" ? "White" : "Black"} Wins!`}</h2>
                {gameMode !== "asura" && <><p style={{ fontSize: "18px", marginBottom: "8px" }}>White: {finalScore.white}</p><p style={{ fontSize: "18px", marginBottom: "20px" }}>Black: {finalScore.black}</p></>}
                <button onClick={resetGame} style={{ padding: "14px 28px", fontSize: "16px", backgroundColor: theme.accent, border: "none", borderRadius: "8px", cursor: "pointer", color: "#000", fontWeight: "bold" }}>Main Menu</button>
                <p style={{ marginTop: "12px", fontSize: "11px", color: "#888", cursor: "pointer" }}>
                  or tap this popup to review the board
                </p>
                {gameOver && gameOverDismissed && (
                  <div onClick={() => setGameOverDismissed(false)} style={{ position: "fixed", top: "12px", left: "50%", transform: "translateX(-50%)", backgroundColor: theme.accent, color: "#000", padding: "8px 20px", borderRadius: "20px", fontSize: "13px", fontWeight: "bold", cursor: "pointer", zIndex: 300, boxShadow: "0 4px 15px rgba(0,0,0,0.4)" }}>
                    {winner === "white" ? "🌟 You won!" : "👹 You lost!"} · tap to see result
                  </div>
                )}
              </div>
            )}

            {/* Chaos popup */}
            {showChaosPopup && (
              <div onClick={() => setShowChaosPopup(false)} style={{ position: "fixed", top: "16px", left: "50%", transform: "translateX(-50%)", backgroundColor: "#ff6b6b", padding: "10px 20px", borderRadius: "12px", zIndex: 400, textAlign: "center", border: "2px solid #fff", cursor: "pointer", width: "90vw", maxWidth: "360px" }}>
                <div style={{ fontWeight: "bold", fontSize: "15px" }}>🔥 CHAOS MODE — All cards half price! 🔥</div>
              </div>
            )}

            {/* Special mode banner */}
            {specialModeLabel && (
              <div style={{ width: "100%", backgroundColor: selectedCard ? "#1e293b" : "#1a1a00", border: `1px solid ${selectedCard ? "#ffd700" : "#ffd700"}`, borderRadius: "8px", padding: "8px 12px", marginBottom: "6px", fontSize: "13px", color: "#ffd700", textAlign: "center", animation: "bannerPulse 1.5s infinite" }}>
                {specialModeLabel}
                {(chandraPlacementMode || guruMode || shaniMode || activationMode || selectedCard) && (
                  <button onClick={() => { setSelectedCard(null); setChandraPlacementMode(null); setGuruMode(null); setShaniMode(null); setActivationMode(false); }} style={{ marginLeft: "10px", fontSize: "11px", background: "none", border: "1px solid #ffd700", borderRadius: "4px", color: "#ffd700", cursor: "pointer", padding: "2px 6px" }}>✕ cancel</button>
                )}
              </div>
            )}

            {/* Chandra confirm on mobile */}
            {chandraPlacementMode && (
              <div style={{ width: "100%", display: "flex", gap: "8px", marginBottom: "6px" }}>
                <button onClick={confirmChandraPlacement} disabled={chandraPlacementMode.mirages.length === 0} style={{ flex: 1, padding: "10px", fontSize: "13px", backgroundColor: chandraPlacementMode.mirages.length > 0 ? "#4ecca3" : "#555", color: chandraPlacementMode.mirages.length > 0 ? "#000" : "#888", border: "none", borderRadius: "8px", cursor: chandraPlacementMode.mirages.length > 0 ? "pointer" : "not-allowed", fontWeight: "bold" }}>
                  ✓ Confirm Clones ({chandraPlacementMode.mirages.length}/2){chandraPlacementMode.mirages.length === 2 ? " +5s" : ""}
                </button>
              </div>
            )}

            {/* BLACK timer bar */}
            <div style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 12px", backgroundColor: "rgba(0,0,0,0.4)", borderRadius: "10px", marginBottom: "4px" }}>
              <div style={{ fontSize: "13px", color: "#888" }}>
                {gameMode === "asura" ? "👹 Asura" : "⬛ Black"}
                {/* tiny captures */}
                <span style={{ marginLeft: "6px", fontSize: "11px" }}>{blackCaptured.slice(-6).map((p, i) => <span key={i}>{getPieceSymbol(p)}</span>)}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                {gameMode === "asura" && <span style={{ fontSize: "11px", color: "#ff6b6b" }}>{trulyDeadCount}/16 slain</span>}
                {gameMode !== "asura" && <span style={{ fontSize: "11px", color: "#888" }}>⚔️{currentMaterial.black}</span>}
                <div style={{ fontSize: "22px", fontWeight: "bold", color: blackTime < 30 ? "#ff6b6b" : theme.text, minWidth: "52px", textAlign: "right" }}>{formatTime(blackTime)}</div>
              </div>
            </div>

            {/* BOARD */}
            <div style={{ width: boardSize, height: boardSize, flexShrink: 0 }}>
              <Chessboard
                position={game.fen()}
                onPieceDrop={onPieceDrop}
                onSquareClick={onSquareClick}
                animationDuration={300}
                customSquareStyles={customStyles}
                customDarkSquareStyle={{ backgroundColor: theme.darkSquare }}
                customLightSquareStyle={{ backgroundColor: theme.lightSquare }}
                boardWidth={boardSize}
              />
            </div>

            {/* WHITE timer bar */}
            <div style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 12px", backgroundColor: "rgba(0,0,0,0.4)", borderRadius: "10px", marginTop: "4px" }}>
              <div style={{ fontSize: "13px", color: "#ccc" }}>
                {gameMode === "asura" ? "🌟 You" : "⬜ White"}
                <span style={{ marginLeft: "6px", fontSize: "11px" }}>{whiteCaptured.slice(-6).map((p, i) => <span key={i}>{getPieceSymbol(p)}</span>)}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                {gameMode !== "asura" && <span style={{ fontSize: "11px", color: "#888" }}>⚔️{currentMaterial.white}</span>}
                <div style={{ fontSize: "22px", fontWeight: "bold", color: whiteTime < 30 ? "#ff6b6b" : theme.text, minWidth: "52px", textAlign: "right" }}>{formatTime(whiteTime)}</div>
              </div>
            </div>

            {/* Status row */}
            <div style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "8px", padding: "0 4px" }}>
              <div style={{ fontSize: "13px", color: "#888" }}>
                {waitingForBot ? <span style={{ color: "#ff6b6b" }}>👹 Thinking...</span> : `Turn: ${game.turn() === "w" ? (gameMode === "asura" ? "You" : "White") : (gameMode === "asura" ? "Asura" : "Black")}`}
              </div>
              <button onClick={resetGame} style={{ position: "fixed", bottom: "24px", left: "20px", zIndex: 200, padding: "10px 16px", fontSize: "12px", backgroundColor: "#e94560", color: "#fff", border: "none", borderRadius: "20px", cursor: "pointer", fontWeight: "bold", boxShadow: "0 4px 15px rgba(233,69,96,0.5)" }}>✕ Menu</button>
            </div>

            {/* Āhvān hint — fades out after first tap */}
            <div
              onClick={() => { if (game.turn() === "w" && !selectedCard) setShowCardOverlay(true); }}
              style={{
                width: "100%",
                marginTop: "16px",
                padding: "12px",
                borderRadius: "12px",
                border: "1px solid rgba(255,255,255,0.1)",
                backgroundColor: "rgba(255,255,255,0.04)",
                textAlign: "center",
                cursor: game.turn() === "w" ? "pointer" : "default",
                animation: "bannerPulse 2.5s infinite",
                opacity: (!showCardOverlay && game.turn() === "w" && !selectedCard) ? 1 : 0,
                transition: "opacity 0.3s ease",
                pointerEvents: game.turn() === "w" ? "auto" : "none"
              }}
            >
              <div style={{ fontSize: "13px", color: theme.accent, fontWeight: "600", letterSpacing: "0.03em" }}>
                ✨ Tap <strong>Āhvān</strong> to summon the Navagraha
              </div>
              <div style={{ fontSize: "11px", color: "#555", marginTop: "4px" }}>
                Celestial powers unlock as you capture pieces
              </div>
            </div>


            {/* Activate power button */}
            {!selectedCard && !chandraPlacementMode && !guruMode && !shaniMode && piecesInZones.length > 0 && game.turn() === "w" && (
              <button
                onClick={() => setActivationMode(a => !a)}
                style={{ width: "100%", marginTop: "8px", padding: "12px", fontSize: "14px", backgroundColor: activationMode ? "#e94560" : "#ffd700", color: "#000", border: "none", borderRadius: "10px", cursor: "pointer", fontWeight: "bold" }}
              >
                {activationMode ? "✕ Cancel Activation" : `⚡ Activate Power (${piecesInZones.length} available)`}
              </button>
            )}

            {/* Guru picker modal */}
            {guruPickerMode && (
              <div style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)", backgroundColor: "#1a1a2e", border: "2px solid #a855f7", borderRadius: "16px", padding: "24px", zIndex: 600, textAlign: "center", boxShadow: "0 0 40px rgba(168,85,247,0.5)", width: "88vw", maxWidth: "340px" }}>
                <h3 style={{ color: "#a855f7", marginBottom: "16px", fontSize: "16px" }}>✨ Choose piece to resurrect</h3>
                <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
                  {guruPickerMode.options.map((res, i) => {
                    const symbols = { p: "♟", n: "♞", b: "♝", r: "♜", q: "♛" };
                    return (
                      <button key={i} onClick={() => performResurrection(res, guruPickerMode.square)} style={{ padding: "14px 20px", fontSize: "28px", backgroundColor: "rgba(168,85,247,0.2)", border: "2px solid #a855f7", borderRadius: "12px", cursor: "pointer", color: "#fff", display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
                        {symbols[res.piece] || res.piece}
                        <span style={{ fontSize: "11px", color: "#aaa" }}>{res.piece === "n" ? "Knight" : res.piece === "b" ? "Bishop" : res.piece === "r" ? "Rook" : res.piece === "q" ? "Queen" : "Pawn"}</span>
                      </button>
                    );
                  })}
                </div>
                <button onClick={() => { setGuruPickerMode(null); setGuruMode(null); }} style={{ marginTop: "14px", fontSize: "12px", background: "none", border: "none", color: "#aaa", cursor: "pointer", textDecoration: "underline" }}>cancel</button>
              </div>
            )}

            {/* ✨ Floating card button */}
            <div style={{ position: "fixed", bottom: "24px", right: "20px", zIndex: 200, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "8px" }}>
              {/* Selected card pill */}
              {selectedCard && (
                <div style={{ backgroundColor: "#1e293b", border: `2px solid ${selectedCard.color}`, borderRadius: "20px", padding: "6px 14px", fontSize: "12px", color: "#fff", display: "flex", alignItems: "center", gap: "8px", boxShadow: `0 0 12px ${selectedCard.color}88` }}>
                  <span>{selectedCard.name}</span>
                  <span style={{ color: "#ffd700", fontWeight: "bold" }}>{getCardCost(selectedCard)}s</span>
                  <button onClick={() => setSelectedCard(null)} style={{ background: "none", border: "none", color: "#aaa", cursor: "pointer", fontSize: "14px", lineHeight: 1, padding: 0 }}>✕</button>
                </div>
              )}
              {/* Chandramode active pill */}
              {chandraMode && (
                <div style={{ backgroundColor: "#1e293b", border: "2px solid #e5e7eb", borderRadius: "20px", padding: "6px 14px", fontSize: "12px", color: "#e5e7eb" }}>
                  🌙 {Math.ceil(chandraMode.turnsLeft / 2)} turns left
                </div>
              )}
              {/* Main button */}
              <button
                onClick={() => setShowCardOverlay(true)}
                style={{ height: "56px", borderRadius: "28px", padding: "0 20px", backgroundColor: theme.accent, border: "none", fontSize: "14px", cursor: "pointer", boxShadow: `0 4px 20px ${theme.accent}88`, display: "flex", alignItems: "center", justifyContent: "center", color: "#000", fontWeight: "bold", gap: "6px", whiteSpace: "nowrap" }}
              >
                ✨ Āhvān
              </button>
            </div>

            {/* Card overlay */}
            <MobileCardOverlay
              show={showCardOverlay}
              onClose={() => setShowCardOverlay(false)}
              tier1Unlocked={tier1Unlocked}
              tier2Unlocked={tier2Unlocked}
              tier3Unlocked={tier3Unlocked}
              selectedCard={selectedCard}
              onSelectCard={setSelectedCard}
              gameMode={gameMode}
              getCardCost={getCardCost}
              currentTurn={game.turn()}
              usedCards={usedCards}
              cardCooldowns={cardCooldowns}
            />
          </div>
        )}
      </div >
    </>
  );
}

export default App;