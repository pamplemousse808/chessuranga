// ─── PvpTabletLayout.js ───────────────────────────────────────────────────────
import { Chessboard } from "react-chessboard";
import { SHARED_DECK } from "./gameConstants";
import { formatTime, getPieceSymbol } from "./gameUtils";

// ── PvpCardTray ───────────────────────────────────────────────────────────────
function PvpCardTray({ currentTurn, myColor, tier1Unlocked, tier2Unlocked, tier3Unlocked, selectedCard, onSelectCard, usedCards, getCardCost }) {
  const isMyTurn = currentTurn === myColor;
  const accent = myColor === "w" ? "#4ecca3" : "#e94560";
  return (
    <div style={{ width: "100%", padding: "8px 12px", backgroundColor: isMyTurn ? `${accent}18` : "rgba(0,0,0,0.3)", borderTop: myColor === "w" ? `2px solid ${isMyTurn ? accent : "rgba(255,255,255,0.08)"}` : "none", borderBottom: myColor === "b" ? `2px solid ${isMyTurn ? accent : "rgba(255,255,255,0.08)"}` : "none", transition: "background-color 0.4s ease" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <div style={{ fontSize: "11px", fontWeight: "700", letterSpacing: "0.1em", textTransform: "uppercase", color: isMyTurn ? accent : "rgba(255,255,255,0.3)", minWidth: "60px", whiteSpace: "pre-line" }}>
          {isMyTurn ? "▶ YOUR\nTURN" : myColor === "w" ? "⬜ White" : "⬛ Black"}
        </div>
        <div style={{ display: "flex", gap: "5px", flex: 1, justifyContent: "center" }}>
          {SHARED_DECK.map(card => {
            const tierNum = card.tier;
            const isUnlocked = (tierNum === 1 && tier1Unlocked) || (tierNum === 2 && tier2Unlocked) || (tierNum === 3 && tier3Unlocked);
            const isUsed = usedCards.includes(card.id);
            const isSelected = selectedCard?.id === card.id;
            const canUse = isUnlocked && !isUsed && isMyTurn;
            const cost = getCardCost(card);
            return (
              <div key={card.id} onClick={() => { if (canUse) onSelectCard(isSelected ? null : card); }} title={isUnlocked ? `${card.name} — ${card.description} (${cost}s)` : `Tier ${tierNum} locked`} style={{ position: "relative", width: "60px", height: "60px", borderRadius: "8px", overflow: "hidden", border: isSelected ? "2px solid #fff" : isUnlocked && !isUsed ? `2px solid ${card.color}66` : "2px solid rgba(255,255,255,0.06)", opacity: isUsed ? 0.3 : isUnlocked ? 1 : 0.25, cursor: canUse ? "pointer" : "default", boxShadow: isSelected ? `0 0 12px ${card.color}` : "none", flexShrink: 0 }}>
                {isUnlocked ? (
                  <>
                    <img src={card.image} alt={card.name} style={{ width: "100%", height: "100%", objectFit: "cover", filter: isUsed ? "grayscale(100%)" : "none" }} />
                    {!isUsed && <div style={{ position: "absolute", bottom: "2px", right: "2px", backgroundColor: "rgba(0,0,0,0.85)", color: "#ffd700", fontSize: "11px", fontWeight: "bold", padding: "1px 3px", borderRadius: "3px" }}>{cost}s</div>}
                    {isUsed && <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", color: "rgba(255,255,255,0.4)" }}>✕</div>}
                  </>
                ) : (
                  <div style={{ width: "100%", height: "100%", backgroundColor: "#0f172a", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px" }}>🔒</div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── PvpTabletLayout ───────────────────────────────────────────────────────────
export default function PvpTabletLayout({ game, gameOver, gameOverDismissed, setGameOverDismissed, winner, theme, whiteTime, blackTime, customStyles, onPieceDrop, onSquareClick, tier1Unlocked, tier2Unlocked, tier3Unlocked, selectedCard, setSelectedCard, usedCards, getCardCost, whiteCaptured, blackCaptured, specialModeLabel, setChandraPlacementMode, setGuruMode, setShaniMode, setActivationMode, chandraPlacementMode, guruMode, shaniMode, activationMode, piecesInZones, resetGame, showChaosPopup, setShowChaosPopup, guruPickerMode, setGuruPickerMode, performResurrection }) {
  const currentTurn = game.turn();
  const accent = theme.accent;
  const tabletBoard = Math.min(window.innerWidth - 24, 560);
  return (
    <>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", minHeight: "100vh", width: "100%", backgroundColor: theme.background, color: theme.text, userSelect: "none", overscrollBehavior: "none" }}>

        {showChaosPopup && (
          <div onClick={() => setShowChaosPopup(false)} style={{ position: "fixed", top: "16px", left: "50%", transform: "translateX(-50%)", backgroundColor: "#ff6b6b", padding: "10px 24px", borderRadius: "12px", zIndex: 600, textAlign: "center", border: "2px solid #fff", cursor: "pointer" }}>
            <div style={{ fontWeight: "bold", fontSize: "15px" }}>🔥 CHAOS MODE — All cards half price! 🔥</div>
          </div>
        )}

        {gameOver && !gameOverDismissed && (
          <div onClick={() => setGameOverDismissed(true)} style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)", backgroundColor: "#16213e", padding: "36px 28px", borderRadius: "16px", zIndex: 700, textAlign: "center", border: `3px solid ${accent}`, width: "88vw", maxWidth: "400px", boxShadow: `0 0 60px ${accent}44` }}>
            <h2 style={{ marginBottom: "16px", fontSize: "26px" }}>{winner === "white" ? "⬜ White Wins!" : "⬛ Black Wins!"}</h2>
            <button onClick={resetGame} style={{ padding: "14px 28px", fontSize: "16px", backgroundColor: accent, border: "none", borderRadius: "8px", cursor: "pointer", color: "#000", fontWeight: "bold" }}>Main Menu</button>
            <p style={{ marginTop: "12px", fontSize: "11px", color: "#888", cursor: "pointer" }}>or tap to review the board</p>
          </div>
        )}

        {guruPickerMode && (
          <div style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)", backgroundColor: "#1a1a2e", border: "2px solid #a855f7", borderRadius: "16px", padding: "24px", zIndex: 800, textAlign: "center", boxShadow: "0 0 40px rgba(168,85,247,0.5)", width: "88vw", maxWidth: "340px" }}>
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

        {/* BLACK'S ZONE — rotated 180° so Black reads it the right way up */}
        <div style={{ width: "100%", transform: "rotate(180deg)", transformOrigin: "center center" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 16px 6px", backgroundColor: currentTurn === "b" ? "rgba(233,69,96,0.12)" : "transparent", transition: "background-color 0.4s" }}>
            <div style={{ fontSize: "13px", color: "#888" }}>
              ⬛ Black
              <span style={{ marginLeft: "8px", fontSize: "11px" }}>{blackCaptured.slice(-8).map((p, i) => <span key={i}>{getPieceSymbol(p)}</span>)}</span>
            </div>
            <div style={{ fontSize: "28px", fontWeight: "bold", color: blackTime < 30 ? "#ff6b6b" : theme.text, fontVariantNumeric: "tabular-nums" }}>{formatTime(blackTime)}</div>
          </div>
          <PvpCardTray currentTurn={currentTurn} myColor="b" tier1Unlocked={tier1Unlocked} tier2Unlocked={tier2Unlocked} tier3Unlocked={tier3Unlocked} selectedCard={selectedCard} onSelectCard={setSelectedCard} usedCards={usedCards} getCardCost={getCardCost} />
        </div>

        {/* CENTRE — board */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "6px 0", width: "100%" }}>

          {!selectedCard && !chandraPlacementMode && !guruMode && !shaniMode && piecesInZones.length > 0 && (
            <div style={{ transform: currentTurn === "b" ? "rotate(180deg)" : "none", width: tabletBoard, marginBottom: "6px" }}>
              <button onClick={() => setActivationMode(a => !a)} style={{ width: "100%", padding: "10px", fontSize: "14px", backgroundColor: activationMode ? "#e94560" : "#ffd700", color: "#000", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold" }}>
                {activationMode ? "✕ Cancel Activation" : `⚡ Activate Power (${piecesInZones.length} available)`}
              </button>
            </div>
          )}

          <div style={{ transform: currentTurn === "b" ? "rotate(180deg)" : "none", width: tabletBoard }}>
            {specialModeLabel && (
              <div style={{ width: "100%", backgroundColor: "#1a1a00", border: "1px solid #ffd700", borderRadius: "8px", padding: "7px 12px", marginBottom: "6px", fontSize: "13px", color: "#ffd700", textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}>
                {specialModeLabel}
                <button onClick={() => { setSelectedCard(null); setChandraPlacementMode(null); setGuruMode(null); setShaniMode(null); setActivationMode(false); }} style={{ fontSize: "11px", background: "none", border: "1px solid #ffd700", borderRadius: "4px", color: "#ffd700", cursor: "pointer", padding: "2px 6px" }}>✕ cancel</button>
              </div>
            )}
            <div style={{ width: "100%", textAlign: "center", fontSize: "12px", color: currentTurn === "w" ? "#4ecca3" : "#e94560", marginBottom: "4px" }}>
              {!gameOver && (currentTurn === "w" ? "⬜ White to move" : "⬛ Black to move")}
            </div>
          </div>

          <div id="pvp-board" style={{ width: tabletBoard, height: tabletBoard, flexShrink: 0 }}>
            <Chessboard position={game.fen()} onPieceDrop={onPieceDrop} onSquareClick={onSquareClick} animationDuration={225} customSquareStyles={customStyles} customDarkSquareStyle={{ backgroundColor: theme.darkSquare }} customLightSquareStyle={{ backgroundColor: theme.lightSquare }} boardWidth={tabletBoard} boardOrientation="white" />
          </div>
          <button onClick={resetGame} style={{ marginTop: "8px", padding: "8px 20px", fontSize: "12px", backgroundColor: "transparent", color: "#555", border: "1px solid #333", borderRadius: "20px", cursor: "pointer" }}>✕ Menu</button>
        </div>

        {/* WHITE'S ZONE — normal orientation at bottom */}
        <PvpCardTray currentTurn={currentTurn} myColor="w" tier1Unlocked={tier1Unlocked} tier2Unlocked={tier2Unlocked} tier3Unlocked={tier3Unlocked} selectedCard={selectedCard} onSelectCard={setSelectedCard} usedCards={usedCards} getCardCost={getCardCost} />
        <div style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 16px 12px", backgroundColor: currentTurn === "w" ? "rgba(78,204,163,0.12)" : "transparent", transition: "background-color 0.4s" }}>
          <div style={{ fontSize: "13px", color: "#ccc" }}>
            ⬜ White
            <span style={{ marginLeft: "8px", fontSize: "11px" }}>{whiteCaptured.slice(-8).map((p, i) => <span key={i}>{getPieceSymbol(p)}</span>)}</span>
          </div>
          <div style={{ fontSize: "28px", fontWeight: "bold", color: whiteTime < 30 ? "#ff6b6b" : theme.text, fontVariantNumeric: "tabular-nums" }}>{formatTime(whiteTime)}</div>
        </div>

      </div>
    </>
  );
}