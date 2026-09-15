import { Link } from 'react-router-dom';
import './MenfessCard.css';

/**
 * Formats a date string into a relative or absolute time display.
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
  return map[category] || 'gh-label-random';
}

function MenfessCard({ id, content, category, likes, comments_count, created_at }) {
  const anonId = String(id).padStart(3, '0');
  const safeLikes = likes ?? 0;
  const safeComments = comments_count ?? 0;

  return (
    <Link to={`/menfess/${id}`} className="gh-card" aria-label={`Baca diskusi anonim #${anonId}`}>
      {/* GitHub Discussion Purple Bubble Icon */}
      <div className="gh-card__icon" title="Diskusi">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="#8250df" aria-hidden="true">
          <path d="M1.75 1A1.75 1.75 0 0 0 0 2.75v9.5C0 13.216.784 14 1.75 14H3v1.543a1.457 1.457 0 0 0 2.487 1.03L8.06 14h6.19A1.75 1.75 0 0 0 16 12.25v-9.5A1.75 1.75 0 0 0 14.25 1H1.75ZM1.5 2.75a.25.25 0 0 1 .25-.25h12.5a.25.25 0 0 1 .25.25v9.5a.25.25 0 0 1-.25.25h-6.5a.75.75 0 0 0-.53.22L4.5 15.44v-2.19a.75.75 0 0 0-.75-.75h-2a.25.25 0 0 1-.25-.25v-9.5Z" />
        </svg>
      </div>

      <div className="gh-card__main">
        {/* Title / Content Preview Row */}
        <div className="gh-card__title-row">
          <span className="gh-card__title">{content}</span>
          <span className={`gh-label ${getCategoryLabelClass(category)}`}>
            {category || 'Umum'}
          </span>
        </div>

        {/* Metadata Row */}
        <div className="gh-card__meta">
          <div className="gh-card__identity">
            <span className="gh-card__id">#{anonId}</span>
            <span className="gh-card__meta-separator">•</span>
            <span className="gh-card__author">ANONIM</span>
            <span className="gh-card__meta-separator">•</span>
            <span className="gh-card__time">dikirim {formatTime(created_at)}</span>
          </div>

          {/* Reaction & Comments stats on the right */}
          <div className="gh-card__stats">
            {safeLikes > 0 && (
              <span className="gh-card__stat" title={`${safeLikes} likes`}>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>

                <span>{safeLikes}</span>
              </span>
            )}

            <span className="gh-card__stat" title={`${safeComments} komentar`}>
              <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                <path d="M1 2.75C1 1.784 1.784 1 2.75 1h10.5c.966 0 1.75.784 1.75 1.75v7.5A1.75 1.75 0 0 1 13.25 12H9.06l-2.573 2.573A1.458 1.458 0 0 1 4 13.543V12H2.75A1.75 1.75 0 0 1 1 10.25Zm1.75-.25a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h2a.75.75 0 0 1 .75.75v2.19l2.72-2.72a.749.749 0 0 1 .53-.22h4.5a.25.25 0 0 0 .25-.25v-7.5a.25.25 0 0 0-.25-.25Z" />
              </svg>
              <span>{safeComments}</span>
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default MenfessCard;
