import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMusicById } from '../lib/music';
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

/**
 * Minimalist Music Box inside Menfess Card
 * Click-to-play, matching the search list style
 */
export function CardMusicPlayer({ songId, cover, title, artist, album, preview }) {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [activePreview, setActivePreview] = useState(preview || null);
  const shouldPlayAfterFetch = useRef(false);

  useEffect(() => {
    let isMounted = true;

    if (preview) {
      setActivePreview(preview);
    }

    if (songId) {
      getMusicById(songId)
        .then((song) => {
          if (isMounted && song?.preview) {
            setActivePreview(song.preview);
          }
        })
        .catch((err) => {
          console.error('Failed to get fresh preview for song:', songId, err);
        });
    }

    return () => {
      isMounted = false;
    };
  }, [songId, preview]);

  useEffect(() => {
    if (shouldPlayAfterFetch.current && activePreview && audioRef.current) {
      shouldPlayAfterFetch.current = false;
      audioRef.current.play().catch((err) => {
        setIsBuffering(false);
        console.error('Audio play error:', err);
      });
    }
  }, [activePreview]);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  const togglePlay = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      if (!activePreview && songId) {
        shouldPlayAfterFetch.current = true;
        setIsBuffering(true);
        getMusicById(songId)
          .then((song) => {
            if (song?.preview) {
              setActivePreview(song.preview);
            } else {
              setIsBuffering(false);
            }
          })
          .catch(() => setIsBuffering(false));
        return;
      }

      setIsBuffering(true);
      audio.play().catch((err) => {
        setIsBuffering(false);
        console.error('Audio play error:', err);
      });
    }
  };

  const audioSrc = activePreview || preview;

  return (
    <div
      className={`gh-card__music ${isPlaying ? 'gh-card__music--playing' : ''}`}
      draggable={false}
      onDragStart={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        togglePlay(e);
      }}
      title={isPlaying ? 'Klik untuk jeda musik' : 'Klik untuk putar preview musik'}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          e.stopPropagation();
          togglePlay(e);
        }
      }}
    >
      {audioSrc && (
        <audio
          ref={audioRef}
          src={audioSrc}
          preload="none"
          onWaiting={() => setIsBuffering(true)}
          onPlaying={() => {
            setIsBuffering(false);
            setIsPlaying(true);
          }}
          onCanPlay={() => setIsBuffering(false)}
          onPlay={(e) => {
            const allAudios = document.querySelectorAll('audio');
            allAudios.forEach((a) => {
              if (a !== e.currentTarget && !a.paused) {
                a.pause();
              }
            });
            setIsPlaying(true);
          }}
          onPause={() => {
            setIsBuffering(false);
            setIsPlaying(false);
          }}
          onEnded={() => {
            setIsPlaying(false);
            setIsBuffering(false);
          }}
          onError={() => {
            setIsBuffering(false);
            if (songId) {
              getMusicById(songId).then((song) => {
                if (song?.preview && song.preview !== activePreview) {
                  setActivePreview(song.preview);
                }
              });
            }
          }}
        />
      )}

      {/* Album Cover with Play/Equalizer State */}
      <div className="gh-card__music-cover-wrap">
        {cover ? (
          <img
            src={cover}
            alt={title || 'Cover lagu'}
            className="gh-card__music-cover"
            loading="lazy"
            draggable={false}
          />
        ) : (
          <div className="gh-card__music-cover gh-card__music-cover--placeholder">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
              <path d="M12 2v8.5a2.5 2.5 0 1 1-2-2.45V4.25l-6 1.5v6.75a2.5 2.5 0 1 1-2-2.45V3.5a1 1 0 0 1 .76-.97l8-2A1 1 0 0 1 12 2Z" />
            </svg>
          </div>
        )}

        {isPlaying ? (
          <div className="gh-card__music-playing-overlay">
            {isBuffering ? (
              <svg className="gh-music-spinner" width="12" height="12" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="6" stroke="#fff" strokeWidth="2.5" strokeOpacity="0.25" />
                <path d="M8 2a6 6 0 0 1 6 6" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
            ) : (
              <span className="gh-music-eq gh-music-eq--compact">
                <span className="gh-music-eq__bar" />
                <span className="gh-music-eq__bar" />
                <span className="gh-music-eq__bar" />
              </span>
            )}
          </div>
        ) : (
          <div className="gh-card__music-hover-overlay">
            <svg width="10" height="10" viewBox="0 0 16 16" fill="#ffffff">
              <path d="M4.5 2.25a.75.75 0 0 1 1.14-.64l8.5 5.75a.75.75 0 0 1 0 1.28l-8.5 5.75A.75.75 0 0 1 4.5 13.75V2.25Z" />
            </svg>
          </div>
        )}
      </div>

      {/* Song Details */}
      <div className="gh-card__music-details">
        <div className="gh-card__music-title-row">
          <span className="gh-card__music-title" title={title}>
            {title}
          </span>
        </div>
        <div className="gh-card__music-subtitle">
          <span>{artist}</span>
          {album && (
            <>
              <span className="gh-card__music-dot">•</span>
              <span>{album}</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function MenfessCard({
  id,
  content,
  category,
  likes,
  comments_count,
  created_at,
  song_id,
  song_title,
  song_artist,
  song_album,
  song_cover,
  song_preview,
  isPreview = false,
}) {
  const anonId = isPreview ? '000' : String(id || 0).padStart(3, '0');
  const safeLikes = likes ?? 0;
  const safeComments = comments_count ?? 0;
  const hasSong = Boolean(song_title || song_id || song_preview);

  const cardInner = (
    <>
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

        {/* Music Player Row if song exists */}
        {hasSong && (
          <CardMusicPlayer
            songId={song_id}
            cover={song_cover}
            title={song_title}
            artist={song_artist}
            album={song_album}
            preview={song_preview}
          />
        )}

        {/* Metadata Row */}
        <div className="gh-card__meta">
          <div className="gh-card__identity">
            <span className="gh-card__id">#{anonId}</span>
            <span className="gh-card__meta-separator">•</span>
            <span className="gh-card__author">ANONIM</span>
            <span className="gh-card__meta-separator">•</span>
            <span className="gh-card__time">
              {isPreview ? 'dikirim baru saja' : `dikirim ${formatTime(created_at)}`}
            </span>
          </div>

          {/* Reaction & Comments stats on the right */}
          <div className="gh-card__stats">
            {safeLikes > 0 && (
              <span className="gh-card__stat" title={`${safeLikes} suka`}>
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 16 16"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="m8 14.25.345.666a.75.75 0 0 1-.69 0l-.008-.004-.018-.01a7.152 7.152 0 0 1-.31-.17 22.055 22.055 0 0 1-3.434-2.414C2.045 10.731 0 8.35 0 5.5 0 2.836 2.086 1 4.75 1 6.3 1 7.28 1.84 8 2.68 8.72 1.84 9.7 1 11.25 1 13.914 1 16 2.836 16 5.5c0 2.85-2.045 5.231-3.885 6.818a22.094 22.094 0 0 1-3.433 2.414 7.152 7.152 0 0 1-.31.17l-.018.01-.008.004L8 14.25Zm0-1.445.006-.003.037-.019c.145-.077.37-.2.66-.368a20.6 20.6 0 0 0 3.196-2.248C13.635 8.85 14.5 6.98 14.5 5.5 14.5 3.7 13.06 2.5 11.25 2.5c-1.3 0-2.26.83-2.61 1.76a.75.75 0 0 1-1.28 0C7.01 3.33 6.05 2.5 4.75 2.5 2.94 2.5 1.5 3.7 1.5 5.5c0 1.48.864 3.35 2.607 4.616a20.61 20.61 0 0 0 3.196 2.248c.29.168.515.291.66.368l.037.019.006.003h-.012Z" />
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
    </>
  );

  if (isPreview) {
    return (
      <div className="gh-card gh-card--preview" aria-label="Pratinjau diskusi anonim">
        {cardInner}
      </div>
    );
  }

  return (
    <Link
      to={`/menfess/${id}`}
      className="gh-card"
      draggable={false}
      onDragStart={(e) => {
        if (e.target.closest('.gh-card__music')) {
          e.preventDefault();
        }
      }}
      aria-label={`Baca diskusi anonim #${anonId}`}
    >
      {cardInner}
    </Link>
  );
}

export default MenfessCard;
