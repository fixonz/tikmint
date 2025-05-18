import './App.css'
import Particles from 'react-tsparticles';
import { loadFull } from 'tsparticles';
import { useCallback } from 'react';

const PLACEHOLDER_LAUNCHES = Array(10).fill(null);

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
      <div className="tikmint-center-viewport">
        <header className="tikmint-header">
          <img src="/music-note.png" className="tikmint-logo-centered neon-glow" alt="TikMint logo" />
          <img src="/tikmint-logo.jpg" className="tikmint-logo-main neon-text" alt="TikMint text logo" />
        </header>
        <div className="tikmint-badge">Launch your Pump.fun token on TikTok — <span className="free-highlight">100% FREE!</span></div>
        <main>
          <div className="tikmint-message neon-fadein">
            Instantly launch your own Pump.fun token just by posting on TikTok!<br />
            Mention <b>@tikmintdev</b> with your <b>$CASHTAG</b> and token name.<br />
            Our system will detect your post and automatically launch your token for <span className="free-highlight-inline">FREE!</span>
          </div>
          <section className="launches-section glass-card fadein-up">
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
          </section>
        </main>
        <footer className="about-section">
          <h3>About Pump.fun</h3>
          <p>
            Pump.fun is a platform for launching viral meme tokens on Solana, instantly and with zero coding required. Anyone can create a token and join the fun!
          </p>
          <h3>About TikMint</h3>
          <p>
            TikMint is a community project built by a small team of 3-4 experienced developers. We have a long history in crypto and web development, and we're passionate about making token launches fun, social, and accessible for everyone. Our mission: bring the next wave of meme coins to TikTok and beyond!
          </p>
        </footer>
      </div>
    </div>
  )
}

export default App
