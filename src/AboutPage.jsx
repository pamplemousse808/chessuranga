import { useEffect, useState } from "react";

export default function AboutPage({ onBack }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => { const t = setTimeout(() => setVisible(true), 80); return () => clearTimeout(t); }, []);

  const openKofi = async () => {
    try {
      const { Browser } = await import('@capacitor/browser');
      await Browser.open({ url: 'https://ko-fi.com/chessuranga' });
    } catch {
      window.open('https://ko-fi.com/chessuranga', '_blank');
    }
  };

  const openLinkedIn = async () => {
    try {
      const { Browser } = await import('@capacitor/browser');
      await Browser.open({ url: 'https://www.linkedin.com/in/jmewhyte' });
    } catch {
      window.open('https://www.linkedin.com/in/jmewhyte', '_blank');
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Crimson+Pro:ital,wght@0,300;0,400;1,300;1,400&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .about-root { min-height: 100vh; background: #060810; color: #e8dfc8; font-family: 'Crimson Pro', Georgia, serif; overflow-x: hidden; position: relative; }
        .stars { position: fixed; inset: 0; pointer-events: none; z-index: 0;
          background:
            radial-gradient(1px 1px at 12% 18%, #fff9 0%, transparent 100%),
            radial-gradient(1px 1px at 34% 72%, #fff6 0%, transparent 100%),
            radial-gradient(1px 1px at 58% 9%, #fff8 0%, transparent 100%),
            radial-gradient(1px 1px at 76% 55%, #fff5 0%, transparent 100%),
            radial-gradient(1px 1px at 91% 33%, #fff7 0%, transparent 100%),
            radial-gradient(1px 1px at 23% 88%, #fff6 0%, transparent 100%); }
        .about-nav { position: sticky; top: 0; z-index: 10; display: flex; align-items: center; justify-content: space-between; padding: 16px 24px; background: rgba(6,8,16,0.85); backdrop-filter: blur(12px); border-bottom: 1px solid rgba(255,215,100,0.1); }
        .about-nav-title { font-family: 'Jaini Purva', serif; font-size: 13px; letter-spacing: 0.2em; color: #c8973a; text-transform: uppercase; }
        .about-nav-back { font-family: 'Cinzel', serif; font-size: 12px; letter-spacing: 0.12em; color: #060810; background: #c8973a; padding: 8px 20px; border-radius: 50px; border: none; cursor: pointer; }
        .about-content { position: relative; z-index: 1; max-width: 760px; margin: 0 auto; padding: 0 24px 120px; }
        .about-hero { text-align: center; padding: 32px 0 24px; border-bottom: 1px solid rgba(255,215,100,0.12); }
        .about-hero-title { font-family: 'Jaini Purva', serif; font-size: clamp(32px, 7vw, 60px); font-weight: 700; background: linear-gradient(135deg, #ffd966 0%, #f0a500 40%, #e8c87a 80%, #ffd966 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; margin-bottom: 16px; }
        .about-hero-sub { font-size: 18px; font-style: italic; color: #a89060; }
        .about-divider { width: 60px; height: 2px; background: linear-gradient(90deg, transparent, #c8973a, transparent); margin: 24px auto 0; }
        .fade-up { opacity: 0; transform: translateY(28px); transition: opacity 0.8s ease, transform 0.8s ease; }
        .fade-up.show { opacity: 1; transform: translateY(0); }
        .delay-1 { transition-delay: 0.15s; } .delay-2 { transition-delay: 0.3s; } .delay-3 { transition-delay: 0.45s; } .delay-4 { transition-delay: 0.6s; } .delay-5 { transition-delay: 0.75s; }
        .about-section { padding: 40px 0; border-bottom: 1px solid rgba(255,215,100,0.08); }
        .about-section:last-child { border-bottom: none; }
        .section-label { font-family: 'Cinzel', serif; font-size: 10px; letter-spacing: 0.3em; color: #c8973a; text-transform: uppercase; margin-bottom: 10px; }
        .section-title { font-family: 'Cinzel', serif; font-size: clamp(18px, 4vw, 26px); font-weight: 600; color: #e8dfc8; margin-bottom: 20px; line-height: 1.3; }
        .section-body { font-size: 17px; line-height: 1.85; color: #c8bfa8; font-weight: 300; }
        .section-body p + p { margin-top: 14px; }
        .pull-quote { margin: 24px 0 0; padding: 20px 24px; border-left: 2px solid #c8973a; background: rgba(200,151,58,0.06); font-size: 17px; font-style: italic; color: #d4b87a; line-height: 1.7; border-radius: 0 8px 8px 0; }

        /* Roadmap grid */
        .roadmap-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-top: 24px; }
        @media (max-width: 520px) { .roadmap-grid { grid-template-columns: 1fr; } }
        .roadmap-item { display: flex; gap: 12px; align-items: flex-start; background: rgba(255,215,100,0.04); border: 1px solid rgba(255,215,100,0.1); border-radius: 10px; padding: 14px 16px; }
        .roadmap-icon { font-size: 18px; flex-shrink: 0; margin-top: 1px; }
        .roadmap-text { font-family: 'Crimson Pro', serif; font-size: 15px; line-height: 1.55; color: #c8bfa8; font-weight: 300; }

        /* Contact grid */
        .contact-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-top: 24px; }
        @media (max-width: 520px) { .contact-grid { grid-template-columns: 1fr; } }
        .contact-card { background: rgba(255,215,100,0.04); border: 1px solid rgba(255,215,100,0.1); border-radius: 12px; padding: 20px; display: flex; flex-direction: column; gap: 8px; }
        .contact-card-label { font-family: 'Cinzel', serif; font-size: 10px; letter-spacing: 0.25em; color: #c8973a; text-transform: uppercase; }
        .contact-card-desc { font-size: 15px; color: #a89060; line-height: 1.5; font-weight: 300; }
        .contact-link { font-family: 'Cinzel', serif; font-size: 12px; letter-spacing: 0.1em; color: #060810; background: #c8973a; padding: 8px 18px; border-radius: 50px; border: none; cursor: pointer; display: inline-block; margin-top: 4px; text-decoration: none; transition: background 0.2s; width: fit-content; }
        .contact-link:hover { background: #e0aa44; }

        /* Ko-fi */
        .kofi-block { margin-top: 40px; text-align: center; padding: 32px 24px; background: rgba(200,151,58,0.06); border: 1px solid rgba(200,151,58,0.15); border-radius: 16px; }
        .kofi-title { font-family: 'Cinzel', serif; font-size: 18px; color: #e8dfc8; margin-bottom: 10px; }
        .kofi-sub { font-size: 16px; color: #a89060; margin-bottom: 20px; font-weight: 300; }
        .kofi-btn { font-family: 'Cinzel', serif; font-size: 13px; letter-spacing: 0.12em; color: #060810; background: #c8973a; padding: 12px 28px; border-radius: 50px; border: none; cursor: pointer; transition: background 0.2s; }
        .kofi-btn:hover { background: #e0aa44; }
      `}</style>

      <div className="about-root">
        <div className="stars" />

        <nav className="about-nav">
          <span className="about-nav-title">Chessuranga</span>
          <button className="about-nav-back" onClick={onBack}>← Back</button>
        </nav>

        <div className="about-content">

          <div className={`about-hero fade-up ${visible ? "show" : ""}`}>
            <h1 className="about-hero-title">About</h1>
            <p className="about-hero-sub">Chess, mythology, and one very long rabbit hole</p>
            <div className="about-divider" />
          </div>

          {/* Origins */}
          <section className={`about-section fade-up delay-1 ${visible ? "show" : ""}`}>
            <div className="section-label">The Origins</div>
            <h2 className="section-title">Back to the beginning</h2>
            <div className="section-body">
              <p>In the courts of the 6th century Gupta Empire, Chaturanga was played on an 8×8 board called an Ashtāpada. It encompassed the four branches of the ancient Indian military: infantry, cavalry, elephants, and chariots. And because it was a banger of a game, it spread westward through Persia as Shatranj, then into Europe — becoming the chess we know today.</p>
              <p>When I started thinking about chess with special moves, it seemed the perfect fit to go back to the game's roots and add an entire pantheon of gods.</p>
            </div>
            <div className="pull-quote">
              The nine celestial bodies of Hindu cosmology — the Navagraha — each govern a domain of existence: time, fate, war, wisdom, fortune. All the forces that decide whether you win or lose. In chess, and in life.
            </div>
          </section>

          {/* How it was built */}
          <section className={`about-section fade-up delay-2 ${visible ? "show" : ""}`}>
            <div className="section-label">The Build</div>
            <h2 className="section-title">No code background. No problem.</h2>
            <div className="section-body">
              <p>I've always been obsessed with game mechanics — the perpetual "wouldn't it be cool if..." About 18 months ago, I was playing a lot of Marvel Snap and bullet chess simultaneously, and thought: what if you combined them?</p>
              <p>The problem was I couldn't code at all. Then Claude came along, and here we are.</p>
            </div>
          </section>

          {/* Roadmap */}
          <section className={`about-section fade-up delay-3 ${visible ? "show" : ""}`}>
            <div className="section-label">What's Next</div>
            <h2 className="section-title">Roadmap ambitions</h2>
            <div className="section-body">
              <p>This is a proof of concept — but the ambitions are bigger than what you see here.</p>
            </div>
            <div className="roadmap-grid">
              <div className="roadmap-item"><span className="roadmap-icon">🃏</span><span className="roadmap-text">Real card decks, so people can play IRL with any chess set</span></div>
              <div className="roadmap-item"><span className="roadmap-icon">🎨</span><span className="roadmap-text">Commission a real artist to design all the artwork properly</span></div>
              <div className="roadmap-item"><span className="roadmap-icon">😇</span><span className="roadmap-text">Angels vs. the 7 Deadly Sins expansion — moves already mapped</span></div>
              <div className="roadmap-item"><span className="roadmap-icon">🛠️</span><span className="roadmap-text">Deck builder mode — choose your powers before battle</span></div>
              <div className="roadmap-item"><span className="roadmap-icon">🌍</span><span className="roadmap-text">Expand to other mythologies: Norse, Greek, Egyptian…</span></div>
              <div className="roadmap-item"><span className="roadmap-icon">🌐</span><span className="roadmap-text">Multiplayer — a pipe dream, unless you know a serious developer with deep pockets</span></div>
            </div>
          </section>

          {/* Contact */}
          <section className={`about-section fade-up delay-4 ${visible ? "show" : ""}`}>
            <div className="section-label">Get in Touch</div>
            <h2 className="section-title">Found a bug? Just want to say hi?</h2>
            <div className="contact-grid">
              <div className="contact-card">
                <div className="contact-card-label">Report a Bug</div>
                <div className="contact-card-desc">Spotted something broken? I'd genuinely love to know.</div>
                <a className="contact-link" href="mailto:finalfinalversion2@gmail.com">Email me</a>
              </div>
              <div className="contact-card">
                <div className="contact-card-label">Say Hi</div>
                <div className="contact-card-desc">Find me on LinkedIn — always happy to connect.</div>
                <button className="contact-link" onClick={openLinkedIn}>LinkedIn</button>
              </div>
            </div>
          </section>

          {/* Ko-fi */}
          <div className={`fade-up delay-5 ${visible ? "show" : ""}`}>
            <div className="kofi-block">
              <div className="kofi-title">☕ Enjoyed the game?</div>
              <div className="kofi-sub">If you think this man deserves a tip, you can leave one here. It genuinely means a lot.</div>
              <button className="kofi-btn" onClick={openKofi}>Buy me a coffee</button>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}