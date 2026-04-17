import { useEffect, useState } from "react";

export default function HowToPlay({ onBack }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => { const t = setTimeout(() => setVisible(true), 80); return () => clearTimeout(t); }, []);

  const section = (delay, children) => (
    <section className={`htp-section fade-up delay-${delay} ${visible ? "show" : ""}`}>{children}</section>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Crimson+Pro:ital,wght@0,300;0,400;1,300;1,400&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .htp-root { min-height: 100vh; background: #060810; color: #e8dfc8; font-family: 'Crimson Pro', Georgia, serif; overflow-x: hidden; position: relative; }
        .stars { position: fixed; inset: 0; pointer-events: none; z-index: 0;
          background: radial-gradient(1px 1px at 12% 18%, #fff9 0%, transparent 100%),
            radial-gradient(1px 1px at 34% 72%, #fff6 0%, transparent 100%),
            radial-gradient(1px 1px at 58% 9%, #fff8 0%, transparent 100%),
            radial-gradient(1px 1px at 76% 55%, #fff5 0%, transparent 100%),
            radial-gradient(1px 1px at 91% 33%, #fff7 0%, transparent 100%),
            radial-gradient(1px 1px at 23% 88%, #fff6 0%, transparent 100%); }
        .htp-nav { position: sticky; top: 0; z-index: 10; display: flex; align-items: center; justify-content: space-between; padding: 16px 24px; background: rgba(6,8,16,0.85); backdrop-filter: blur(12px); border-bottom: 1px solid rgba(255,215,100,0.1); }
        .htp-nav-title { font-family: 'Jaini Purva', serif; font-size: 13px; letter-spacing: 0.2em; color: #c8973a; text-transform: uppercase; }
        .htp-nav-back { font-family: 'Cinzel', serif; font-size: 12px; letter-spacing: 0.12em; color: #060810; background: #c8973a; padding: 8px 20px; border-radius: 50px; border: none; cursor: pointer; }
        .htp-content { position: relative; z-index: 1; max-width: 760px; margin: 0 auto; padding: 0 24px 120px; }
        .htp-hero { text-align: center; padding: 64px 0 48px; border-bottom: 1px solid rgba(255,215,100,0.12); }
        .htp-hero-title { font-family: 'Jaini Purva', serif; font-size: clamp(32px, 7vw, 60px); font-weight: 700; background: linear-gradient(135deg, #ffd966 0%, #f0a500 40%, #e8c87a 80%, #ffd966 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; margin-bottom: 16px; }
        .htp-hero-sub { font-size: 18px; font-style: italic; color: #a89060; }
        .htp-divider { width: 60px; height: 2px; background: linear-gradient(90deg, transparent, #c8973a, transparent); margin: 24px auto 0; }
        .fade-up { opacity: 0; transform: translateY(28px); transition: opacity 0.8s ease, transform 0.8s ease; }
        .fade-up.show { opacity: 1; transform: translateY(0); }
        .delay-1 { transition-delay: 0.15s; } .delay-2 { transition-delay: 0.3s; } .delay-3 { transition-delay: 0.45s; } .delay-4 { transition-delay: 0.6s; } .delay-5 { transition-delay: 0.75s; } .delay-6 { transition-delay: 0.9s; }
        .htp-section { padding: 40px 0; border-bottom: 1px solid rgba(255,215,100,0.08); }
        .htp-section:last-child { border-bottom: none; }
        .section-label { font-family: 'Cinzel', serif; font-size: 10px; letter-spacing: 0.3em; color: #c8973a; text-transform: uppercase; margin-bottom: 10px; }
        .section-title { font-family: 'Cinzel', serif; font-size: 22px; color: #f5e9c8; margin-bottom: 16px; }
        .section-body { font-size: 17px; color: #8a7e68; line-height: 1.8; }
        .section-body p + p { margin-top: 14px; }
        .mode-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 14px; margin-top: 20px; }
        .mode-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,215,100,0.1); border-radius: 14px; padding: 20px 16px; }
        .mode-icon { font-size: 24px; margin-bottom: 8px; }
        .mode-name { font-family: 'Cinzel', serif; font-size: 13px; color: #f0dda0; margin-bottom: 6px; }
        .mode-desc { font-size: 13px; color: #8a8070; line-height: 1.6; }
        .unlock-row { display: flex; align-items: center; gap: 12px; padding: 10px 0; border-bottom: 1px solid rgba(255,215,100,0.06); font-size: 16px; color: #8a7e68; }
        .unlock-row:last-child { border-bottom: none; }
        .unlock-tier { font-family: 'Cinzel', serif; font-size: 11px; color: #c8973a; margin-left: auto; white-space: nowrap; }
        .layout-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-top: 16px; }
        .layout-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,215,100,0.1); border-radius: 14px; padding: 20px 16px; }
        .layout-title { font-family: 'Cinzel', serif; font-size: 13px; color: #f0dda0; margin-bottom: 10px; }
        .layout-body { font-size: 14px; color: #8a8070; line-height: 1.7; }
        .highlight-box { background: rgba(200,151,58,0.08); border: 1px solid rgba(200,151,58,0.25); border-radius: 12px; padding: 20px 24px; margin-top: 16px; font-size: 16px; color: #c8bfa8; line-height: 1.8; }
        @media (max-width: 600px) { .layout-grid { grid-template-columns: 1fr; } .mode-grid { grid-template-columns: 1fr; } }
      `}</style>

      <div className="htp-root">
        <div className="stars" />
        <nav className="htp-nav">
          <span className="htp-nav-title">How to Play</span>
          <button className="htp-nav-back" onClick={onBack}>← Back</button>
        </nav>
        <div className="htp-content">
          <div className={`htp-hero fade-up delay-1 ${visible ? "show" : ""}`}>
            <h1 className="htp-hero-title">How to Play</h1>
            <p className="htp-hero-sub">Chess. But the gods are watching.</p>
            <div className="htp-divider" />
          </div>

          {section(1,
            <>
              <div className="section-label">Welcome</div>
              <h2 className="section-title">Chess with cosmic powers</h2>
              <div className="section-body">
                <p>Chessuranga is chess with magic powers based on ancient Indian deities and demons. As pieces are taken, you unlock the help of either the Navagraha — the nine celestial bodies of Hindu cosmology — or the Asura, the demon lords who oppose them.</p>
              </div>
            </>
          )}

          {section(2,
            <>
              <div className="section-label">Game Modes</div>
              <h2 className="section-title">Four ways to play</h2>
              <div className="mode-grid">
                <div className="mode-card">
                  <div className="mode-icon">☄️</div>
                  <div className="mode-name">Face Shukracharya</div>
                  <div className="mode-desc">A 1v1 against the Guru of the Asuras. Select your difficulty and use special moves to gain the edge.</div>
                </div>
                <div className="mode-card">
                  <div className="mode-icon">👹</div>
                  <div className="mode-name">Fight the Asura Horde</div>
                  <div className="mode-desc">Take on ALL the demons, and watch them respawn. Good luck!</div>
                </div>
                <div className="mode-card">
                  <div className="mode-icon">🌟</div>
                  <div className="mode-name">Daily Puzzle</div>
                  <div className="mode-desc">A little treat every day with randomly selected powers to help you find checkmate.</div>
                </div>
                <div className="mode-card">
                  <div className="mode-icon">🤝</div>
                  <div className="mode-name">Tablet Mode VS Friend</div>
                  <div className="mode-desc">Play against a friend on one screen. White plays with Navagraha cards, black with the Asura. Cards are single-use — be strategic!</div>
                </div>
              </div>
            </>
          )}

          {section(3,
            <>
              <div className="section-label">Special Moves</div>
              <h2 className="section-title">Using your powers</h2>
              <div className="section-body">
                <p>Each god or demon is represented by a card. In Shukracharya and Horde modes, each card regenerates every six moves. In Tablet mode, each card is single-use only — so be more strategic and considerate.</p>
              </div>
              <div className="layout-grid">
                <div className="layout-card">
                  <div className="layout-title">🖥️ Desktop</div>
                  <div className="layout-body">On the left hand side you'll see nine cards. None can be used at the start — they unlock as you capture pieces. Tap a card to learn about its power, then tap a piece to use it. Most powers last one or two turns and cost a small amount of time.</div>
                </div>
                <div className="layout-card">
                  <div className="layout-title">📱 Mobile</div>
                  <div className="layout-body">Tap the Ahvan button (it means <em>summon</em>) at the bottom right of the screen to bring up your available special moves. Tap Use Power then select a piece to buff.</div>
                </div>
              </div>
            </>
          )}

          {section(4,
            <>
              <div className="section-label">Progression</div>
              <h2 className="section-title">Unlocking powers</h2>
              <div style={{ marginTop: "16px" }}>
                <div className="unlock-row">♟ Capture a <strong style={{color:"#f0dda0",margin:"0 4px"}}>pawn</strong><span className="unlock-tier">Tier 1 unlocks</span></div>
                <div className="unlock-row">♞ Capture a <strong style={{color:"#f0dda0",margin:"0 4px"}}>knight or bishop</strong><span className="unlock-tier">Tier 2 unlocks</span></div>
                <div className="unlock-row">♜ Capture a <strong style={{color:"#f0dda0",margin:"0 4px"}}>rook or queen</strong><span className="unlock-tier">Tier 3 unlocks</span></div>
              </div>
              <div className="highlight-box">
                ⏱️ <strong style={{color:"#f0dda0"}}>Watch the Clock</strong> — using powers costs you time. But capturing pieces earns it back. Play bold!
              </div>
            </>
          )}

          {section(5,
            <div style={{textAlign:"center", paddingTop:"8px"}}>
              <p style={{fontFamily:"'Cinzel',serif", fontSize:"16px", color:"#f5e9c8"}}>Good luck. The cosmos is counting on you. 🙏</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}