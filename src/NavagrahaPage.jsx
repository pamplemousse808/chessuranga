import { useEffect, useState } from "react";
import { SHARED_DECK, ASURA_DECK } from "./gameConstants";

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
const ASURA_LORE_LIST = [
  {
    id: "RAVANA",
    name: "Ravana", sanskrit: "रावण", symbol: "👑",
    title: "King of Lanka", color: "#8B0000",
    domain: "Sovereignty, ten-headed genius, sorcery, conquest",
    image: "/images/ravana.jpg",
    lore: "Ravana was the greatest king Lanka ever knew — scholar, warrior, and devotee of Shiva, possessed of ten heads each holding the knowledge of a lifetime. He was not merely a demon; he was the finest mind of his age, whose pride alone brought him low. On the chessboard, Ravana sees every direction at once.",
    powerName: "Ten-Headed Queen",
    power: "The selected piece moves like a queen for one full turn — any direction, any distance. Ten heads, ten perspectives, one unstoppable move.",
  },
  {
    id: "HIRANYA",
    name: "Hiranyakashipu", sanskrit: "हिरण्यकशिपु", symbol: "🛡️",
    title: "The Golden-Armoured", color: "#B8860B",
    domain: "Invincibility, divine defiance, iron will, cosmic pride",
    image: "/images/hiranyakasipu.jpg",
    lore: "Hiranyakashipu performed tapas so severe that Brahma himself was forced to grant him a boon of near-total invincibility — not killed by man nor beast, not by day nor night, not inside nor outside. He ruled the cosmos until Vishnu found the one crack in that armour. Until then, no force could touch him.",
    powerName: "Brahma's Boon",
    power: "The piece cannot be captured for 2 turns. Every attack slides off. Enemies must simply wait — and hope the boon expires before it's too late.",
  },
  {
    id: "SHUKRA_ASURA",
    name: "Shukracharya", sanskrit: "शुक्राचार्य", symbol: "💫",
    title: "Guru of the Asuras", color: "#C2185B",
    domain: "Dark resurrection, forbidden knowledge, transformation, time",
    image: "/images/shukracharya.jpg",
    lore: "Shukracharya alone holds the Mritasanjivani — the secret mantra that defeats death itself. Guru of all demons, he taught them every art, every stratagem. He is the reason the Asuras survive catastrophe after catastrophe. His greatest weapon is the art of becoming something the enemy never expected.",
    powerName: "Mirror Ascension",
    power: "Apply to a pawn — it transforms into the first enemy piece on its file. Shukracharya doesn't promote pawns. He replaces them with something worse.",
  },
  {
    id: "MAHISHA",
    name: "Mahishasura", sanskrit: "महिषासुर", symbol: "🐃",
    title: "The Buffalo Demon", color: "#2D5A1B",
    domain: "Shapeshifting, conquest, unstoppable force, divine defiance",
    image: "/images/mahishasura.jpg",
    lore: "Mahishasura conquered the heavens by changing shape faster than the gods could strike. Buffalo, lion, man, elephant — he was every creature at once, and none. It took Durga herself, fighting for nine days and nights, to finally pin him down. His power is the power of being impossible to predict.",
    powerName: "Shapeshift",
    power: "Transform into any piece type you have already captured from your opponent. The piece moves immediately in its new form. Become what you have already overcome.",
  },
  {
    id: "BALI",
    name: "Bali", sanskrit: "बलि", symbol: "🙏",
    title: "The Noble King", color: "#6B3FA0",
    domain: "Sacrifice, generosity, death and return, cosmic honour",
    image: "/images/bali.jpg",
    lore: "Bali was so righteous that Vishnu himself had to intervene to stop his rule — disguised as a dwarf, Vamana, begging for three steps of land before growing to encompass the universe. Even then, Bali gave willingly. His nobility was such that Vishnu granted him sovereignty over the underworld. Death is not the end for one so honoured.",
    powerName: "Demon's Grace",
    power: "Resurrect one of your captured pieces on the square where it fell. The returned piece is ready to move immediately — Bali's grace restores without hesitation.",
  },
  {
    id: "SHUMBHA",
    name: "Shumbha-Nishumbha", sanskrit: "शुम्भ-निशुम्भ", symbol: "👥",
    title: "The Twin Generals", color: "#7A3B00",
    domain: "Dual nature, guerrilla warfare, strike and vanish, chaos",
    image: "/images/shumbhanishumbha.jpg",
    lore: "Shumbha and Nishumbha were the twin demon generals who drove the gods from heaven and seized the cosmos. They fought not with brute force alone but with cunning — striking from unexpected angles, retreating before the counterattack could land. Together they were nearly impossible to pin down, two minds acting as one terrible weapon.",
    powerName: "Twin Strike",
    power: "The piece captures an adjacent enemy then immediately snaps back to its origin square. Strike and vanish — the enemy is gone, and you are exactly where you were.",
  },
  {
    id: "TARAKA",
    name: "Tarakasura", sanskrit: "तारकासुर", symbol: "💀",
    title: "The Star Demon", color: "#555555",
    domain: "Near-invincibility, cosmic terror, divine weakness, endurance",
    image: "/images/tarakasura.jpg",
    lore: "Tarakasura received a boon that only the son of Shiva could ever destroy him — and Shiva had sworn celibacy. For an age, Tarakasura was effectively immortal, terrorising the heavens with impunity. He could only be harmed by one specific kind of being. The gods had to engineer Kartikeya's very birth to end his reign.",
    powerName: "Type Lock",
    power: "For 3 turns, this piece can only be captured by an enemy piece of the same type. A pawn can only fall to a pawn. A rook only to a rook. Choose your protector wisely.",
  },
  {
    id: "KALI_ASURA",
    name: "Kali", sanskrit: "काली", symbol: "⚔️",
    title: "The Dark Mother", color: "#4A0E4E",
    domain: "Destruction, liberation, divine fury, the end of all things",
    image: "/images/kali.jpg",
    lore: "Kali is not a demon — she is the goddess of destruction herself, born from Durga's fury when the battle against Raktabija grew desperate. She drank the demon's blood before it could touch the ground and multiply. She dances on corpses. She wears a garland of severed heads. She operates beyond every rule chess has ever known.",
    powerName: "Wrathful Smite",
    power: "Capture any adjacent enemy piece — no movement rules apply. Kali doesn't care whether a bishop moves diagonally or a rook in straight lines. If it's next to her, it dies.",
  },
  {
    id: "VRITRA",
    name: "Vritra", sanskrit: "वृत्र", symbol: "🐍",
    title: "The Serpent of Drought", color: "#0A2A4A",
    domain: "Blockade, cosmic obstruction, the sealed horizon, control",
    image: "/images/vritra.jpg",
    lore: "Vritra was the great serpent who coiled around the rivers of heaven and sealed them, plunging the world into drought. Not even Indra, king of the gods, could break through — until Vishnu intervened and Indra struck with a thunderbolt made of sage Dadhichi's bones. Vritra does not fight. He simply blocks, and the world withers.",
    powerName: "Rank Blockade",
    power: "For 2 turns, no enemy piece can enter or cross this piece's rank. The entire row becomes a wall. Plan your advance, because no one is getting through.",
  },
];
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
          <section className={`ng-fade-up ${visible ? "show" : ""}`} style={{ transitionDelay: "0.5s", marginTop: "80px" }}>
            <div style={{ textAlign: "center", marginBottom: "48px", borderTop: "1px solid rgba(255,80,50,0.15)", paddingTop: "56px" }}>
              <div style={{ fontFamily: "'Cinzel', serif", fontSize: "11px", letterSpacing: "0.3em", color: "#c0522a", textTransform: "uppercase", marginBottom: "12px", opacity: 0.8 }}>असुर · The Demon Lords</div>
              <h2 style={{ fontFamily: "'Cinzel', serif", fontSize: "clamp(28px, 6vw, 48px)", fontWeight: 700, lineHeight: 1.05, background: "linear-gradient(135deg, #ff6b3d 0%, #c0391b 40%, #e8603a 80%, #ff6b3d 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", marginBottom: "14px" }}>The Asura</h2>
              <p style={{ fontSize: "17px", fontStyle: "italic", color: "#a08070", maxWidth: "560px", margin: "0 auto 8px", lineHeight: 1.8 }}>
                Nine demon lords drawn from the great epics. Where the Navagraha offer cosmic blessing, the Asura bring raw power, cunning, and chaos.
              </p>
              <div style={{ width: "60px", height: "2px", background: "linear-gradient(90deg, transparent, #c0522a, transparent)", margin: "24px auto 0" }} />
            </div>

            <div className="ng-grid">
              {ASURA_LORE_LIST.map(a => {
                const isOpen = expanded === a.id;
                const card = ASURA_DECK.find(c => c.id === a.id);
                const tierLabel = card?.tier === 1 ? "Tier I" : card?.tier === 2 ? "Tier II" : "Tier III";
                return (
                  <div
                    key={a.id}
                    className={`ng-card ${isOpen ? "open" : ""}`}
                    style={{
                      borderColor: isOpen ? `${a.color}55` : "rgba(255,80,50,0.12)",
                      boxShadow: isOpen ? `0 0 40px ${a.color}22` : "none",
                    }}
                    onClick={() => !isOpen && setExpanded(a.id)}
                  >
                    <div className="ng-card-img-wrap">
                      <img src={a.image} alt={a.name} className="ng-card-img" />
                      <div className="ng-card-img-gradient" style={{ background: "linear-gradient(to bottom, transparent 40%, rgba(6,4,4,0.97) 100%)" }} />
                      <div className="ng-card-header">
                        <div className="ng-card-sanskrit" style={{ color: "#c0522a" }}>{a.sanskrit} · {tierLabel}</div>
                        <div className="ng-card-name">{a.symbol} {a.name}</div>
                        <div className="ng-card-title">{a.title}</div>
                      </div>
                    </div>

                    {isOpen ? (
                      <div className="ng-card-body">
                        <div className="ng-domain-pills">
                          {a.domain.split(", ").map(d => (
                            <span key={d} className="ng-domain-pill" style={{ color: a.color, borderColor: `${a.color}55`, backgroundColor: `${a.color}11` }}>
                              {d}
                            </span>
                          ))}
                        </div>
                        <p className="ng-lore">{a.lore}</p>
                        <div className="ng-power-block" style={{ backgroundColor: `${a.color}0d`, borderColor: a.color }}>
                          <div className="ng-power-label" style={{ color: a.color }}>Chess Power · {card?.cost}s cost</div>
                          <div className="ng-power-name" style={{ color: a.color }}>{a.powerName}</div>
                          <div className="ng-power-desc">{a.power}</div>
                        </div>
                        <div style={{ textAlign: "center", marginTop: "20px" }}>
                          <button
                            onClick={e => { e.stopPropagation(); setExpanded(null); }}
                            style={{ background: "none", border: "1px solid rgba(255,80,50,0.2)", color: "#a08070", borderRadius: "20px", padding: "8px 20px", cursor: "pointer", fontFamily: "'Cinzel', serif", fontSize: "11px", letterSpacing: "0.1em" }}
                          >
                            ↑ Collapse
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="ng-expand-hint" style={{ color: "#5a3020" }}>{a.domain.split(", ")[0]} · Tap to reveal</div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
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