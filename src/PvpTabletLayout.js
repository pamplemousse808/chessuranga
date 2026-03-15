// ─── PvpTabletLayout.js ───────────────────────────────────────────────────────
import { Chessboard } from "react-chessboard";
import { SHARED_DECK, ASURA_DECK } from "./gameConstants";          // ── NEW: ASURA_DECK
import { formatTime, getPieceSymbol } from "./gameUtils";

// ── PvpCardTray ───────────────────────────────────────────────────────────────
function PvpCardTray({ currentTurn, myColor, tier1Unlocked, tier2Unlocked, tier3Unlocked,
  selectedCard, onSelectCard, usedCards, getCardCost,
  deck }) {                                                          // ── NEW: deck prop
  const isMyTurn = currentTurn === myColor;
  const accent = myColor === "w" ? "#4ecca3" : "#e94560";
  return (
    <div style={{ width: "100%", padding: "8px 12px", backgroundColor: isMyTurn ? `${accent}18` : "rgba(0,0,0,0.3)", borderTop: myColor === "w" ? `2px solid ${isMyTurn ? accent : "rgba(255,255,255,0.08)"}` : "none", borderBottom: myColor === "b" ? `2px solid ${isMyTurn ? accent : "rgba(255,255,255,0.08)"}` : "none", transition: "background-color 0.4s ease" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <div style={{ fontSize: "11px", fontWeight: "700", letterSpacing: "0.1em", textTransform: "uppercase", color: isMyTurn ? accent : "rgba(255,255,255,0.3)", minWidth: "60px", whiteSpace: "pre-line" }}>
          {isMyTurn ? "▶ YOUR\nTURN" : myColor === "w" ? "⬜ White" : "⬛ Black"}
        </div>
        <div style={{ display: "flex", gap: "5px", flex: 1, justifyContent: "center" }}>
          {deck.map(card => {                                        // ── NEW: use deck prop
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
export default function PvpTabletLayout({
  game, gameOver, gameOverDismissed, setGameOverDismissed, winner, theme,
  whiteTime, blackTime, customStyles, onPieceDrop, onSquareClick,
  tier1Unlocked, tier2Unlocked, tier3Unlocked,
  selectedCard, setSelectedCard, usedCards, getCardCost,
  whiteCaptured, blackCaptured, specialModeLabel,
  setChandraPlacementMode, setGuruMode, setShaniMode, setActivationMode,
  chandraPlacementMode, guruMode, shaniMode, activationMode,
  piecesInZones, resetGame, showChaosPopup, setShowChaosPopup,
  guruPickerMode, setGuruPickerMode, performResurrection,
  // ── NEW Asura props ──
  mahishasuraMode, setMahishasuraMode,
  shumbhaMode, setShumbhaMode,
  vritraRanks,
}) {
  const currentTurn = game.turn();
  const tabletBoard = Math.min(window.innerWidth - 24, 560);

  // Cancel helper clears all special modes including new Asura ones
  function cancelAllModes() {                                        // ── NEW
    setSelectedCard(null);
    setChandraPlacementMode(null);
    setGuruMode(null);
    setShaniMode(null);
    setActivationMode(false);
    if (setMahishasuraMode) setMahishasuraMode(null);
    if (setShumbhaMode) setShumbhaMode(null);
  }

  // Build a label for Asura special modes                           // ── NEW
  const asuraSpecialLabel =
    mahishasuraMode?.awaitingChoice ? "🐃 Mahishasura — tap a captured piece type to shapeshift into" :
    mahishasuraMode?.chosenType     ? `🐃 Mahishasura — now tap the piece to transform` :
    shumbhaMode?.awaitingTarget     ? "👥 Shumbha-Nishumbha — tap an adjacent enemy to capture (then snap back)" :
    null;

  return (
    <>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", minHeight: "100vh", width: "100%", backgroundColor: theme.background, color: theme.text, userSelect: "none", overscrollBehavior: "none" }}>

        {showChaosPopup && (
          <div onClick={() => setShowChaosPopup(false)} style={{ position: "fixed", top: "16px", left: "50%", transform: "translateX(-50%)", backgroundColor: "#ff6b6b", padding: "10px 24px", borderRadius: "12px", zIndex: 600, textAlign: "center", border: "2px solid #fff", cursor: "pointer" }}>
            <div style={{ fontWeight: "bold", fontSize: "15px" }}>🔥 CHAOS MODE — All cards half price!</div>
          </div>
        )}

        {gameOver && !gameOverDismissed && (
          <div onClick={() => setGameOverDismissed(true)} style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)", backgroundColor: "#16213e", padding: "32px 24px", borderRadius: "15px", zIndex: 500, textAlign: "center", border: `3px solid ${theme.accent}`, width: "88vw", maxWidth: "380px" }}>
            <h2 style={{ marginBottom: "16px", fontSize: "24px" }}>
              {winner === "white" ? "🌟 Navagraha Prevail!" : "👹 Asuras Reign!"}
            </h2>
            <button onClick={resetGame} style={{ padding: "14px 28px", fontSize: "16px", backgroundColor: theme.accent, border: "none", borderRadius: "8px", cursor: "pointer", color: "#000", fontWeight: "bold" }}>Main Menu</button>
            <p style={{ marginTop: "12px", fontSize: "11px", color: "#888", cursor: "pointer" }}>or tap to review the board</p>
          </div>
        )}
        {gameOver && gameOverDismissed && (
          <div onClick={() => setGameOverDismissed(false)} style={{ position: "fixed", top: "12px", left: "50%", transform: "translateX(-50%)", backgroundColor: theme.accent, color: "#000", padding: "8px 20px", borderRadius: "20px", fontSize: "13px", fontWeight: "bold", cursor: "pointer", zIndex: 300 }}>
            {winner === "white" ? "🌟 White wins!" : "👹 Black wins!"} · tap to see result
          </div>
        )}

        {/* ── BLACK'S ZONE (top, rotated) ── */}
        <div style={{ width: "100%", transform: "rotate(180deg)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 16px 4px", backgroundColor: currentTurn === "b" ? "rgba(233,69,96,0.12)" : "transparent", transition: "background-color 0.4s" }}>
            <div style={{ fontSize: "13px", color: "#888" }}>
              ⬛ Black
              <span style={{ marginLeft: "8px", fontSize: "11px" }}>{blackCaptured.slice(-8).map((p, i) => <span key={i}>{getPieceSymbol(p)}</span>)}</span>
            </div>
            <div style={{ fontSize: "28px", fontWeight: "bold", color: blackTime < 30 ? "#ff6b6b" : theme.text, fontVariantNumeric: "tabular-nums" }}>{formatTime(blackTime)}</div>
          </div>
          {/* ── NEW: Black gets ASURA_DECK ── */}
          <PvpCardTray
            currentTurn={currentTurn} myColor="b"
            tier1Unlocked={tier1Unlocked} tier2Unlocked={tier2Unlocked} tier3Unlocked={tier3Unlocked}
            selectedCard={selectedCard} onSelectCard={setSelectedCard}
            usedCards={usedCards} getCardCost={getCardCost}
            deck={ASURA_DECK}
          />
        </div>

        {/* ── CENTRE — board ── */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "6px 0", width: "100%" }}>

          {!selectedCard && !chandraPlacementMode && !guruMode && !shaniMode && !mahishasuraMode && !shumbhaMode && piecesInZones.length > 0 && (
            <div style={{ transform: currentTurn === "b" ? "rotate(180deg)" : "none", width: tabletBoard, marginBottom: "6px" }}>
              <button onClick={() => setActivationMode(a => !a)} style={{ width: "100%", padding: "10px", fontSize: "14px", backgroundColor: activationMode ? "#e94560" : "#ffd700", color: "#000", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold" }}>
                {activationMode ? "✕ Cancel Activation" : `⚡ Activate Power (${piecesInZones.length} available)`}
              </button>
            </div>
          )}

          <div style={{ transform: currentTurn === "b" ? "rotate(180deg)" : "none", width: tabletBoard }}>

            {/* Navagraha / existing special mode banner */}
            {specialModeLabel && (
              <div style={{ width: "100%", backgroundColor: "#1a1a00", border: "1px solid #ffd700", borderRadius: "8px", padding: "7px 12px", marginBottom: "6px", fontSize: "13px", color: "#ffd700", textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}>
                {specialModeLabel}
                <button onClick={cancelAllModes} style={{ fontSize: "11px", background: "none", border: "1px solid #ffd700", borderRadius: "4px", color: "#ffd700", cursor: "pointer", padding: "2px 6px" }}>✕ cancel</button>
              </div>
            )}

            {/* ── NEW: Asura special mode banner ── */}
            {asuraSpecialLabel && (
              <div style={{ width: "100%", backgroundColor: "#200000", border: "1px solid #e94560", borderRadius: "8px", padding: "7px 12px", marginBottom: "6px", fontSize: "13px", color: "#e94560", textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}>
                {asuraSpecialLabel}
                <button onClick={cancelAllModes} style={{ fontSize: "11px", background: "none", border: "1px solid #e94560", borderRadius: "4px", color: "#e94560", cursor: "pointer", padding: "2px 6px" }}>✕ cancel</button>
              </div>
            )}

            {/* ── NEW: Vritra rank-block indicator ── */}
            {vritraRanks && vritraRanks.length > 0 && (
              <div style={{ width: "100%", backgroundColor: "#000d1a", border: "1px solid #1e40af", borderRadius: "8px", padding: "5px 12px", marginBottom: "4px", fontSize: "12px", color: "#60a5fa", textAlign: "center" }}>
                🐍 Vritra blocks rank{vritraRanks.length > 1 ? "s" : ""} {vritraRanks.map(v => v.rank).join(", ")} — {Math.max(...vritraRanks.map(v => v.turnsLeft))} turn{Math.max(...vritraRanks.map(v => v.turnsLeft)) !== 1 ? "s" : ""} remaining
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

        {/* ── WHITE'S ZONE (bottom, normal orientation) ── */}
        {/* ── NEW: White gets SHARED_DECK ── */}
        <PvpCardTray
          currentTurn={currentTurn} myColor="w"
          tier1Unlocked={tier1Unlocked} tier2Unlocked={tier2Unlocked} tier3Unlocked={tier3Unlocked}
          selectedCard={selectedCard} onSelectCard={setSelectedCard}
          usedCards={usedCards} getCardCost={getCardCost}
          deck={SHARED_DECK}
        />
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