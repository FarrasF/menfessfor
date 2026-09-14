import { Link } from 'react-router-dom';
import MenfessCard from '../components/MenfessCard';
import { dummyMenfess } from '../data/dummyData';
import './Home.css';

function Home() {
  return (
    <main className="page">
      <div className="container">
        {/* Hero */}
        <section className="home-hero">
          <div className="home-hero__badge clay-pill">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            100% Anonim
          </div>
          <h1 className="home-hero__title">
            Suarakan <span className="home-hero__highlight">Ceritamu</span>,{' '}
            <br />
            Tanpa Dikenal.
          </h1>
          <p className="home-hero__subtitle">
            Platform menfess anonim khusus mahasiswa Informatika.
            Curhat, confess, diskusi — semua aman dan tanpa identitas.
          </p>
          <Link to="/submit" className="clay-button clay-button--cta home-hero__cta">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            Tulis Menfess
          </Link>
        </section>

        {/* Feed */}
        <section className="home-feed">
          <div className="home-feed__header">
            <h2 className="home-feed__title">Menfess Terbaru</h2>
            <span className="home-feed__count">{dummyMenfess.length} menfess</span>
          </div>

          <div className="home-feed__grid">
            {dummyMenfess.map((menfess) => (
              <MenfessCard key={menfess.id} {...menfess} />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

export default Home;

