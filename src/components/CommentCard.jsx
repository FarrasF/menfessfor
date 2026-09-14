import './CommentCard.css';

/**
 * Formats a date string for display.
 */
function formatTime(dateString) {
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

function CommentCard({ id, content, created_at, onReport }) {
  const anonId = String(id).padStart(3, '0');

  return (
    <div className="gh-timeline-comment">
      {/* GitHub Comment Box */}
      <div className="gh-box gh-comment-box">
        <div className="gh-comment-box__header">
          <div className="gh-comment-box__author">
            <span className="gh-comment-box__name">ANONIM</span>
            <span className="gh-comment-box__id">#{anonId}</span>
            <span className="gh-comment-box__action">berkomentar {formatTime(created_at)}</span>
          </div>

          <div className="gh-comment-box__actions">
            {onReport && (
              <button
                type="button"
                className="gh-comment-box__report-btn"
                onClick={() => onReport(id, 'comment')}
                title="Laporkan komentar"
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
      </div>
    </div>
  );
}

export default CommentCard;
