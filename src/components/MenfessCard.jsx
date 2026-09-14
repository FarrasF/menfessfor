import { Link } from 'react-router-dom';
import './MenfessCard.css';

/**
 * Formats a date string into a relative or absolute time display.
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

function MenfessCard({ id, content, category, likes, comments_count, created_at }) {
  const anonId = String(id).padStart(3, '0');

  return (
    <Link to={`/menfess/${id}`} className="menfess-card clay-card" aria-label={`Baca menfess ANONIM #${anonId}`}>
      <div className="menfess-card__header">
        <span className={`menfess-card__category clay-pill ${getCategoryClass(category)}`}>
          {category}
        </span>
        <span className="menfess-card__time">{formatTime(created_at)}</span>
      </div>

      <div className="menfess-card__anon">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
        ANONIM #{anonId}
      </div>

      <p className="menfess-card__content">{content}</p>

      <div className="menfess-card__footer">
        <div className="menfess-card__stat">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
          <span>{likes}</span>
        </div>
        <div className="menfess-card__stat">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          <span>{comments_count}</span>
        </div>
      </div>
    </Link>
  );
}

export default MenfessCard;
