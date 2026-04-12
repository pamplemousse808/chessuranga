import { useEffect, useState } from "react";

const NAVAGRAHA = [
  { emoji: "☀️", name: "Surya", role: "The Sun", power: "Invincibility" },
  { emoji: "🌙", name: "Chandra", role: "The Moon", power: "Clones" },
  { emoji: "🔥", name: "Mangala", role: "Mars", power: "Smite" },
  { emoji: "⚡", name: "Budha", role: "Mercury", power: "Double Move" },
  { emoji: "🪐", name: "Guru", role: "Jupiter", power: "Resurrection" },
  { emoji: "💫", name: "Shukra", role: "Venus", power: "Time Harvest" },
  { emoji: "❄️", name: "Shani", role: "Saturn", power: "Freeze" },
  { emoji: "🔮", name: "Rahu", role: "North Node", power: "Phase Walk" },
  { emoji: "☄️", name: "Ketu", role: "South Node", power: "Martyr's Curse" },
];

export default function AboutPage({ onBack }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Crimson+Pro:ital,wght@0,300;0,400;1,300;1,400&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        .about-root {
          min-height: 100vh;
          background: #060810;
          color: #e8dfc8;
          font-family: 'Crimson Pro', Georgia, serif;
          overflow-x: hidden;
          position: relative;
        }

        /* ── starfield ── */
        .stars {
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 0;
          background:
            radial-gradient(1px 1px at 12% 18%, #fff9 0%, transparent 100%),
            radial-gradient(1px 1px at 34% 72%, #fff6 0%, transparent 100%),
            radial-gradient(1px 1px at 58% 9%,  #fff8 0%, transparent 100%),
            radial-gradient(1px 1px at 76% 55%, #fff5 0%, transparent 100%),
            radial-gradient(1px 1px at 91% 33%, #fff7 0%, transparent 100%),
            radial-gradient(1px 1px at 23% 88%, #fff6 0%, transparent 100%),
            radial-gradient(1px 1px at 47% 44%, #fff4 0%, transparent 100%),
            radial-gradient(1.5px 1.5px at 67% 81%, #fffb 0%, transparent 100%),
            radial-gradient(1px 1px at 5%  62%, #fff5 0%, transparent 100%),
            radial-gradient(1px 1px at 83% 14%, #fff8 0%, transparent 100%);
        }

        .content {
          position: relative;
          z-index: 1;
          max-width: 760px;
          margin: 0 auto;
          padding: 0 24px 120px;
        }

        /* ── fade in ── */
        .fade-up {
          opacity: 0;
          transform: translateY(28px);
          transition: opacity 0.8s ease, transform 0.8s ease;
        }
        .fade-up.show { opacity: 1; transform: translateY(0); }
        .delay-1 { transition-delay: 0.15s; }
        .delay-2 { transition-delay: 0.3s; }
        .delay-3 { transition-delay: 0.45s; }
        .delay-4 { transition-delay: 0.6s; }
        .delay-5 { transition-delay: 0.75s; }
        .delay-6 { transition-delay: 0.9s; }

        /* ── hero ── */
        .hero {
          text-align: center;
          padding: 80px 0 60px;
          border-bottom: 1px solid rgba(255,215,100,0.12);
        }
        .hero-eyebrow {
          font-family: 'Cinzel', serif;
          font-size: 11px;
          letter-spacing: 0.3em;
          color: #c8973a;
          text-transform: uppercase;
          margin-bottom: 20px;
        }
        .hero-title {
          font-family: 'Cinzel', serif;
          font-size: clamp(38px, 8vw, 72px);
          font-weight: 700;
          line-height: 1.05;
          background: linear-gradient(135deg, #ffd966 0%, #f0a500 40%, #e8c87a 80%, #ffd966 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 16px;
          text-shadow: none;
        }
        .hero-sub {
          font-size: 18px;
          font-style: italic;
          color: #a89060;
          letter-spacing: 0.04em;
        }
        .hero-divider {
          width: 60px;
          height: 2px;
          background: linear-gradient(90deg, transparent, #c8973a, transparent);
          margin: 28px auto 0;
        }

        /* ── sections ── */
        .section {
          padding: 56px 0;
          border-bottom: 1px solid rgba(255,215,100,0.08);
        }
        .section:last-of-type { border-bottom: none; }

        .section-label {
          font-family: 'Cinzel', serif;
          font-size: 10px;
          letter-spacing: 0.35em;
          color: #c8973a;
          text-transform: uppercase;
          margin-bottom: 20px;
          opacity: 0.7;
        }
        .section-title {
          font-family: 'Cinzel', serif;
          font-size: clamp(22px, 4vw, 32px);
          font-weight: 600;
          color: #f5e9c8;
          margin-bottom: 24px;
          line-height: 1.25;
        }
        .section-body {
          font-size: 18px;
          line-height: 1.85;
          color: #c8bfa8;
          font-weight: 300;
        }
        .section-body p + p { margin-top: 18px; }
        .section-body em {
          color: #e8c87a;
          font-style: italic;
        }
        .section-body strong {
          color: #f0dda0;
          font-weight: 400;
        }

        /* ── pull quote ── */
        .pull-quote {
          margin: 40px 0;
          padding: 28px 36px;
          border-left: 3px solid #c8973a;
          background: rgba(200,151,58,0.06);
          border-radius: 0 12px 12px 0;
        }
        .pull-quote p {
          font-size: 20px;
          font-style: italic;
          line-height: 1.7;
          color: #e8d8a8;
        }

        /* ── navagraha grid ── */
        .graha-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
          margin-top: 32px;
        }
        @media (max-width: 520px) {
          .graha-grid { grid-template-columns: repeat(3, 1fr); gap: 8px; }
        }
        .graha-card {
          background: rgba(255,215,100,0.04);
          border: 1px solid rgba(255,215,100,0.12);
          border-radius: 12px;
          padding: 16px 12px;
          text-align: center;
          transition: background 0.2s, border-color 0.2s, transform 0.2s;
        }
        .graha-card:hover {
          background: rgba(255,215,100,0.09);
          border-color: rgba(255,215,100,0.3);
          transform: translateY(-2px);
        }
        .graha-emoji { font-size: 26px; margin-bottom: 8px; }
        .graha-name {
          font-family: 'Cinzel', serif;
          font-size: 13px;
          color: #f0dda0;
          margin-bottom: 2px;
        }
        .graha-role {
          font-size: 11px;
          color: #7a6e58;
          margin-bottom: 6px;
        }
        .graha-power {
          font-size: 11px;
          color: #c8973a;
          font-style: italic;
        }

        /* ── modes ── */
        .modes {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
          margin-top: 28px;
        }
        .mode-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,215,100,0.1);
          border-radius: 14px;
          padding: 24px 20px;
        }
        .mode-icon { font-size: 28px; margin-bottom: 10px; }
        .mode-name {
          font-family: 'Cinzel', serif;
          font-size: 14px;
          color: #f0dda0;
          margin-bottom: 8px;
        }
        .mode-desc {
          font-size: 14px;
          color: #8a8070;
          line-height: 1.6;
        }

        /* ── kofi ── */
        .kofi-section {
          text-align: center;
          padding: 64px 0 40px;
        }
        .kofi-title {
          font-family: 'Cinzel', serif;
          font-size: 22px;
          color: #f5e9c8;
          margin-bottom: 14px;
        }
        .kofi-body {
          font-size: 17px;
          color: #8a7e68;
          margin-bottom: 32px;
          line-height: 1.7;
          max-width: 480px;
          margin-left: auto;
          margin-right: auto;
        }
        .kofi-btn {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          background: #c8973a;
          color: #060810;
          font-family: 'Cinzel', serif;
          font-size: 15px;
          font-weight: 600;
          letter-spacing: 0.06em;
          padding: 16px 36px;
          border-radius: 50px;
          text-decoration: none;
          border: none;
          cursor: pointer;
          transition: background 0.2s, transform 0.15s, box-shadow 0.2s;
          box-shadow: 0 0 30px rgba(200,151,58,0.25);
        }
        .kofi-btn:hover {
          background: #e0aa44;
          transform: translateY(-2px);
          box-shadow: 0 0 40px rgba(200,151,58,0.4);
        }

        /* ── nav ── */
        .top-nav {
          position: sticky;
          top: 0;
          z-index: 100;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 24px;
          background: rgba(6,8,16,0.85);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid rgba(255,215,100,0.08);
        }
        .nav-logo {
          font-family: 'Cinzel', serif;
          font-size: 16px;
          color: #c8973a;
          text-decoration: none;
          letter-spacing: 0.08em;
        }
        .nav-play {
          font-family: 'Cinzel', serif;
          font-size: 12px;
          letter-spacing: 0.12em;
          color: #060810;
          background: #c8973a;
          padding: 8px 20px;
          border-radius: 50px;
          text-decoration: none;
          transition: background 0.2s;
        }
        .nav-play:hover { background: #e0aa44; }

        /* ── footer ── */
        .footer {
          text-align: center;
          padding: 40px 24px;
          font-size: 13px;
          color: #3a3428;
          font-family: 'Cinzel', serif;
          letter-spacing: 0.08em;
          border-top: 1px solid rgba(255,215,100,0.06);
        }
      `}</style>

      <div className="about-root">
        <div className="stars" />

        <nav className="top-nav">
          <button onClick={onBack} style={{ background: "none", border: "none", cursor: "pointer", fontFamily: "'Cinzel', serif", fontSize: "16px", color: "#c8973a", letterSpacing: "0.08em" }}>
            ♟ CHESSURANGA
          </button>
          <button onClick={onBack} className="nav-play">
            ← Back
          </button>
        </nav>

        <div className="content">

          {/* Hero */}
          <header className={`hero fade-up ${visible ? "show" : ""}`}>
            <h1 className="hero-title">Chessuranga</h1>
            <p className="hero-sub">Where the cosmos plays chess</p>
            <div className="hero-divider" />
          </header>

          {/* Origins */}
          <section className={`section fade-up delay-1 ${visible ? "show" : ""}`}>
            <div className="section-label">Origins</div>
            <div className="section-body">
              <p>
                Around the 6th century, in the courts of the Gupta Empire, <em> Chaturanga</em> was played on an 8×8 board called an <em>Ashtāpada</em>.
                It encompassed the four branches of the ancient Indian army; the infantry, cavalry, elephants and chariots. And because it was a banger of a game, it spread westward through Persia as
                Shatranj, then into Europe, becoming the chess we know today.
              </p>
              <p>
                When I was thinking about chess with special moves, why not go back to the start, and add an entire pantheon of gods.
              </p>

              <div className="pull-quote">
                <p>
                  "The nine celestial bodies of Hindu cosmology — the <strong>Navagraha</strong> —
                  each govern a domain of existence: time, fate, war, wisdom, fortune. All the aspects that decides whether you win or lose."
                </p>
              </div>

              <p>
                The <strong>Navagraha</strong> (नवग्रह, "nine celestial bodies") are the cosmic
                forces in Hindu astronomy and astrology: Surya the Sun, Chandra the Moon,
                Mangala (Mars), Budha (Mercury), Guru (Jupiter), Shukra (Venus), Shani (Saturn),
                and the shadow planets Rahu and Ketu. Each carries its own domain of influence —
                light, time, war, wisdom, fortune, discipline, illusion. Together, they shape existence.
              </p>
              <p>
                Chessuranga lets you call on their powers to overcome your oppoenent.
              </p>
            </div>
          </section>

          {/* The Nine */}
          <section className={`section fade-up delay-2 ${visible ? "show" : ""}`}>
            <div className="section-label">The Powers</div>
            <h2 className="section-title">The Nine Grahas</h2>
            <div className="graha-grid">
              {NAVAGRAHA.map(g => (
                <div className="graha-card" key={g.name}>
                  <div className="graha-emoji">{g.emoji}</div>
                  <div className="graha-name">{g.name}</div>
                  <div className="graha-role">{g.role}</div>
                  <div className="graha-power">{g.power}</div>
                </div>
              ))}
            </div>
          </section>

          {/* How it was made */}
          <section className={`section fade-up delay-3 ${visible ? "show" : ""}`}>
            <div className="section-label">The Making</div>
            <h2 className="section-title">Two games, one idea and a few weeks of wtf is vercel.</h2>
            <div className="section-body">
              <p>
                I've always been obsessed with games, thinking about wouldn't it be cool if you could do this or that. About 18 months ago, I was playing a lot of <em> Marvel Snap</em> and bullet chess, and thought it would amazing if you could combine the two.
              </p>
              <p>
                But I can't code at all, so it was just a pipe dream. Then Claude Code dropped and here we are.
              </p>
            </div>
          </section>

          {/* Modes */}
          <section className={`section fade-up delay-4 ${visible ? "show" : ""}`}>
            <div className="section-label">The Game</div>
            <h2 className="section-title">Three ways to play</h2>
            <div className="modes">
              <div className="mode-card">
                <div className="mode-icon">👹</div>
                <div className="mode-name">Asura Horde</div>
                <div className="mode-desc">Face an endless demon army that regenerates with every capture. Survive long enough to overwhelm them completely.</div>
              </div>
              <div className="mode-card">
                <div className="mode-icon">☄️</div>
                <div className="mode-name">Shukracharya</div>
                <div className="mode-desc">A 1v1 duel against Shukracharya, Guru of the Asuras — the mastermind behind the horde. Your toughest test.</div>
              </div>
              <div className="mode-card">
                <div className="mode-icon">🌟</div>
                <div className="mode-name">Daily Puzzle</div>
                <div className="mode-desc">A new Navagraha-powered chess puzzle every day. Solve it in as few moves as possible.</div>
              </div>
            </div>
          </section>

          {/* Feedback */}
          <section className={`section fade-up delay-6 ${visible ? "show" : ""}`} style={{ textAlign: "center", borderBottom: "none" }}>
            <div className="section-label">Stay in Touch</div>
            <div className="section-body" style={{ maxWidth: "480px", margin: "0 auto" }}>
              <p>
                I initially wanted to make Chessuranga a 1v1, 100 second multiplayer game. But the coding and resources for that is bananas, and way beyond me. But if you know a way to make this happen, let me know!
                Also do get in touch if you've spotted a bug or just want to tell me Guru is OP.
              </p>
              <p style={{ marginTop: "20px" }}>
                <a
                  href="https://www.linkedin.com/in/jmewhyte/"
                  style={{ color: "#c8973a", textDecoration: "none", fontStyle: "italic", fontSize: "24px" }}
                >
                  Say hi!
                </a>
              </p>
            </div>
          </section>

          <section className={`kofi-section fade-up delay-5 ${visible ? "show" : ""}`}>
            <h2 className="kofi-title">Realtime bullet chess amabitions</h2>
            <p className="kofi-body">
              And if you like the game and want to help fund the servers, or help me make the multiplayer and hire a designer for actual art, here's a button...</p>
            { }
            <button
              onClick={async () => {
                try {
                  const { Browser } = await import('@capacitor/browser');
                  await Browser.open({ url: 'https://ko-fi.com/chessuranga' });
                } catch {
                  window.open('https://ko-fi.com/chessuranga', '_blank');
                }
              }}
              className="kofi-btn"
            >
              ☕ Fuel the Navagraha
            </button>
          </section>
        </div>

        <footer className="footer">
          ♟ CHESSURANGA — May the Navagraha guide your moves
          <br />
          <span style={{ fontSize: "11px", opacity: 0.5 }}>© {new Date().getFullYear()} Chessuranga. All rights reserved.</span>
        </footer>
      </div>
    </>
  );
}