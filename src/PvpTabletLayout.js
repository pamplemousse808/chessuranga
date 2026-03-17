// ─── PvpTabletLayout.js ───────────────────────────────────────────────────────
import { useState } from "react";
import { Chessboard } from "react-chessboard";
import { SHARED_DECK, ASURA_DECK, ASURA_CARD_EMOJI, CARD_EMOJI } from "./gameConstants";
import { formatTime, getPieceSymbol } from "./gameUtils";

// ── Which deck does each colour use? ─────────────────────────────────────────
const DECK_FOR = { w: SHARED_DECK, b: ASURA_DECK };
const EMOJI_FOR = { w: CARD_EMOJI, b: ASURA_CARD_EMOJI };

// ── CardTooltip ───────────────────────────────────────────────────────────────
// Fullscreen overlay tooltip, always right-way-up for the tapping player.
// `flipped` = true for Black's tray (rotated 180° at top of screen).
function CardTooltip({ card, emoji, cost, onCancel, flipped }) {
  if (!card) return null;
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 800,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(0,0,0,0.75)",
        backdropFilter: "blur(6px)",
      }}
      onClick={onCancel}
    >
      {/* Rotate the card panel so it reads right-way-up for the tapping player */}
      <div
        onClick={e => e.stopPropagation()}
        style={{
          transform: flipped ? "rotate(180deg)" : "none",
          backgroundColor: "#0f172a",
          border: `2px solid ${card.color}`,
          borderRadius: "20px",
          padding: "24px 28px",
          maxWidth: "320px",
          width: "85vw",
          boxShadow: `0 0 40px ${card.color}66`,
          display: "flex",
          flexDirection: "column",
          gap: "14px",
          alignItems: "center",
        }}
      >
        {/* Card image */}
        <div
          style={{
            width: "96px",
            height: "96px",
            borderRadius: "14px",
            overflow: "hidden",
            border: `3px solid ${card.color}`,
            boxShadow: `0 0 20px ${card.color}88`,
            flexShrink: 0,
          }}
        >
          <img
            src={card.image}
            alt={card.name}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </div>

        {/* Name + emoji */}
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "22px", fontWeight: "800", color: "#f1f5f9", letterSpacing: "0.02em" }}>
            {emoji} {card.name}
          </div>
          <div
            style={{
              display: "inline-block",
              marginTop: "6px",
              backgroundColor: `${card.color}22`,
              border: `1px solid ${card.color}66`,
              borderRadius: "20px",
              padding: "3px 12px",
              fontSize: "12px",
              fontWeight: "700",
              color: card.color,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            Tier {card.tier}
          </div>
        </div>

        {/* Description */}
        <p
          style={{
            color: "#cbd5e1",
            fontSize: "15px",
            lineHeight: "1.55",
            textAlign: "center",
            margin: 0,
          }}
        >
          {card.description}
        </p>

        {/* Cost + Cancel */}
        <div style={{ display: "flex", gap: "12px", width: "100%", marginTop: "4px" }}>
          <div
            style={{
              flex: 1,
              textAlign: "center",
              backgroundColor: "rgba(255,215,0,0.1)",
              border: "1px solid rgba(255,215,0,0.3)",
              borderRadius: "10px",
              padding: "10px 0",
            }}
          >
            <div style={{ fontSize: "24px", fontWeight: "900", color: "#ffd700" }}>{cost}s</div>
            <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "2px" }}>time cost</div>
          </div>
          <button
            onClick={onCancel}
            style={{
              flex: 1,
              backgroundColor: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.15)",
              borderRadius: "10px",
              color: "#94a3b8",
              fontSize: "14px",
              fontWeight: "600",
              cursor: "pointer",
              padding: "10px 0",
            }}
          >
            ✕ Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// ── LastCardBanner ────────────────────────────────────────────────────────────
// Shows what the OPPONENT played last turn, displayed above the current player's tray.
// `flipped` is false for White (bottom), true for Black (top, rotated).
function LastCardBanner({ lastCard, lastCardEmoji, opponentColor, flipped }) {
  if (!lastCard) return null;
  const label = opponentColor === "w" ? "⬜ White played" : "⬛ Black played";
  return (
    <div
      style={{
        width: "100%",
        transform: flipped ? "rotate(180deg)" : "none",
        padding: "6px 14px",
        backgroundColor: `${lastCard.color}14`,
        borderTop: flipped ? "none" : `1px solid ${lastCard.color}44`,
        borderBottom: flipped ? `1px solid ${lastCard.color}44` : "none",
        display: "flex",
        alignItems: "center",
        gap: "10px",
        minHeight: "38px",
      }}
    >
      <div
        style={{
          width: "32px",
          height: "32px",
          borderRadius: "6px",
          overflow: "hidden",
          border: `1px solid ${lastCard.color}88`,
          flexShrink: 0,
        }}
      >
        <img
          src={lastCard.image}
          alt={lastCard.name}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: "10px", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "1px" }}>
          {label}
        </div>
        <div style={{ fontSize: "13px", fontWeight: "700", color: lastCard.color, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {lastCardEmoji} {lastCard.name}
        </div>
      </div>
      <div style={{ fontSize: "11px", color: "#475569", whiteSpace: "nowrap" }}>
        {lastCard.description.split(" ").slice(0, 5).join(" ")}…
      </div>
    </div>
  );
}

// ── PvpCardTray ───────────────────────────────────────────────────────────────
function PvpCardTray({
  currentTurn,
  myColor,
  tier1Unlocked,
  tier2Unlocked,
  tier3Unlocked,
  selectedCard,
  onSelectCard,
  usedCards,
  getCardCost,
  lastOpponentCard,      // { card, emoji } | null — what opponent played last turn
  flipped,               // true for Black's tray (sits at top, rotated 180°)
}) {
  const [tooltipCard, setTooltipCard] = useState(null);

  const isMyTurn = currentTurn === myColor;
  const accent = myColor === "w" ? "#4ecca3" : "#e94560";
  const deck = DECK_FOR[myColor];
  const emojiMap = EMOJI_FOR[myColor];
  const opponentColor = myColor === "w" ? "b" : "w";

  // Find the full card object + emoji for the last opponent card id
  const lastCardObj = lastOpponentCard
    ? DECK_FOR[opponentColor].find(c => c.id === lastOpponentCard.id) ?? null
    : null;
  const lastCardEmoji = lastCardObj ? EMOJI_FOR[opponentColor][lastCardObj.id] : null;

  function handleCardTap(card) {
    if (!isMyTurn) return;
    const tierNum = card.tier;
    const isUnlocked =
      (tierNum === 1 && tier1Unlocked) ||
      (tierNum === 2 && tier2Unlocked) ||
      (tierNum === 3 && tier3Unlocked);
    if (!isUnlocked) return;
    const isUsed = usedCards.includes(card.id);
    if (isUsed) return;

    if (selectedCard?.id === card.id) {
      // Tapping the already-selected card opens the tooltip
      setTooltipCard(card);
    } else {
      onSelectCard(card);
      setTooltipCard(card);
    }
  }

  function handleTooltipCancel() {
    setTooltipCard(null);
    onSelectCard(null);
  }

  const trayContent = (
    <div
      style={{
        width: "100%",
        padding: "8px 12px",
        backgroundColor: isMyTurn ? `${accent}18` : "rgba(0,0,0,0.3)",
        borderTop: myColor === "w" ? `2px solid ${isMyTurn ? accent : "rgba(255,255,255,0.08)"}` : "none",
        borderBottom: myColor === "b" ? `2px solid ${isMyTurn ? accent : "rgba(255,255,255,0.08)"}` : "none",
        transition: "background-color 0.4s ease",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        {/* Turn label */}
        <div
          style={{
            fontSize: "11px",
            fontWeight: "700",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: isMyTurn ? accent : "rgba(255,255,255,0.3)",
            minWidth: "60px",
            whiteSpace: "pre-line",
          }}
        >
          {isMyTurn ? "▶ YOUR\nTURN" : myColor === "w" ? "⬜ White" : "⬛ Black"}
        </div>

        {/* Cards */}
        <div style={{ display: "flex", gap: "5px", flex: 1, justifyContent: "center" }}>
          {deck.map(card => {
            const tierNum = card.tier;
            const isUnlocked =
              (tierNum === 1 && tier1Unlocked) ||
              (tierNum === 2 && tier2Unlocked) ||
              (tierNum === 3 && tier3Unlocked);
            const isUsed = usedCards.includes(card.id);
            const isSelected = selectedCard?.id === card.id;
            const canUse = isUnlocked && !isUsed && isMyTurn;
            const cost = getCardCost(card);
            const emoji = emojiMap[card.id] ?? "✨";

            return (
              <div
                key={card.id}
                onClick={() => handleCardTap(card)}
                style={{
                  position: "relative",
                  width: "60px",
                  height: "60px",
                  borderRadius: "8px",
                  overflow: "hidden",
                  border: isSelected
                    ? "2px solid #fff"
                    : isUnlocked && !isUsed
                    ? `2px solid ${card.color}66`
                    : "2px solid rgba(255,255,255,0.06)",
                  opacity: isUsed ? 0.3 : isUnlocked ? 1 : 0.25,
                  cursor: canUse ? "pointer" : "default",
                  boxShadow: isSelected ? `0 0 12px ${card.color}` : "none",
                  flexShrink: 0,
                  transition: "box-shadow 0.2s, border-color 0.2s",
                }}
              >
                {isUnlocked ? (
                  <>
                    <img
                      src={card.image}
                      alt={card.name}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        filter: isUsed ? "grayscale(100%)" : "none",
                      }}
                    />
                    {/* Cost badge */}
                    {!isUsed && (
                      <div
                        style={{
                          position: "absolute",
                          bottom: "2px",
                          right: "2px",
                          backgroundColor: "rgba(0,0,0,0.85)",
                          color: "#ffd700",
                          fontSize: "11px",
                          fontWeight: "bold",
                          padding: "1px 3px",
                          borderRadius: "3px",
                        }}
                      >
                        {cost}s
                      </div>
                    )}
                    {/* Emoji badge top-left */}
                    {!isUsed && (
                      <div
                        style={{
                          position: "absolute",
                          top: "2px",
                          left: "2px",
                          fontSize: "12px",
                          lineHeight: 1,
                          filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.9))",
                        }}
                      >
                        {emoji}
                      </div>
                    )}
                    {isUsed && (
                      <div
                        style={{
                          position: "absolute",
                          inset: 0,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "18px",
                          color: "rgba(255,255,255,0.4)",
                        }}
                      >
                        ✕
                      </div>
                    )}
                  </>
                ) : (
                  <div
                    style={{
                      width: "100%",
                      height: "100%",
                      backgroundColor: "#0f172a",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "16px",
                    }}
                  >
                    🔒
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Tooltip overlay — rendered outside tray rotation so it's always readable */}
      {tooltipCard && (
        <CardTooltip
          card={tooltipCard}
          emoji={emojiMap[tooltipCard.id] ?? "✨"}
          cost={getCardCost(tooltipCard)}
          onCancel={handleTooltipCancel}
          flipped={flipped}
        />
      )}
    </div>
  );

  // For Black's tray we wrap in a rotate(180deg) container
  if (flipped) {
    return (
      <>
        <div style={{ transform: "rotate(180deg)", width: "100%" }}>
          {trayContent}
        </div>
        {/* Banner is OUTSIDE the flip so it reads correctly for Black (who is viewing from the top) */}
        <LastCardBanner
          lastCard={lastCardObj}
          lastCardEmoji={lastCardEmoji}
          opponentColor={opponentColor}
          flipped={true}
        />
      </>
    );
  }

  return (
    <>
      {/* White's banner sits ABOVE the tray */}
      <LastCardBanner
        lastCard={lastCardObj}
        lastCardEmoji={lastCardEmoji}
        opponentColor={opponentColor}
        flipped={false}
      />
      {trayContent}
    </>
  );
}

// ── PvpTabletLayout ───────────────────────────────────────────────────────────
export default function PvpTabletLayout({
  game,
  gameOver,
  gameOverDismissed,
  setGameOverDismissed,
  winner,
  theme,
  whiteTime,
  blackTime,
  customStyles,
  onPieceDrop,
  onSquareClick,
  tier1Unlocked,
  tier2Unlocked,
  tier3Unlocked,
  selectedCard,
  setSelectedCard,
  // Separate used-card arrays for each player.
  // Pass whiteUsedCards / blackUsedCards from App.js.
  // Falls back to a shared `usedCards` prop so existing code doesn't break.
  whiteUsedCards,
  blackUsedCards,
  usedCards,        // legacy fallback — remove once App.js is updated
  getCardCost,
  whiteCaptured,
  blackCaptured,
  specialModeLabel,
  setChandraPlacementMode,
  setGuruMode,
  setShaniMode,
  setActivationMode,
  chandraPlacementMode,
  guruMode,
  shaniMode,
  activationMode,
  piecesInZones,
  resetGame,
  showChaosPopup,
  setShowChaosPopup,
  guruPickerMode,
  setGuruPickerMode,
  performResurrection,
  // New: last card played by each player (full card id string or null).
  // App.js should track these and pass them in.
  lastWhiteCard,   // id of the last card White played, or null
  lastBlackCard,   // id of the last card Black played, or null
}) {
  const currentTurn = game.turn();
  const tabletBoard = Math.min(window.innerWidth - 24, 560);

  // Resolve used-card arrays — supports both old (shared) and new (separate) props
  const wUsed = whiteUsedCards ?? usedCards ?? [];
  const bUsed = blackUsedCards ?? usedCards ?? [];

  return (
    <>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          minHeight: "100vh",
          width: "100%",
          backgroundColor: theme.background,
          color: theme.text,
          userSelect: "none",
          overscrollBehavior: "none",
        }}
      >
        {/* ── Chaos popup ── */}
        {showChaosPopup && (
          <div
            onClick={() => setShowChaosPopup(false)}
            style={{
              position: "fixed",
              top: "16px",
              left: "50%",
              transform: "translateX(-50%)",
              backgroundColor: "#ff6b6b",
              padding: "10px 24px",
              borderRadius: "12px",
              zIndex: 600,
              textAlign: "center",
              border: "2px solid #fff",
              cursor: "pointer",
            }}
          >
            <div style={{ fontWeight: "bold", fontSize: "15px" }}>
              🔥 CHAOS MODE — All cards half price! 🔥
            </div>
          </div>
        )}

        {/* ── Game over overlay ── */}
        {gameOver && !gameOverDismissed && (
          <div
            onClick={() => setGameOverDismissed(true)}
            style={{
              position: "fixed",
              top: "50%",
              left: "50%",
              transform: "translate(-50%,-50%)",
              backgroundColor: "#16213e",
              padding: "32px 24px",
              borderRadius: "15px",
              zIndex: 700,
              textAlign: "center",
              border: `3px solid ${theme.accent}`,
              width: "88vw",
              maxWidth: "380px",
            }}
          >
            <h2 style={{ marginBottom: "16px", fontSize: "24px" }}>
              {winner === "white" ? "⬜ White Wins!" : "⬛ Black Wins!"}
            </h2>
            <button
              onClick={resetGame}
              style={{
                padding: "14px 28px",
                fontSize: "16px",
                backgroundColor: theme.accent,
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                color: "#000",
                fontWeight: "bold",
              }}
            >
              Main Menu
            </button>
            <p style={{ marginTop: "12px", fontSize: "11px", color: "#888" }}>
              or tap to review the board
            </p>
          </div>
        )}

        {/* ── Dismissed game-over pill ── */}
        {gameOver && gameOverDismissed && (
          <div
            onClick={() => setGameOverDismissed(false)}
            style={{
              position: "fixed",
              top: "12px",
              left: "50%",
              transform: "translateX(-50%)",
              backgroundColor: theme.accent,
              color: "#000",
              padding: "8px 20px",
              borderRadius: "20px",
              fontSize: "13px",
              fontWeight: "bold",
              cursor: "pointer",
              zIndex: 300,
              boxShadow: "0 4px 15px rgba(0,0,0,0.4)",
            }}
          >
            {winner === "white" ? "⬜ White won!" : "⬛ Black won!"} · tap to see result
          </div>
        )}

        {/* ════════════════════════════════════════
            BLACK'S ZONE — rotated 180° at top
        ════════════════════════════════════════ */}

        {/* Black timer + captures (rotated for Black's reading angle) */}
        <div
          style={{
            transform: "rotate(180deg)",
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "6px 16px 4px",
            backgroundColor: currentTurn === "b" ? "rgba(233,69,96,0.12)" : "transparent",
            transition: "background-color 0.4s",
          }}
        >
          <div style={{ fontSize: "13px", color: "#888" }}>
            ⬛ Black
            <span style={{ marginLeft: "8px", fontSize: "11px" }}>
              {blackCaptured.slice(-8).map((p, i) => (
                <span key={i}>{getPieceSymbol(p)}</span>
              ))}
            </span>
          </div>
          <div
            style={{
              fontSize: "28px",
              fontWeight: "bold",
              color: blackTime < 30 ? "#ff6b6b" : theme.text,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {formatTime(blackTime)}
          </div>
        </div>

        {/* Black's card tray (flipped=true → renders rotated + banner below) */}
        <PvpCardTray
          currentTurn={currentTurn}
          myColor="b"
          tier1Unlocked={tier1Unlocked}
          tier2Unlocked={tier2Unlocked}
          tier3Unlocked={tier3Unlocked}
          selectedCard={selectedCard}
          onSelectCard={setSelectedCard}
          usedCards={bUsed}
          getCardCost={getCardCost}
          lastOpponentCard={lastWhiteCard ? { id: lastWhiteCard } : null}
          flipped={true}
        />

        {/* ════════════════════════════════════════
            CENTRE — board
        ════════════════════════════════════════ */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "4px 0",
            width: "100%",
          }}
        >
          {/* Activation button — rotated for whichever player's turn */}
          {!selectedCard && !chandraPlacementMode && !guruMode && !shaniMode && piecesInZones.length > 0 && (
            <div
              style={{
                transform: currentTurn === "b" ? "rotate(180deg)" : "none",
                width: tabletBoard,
                marginBottom: "6px",
              }}
            >
              <button
                onClick={() => setActivationMode(a => !a)}
                style={{
                  width: "100%",
                  padding: "10px",
                  fontSize: "14px",
                  backgroundColor: activationMode ? "#e94560" : "#ffd700",
                  color: "#000",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontWeight: "bold",
                }}
              >
                {activationMode
                  ? "✕ Cancel Activation"
                  : `⚡ Activate Power (${piecesInZones.length} available)`}
              </button>
            </div>
          )}

          {/* Special mode banner (Chandra/Guru/Shani/etc.) */}
          <div
            style={{
              transform: currentTurn === "b" ? "rotate(180deg)" : "none",
              width: tabletBoard,
            }}
          >
            {specialModeLabel && (
              <div
                style={{
                  width: "100%",
                  backgroundColor: "#1a1a00",
                  border: "1px solid #ffd700",
                  borderRadius: "8px",
                  padding: "7px 12px",
                  marginBottom: "6px",
                  fontSize: "13px",
                  color: "#ffd700",
                  textAlign: "center",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "10px",
                }}
              >
                {specialModeLabel}
                <button
                  onClick={() => {
                    setSelectedCard(null);
                    setChandraPlacementMode(null);
                    setGuruMode(null);
                    setShaniMode(null);
                    setActivationMode(false);
                  }}
                  style={{
                    fontSize: "11px",
                    background: "none",
                    border: "1px solid #ffd700",
                    borderRadius: "4px",
                    color: "#ffd700",
                    cursor: "pointer",
                    padding: "2px 6px",
                  }}
                >
                  ✕ cancel
                </button>
              </div>
            )}

            {/* Turn indicator */}
            <div
              style={{
                width: "100%",
                textAlign: "center",
                fontSize: "12px",
                color: currentTurn === "w" ? "#4ecca3" : "#e94560",
                marginBottom: "4px",
              }}
            >
              {!gameOver && (currentTurn === "w" ? "⬜ White to move" : "⬛ Black to move")}
            </div>
          </div>

          {/* Board */}
          <div id="pvp-board" style={{ width: tabletBoard, height: tabletBoard, flexShrink: 0 }}>
            <Chessboard
              position={game.fen()}
              onPieceDrop={onPieceDrop}
              onSquareClick={onSquareClick}
              animationDuration={225}
              customSquareStyles={customStyles}
              customDarkSquareStyle={{ backgroundColor: theme.darkSquare }}
              customLightSquareStyle={{ backgroundColor: theme.lightSquare }}
              boardWidth={tabletBoard}
              boardOrientation="white"
            />
          </div>

          <button
            onClick={resetGame}
            style={{
              marginTop: "8px",
              padding: "8px 20px",
              fontSize: "12px",
              backgroundColor: "transparent",
              color: "#555",
              border: "1px solid #333",
              borderRadius: "20px",
              cursor: "pointer",
            }}
          >
            ✕ Menu
          </button>
        </div>

        {/* ════════════════════════════════════════
            WHITE'S ZONE — normal orientation at bottom
        ════════════════════════════════════════ */}

        {/* White's card tray (flipped=false → banner above, tray below) */}
        <PvpCardTray
          currentTurn={currentTurn}
          myColor="w"
          tier1Unlocked={tier1Unlocked}
          tier2Unlocked={tier2Unlocked}
          tier3Unlocked={tier3Unlocked}
          selectedCard={selectedCard}
          onSelectCard={setSelectedCard}
          usedCards={wUsed}
          getCardCost={getCardCost}
          lastOpponentCard={lastBlackCard ? { id: lastBlackCard } : null}
          flipped={false}
        />

        {/* White timer + captures */}
        <div
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "6px 16px 12px",
            backgroundColor: currentTurn === "w" ? "rgba(78,204,163,0.12)" : "transparent",
            transition: "background-color 0.4s",
          }}
        >
          <div style={{ fontSize: "13px", color: "#ccc" }}>
            ⬜ White
            <span style={{ marginLeft: "8px", fontSize: "11px" }}>
              {whiteCaptured.slice(-8).map((p, i) => (
                <span key={i}>{getPieceSymbol(p)}</span>
              ))}
            </span>
          </div>
          <div
            style={{
              fontSize: "28px",
              fontWeight: "bold",
              color: whiteTime < 30 ? "#ff6b6b" : theme.text,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {formatTime(whiteTime)}
          </div>
        </div>
      </div>
    </>
  );
}