import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import CommentCard from '../components/CommentCard';
import ReportModal from '../components/ReportModal';
import { dummyMenfess, dummyComments } from '../data/dummyData';
import './MenfessDetail.css';

/**
 * Returns the CSS class for a given category.
 */
function getCategoryClass(category) {
  const map = {
    Confess: 'category-confess',
    Curhat: 'category-curhat',
    Akademik: 'category-akademik',
    Random: 'category-random',
  };
  return map[category] || '';
}

function formatTime(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function MenfessDetail() {
  const { id } = useParams();
  const [liked, setLiked] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [reportOpen, setReportOpen] = useState(false);

  const menfess = dummyMenfess.find((m) => m.id === Number(id));
  const comments = dummyComments.filter((c) => c.menfess_id === Number(id));

  if (!menfess) {
    return (
      <main className="page">
        <div className="container">
          <div className="detail-notfound clay-card">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <h2>Menfess tidak ditemukan</h2>
            <p>Menfess yang kamu cari tidak ada atau sudah dihapus.</p>
            <Link to="/" className="clay-button clay-button--cta">
              Kembali ke Home
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const anonId = String(menfess.id).padStart(3, '0');

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    // Future: send to Supabase
    console.log('Comment submitted:', { menfess_id: menfess.id, content: commentText });
    setCommentText('');
  };

  return (
    <main className="page">
      <div className="container">
        <div className="detail-layout">
          {/* Back link */}
          <Link to="/" className="detail-back">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
            Kembali
          </Link>

          {/* Main menfess */}
          <article className="detail-card clay-card">
            <div className="detail-card__header">
              <span className={`clay-pill ${getCategoryClass(menfess.category)}`}>
                {menfess.category}
              </span>
              <span className="detail-card__time">{formatTime(menfess.created_at)}</span>
            </div>

            <div className="detail-card__anon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              ANONIM #{anonId}
            </div>

            <p className="detail-card__content">{menfess.content}</p>

            <div className="detail-card__actions">
              <button
                className={`detail-card__action clay-button ${liked ? 'detail-card__action--liked' : 'clay-button--ghost'}`}
                onClick={() => setLiked(!liked)}
                aria-label={liked ? 'Unlike' : 'Like'}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill={liked ? 'var(--color-primary)' : 'none'} stroke={liked ? 'var(--color-primary)' : 'currentColor'} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
                {menfess.likes + (liked ? 1 : 0)}
              </button>

              <div className="detail-card__action detail-card__action--stat">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
                {comments.length} komentar
              </div>

              <button
                className="detail-card__action clay-button clay-button--ghost detail-card__report"
                onClick={() => setReportOpen(true)}
                aria-label="Laporkan menfess"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
                  <line x1="4" y1="22" x2="4" y2="15" />
                </svg>
              </button>
            </div>
          </article>

          {/* Comments Section */}
          <section className="detail-comments">
            <h2 className="detail-comments__title">
              Komentar ({comments.length})
            </h2>

            {/* Comment form */}
            <form className="detail-comment-form clay-card" onSubmit={handleCommentSubmit}>
              <textarea
                className="clay-input"
                placeholder="Tulis komentar anonim..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                rows={3}
                maxLength={300}
              />
              <button
                type="submit"
                className="clay-button clay-button--cta"
                disabled={!commentText.trim()}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
                Kirim
              </button>
            </form>

            {/* Comment list */}
            {comments.length > 0 ? (
              <div className="detail-comments__list">
                {comments.map((comment) => (
                  <CommentCard key={comment.id} {...comment} />
                ))}
              </div>
            ) : (
              <div className="detail-comments__empty">
                <p>Belum ada komentar. Jadilah yang pertama!</p>
              </div>
            )}
          </section>
        </div>
      </div>

      <ReportModal
        isOpen={reportOpen}
        onClose={() => setReportOpen(false)}
        targetType="menfess"
        targetId={menfess.id}
      />
    </main>
  );
}

export default MenfessDetail;
