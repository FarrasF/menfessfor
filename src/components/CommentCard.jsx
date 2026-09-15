import './CommentCard.css';

/**
 * Formats a date string for display.
 */
function formatTime(dateString) {
  if (!dateString) return 'baru saja';
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'baru saja';
  if (diffMins < 60) return `${diffMins}m yang lalu`;
  if (diffHours < 24) return `${diffHours}j yang lalu`;
  if (diffDays < 7) return `${diffDays}h yang lalu`;

  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

// Subtle deterministic avatar color schemes matching GitHub's muted pastel label tones
const AVATAR_SCHEMES = [
  { bg: '#ddf4ff', color: '#0969da', border: 'rgba(84, 174, 255, 0.4)' },
  { bg: '#fbefff', color: '#8250df', border: 'rgba(210, 168, 255, 0.4)' },
  { bg: '#dafbe1', color: '#1a7f37', border: 'rgba(116, 222, 137, 0.4)' },
  { bg: '#fff8c5', color: '#9a6700', border: 'rgba(212, 167, 44, 0.4)' },
  { bg: '#ffebe9', color: '#cf222e', border: 'rgba(255, 129, 130, 0.4)' },
  { bg: '#f6f8fa', color: '#57606a', border: '#d0d7de' },
];

function CommentCard({ id, content, created_at, onReport }) {
  const anonId = String(id).padStart(3, '0');
  const scheme = AVATAR_SCHEMES[Number(id || 0) % AVATAR_SCHEMES.length];

  return (
    <div className="gh-timeline-comment">
      {/* GitHub Individual Comment Card */}
      <article className="gh-box gh-comment-box gh-comment-box--reply">
        <div className="gh-comment-box__header">
          <div className="gh-comment-box__author">
            {/* Anonymous Commenter Avatar Indicator */}
            <div
              className="gh-comment-avatar"
              style={{
                backgroundColor: scheme.bg,
                color: scheme.color,
                borderColor: scheme.border,
              }}
              title={`Anonim #${anonId}`}
              aria-hidden="true"
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                <path d="M10.561 8.073a6.005 6.005 0 0 1 3.432 5.142.75.75 0 1 1-1.498.07 4.5 4.5 0 0 0-8.99 0 .75.75 0 0 1-1.498-.07 6.004 6.004 0 0 1 3.431-5.142 3.999 3.999 0 1 1 5.123 0ZM10.5 5a2.5 2.5 0 1 0-5 0 2.5 2.5 0 0 0 5 0Z" />
              </svg>
            </div>

            <span className="gh-comment-box__name">Anonim</span>
            <span className="gh-comment-box__id">#{anonId}</span>
            <span className="gh-comment-box__dot">•</span>
            <span className="gh-comment-box__action">berkomentar {formatTime(created_at)}</span>
          </div>

          <div className="gh-comment-box__actions">
            {onReport && (
              <button
                type="button"
                className="gh-comment-box__report-btn"
                onClick={() => onReport(id, 'comment')}
                title="Laporkan komentar ini"
                aria-label={`Laporkan komentar #${anonId}`}
              >
                <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                  <path d="M1.75 1.5a.75.75 0 0 0-.75.75v12a.75.75 0 0 0 1.5 0V9.25h3.284a2.25 2.25 0 0 1 1.77.863l.364.456a3.75 3.75 0 0 0 2.95 1.438H14a.75.75 0 0 0 .75-.75V3.5a.75.75 0 0 0-.75-.75H10.9a2.25 2.25 0 0 1-1.77-.863l-.364-.456A3.75 3.75 0 0 0 5.818 0H1.75Zm0 1.5h4.068c.683 0 1.343.277 1.82.772l.364.456A3.75 3.75 0 0 0 10.95 5.5H13.25v4.25h-2.3a2.25 2.25 0 0 1-1.77-.863l-.364-.456A3.75 3.75 0 0 0 5.818 7H2.5V3Z" />
                </svg>
              </button>
            )}
          </div>
        </div>

        <div className="gh-comment-box__body">
          <p className="gh-comment-box__text">{content}</p>
        </div>
      </article>
    </div>
  );
}

export default CommentCard;
