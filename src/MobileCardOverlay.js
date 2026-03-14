// ─── MobileCardOverlay.js ────────────────────────────────────────────────────
import { SHARED_DECK } from "./gameConstants";

export default function MobileCardOverlay({
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