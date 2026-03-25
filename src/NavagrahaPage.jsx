import { useEffect, useState } from "react";
import { SHARED_DECK } from "./gameConstants";

const GRAHA_LORE = {
  SURYA: {
    sanskrit: "सूर्य",
    title: "The Sun",
    planet: "Sun",
    domain: "Light, sovereignty, vitality, truth",
    symbol: "☀️",
    color: "#fbbf24",
    lore: "Surya is the eye of the cosmos — the source of all light and life. King of the Navagraha, he rides a golden chariot drawn by seven horses across the sky each day. He governs willpower, authority, and the soul itself. Where Surya shines, nothing can be hidden.",
    power: "Invincibility — the piece cannot be captured for 2 moves. Surya's radiance is so overwhelming that enemies cannot approach. A piece bathed in sunlight becomes untouchable, burning the hand of any who try to seize it.",
  },
  CHANDRA: {
    sanskrit: "चन्द्र",
    title: "The Moon",
    planet: "Moon",
    domain: "Illusion, reflection, emotion, the tides",
    symbol: "🌙",
    color: "#e5e7eb",
    lore: "Chandra is the lord of illusion and the master of reflection. His light is borrowed — a beautiful deception that shapes the tides and dreams. In Hindu cosmology he is fickle, waxing and waning, never quite what he appears. His greatest power is that no one can tell the real from the reflected.",
    power: "Clones — place 1 or 2 mirror images on the same rank. Enemies won't know which is real until it's too late. The clones move alongside the true piece, and only by capturing the real one does the illusion shatter.",
  },
  MANGALA: {
    sanskrit: "मंगल",
    title: "The Red Planet",
    planet: "Mars",
    domain: "War, courage, aggression, energy",
    symbol: "🔥",
    color: "#ef4444",
    lore: "Mangala is the god of war — fierce, red, relentless. He was born from the blood of Shiva and embodies raw martial power. Where other gods counsel patience, Mangala strikes first. He governs soldiers, weapons, and the burning need to win at any cost.",
    power: "Smite — capture any adjacent enemy piece regardless of normal movement rules. Mangala doesn't care about chess geometry. If an enemy is close enough to smell, it's close enough to destroy.",
  },
  BUDHA: {
    sanskrit: "बुध",
    title: "The Swift Messenger",
    planet: "Mercury",
    domain: "Intellect, communication, speed, trade",
    symbol: "⚡",
    color: "#3b82f6",
    lore: "Budha is the swift-footed son of Chandra, the messenger who carries thought between the worlds. He governs wit, commerce, and the speed of the mind. In a single breath he can be in two places. His blessing is the gift of the second thought — the move you didn't know you had.",
    power: "Double Move — take two consecutive moves instead of one. If the first move captures a piece, the turn ends. Budha rewards the mind that plans two steps ahead.",
  },
  GURU: {
    sanskrit: "गुरु",
    title: "The Great Teacher",
    planet: "Jupiter",
    domain: "Wisdom, expansion, fortune, divine grace",
    symbol: "🪐",
    color: "#a855f7",
    lore: "Guru — Jupiter — is the greatest of teachers. He is the preceptor of the gods themselves, vast as the planet that bears his name. He embodies blessings, abundance, and the expansion of all things good. His most sacred power is the reversal of death — for true wisdom knows that endings are only beginnings.",
    power: "Resurrection — bring back a captured piece to where it died. The resurrected piece is spiritually renewed but cannot move immediately, as even Guru's grace requires a moment of stillness.",
  },
  SHUKRA: {
    sanskrit: "शुक्र",
    title: "The Bright Star",
    planet: "Venus",
    domain: "Wealth, beauty, desire, time itself",
    symbol: "💫",
    color: "#ec4899",
    lore: "Shukra is the guru of the Asuras — the demons' own teacher — and the only one who knows the secret of Mritasanjivani, the art of restoring the dead. He governs pleasure, luxury, and the harvest of time. His blessing multiplies everything it touches. To earn Shukra's favour is to make the most of every moment.",
    power: "Time Harvest — triple the time earned on your next 2 captures. Shukra teaches that a single well-timed strike is worth more than a dozen ordinary ones.",
  },
  SHANI: {
    sanskrit: "शनि",
    title: "The Lord of Karma",
    planet: "Saturn",
    domain: "Discipline, karma, limitation, justice",
    symbol: "❄️",
    color: "#1f2937",
    lore: "Shani is the god of karma and consequence — slow, inevitable, cold. His gaze is feared above all others; legend says even the gods avert their eyes when Shani looks upon them. He does not destroy out of anger, but out of cosmic law. What Shani freezes, stays frozen until justice is served.",
    power: "Freeze — immobilise an enemy piece for 2 turns. The piece is locked in place, unable to move, attack, or escape. Even kings have cowered before Shani's gaze.",
  },
  RAHU: {
    sanskrit: "राहु",
    title: "The Shadow Planet",
    planet: "North Node of the Moon",
    domain: "Illusion, obsession, ambition, the eclipse",
    symbol: "🔮",
    color: "#9333ea",
    lore: "Rahu is the severed head of the demon Svarbhānu, who drank the nectar of immortality and was cut in two by Vishnu's discus. He exists without a body — a shadow that swallows the sun and moon during eclipses. Rahu governs obsession, foreign things, and the power to pass through what should stop you.",
    power: "Phase Walk — pass through other pieces for 2 moves. Like a shadow passing through walls, Rahu ignores blocking pieces entirely. An unstoppable ghost on the board.",
  },
  KETU: {
    sanskrit: "केतु",
    title: "The Dragon's Tail",
    planet: "South Node of the Moon",
    domain: "Liberation, sacrifice, mysticism, the past",
    symbol: "☄️",
    color: "#f97316",
    lore: "Ketu is the headless body of the same demon — a comet tail racing through the cosmos. Where Rahu obsesses over the future, Ketu represents release and liberation through sacrifice. He governs past karma, spiritual detachment, and the willingness to suffer now for transcendence later. Capturing Ketu's vessel is a curse in disguise.",
    power: "Martyr's Curse — if this piece is captured, you gain 12 seconds and your opponent loses 12. Ketu turns sacrifice into power. The enemy who takes this piece pays dearly for it.",
  },
};

export default function NavagrahaPage({ onBack }) {
  const [visible, setVisible] = useState(false);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Crimson+Pro:ital,wght@0,300;0,400;1,300;1,400&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }

        .ng-root {
          min-height: 100vh;
          background: #060810;
          color: #e8dfc8;
          font-family: 'Crimson Pro', Georgia, serif;
          overflow-x: hidden;
          position: relative;
        }
        .ng-stars {
          position: fixed; inset: 0; pointer-events: none; z-index: 0;
          background:
            radial-gradient(1px 1px at 12% 18%, #fff9 0%, transparent 100%),
            radial-gradient(1px 1px at 34% 72%, #fff6 0%, transparent 100%),
            radial-gradient(1px 1px at 58% 9%,  #fff8 0%, transparent 100%),
            radial-gradient(1px 1px at 76% 55%, #fff5 0%, transparent 100%),
            radial-gradient(1px 1px at 91% 33%, #fff7 0%, transparent 100%),
            radial-gradient(1px 1px at 23% 88%, #fff6 0%, transparent 100%),
            radial-gradient(1.5px 1.5px at 67% 81%, #fffb 0%, transparent 100%);
        }
        .ng-nav {
          position: sticky; top: 0; z-index: 100;
          display: flex; justify-content: space-between; align-items: center;
          padding: 16px 24px;
          background: rgba(6,8,16,0.88);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid rgba(255,215,100,0.1);
        }
        .ng-nav-logo {
          font-family: 'Cinzel', serif; font-size: 16px;
          color: #c8973a; letter-spacing: 0.08em; background: none; border: none; cursor: pointer;
        }
        .ng-nav-back {
          font-family: 'Cinzel', serif; font-size: 12px;
          letter-spacing: 0.12em; color: #060810; background: #c8973a;
          padding: 8px 20px; border-radius: 50px; border: none; cursor: pointer;
          transition: background 0.2s;
        }
        .ng-nav-back:hover { background: #e0aa44; }
        .ng-content {
          position: relative; z-index: 1;
          max-width: 860px; margin: 0 auto;
          padding: 0 20px 120px;
        }
        .ng-hero {
          text-align: center; padding: 72px 0 52px;
          border-bottom: 1px solid rgba(255,215,100,0.1);
        }
        .ng-eyebrow {
          font-family: 'Cinzel', serif; font-size: 11px;
          letter-spacing: 0.3em; color: #c8973a; text-transform: uppercase; margin-bottom: 16px;
        }
        .ng-hero-title {
          font-family: 'Cinzel', serif;
          font-size: clamp(34px, 7vw, 60px);
          font-weight: 700; line-height: 1.05;
          background: linear-gradient(135deg, #ffd966 0%, #f0a500 40%, #e8c87a 80%, #ffd966 100%);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
          margin-bottom: 14px;
        }
        .ng-hero-sub {
          font-size: 17px; font-style: italic; color: #a89060; letter-spacing: 0.04em;
        }
        .ng-divider {
          width: 60px; height: 2px;
          background: linear-gradient(90deg, transparent, #c8973a, transparent);
          margin: 24px auto 0;
        }
        .ng-intro {
          padding: 48px 0 32px;
          font-size: 17px; line-height: 1.85; color: #c8bfa8; font-weight: 300;
        }
        .ng-intro p + p { margin-top: 16px; }

        /* ── Card grid ── */
        .ng-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
          gap: 20px;
          padding: 20px 0 60px;
        }
        .ng-card {
          background: rgba(255,215,100,0.03);
          border: 1px solid rgba(255,215,100,0.1);
          border-radius: 16px;
          overflow: hidden;
          cursor: pointer;
          transition: border-color 0.25s, transform 0.2s, box-shadow 0.25s;
        }
        .ng-card:hover {
          transform: translateY(-3px);
        }
        .ng-card.open {
          grid-column: 1 / -1;
          cursor: default;
        }
        .ng-card-img-wrap {
          position: relative;
          height: 260px;
          overflow: hidden;
        }
        .ng-card.open .ng-card-img-wrap { height: 320px; }
        .ng-card-img {
          width: 100%; height: 100%; object-fit: cover;
          transition: transform 0.4s ease;
        }
        .ng-card:hover .ng-card-img { transform: scale(1.04); }
        .ng-card-img-gradient {
          position: absolute; inset: 0;
          background: linear-gradient(to bottom, transparent 40%, rgba(6,8,16,0.95) 100%);
        }
        .ng-card-header {
          position: absolute; bottom: 0; left: 0; right: 0;
          padding: 20px 20px 16px;
        }
        .ng-card-sanskrit {
          font-size: 11px; color: #c8973a; letter-spacing: 0.2em; margin-bottom: 4px;
        }
        .ng-card-name {
          font-family: 'Cinzel', serif;
          font-size: 22px; font-weight: 700; color: #f5e9c8;
          margin-bottom: 2px;
        }
        .ng-card-title {
          font-size: 13px; font-style: italic; color: #a89060;
        }
        .ng-card-body {
          padding: 20px 20px 24px;
        }
        .ng-domain-pills {
          display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 16px;
        }
        .ng-domain-pill {
          font-size: 10px; padding: 3px 8px;
          border-radius: 20px; border: 1px solid;
          font-family: 'Cinzel', serif; letter-spacing: 0.05em; text-transform: uppercase;
        }
        .ng-lore {
          font-size: 15px; line-height: 1.8; color: #c8bfa8;
          margin-bottom: 18px; font-weight: 300;
        }
        .ng-power-block {
          border-radius: 10px; padding: 14px 16px;
          border-left: 3px solid;
        }
        .ng-power-label {
          font-family: 'Cinzel', serif; font-size: 11px;
          letter-spacing: 0.2em; text-transform: uppercase;
          margin-bottom: 6px; opacity: 0.7;
        }
        .ng-power-name {
          font-family: 'Cinzel', serif; font-size: 16px;
          font-weight: 600; margin-bottom: 8px;
        }
        .ng-power-desc {
          font-size: 14px; line-height: 1.7; color: #b8b0a0;
        }
        .ng-expand-hint {
          text-align: center; padding: 10px 20px;
          font-size: 11px; color: #4a4030;
          font-family: 'Cinzel', serif; letter-spacing: 0.1em;
        }
        .ng-footer {
          text-align: center; padding: 40px 24px;
          font-size: 12px; color: #2a2218;
          font-family: 'Cinzel', serif; letter-spacing: 0.08em;
          border-top: 1px solid rgba(255,215,100,0.06);
        }
        .ng-fade-up {
          opacity: 0; transform: translateY(24px);
          transition: opacity 0.7s ease, transform 0.7s ease;
        }
        .ng-fade-up.show { opacity: 1; transform: translateY(0); }

        @media (max-width: 540px) {
          .ng-grid { grid-template-columns: 1fr; }
          .ng-card.open .ng-card-img-wrap { height: 240px; }
        }
      `}</style>

      <div className="ng-root">
        <div className="ng-stars" />

        <nav className="ng-nav">
          <button className="ng-nav-logo" onClick={onBack}>♟ CHESSURANGA</button>
          <button className="ng-nav-back" onClick={onBack}>← Back</button>
        </nav>

        <div className="ng-content">

          {/* Hero */}
          <header className={`ng-hero ng-fade-up ${visible ? "show" : ""}`}>
            <div className="ng-eyebrow">नवग्रह · The Nine Celestial Bodies</div>
            <h1 className="ng-hero-title">The Navagraha</h1>
            <p className="ng-hero-sub">Nine cosmic forces. Nine powers on the board.</p>
            <div className="ng-divider" />
          </header>

          {/* Intro */}
          <div className={`ng-intro ng-fade-up ${visible ? "show" : ""}`} style={{ transitionDelay: "0.15s" }}>
            <p>
              The <em>Navagraha</em> (नवग्रह) are the nine celestial bodies of Hindu cosmology —
              the seven classical planets plus the two shadow nodes of the Moon. They govern fate,
              time, and every aspect of earthly life. Astrologers have charted their movements for
              millennia to understand fortune and karma.
            </p>
            <p>
              In Chessuranga, each Graha descends onto the board as a power card. Place their
              <em> yantra</em> (energy tile) on any square, then move a piece into its radius to
              receive their blessing. Cards unlock as your pieces grow stronger — capture a pawn
              to awaken Tier 1, a knight or bishop for Tier 2, a rook or queen for Tier 3.
            </p>
            <p>
              Tap any card below to read its full legend.
            </p>
          </div>

          {/* Cards */}
          <div className={`ng-grid ng-fade-up ${visible ? "show" : ""}`} style={{ transitionDelay: "0.3s" }}>
            {SHARED_DECK.map(card => {
              const lore = GRAHA_LORE[card.id];
              if (!lore) return null;
              const isOpen = expanded === card.id;
              const tierLabel = card.tier === 1 ? "Tier I" : card.tier === 2 ? "Tier II" : "Tier III";
              return (
                <div
                  key={card.id}
                  className={`ng-card ${isOpen ? "open" : ""}`}
                  style={{
                    borderColor: isOpen ? `${card.color}55` : "rgba(255,215,100,0.1)",
                    boxShadow: isOpen ? `0 0 40px ${card.color}22` : "none",
                  }}
                  onClick={() => !isOpen && setExpanded(card.id)}
                >
                  <div className="ng-card-img-wrap">
                    <img src={card.image} alt={card.name} className="ng-card-img" />
                    <div className="ng-card-img-gradient" />
                    <div className="ng-card-header">
                      <div className="ng-card-sanskrit">{lore.sanskrit} · {tierLabel}</div>
                      <div className="ng-card-name">{lore.symbol} {card.name}</div>
                      <div className="ng-card-title">{lore.title}</div>
                    </div>
                  </div>

                  {isOpen ? (
                    <div className="ng-card-body">
                      {/* Domain pills */}
                      <div className="ng-domain-pills">
                        {lore.domain.split(", ").map(d => (
                          <span key={d} className="ng-domain-pill" style={{ color: card.color, borderColor: `${card.color}55`, backgroundColor: `${card.color}11` }}>
                            {d}
                          </span>
                        ))}
                      </div>

                      {/* Lore */}
                      <p className="ng-lore">{lore.lore}</p>

                      {/* Power block */}
                      <div className="ng-power-block" style={{ backgroundColor: `${card.color}0d`, borderColor: card.color }}>
                        <div className="ng-power-label" style={{ color: card.color }}>Chess Power · {card.cost}s cost</div>
                        <div className="ng-power-name" style={{ color: card.color }}>{card.name}'s {card.description.split("—")[0].trim()}</div>
                        <div className="ng-power-desc">{lore.power}</div>
                      </div>

                      {/* Close */}
                      <div style={{ textAlign: "center", marginTop: "20px" }}>
                        <button
                          onClick={e => { e.stopPropagation(); setExpanded(null); }}
                          style={{ background: "none", border: "1px solid rgba(255,215,100,0.2)", color: "#a89060", borderRadius: "20px", padding: "8px 20px", cursor: "pointer", fontFamily: "'Cinzel', serif", fontSize: "11px", letterSpacing: "0.1em" }}
                        >
                          ↑ Collapse
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="ng-expand-hint">{lore.domain.split(", ")[0]} · Tap to reveal</div>
                  )}
                </div>
              );
            })}
            {/* ── Asura Section ── */}
            <div className={`ng-fade-up ${visible ? "show" : ""}`} style={{ transitionDelay: "0.5s", margin: "60px 0 0", borderTop: "1px solid rgba(255,80,50,0.15)", paddingTop: "48px" }}>
              <div style={{ textAlign: "center", marginBottom: "32px" }}>
                <div style={{ fontFamily: "'Cinzel', serif", fontSize: "11px", letterSpacing: "0.3em", color: "#c0522a", textTransform: "uppercase", marginBottom: "12px", opacity: 0.8 }}>असुर · The Demon Lords</div>
                <h2 style={{ fontFamily: "'Cinzel', serif", fontSize: "clamp(22px, 5vw, 36px)", fontWeight: 700, color: "#e87050", marginBottom: "16px" }}>The Asura</h2>
                <p style={{ fontSize: "15px", color: "#a08070", maxWidth: "560px", margin: "0 auto", lineHeight: 1.8, fontStyle: "italic" }}>
                  Nine demon lords drawn from the great epics — the Ramayana, the Mahabharata, the Puranas. Where the Navagraha offer cosmic blessing, the Asura bring raw power, cunning, and chaos.
                </p>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
                {[
                  { emoji: "👑", name: "Ravana", sanskrit: "रावण", domain: "King of Lanka, lord of ten heads", power: "Ten-Headed Queen — moves like a queen for one turn" },
                  { emoji: "🛡️", name: "Hiranyakashipu", sanskrit: "हिरण्यकशिपु", domain: "The golden-armoured, granted invincibility by Brahma", power: "Brahma's Boon — cannot be captured for 2 turns" },
                  { emoji: "💫", name: "Shukracharya", sanskrit: "शुक्राचार्य", domain: "Guru of the Asuras, master of dark resurrection", power: "Dark Resurrection — pawns promote to any captured piece type at the halfway rank" },
                  { emoji: "🐃", name: "Mahishasura", sanskrit: "महिषासुर", domain: "The buffalo demon, conqueror of the heavens", power: "Shapeshift — transform into any piece type you have already captured" },
                  { emoji: "🙏", name: "Bali", sanskrit: "बलि", domain: "Noble demon king, master of sacrifice and return", power: "Demon's Grace — resurrect a captured piece where it fell" },
                  { emoji: "👥", name: "Shumbha-Nishumbha", sanskrit: "शुम्भ-निशुम्भ", domain: "The twin demon generals who shook the cosmos", power: "Twin Strike — capture an enemy then snap back to your origin square" },
                  { emoji: "💀", name: "Tarakasura", sanskrit: "तारकासुर", domain: "The star demon, nearly impossible to destroy", power: "Type Lock — can only be captured by a piece of the same type for 3 turns" },
                  { emoji: "⚔️", name: "Kali", sanskrit: "काली", domain: "Goddess of destruction, beyond all rule and reason", power: "Wrathful Smite — capture any adjacent piece, ignoring all movement rules" },
                  { emoji: "🐍", name: "Vritra", sanskrit: "वृत्र", domain: "The serpent of drought, who sealed the rivers of heaven", power: "Rank Blockade — enemy pieces cannot cross this piece's rank for 2 turns" },
                ].map(a => (
                  <div key={a.name} style={{ backgroundColor: "rgba(180,50,20,0.06)", border: "1px solid rgba(200,80,40,0.15)", borderRadius: "12px", padding: "18px 20px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "10px" }}>
                      <span style={{ fontSize: "24px" }}>{a.emoji}</span>
                      <div>
                        <div style={{ fontFamily: "'Cinzel', serif", fontSize: "15px", color: "#e87050", fontWeight: 600 }}>{a.name}</div>
                        <div style={{ fontSize: "11px", color: "#7a5040", letterSpacing: "0.05em" }}>{a.sanskrit}</div>
                      </div>
                    </div>
                    <div style={{ fontSize: "13px", color: "#906050", marginBottom: "8px", fontStyle: "italic" }}>{a.domain}</div>
                    <div style={{ fontSize: "13px", color: "#c87050", borderLeft: "2px solid rgba(200,80,40,0.3)", paddingLeft: "10px" }}>{a.power}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <footer className="ng-footer">
          ♟ CHESSURANGA — May the Navagraha guide your moves
          <br />
          <span style={{ fontSize: "11px", opacity: 0.5 }}>© {new Date().getFullYear()} Chessuranga. All rights reserved.</span>
        </footer>
      </div>
    </>
  );
}