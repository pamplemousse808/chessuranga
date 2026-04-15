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

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Crimson+Pro:ital,wght@0,300;0,400;1,300;1,400&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .about-root { min-height: 100vh; background: #060810; color: #e8dfc8; font-family: 'Crimson Pro', Georgia, serif; overflow-x: hidden; position: relative; }
        .stars { position: fixed; inset: 0; pointer-events: none; z-index: 0;
          background: radial-gradient(1px 1px at 12% 18%, #fff9 0%, transparent 100%),
            radial-gradient(1px 1px at 34% 72%, #fff6 0%, transparent 100%),
            radial-gradient(1px 1px at 58% 9%, #fff8 0%, transparent 100%),
            radial-gradient(1px 1px at 76% 55%, #fff5 0%, transparent 100%),
            radial-gradient(1px 1px at 91% 33%, #fff7 0%, transparent 100%),
            radial-gradient(1px 1px at 23% 88%, #fff6 0%, transparent 100%); }
        .about-nav { position: sticky; top: 0; z-index: 10; display: flex; align-items: center; justify-content: space-between; padding: 16px 24px; background: rgba(6,8,16,0.85); backdrop-filter: blur(12px); border-bottom: 1px solid rgba(255,215,100,0.1); }
        .about-nav-title { font-family: 'Cinzel', serif; font-size: 13px; letter-spacing: 0.2em; color: #c8973a; text-transform: uppercase; }
        .about-nav-back { font-family: 'Cinzel', serif; font-size: 12px; letter-spacing: 0.12em; color: #060810; background: #c8973a; padding: 8px 20px; border-radius: 50px; border: none; cursor: pointer; }
        .about-content { position: relative; z-index: 1; max-width: 760px; margin: 0 auto; padding: 0 24px 120px; }
        .about-hero { text-align: center; padding: 64px 0 48px; border-bottom: 1px solid rgba(255,215,100,0.12); }
        .about-hero-title { font-family: 'Cinzel', serif; font-size: clamp(32px, 7vw, 60px); font-weight: 700; background: linear-gradient(135deg, #ffd966 0%, #f0a500 40%, #e8c87a 80%, #ffd966 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; margin-bottom: 16px; }
        .about-hero-sub { font-size: 18px; font-style: italic; color: #a89060; }
        .about-divider { width: 60px; height: 2px; background: linear-gradient(90deg, transparent, #c8973a, transparent); margin: 24px auto 0; }
        .fade-up { opacity: 0; transform: translateY(28px); transition: opacity 0.8s ease, transform 0.8s ease; }
        .fade-up.show { opacity: 1; transform: translateY(0); }
        .delay-1 { transition-delay: 0.15s; } .delay-2 { transition-delay: 0.3s; } .delay-3 { transition-delay: 0.45s; } .delay-4 { transition-delay: 0.6s; } .delay-5 { transition-delay: 0.75s; } .delay-6 { transition-delay: 0.9s; }
        .about-section { padding: 40px 0; border-bottom: 1px solid rgba(255,215,100,0.08); }
        .about-section:last-child { border-bottom: none; }
        .section-label { font-family: 'Cinzel', serif; font-size: 10px; letter-spacing: 0.3em; color: #c8973a; text-transform: uppercase; margin-bottom: 10px; }
        .section-title { font-family: 'Cinzel', serif; font-size: 22px; color: #f5e9c8; margin-bottom: 16px; }
        .section-body { font-size: 17px; color: #8a7e68; line-height: 1.8; }
        .section-body p + p { margin-top: 14px; }
        .pull-quote { font-family: 'Cinzel', serif; font-size: 16px; font-style: italic; color: #c8973a; border-left: 3px solid #c8973a; padding: 12px 20px; margin: 24px 0; line-height: 1.7; background: rgba(200,151,58,0.06); border-radius: 0 8px 8px 0; }
        .roadmap-list { list-style: none; margin-top: 16px; }
        .roadmap-list li { display: flex; align-items: flex-start; gap: 12px; padding: 12px 0; border-bottom: 1px solid rgba(255,215,100,0.06); font-size: 16px; color: #8a7e68; line-height: 1.6; }
        .roadmap-list li:last-child { border-bottom: none; }
        .roadmap-list li::before { content: "✦"; color: #c8973a; flex-shrink: 0; margin-top: 2px; }
        .kofi-btn { display: inline-flex; align-items: center; gap: 10px; background: #c8973a; color: #060810; font-family: 'Cinzel', serif; font-size: 15px; font-weight: 600; letter-spacing: 0.06em; padding: 16px 36px; border-radius: 50px; border: none; cursor: pointer; margin-top: 24px; }
        .footer { text-align: center; padding: 40px 24px; font-size: 13px; color: #3a3428; border-top: 1px solid rgba(255,215,100,0.06); }
      `}</style>

      <div className="about-root">
        <div className="stars" />
        <nav className="about-nav">
          <span className="about-nav-title">About</span>
          <button className="about-nav-back" onClick={onBack}>← Back</button>
        </nav>
        <div className="about-content">

          <div className={`about-hero fade-up delay-1 ${visible ? "show" : ""}`}>
            <h1 className="about-hero-title">Chessuranga</h1>
            <p className="about-hero-sub">Where chess began. Reimagined.</p>
            <div className="about-divider" />
          </div>

          <section className={`about-section fade-up delay-1 ${visible ? "show" : ""}`}>
            <div className="section-label">The Origins</div>
            <h2 className="section-title">Back to the beginning</h2>
            <div className="section-body">
              <p>In the courts of the Gupta Empire around the 6th century, Chaturanga was played on an 8×8 board called an Ashtāpada. It encompassed the four branches of the ancient Indian army: the infantry, cavalry, elephants and chariots. And because it was a banger of a game, it spread westward through Persia as Shatranj, then into Europe, becoming the chess we know today.</p>
              <p>When thinking about chess with special moves, it seemed the perfect fit to go back to the game's origins — and add an entire pantheon of gods.</p>
            </div>
            <div className="pull-quote">
              "The nine celestial bodies of Hindu cosmology — the Navagraha — each govern a domain of existence: time, fate, war, wisdom, fortune. All the aspects that decide whether you win or lose."
            </div>
          </section>

          <section className={`about-section fade-up delay-2 ${visible ? "show" : ""}`}>
            <div className="section-label">The Origin</div>
            <h2 className="section-title">Just weeks of <em>how does all this work</em></h2>
            <div className="section-body">
              <p>I've always been obsessed with games and their mechanics, thinking about wouldn't it be cool if you could do this or that. About 18 months ago, I was playing a lot of Marvel Snap and bullet chess, and thought it would be amazing to combine the two.</p>
              <p>But I can't code at all, so it was just a pipe dream. Then Claude Code dropped and here we are.</p>
            </div>
          </section>

          <section className={`about-section fade-up delay-3 ${visible ? "show" : ""}`}>
            <div className="section-label">What's Next</div>
            <h2 className="section-title">Roadmap ambitions</h2>
            <div className="section-body">
              <p>At the moment this is a proof of concept, but the ambitions are bigger than what you see here.</p>
            </div>
            <ul className="roadmap-list">
              <li>Make real card decks so people can play IRL with any chess set</li>
              <li>Commission a real artist to design all the artwork properly</li>
              <li>Add an Angels vs the 7 Deadly Sins expansion — moves already mapped out</li>
              <li>Add a deck builder so you can choose your favourite powers before battle</li>
              <li>Expand to other mythologies</li>
              <li>Add multiplayer — a pipe dream unless you know a serious developer and serious money is involved!</li>
            </ul>
          </section>

          <section className={`about-section fade-up delay-4 ${visible ? "show" : ""}`} style={{textAlign:"center"}}>
            <div className="section-label">Get in Touch</div>
            <h2 className="section-title">All feedback welcome</h2>
            <div className="section-body" style={{maxWidth:"480px",margin:"0 auto"}}>
              <p>I'm just a one man band here, so if you see any bugs, or have ideas/thoughts about the game, I'd love to hear it.</p>
            </div>
            <p style={{marginTop:"5px"}}>
              <a href="https://www.linkedin.com/in/jmewhyte/" target="_blank" rel="noopener noreferrer" style={{color:"#c8973a",textDecoration:"none",fontStyle:"italic",fontSize:"20px"}}>Say hi on LinkedIn →</a>
            </p>
            <p style={{marginTop:"10px"}}>And if you've enjoyed the game and want to help fund the next chapter:</p>
            <button onClick={openKofi} className="kofi-btn">☕ Fuel the Navagraha</button>
          </section>

        </div>
        <footer className="footer">
          ♟ CHESSURANGA — May the Navagraha guide your moves<br/>
          <span style={{fontSize:"11px",opacity:0.5}}>© {new Date().getFullYear()} Chessuranga. All rights reserved.</span>
        </footer>
      </div>
    </>
  );
}