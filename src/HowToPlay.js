// ─── HowToPlay.js ────────────────────────────────────────────────────────────
import { useState } from "react";

export default function HowToPlay() {
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