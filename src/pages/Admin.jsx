import { Link } from 'react-router-dom';
import './Admin.css';

function Admin() {
  return (
    <main className="page">
      <div className="container container--sm">
        {/* Admin Header */}
        <div className="admin-header">
          <div className="admin-header__title-wrap">
            <svg width="24" height="24" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
              <path d="M8.533.133a1.749 1.749 0 0 0-1.066 0l-5.25 1.68A1.75 1.75 0 0 0 1 3.48v4.27c0 4.29 2.78 8.01 6.74 9.17a1.749 1.749 0 0 0 .52 0c3.96-1.16 6.74-4.88 6.74-9.17V3.48a1.75 1.75 0 0 0-1.217-1.667Zm-.614 1.44a.25.25 0 0 1 .162 0l5.25 1.68a.25.25 0 0 1 .169.227v4.27c0 3.56-2.29 6.64-5.5 7.63a.25.25 0 0 1-.16 0C4.79 14.43 2.5 11.35 2.5 7.75V3.48a.25.25 0 0 1 .169-.227Z" />
            </svg>
            <h1 className="admin-header__title">Moderation Dashboard</h1>
          </div>
          <p className="admin-header__desc">
            Kelola dan moderasi menfess yang masuk sebelum dipublikasikan ke publik.
          </p>
        </div>

        {/* GitHub Sub-navigation Tabs */}
        <div className="admin-tabs">
          <button className="admin-tab admin-tab--active" type="button">
            Pending Queue <span className="admin-tab__counter">3</span>
          </button>
          <button className="admin-tab" type="button">
            Approved Menfess <span className="admin-tab__counter">28</span>
          </button>
          <button className="admin-tab" type="button">
            Reports <span className="admin-tab__counter">0</span>
          </button>
        </div>

        {/* GitHub Moderation Queue Box */}
        <div className="gh-box admin-queue-box">
          <div className="gh-box-header">
            <div className="admin-queue-header">
              <input type="checkbox" disabled aria-label="Select all" />
              <span>3 menfess menunggu peninjauan</span>
            </div>
            <span className="admin-queue-badge">Supabase Ready</span>
          </div>

          <div className="admin-queue-list">
            <div className="admin-queue-item">
              <div className="admin-queue-item__main">
                <div className="admin-queue-item__meta">
                  <span className="gh-state gh-state-pending">Pending</span>
                  <span className="gh-label gh-label-curhat">Curhat</span>
                  <span className="admin-queue-item__id">#007</span>
                  <span className="admin-queue-item__time">5 menit lalu</span>
                </div>
                <p className="admin-queue-item__preview">
                  "Halo min, mau tanya dong dosen pembimbing untuk topik Machine Learning yang asik siapa ya?"
                </p>
              </div>
              <div className="admin-queue-item__actions">
                <button className="gh-btn gh-btn-sm gh-btn-primary" type="button" title="Approve">
                  Approve
                </button>
                <button className="gh-btn gh-btn-sm gh-btn-danger" type="button" title="Reject">
                  Reject
                </button>
              </div>
            </div>

            <div className="admin-queue-item">
              <div className="admin-queue-item__main">
                <div className="admin-queue-item__meta">
                  <span className="gh-state gh-state-pending">Pending</span>
                  <span className="gh-label gh-label-confess">Confess</span>
                  <span className="admin-queue-item__id">#008</span>
                  <span className="admin-queue-item__time">18 menit lalu</span>
                </div>
                <p className="admin-queue-item__preview">
                  "Buat kaka angkatan 22 yang sering duduk di pojok lab praktikum algoritma, senyum kamu manis bgt hehe."
                </p>
              </div>
              <div className="admin-queue-item__actions">
                <button className="gh-btn gh-btn-sm gh-btn-primary" type="button" title="Approve">
                  Approve
                </button>
                <button className="gh-btn gh-btn-sm gh-btn-danger" type="button" title="Reject">
                  Reject
                </button>
              </div>
            </div>

            <div className="admin-queue-item">
              <div className="admin-queue-item__main">
                <div className="admin-queue-item__meta">
                  <span className="gh-state gh-state-pending">Pending</span>
                  <span className="gh-label gh-label-akademik">Akademik</span>
                  <span className="admin-queue-item__id">#009</span>
                  <span className="admin-queue-item__time">42 menit lalu</span>
                </div>
                <p className="admin-queue-item__preview">
                  "Info kisi-kisi UTS Struktur Data kelas B ada yang punya ga guys? Makasih sebelumnya!"
                </p>
              </div>
              <div className="admin-queue-item__actions">
                <button className="gh-btn gh-btn-sm gh-btn-primary" type="button" title="Approve">
                  Approve
                </button>
                <button className="gh-btn gh-btn-sm gh-btn-danger" type="button" title="Reject">
                  Reject
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Back Link */}
        <div className="admin-footer">
          <Link to="/" className="gh-btn">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
              <path d="M7.78 12.53a.75.75 0 0 1-1.06 0L2.47 8.28a.75.75 0 0 1 0-1.06l4.25-4.25a.751.751 0 0 1 1.042.018.751.751 0 0 1 .018 1.042L4.81 7h7.44a.75.75 0 0 1 0 1.5H4.81l2.97 2.97a.75.75 0 0 1 0 1.06Z" />
            </svg>
            Kembali ke Discussions
          </Link>
        </div>
      </div>
    </main>
  );
}

export default Admin;
