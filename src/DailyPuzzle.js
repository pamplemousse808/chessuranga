// ─── DailyPuzzle.js ──────────────────────────────────────────────────────────
import { useState, useEffect } from "react";
import { Chessboard } from "react-chessboard";
import { Chess } from "chess.js";
import { SHARED_DECK, CARD_EMOJI } from "./gameConstants";
import { getDailyPuzzleNumber, seededRandom } from "./gameUtils";

export default function DailyPuzzle({ onBack }) {
    const puzzleNum = getDailyPuzzleNumber();
    const [dailyData, setDailyData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [game, setGame] = useState(() => new Chess());
    const [moveFrom, setMoveFrom] = useState("");
    const [moveCount, setMoveCount] = useState(0);
    const [cardsUsed, setCardsUsed] = useState([]);
    const [, setAvailableCards] = useState([]);
    const [selectedCard, setSelectedCard] = useState(null);
    const [poweredPieces, setPoweredPieces] = useState({});
    const [frozenPieces, setFrozenPieces] = useState({});
    const [puzzleOver, setPuzzleOver] = useState(null);
    const [, setCaptureHistory] = useState([]);
    const [moveHistory, setMoveHistory] = useState([]);
    const [attempts, setAttempts] = useState(1);
    const [shaniMode, setShaniMode] = useState(null);
    const [budhaSquare, setBudhaSquare] = useState(null);
    const [guruPieces, setGuruPieces] = useState({}); // sq -> turnsLeft

    const par = dailyData?.par || 3;

    const [alreadyPlayed, setAlreadyPlayed] = useState(() => {
        try {
            const s = localStorage.getItem("chessuranga_daily");
            if (s) {
                const p = JSON.parse(s);
                if (p.dayNum === Math.floor(Date.now() / (1000 * 60 * 60 * 24))) return p;
            }
        } catch (e) { }
        return null;
    });

    // ── Tick frozen pieces down after each player move ───────────────────────
    useEffect(() => {
        if (moveCount === 0) return;
        setFrozenPieces(prev => {
            const next = { ...prev };
            Object.keys(next).forEach(sq => {
                next[sq] = { ...next[sq], turnsLeft: next[sq].turnsLeft - 1 };
                if (next[sq].turnsLeft <= 0) delete next[sq];
            });
            return next;
        });
        setGuruPieces(prev => {
            const next = { ...prev };
            Object.keys(next).forEach(sq => {
                next[sq] = next[sq] - 1;
                if (next[sq] <= 0) delete next[sq];
            });
            return next;
        });
    }, [moveCount]);

    useEffect(() => {
        fetch('/api/daily-puzzle')
            .then(r => r.json())
            .then(data => {
                const g = new Chess(data.fen);
                const firstMove = data.moves[0];
                const move = { from: firstMove.slice(0, 2), to: firstMove.slice(2, 4) };
                if (firstMove[4]) move.promotion = firstMove[4];
                g.move(move);

                const dayNum = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
                const rng = seededRandom(dayNum * 31337);
                const PUZZLE_CARDS = ["RAHU", "SURYA", "GURU", "BUDHA", "MANGALA", "SHANI"];
                const deckSubset = SHARED_DECK.filter(c => PUZZLE_CARDS.includes(c.id));
                const dailyCards = [...deckSubset].sort(() => rng() - 0.5).slice(0, 3);

                setDailyData({
                    fen: g.fen(),
                    playerColor: g.turn(),
                    title: data.title,
                    par: Math.ceil((data.moves.length - 1) / 2),
                    flavor: `Rated ${data.rating}`,
                    dailyCards,
                    dayNum,
                    cardHints: {}
                });
                setGame(g);
                setLoading(false);
            })
            .catch(err => console.error('Puzzle fetch failed:', err));
    }, []);

    function handleDailyMove(from, to, promotion = "q") {
        if (puzzleOver || game.turn() !== dailyData?.playerColor) return null;
        const pc = dailyData?.playerColor || "w";
        const piece = game.get(from); if (!piece || piece.color !== pc) return null;
        if (frozenPieces[from]) return null;

        // BUDHA second-move lock
        if (budhaSquare && from !== budhaSquare) return null;

        const cp = game.get(to);
        const power = poweredPieces[from];
        let gc = new Chess(game.fen()); let moved = false;

        if (power?.power === "RAHU" && power.usesLeft > 0) {
            const files = ["a", "b", "c", "d", "e", "f", "g", "h"];
            const [ff, fr, tf, tr] = [files.indexOf(from[0]), parseInt(from[1]), files.indexOf(to[0]), parseInt(to[1])];
            let ok = false;
            if (piece.type === "n") { const fd = Math.abs(tf - ff), rd = Math.abs(tr - fr); ok = (fd === 2 && rd === 1) || (fd === 1 && rd === 2); }
            else if (piece.type === "b") ok = Math.abs(tf - ff) === Math.abs(tr - fr);
            else if (piece.type === "r") ok = ff === tf || fr === tr;
            else if (piece.type === "q") ok = Math.abs(tf - ff) === Math.abs(tr - fr) || ff === tf || fr === tr;
            else if (piece.type === "k") ok = Math.abs(tf - ff) <= 1 && Math.abs(tr - fr) <= 1;
            if (ok && !(cp && cp.color === piece.color)) {
                gc.remove(from); if (cp) gc.remove(to); gc.put({ type: piece.type, color: piece.color }, to);
                const fp = gc.fen().split(" "); fp[1] = pc === "w" ? "b" : "w"; gc.load(fp.join(" ")); moved = true;
            }
        }
        if (!moved && power?.power === "MANGALA" && power.usesLeft > 0) {
            const files = ["a", "b", "c", "d", "e", "f", "g", "h"];
            const [ff, fr, tf, tr] = [files.indexOf(from[0]), parseInt(from[1]), files.indexOf(to[0]), parseInt(to[1])];
            if (Math.abs(tf - ff) <= 1 && Math.abs(tr - fr) <= 1 && cp && cp.color !== piece.color) {
                gc.remove(from); gc.remove(to); gc.put({ type: piece.type, color: piece.color }, to);
                const fp = gc.fen().split(" "); fp[1] = pc === "w" ? "b" : "w"; gc.load(fp.join(" ")); moved = true;
            }
        }
        if (!moved) { const m = gc.move({ from, to, promotion }); if (!m) return null; }

        const isBudhaFirstMove = power?.power === "BUDHA" && power.usesLeft === 2 && !cp;
        if (isBudhaFirstMove) {
            const fp = gc.fen().split(" ");
            fp[1] = pc;
            gc.load(fp.join(" "));
            setBudhaSquare(to); // lock second move to this piece
        } else {
            setBudhaSquare(null);
        }

        const np = { ...poweredPieces };
        if (cp && np[to]) delete np[to];
        if (power) {
            delete np[from];
            const nu = power.usesLeft - 1;
            if (nu > 0) np[to] = { ...power, usesLeft: nu };
        }
        // Move any guru duplicate that was on `from` to `to`
        const ng = { ...guruPieces };
        if (ng[from]) { ng[to] = ng[from]; delete ng[from]; }
        setGuruPieces(ng);

        setPoweredPieces(np);
        if (cp) setCaptureHistory(prev => [...prev, { piece: cp.type, square: to, color: cp.color }]);

        const newMoveCount = moveCount + 1;
        setGame(gc);
        setMoveCount(newMoveCount);
        setMoveHistory(prev => [...prev, { from, to, cardUsed: power?.power || null, isBot: false }]);

        if (gc.isCheckmate()) {
            const total = newMoveCount;
            const score = total <= par ? "⭐⭐⭐" : total <= par + 2 ? "⭐⭐" : "⭐";
            const result = { result: "won", moves: newMoveCount, cardsUsed: cardsUsed.length, totalMoves: total, par, score };
            setPuzzleOver(result);
            try { localStorage.setItem("chessuranga_daily", JSON.stringify({ dayNum: dailyData.dayNum, ...result, moveHistory: [...moveHistory, { isBot: false }], attempts, cardsUsed: [...cardsUsed] })); } catch (e) { }
            return gc;
        }

        if (!isBudhaFirstMove) {
            setTimeout(() => {
                setGame(prev => {
                    if (prev.isGameOver()) return prev;
                    const allMoves = bg.moves({ verbose: true });
                    // Bot respects SURYA — filter out captures of protected pieces
                    const safeMoves = allMoves.filter(m => {
                        const target = np[m.to];
                        return !(target?.power === "SURYA" && target.usesLeft > 0);
                    });
                    const moveset = safeMoves.length ? safeMoves : allMoves;
                    if (!moveset.length) return prev;

                    // Heuristic: checkmate > captures by value > checks > random
                    const CAPTURE_VALUE = { q: 9, r: 5, b: 3, n: 3, p: 1, k: 0 };
                    const checkmates = moveset.filter(m => { const t = new Chess(bg.fen()); t.move(m); return t.isCheckmate(); });
                    if (checkmates.length) { bg.move(checkmates[0]); }
                    else {
                        const captures = moveset.filter(m => m.captured).sort((a, b) => (CAPTURE_VALUE[b.captured] || 0) - (CAPTURE_VALUE[a.captured] || 0));
                        const checks = moveset.filter(m => { const t = new Chess(bg.fen()); t.move(m); return t.inCheck(); });
                        const preferred = captures.length ? captures : checks.length ? checks : moveset;
                        bg.move(preferred[Math.floor(Math.random() * preferred.length)]);
                    }
                    setMoveHistory(mh => [...mh, { isBot: true }]);
                    if (bg.isCheckmate()) {
                        setPuzzleOver({ result: "failed", moves: newMoveCount });
                        try { localStorage.setItem("chessuranga_daily", JSON.stringify({ dayNum: dailyData.dayNum, result: "failed" })); } catch (e) { }
                    }
                    return bg;
                });
            }, 400);
        }

        return gc;
    }

    function onSquareClick(square) {
        if (puzzleOver || game.turn() !== dailyData?.playerColor) return;

        // ── SHANI two-step: waiting for enemy target ─────────────────────────
        if (shaniMode) {
            const piece = game.get(square);
            if (piece && piece.color !== dailyData.playerColor) {
                setFrozenPieces(prev => ({ ...prev, [square]: { turnsLeft: 2 } }));
            }
            setShaniMode(null);
            return;
        }

        // ── Card application: tap your own piece to assign power ─────────────
        if (selectedCard) {
            const piece = game.get(square);
            if (!piece || piece.color !== dailyData.playerColor) return;

            if (selectedCard.id === "SHANI") {
                // SHANI: record who applied it, then prompt for enemy target
                setShaniMode({ fromSquare: square });
                setCardsUsed(prev => [...prev, selectedCard.id]);
                setAvailableCards(prev => prev.filter(c => c.id !== selectedCard.id));
                setMoveHistory(prev => [...prev, { isBot: false, cardUsed: selectedCard.id }]);
                setMoveCount(prev => prev + 1);
                setSelectedCard(null);
                return;
            }

            if (selectedCard.id === "GURU") {
                // GURU: place a duplicate on an adjacent empty square
                const files = ["a", "b", "c", "d", "e", "f", "g", "h"];
                const fi = files.indexOf(square[0]);
                const rank = parseInt(square[1]);
                const candidates = [];
                for (let df = -1; df <= 1; df++) {
                    for (let dr = -1; dr <= 1; dr++) {
                        if (df === 0 && dr === 0) continue;
                        const nf = fi + df, nr = rank + dr;
                        if (nf >= 0 && nf < 8 && nr >= 1 && nr <= 8) {
                            const sq = files[nf] + nr;
                            if (!game.get(sq)) candidates.push(sq);
                        }
                    }
                }
                if (!candidates.length) { setSelectedCard(null); return; } // no room
                // Pick the candidate closest to the centre (or just first)
                const dupSq = candidates[0];
                const gc = new Chess(game.fen());
                gc.put({ type: piece.type, color: piece.color }, dupSq);
                setGame(gc);
                setGuruPieces(prev => ({ ...prev, [dupSq]: 2 }));
                setCardsUsed(prev => [...prev, selectedCard.id]);
                setAvailableCards(prev => prev.filter(c => c.id !== selectedCard.id));
                setMoveHistory(prev => [...prev, { isBot: false, cardUsed: selectedCard.id }]);
                setMoveCount(prev => prev + 1);
                setSelectedCard(null);
                return;
            }

            // All other cards: assign power to piece
            const usesLeft = selectedCard.id === "BUDHA" ? 2 : 2;
            setPoweredPieces(prev => ({ ...prev, [square]: { power: selectedCard.id, usesLeft } }));
            setCardsUsed(prev => [...prev, selectedCard.id]);
            setAvailableCards(prev => prev.filter(c => c.id !== selectedCard.id));
            setMoveHistory(prev => [...prev, { isBot: false, cardUsed: selectedCard.id }]);
            setMoveCount(prev => prev + 1);
            setSelectedCard(null);
            return;
        }

        // ── BUDHA second-move: lock to budhaSquare ───────────────────────────
        if (budhaSquare && square !== budhaSquare) return;

        // ── Normal piece selection / move ────────────────────────────────────
        if (!moveFrom) {
            const p = game.get(square);
            if (p && p.color === dailyData?.playerColor && !frozenPieces[square]) setMoveFrom(square);
            return;
        }
        const tapped = game.get(square);
        if (tapped && tapped.color === dailyData?.playerColor) { setMoveFrom(square); return; }
        handleDailyMove(moveFrom, square);
        setMoveFrom("");
    }

    function onPieceDrop(src, tgt) {
        if (puzzleOver || selectedCard || game.turn() !== dailyData?.playerColor) return false;
        const r = handleDailyMove(src, tgt); setMoveFrom(""); return r !== null;
    }

    function resetPuzzle() {
        const g = new Chess();
        g.load(dailyData.fen);
        setGame(g);
        setMoveFrom("");
        setMoveCount(0);
        setCardsUsed([]);
        setAvailableCards(dailyData.dailyCards);
        setSelectedCard(null);
        setPoweredPieces({});
        setFrozenPieces({});
        setGuruPieces({});
        setBudhaSquare(null);
        setShaniMode(null);
        setMoveHistory([]);
        setCaptureHistory([]);
        setAttempts(a => a + 1);
    }

    function buildShareText() {
        if (!puzzleOver || puzzleOver.result !== "won") return "";
        const cardEmojis = cardsUsed.map(id => CARD_EMOJI[id] || "🌟").join("");
        const moveEmojis = moveHistory.filter(m => !m.isBot).map((m, i) => m.cardUsed ? "🟣" : i < par ? "🟩" : "🟨").join("");
        return `Chessuranga #${puzzleNum} ${puzzleOver.score}\n${dailyData.title}\nMate in ${puzzleOver.totalMoves} (par ${par})\nCards: ${cardEmojis || "none"}\n${moveEmojis}${attempts > 1 ? `\n${attempts} attempts` : ""}\nchessuranga.com`;
    }

    const customStyles = {};
    Object.keys(poweredPieces).forEach(sq => {
        const p = poweredPieces[sq]; if (!p?.power) return;
        const card = SHARED_DECK.find(c => c.id === p.power);
        if (card) customStyles[sq] = { ...(customStyles[sq] || {}), border: `4px solid ${card.color}`, boxShadow: `0 0 20px ${card.color}` };
    });
    // Highlight guru duplicates
    Object.keys(guruPieces).forEach(sq => {
        customStyles[sq] = { ...(customStyles[sq] || {}), border: "4px solid #a855f7", boxShadow: "0 0 20px #a855f7", opacity: 0.75 };
    });
    // Highlight frozen pieces
    Object.keys(frozenPieces).forEach(sq => {
        customStyles[sq] = { ...(customStyles[sq] || {}), border: "4px solid #60a5fa", boxShadow: "0 0 16px #60a5fa" };
    });
    if (moveFrom) customStyles[moveFrom] = { ...(customStyles[moveFrom] || {}), backgroundColor: "rgba(255,255,0,0.5)" };

    // Status banner text
    const statusBanner = shaniMode
        ? "❄️ Tap an enemy piece to freeze"
        : selectedCard?.id === "GURU"
            ? "🪐 Tap one of your pieces to duplicate"
            : selectedCard
                ? `✨ ${selectedCard.name} selected — tap one of your pieces`
                : budhaSquare
                    ? "⚡ Budha: make your second move"
                    : null;

    const isMobile = window.innerWidth < 768;
    const boardSize = isMobile ? Math.min(window.innerWidth - 32, 420) : 600;
    const shareText = buildShareText();

    if (loading || !dailyData) return (
        <div style={{ minHeight: "100vh", backgroundColor: "#0a0510", display: "flex", alignItems: "center", justifyContent: "center", color: "#ffd700", fontSize: "20px" }}>
            ✨ Summoning today's puzzle...
        </div>
    );

    if (alreadyPlayed) {
        return (
            <div style={{ minHeight: "100vh", backgroundColor: "#0a0510", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px", color: "#e8d5a3" }}>
                <div style={{ maxWidth: "420px", textAlign: "center" }}>
                    <div style={{ fontSize: "56px", marginBottom: "12px" }}>🌟</div>
                    <h1 style={{ fontSize: "26px", color: "#ffd700", marginBottom: "6px" }}>Already completed today!</h1>
                    <p style={{ color: "#6b5080", marginBottom: "24px" }}>#{puzzleNum} · {dailyData.title}</p>
                    <div style={{ backgroundColor: "rgba(255,215,0,0.08)", border: "2px solid #ffd700", borderRadius: "16px", padding: "24px", marginBottom: "24px" }}>
                        <div style={{ fontSize: "36px", marginBottom: "8px" }}>{alreadyPlayed.score || "⭐"}</div>
                        {alreadyPlayed.result === "won" ? <>
                            <div style={{ fontSize: "17px", marginBottom: "4px" }}>Mate in {alreadyPlayed.totalMoves} moves</div>
                            <div style={{ fontSize: "13px", color: "#6b5080" }}>Par: {par} · Cards used: {alreadyPlayed.cardsUsed}</div>
                        </> : <div style={{ fontSize: "15px" }}>Better luck tomorrow.</div>}
                    </div>
                    <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
                        <button onClick={onBack} style={{ padding: "12px 24px", backgroundColor: "transparent", border: "2px solid #4a3060", borderRadius: "10px", color: "#a88a5a", cursor: "pointer", fontSize: "14px" }}>← Menu</button>
                        <button onClick={() => setAlreadyPlayed(null)} style={{ padding: "12px 24px", backgroundColor: "transparent", border: "2px solid #4a3060", borderRadius: "10px", color: "#a88a5a", cursor: "pointer", fontSize: "14px" }}>Try Again 🔄</button>
                        <button onClick={() => {
                            const ap = alreadyPlayed;
                            const cardEmojis = (ap.cardsUsed || []).map(id => CARD_EMOJI[id] || "🌟").join("");
                            const moveEmojis = (ap.moveHistory || []).filter(m => !m.isBot).map((m, i) => m.cardUsed ? "🟣" : i < par ? "🟩" : "🟨").join("");
                            const attemptsLine = ap.attempts > 1 ? `\n${ap.attempts} attempts` : "";
                            const text = ap.result === "won"
                                ? `Chessuranga #${puzzleNum} ${ap.score}\n${dailyData.title}\nMate in ${ap.totalMoves} (par ${par})\nCards: ${cardEmojis || "none"}\n${moveEmojis}${attemptsLine}\nchessuranga.com`
                                : `Chessuranga #${puzzleNum} — come play! chessuranga.com`;
                            try { navigator.clipboard.writeText(text); alert("Copied to clipboard!"); } catch (e) { alert(text); }
                        }} style={{ padding: "12px 24px", backgroundColor: "#ffd700", border: "none", borderRadius: "10px", color: "#000", cursor: "pointer", fontSize: "14px", fontWeight: "bold" }}>Share 📤</button>
                    </div>
                    <p style={{ marginTop: "16px", fontSize: "11px", color: "#4a3060" }}>New puzzle daily at midnight UTC</p>
                </div>
            </div>
        );
    }

    return (
        <div style={{ minHeight: "100vh", backgroundColor: "#0a0510", display: "flex", flexDirection: "column", alignItems: "center", padding: "16px", color: "#e8d5a3" }}>
            <style>{`@keyframes pulse{0%,100%{box-shadow:0 0 10px #ffd700;}50%{box-shadow:0 0 25px #ffd700;}} @keyframes starPop{0%{transform:scale(0);opacity:0;}60%{transform:scale(1.2);}100%{transform:scale(1);opacity:1;}}`}</style>

            {/* Header */}
            <div style={{ width: "100%", maxWidth: "860px", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                <button onClick={onBack} style={{ background: "none", border: "1px solid #4a3060", borderRadius: "8px", color: "#a88a5a", cursor: "pointer", padding: "8px 14px", fontSize: "13px" }}>← Menu</button>
                <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: "11px", color: "#6b5080", letterSpacing: "3px", textTransform: "uppercase" }}>Daily Puzzle #{puzzleNum}</div>
                    <div style={{ fontSize: isMobile ? "16px" : "20px", fontWeight: "bold", color: "#ffd700" }}>{dailyData.title}</div>
                    <div style={{ fontSize: "11px", color: "#6b5080", fontStyle: "italic" }}>{dailyData.flavor}</div>
                </div>
                <div style={{ textAlign: "right", fontSize: "13px", color: "#a88a5a" }}>
                    <div>Par <strong style={{ color: "#ffd700" }}>{par}</strong></div>
                    <div>Moves <strong style={{ color: "#fff" }}>{moveCount}</strong></div>
                </div>
            </div>

            <div style={{ display: "flex", gap: "20px", alignItems: "flex-start", justifyContent: "center", width: "100%", maxWidth: "860px", flexWrap: isMobile ? "wrap" : "nowrap" }}>

                {/* Cards */}
                <div style={{ width: isMobile ? "100%" : "170px", display: "flex", flexDirection: isMobile ? "row" : "column", gap: "10px", flexWrap: "wrap" }}>
                    <div style={{ width: "100%", fontSize: "11px", color: "#6b5080", textTransform: "uppercase", letterSpacing: "2px", textAlign: "center" }}>Today's Cards · +1 each</div>
                    {dailyData.dailyCards.map(card => {
                        const isUsed = cardsUsed.includes(card.id);
                        const isSelected = selectedCard?.id === card.id;
                        return (
                            <div key={card.id} onClick={() => { if (!isUsed && !puzzleOver) setSelectedCard(isSelected ? null : card); }}
                                style={{ flex: isMobile ? "1 1 120px" : "unset", backgroundColor: isSelected ? card.color + "44" : "rgba(255,255,255,0.04)", border: `2px solid ${isSelected ? "#fff" : card.color}`, borderRadius: "10px", padding: "10px", cursor: isUsed ? "default" : "pointer", opacity: isUsed ? 0.4 : 1, transition: "all 0.2s" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "3px" }}>
                                    <span style={{ fontSize: "16px" }}>{CARD_EMOJI[card.id]}</span>
                                    <span style={{ fontWeight: "bold", fontSize: "12px", color: "#e8d5a3" }}>{card.name}</span>
                                    {isUsed && <span style={{ fontSize: "9px", color: "#555" }}>used</span>}
                                </div>
                                <div style={{ fontSize: "10px", color: "#a88a5a", lineHeight: "1.3" }}>{card.description}</div>
                                {dailyData.cardHints?.[card.id] && !isUsed && <div style={{ fontSize: "9px", color: "#6b5080", fontStyle: "italic", marginTop: "4px" }}>💡 {dailyData.cardHints[card.id]}</div>}
                            </div>
                        );
                    })}
                    {statusBanner && (
                        <div style={{ width: "100%", fontSize: "11px", color: "#ffd700", textAlign: "center", padding: "6px", border: "1px solid #ffd700", borderRadius: "6px" }}>
                            {statusBanner}
                        </div>
                    )}
                </div>

                {/* Board */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                    {/* Move tracker */}
                    <div style={{ display: "flex", gap: "5px", marginBottom: "10px", flexWrap: "wrap", justifyContent: "center" }}>
                        {Array.from({ length: Math.max(par + 3, moveCount + 1) }).map((_, i) => {
                            const pm = moveHistory.filter(m => !m.isBot)[i];
                            if (!pm) return <div key={i} style={{ width: "26px", height: "26px", border: i < par ? "2px solid #4a3060" : "2px dashed #2a1a30", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", color: "#4a3060" }}>{i < par ? i + 1 : ""}</div>;
                            const bg = pm.cardUsed ? "#9333ea" : i < par ? "#22c55e" : "#f59e0b";
                            return <div key={i} style={{ width: "26px", height: "26px", backgroundColor: bg, borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px" }}>{pm.cardUsed ? CARD_EMOJI[pm.cardUsed] : "♟"}</div>;
                        })}
                    </div>

                    <Chessboard
                        position={game.fen()}
                        onPieceDrop={onPieceDrop}
                        onSquareClick={onSquareClick}
                        customSquareStyles={customStyles}
                        customDarkSquareStyle={{ backgroundColor: "#4a3060" }}
                        customLightSquareStyle={{ backgroundColor: "#d4c5e8" }}
                        boardWidth={boardSize}
                        boardOrientation={dailyData?.playerColor === 'b' ? 'black' : 'white'}
                        arePiecesDraggable={!puzzleOver && game.turn() === dailyData?.playerColor}
                    />

                    <div style={{ marginTop: "10px", fontSize: "13px", color: "#d4ccda", textAlign: "center" }}>
                        {!puzzleOver && (game.turn() === dailyData?.playerColor ? "Your move — find checkmate!" : "⏳ Thinking...")}
                        {game.inCheck() && !puzzleOver && <span style={{ color: "#ff6b6b", marginLeft: "8px" }}>⚠️ Check!</span>}
                    </div>
                    {!puzzleOver && moveCount > 0 && (
                        <button onClick={resetPuzzle} style={{ marginTop: "8px", padding: "6px 14px", backgroundColor: "transparent", border: "1px solid #2a1a30", borderRadius: "8px", color: "#e5dfeb", cursor: "pointer", fontSize: "11px" }}>
                            ↩ Restart puzzle
                        </button>
                    )}
                </div>

                {/* Info panel (desktop only) */}
                {!isMobile && (
                    <div style={{ width: "170px", display: "flex", flexDirection: "column", gap: "10px" }}>
                        <div style={{ padding: "14px", backgroundColor: "rgba(255,215,0,0.05)", border: "1px solid #4a3060", borderRadius: "10px", fontSize: "12px", color: "#a88a5a", lineHeight: "1.7" }}>
                            <div style={{ fontWeight: "bold", color: "#ffd700", marginBottom: "6px" }}>🎯 Scoring</div>
                            <div>♟ Each move = 1pt</div>
                            <div>🌟 Cards are free!</div>
                            <div style={{ marginTop: "8px", borderTop: "1px solid #2a1a30", paddingTop: "8px", fontSize: "11px", color: "#6b5080" }}>
                                ⭐⭐⭐ = par or under<br />⭐⭐ = par+1 or +2<br />⭐ = par+3 or more
                            </div>
                        </div>
                        <div style={{ padding: "10px", backgroundColor: "rgba(255,215,0,0.03)", border: "1px solid #2a1a30", borderRadius: "10px", fontSize: "10px", color: "#4a3060", textAlign: "center" }}>
                            New puzzle daily at midnight UTC
                        </div>
                    </div>
                )}
            </div>

            {/* Result overlay */}
            {puzzleOver && (
                <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.85)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2000 }}>
                    <div style={{ backgroundColor: "#0f0a1a", border: `3px solid ${puzzleOver.result === "won" ? "#ffd700" : "#ff4444"}`, borderRadius: "20px", padding: "40px 32px", textAlign: "center", maxWidth: "400px", width: "90vw", animation: "starPop 0.4s ease-out", boxShadow: `0 0 60px ${puzzleOver.result === "won" ? "rgba(255,215,0,0.25)" : "rgba(255,68,68,0.25)"}` }}>
                        {puzzleOver.result === "won" ? <>
                            <div style={{ fontSize: "56px", marginBottom: "8px" }}>{puzzleOver.score}</div>
                            <h2 style={{ color: "#ffd700", fontSize: "24px", marginBottom: "8px" }}>Puzzle Solved!</h2>
                            <p style={{ color: "#a88a5a", fontSize: "14px", marginBottom: "16px" }}>
                                {puzzleOver.moves} move{puzzleOver.moves !== 1 ? "s" : ""}
                                {attempts > 1 && <span style={{ color: "#a88a5a" }}> · {attempts} attempts</span>}
                                {puzzleOver.cardsUsed > 0 ? ` + ${puzzleOver.cardsUsed} card${puzzleOver.cardsUsed > 1 ? "s" : ""}` : ""}
                                {" = "}<strong style={{ color: "#ffd700" }}>{puzzleOver.totalMoves}</strong> total &nbsp;(par {par})
                            </p>
                            <div style={{ backgroundColor: "rgba(255,215,0,0.07)", borderRadius: "10px", padding: "14px", marginBottom: "20px", fontFamily: "monospace", fontSize: "12px", color: "#e8d5a3", whiteSpace: "pre-wrap", textAlign: "left", lineHeight: "1.8" }}>
                                {shareText}
                            </div>
                            <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
                                <button onClick={onBack} style={{ padding: "11px 20px", backgroundColor: "transparent", border: "2px solid #4a3060", borderRadius: "10px", color: "#a88a5a", cursor: "pointer", fontSize: "13px" }}>← Menu</button>
                                <button onClick={() => { try { navigator.clipboard.writeText(shareText); alert("Copied to clipboard!"); } catch (e) { alert(shareText); } }} style={{ padding: "11px 22px", backgroundColor: "#ffd700", border: "none", borderRadius: "10px", color: "#000", cursor: "pointer", fontSize: "14px", fontWeight: "bold" }}>Copy & Share 📤</button>
                                <button onClick={() => { resetPuzzle(); setPuzzleOver(null); }} style={{ padding: "11px 20px", backgroundColor: "transparent", border: "2px solid #4a3060", borderRadius: "10px", color: "#a88a5a", cursor: "pointer", fontSize: "13px" }}>Try Again 🔄</button>
                            </div>
                        </> : <>
                            <div style={{ fontSize: "56px", marginBottom: "8px" }}>💫</div>
                            <h2 style={{ color: "#ff6b6b", fontSize: "22px", marginBottom: "8px" }}>
                                {puzzleOver.result === "failed" ? "The Asuras prevail..." : "Stalemate!"}
                            </h2>
                            <p style={{ color: "#a88a5a", fontSize: "13px", marginBottom: "20px" }}>
                                Attempt {attempts}. The cosmos believes in you.
                            </p>
                            <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
                                <button onClick={onBack} style={{ padding: "12px 20px", backgroundColor: "transparent", border: "2px solid #4a3060", borderRadius: "10px", color: "#a88a5a", cursor: "pointer", fontSize: "13px" }}>← Menu</button>
                                <button onClick={() => { resetPuzzle(); setPuzzleOver(null); }} style={{ padding: "12px 22px", backgroundColor: "#e94560", border: "none", borderRadius: "10px", color: "#fff", cursor: "pointer", fontSize: "14px", fontWeight: "bold" }}>
                                    Try Again 🔄
                                </button>
                            </div>
                        </>}
                    </div>
                </div>
            )}
        </div>
    );
}