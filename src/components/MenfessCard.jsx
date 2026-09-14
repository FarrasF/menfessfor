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

/**
 * Returns the GitHub label CSS class for a given category.
 */
function getCategoryLabelClass(category) {
  const map = {
    Confess: 'gh-label-confess',
    Curhat: 'gh-label-curhat',
    Akademik: 'gh-label-akademik',
    Random: 'gh-label-random',
  };
  return map[category] || '';
}

function MenfessCard({ id, content, category, likes, comments_count, created_at }) {
  const anonId = String(id).padStart(3, '0');

  return (
    <Link to={`/menfess/${id}`} className="gh-card" aria-label={`Baca menfess ANONIM #${anonId}`}>
      <div className="gh-card__icon" title="Open Discussion">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="#8250df" aria-hidden="true">
          <path d="M1.75 1A1.75 1.75 0 0 0 0 2.75v9.5C0 13.216.784 14 1.75 14H3v1.543a1.457 1.457 0 0 0 2.487 1.03L8.06 14h6.19A1.75 1.75 0 0 0 16 12.25v-9.5A1.75 1.75 0 0 0 14.25 1H1.75ZM1.5 2.75a.25.25 0 0 1 .25-.25h12.5a.25.25 0 0 1 .25.25v9.5a.25.25 0 0 1-.25.25h-6.5a.75.75 0 0 0-.53.22L4.5 15.44v-2.19a.75.75 0 0 0-.75-.75h-2a.25.25 0 0 1-.25-.25v-9.5Z" />
        </svg>
      </div>

      <div className="gh-card__main">
        <div className="gh-card__header">
          <div className="gh-card__identity">
            <span className="gh-card__author">ANONIM</span>
            <span className="gh-card__id">#{anonId}</span>
          </div>

          <span className={`gh-label ${getCategoryLabelClass(category)}`}>
            {category}
          </span>
        </div>

        <p className="gh-card__content">{content}</p>

        <div className="gh-card__meta">
          <span className="gh-card__time">dikirim {formatTime(created_at)}</span>

          <div className="gh-card__stats">
            <span className="gh-card__stat" title={`${likes} reaksi`}>
              <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                <path d="m8 14.25.345.666a.75.75 0 0 1-.69 0l-.008-.004-.018-.01a7.152 7.152 0 0 1-.31-.17 22.055 22.055 0 0 1-3.434-2.414C2.045 10.731 0 8.35 0 5.5 0 2.836 2.086 1 4.75 1 6.3 1 7.28 1.84 8 2.68 8.72 1.84 9.7 1 11.25 1 13.914 1 16 2.836 16 5.5c0 2.85-2.045 5.231-3.885 6.818a22.094 22.094 0 0 1-3.433 2.414 7.152 7.152 0 0 1-.31.17l-.018.01-.008.004L8 14.25Zm0-1.445.006-.003.037-.019c.145-.077.37-.2.66-.368a20.6 20.6 0 0 0 3.196-2.248C13.635 8.85 14.5 6.98 14.5 5.5 14.5 3.7 13.06 2.5 11.25 2.5c-1.3 0-2.26.83-2.61 1.76a.75.75 0 0 1-1.28 0C7.01 3.33 6.05 2.5 4.75 2.5 2.94 2.5 1.5 3.7 1.5 5.5c0 1.48.864 3.35 2.607 4.616a20.61 20.61 0 0 0 3.196 2.248c.29.168.515.291.66.368l.037.019.006.003h-.012Z" />
              </svg>
              <span>{likes}</span>
            </span>

            <span className="gh-card__stat" title={`${comments_count} komentar`}>
              <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                <path d="M1 2.75C1 1.784 1.784 1 2.75 1h10.5c.966 0 1.75.784 1.75 1.75v7.5A1.75 1.75 0 0 1 13.25 12H9.06l-2.573 2.573A1.458 1.458 0 0 1 4 13.543V12H2.75A1.75 1.75 0 0 1 1 10.25Zm1.75-.25a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h2a.75.75 0 0 1 .75.75v2.19l2.72-2.72a.749.749 0 0 1 .53-.22h4.5a.25.25 0 0 0 .25-.25v-7.5a.25.25 0 0 0-.25-.25Z" />
              </svg>
              <span>{comments_count}</span>
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default MenfessCard;
