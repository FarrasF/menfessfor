import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import BrandLogo from '../components/BrandLogo';
import { supabase } from '../lib/supabase';
import './Admin.css';

function getCategoryLabelClass(category) {
  const map = {
    Confess: 'gh-label-confess',
    Curhat: 'gh-label-curhat',
    Akademik: 'gh-label-akademik',
    Random: 'gh-label-random',
  };

  return map[category] || '';
}

function Admin() {
  const [menfess, setMenfess] = useState([]);
  const [reports, setReports] = useState([]);
  const [activeTab, setActiveTab] = useState('pending');

  async function updateReportStatus(reportId, status) {
    const { error } = await supabase
      .from('reports')
      .update({ status })
      .eq('id', reportId);

    if (error) {
      console.error('Gagal mengubah status report:', error);
      alert('Gagal mengubah status laporan.');
      return;
    }

    setReports((current) =>
      current.filter((report) => report.id !== reportId)
    );
  }

  async function deleteReportedContent(report) {
    console.log('=== MULAI DELETE REPORT ===');
    console.log('REPORT:', report);

    const isMenfess = Boolean(report.menfess_id);

    const targetId = isMenfess
      ? report.menfess_id
      : report.comment_id;

    const table = isMenfess ? 'menfess' : 'comments';

    console.log('TARGET:', {
      table,
      targetId,
      isMenfess,
    });

    console.log('MENGIRIM DELETE KE SUPABASE...');

    const { data, error } = await supabase
      .from(table)
      .delete()
      .eq('id', targetId)
      .select();

    console.log('HASIL DELETE:', {
      data,
      error,
    });

    if (error) {
      console.error('DELETE ERROR:', error);
      alert(`Gagal menghapus: ${error.message}`);
      return;
    }

    if (!data || data.length === 0) {
      console.warn('DELETE TIDAK MENGHAPUS DATA APA PUN');

      alert(
        `Tidak ada ${isMenfess ? 'menfess' : 'komentar'} yang terhapus.`
      );

      return;
    }

    console.log('DELETE BERHASIL:', data);

    setReports((current) =>
      current.filter((item) => item.id !== report.id)
    );

    setDeleteConfirmation(null);

    alert('Berhasil dihapus!');
  }

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reportsLoading, setReportsLoading] = useState(false);
  const [session, setSession] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);
  const [approvedCount, setApprovedCount] = useState(0);
  const [approvedMenfess, setApprovedMenfess] = useState([]);
  const [approvedLoading, setApprovedLoading] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState(null);

  useEffect(() => {
    checkAdmin();
  }, []);

  useEffect(() => {
    if (session) {
      document.title = 'Dashboard Moderasi · menfessfor';
    } else {
      document.title = 'Masuk ke Menfessfor';
    }
  }, [session]);

  async function checkAdmin() {
    const { data, error } = await supabase.auth.getSession();

    if (error) {
      console.error('Auth error:', error);
      return;
    }

    setSession(data.session);

    if (data.session) {
      fetchPendingMenfess();
      fetchReports();
      fetchApprovedCount();
      fetchApprovedMenfess();
    } else {
      setLoading(false);
    }
  }

  async function handleLogin(e) {
    e.preventDefault();

    setLoggingIn(true);
    setLoginError('');

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('Login gagal:', error);
      setLoginError('Email atau password salah.');
      setLoggingIn(false);
      return;
    }

    setSession(data.session);
    setLoggingIn(false);

    fetchPendingMenfess();
    fetchReports();
    fetchApprovedCount();
    fetchApprovedMenfess();
  }

  async function deleteMenfess(id) {
    console.log('DELETE DIJALANKAN, ID:', id);

    const { data, error } = await supabase
      .from('menfess')
      .delete()
      .eq('id', id)
      .select();

    console.log('HASIL DELETE:', {
      data,
      error,
    });

    if (error) {
      console.error('DELETE ERROR:', error);
      alert(`Gagal menghapus: ${error.message}`);
      return;
    }

    if (!data || data.length === 0) {
      console.warn('Tidak ada data yang terhapus.');
      alert('Menfess tidak terhapus.');
      return;
    }

    console.log('MENFESS BERHASIL DIHAPUS:', id);

    setApprovedMenfess((current) =>
      current.filter((item) => item.id !== id)
    );

    setApprovedCount((current) =>
      Math.max(0, current - 1)
    );

    setDeleteConfirmation(null);

  }

  async function fetchReports() {
    setReportsLoading(true);

    const { data, error } = await supabase
      .from('reports')
      .select(`
      *,
      menfess:menfess_id (
        id,
        content,
        category,
        created_at
      ),
      comment:comment_id (
        id,
        content,
        menfess_id,
        created_at
      )
    `)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Gagal mengambil reports:', error);
      setReports([]);
    } else {
      setReports(data);
    }

    setReportsLoading(false);
  }

  async function fetchPendingMenfess() {
    setLoading(true);

    const { data, error } = await supabase
      .from('menfess')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Gagal mengambil menfess:', error);
      setError(error.message);
    } else {
      setMenfess(data);
    }

    setLoading(false);
  }

  async function fetchApprovedCount() {
    const { count, error } = await supabase
      .from('menfess')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'approved');

    if (error) {
      console.error('Gagal mengambil jumlah approved:', error);
      return;
    }

    setApprovedCount(count || 0);
  }

  async function fetchApprovedMenfess() {
    setApprovedLoading(true);

    const { data, error } = await supabase
      .from('menfess')
      .select('*')
      .eq('status', 'approved')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Gagal mengambil approved menfess:', error);
      setApprovedMenfess([]);
    } else {
      setApprovedMenfess(data);
    }

    setApprovedLoading(false);
  }

  async function updateStatus(id, status) {
    const { error } = await supabase
      .from('menfess')
      .update({ status })
      .eq('id', id);

    if (error) {
      console.error(`Gagal mengubah status menjadi ${status}:`, error);
      alert('Gagal mengubah status menfess.');
      return;
    }

    // Hapus dari daftar pending
    setMenfess((current) =>
      current.filter((item) => item.id !== id)
    );

    // Kalau disetujui, refresh data approved
    if (status === 'approved') {
      await fetchApprovedCount();
      await fetchApprovedMenfess();
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    setSession(null);
  }

  if (!session) {
    return (
      <main className="page admin-login-page">
        <div className="admin-login-container">
          <div className="admin-login-brand">
            <Link to="/" className="admin-login-logo" aria-label="Menfessfor Homepage">
              <BrandLogo size={48} />
            </Link>
            <h1 className="admin-login-title">Masuk ke Menfessfor</h1>
            <p className="admin-login-subtitle">Panel Moderasi Khusus Pengurus</p>
          </div>

          {loginError && (
            <div className="gh-flash gh-flash--error admin-login-flash">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                <path d="M8 1.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13ZM0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8Zm9 3a1 1 0 1 1-2 0 1 1 0 0 1 2 0Zm-.25-6.25a.75.75 0 0 0-1.5 0v3.5a.75.75 0 0 0 1.5 0v-3.5Z" />
              </svg>
              <span>{loginError}</span>
            </div>
          )}

          <div className="gh-box admin-login-box">
            <form onSubmit={handleLogin} className="admin-login-form">
              <div className="admin-login-field">
                <label htmlFor="admin-email" className="admin-login-label">
                  Alamat email
                </label>
                <input
                  id="admin-email"
                  type="email"
                  className="gh-input admin-login-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@informatika.ac.id"
                  required
                />
              </div>

              <div className="admin-login-field">
                <label htmlFor="admin-password" className="admin-login-label">
                  Kata sandi
                </label>
                <input
                  id="admin-password"
                  type="password"
                  className="gh-input admin-login-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>

              <button
                className="gh-btn gh-btn-primary admin-login-btn"
                type="submit"
                disabled={loggingIn}
              >
                {loggingIn ? 'Sedang masuk...' : 'Masuk'}
              </button>
            </form>
          </div>

          <div className="admin-login-footer-card">
            <span>Bukan moderator? </span>
            <Link to="/" className="admin-login-back-link">
              Kembali ke Beranda
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="page">
      <div className="container container--sm">
        {/* Admin Header */}
        <div className="admin-header">
          <div className="admin-header__top">
            <div className="admin-header__left">
              <div className="admin-header__breadcrumb">
                <Link to="/" className="admin-header__repo-link">menfessfor</Link>
                <span className="admin-header__separator">/</span>
                <span className="admin-header__current">moderasi</span>
              </div>
              <div className="admin-header__title-wrap">
                <svg width="22" height="22" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                  <path d="M8.533.133a1.749 1.749 0 0 0-1.066 0l-5.25 1.68A1.75 1.75 0 0 0 1 3.48v4.27c0 4.29 2.78 8.01 6.74 9.17a1.749 1.749 0 0 0 .52 0c3.96-1.16 6.74-4.88 6.74-9.17V3.48a1.75 1.75 0 0 0-1.217-1.667Zm-.614 1.44a.25.25 0 0 1 .162 0l5.25 1.68a.25.25 0 0 1 .169.227v4.27c0 3.56-2.29 6.64-5.5 7.63a.25.25 0 0 1-.16 0C4.79 14.43 2.5 11.35 2.5 7.75V3.48a.25.25 0 0 1 .169-.227Z" />
                </svg>
                <h1 className="admin-header__title">Dashboard Moderasi</h1>
                <span className="gh-label gh-label-akademik admin-header__badge">Moderator</span>
              </div>
              <p className="admin-header__desc">
                Kelola dan moderasi menfess yang masuk sebelum dipublikasikan ke publik.
              </p>
            </div>

            <div className="admin-header__right">
              {session?.user?.email && (
                <span className="admin-header__email" title={session.user.email}>
                  {session.user.email}
                </span>
              )}
              <button
                type="button"
                className="gh-btn gh-btn-sm admin-header__logout"
                onClick={handleLogout}
              >
                <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                  <path d="M2 2.75C2 1.784 2.784 1 3.75 1h2.5a.75.75 0 0 1 0 1.5h-2.5a.25.25 0 0 0-.25.25v10.5c0 .138.112.25.25.25h2.5a.75.75 0 0 1 0 1.5h-2.5A1.75 1.75 0 0 1 2 13.25Zm10.44 3.97a.75.75 0 0 1 1.06 0l2.25 2.25a.75.75 0 0 1 0 1.06l-2.25 2.25a.751.751 0 0 1-1.042-.018.751.751 0 0 1-.018-1.042L13.19 10H6.75a.75.75 0 0 1 0-1.5h6.44l-1.47-1.47a.75.75 0 0 1 0-1.06Z" />
                </svg>
                Keluar
              </button>
            </div>
          </div>
        </div>

        {/* GitHub Sub-navigation Tabs */}
        <div className="admin-tabs">
          <button
            className={`admin-tab ${activeTab === 'pending' ? 'admin-tab--active' : ''}`}
            type="button"
            onClick={() => setActiveTab('pending')}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
              <path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0ZM1.5 8a6.5 6.5 0 1 0 13 0 6.5 6.5 0 0 0-13 0Zm7-3.25v3.5a.75.75 0 0 1-.22.53l-2.25 2.25a.75.75 0 0 1-1.06-1.06L6.5 8.19V4.75a.75.75 0 0 1 1.5 0Z" />
            </svg>
            Antrean Menunggu
            <span className="admin-tab__counter">{menfess.length}</span>
          </button>

          <button
            className={`admin-tab ${activeTab === 'approved' ? 'admin-tab--active' : ''}`}
            type="button"
            onClick={() => setActiveTab('approved')}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
              <path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.751.751 0 0 1 .018-1.042.751.751 0 0 1 1.042-.018L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0Z" />
            </svg>
            Menfess Disetujui
            <span className="admin-tab__counter">{approvedCount}</span>
          </button>

          <button
            className={`admin-tab ${activeTab === 'reports' ? 'admin-tab--active' : ''}`}
            type="button"
            onClick={() => setActiveTab('reports')}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
              <path d="M1.75 1.5a.75.75 0 0 0-.75.75v12a.75.75 0 0 0 1.5 0V9.25h3.284a2.25 2.25 0 0 1 1.77.863l.364.456a3.75 3.75 0 0 0 2.95 1.438H14a.75.75 0 0 0 .75-.75V3.5a.75.75 0 0 0-.75-.75H10.9a2.25 2.25 0 0 1-1.77-.863l-.364-.456A3.75 3.75 0 0 0 5.818 0H1.75Zm0 1.5h4.068c.683 0 1.343.277 1.82.772l.364.456A3.75 3.75 0 0 0 10.95 5.5H13.25v4.25h-2.3a2.25 2.25 0 0 1-1.77-.863l-.364-.456A3.75 3.75 0 0 0 5.818 7H2.5V3Z" />
            </svg>
            Laporan
            <span className="admin-tab__counter">{reports.length}</span>
          </button>
        </div>

        {activeTab === 'pending' && (
          <div className="gh-box admin-queue-box">
            <div className="gh-box-header">
              <div className="admin-queue-header">
                <svg aria-hidden="true" height="16" viewBox="0 0 16 16" version="1.1" width="16" fill="currentColor">
                  <path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0ZM1.5 8a6.5 6.5 0 1 0 13 0 6.5 6.5 0 0 0-13 0Zm7-3.25v3.5l2.25 1.5a.75.75 0 1 1-.83 1.25l-2.67-1.78A.75.75 0 0 1 7 8.5V4.75a.75.75 0 0 1 1.5 0Z"></path>
                </svg>
                <span>{menfess.length} menfess menunggu peninjauan</span>
              </div>

              <span className="admin-queue-badge">
                Antrean
              </span>
            </div>

            <div className="admin-queue-list">
              {loading && (
                <div className="admin-queue-empty">
                  <p>Memuat antrean menfess...</p>
                </div>
              )}

              {error && (
                <div className="admin-queue-empty">
                  <p style={{ color: 'var(--color-danger-fg)' }}>Error: {error}</p>
                </div>
              )}

              {!loading && !error && menfess.length === 0 && (
                <div className="admin-queue-empty">
                  <svg aria-hidden="true" height="32" viewBox="0 0 16 16" version="1.1" width="32" fill="currentColor" style={{ opacity: 0.4, marginBottom: '8px' }}>
                    <path d="M1.5 3.25a.75.75 0 0 1 .75-.75h11.5a.75.75 0 0 1 .75.75v3.69a.75.75 0 0 1-1.5 0V4.5H2.5v7h4.75a.75.75 0 0 1 0 1.5H2.25a.75.75 0 0 1-.75-.75v-9Zm10.28 6.97a.75.75 0 0 1 0 1.06l-3 3a.75.75 0 0 1-1.06 0l-1.5-1.5a.75.75 0 1 1 1.06-1.06l.97.97 2.47-2.47a.75.75 0 0 1 1.06 0Z"></path>
                  </svg>
                  <p>Semua antrean bersih. Belum ada menfess baru yang menunggu peninjauan.</p>
                </div>
              )}

              {!loading &&
                !error &&
                menfess.map((item) => (
                  <div className="admin-queue-item" key={item.id}>
                    <div className="admin-queue-item__header">
                      <div className="admin-queue-item__tags">
                        <span className="gh-state gh-state-pending">
                          <svg aria-hidden="true" height="12" viewBox="0 0 16 16" version="1.1" width="12" fill="currentColor">
                            <path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0ZM1.5 8a6.5 6.5 0 1 0 13 0 6.5 6.5 0 0 0-13 0Zm7-3.25v3.5l2.25 1.5a.75.75 0 1 1-.83 1.25l-2.67-1.78A.75.75 0 0 1 7 8.5V4.75a.75.75 0 0 1 1.5 0Z"></path>
                          </svg>
                          Menunggu
                        </span>

                        <span className={`gh-label ${getCategoryLabelClass(item.category)}`}>
                          {item.category}
                        </span>

                        <span className="admin-queue-item__id">
                          #{item.id}
                        </span>
                      </div>

                      <span className="admin-queue-item__time">
                        <svg aria-hidden="true" height="12" viewBox="0 0 16 16" version="1.1" width="12" fill="currentColor">
                          <path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0ZM1.5 8a6.5 6.5 0 1 0 13 0 6.5 6.5 0 0 0-13 0Zm7-3.25v3.5l2.25 1.5a.75.75 0 1 1-.83 1.25l-2.67-1.78A.75.75 0 0 1 7 8.5V4.75a.75.75 0 0 1 1.5 0Z"></path>
                        </svg>
                        {new Date(item.created_at).toLocaleString('id-ID', {
                          dateStyle: 'medium',
                          timeStyle: 'short',
                        })}
                      </span>
                    </div>

                    <div className="admin-queue-item__preview">
                      "{item.content}"
                    </div>

                    <div className="admin-queue-item__actions">
                      <button
                        className="gh-btn gh-btn-sm gh-btn-primary"
                        type="button"
                        onClick={() => updateStatus(item.id, 'approved')}
                      >
                        <svg aria-hidden="true" height="14" viewBox="0 0 16 16" fill="currentColor">
                          <path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.751.751 0 0 1 .018-1.042.751.751 0 0 1 1.042-.018L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0Z"></path>
                        </svg>
                        Setujui
                      </button>

                      <button
                        className="gh-btn gh-btn-sm gh-btn-danger"
                        type="button"
                        onClick={() => updateStatus(item.id, 'rejected')}
                      >
                        <svg aria-hidden="true" height="14" viewBox="0 0 16 16" fill="currentColor">
                          <path d="M3.72 3.72a.75.75 0 0 1 1.06 0L8 6.94l3.22-3.22a.749.749 0 0 1 1.275.326.749.749 0 0 1-.215.734L9.06 8l3.22 3.22a.749.749 0 0 1-.326 1.275.749.749 0 0 1-.734-.215L8 9.06l-3.22 3.22a.751.751 0 0 1-1.042-.018.751.751 0 0 1-.018-1.042L6.94 8 3.72 4.78a.75.75 0 0 1 0-1.06Z"></path>
                        </svg>
                        Tolak
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {activeTab === 'approved' && (
          <div className="gh-box admin-queue-box">
            <div className="gh-box-header">
              <div className="admin-queue-header">
                <svg aria-hidden="true" height="16" viewBox="0 0 16 16" version="1.1" width="16" fill="currentColor">
                  <path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.751.751 0 0 1 .018-1.042.751.751 0 0 1 1.042-.018L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0Z"></path>
                </svg>
                <span>{approvedMenfess.length} menfess telah disetujui</span>
              </div>

              <span className="admin-queue-badge">
                Dipublikasikan
              </span>
            </div>

            <div className="admin-queue-list">
              {approvedLoading && (
                <div className="admin-queue-empty">
                  <p>Memuat menfess disetujui...</p>
                </div>
              )}

              {!approvedLoading && approvedMenfess.length === 0 && (
                <div className="admin-queue-empty">
                  <svg aria-hidden="true" height="32" viewBox="0 0 16 16" version="1.1" width="32" fill="currentColor" style={{ opacity: 0.4, marginBottom: '8px' }}>
                    <path d="M1.75 1.5a.75.75 0 0 0-.75.75v12a.75.75 0 0 0 1.5 0v-4.5h3.69l.72 1.44a.75.75 0 0 0 .67.41h6.67a.75.75 0 0 0 .75-.75v-6.5a.75.75 0 0 0-.75-.75H8.75l-.72-1.44A.75.75 0 0 0 7.36 1.5H1.75Z"></path>
                  </svg>
                  <p>Belum ada menfess yang disetujui.</p>
                </div>
              )}

              {!approvedLoading &&
                approvedMenfess.map((item) => (
                  <div className="admin-queue-item" key={item.id}>
                    <div className="admin-queue-item__header">
                      <div className="admin-queue-item__tags">
                        <span className="gh-state gh-state-approved">
                          <svg aria-hidden="true" height="12" viewBox="0 0 16 16" version="1.1" width="12" fill="currentColor">
                            <path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.751.751 0 0 1 .018-1.042.751.751 0 0 1 1.042-.018L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0Z"></path>
                          </svg>
                          Disetujui
                        </span>

                        <span className={`gh-label ${getCategoryLabelClass(item.category)}`}>
                          {item.category}
                        </span>

                        <span className="admin-queue-item__id">
                          #{item.id}
                        </span>
                      </div>

                      <span className="admin-queue-item__time">
                        <svg aria-hidden="true" height="12" viewBox="0 0 16 16" version="1.1" width="12" fill="currentColor">
                          <path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0ZM1.5 8a6.5 6.5 0 1 0 13 0 6.5 6.5 0 0 0-13 0Zm7-3.25v3.5l2.25 1.5a.75.75 0 1 1-.83 1.25l-2.67-1.78A.75.75 0 0 1 7 8.5V4.75a.75.75 0 0 1 1.5 0Z"></path>
                        </svg>
                        {new Date(item.created_at).toLocaleString('id-ID', {
                          dateStyle: 'medium',
                          timeStyle: 'short',
                        })}
                      </span>
                    </div>

                    <div className="admin-queue-item__preview">
                      "{item.content}"
                    </div>

                    <div className="admin-queue-item__actions">
                      {deleteConfirmation === `approved-${item.id}` ? (
                        <div className="admin-report-delete-confirm">
                          <div className="admin-report-delete-confirm__msg">
                            <svg aria-hidden="true" height="14" viewBox="0 0 16 16" fill="currentColor">
                              <path d="M6.457 1.047c.659-1.234 2.427-1.234 3.086 0l6.082 11.378A1.75 1.75 0 0 1 14.082 15H1.918a1.75 1.75 0 0 1-1.543-2.575Zm1.763.707a.25.25 0 0 0-.44 0L1.698 13.132a.25.25 0 0 0 .22.368h12.164a.25.25 0 0 0 .22-.368Zm.53 3.996v2.5a.75.75 0 0 1-1.5 0v-2.5a.75.75 0 0 1 1.5 0ZM9 11a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z"></path>
                            </svg>
                            <span>Yakin ingin menghapus menfess #{item.id} secara permanen?</span>
                          </div>

                          <div className="admin-report-delete-confirm__buttons">
                            <button
                              type="button"
                              className="gh-btn gh-btn-sm gh-btn-danger"
                              onClick={() => deleteMenfess(item.id)}
                            >
                              Ya, Hapus Menfess
                            </button>

                            <button
                              type="button"
                              className="gh-btn gh-btn-sm"
                              onClick={() => setDeleteConfirmation(null)}
                            >
                              Batal
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          type="button"
                          className="gh-btn gh-btn-sm gh-btn-danger"
                          onClick={() =>
                            setDeleteConfirmation(`approved-${item.id}`)
                          }
                        >
                          <svg aria-hidden="true" height="14" viewBox="0 0 16 16" fill="currentColor">
                            <path d="M11 1.75V3h2.25a.75.75 0 0 1 0 1.5H2.75a.75.75 0 0 1 0-1.5H5V1.75C5 .784 5.784 0 6.75 0h2.5C10.216 0 11 .784 11 1.75ZM4.496 6.675l.66 6.6a.25.25 0 0 0 .249.225h5.19a.25.25 0 0 0 .249-.225l.66-6.6a.75.75 0 0 1 1.492.15l-.66 6.6A1.75 1.75 0 0 1 10.595 15H5.405a1.75 1.75 0 0 1-1.741-1.575l-.66-6.6a.75.75 0 1 1 1.492-.15ZM6.5 1.75V3h3V1.75a.25.25 0 0 0-.25-.25h-2.5a.25.25 0 0 0-.25.25Z"></path>
                          </svg>
                          Hapus
                        </button>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="gh-box admin-queue-box">
            <div className="gh-box-header">
              <div className="admin-queue-header">
                <svg aria-hidden="true" height="16" viewBox="0 0 16 16" version="1.1" width="16" fill="currentColor">
                  <path d="M1.75 1.5a.75.75 0 0 0-.75.75v12a.75.75 0 0 0 1.5 0v-4.5h3.69l.72 1.44a.75.75 0 0 0 .67.41h6.67a.75.75 0 0 0 .75-.75v-6.5a.75.75 0 0 0-.75-.75H8.75l-.72-1.44A.75.75 0 0 0 7.36 1.5H1.75Z"></path>
                </svg>
                <span>{reports.length} laporan memerlukan tindakan</span>
              </div>

              <span className="admin-queue-badge">
                Moderasi
              </span>
            </div>

            <div className="admin-reports-list">
              {reportsLoading && (
                <div className="admin-queue-empty">
                  <p>Memuat laporan...</p>
                </div>
              )}

              {!reportsLoading && reports.length === 0 && (
                <div className="admin-queue-empty">
                  <svg aria-hidden="true" height="32" viewBox="0 0 16 16" version="1.1" width="32" fill="currentColor" style={{ opacity: 0.4, marginBottom: '8px' }}>
                    <path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.751.751 0 0 1 .018-1.042.751.751 0 0 1 1.042-.018L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0Z"></path>
                  </svg>
                  <p>Tidak ada laporan masuk yang perlu ditinjau.</p>
                </div>
              )}

              {!reportsLoading &&
                reports.map((report) => {
                  const isMenfess = Boolean(report.menfess_id);
                  const targetMenfessId = isMenfess ? report.menfess_id : report.comment?.menfess_id;
                  const contentText = isMenfess ? report.menfess?.content : report.comment?.content;
                  const hasTargetData = isMenfess ? Boolean(report.menfess) : Boolean(report.comment);

                  return (
                    <article className="admin-report-card" key={report.id}>
                      {/* Header Bar */}
                      <div className="admin-report-card__header">
                        <div className="admin-report-card__tags">
                          <span className="admin-report-flag-badge">
                            <svg aria-hidden="true" height="12" viewBox="0 0 16 16" version="1.1" width="12" fill="currentColor">
                              <path d="M1.75 1.5a.75.75 0 0 0-.75.75v12a.75.75 0 0 0 1.5 0v-4.5h3.69l.72 1.44a.75.75 0 0 0 .67.41h6.67a.75.75 0 0 0 .75-.75v-6.5a.75.75 0 0 0-.75-.75H8.75l-.72-1.44A.75.75 0 0 0 7.36 1.5H1.75Z"></path>
                            </svg>
                            Laporan #{report.id}
                          </span>

                          <span className={`gh-label ${isMenfess ? 'gh-label--menfess-type' : 'gh-label--comment-type'}`}>
                            {isMenfess ? 'Menfess' : 'Komentar'}
                          </span>

                          {report.menfess?.category && (
                            <span className="gh-label">
                              {report.menfess.category}
                            </span>
                          )}
                        </div>

                        <span className="admin-report-card__time">
                          <svg aria-hidden="true" height="12" viewBox="0 0 16 16" version="1.1" width="12" fill="currentColor">
                            <path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0ZM1.5 8a6.5 6.5 0 1 0 13 0 6.5 6.5 0 0 0-13 0Zm7-3.25v3.5l2.25 1.5a.75.75 0 1 1-.83 1.25l-2.67-1.78A.75.75 0 0 1 7 8.5V4.75a.75.75 0 0 1 1.5 0Z"></path>
                          </svg>
                          {new Date(report.created_at).toLocaleString('id-ID', {
                            dateStyle: 'medium',
                            timeStyle: 'short',
                          })}
                        </span>
                      </div>

                      {/* Reason Callout Box */}
                      <div className="admin-report-reason-box">
                        <div className="admin-report-reason-box__header">
                          <svg aria-hidden="true" height="14" viewBox="0 0 16 16" version="1.1" width="14" fill="currentColor">
                            <path d="M6.457 1.047c.659-1.234 2.427-1.234 3.086 0l6.082 11.378A1.75 1.75 0 0 1 14.082 15H1.918a1.75 1.75 0 0 1-1.543-2.575Zm1.763.707a.25.25 0 0 0-.44 0L1.698 13.132a.25.25 0 0 0 .22.368h12.164a.25.25 0 0 0 .22-.368Zm.53 3.996v2.5a.75.75 0 0 1-1.5 0v-2.5a.75.75 0 0 1 1.5 0ZM9 11a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z"></path>
                          </svg>
                          <span>Alasan Pelaporan</span>
                        </div>
                        <p className="admin-report-reason-box__text">
                          "{report.reason}"
                        </p>
                      </div>

                      {/* Reported Content Preview Box */}
                      <div className="admin-report-target-box">
                        <div className="admin-report-target-box__header">
                          <span className="admin-report-target-box__title">
                            {isMenfess
                              ? `Isi Menfess #${report.menfess_id}`
                              : `Isi Komentar #${report.comment_id}`}
                          </span>

                          {targetMenfessId && (
                            <Link
                              to={`/menfess/${targetMenfessId}`}
                              className="admin-report-target-box__link"
                              title="Buka halaman diskusi"
                            >
                              Buka Diskusi #{targetMenfessId}
                              <svg aria-hidden="true" height="12" viewBox="0 0 16 16" version="1.1" width="12" fill="currentColor">
                                <path d="M6.22 3.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.751.751 0 0 1-1.042-.018.751.751 0 0 1-.018-1.042L9.94 8 6.22 4.28a.75.75 0 0 1 0-1.06Z"></path>
                              </svg>
                            </Link>
                          )}
                        </div>

                        {hasTargetData ? (
                          <div className="admin-report-target-box__content">
                            "{contentText}"
                          </div>
                        ) : (
                          <div className="admin-report-target-box__missing">
                            <svg aria-hidden="true" height="14" viewBox="0 0 16 16" fill="currentColor">
                              <path d="M8 1.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13ZM0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8Zm9-3a1 1 0 1 1-2 0 1 1 0 0 1 2 0ZM6.75 8a.75.75 0 0 0 0 1.5h.75v2.25a.75.75 0 0 0 1.5 0V8.75A.75.75 0 0 0 8.25 8h-1.5Z"></path>
                            </svg>
                            Konten ini sudah tidak ditemukan atau telah dihapus sebelumnya.
                          </div>
                        )}
                      </div>

                      {/* Action Footer */}
                      <div className="admin-report-card__actions">
                        {deleteConfirmation === report.id ? (
                          <div className="admin-report-delete-confirm">
                            <div className="admin-report-delete-confirm__msg">
                              <svg aria-hidden="true" height="14" viewBox="0 0 16 16" fill="currentColor">
                                <path d="M6.457 1.047c.659-1.234 2.427-1.234 3.086 0l6.082 11.378A1.75 1.75 0 0 1 14.082 15H1.918a1.75 1.75 0 0 1-1.543-2.575Zm1.763.707a.25.25 0 0 0-.44 0L1.698 13.132a.25.25 0 0 0 .22.368h12.164a.25.25 0 0 0 .22-.368Zm.53 3.996v2.5a.75.75 0 0 1-1.5 0v-2.5a.75.75 0 0 1 1.5 0ZM9 11a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z"></path>
                              </svg>
                              <span>Yakin ingin menghapus {isMenfess ? 'menfess' : 'komentar'} ini secara permanen?</span>
                            </div>

                            <div className="admin-report-delete-confirm__buttons">
                              <button
                                type="button"
                                className="gh-btn gh-btn-sm gh-btn-danger"
                                onClick={() => deleteReportedContent(report)}
                              >
                                Ya, Hapus Konten
                              </button>

                              <button
                                type="button"
                                className="gh-btn gh-btn-sm"
                                onClick={() => setDeleteConfirmation(null)}
                              >
                                Batal
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="admin-report-actions-row">
                            <button
                              type="button"
                              className="gh-btn gh-btn-sm gh-btn-danger"
                              onClick={() => setDeleteConfirmation(report.id)}
                            >
                              <svg aria-hidden="true" height="14" viewBox="0 0 16 16" fill="currentColor">
                                <path d="M11 1.75V3h2.25a.75.75 0 0 1 0 1.5H2.75a.75.75 0 0 1 0-1.5H5V1.75C5 .784 5.784 0 6.75 0h2.5C10.216 0 11 .784 11 1.75ZM4.496 6.675l.66 6.6a.25.25 0 0 0 .249.225h5.19a.25.25 0 0 0 .249-.225l.66-6.6a.75.75 0 0 1 1.492.15l-.66 6.6A1.75 1.75 0 0 1 10.595 15H5.405a1.75 1.75 0 0 1-1.741-1.575l-.66-6.6a.75.75 0 1 1 1.492-.15ZM6.5 1.75V3h3V1.75a.25.25 0 0 0-.25-.25h-2.5a.25.25 0 0 0-.25.25Z"></path>
                              </svg>
                              Hapus Konten
                            </button>

                            <button
                              type="button"
                              className="gh-btn gh-btn-sm"
                              onClick={() =>
                                updateReportStatus(report.id, 'dismissed')
                              }
                              title="Abaikan laporan jika konten tidak melanggar ketentuan"
                            >
                              <svg aria-hidden="true" height="14" viewBox="0 0 16 16" fill="currentColor">
                                <path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.751.751 0 0 1 .018-1.042.751.751 0 0 1 1.042-.018L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0Z"></path>
                              </svg>
                              Abaikan Laporan
                            </button>
                          </div>
                        )}
                      </div>
                    </article>
                  );
                })}
            </div>
          </div>
        )}

        {/* Back Link */}
        <div className="admin-footer">
          <Link to="/" className="gh-btn">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
              <path d="M7.78 12.53a.75.75 0 0 1-1.06 0L2.47 8.28a.75.75 0 0 1 0-1.06l4.25-4.25a.751.751 0 0 1 1.042.018.751.751 0 0 1 .018 1.042L4.81 7h7.44a.75.75 0 0 1 0 1.5H4.81l2.97 2.97a.75.75 0 0 1 0 1.06Z" />
            </svg>
            Kembali ke Diskusi
          </Link>
        </div>
      </div>
    </main>
  );
}

export default Admin;
