// ─── MobileCardOverlay.js ────────────────────────────────────────────────────
import { useState } from "react";
import { SHARED_DECK } from "./gameConstants";

const TRAY_INFO = {
  RAHU: { emoji: "🔮", power: "Phase Walk", detail: "Pass through blocking pieces for 2 moves. An unstoppable ghost on the board." },
  KETU: { emoji: "☄️", power: "Ketu's Curse", detail: "If captured, this piece teleports back to where it was activated instead of dying. Lasts 3 turns." },
  SURYA: { emoji: "☀️", power: "Invincibility", detail: "This piece cannot be captured for 2 moves. Surya's radiance burns all who approach." },
  CHANDRA: { emoji: "🌙", power: "Clones", detail: "Place 1–2 mirror images on the same rank. Enemies won't know which is real." },
  GURU: { emoji: "🪐", power: "Duplicate", detail: "Spawn a real copy of this piece left or right — it moves and captures for 2 turns, then dissolves." },
  SHUKRA: { emoji: "💫", power: "Resurrection", detail: "Bring back a captured piece to where it died. It can't move immediately — even Shukra's grace needs a moment." },
  BUDHA: { emoji: "⚡", power: "Double Move", detail: "Take two consecutive moves. Ends early if the first move captures." },
  MANGALA: { emoji: "🔥", power: "Smite", detail: "Capture any adjacent enemy piece, ignoring normal movement rules. War cares nothing for geometry." },
  SHANI: { emoji: "❄️", power: "Freeze", detail: "Immobilise an enemy piece for 2 turns. Even kings have cowered before Shani's gaze." },
};

export default function MobileCardOverlay({
  show, onClose, tier1Unlocked, tier2Unlocked, tier3Unlocked,
  selectedCard, onSelectCard, gameMode, getCardCost, currentTurn,
  usedCards, cardCooldowns
}) {
  const [previewId, setPreviewId] = useState(null);

  if (!show) return null;

  const trayCardId = previewId || selectedCard?.id || null;
  const trayCard = trayCardId ? SHARED_DECK.find(c => c.id === trayCardId) : null;
  const trayInfo = trayCardId ? TRAY_INFO[trayCardId] : null;

  const canUseTray = trayCard
    ? (() => {
      const isUsed = (gameMode === "asura" || gameMode === "shukracharya")
        ? !!cardCooldowns[trayCard.id]
        : usedCards.includes(trayCard.id);
      const isUnlocked = trayCard.tier === 1 ? tier1Unlocked
        : trayCard.tier === 2 ? tier2Unlocked
          : tier3Unlocked;
      return isUnlocked && !isUsed && currentTurn === "w";
    })()
    : false;

  function handleCardTap(card) {
    setPreviewId(card.id);
  }

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 300, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
      <div onClick={() => { onClose(); setPreviewId(null); }} style={{ position: "absolute", inset: 0, backgroundColor: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }} />

      <div style={{ position: "relative", backgroundColor: "#0f172a", borderRadius: "24px 24px 0 0", maxHeight: "80vh", overflowY: "auto", boxShadow: "0 -8px 40px rgba(0,0,0,0.8)" }}>

        <div style={{ width: "40px", height: "4px", backgroundColor: "#334155", borderRadius: "2px", margin: "12px auto 0" }} />

        <h3 style={{ color: "#e2e8f0", textAlign: "center", margin: "10px 0 12px", fontSize: "15px", fontFamily: "inherit" }}>
          ✨ Navagraha Powers
        </h3>

        {/* ── Description Tray ── */}
        <div style={{
          margin: "0 14px 14px",
          borderRadius: "14px",
          minHeight: "88px",
          padding: "14px 16px",
          backgroundColor: trayCard ? `${trayCard.color}14` : "rgba(255,255,255,0.04)",
          border: `1px solid ${trayCard ? trayCard.color + "44" : "rgba(255,255,255,0.08)"}`,
          transition: "background-color 0.25s, border-color 0.25s",
          display: "flex",
          flexDirection: "column",
          gap: "10px",
        }}>
          {trayCard && trayInfo ? (
            <>
              <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                <div style={{ width: "56px", height: "56px", borderRadius: "10px", overflow: "hidden", flexShrink: 0, border: `2px solid ${trayCard.color}88` }}>
                  <img src={trayCard.image} alt={trayCard.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "baseline", gap: "8px", marginBottom: "4px", flexWrap: "wrap" }}>
                    <span style={{ fontWeight: "700", fontSize: "16px", color: trayCard.color }}>
                      {trayInfo.emoji} {trayCard.name}
                    </span>
                    <span style={{ fontSize: "12px", color: "#ffd700", fontWeight: "bold" }}>
                      {getCardCost(trayCard)}s
                    </span>
                    <span style={{ fontSize: "11px", color: "#64748b" }}>
                      Tier {trayCard.tier}
                    </span>
                  </div>
                  <div style={{ fontSize: "12px", fontWeight: "700", color: "#e2e8f0", marginBottom: "3px" }}>
                    {trayInfo.power}
                  </div>
                  <div style={{ fontSize: "12px", color: "#94a3b8", lineHeight: "1.5" }}>
                    {trayInfo.detail}
                  </div>
                </div>
              </div>

              {canUseTray && (
                <button
                  onClick={() => {
                    onSelectCard(trayCard);
                    setTimeout(() => { onClose(); setPreviewId(null); }, 200);
                  }}
                  style={{
                    width: "100%",
                    padding: "10px",
                    borderRadius: "10px",
                    border: "none",
                    background: trayCard.color,
                    color: "#000",
                    fontWeight: "bold",
                    fontSize: "14px",
                    cursor: "pointer",
                  }}
                >
                  ⚡ Use Power
                </button>
              )}
            </>
          ) : (
            <div style={{ textAlign: "center", color: "#334155", fontSize: "13px", padding: "16px 0" }}>
              Tap a card to see its power
            </div>
          )}
        </div>

        {/* ── Card Grid ── */}
        <div style={{ padding: "0 14px 36px" }}>
          {[1, 2, 3].map(tier => {
            const tierCards = SHARED_DECK.filter(c => c.tier === tier);
            const isUnlocked = (tier === 1 && tier1Unlocked) || (tier === 2 && tier2Unlocked) || (tier === 3 && tier3Unlocked);
            return (
              <div key={tier} style={{ marginBottom: "18px" }}>
                <div style={{ fontSize: "10px", color: "#475569", marginBottom: "8px", textAlign: "center", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                  Tier {tier} {!isUnlocked && "🔒"}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px" }}>
                  {tierCards.map(card => {
                    const isUsed = (gameMode === "asura" || gameMode === "shukracharya") ? !!cardCooldowns[card.id] : usedCards.includes(card.id);
                    const cooldown = cardCooldowns[card.id];
                    const isSelected = selectedCard?.id === card.id;
                    const isPreviewed = previewId === card.id;

                    return (
                      <div
                        key={card.id}
                        onClick={() => handleCardTap(card)}
                        style={{
                          borderRadius: "12px",
                          overflow: "hidden",
                          border: isSelected
                            ? "3px solid #fff"
                            : isPreviewed
                              ? `2px solid ${card.color}`
                              : isUnlocked && !isUsed
                                ? `2px solid ${card.color}44`
                                : "2px solid rgba(255,255,255,0.06)",
                          opacity: isUsed ? 0.35 : isUnlocked ? 1 : 0.22,
                          cursor: "pointer",
                          position: "relative",
                          aspectRatio: "3/4",
                          boxShadow: isSelected ? `0 0 14px ${card.color}88` : isPreviewed ? `0 0 8px ${card.color}44` : "none",
                          transition: "border-color 0.2s, box-shadow 0.2s, opacity 0.2s",
                        }}
                      >
                        {isUnlocked ? (
                          <>
                            <img
                              src={card.image}
                              alt={card.name}
                              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", filter: isUsed ? "grayscale(80%)" : "none" }}
                            />
                            <div style={{ position: "absolute", top: "5px", right: "5px", backgroundColor: "rgba(0,0,0,0.82)", color: "#ffd700", fontSize: "11px", fontWeight: "bold", padding: "2px 5px", borderRadius: "6px" }}>
                              {getCardCost(card)}s
                            </div>
                            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "linear-gradient(transparent, rgba(0,0,0,0.85))", padding: "18px 7px 7px" }}>
                              <div style={{ fontSize: "12px", fontWeight: "bold", color: "#fff", textAlign: "center" }}>
                                {card.name}
                              </div>
                            </div>
                            {isSelected && (
                              <div style={{ position: "absolute", top: "5px", left: "5px", backgroundColor: "#fff", color: "#000", fontWeight: "bold", fontSize: "11px", borderRadius: "50%", width: "20px", height: "20px", display: "flex", alignItems: "center", justifyContent: "center" }}>✓</div>
                            )}
                            {cooldown && (
                              <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", backgroundColor: "rgba(0,0,0,0.8)", color: "#fff", fontWeight: "bold", fontSize: "22px", borderRadius: "50%", width: "40px", height: "40px", display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid #a855f7" }}>
                                {cooldown}
                              </div>
                            )}
                          </>
                        ) : (
                          <div style={{ width: "100%", height: "100%", backgroundColor: "#0f172a", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "4px" }}>
                            <span style={{ fontSize: "22px" }}>🔒</span>
                            <span style={{ fontSize: "9px", color: "#334155", textAlign: "center", padding: "0 4px" }}>{card.name}</span>
                          </div>
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
    </div>
  );
}