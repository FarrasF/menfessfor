import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import CommentCard from '../components/CommentCard';
import ReportModal from '../components/ReportModal';
import { dummyMenfess, dummyComments } from '../data/dummyData';
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
  const [commentText, setCommentText] = useState('');
  const [reportOpen, setReportOpen] = useState(false);
  const [reportTarget, setReportTarget] = useState({ type: 'menfess', id: null });

  const menfess = dummyMenfess.find((m) => m.id === Number(id));
  const [commentsList, setCommentsList] = useState(
    dummyComments.filter((c) => c.menfess_id === Number(id))
  );

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
              Kembali ke Discussions
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

    const newComment = {
      id: Date.now(),
      menfess_id: menfess.id,
      content: commentText.trim(),
      created_at: new Date().toISOString(),
    };

    setCommentsList([...commentsList, newComment]);
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
            Semua Discussions
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
              Open
            </span>

            <span className={`gh-label ${getCategoryLabelClass(menfess.category)}`}>
              {menfess.category}
            </span>

            <span className="gh-issue-header__info">
              Anonim opened this discussion on {formatDetailTime(menfess.created_at)} • {commentsList.length} comments
            </span>
          </div>
        </div>

        {/* Discussion Timeline */}
        <div className="gh-timeline">
          {/* Original Post (Root comment) */}
          <div className="gh-timeline-item">
            <div className="gh-box gh-comment-box gh-comment-box--root">
              <div className="gh-comment-box__header">
                <div className="gh-comment-box__author">
                  <span className="gh-comment-box__name">ANONIM</span>
                  <span className="gh-comment-box__id">#{anonId}</span>
                  <span className="gh-badge-author">Author</span>
                  <span className="gh-comment-box__action">dikirim {formatDetailTime(menfess.created_at)}</span>
                </div>

                <div className="gh-comment-box__actions">
                  <button
                    type="button"
                    className="gh-comment-box__report-btn"
                    onClick={() => handleOpenReport(menfess.id, 'menfess')}
                    title="Laporkan menfess"
                  >
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                      <path d="M1.75 1.5a.75.75 0 0 0-.75.75v12a.75.75 0 0 0 1.5 0V9.25h3.284a2.25 2.25 0 0 1 1.77.863l.364.456a3.75 3.75 0 0 0 2.95 1.438H14a.75.75 0 0 0 .75-.75V3.5a.75.75 0 0 0-.75-.75H10.9a2.25 2.25 0 0 1-1.77-.863l-.364-.456A3.75 3.75 0 0 0 5.818 0H1.75Zm0 1.5h4.068c.683 0 1.343.277 1.82.772l.364.456A3.75 3.75 0 0 0 10.95 5.5H13.25v4.25h-2.3a2.25 2.25 0 0 1-1.77-.863l-.364-.456A3.75 3.75 0 0 0 5.818 7H2.5V3Z" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="gh-comment-box__body">
                <p className="gh-comment-box__text gh-comment-box__text--lg">{menfess.content}</p>
              </div>

              {/* GitHub Reactions Bar */}
              <div className="gh-comment-box__reactions">
                <button
                  type="button"
                  className={`gh-btn gh-btn-sm ${liked ? 'gh-btn--active' : ''}`}
                  onClick={() => setLiked(!liked)}
                  aria-pressed={liked}
                >
                  <svg width="14" height="14" viewBox="0 0 16 16" fill={liked ? '#cf222e' : 'currentColor'} aria-hidden="true">
                    <path d="m8 14.25.345.666a.75.75 0 0 1-.69 0l-.008-.004-.018-.01a7.152 7.152 0 0 1-.31-.17 22.055 22.055 0 0 1-3.434-2.414C2.045 10.731 0 8.35 0 5.5 0 2.836 2.086 1 4.75 1 6.3 1 7.28 1.84 8 2.68 8.72 1.84 9.7 1 11.25 1 13.914 1 16 2.836 16 5.5c0 2.85-2.045 5.231-3.885 6.818a22.094 22.094 0 0 1-3.433 2.414 7.152 7.152 0 0 1-.31.17l-.018.01-.008.004L8 14.25Zm0-1.445.006-.003.037-.019c.145-.077.37-.2.66-.368a20.6 20.6 0 0 0 3.196-2.248C13.635 8.85 14.5 6.98 14.5 5.5 14.5 3.7 13.06 2.5 11.25 2.5c-1.3 0-2.26.83-2.61 1.76a.75.75 0 0 1-1.28 0C7.01 3.33 6.05 2.5 4.75 2.5 2.94 2.5 1.5 3.7 1.5 5.5c0 1.48.864 3.35 2.607 4.616a20.61 20.61 0 0 0 3.196 2.248c.29.168.515.291.66.368l.037.019.006.003h-.012Z" />
                  </svg>
                  <span>{menfess.likes + (liked ? 1 : 0)}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Comment list connected by vertical line */}
          {commentsList.length > 0 && (
            <div className="gh-timeline-list">
              {commentsList.map((comment) => (
                <CommentCard
                  key={comment.id}
                  {...comment}
                  onReport={handleOpenReport}
                />
              ))}
            </div>
          )}

          {/* New Comment Box (like GitHub discussion comment form) */}
          <div className="gh-timeline-reply">
            <form className="gh-box gh-reply-box" onSubmit={handleCommentSubmit}>
              <div className="gh-reply-box__header">
                <span className="gh-reply-box__title">Tulis Komentar Anonim</span>
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
                  Comment
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
