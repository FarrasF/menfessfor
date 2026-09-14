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

  if (diffMins < 1) return 'Baru saja';
  if (diffMins < 60) return `${diffMins} menit lalu`;
  if (diffHours < 24) return `${diffHours} jam lalu`;
  if (diffDays < 7) return `${diffDays} hari lalu`;

  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function CommentCard({ id, content, created_at }) {
  const anonId = String(id).padStart(3, '0');

  return (
    <div className="comment-card">
      <div className="comment-card__header">
        <div className="comment-card__anon">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          ANONIM #{anonId}
        </div>
        <span className="comment-card__time">{formatTime(created_at)}</span>
      </div>
      <p className="comment-card__content">{content}</p>
    </div>
  );
}

export default CommentCard;
