import './App.css'
import Particles from 'react-tsparticles';
import { loadFull } from 'tsparticles';
import { useCallback } from 'react';

const PLACEHOLDER_LAUNCHES = Array(10).fill(null);

// Helper for smooth scrolling
const scrollToSection = (id) => {
  const element = document.getElementById(id);
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' });
  }
};

function App() {
  // This will be replaced with real launches from backend
  const launches = [];

  const particlesInit = useCallback(async (engine) => {
    await loadFull(engine);
  }, []);

  return (
    <div className="tikmint-outer">
      <Particles
        id="tsparticles"
        init={particlesInit}
        options={{
          fullScreen: { enable: true, zIndex: -1 },
          background: { color: '#00fff7ff' },
          particles: {
            number: { value: 60 },
            color: { value: ['#00fff7', '#fff', '#00e0ff', '#aaffff'] },
            shape: { type: 'circle' },
            opacity: { value: 0.25 },
            size: { value: { min: 1, max: 4 } },
            move: { enable: true, speed: 1.2, direction: 'none', outModes: 'out' },
            links: { enable: true, color: '#00fff7', opacity: 0.12, width: 1 },
          },
        }}
      />

      <nav className="tikmint-navbar">
        <div className="nav-logo-title">
          <img src="/music-note.png" className="nav-logo" alt="TikMint Note" onClick={() => scrollToSection('home-hero')}/>
          <span className="nav-title" onClick={() => scrollToSection('home-hero')}>TikMint</span>
        </div>
        <div className="nav-links">
          <a onClick={() => scrollToSection('home-hero')}>Home</a>
          <a onClick={() => scrollToSection('latest-launches')}>Launches</a>
          <a onClick={() => scrollToSection('about-us')}>About</a>
        </div>
        <div className="nav-social-links">
          <a href="https://x.com/tikmintsol" target="_blank" rel="noopener noreferrer" aria-label="Twitter/X">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="12" fill="#000"/>
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.257 2.25H8.08l4.713 6.231L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117l11.966 15.644z" fill="#fff"/>
            </svg>
          </a>
          <a href="https://www.tiktok.com/@tikmintdev" target="_blank" rel="noopener noreferrer" aria-label="TikTok" className="tiktok-button">
            <svg width="24" height="24" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="24" cy="24" r="24" fill="#000"/><path d="M33.5 19.5c-2.5 0-4.5-2-4.5-4.5V11h-4v16.5c0 2.2-1.8 4-4 4s-4-1.8-4-4 1.8-4 4-4c.2 0 .4 0 .5.1V19c-.2 0-.3-.1-.5-.1-4.1 0-7.5 3.4-7.5 7.5S17.9 34 22 34s7.5-3.4 7.5-7.5V23c1.2 1 2.8 1.5 4.5 1.5v-5z" fill="#fff"/></svg>
          </a>
        </div>
      </nav>

      <div className="tikmint-page-content" style={{ width: '100%', maxWidth: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <section id="home-hero" className="tikmint-section hero-section" style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ width: '100%', maxWidth: '800px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <header className="tikmint-header">
              <img src="/music-note.png" className="tikmint-logo-centered neon-glow" alt="TikMint logo" />
              <img src="/tikmint-logo.jpg" className="tikmint-logo-main neon-text" alt="TikMint text logo" />
            </header>
            <div className="tikmint-badge">Launch your Pump.fun token on TikTok — <span className="free-highlight">100% FREE!</span></div>
            <main className="hero-main-content">
              <div className="tikmint-message neon-fadein">
                Instantly launch your own Pump.fun token just by posting on TikTok!<br />
                Mention <b>@tikmintdev</b> with your <b>$CASHTAG</b> and token name.<br />
                Our system will detect your post and automatically launch your token for <span className="free-highlight-inline">FREE!</span>
              </div>
              <a href="https://www.tiktok.com/@tikmintdev" target="_blank" rel="noopener noreferrer" className="cta-button" style={{ 
                display: 'inline-block',
                marginTop: '20px',
                padding: '14px 28px',
                background: 'linear-gradient(45deg, #000000, #333333)',
                color: 'white',
                borderRadius: '30px',
                fontFamily: 'Orbitron, sans-serif',
                fontWeight: 'bold',
                fontSize: '16px',
                textDecoration: 'none',
                border: '2px solid #00fff7',
                boxShadow: '0 4px 20px rgba(0, 255, 247, 0.6)',
                transition: 'all 0.3s ease'
              }}>
                LAUNCH ON TIKTOK
              </a>
            </main>
          </div>
        </section>

        <section id="latest-launches" className="tikmint-section launches-section-wrapper" style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
          <div className="launches-section glass-card fadein-up">
            <div className="launches-header">
              <h2 className="neon-text">Latest Launches</h2>
            </div>
            <div className="launches-list presized-launches">
              {(launches.length ? launches : PLACEHOLDER_LAUNCHES).slice(0, 10).map((launch, idx) => (
                <div className={`launch-item ${launch ? 'fadein-up' : 'shimmer'}`} key={idx}>
                  {launch ? (
                    <>
                      <img src={launch.image} alt={launch.name} className="launch-token-img" />
                      <div className="launch-info">
                        <div className="launch-name">{launch.name}</div>
                        <div className="launch-time">{launch.time}</div>
                        <a href={launch.link} className="launch-link" target="_blank" rel="noopener noreferrer">View</a>
                      </div>
                    </>
                  ) : (
                    <div className="launch-placeholder">Waiting for new launch...</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="about-us" className="tikmint-section about-section-wrapper" style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
          <footer className="about-section">
            <h3>About Pump.fun</h3>
            <p>
              Pump.fun revolutionizes meme coin creation on Solana, allowing anyone to launch their own token instantly, with no coding necessary. It's a playground for viral tokenomics and community-driven fun.
            </p>
            <h3>About TikMint</h3>
            <p>
              TikMint is a dynamic community project spearheaded by a dedicated team of four seasoned developers. With a rich background in pioneering crypto solutions and crafting cutting-edge web experiences, we're driven by a passion to make token creation exciting, social, and effortlessly accessible to all. Our core mission: to catapult the next generation of meme coins into the TikTok spotlight and across the digital universe!
            </p>
          </footer>
        </section>
      </div>
    </div>
  )
}

export default App
