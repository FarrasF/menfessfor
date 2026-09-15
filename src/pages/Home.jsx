import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import MenfessCard from '../components/MenfessCard';
import { supabase } from '../lib/supabase';
import './Home.css';

function Home() {
  const [menfess, setMenfess] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchMenfess() {
      const { data, error } = await supabase
        .from('menfess')
        .select('*')
        .eq('status', 'approved')
        .order('created_at', { ascending: false });

      if (error) {
        setError(error.message);
      } else {
        setMenfess(data);
      }

      setLoading(false);
    }

    fetchMenfess();
  }, []);

  return (
    <main className="page">
      <div className="container">
        {/* Repo-style README / Hero Banner */}
        <section className="gh-hero-box">
          <div className="gh-hero-box__header">
            <div className="gh-hero-box__header-left">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                <path d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8Zm8-6.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13ZM6.5 7.75A.75.75 0 0 1 7.25 7h1a.75.75 0 0 1 .75.75v2.75h.25a.75.75 0 0 1 0 1.5h-2a.75.75 0 0 1 0-1.5h.25v-2h-.25a.75.75 0 0 1-.75-.75ZM8 6a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z" />
              </svg>
              <span>README.md</span>
            </div>
            <div className="gh-hero-box__tags">
              <span className="gh-label gh-label-akademik">Informatika</span>
              <span className="gh-label">Anonim</span>
            </div>
          </div>

          <div className="gh-hero-box__body">
            <h1 className="gh-hero-box__title">Menfessfor — Anonim Informatika</h1>
            <p className="gh-hero-box__desc">
              Platform menfess anonim khusus mahasiswa Jurusan Informatika.
              Sampaikan pesan, curhat, confess, atau diskusi perkuliahan tanpa perlu akun maupun login.
            </p>

            <div className="gh-hero-box__actions">
              <Link to="/submit" className="gh-btn gh-btn-primary">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                  <path d="M7.75 2a.75.75 0 0 1 .75.75V7h4.25a.75.75 0 0 1 0 1.5H8.5v4.25a.75.75 0 0 1-1.5 0V8.5H2.75a.75.75 0 0 1 0-1.5H7V2.75A.75.75 0 0 1 7.75 2Z" />
                </svg>
                Tulis Menfess Baru
              </Link>
              <Link to="/admin" className="gh-btn">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                  <path d="M8.533.133a1.749 1.749 0 0 0-1.066 0l-5.25 1.68A1.75 1.75 0 0 0 1 3.48v4.27c0 4.29 2.78 8.01 6.74 9.17a1.749 1.749 0 0 0 .52 0c3.96-1.16 6.74-4.88 6.74-9.17V3.48a1.75 1.75 0 0 0-1.217-1.667Zm-.614 1.44a.25.25 0 0 1 .162 0l5.25 1.68a.25.25 0 0 1 .169.227v4.27c0 3.56-2.29 6.64-5.5 7.63a.25.25 0 0 1-.16 0C4.79 14.43 2.5 11.35 2.5 7.75V3.48a.25.25 0 0 1 .169-.227Z" />
                </svg>
                Panel Moderasi
              </Link>
            </div>
          </div>
        </section>

        {/* Discussions / Menfess Feed */}
        <section className="gh-feed-section">
          <div className="gh-feed-header">
            <div className="gh-feed-header__left">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="#8250df" aria-hidden="true">
                <path d="M1.75 1A1.75 1.75 0 0 0 0 2.75v9.5C0 13.216.784 14 1.75 14H3v1.543a1.457 1.457 0 0 0 2.487 1.03L8.06 14h6.19A1.75 1.75 0 0 0 16 12.25v-9.5A1.75 1.75 0 0 0 14.25 1H1.75ZM1.5 2.75a.25.25 0 0 1 .25-.25h12.5a.25.25 0 0 1 .25.25v9.5a.25.25 0 0 1-.25.25h-6.5a.75.75 0 0 0-.53.22L4.5 15.44v-2.19a.75.75 0 0 0-.75-.75h-2a.25.25 0 0 1-.25-.25v-9.5Z" />
              </svg>
              <h2 className="gh-feed-header__title">{menfess.length} Discussions</h2>
            </div>
            <span className="gh-feed-header__subtitle">Diurutkan berdasarkan terbaru</span>
          </div>

          <div className="gh-feed-list">
            {loading && <p>Memuat menfess...</p>}

            {error && <p>Error: {error}</p>}

            {!loading && !error && menfess.length === 0 && (
              <p>Belum ada menfess.</p>
            )}

            {!loading &&
              !error &&
              menfess.map((item) => (
                <MenfessCard key={item.id} {...item} />
              ))}
          </div>
        </section>
      </div>
    </main>
  );
}

export default Home;
