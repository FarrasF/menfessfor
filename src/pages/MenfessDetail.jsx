import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import CommentCard from '../components/CommentCard';
import ReportModal from '../components/ReportModal';
import { dummyMenfess, dummyComments } from '../data/dummyData';
import { supabase } from '../lib/supabase';
import './MenfessDetail.css';

function getCategoryLabelClass(category) {
  const map = {
    Confess: 'gh-label-confess',
    Curhat: 'gh-label-curhat',
    Akademik: 'gh-label-akademik',
    Random: 'gh-label-random',
  };
  return map[category] || '';
}

function formatDetailTime(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function MenfessDetail() {
  const { id } = useParams();
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [commentText, setCommentText] = useState('');
  const [anonymousId, setAnonymousId] = useState('');
  const [reportOpen, setReportOpen] = useState(false);
  const [reportTarget, setReportTarget] = useState({ type: 'menfess', id: null });

  const [menfess, setMenfess] = useState(null);
  const [commentsList, setCommentsList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMenfess();
    fetchComments();
    fetchLikes();
  }, [id]);

  useEffect(() => {
    if (menfess) {
      const anonNum = String(menfess.id).padStart(3, '0');
      const snippet = menfess.content
        ? (menfess.content.length > 28 ? menfess.content.slice(0, 28).trim() + '…' : menfess.content.trim())
        : 'Menfess';
      document.title = `${snippet} · Diskusi #${anonNum} · menfessfor`;
    } else {
      document.title = 'Diskusi · menfessfor';
    }
  }, [menfess]);

  function getAnonymousId() {
    let anonId = localStorage.getItem('anonymous_id');

    if (!anonId) {
      anonId = crypto.randomUUID();
      localStorage.setItem('anonymous_id', anonId);
    }

    return anonId;
  }

  async function fetchLikes() {
    const { data, error } = await supabase
      .from('likes')
      .select('id, anonymous_id')
      .eq('menfess_id', id);

    if (error) {
      console.error('Gagal mengambil likes:', error);
      return;
    }

    setLikeCount(data.length);

    const currentAnonymousId = getAnonymousId();
    setAnonymousId(currentAnonymousId);

    const userHasLiked = data.some(
      (like) => like.anonymous_id === currentAnonymousId
    );

    setLiked(userHasLiked);
  }

  async function handleLike() {
    const currentAnonymousId = anonymousId || getAnonymousId();

    if (liked) {
      // Unlike
      const { error } = await supabase.rpc('remove_like', {
        p_menfess_id: Number(id),
        p_anonymous_id: currentAnonymousId,
      });

      if (error) {
        console.error('Gagal unlike:', error);
        alert('Gagal membatalkan like.');
        return;
      }

      setLiked(false);
      setLikeCount((current) => Math.max(0, current - 1));
    } else {
      // Like
      const { error } = await supabase
        .from('likes')
        .insert([
          {
            menfess_id: Number(id),
            anonymous_id: currentAnonymousId,
          },
        ]);

      if (error) {
        console.error('Gagal like:', error);
        alert('Gagal memberikan like.');
        return;
      }

      setLiked(true);
      setLikeCount((current) => current + 1);
    }
  }

  async function fetchMenfess() {
    const { data, error } = await supabase
      .from('menfess')
      .select('*')
      .eq('id', id)
      .eq('status', 'approved')
      .single();

    if (error) {
      console.error('Gagal mengambil menfess:', error);
    } else {
      setMenfess(data);
    }

    setLoading(false);
  }

  async function fetchComments() {
    const { data, error } = await supabase
      .from('comments')
      .select('*')
      .eq('menfess_id', id)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Gagal mengambil komentar:', error);
      return;
    }

    setCommentsList(data);
  }

  if (loading) {
    return (
      <main className="page">
        <div className="container container--sm">
          <p>Memuat menfess...</p>
        </div>
      </main>
    );
  }

  if (!menfess) {
    return (
      <main className="page">
        <div className="container container--sm">
          <div className="gh-box detail-notfound">
            <svg width="40" height="40" viewBox="0 0 16 16" fill="var(--color-fg-muted)" aria-hidden="true">
              <path d="M8 1.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13ZM0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8Zm9 3a1 1 0 1 1-2 0 1 1 0 0 1 2 0Zm-.25-6.25a.75.75 0 0 0-1.5 0v3.5a.75.75 0 0 0 1.5 0v-3.5Z" />
            </svg>
            <h2>Menfess tidak ditemukan</h2>
            <p>Menfess yang kamu cari tidak ada atau telah dihapus.</p>
            <Link to="/" className="gh-btn gh-btn-primary">
              Kembali ke Diskusi
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const anonId = String(menfess.id).padStart(3, '0');

  const handleCommentSubmit = async (e) => {
    e.preventDefault();

    if (!commentText.trim()) return;

    const { data, error } = await supabase
      .from('comments')
      .insert([
        {
          menfess_id: Number(id),
          content: commentText.trim(),
        },
      ])
      .select()
      .single();

    console.log('COMMENT DATA:', data);
    console.log('COMMENT ERROR:', error);

    if (error) {
      console.error('Gagal mengirim komentar:', error);
      alert('Komentar gagal dikirim.');
      return;
    }

    setCommentsList((current) => [...current, data]);
    setCommentText('');
  };

  const handleOpenReport = (targetId, type = 'menfess') => {
    setReportTarget({ type, id: targetId });
    setReportOpen(true);
  };

  return (
    <main className="page">
      <div className="container container--sm">
        {/* Navigation Breadcrumbs */}
        <div className="detail-breadcrumb">
          <Link to="/" className="detail-back-link">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
              <path d="M7.78 12.53a.75.75 0 0 1-1.06 0L2.47 8.28a.75.75 0 0 1 0-1.06l4.25-4.25a.751.751 0 0 1 1.042.018.751.751 0 0 1 .018 1.042L4.81 7h7.44a.75.75 0 0 1 0 1.5H4.81l2.97 2.97a.75.75 0 0 1 0 1.06Z" />
            </svg>
            Semua Diskusi
          </Link>
        </div>

        {/* Issue Title Header */}
        <div className="gh-issue-header">
          <h1 className="gh-issue-header__title">
            <span>Menfess anonim</span>
            <span className="gh-issue-header__number">#{anonId}</span>
          </h1>

          <div className="gh-issue-header__meta">
            <span className="gh-state gh-state-open">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                <path d="M1.75 1A1.75 1.75 0 0 0 0 2.75v9.5C0 13.216.784 14 1.75 14H3v1.543a1.457 1.457 0 0 0 2.487 1.03L8.06 14h6.19A1.75 1.75 0 0 0 16 12.25v-9.5A1.75 1.75 0 0 0 14.25 1H1.75ZM1.5 2.75a.25.25 0 0 1 .25-.25h12.5a.25.25 0 0 1 .25.25v9.5a.25.25 0 0 1-.25.25h-6.5a.75.75 0 0 0-.53.22L4.5 15.44v-2.19a.75.75 0 0 0-.75-.75h-2a.25.25 0 0 1-.25-.25v-9.5Z" />
              </svg>
              Terbuka
            </span>

            <span className={`gh-label ${getCategoryLabelClass(menfess.category)}`}>
              {menfess.category}
            </span>

            <span className="gh-issue-header__info">
              Anonim membuka diskusi ini pada {formatDetailTime(menfess.created_at)} • {commentsList.length} komentar
            </span>
          </div>
        </div>

        {/* Discussion Timeline */}
        <div className="gh-timeline">
          {/* Original Post (Root menfess comment) */}
          <div className="gh-timeline-item gh-timeline-item--root">
            <article className="gh-box gh-comment-box gh-comment-box--root">
              <div className="gh-comment-box__header gh-comment-box__header--root">
                <div className="gh-comment-box__author">
                  {/* Root Post Author Avatar Indicator */}
                  <div className="gh-comment-avatar gh-comment-avatar--author" title="Penulis Diskusi" aria-hidden="true">
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                      <path d="M10.561 8.073a6.005 6.005 0 0 1 3.432 5.142.75.75 0 1 1-1.498.07 4.5 4.5 0 0 0-8.99 0 .75.75 0 0 1-1.498-.07 6.004 6.004 0 0 1 3.431-5.142 3.999 3.999 0 1 1 5.123 0ZM10.5 5a2.5 2.5 0 1 0-5 0 2.5 2.5 0 0 0 5 0Z" />
                    </svg>
                  </div>

                  <span className="gh-comment-box__name">Anonim</span>
                  <span className="gh-comment-box__id">#{anonId}</span>
                  <span className="gh-badge-author">Penulis</span>
                  <span className="gh-comment-box__dot">•</span>
                  <span className="gh-comment-box__action">dikirim {formatDetailTime(menfess.created_at)}</span>
                </div>

                <div className="gh-comment-box__actions">
                  <button
                    type="button"
                    className="gh-comment-box__report-btn"
                    onClick={() => handleOpenReport(menfess.id, 'menfess')}
                    title="Laporkan menfess ini"
                    aria-label="Laporkan menfess ini"
                  >
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                      <path d="M1.75 1.5a.75.75 0 0 0-.75.75v12a.75.75 0 0 0 1.5 0V9.25h3.284a2.25 2.25 0 0 1 1.77.863l.364.456a3.75 3.75 0 0 0 2.95 1.438H14a.75.75 0 0 0 .75-.75V3.5a.75.75 0 0 0-.75-.75H10.9a2.25 2.25 0 0 1-1.77-.863l-.364-.456A3.75 3.75 0 0 0 5.818 0H1.75Zm0 1.5h4.068c.683 0 1.343.277 1.82.772l.364.456A3.75 3.75 0 0 0 10.95 5.5H13.25v4.25h-2.3a2.25 2.25 0 0 1-1.77-.863l-.364-.456A3.75 3.75 0 0 0 5.818 7H2.5V3Z" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="gh-comment-box__body gh-comment-box__body--root">
                <p className="gh-comment-box__text gh-comment-box__text--lg">{menfess.content}</p>
              </div>

              {/* GitHub Reactions Bar */}
              <div className="gh-comment-box__reactions">
                <button
                  type="button"
                  className={`gh-btn gh-btn-sm ${liked ? 'gh-btn--active' : ''}`}
                  onClick={handleLike}
                  aria-pressed={liked}
                  title={liked ? 'Batalkan suka' : 'Beri suka'}
                >
                  <svg width="14" height="14" viewBox="0 0 16 16" fill={liked ? '#cf222e' : 'currentColor'} aria-hidden="true">
                    <path d="m8 14.25.345.666a.75.75 0 0 1-.69 0l-.008-.004-.018-.01a7.152 7.152 0 0 1-.31-.17 22.055 22.055 0 0 1-3.434-2.414C2.045 10.731 0 8.35 0 5.5 0 2.836 2.086 1 4.75 1 6.3 1 7.28 1.84 8 2.68 8.72 1.84 9.7 1 11.25 1 13.914 1 16 2.836 16 5.5c0 2.85-2.045 5.231-3.885 6.818a22.094 22.094 0 0 1-3.433 2.414 7.152 7.152 0 0 1-.31.17l-.018.01-.008.004L8 14.25Zm0-1.445.006-.003.037-.019c.145-.077.37-.2.66-.368a20.6 20.6 0 0 0 3.196-2.248C13.635 8.85 14.5 6.98 14.5 5.5 14.5 3.7 13.06 2.5 11.25 2.5c-1.3 0-2.26.83-2.61 1.76a.75.75 0 0 1-1.28 0C7.01 3.33 6.05 2.5 4.75 2.5 2.94 2.5 1.5 3.7 1.5 5.5c0 1.48.864 3.35 2.607 4.616a20.61 20.61 0 0 0 3.196 2.248c.29.168.515.291.66.368l.037.019.006.003h-.012Z" />
                  </svg>
                  <span>{likeCount}</span>
                </button>
              </div>
            </article>
          </div>

          {/* Comments Section Header / Hierarchy Divider */}
          <div className="gh-comments-divider">
            <div className="gh-comments-divider__line" />
            <div className="gh-comments-divider__pill">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                <path d="M1 2.75C1 1.784 1.784 1 2.75 1h10.5c.966 0 1.75.784 1.75 1.75v7.5A1.75 1.75 0 0 1 13.25 12H9.06l-2.573 2.573A1.458 1.458 0 0 1 4 13.543V12H2.75A1.75 1.75 0 0 1 1 10.25Zm1.75-.25a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h2a.75.75 0 0 1 .75.75v2.19l2.72-2.72a.749.749 0 0 1 .53-.22h4.5a.25.25 0 0 0 .25-.25v-7.5a.25.25 0 0 0-.25-.25Z" />
              </svg>
              <span>{commentsList.length} Komentar</span>
            </div>
            <div className="gh-comments-divider__line" />
          </div>

          {/* Comments Stream / List */}
          {commentsList.length > 0 ? (
            <div className="gh-timeline-list">
              {commentsList.map((comment) => (
                <CommentCard
                  key={comment.id}
                  {...comment}
                  onReport={handleOpenReport}
                />
              ))}
            </div>
          ) : (
            <div className="gh-comments-empty">
              <p>Belum ada komentar pada diskusi ini. Jadilah yang pertama berkomentar!</p>
            </div>
          )}

          {/* New Comment Box (like GitHub discussion comment form) */}
          <div className="gh-timeline-reply">
            <form className="gh-box gh-reply-box" onSubmit={handleCommentSubmit}>
              <div className="gh-reply-box__header">
                <div className="gh-reply-box__header-left">
                  <div
                    className="gh-comment-avatar gh-comment-avatar--default"
                    aria-hidden="true"
                  >
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                      <path d="M10.561 8.073a6.005 6.005 0 0 1 3.432 5.142.75.75 0 1 1-1.498.07 4.5 4.5 0 0 0-8.99 0 .75.75 0 0 1-1.498-.07 6.004 6.004 0 0 1 3.431-5.142 3.999 3.999 0 1 1 5.123 0ZM10.5 5a2.5 2.5 0 1 0-5 0 2.5 2.5 0 0 0 5 0Z" />
                    </svg>
                  </div>
                  <span className="gh-reply-box__title">Tulis Komentar Anonim</span>
                </div>
                <span className="gh-reply-box__counter">{commentText.length} / 300</span>
              </div>
              <div className="gh-reply-box__body">
                <textarea
                  className="gh-input gh-reply-box__textarea"
                  placeholder="Tambahkan komentar atau tanggapanmu..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  rows={4}
                  maxLength={300}
                />
              </div>
              <div className="gh-reply-box__footer">
                <span className="gh-reply-box__privacy">Komentar sepenuhnya anonim</span>
                <button
                  type="submit"
                  className="gh-btn gh-btn-primary"
                  disabled={!commentText.trim()}
                >
                  Kirim Komentar
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <ReportModal
        isOpen={reportOpen}
        onClose={() => setReportOpen(false)}
        targetType={reportTarget.type}
        targetId={reportTarget.id}
      />
    </main>
  );
}

export default MenfessDetail;
