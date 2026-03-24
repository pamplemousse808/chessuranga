import { useState, useEffect, useRef } from "react";
import { Chessboard } from "react-chessboard";
import { Chess } from "chess.js";
import AboutPage from "./AboutPage";
import { Analytics } from '@vercel/analytics/react';
import { SHARED_DECK, ASURA_DECK, getTheme } from "./gameConstants";
import { formatTime, getPieceValue, getPieceSymbol, getPieceId, getDailyPuzzleNumber } from "./gameUtils";
import { useStockfish } from "./useStockfish";
import HowToPlay from "./HowToPlay";
import MobileCardOverlay from "./MobileCardOverlay";
import PvpTabletLayout from "./PvpTabletLayout";
import DailyPuzzle from "./DailyPuzzle";
import NavagrahaPage from "./NavagrahaPage";

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


// ── Main App ──────────────────────────────────────────────────────────────────
function App() {
  const isMobile = useIsMobile();
  const [game, setGame] = useState(new Chess());
  const [moveFrom, setMoveFrom] = useState("");
  const [whiteTime, setWhiteTime] = useState(180);
  const [blackTime, setBlackTime] = useState(180);
  const [startingTime, setStartingTime] = useState(180);
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
  const [lastWhiteCard, setLastWhiteCard] = useState(null);
  const [lastBlackCard, setLastBlackCard] = useState(null);
  const [tier1Unlocked, setTier1Unlocked] = useState(false);
  const [tier2Unlocked, setTier2Unlocked] = useState(false);
  const [tier3Unlocked, setTier3Unlocked] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);
  const [cardCooldowns, setCardCooldowns] = useState({});
  const [poweredPieces, setPoweredPieces] = useState({});
  const [frozenPieces, setFrozenPieces] = useState({});
  const [chandraMode, setChandraMode] = useState(null);
  const [chandraPlacementMode, setChandraPlacementMode] = useState(null);
  const [guruMode, setGuruMode] = useState(null);
  const [budhaSquare, setBudhaSquare] = useState(null);
  const [resurrectedPieces, setResurrectedPieces] = useState({});
  const [shaniMode, setShaniMode] = useState(null);
  const [guruDuplicateMode, setGuruDuplicateMode] = useState(null);
  // null | { square: sq, piece: {type,color}, side: null | 'left' | 'right' }
  const [duplicatePieces, setDuplicatePieces] = useState({});
  // { 'e4': { turnsLeft: 2, originalSquare: 'e2' } }
  const [mahishasuraMode, setMahishasuraMode] = useState(null);
  const [vritraRanks, setVritraRanks] = useState([]);
  const [tarakaProtected, setTarakaProtected] = useState({});
  const [chaosModeShown, setChaosModeShown] = useState({ white: false, black: false });
  const [showChaosPopup, setShowChaosPopup] = useState(false);
  const [asuraLives, setAsuraLives] = useState({});
  const poweredPiecesRef = useRef(poweredPieces);
  const [waitingForBot, setWaitingForBot] = useState(false);
  const [gameOverDismissed, setGameOverDismissed] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [showNavagraha, setShowNavagraha] = useState(false);
  const [cardPlayedThisTurn, setCardPlayedThisTurn] = useState(false);
  const [shukraAsuraPromo, setShukraAsuraPromo] = useState(null); // { square, gc }
  // Mobile UI state
  const [showCardOverlay, setShowCardOverlay] = useState(false);
  const { stockfish, stockfishRef, stockfishMoveRef } = useStockfish(gameMode, gameStarted, shukraDifficulty);


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
    if (gameMode === "asura" || gameMode === "shukracharya") {
      setCardCooldowns(prev => { const u = { ...prev }; Object.keys(u).forEach(id => { u[id] -= 1; if (u[id] <= 0) delete u[id]; }); return u; });
    }
    // TARAKA decay
    const updatedTaraka = {};
    Object.keys(tarakaProtected).forEach(sq => {
      const tl = tarakaProtected[sq].turnsLeft - 0.5;
      if (tl > 0) updatedTaraka[sq] = { ...tarakaProtected[sq], turnsLeft: tl };
    });
    setTarakaProtected(updatedTaraka);

    // VRITRA decay
    const updatedVritra = vritraRanks.filter(v => v.turnsLeft - 0.5 > 0).map(v => ({ ...v, turnsLeft: v.turnsLeft - 0.5 }));
    setVritraRanks(updatedVritra);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [moveCount]);

  useEffect(() => {
    if (!guruDuplicateMode?.side) return;
    const { square, piece, side } = guruDuplicateMode;
    const files = ["a", "b", "c", "d", "e", "f", "g", "h"];
    const fileIdx = files.indexOf(square[0]);
    const rank = square[1];
    const targetFileIdx = side === "left" ? fileIdx - 1 : fileIdx + 1;
    if (targetFileIdx < 0 || targetFileIdx > 7) {
      alert("No space to spawn duplicate on that side!");
      setGuruDuplicateMode(null);
      return;
    }
    const targetSq = files[targetFileIdx] + rank;
    if (game.get(targetSq)) {
      alert("That square is occupied!");
      setGuruDuplicateMode(null);
      return;
    }
    const ng = new Chess(game.fen());
    ng.put({ type: piece.type, color: piece.color }, targetSq);
    setGame(ng);
    setDuplicatePieces(prev => ({ ...prev, [targetSq]: { turnsLeft: 4, originalSquare: square } }));
    console.log("set duplicate at:", targetSq);
    setGuruDuplicateMode(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [guruDuplicateMode?.side]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if ((gameMode === "asura" || gameMode === "shukracharya") && gameStarted && !gameOver && game.turn() === "b" && !waitingForBot && stockfish) {
      makeAsuraMove();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [game, gameStarted, gameOver, gameMode, waitingForBot, stockfish]);

  function addTime(player, seconds) { if (player === "w") setWhiteTime(p => Math.min(p + seconds, startingTime)); else setBlackTime(p => Math.min(p + seconds, startingTime)); }
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

  function tickAsuraCounters() {
    console.log("duplicatePieces at tick:", duplicatePieces);
    setVritraRanks(prev => prev.map(v => ({ ...v, turnsLeft: v.turnsLeft - 1 })).filter(v => v.turnsLeft > 0));
    setTarakaProtected(prev => {
      const next = {};
      Object.entries(prev).forEach(([sq, val]) => {
        if (val.turnsLeft > 1) next[sq] = { ...val, turnsLeft: val.turnsLeft - 1 };
      });
      return next;
    });
    // ── NEW: tick Guru duplicates ──
    setDuplicatePieces(prev => {
      const next = {};
      Object.entries(prev).forEach(([sq, val]) => {
        if (val.turnsLeft > 1) next[sq] = { ...val, turnsLeft: val.turnsLeft - 1 };
        else {
          // dissolve — remove from board
          setGame(g => {
            const ng = new Chess(g.fen());
            ng.remove(sq);
            return ng;
          });
        }
      });
      return next;
    });
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
        if (sq && !ng.get(sq)) ng.put({ type: pieceType, color: "b" }, sq);
        return ng;
      });
    }, 2000);
  }
  // ── Helper: get adjacent enemy squares around a given square ─────────────────
  function getAdjacentEnemySquares(square, enemyColor, gameState) {
    const files = ["a", "b", "c", "d", "e", "f", "g", "h"];
    const f = files.indexOf(square[0]);
    const r = parseInt(square[1]);
    const result = [];
    for (let df = -1; df <= 1; df++) {
      for (let dr = -1; dr <= 1; dr++) {
        if (df === 0 && dr === 0) continue;
        const nf = f + df, nr = r + dr;
        if (nf >= 0 && nf < 8 && nr >= 1 && nr <= 8) {
          const sq = files[nf] + nr;
          const piece = gameState.get(sq);
          if (piece && piece.color === enemyColor) result.push(sq);
        }
      }
    }
    return result;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // applyCardToPiece(square)
  //
  // Called when a player has a card selected and taps one of their own pieces.
  // Validates the tap, fires the card effect, marks the card used.
  // ─────────────────────────────────────────────────────────────────────────────
  function applyCardToPiece(square) {
    if (!selectedCard) return;
    if (cardPlayedThisTurn) return;
    const piece = game.get(square);
    const currentPlayer = game.turn();

    // Must tap your own piece
    if (!piece || piece.color !== currentPlayer) return;

    // Frozen pieces can't receive cards
    if (frozenPieces[square]) return;

    const card = selectedCard;
    const cardId = card.id;
    const cost = getCardCost(card);
    const enemyColor = currentPlayer === "w" ? "b" : "w";

    // ── Shared: deduct time and mark card used ──────────────────────────────────
    function commitCard() {
      subtractTime(currentPlayer, cost);
      setCardPlayedThisTurn(true);
      if (gameMode === "asura" || gameMode === "shukracharya") {
        setCardCooldowns(prev => ({ ...prev, [cardId]: 6 }));
      } else {
        setUsedCards(prev => [...prev, cardId]);
      }
      if (gameMode === "pvp") {
        if (currentPlayer === "w") setLastWhiteCard(cardId);
        else setLastBlackCard(cardId);
      }
      setSelectedCard(null);
    }

    // ─── SWITCH on card id ──────────────────────────────────────────────────────

    // ── Direct power cards (assign to poweredPieces immediately) ───────────────
    // RAHU / RAVANA — phase walk (pass through pieces)
    if (cardId === "RAHU" || cardId === "RAVANA") {
      setPoweredPieces(prev => ({ ...prev, [square]: { power: "RAHU", usesLeft: 2 } }));
      commitCard();
      return;
    }

    // KETU — martyr's curse 
    if (cardId === "KETU") {
      setPoweredPieces(prev => ({ ...prev, [square]: { power: "KETU", usesLeft: 6, startSquare: square } }));
      commitCard();
      return;
    }

    // SURYA / HIRANYA — invincibility (can't be captured)
    if (cardId === "SURYA" || cardId === "HIRANYA") {
      setPoweredPieces(prev => ({ ...prev, [square]: { power: "SURYA", usesLeft: 4 } }));
      commitCard();
      return;
    }

    // SHUKRA (Navagraha) — resurrection
    if (cardId === "SHUKRA") {
      const shukraRadius = SHARED_DECK.find(c => c.id === "SHUKRA")?.radius ?? 2;
      const avail = captureHistory.filter(cap => {
        const occ = game.get(cap.square);
        const fileDiff = Math.abs(cap.square.charCodeAt(0) - square.charCodeAt(0));
        const rankDiff = Math.abs(parseInt(cap.square[1]) - parseInt(square[1]));
        const inRadius = fileDiff <= shukraRadius && rankDiff <= shukraRadius;
        return (
          cap.color === currentPlayer &&
          inRadius &&
          (!occ || occ.color !== currentPlayer)
        );
      });
      if (avail.length === 0) {
        alert("No captured pieces to resurrect in range!");
        return;
      }
      commitCard();
      setGuruMode({
        tileSquare: square,
        playerColor: currentPlayer,
        availableResurrections: avail,
      });
      return;
    }

    // BUDHA — double move
    if (cardId === "BUDHA") {
      setPoweredPieces(prev => ({ ...prev, [square]: { power: "BUDHA", usesLeft: 2 } }));
      commitCard();
      return;
    }

    // TARAKA — can only be captured by same piece type for 3 turns
    if (cardId === "TARAKA") {
      setTarakaProtected(prev => ({ ...prev, [square]: { turnsLeft: 6, pieceType: piece.type } }));
      commitCard();
      return;
    }

    // VRITRA — enemy pieces can't cross this piece's rank for 2 turns
    if (cardId === "VRITRA") {
      const rank = parseInt(square[1]);
      setVritraRanks(prev => [...prev.filter(v => v.rank !== rank), { rank, turnsLeft: 4, color: currentPlayer }]);
      commitCard();
      return;
    }

    // SHUKRA_ASURA — pawns promote to any captured piece type at halfway
    if (cardId === "SHUKRA_ASURA") {
      setPoweredPieces(prev => ({ ...prev, [square]: { power: "SHUKRA_ASURA", usesLeft: 6 } }));
      commitCard();
      return;
    }

    // ── CHANDRA — clone flow (existing chandraPlacementMode unchanged) ──────────
    if (cardId === "CHANDRA") {
      commitCard();
      setChandraPlacementMode({
        square,
        piece,
        rank: parseInt(square[1]),
        mirages: [],
        teleportTo: null,
      });
      return;
    }

    // - new GURU
    if (cardId === "GURU") {
      commitCard();
      setGuruDuplicateMode({ square, piece, side: null });
      return;
    }

    // ── SHUKRA / BALI — resurrection flow (existing guruMode unchanged) ───────────
    if (cardId === "SHUKRA" || cardId === "BALI") {
      const guruRadius = cardId === "SHUKRA"
        ? (SHARED_DECK.find(c => c.id === "SHUKRA")?.radius ?? 2)
        : (ASURA_DECK.find(c => c.id === "BALI")?.radius ?? 2);
      const avail = captureHistory.filter(cap => {
        const occ = game.get(cap.square);
        const fileDiff = Math.abs(cap.square.charCodeAt(0) - square.charCodeAt(0));
        const rankDiff = Math.abs(parseInt(cap.square[1]) - parseInt(square[1]));
        const inRadius = fileDiff <= guruRadius && rankDiff <= guruRadius;
        return (
          cap.color === currentPlayer &&
          inRadius &&
          (!occ || occ.color !== currentPlayer)
        );
      });
      if (avail.length === 0) {
        alert("No captured pieces to resurrect in range!");
        return;
      }
      commitCard();
      setGuruMode({
        tileSquare: square,
        playerColor: currentPlayer,
        availableResurrections: avail,
      });
      return;
    }

    // ── MAHISHA — shapeshift into any captured piece type ──────────────────────
    if (cardId === "MAHISHA") {
      // Build list of unique captured enemy piece types the player can shapeshift into
      const capturedTypes = [...new Set(
        captureHistory
          .filter(c => c.color === enemyColor)
          .map(c => c.piece)
          .filter(t => t !== "k")
      )];
      if (capturedTypes.length === 0) {
        alert("No captured pieces to shapeshift into!");
        return;
      }
      commitCard();
      setMahishasuraMode({ square, piece, availableTypes: capturedTypes });
      return;
    }

    // ── SHUMBHA — capture then snap back ───────────────────────────────────────
    if (cardId === "SHUMBHA") {
      setPoweredPieces(prev => ({ ...prev, [square]: { power: "SHUMBHA", usesLeft: 1, originSquare: square } }));
      commitCard();
      return;
    }

    // ── SHANI / KALI_ASURA — freeze/smite: highlight enemy targets ─────────────
    // Player taps their own piece first, then we show enemy targets to tap next.
    if (cardId === "SHANI" || cardId === "KALI_ASURA") {
      const cardDef = cardId === "SHANI"
        ? SHARED_DECK.find(c => c.id === "SHANI")
        : ASURA_DECK.find(c => c.id === "KALI_ASURA");
      const radius = cardDef?.radius ?? 1;
      const files = ["a", "b", "c", "d", "e", "f", "g", "h"];
      const fromFile = files.indexOf(square[0]);
      const fromRank = parseInt(square[1]);
      const enemies = [];
      files.forEach((f, fi) => {
        for (let r = 1; r <= 8; r++) {
          if (Math.abs(fi - fromFile) <= radius && Math.abs(r - fromRank) <= radius) {
            const sq = f + r;
            const p = game.get(sq);
            if (p && p.color === enemyColor && !frozenPieces[sq]) {
              enemies.push({ square: sq, piece: p });
            }
          }
        }
      });
      if (enemies.length === 0) {
        alert("No enemy pieces in range!");
        return;
      }
      commitCard();
      setShaniMode({ enemyPieces: enemies, cardId, fromSquare: square });
      return;
    }

    // ── MANGALA — smite adjacent: highlight adjacent enemies ───────────────────
    if (cardId === "MANGALA") {
      const adjacentEnemies = getAdjacentEnemySquares(square, enemyColor, game);
      if (adjacentEnemies.length === 0) {
        alert("No adjacent enemy pieces to capture!");
        return;
      }
      commitCard();
      // Re-use shaniMode shape — onSquareClick handles both by checking cardId
      setShaniMode({
        enemyPieces: adjacentEnemies.map(sq => ({ square: sq, piece: game.get(sq) })),
        cardId: "MANGALA",
        fromSquare: square, // remember which piece is doing the capturing
      });
      return;
    }
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
        setGame(gc); setMoveCount(p => p + 1); setCardPlayedThisTurn(false);
        if (gc.isCheckmate()) { setGameOver(true); setWinner(gc.turn() === "w" ? "black" : "white"); }
        return gc;
      }
      // ── NEW: HIRANYA blocks capture (same as SURYA) ──

      if (chandraMode && game.get(to)) {
        const isMirage = chandraMode.mirages.includes(to); const isReal = to === chandraMode.realSquare;
        if (isMirage) {
          const gc = new Chess(game.fen());
          chandraMode.mirages.forEach(sq => { if (gc.get(sq)) gc.remove(sq); });
          const move = gc.move({ from, to, promotion }); if (!move) return null;
          setChandraMode(null); setGame(gc); tickAsuraCounters(); setMoveCount(p => p + 1); setCardPlayedThisTurn(false);
          if (gc.isCheckmate()) { setGameOver(true); setWinner(gc.turn() === "w" ? "black" : "white"); }
          return gc;
        } else if (isReal) {
          const cleanGame = new Chess(game.fen());
          chandraMode.mirages.forEach(sq => { if (cleanGame.get(sq)) cleanGame.remove(sq); });
          setGame(cleanGame); setChandraMode(null);
          const gc = new Chess(cleanGame.fen()); const piece = gc.get(from); if (!piece) return null;
          const cp = gc.get(to);
          const move = gc.move({ from, to, promotion }); if (!move) return null;
          if (cp) {
            let tb = getPieceValue(cp.type); const cpHadKetu = poweredPieces[to]?.power === "KETU";
            const ketuStart = poweredPieces[to]?.startSquare; // read BEFORE cleanup
            const np = {}; Object.keys(poweredPieces).forEach(sq => { if (poweredPieces[sq]?.power && sq !== to) np[sq] = poweredPieces[sq]; }); setPoweredPieces(np);
            if (cpHadKetu) {
              if (ketuStart && !gc.get(ketuStart) && ketuStart !== to) {
                gc.put({ type: cp.type, color: cp.color }, ketuStart);
              } else {
                addTime(gc.turn() === "w" ? "b" : "w", getPieceValue(cp.type));
                setCaptureHistory(p => [...p, { piece: cp.type, square: to, color: cp.color }]);
                if (gc.turn() === "w") setBlackCaptured(p => [...p, cp.type]); else setWhiteCaptured(p => [...p, cp.type]);
                checkTierUnlocks(cp.type);
              }
            } else {
              addTime(gc.turn() === "w" ? "b" : "w", tb);
              setCaptureHistory(p => [...p, { piece: cp.type, square: to, color: cp.color }]);
              if (gc.turn() === "w") setBlackCaptured(p => [...p, cp.type]); else setWhiteCaptured(p => [...p, cp.type]);
              checkTierUnlocks(cp.type);
            }
          }
          setGame(gc); setMoveCount(p => p + 1); setCardPlayedThisTurn(false);
          if (gc.isCheckmate()) { setGameOver(true); setWinner(gc.turn() === "w" ? "black" : "white"); }
          return gc;
        }
      }

      const piece = game.get(from); if (!piece) return null;
      const cp = game.get(to); const power = poweredPieces[from];
      if (cp && poweredPieces[to]?.power === "HIRANYA" && poweredPieces[to].usesLeft > 0) {
        return null;
      }

      // ── NEW: TARAKASURA — can only be captured by same piece type ──
      if (cp && tarakaProtected[to]) {
        const attackerType = game.get(from)?.type;
        if (attackerType !== tarakaProtected[to].pieceType) {
          return null;
        }
      }
      if (frozenPieces[from]) return null;
      // ── NEW: VRITRA — White cannot move to a blocked rank ──
      if (vritraRanks.length > 0 && piece && piece.color === "w") {
        const targetRank = parseInt(to[1]);
        if (vritraRanks.some(v => v.rank === targetRank)) return null;
      }
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

      // ── NEW: RAVANA — moves like a queen for 1 turn ──
      if (!moveWasMade && power?.power === "RAVANA" && power.usesLeft > 0) {
        const ff = files.indexOf(from[0]), fr = parseInt(from[1]);
        const tf = files.indexOf(to[0]), tr = parseInt(to[1]);
        const fileDiff = Math.abs(tf - ff), rankDiff = Math.abs(tr - fr);
        const isQueenMove = fileDiff === rankDiff || ff === tf || fr === tr;
        if (isQueenMove && !(cp && cp.color === piece.color)) {
          gc.remove(from);
          if (cp) gc.remove(to);
          gc.put({ type: piece.type, color: piece.color }, to);
          const fp = gc.fen().split(" "); fp[1] = fp[1] === "w" ? "b" : "w"; gc.load(fp.join(" "));
          moveWasMade = true;
        }
      }
      // ── SHUMBHA — viper strike: capture then snap back to origin ──
      if (!moveWasMade && power?.power === "SHUMBHA" && power.usesLeft > 0) {
        const originSquare = power.originSquare;
        const ff = files.indexOf(from[0]), fr = parseInt(from[1]);
        const tf = files.indexOf(to[0]), tr = parseInt(to[1]);
        const fileDiff = Math.abs(tf - ff), rankDiff = Math.abs(tr - fr);
        // Must be a capture, must be within normal move range for that piece type
        let validStrike = false;
        if (cp && cp.color !== piece.color) {
          if (piece.type === "p") validStrike = fileDiff === 1 && tr === fr + (piece.color === "w" ? 1 : -1);
          else if (piece.type === "n") validStrike = (fileDiff === 2 && rankDiff === 1) || (fileDiff === 1 && rankDiff === 2);
          else if (piece.type === "b") validStrike = fileDiff === rankDiff;
          else if (piece.type === "r") validStrike = ff === tf || fr === tr;
          else if (piece.type === "q") validStrike = fileDiff === rankDiff || ff === tf || fr === tr;
          else if (piece.type === "k") validStrike = fileDiff <= 1 && rankDiff <= 1;
        }
        if (validStrike && originSquare) {
          // Remove the captured piece, return striker to origin
          gc.remove(from);
          gc.remove(to);
          gc.put({ type: piece.type, color: piece.color }, originSquare);
          const fp = gc.fen().split(" "); fp[1] = fp[1] === "w" ? "b" : "w"; gc.load(fp.join(" "));
          moveWasMade = true;
        }
      }
      // ── NEW: KALI_ASURA — capture any adjacent (same as MANGALA) ──
      if (!moveWasMade && power?.power === "KALI_ASURA" && power.usesLeft > 0) {
        const ff = files.indexOf(from[0]), fr = parseInt(from[1]);
        const tf = files.indexOf(to[0]), tr = parseInt(to[1]);
        if (Math.abs(tf - ff) <= 1 && Math.abs(tr - fr) <= 1 && cp && cp.color !== piece.color) {
          gc.remove(from); gc.remove(to); gc.put({ type: piece.type, color: piece.color }, to);
          const fp = gc.fen().split(" "); fp[1] = fp[1] === "w" ? "b" : "w"; gc.load(fp.join(" "));
          moveWasMade = true;
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
      if (power?.power === "BUDHA" && !cp && power.usesLeft === 2) {
        const fp = gc.fen().split(" "); fp[1] = fp[1] === "w" ? "b" : "w"; gc.load(fp.join(" "));
        setBudhaSquare(to); // lock second move to this square
      }
      // ── SHUKRA_ASURA — black pawn promotes at rank 4 ──
      if (piece.color === "b" && piece.type === "p" && parseInt(to[1]) === 4) {
        const movedPiece = gc.get(to);
        if (movedPiece && poweredPieces[from]?.power === "SHUKRA_ASURA") {
          setShukraAsuraPromo({ square: to, gc });
          setGame(gc);
          tickAsuraCounters();
          setMoveCount(p => p + 1);
          setCardPlayedThisTurn(false);
          return gc;
        }
      }

      if (cp) {
        const cpHadKetu = poweredPieces[to]?.power === "KETU";
        const ketuStartSq = poweredPieces[to]?.startSquare; // read BEFORE cleanup
        const np2 = {}; Object.keys(poweredPieces).forEach(sq => { if (poweredPieces[sq]?.power && sq !== to) np2[sq] = poweredPieces[sq]; }); setPoweredPieces(np2);
        if (cpHadKetu) {
          const startSq = ketuStartSq;
          if (startSq && !gc.get(startSq) && startSq !== to) {
            gc.put({ type: cp.type, color: cp.color }, startSq);
            // remove from capture lists — piece didn't actually die
          } else {
            // start square occupied — piece dies normally, record capture
            addTime(game.turn(), getPieceValue(cp.type));
            setCaptureHistory(p => [...p, { piece: cp.type, square: to, color: cp.color }]);
            if (cp.color === "b") setWhiteCaptured(p => [...p, cp.type]);
            else setBlackCaptured(p => [...p, cp.type]);
            checkTierUnlocks(cp.type);
          }
        }

        if (gameMode === "asura" && cp.color === "b") {
          const pid = getPieceId(to, cp); const lr = asuraLives[pid] || 0;
          if (lr > 0) { setAsuraLives({ ...asuraLives, [pid]: lr - 1 }); respawnAsuraPiece(pid, cp.type); }
        }
        setCaptureHistory(p => [...p, { piece: cp.type, square: to, color: cp.color }]);
        if (cp.color === 'b') {
          setWhiteCaptured([...whiteCaptured, cp.type]);
        } else {
          setBlackCaptured([...blackCaptured, cp.type]);
        } checkTierUnlocks(cp.type);
      }

      const np3 = { ...poweredPieces };
      if (cp && np3[to]) delete np3[to];
      if (power) {
        delete np3[from]; let nu = power.usesLeft - 1;
        if (power.power === "BUDHA" && cp) nu = 0;
        if (nu === 0 && power.power === "BUDHA") setBudhaSquare(null);
        if (nu > 0) np3[to] = { ...power, usesLeft: nu };
      }
      // ── MAHISHA — shapeshift after moving ──
      if (power?.power === "MAHISHA" && power.usesLeft > 0) {
        setMahishasuraMode({ square: to, pieceType: piece.type, color: piece.color, gc });
        // Don't commit game yet — wait for player to pick a shape
        return gc;
      }
      const cleanPP = {}; Object.keys(np3).forEach(sq => { if (np3[sq]?.power) cleanPP[sq] = np3[sq]; }); setPoweredPieces(cleanPP);
      setGame(gc); tickAsuraCounters(); setMoveCount(p => p + 1); setCardPlayedThisTurn(false);
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
        const currentGame = new Chess(game.fen());
        const moves = currentGame.moves({ verbose: true });
        if (!moves.length) { setWaitingForBot(false); return; }

        const safeMoves = moves.filter(m =>
          !(poweredPiecesRef.current[m.to]?.power === "SURYA" &&
            poweredPiecesRef.current[m.to].usesLeft > 0)
        );
        const movesToUse = safeMoves.length > 0 ? safeMoves : moves;
        const randomMove = movesToUse[Math.floor(Math.random() * movesToUse.length)];
        const ng = new Chess(game.fen());
        const rcp = ng.get(randomMove.to);
        const rcpHadKetu = poweredPiecesRef.current[randomMove.to]?.power === "KETU";
        const result = ng.move({ from: randomMove.from, to: randomMove.to, promotion: "q" });

        if (result) {
          if (rcp) {
            setCaptureHistory(p => [...p, { piece: rcp.type, square: randomMove.to, color: rcp.color }]);
            if (rcp.color === "w") setBlackCaptured(p => [...p, rcp.type]);
            else setWhiteCaptured(p => [...p, rcp.type]);
            checkTierUnlocks(rcp.type);
            if (rcpHadKetu) { addTime("w", 12); subtractTime("b", 12); }
          }
          setTimeout(() => {
            setGame(ng);
            setMoveCount(p => p + 1);
            if (ng.isCheckmate()) { setGameOver(true); setWinner("black"); }
            setWaitingForBot(false);
          }, 800);
        } else {
          setWaitingForBot(false);
        }
      }, 1200);
      return;
    }
    const depthMap = { initiate: 2, shishya: 5, acharya: 8, guru: 12 };
    const depth = gameMode === "shukracharya" ? (depthMap[shukraDifficulty] || 8) : 3;
    sf.postMessage(`position fen ${game.fen()}`); sf.postMessage(`go depth ${depth}`);
    const poll = setInterval(() => {
      if (stockfishMoveRef.current) {
        clearInterval(poll); const ms = stockfishMoveRef.current; stockfishMoveRef.current = null;
        const ng = new Chess(game.fen());
        const isSP = poweredPiecesRef.current[ms.slice(2, 4)]?.power === "SURYA" && poweredPiecesRef.current[ms.slice(2, 4)].usesLeft > 0;
        let fm = { from: ms.slice(0, 2), to: ms.slice(2, 4), promotion: ms[4] || "q" };
        if (isSP) { const cg2 = new Chess(game.fen()); const mv2 = cg2.moves({ verbose: true }); const sf2 = mv2.filter(m => !(poweredPiecesRef.current[m.to]?.power === "SURYA" && poweredPiecesRef.current[m.to].usesLeft > 0)); const fb = sf2.length > 0 ? sf2 : mv2; const alt = fb[Math.floor(Math.random() * fb.length)]; fm = { from: alt.from, to: alt.to, promotion: alt.promotion || "q" }; }
        // ✅ Check KETU before the move removes the piece from the board
        const scp = ng.get(fm.to);
        const scpHadKetu = poweredPiecesRef.current[fm.to]?.power === "KETU";
        const res = ng.move(fm);
        if (res) {
          if (scp) {
            if (scpHadKetu) {
              const ketuStart = poweredPiecesRef.current[fm.to]?.startSquare;
              if (ketuStart && !ng.get(ketuStart) && ketuStart !== fm.to) {
                ng.put({ type: scp.type, color: scp.color }, ketuStart);
              } else {
                setCaptureHistory(p => [...p, { piece: scp.type, square: fm.to, color: scp.color }]);
                if (scp.color === "w") setBlackCaptured(p => [...p, scp.type]);
                else setWhiteCaptured(p => [...p, scp.type]);
                checkTierUnlocks(scp.type);
              }
            } else {
              setCaptureHistory(p => [...p, { piece: scp.type, square: fm.to, color: scp.color }]);
              if (scp.color === "w") setBlackCaptured(p => [...p, scp.type]);
              else setWhiteCaptured(p => [...p, scp.type]);
              checkTierUnlocks(scp.type);
            }
          }
          setTimeout(() => {
            setGame(ng); setMoveCount(p => p + 1); if (ng.isCheckmate()) { setGameOver(true); setWinner("black"); }
            setWaitingForBot(false);
          }, 800);
        } else {
          setWaitingForBot(false);
        }
      }
    }, 50);
    setTimeout(() => { clearInterval(poll); if (waitingForBot) setWaitingForBot(false); }, 8000);
  }

  function onSquareClick(square) {
    if (gameOver || !gameStarted) return;
    if ((gameMode === "asura" || gameMode === "shukracharya") && game.turn() === "b") return;

    // ── Card application: player has selected a card and taps a piece ───────────
    if (selectedCard) {
      applyCardToPiece(square);
      return;
    }

    // ── BUDHA: lock second move to the powered piece ────────────────────────────
    if (budhaSquare && square !== budhaSquare) return;

    // ── GURU resurrection target selection ─────────────────────────────────────
    if (guruMode) {
      console.log("guruMode squares:", guruMode.availableResurrections.map(r => r.square));
      console.log("clicked square:", square);
      const res = guruMode.availableResurrections.filter(r => r.square === square);
      console.log("matched:", res);
      if (res.length === 1) performResurrection(res[0], square);
      else if (res.length > 1) setGuruPickerMode({ square, options: res });
      return;
    }

    // ── SHANI freeze / MANGALA smite / KALI_ASURA target selection ─────────────
    // shaniMode is now reused for all "tap enemy to apply effect" flows.
    if (shaniMode) {
      const target = shaniMode.enemyPieces.find(p => p.square === square);
      if (!target) return;

      if (shaniMode.cardId === "MANGALA" || shaniMode.cardId === "KALI_ASURA") {
        // MANGALA: move the piece to the target square, capturing it
        const fromSq = shaniMode.fromSquare;
        const movingPiece = game.get(fromSq);
        if (!movingPiece) { setShaniMode(null); return; }
        const ng = new Chess(game.fen());
        ng.remove(fromSq);
        ng.remove(square);
        ng.put({ type: movingPiece.type, color: movingPiece.color }, square);
        // Flip turn
        const fp = ng.fen().split(" ");
        fp[1] = fp[1] === "w" ? "b" : "w";
        ng.load(fp.join(" "));
        // Record capture
        setCaptureHistory(prev => [...prev, { piece: target.piece.type, square, color: target.piece.color }]);
        if (game.turn() === "w") setBlackCaptured(prev => [...prev, target.piece.type]);
        else setWhiteCaptured(prev => [...prev, target.piece.type]);
        checkTierUnlocks(target.piece.type);
        // Move powered piece data if the moving piece had a power
        if (poweredPieces[fromSq]) {
          setPoweredPieces(prev => {
            const updated = { ...prev };
            updated[square] = updated[fromSq];
            delete updated[fromSq];
            return updated;
          });
        }
        setGame(ng);
        setMoveCount(prev => prev + 1);
        if (ng.isCheckmate()) { setGameOver(true); setWinner(ng.turn() === "w" ? "black" : "white"); }
        setShaniMode(null);
        return;
      }

      // Default: SHANI freeze
      setFrozenPieces(prev => ({ ...prev, [square]: { turnsLeft: 4 } }));
      const ng = new Chess(game.fen());
      const fp = ng.fen().split(" ");
      fp[1] = fp[1] === "w" ? "b" : "w";
      ng.load(fp.join(" "));
      setGame(ng);
      setMoveCount(prev => prev + 1);
      setCardPlayedThisTurn(false);
      setShaniMode(null);
      return;
    }

    // ── MAHISHA shapeshift target selection ────────────────────────────────────
    if (mahishasuraMode) {
      // mahishasuraMode is set in applyCardToPiece — the UI should show
      // a picker overlay (like guruPickerMode) for the player to choose
      // a piece type. This click handler just dismisses if they tap elsewhere.
      return;
    }

    // ── CHANDRA clone placement ─────────────────────────────────────────────────
    if (chandraPlacementMode) {
      const clickedRank = parseInt(square[1]);
      if (clickedRank === chandraPlacementMode.rank) {
        const piece = game.get(square);
        if (chandraPlacementMode.piece.type === "b") {
          const files = ["a", "b", "c", "d", "e", "f", "g", "h"];
          const of2 = files.indexOf(chandraPlacementMode.square[0]);
          const or2 = parseInt(chandraPlacementMode.square[1]);
          const oIsLight = (of2 + or2) % 2 === 0;
          const cf = files.indexOf(square[0]);
          if (oIsLight !== ((cf + clickedRank) % 2 === 0)) return;
        }
        if (!piece || square === chandraPlacementMode.square) {
          if (square === chandraPlacementMode.square) return;
          if (chandraPlacementMode.mirages.includes(square)) {
            setChandraPlacementMode({ ...chandraPlacementMode, mirages: chandraPlacementMode.mirages.filter(s => s !== square) });
          } else if (chandraPlacementMode.mirages.length < 2) {
            setChandraPlacementMode({ ...chandraPlacementMode, mirages: [...chandraPlacementMode.mirages, square] });
          }
        }
      }
      return;
    }

    // ── Normal piece movement ───────────────────────────────────────────────────
    if (!moveFrom) {
      const piece = game.get(square);
      if (piece && piece.color === game.turn()) {
        if (frozenPieces[square]) return;
        setMoveFrom(square);
      }
      return;
    }

    // Switch selection to another own piece
    const tappedPiece = game.get(square);
    if (tappedPiece && tappedPiece.color === game.turn()) {
      if (frozenPieces[square]) return;
      setMoveFrom(square);
      return;
    }

    const movingPiece = game.get(moveFrom);
    if (!movingPiece || movingPiece.color !== game.turn()) {
      setMoveFrom("");
      return;
    }

    handleMove(moveFrom, square); setMoveFrom("");
  }

  function onPieceDrop(sourceSquare, targetSquare) {
    if (gameOver || !gameStarted || selectedCard || chandraPlacementMode || guruMode || shaniMode || mahishasuraMode || shukraAsuraPromo) return false;
    if ((gameMode === "asura" || gameMode === "shukracharya") && game.turn() === "b") return false;
    if (chandraMode) {
      if (chandraMode.mirages.includes(sourceSquare)) return false;
      if (chandraMode.mirages.includes(targetSquare)) { const ng = new Chess(game.fen()); chandraMode.mirages.forEach(sq => ng.remove(sq)); setGame(ng); setChandraMode(null); return false; }
    }
    const result = handleMove(sourceSquare, targetSquare); setMoveFrom(""); return result !== null;
  }

  function confirmChandraPlacement() {
    if (!chandraPlacementMode || chandraPlacementMode.mirages.length === 0) return;
    const { square: originalSquare, piece, mirages, teleportTo } = chandraPlacementMode;
    const realSquare = teleportTo || originalSquare;

    // Build candidate board: move real piece to teleportTo (if chosen), place mirages
    const ng = new Chess(game.fen());
    if (teleportTo && teleportTo !== originalSquare) {
      ng.remove(originalSquare);
      ng.put({ type: piece.type, color: piece.color }, teleportTo);
    }
    mirages.forEach(sq => ng.put({ type: piece.type, color: piece.color }, sq));

    // Check our own king is not left in check after the rearrangement
    const selfTest = new Chess(ng.fen());
    if (selfTest.inCheck()) {
      alert("That move would leave your king in check!");
      return;
    }

    // Check the arrangement does not give check to the opponent
    const oppTest = new Chess(ng.fen());
    const fp = oppTest.fen().split(" ");
    fp[1] = fp[1] === "w" ? "b" : "w";
    oppTest.load(fp.join(" "));
    if (oppTest.inCheck()) {
      alert("CHANDRA cannot give check! Power auto-revealed.");
      setChandraPlacementMode(null);
      return;
    }

    const cost = 10 + (mirages.length === 2 ? 5 : 0);
    subtractTime(game.turn(), cost);

    setGame(ng);
    setChandraMode({ realSquare, piece, mirages, turnsLeft: 4, color: piece.color });
    setChandraPlacementMode(null);
  }

  function confirmMahishaShift(newType) {
    if (!mahishasuraMode) return;
    const { square, piece } = mahishasuraMode;
    const ng = new Chess(game.fen());
    ng.remove(square);
    ng.put({ type: newType, color: piece.color }, square);
    // Remove the power — one use
    const np = { ...poweredPieces };
    delete np[square];
    setPoweredPieces(np);
    setMahishasuraMode(null);
    setGame(ng);
  }

  function confirmShukraAsuraPromo(newType) {
    if (!shukraAsuraPromo) return;
    const { square, gc } = shukraAsuraPromo;
    gc.remove(square);
    gc.put({ type: newType, color: "b" }, square);
    // Consume the power
    const np = { ...poweredPieces };
    delete np[square];
    setPoweredPieces(np);
    setShukraAsuraPromo(null);
    setGame(gc);
  }

  function startGame(mode, difficulty = null) {
    const time = (mode === "asura" || mode === "shukracharya") ? 300 : 180;
    setStartingTime(time); setWhiteTime(time); setBlackTime(time);
    setGameMode(mode); setGameStarted(true); setShowShukraSelect(false);
    if (difficulty) setShukraDifficulty(difficulty);
  }

  function resetGame() {
    setGame(new Chess()); setWhiteTime(startingTime); setBlackTime(startingTime);
    setGameOver(false); setWinner(null); setGameStarted(false); setGameMode(null); setMoveFrom("");
    setMoveCount(0); setWhiteCaptured([]); setBlackCaptured([]); setCaptureHistory([]);
    setTier1Unlocked(false); setTier2Unlocked(false); setTier3Unlocked(false);
    setUsedCards([]); setSelectedCard(null); setChaosModeShown({ white: false, black: false });
    setPoweredPieces({}); setFrozenPieces({}); setChandraMode(null); setChandraPlacementMode(null); setGuruMode(null); setResurrectedPieces({});
    setShaniMode(null); setAsuraLives({}); setWaitingForBot(false);
    setShukraDifficulty(null); setShowShukraSelect(false); setGuruPickerMode(null); setCardCooldowns({});
    setShowCardOverlay(false); setGameOverDismissed(false);
    setMahishasuraMode(null);
    setVritraRanks([]);
    setTarakaProtected({});
    setLastWhiteCard(null);
    setLastBlackCard(null);
    setCardPlayedThisTurn(false);
    setGuruDuplicateMode(null);
    setDuplicatePieces({});
  }

  const { background, darkSquare, lightSquare, accent, text } = getTheme(gameMode);
  const theme = { background, darkSquare, lightSquare, accent, text };
  const customStyles = {};

  Object.keys(poweredPieces).forEach(sq => { const p = poweredPieces[sq]; if (!p?.power) return; const card = SHARED_DECK.find(c => c.id === p.power); if (card) customStyles[sq] = { ...(customStyles[sq] || {}), border: `4px solid ${card.color}`, boxShadow: `0 0 20px ${card.color}, inset 0 0 15px ${card.color}88` }; });
  Object.keys(frozenPieces).forEach(sq => { customStyles[sq] = { ...(customStyles[sq] || {}), border: "4px solid #1f2937", backgroundColor: "rgba(31,41,55,0.7)", boxShadow: "inset 0 0 20px rgba(31,41,55,0.9)" }; });
  Object.keys(resurrectedPieces).forEach(sq => { customStyles[sq] = { ...(customStyles[sq] || {}), border: "4px solid #a855f7", boxShadow: "0 0 25px #a855f7, inset 0 0 20px rgba(168,85,247,0.6)", animation: "resurrectPulse 2s infinite" }; });
  if (guruMode) guruMode.availableResurrections.forEach(r => { customStyles[r.square] = { ...(customStyles[r.square] || {}), backgroundColor: "rgba(168,85,247,0.4)", border: "3px dashed #a855f7", boxShadow: "0 0 20px rgba(168,85,247,0.6)", cursor: "pointer" }; });
  if (shaniMode) {
    const borderColor = shaniMode.cardId === "MANGALA" ? "#ef4444" : "#1f2937";
    const bgColor = shaniMode.cardId === "MANGALA"
      ? "rgba(239,68,68,0.3)"
      : "rgba(31,41,55,0.5)";
    shaniMode.enemyPieces.forEach(ep => {
      customStyles[ep.square] = {
        ...(customStyles[ep.square] || {}),
        backgroundColor: bgColor,
        border: `3px dashed ${borderColor}`,
        boxShadow: `0 0 20px ${borderColor}88`,
        cursor: "pointer",
      };
    });
  }

  vritraRanks.forEach(v => {
    const files = ["a", "b", "c", "d", "e", "f", "g", "h"];
    files.forEach(f => {
      const sq = `${f}${v.rank}`;
      customStyles[sq] = {
        ...(customStyles[sq] || {}),
        backgroundColor: "rgba(10, 42, 74, 0.55)",
        boxShadow: "inset 0 0 8px #0A2A4A",
      };
    });
  });

  if (chandraPlacementMode) {
    const files = ["a", "b", "c", "d", "e", "f", "g", "h"];
    files.forEach(f => { const sq = f + chandraPlacementMode.rank; if (!game.get(sq) && sq !== chandraPlacementMode.square) customStyles[sq] = { ...(customStyles[sq] || {}), backgroundColor: "rgba(229,231,235,0.3)", border: "2px dashed #e5e7eb" }; });
    chandraPlacementMode.mirages.forEach(ms => { customStyles[ms] = { ...(customStyles[ms] || {}), backgroundColor: "rgba(229,231,235,0.6)", border: "3px solid #e5e7eb", boxShadow: "0 0 15px #e5e7eb" }; });
    customStyles[chandraPlacementMode.square] = { ...(customStyles[chandraPlacementMode.square] || {}), border: "3px solid #ffd700", boxShadow: "0 0 20px #ffd700" };
    if (chandraPlacementMode.teleportTo) customStyles[chandraPlacementMode.teleportTo] = { ...(customStyles[chandraPlacementMode.teleportTo] || {}), backgroundColor: "rgba(255,215,0,0.4)", border: "3px solid #ffd700", boxShadow: "0 0 20px #ffd700" };
  }
  if (chandraMode) chandraMode.mirages.forEach(ms => { customStyles[ms] = { ...(customStyles[ms] || {}), boxShadow: "0 0 10px rgba(229,231,235,0.6)" }; });
  if (moveFrom && !selectedCard) customStyles[moveFrom] = { ...(customStyles[moveFrom] || {}), backgroundColor: "rgba(255,255,0,0.5)" };

  const trulyDeadCount = gameMode === "asura" ? Object.values(asuraLives).filter(l => l === 0).length : 0;

  // ── Board size ────────────────────────────────────────────────────────────
  const boardSize = isMobile ? Math.min(window.innerWidth - 16, 480) : 600;

  const specialModeLabel = chandraPlacementMode ? "🌙 Tap empty squares on this rank to place clones"
    : guruMode ? "🪐 Tap a death square to resurrect"
      : shaniMode ? "🪐 Tap an enemy piece to freeze"
        : selectedCard ? `✨ ${selectedCard.name} selected — tap the board to place`
          : null;

  if (showAbout) return <AboutPage onBack={() => setShowAbout(false)} />;
  if (showNavagraha) return <NavagrahaPage onBack={() => setShowNavagraha(false)} />;
  if (gameMode === "daily") return <DailyPuzzle onBack={() => setGameMode(null)} />;

  // Route to daily puzzle
  if (gameMode === "daily") return <DailyPuzzle onBack={() => setGameMode(null)} />;

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
            {/* Row 1: Shukracharya, Daily Puzzle, Asura */}
            <div style={{ display: "flex", gap: isMobile ? "12px" : "20px", justifyContent: "center", flexWrap: "wrap", marginBottom: "16px", alignItems: "flex-start" }}>

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
                    {[{ key: "initiate", label: "🌿 Sadhak", sub: "Initiate · ~800 ELO" }, { key: "shishya", label: "🌱 Shishya", sub: "Student · ~1200 ELO" }, { key: "acharya", label: "📚 Acharya", sub: "Teacher · ~1500 ELO" }, { key: "guru", label: "🔱 Guru", sub: "Master · ~2000 ELO" }].map(({ key, label, sub }) => (<div key={key} style={{ marginBottom: "8px" }}>
                      <button onClick={() => startGame("shukracharya", key)} style={{ padding: "10px 16px", fontSize: "14px", backgroundColor: "#e8d5a3", color: "#1a0a00", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold", width: "100%", marginBottom: "2px" }}>{label}</button>
                      <p style={{ fontSize: "13px", color: "#ddd", margin: 0 }}>{sub}</p>
                    </div>
                    ))}
                    <button onClick={() => setShowShukraSelect(false)} style={{ marginTop: "6px", fontSize: "11px", background: "none", border: "none", color: "#aaa", cursor: "pointer", textDecoration: "underline" }}>← back</button>
                  </div>
                )}
              </div>

              {/* Daily Puzzle */}
              <div style={{ textAlign: "center", maxWidth: "200px" }}>
                <button onClick={() => setGameMode("daily")} style={{ padding: "16px 24px", fontSize: "16px", background: "linear-gradient(135deg, #ffd700, #f59e0b)", color: "#1a0a00", border: "none", borderRadius: "10px", cursor: "pointer", fontWeight: "bold", width: "100%", marginBottom: "8px", boxShadow: "0 0 20px rgba(255,215,0,0.35)" }}>🌟 Daily Puzzle</button>
                <p style={{ fontSize: "11px", color: "#ddd", lineHeight: "1.4", margin: 0 }}>New puzzle every day. Find mate with today's 3 cosmic cards. Share your score.</p>
                <p style={{ fontSize: "10px", color: "#ffd700", margin: "4px 0 0 0" }}>#{getDailyPuzzleNumber()} today</p>
              </div>

              {/* Asura */}
              <div style={{ textAlign: "center", maxWidth: "200px" }}>
                <button onClick={() => startGame("asura")} style={{ padding: "16px 24px", fontSize: "16px", backgroundColor: "#ff4444", color: "#fff", border: "none", borderRadius: "10px", cursor: "pointer", fontWeight: "bold", width: "100%", marginBottom: "8px" }}>👹 Fight the Asura Horde</button>
                <p style={{ fontSize: "11px", color: "#ddd", lineHeight: "1.4", margin: 0 }}>They are endless. They are relentless. Are you ready?</p>
              </div>

            </div>

            {/* Row 2: vs Friend, About */}
            <div style={{ display: "flex", gap: isMobile ? "12px" : "20px", justifyContent: "center", flexWrap: "wrap", marginBottom: "40px", alignItems: "flex-start" }}>

              {/* PvP */}
              <div style={{ textAlign: "center", maxWidth: "200px" }}>
                <button onClick={() => startGame("pvp")} style={{ padding: "16px 24px", fontSize: "16px", backgroundColor: "#4ecca3", color: "#000", border: "none", borderRadius: "10px", cursor: "pointer", fontWeight: "bold", width: "100%", marginBottom: "8px" }}>🌟 Tablet Mode VS Friend</button>
                <p style={{ fontSize: "11px", color: "#ddd", lineHeight: "1.4", margin: 0 }}>180-second bullet chess with celestial powers</p>
              </div>

              {/* Navagraha Explained */}
              <div style={{ textAlign: "center", maxWidth: "200px" }}>
                <button onClick={() => setShowNavagraha(true)} style={{ padding: "16px 24px", fontSize: "16px", background: "linear-gradient(135deg, #9333ea, #6b21a8)", color: "#fff", border: "none", borderRadius: "10px", cursor: "pointer", fontWeight: "bold", width: "100%", marginBottom: "8px", boxShadow: "0 0 20px rgba(147,51,234,0.3)" }}>🌟 Navagraha Explained</button>
                <p style={{ fontSize: "11px", color: "#ddd", lineHeight: "1.4", margin: 0 }}>The nine celestial forces — their mythology and powers explained.</p>
              </div>

              {/* About */}
              <div style={{ textAlign: "center", maxWidth: "200px" }}>
                <button onClick={() => setShowAbout(true)} style={{ padding: "16px 24px", fontSize: "16px", backgroundColor: "#1e293b", color: "#e2e8f0", border: "1px solid #334155", borderRadius: "10px", cursor: "pointer", fontWeight: "bold", width: "100%", marginBottom: "8px" }}>📖 About</button>
                <p style={{ fontSize: "11px", color: "#ddd", lineHeight: "1.4", margin: 0 }}>The story behind the game — and the cosmic forces within it.</p>
              </div>

            </div>
            <HowToPlay />
            <p style={{ textAlign: "center", fontSize: "11px", color: "#444", marginTop: "40px", fontFamily: "Cinzel, serif", letterSpacing: "0.08em" }}>
              © {new Date().getFullYear()} Chessuranga. All rights reserved.
            </p>
          </div>
        )}

        {/* ── GAME SCREEN ── */}
        {gameStarted && !isMobile && gameMode !== "pvp" && (
          /* ════════════════════════════════════
             DESKTOP LAYOUT (unchanged)
          ════════════════════════════════════ */
          <div style={{ display: "flex", gap: "30px", alignItems: "flex-start", justifyContent: "center", width: "100%", maxWidth: "1400px", margin: "0 auto" }}>

            {/* LEFT: cards */}
            <div style={{ width: "280px", display: "flex", flexDirection: "column", gap: "15px" }}>
              <div style={{
                padding: selectedCard ? "14px" : "10px",
                backgroundColor: selectedCard ? `${selectedCard.color}18` : "#16213e",
                border: selectedCard ? `2px solid ${selectedCard.color}66` : "2px solid transparent",
                borderRadius: "12px",
                fontSize: "14px",
                minHeight: "110px",
                transition: "all 0.25s ease",
              }}>
                {selectedCard ? (
                  <>
                    <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                      <div style={{ width: "64px", height: "64px", borderRadius: "10px", overflow: "hidden", border: `2px solid ${selectedCard.color}`, flexShrink: 0 }}>
                        <img src={selectedCard.image} alt={selectedCard.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: "17px", fontWeight: "800", color: "#f1f5f9" }}>{selectedCard.name}</div>
                        <div style={{ display: "inline-block", marginTop: "4px", backgroundColor: `${selectedCard.color}22`, border: `1px solid ${selectedCard.color}66`, borderRadius: "20px", padding: "2px 10px", fontSize: "11px", fontWeight: "700", color: selectedCard.color, textTransform: "uppercase", letterSpacing: "0.08em" }}>Tier {selectedCard.tier}</div>
                        <div style={{ fontSize: "22px", fontWeight: "900", color: "#ffd700", marginTop: "4px" }}>{getCardCost(selectedCard)}s</div>
                      </div>
                    </div>
                    <div style={{ fontSize: "13px", color: "#cbd5e1", marginTop: "10px", lineHeight: "1.5" }}>{selectedCard.description}</div>
                    <div style={{ display: "flex", gap: "8px", marginTop: "10px" }}>
                      <div style={{ flex: 1, textAlign: "center", backgroundColor: "rgba(78,204,163,0.1)", border: "1px solid rgba(78,204,163,0.3)", borderRadius: "8px", padding: "7px 4px", fontSize: "12px", fontWeight: "700", color: "#4ecca3" }}>👆 Click a piece to apply</div>
                      <button onClick={() => setSelectedCard(null)} style={{ flex: 1, backgroundColor: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "8px", color: "#94a3b8", fontSize: "12px", fontWeight: "600", cursor: "pointer", padding: "7px 4px" }}>✕ Deselect</button>
                    </div>
                  </>
                ) : (
                  <div style={{ color: "#555", fontSize: "13px", marginTop: "10px", textAlign: "center" }}>Select a card to see its power</div>
                )}
              </div>

              {guruMode && (
                <div style={{ padding: "10px", backgroundColor: "#16213e", borderRadius: "8px" }}>
                  <div style={{ color: "#ec4899" }}>💫 {guruMode.cardId === "BALI" ? "BALI" : "SHUKRA"}</div>
                  <div style={{ color: "#aaa" }}>Click a square to resurrect a fallen piece:</div>
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

              {mahishasuraMode && (
                <div style={{ padding: "12px", backgroundColor: "#1a0a2e", border: "2px solid #ff6600", borderRadius: "10px", marginBottom: "10px" }}>
                  <div style={{ fontWeight: "bold", color: "#ff6600", marginBottom: "8px", fontSize: "13px" }}>🦬 MAHISHA — Choose a form</div>
                  <div style={{ fontSize: "11px", color: "#aaa", marginBottom: "8px" }}>
                    Shapeshift into a captured piece type:
                  </div>
                  <div style={{ display: "flex", gap: "6px", justifyContent: "center", flexWrap: "wrap" }}>
                    {mahishasuraMode.availableTypes.map(type => (
                      <button
                        key={type}
                        onClick={() => confirmMahishaShift(type)}
                        style={{ padding: "8px 14px", fontSize: "16px", backgroundColor: "#ff6600", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" }}
                      >
                        {({ p: "♟", n: "♞", b: "♝", r: "♜", q: "♛" })[type]}
                      </button>
                    ))}
                  </div>
                  <button onClick={() => setMahishasuraMode(null)} style={{ marginTop: "8px", width: "100%", padding: "6px", fontSize: "11px", backgroundColor: "#e94560", color: "#fff", border: "none", borderRadius: "5px", cursor: "pointer" }}>Cancel</button>
                </div>
              )}

              {shukraAsuraPromo && (
                <div style={{ padding: "12px", backgroundColor: "#1a1a0e", border: "2px solid #ffd700", borderRadius: "10px", marginBottom: "10px" }}>
                  <div style={{ fontWeight: "bold", color: "#ffd700", marginBottom: "8px", fontSize: "13px" }}>💀 SHUKRA — Promote your pawn</div>
                  <div style={{ display: "flex", gap: "6px", justifyContent: "center" }}>
                    {[
                      { type: "q", label: "♛" },
                      { type: "r", label: "♜" },
                      { type: "b", label: "♝" },
                      { type: "n", label: "♞" },
                    ].map(({ type, label }) => (
                      <button
                        key={type}
                        onClick={() => confirmShukraAsuraPromo(type)}
                        style={{ padding: "8px 14px", fontSize: "16px", backgroundColor: "#b8860b", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" }}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                  <button onClick={() => setShukraAsuraPromo(null)} style={{ marginTop: "8px", width: "100%", padding: "6px", fontSize: "11px", backgroundColor: "#e94560", color: "#fff", border: "none", borderRadius: "5px", cursor: "pointer" }}>Cancel</button>
                </div>
              )}

              {chandraPlacementMode && (
                <div style={{ padding: "10px", backgroundColor: "#16213e", borderRadius: "8px" }}>
                  <div style={{ fontSize: "14px", fontWeight: "bold", marginBottom: "10px", color: "#e5e7eb" }}>🌙 CHANDRA</div>
                  <div style={{ fontSize: "12px", color: "#aaa", marginBottom: "10px" }}>Click empty squares on rank {chandraPlacementMode.rank} to place {chandraPlacementMode.mirages.length}/2 clones</div>
                  <div style={{ fontSize: "11px", color: "#888", marginBottom: "10px" }}>Real piece: {chandraPlacementMode.square}</div>
                  {chandraPlacementMode.mirages.length === 2 && <div style={{ fontSize: "11px", color: "#ffd700", marginBottom: "10px" }}>+5s penalty for 2nd clone</div>}

                  <div style={{ fontSize: "11px", color: "#aaa", marginBottom: "5px", marginTop: "10px" }}>
                    Teleport real piece to: <span style={{ color: "#ffd700" }}>{chandraPlacementMode.teleportTo ? chandraPlacementMode.teleportTo : "(stay)"}</span>
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "3px", marginBottom: "10px" }}>
                    {['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'].map(file => {
                      const sq = file + chandraPlacementMode.rank;
                      const isCurrentReal = sq === chandraPlacementMode.square;
                      const isSelected = sq === chandraPlacementMode.teleportTo;
                      const isMirage = chandraPlacementMode.mirages.includes(sq);
                      const hasOtherPiece = game.get(sq) && !isCurrentReal;
                      // Bishop colour constraint
                      if (chandraPlacementMode.piece.type === 'b') {
                        const files2 = ["a", "b", "c", "d", "e", "f", "g", "h"];
                        const of2 = files2.indexOf(chandraPlacementMode.square[0]);
                        const or2 = chandraPlacementMode.rank;
                        const oLight = (of2 + or2) % 2 === 0;
                        const cf2 = files2.indexOf(file);
                        if (oLight !== ((cf2 + chandraPlacementMode.rank) % 2 === 0)) return null;
                      }
                      const disabled = isCurrentReal || isMirage || hasOtherPiece;
                      return (
                        <button key={file} onClick={() => {
                          if (!disabled) {
                            setChandraPlacementMode(prev => ({
                              ...prev,
                              teleportTo: prev.teleportTo === sq ? null : sq
                            }));
                          }
                        }} style={{
                          padding: "4px 6px", fontSize: "11px",
                          backgroundColor: isSelected ? "#ffd700" : (disabled ? "#333" : "#555"),
                          color: isSelected ? "#000" : "#fff",
                          border: isCurrentReal ? "1px solid #ffd700" : "none",
                          borderRadius: "3px",
                          cursor: disabled ? "not-allowed" : "pointer",
                          opacity: disabled ? 0.4 : 1
                        }}>
                          {file}{chandraPlacementMode.rank}
                        </button>
                      );
                    })}
                  </div>

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
              {game.isStalemate() && !gameOverDismissed && (
                <div style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)", backgroundColor: "#16213e", padding: "32px 24px", borderRadius: "15px", zIndex: 500, textAlign: "center", border: `3px solid ${theme.accent}`, width: "88vw", maxWidth: "380px" }}>
                  <h2 style={{ marginBottom: "8px", fontSize: "24px" }}>🤝 Stalemate!</h2>
                  <p style={{ color: "#aaa", fontSize: "14px", marginBottom: "20px" }}>No legal moves. Draw game!</p>
                  <button onClick={resetGame} style={{ padding: "14px 28px", fontSize: "16px", backgroundColor: theme.accent, border: "none", borderRadius: "8px", cursor: "pointer", color: "#000", fontWeight: "bold", marginBottom: "10px" }}>Main Menu</button>
                  <br />
                  <button onClick={() => setGameOverDismissed(true)} style={{ padding: "8px 20px", fontSize: "13px", backgroundColor: "transparent", border: `1px solid ${theme.accent}`, borderRadius: "8px", cursor: "pointer", color: theme.accent }}>Review Board</button>
                </div>
              )}
              {gameOver && !game.isStalemate() && !gameOverDismissed && (
                <div onClick={() => setGameOverDismissed(true)} style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)", backgroundColor: "#16213e", padding: "32px 24px", borderRadius: "15px", zIndex: 500, textAlign: "center", border: `3px solid ${theme.accent}`, width: "88vw", maxWidth: "380px" }}>
                  <h2 style={{ marginBottom: "16px", fontSize: "24px" }}>{gameMode === "asura" ? (winner === "white" ? "🌟 The Navagraha Prevail! 🌟" : "👹 The Asura Reign! 👹") : `${winner === "white" ? (gameMode === "shukracharya" ? "🏆 You Win!" : "White Wins!") : "Black Wins!"}`}</h2>
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

              {guruDuplicateMode && !guruDuplicateMode.side && (
                <div style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)", backgroundColor: "#0f172a", border: "2px solid #a855f7", borderRadius: "16px", padding: "20px 24px", zIndex: 1000, textAlign: "center", boxShadow: "0 0 40px rgba(168,85,247,0.5)", width: "88vw", maxWidth: "340px" }}>
                  <div style={{ fontSize: "16px", fontWeight: "bold", color: "#a855f7", marginBottom: "8px" }}>🪐 Guru — Duplicate</div>
                  <div style={{ fontSize: "13px", color: "#aaa", marginBottom: "20px" }}>Spawn duplicate to the left or right?</div>
                  <div style={{ display: "flex", gap: "16px", justifyContent: "center" }}>
                    <button
                      onClick={() => setGuruDuplicateMode(prev => ({ ...prev, side: "left" }))}
                      style={{ padding: "14px 28px", fontSize: "15px", backgroundColor: "#1e1040", border: "2px solid #a855f7", borderRadius: "10px", cursor: "pointer", color: "#fff", fontWeight: "bold" }}>
                      ← Left
                    </button>
                    <button
                      onClick={() => setGuruDuplicateMode(prev => ({ ...prev, side: "right" }))}
                      style={{ padding: "14px 28px", fontSize: "15px", backgroundColor: "#1e1040", border: "2px solid #a855f7", borderRadius: "10px", cursor: "pointer", color: "#fff", fontWeight: "bold" }}>
                      Right →
                    </button>
                  </div>
                  <button onClick={() => setGuruDuplicateMode(null)} style={{ marginTop: "16px", fontSize: "12px", background: "none", border: "none", color: "#aaa", cursor: "pointer", textDecoration: "underline" }}>cancel</button>
                </div>
              )}

              <div style={{ width: "600px", height: "600px", flexShrink: 0 }}>
                <Chessboard position={game.fen()} onPieceDrop={onPieceDrop} onSquareClick={onSquareClick} animationDuration={300} customSquareStyles={customStyles} customDarkSquareStyle={{ backgroundColor: theme.darkSquare }} customLightSquareStyle={{ backgroundColor: theme.lightSquare }} boardWidth={600} />
              </div>
              <div style={{ fontSize: "32px", fontWeight: "bold", marginTop: "10px", color: whiteTime < 30 ? "#ff6b6b" : theme.text }}>🌟 You: {formatTime(whiteTime)}</div>
              {!gameOver && <p style={{ marginTop: "15px", fontSize: "16px" }}>Turn: {game.turn() === "w" ? (gameMode === "asura" ? "You" : "White") : (gameMode === "asura" ? "Asura" : "Black")}{chandraPlacementMode && <span style={{ color: "#e5e7eb", marginLeft: "10px" }}>🌙 CLONES</span>}{guruMode && <span style={{ color: "#a855f7", marginLeft: "10px" }}>🪐 RESURRECT</span>}{shaniMode && <span style={{ color: "#94a3b8", marginLeft: "10px" }}>🪐 FREEZE</span>}{waitingForBot && <span style={{ color: "#ff6b6b", marginLeft: "10px" }}>👹 Thinking...</span>}</p>}
              {!gameOver && <button onClick={resetGame} style={{ marginTop: "15px", padding: "10px 20px", fontSize: "14px", backgroundColor: "#e94560", color: "#fff", border: "none", borderRadius: "5px", cursor: "pointer", fontWeight: "bold" }}>Main Menu</button>}
            </div>

            {/* RIGHT: captures */}
            <div style={{ width: "180px", display: "flex", flexDirection: "column", gap: "15px" }}>
              {gameMode === "asura" && (
                <div style={{ padding: "15px", backgroundColor: "#16213e", borderRadius: "8px", border: "2px solid #ff4444" }}>
                  <div style={{ fontWeight: "bold", marginBottom: "10px", fontSize: "14px", color: "#ff4444", textAlign: "center" }}>👹 Asura Status</div>
                  <div style={{ textAlign: "center", fontSize: "24px", fontWeight: "bold", color: "#ff6b6b" }}>{trulyDeadCount}/16</div>
                  <div style={{ textAlign: "center", fontSize: "11px", color: "#aaa", marginTop: "5px" }}>Truly Slain</div>
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
        {gameStarted && gameMode === "pvp" && (
          <PvpTabletLayout
            game={game}
            gameOver={gameOver}
            gameOverDismissed={gameOverDismissed}
            setGameOverDismissed={setGameOverDismissed}
            winner={winner}
            theme={theme}
            whiteTime={whiteTime}
            blackTime={blackTime}
            customStyles={customStyles}
            onPieceDrop={onPieceDrop}
            onSquareClick={onSquareClick}
            tier1Unlocked={tier1Unlocked}
            tier2Unlocked={tier2Unlocked}
            tier3Unlocked={tier3Unlocked}
            selectedCard={selectedCard}
            setSelectedCard={setSelectedCard}
            usedCards={usedCards}
            getCardCost={getCardCost}
            whiteCaptured={whiteCaptured}
            blackCaptured={blackCaptured}
            specialModeLabel={specialModeLabel}
            setChandraPlacementMode={setChandraPlacementMode}
            setGuruMode={setGuruMode}
            setShaniMode={setShaniMode}
            chandraPlacementMode={chandraPlacementMode}
            guruMode={guruMode}
            shaniMode={shaniMode}
            resetGame={resetGame}
            showChaosPopup={showChaosPopup}
            setShowChaosPopup={setShowChaosPopup}
            lastWhiteCard={lastWhiteCard}
            lastBlackCard={lastBlackCard}
          />
        )}

        {/* ════════════════════════════════════
            MOBILE LAYOUT
        ════════════════════════════════════ */}
        {gameStarted && isMobile && gameMode !== "pvp" && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%", maxWidth: "500px", margin: "0 auto", position: "relative" }}>

            {/* Game over overlay */}
            {gameOver && !gameOverDismissed && (
              <div onClick={() => setGameOverDismissed(true)} style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)", backgroundColor: "#16213e", padding: "32px 24px", borderRadius: "15px", zIndex: 500, textAlign: "center", border: `3px solid ${theme.accent}`, width: "88vw", maxWidth: "380px" }}>
                <h2 style={{ marginBottom: "16px", fontSize: "24px" }}>{gameMode === "asura" ? (winner === "white" ? "🌟 The Navagraha Prevail! 🌟" : "👹 The Asura Reign! 👹") : `${winner === "white" ? (gameMode === "shukracharya" ? "🏆 You Win!" : "White Wins!") : "Black Wins!"}`}</h2>
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
                {(chandraPlacementMode || guruMode || shaniMode || selectedCard) && (
                  <button onClick={() => { setSelectedCard(null); setChandraPlacementMode(null); setGuruMode(null); setShaniMode(null); }} style={{ marginLeft: "10px", fontSize: "11px", background: "none", border: "1px solid #ffd700", borderRadius: "4px", color: "#ffd700", cursor: "pointer", padding: "2px 6px" }}>✕ cancel</button>
                )}
              </div>
            )}

            {/* Chandra placement UI on mobile */}
            {chandraPlacementMode && (
              <div style={{ width: "100%", backgroundColor: "#16213e", borderRadius: "10px", padding: "10px", marginBottom: "6px" }}>
                <div style={{ fontSize: "12px", color: "#aaa", marginBottom: "6px" }}>
                  🌙 Clones placed: <strong style={{ color: "#e5e7eb" }}>{chandraPlacementMode.mirages.length}/2</strong>
                  {chandraPlacementMode.mirages.length === 2 && <span style={{ color: "#ffd700", marginLeft: "6px" }}>+5s</span>}
                </div>
                <div style={{ fontSize: "11px", color: "#aaa", marginBottom: "4px" }}>
                  Teleport to: <span style={{ color: "#ffd700" }}>{chandraPlacementMode.teleportTo || "(stay)"}</span>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", marginBottom: "8px" }}>
                  {['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'].map(file => {
                    const sq = file + chandraPlacementMode.rank;
                    const isCurrentReal = sq === chandraPlacementMode.square;
                    const isSelected = sq === chandraPlacementMode.teleportTo;
                    const isMirage = chandraPlacementMode.mirages.includes(sq);
                    const hasOtherPiece = game.get(sq) && !isCurrentReal;
                    if (chandraPlacementMode.piece.type === 'b') {
                      const files2 = ["a", "b", "c", "d", "e", "f", "g", "h"];
                      const of2 = files2.indexOf(chandraPlacementMode.square[0]);
                      const oLight = (of2 + chandraPlacementMode.rank) % 2 === 0;
                      const cf2 = files2.indexOf(file);
                      if (oLight !== ((cf2 + chandraPlacementMode.rank) % 2 === 0)) return null;
                    }
                    const disabled = isCurrentReal || isMirage || hasOtherPiece;
                    return (
                      <button key={file} onClick={() => {
                        if (!disabled) setChandraPlacementMode(prev => ({ ...prev, teleportTo: prev.teleportTo === sq ? null : sq }));
                      }} style={{
                        padding: "5px 8px", fontSize: "12px",
                        backgroundColor: isSelected ? "#ffd700" : (disabled ? "#2a2a3a" : "#3a3a5a"),
                        color: isSelected ? "#000" : "#fff",
                        border: isCurrentReal ? "1px solid #ffd700" : "none",
                        borderRadius: "5px",
                        cursor: disabled ? "not-allowed" : "pointer",
                        opacity: disabled ? 0.4 : 1
                      }}>
                        {file}{chandraPlacementMode.rank}
                      </button>
                    );
                  })}
                </div>
                <button onClick={confirmChandraPlacement} disabled={chandraPlacementMode.mirages.length === 0} style={{ width: "100%", padding: "10px", fontSize: "13px", backgroundColor: chandraPlacementMode.mirages.length > 0 ? "#4ecca3" : "#555", color: chandraPlacementMode.mirages.length > 0 ? "#000" : "#888", border: "none", borderRadius: "8px", cursor: chandraPlacementMode.mirages.length > 0 ? "pointer" : "not-allowed", fontWeight: "bold" }}>
                  ✓ Confirm{chandraPlacementMode.teleportTo ? ` (teleport → ${chandraPlacementMode.teleportTo})` : " (stay)"}
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
                <div style={{ fontSize: "22px", fontWeight: "bold", color: blackTime < 30 ? "#ff6b6b" : theme.text, minWidth: "52px", textAlign: "right" }}>{formatTime(blackTime)}</div>
              </div>
            </div>

            {/* BOARD */}
            <div style={{ width: boardSize, height: boardSize, flexShrink: 0 }}>
              <Chessboard
                position={game.fen()}
                onPieceDrop={onPieceDrop}
                onSquareClick={onSquareClick}
                animationDuration={225}
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

            {/* Guru duplicate picker */}
            {guruDuplicateMode && !guruDuplicateMode.side && (
              <div style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)", backgroundColor: "#0f172a", border: "2px solid #a855f7", borderRadius: "16px", padding: "20px 24px", zIndex: 700, textAlign: "center", boxShadow: "0 0 40px rgba(168,85,247,0.5)", width: "88vw", maxWidth: "340px" }}>
                <div style={{ fontSize: "16px", fontWeight: "bold", color: "#a855f7", marginBottom: "8px" }}>🪐 Guru — Duplicate</div>
                <div style={{ fontSize: "13px", color: "#aaa", marginBottom: "20px" }}>Spawn duplicate to the left or right?</div>
                <div style={{ display: "flex", gap: "16px", justifyContent: "center" }}>
                  <button onClick={() => setGuruDuplicateMode(prev => ({ ...prev, side: "left" }))}
                    style={{ padding: "14px 28px", fontSize: "15px", backgroundColor: "#1e1040", border: "2px solid #a855f7", borderRadius: "10px", cursor: "pointer", color: "#fff", fontWeight: "bold" }}>
                    ← Left
                  </button>
                  <button onClick={() => setGuruDuplicateMode(prev => ({ ...prev, side: "right" }))}
                    style={{ padding: "14px 28px", fontSize: "15px", backgroundColor: "#1e1040", border: "2px solid #a855f7", borderRadius: "10px", cursor: "pointer", color: "#fff", fontWeight: "bold" }}>
                    Right →
                  </button>
                </div>
                <button onClick={() => setGuruDuplicateMode(null)} style={{ marginTop: "16px", fontSize: "12px", background: "none", border: "none", color: "#aaa", cursor: "pointer", textDecoration: "underline" }}>cancel</button>
              </div>
            )}

            {/* ── NEW: Mahishasura picker ── */}
            {mahishasuraMode?.awaitingChoice && (
              <div style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)", backgroundColor: "#0f172a", border: "2px solid #065f46", borderRadius: "16px", padding: "20px 24px", zIndex: 700, textAlign: "center", width: "88vw", maxWidth: "340px" }}>
                <div style={{ fontSize: "16px", fontWeight: "bold", color: "#34d399", marginBottom: "12px" }}>🐃 Mahishasura</div>
                <div style={{ fontSize: "13px", color: "#aaa", marginBottom: "16px" }}>Choose a captured piece to shapeshift into:</div>
                <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
                  {mahishasuraMode.capturedTypes.map(type => {
                    const symbols = { q: "♛", r: "♜", b: "♝", n: "♞", p: "♟" };
                    const names = { q: "Queen", r: "Rook", b: "Bishop", n: "Knight", p: "Pawn" };
                    return (
                      <button key={type} onClick={() => {
                        // Transform the piece on the board
                        const newGame = new Chess(game.fen());
                        const sq = mahishasuraMode.targetSquare;
                        const original = newGame.get(sq);
                        if (original) {
                          newGame.remove(sq);
                          newGame.put({ type, color: original.color }, sq);
                          setGame(newGame);
                        }
                        setMahishasuraMode(null);
                      }} style={{ padding: "12px 16px", fontSize: "24px", backgroundColor: "#065f46", border: "1px solid #34d399", borderRadius: "10px", cursor: "pointer", color: "#fff" }}>
                        {symbols[type]}<div style={{ fontSize: "10px", marginTop: "4px" }}>{names[type]}</div>
                      </button>
                    );
                  })}
                </div>
                <button onClick={() => setMahishasuraMode(null)} style={{ marginTop: "16px", fontSize: "12px", background: "none", border: "1px solid #555", borderRadius: "6px", color: "#888", cursor: "pointer", padding: "6px 16px" }}>Cancel</button>
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
      <Analytics />
    </>
  );
}

export default App;