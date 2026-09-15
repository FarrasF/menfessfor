import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
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
      current.map((report) =>
        report.id === reportId
          ? { ...report, status }
          : report
      )
    );
  }

  async function deleteReportedContent(report) {
    const isMenfess = Boolean(report.menfess_id);
    const targetId = isMenfess
      ? report.menfess_id
      : report.comment_id;

    const table = isMenfess ? 'menfess' : 'comments';
    const idColumn = 'id';

    const confirmed = window.confirm(
      isMenfess
        ? 'Yakin ingin menghapus menfess ini?'
        : 'Yakin ingin menghapus komentar ini?'
    );

    if (!confirmed) return;

    const { error } = await supabase
      .from(table)
      .delete()
      .eq(idColumn, targetId);

    if (error) {
      console.error('Gagal menghapus konten:', error);
      alert('Gagal menghapus konten.');
      return;
    }

    await updateReportStatus(report.id, 'resolved');

    setReports((current) =>
      current.filter((item) => item.id !== report.id)
    );
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

  useEffect(() => {
    checkAdmin();
  }, []);

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

  async function fetchReports() {
    setReportsLoading(true);

    const { data, error } = await supabase
      .from('reports')
      .select('*')
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

    // Hapus dari daftar pending setelah berhasil
    setMenfess((current) =>
      current.filter((item) => item.id !== id)
    );
    if (status === 'approved') {
      fetchApprovedCount();
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    setSession(null);
  }

  if (!session) {
    return (
      <main className="page">
        <div className="container container--sm">
          <div className="gh-box">
            <h2>Admin Login</h2>

            <form onSubmit={handleLogin}>
              <div>
                <label htmlFor="admin-email">Email</label>
                <input
                  id="admin-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div>
                <label htmlFor="admin-password">Password</label>
                <input
                  id="admin-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              {loginError && (
                <p>
                  {loginError}
                </p>
              )}

              <button
                className="gh-btn gh-btn-primary"
                type="submit"
                disabled={loggingIn}
              >
                {loggingIn ? 'Logging in...' : 'Login'}
              </button>
            </form>
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
          <div className="admin-header__title-wrap">
            <svg width="24" height="24" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
              <path d="M8.533.133a1.749 1.749 0 0 0-1.066 0l-5.25 1.68A1.75 1.75 0 0 0 1 3.48v4.27c0 4.29 2.78 8.01 6.74 9.17a1.749 1.749 0 0 0 .52 0c3.96-1.16 6.74-4.88 6.74-9.17V3.48a1.75 1.75 0 0 0-1.217-1.667Zm-.614 1.44a.25.25 0 0 1 .162 0l5.25 1.68a.25.25 0 0 1 .169.227v4.27c0 3.56-2.29 6.64-5.5 7.63a.25.25 0 0 1-.16 0C4.79 14.43 2.5 11.35 2.5 7.75V3.48a.25.25 0 0 1 .169-.227Z" />
            </svg>
            <h1 className="admin-header__title">Moderation Dashboard</h1>
          </div>
          <button
            type="button"
            className="gh-btn"
            onClick={handleLogout}
          >
            Logout
          </button>
          <p className="admin-header__desc">
            Kelola dan moderasi menfess yang masuk sebelum dipublikasikan ke publik.
          </p>
        </div>

        {/* GitHub Sub-navigation Tabs */}
        <div className="admin-tabs">
          <button
            className={`admin-tab ${activeTab === 'pending' ? 'admin-tab--active' : ''}`}
            type="button"
            onClick={() => setActiveTab('pending')}
          >
            Pending Queue
            <span className="admin-tab__counter">{menfess.length}</span>
          </button>

          <button
            className={`admin-tab ${activeTab === 'approved' ? 'admin-tab--active' : ''}`}
            type="button"
            onClick={() => setActiveTab('approved')}
          >
            Approved Menfess
            <span className="admin-tab__counter">{approvedCount}</span>
          </button>

          <button
            className={`admin-tab ${activeTab === 'reports' ? 'admin-tab--active' : ''}`}
            type="button"
            onClick={() => setActiveTab('reports')}
          >
            Reports
            <span className="admin-tab__counter">{reports.length}</span>
          </button>
        </div>

        {activeTab === 'pending' && (
          <div className="gh-box admin-queue-box">
            <div className="gh-box-header">
              <div className="admin-queue-header">
                <input type="checkbox" disabled aria-label="Select all" />
                <span>{menfess.length} menfess menunggu peninjauan</span>
              </div>
              <span className="admin-queue-badge">Supabase Ready</span>
            </div>

            <div className="admin-queue-list">
              {loading && (
                <div className="admin-queue-item">
                  <p className="admin-queue-item__preview">
                    Memuat menfess...
                  </p>
                </div>
              )}

              {error && (
                <div className="admin-queue-item">
                  <p className="admin-queue-item__preview">
                    Error: {error}
                  </p>
                </div>
              )}

              {!loading && !error && menfess.length === 0 && (
                <div className="admin-queue-item">
                  <p className="admin-queue-item__preview">
                    Tidak ada menfess yang menunggu peninjauan.
                  </p>
                </div>
              )}

              {!loading &&
                !error &&
                menfess.map((item) => (
                  <div className="admin-queue-item" key={item.id}>
                    <div className="admin-queue-item__main">
                      <div className="admin-queue-item__meta">
                        <span className="gh-state gh-state-pending">
                          Pending
                        </span>

                        <span className={`gh-label ${getCategoryLabelClass(item.category)}`}>
                          {item.category}
                        </span>

                        <span className="admin-queue-item__id">
                          #{item.id}
                        </span>

                        <span className="admin-queue-item__time">
                          {new Date(item.created_at).toLocaleString('id-ID')}
                        </span>
                      </div>

                      <p className="admin-queue-item__preview">
                        "{item.content}"
                      </p>
                    </div>

                    <div className="admin-queue-item__actions">
                      <button
                        className="gh-btn gh-btn-sm gh-btn-primary"
                        type="button"
                        onClick={() => updateStatus(item.id, 'approved')}
                      >
                        Approve
                      </button>

                      <button
                        className="gh-btn gh-btn-sm gh-btn-danger"
                        type="button"
                        onClick={() => updateStatus(item.id, 'rejected')}
                      >
                        Reject
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
                <span>{approvedMenfess.length} menfess telah disetujui</span>
              </div>

              <span className="admin-queue-badge">
                Published
              </span>
            </div>

            <div className="admin-queue-list">
              {approvedLoading && (
                <div className="admin-queue-item">
                  <p className="admin-queue-item__preview">
                    Memuat approved menfess...
                  </p>
                </div>
              )}

              {!approvedLoading && approvedMenfess.length === 0 && (
                <div className="admin-queue-item">
                  <p className="admin-queue-item__preview">
                    Belum ada menfess yang disetujui.
                  </p>
                </div>
              )}

              {!approvedLoading &&
                approvedMenfess.map((item) => (
                  <div className="admin-queue-item" key={item.id}>
                    <div className="admin-queue-item__main">
                      <div className="admin-queue-item__meta">
                        <span className="gh-state gh-state-approved">
                          Approved
                        </span>

                        <span
                          className={`gh-label ${getCategoryLabelClass(item.category)}`}
                        >
                          {item.category}
                        </span>

                        <span className="admin-queue-item__id">
                          #{item.id}
                        </span>

                        <span className="admin-queue-item__time">
                          {new Date(item.created_at).toLocaleString('id-ID')}
                        </span>
                      </div>

                      <p className="admin-queue-item__preview">
                        "{item.content}"
                      </p>
                    </div>

                    <div className="admin-queue-item__actions">
                      <button
                        className="gh-btn gh-btn-sm gh-btn-danger"
                        type="button"
                        onClick={async () => {
                          const confirmed = window.confirm(
                            'Yakin ingin menghapus menfess ini?'
                          );

                          if (!confirmed) return;

                          const { error } = await supabase
                            .from('menfess')
                            .delete()
                            .eq('id', item.id);

                          if (error) {
                            console.error('Gagal menghapus menfess:', error);
                            alert('Gagal menghapus menfess.');
                            return;
                          }

                          setApprovedMenfess((current) =>
                            current.filter((menfess) => menfess.id !== item.id)
                          );

                          setApprovedCount((current) =>
                            Math.max(0, current - 1)
                          );
                        }}
                      >
                        Hapus
                      </button>
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
                <span>{reports.length} laporan masuk</span>
              </div>

              <span className="admin-queue-badge">
                Supabase Ready
              </span>
            </div>

            <div className="admin-queue-list">
              {reportsLoading && (
                <div className="admin-queue-item">
                  <p className="admin-queue-item__preview">
                    Memuat laporan...
                  </p>
                </div>
              )}

              {!reportsLoading && reports.length === 0 && (
                <div className="admin-queue-item">
                  <p className="admin-queue-item__preview">
                    Belum ada laporan.
                  </p>
                </div>
              )}

              {!reportsLoading &&
                reports.map((report) => (
                  <div className="admin-queue-item" key={report.id}>
                    <div className="admin-queue-item__main">
                      <div className="admin-queue-item__meta">
                        <span className="gh-state gh-state-pending">
                          Report
                        </span>

                        <span className="admin-queue-item__id">
                          #{report.id}
                        </span>

                        <span className="admin-queue-item__time">
                          {new Date(report.created_at).toLocaleString('id-ID')}
                        </span>
                      </div>

                      <p className="admin-queue-item__preview">
                        <strong>
                          {report.menfess_id
                            ? `Menfess #${report.menfess_id}`
                            : `Komentar #${report.comment_id}`}
                        </strong>
                      </p>

                      <p className="admin-queue-item__preview">
                        Alasan: "{report.reason}"
                      </p>
                      <div className="admin-queue-item__actions">
                        <button
                          type="button"
                          className="gh-btn gh-btn-sm"
                          onClick={() => deleteReportedContent(report)}
                        >
                          Hapus
                        </button>

                        <button
                          type="button"
                          className="gh-btn gh-btn-sm"
                          onClick={() => updateReportStatus(report.id, 'dismissed')}
                        >
                          Abaikan
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

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
