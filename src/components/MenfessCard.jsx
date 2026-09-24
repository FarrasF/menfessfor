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
 * Minimalist Music Player inside Menfess Card
 */
function CardMusicPlayer({ songId, cover, title, artist, preview }) {
  const audioRef = useRef(null);
  const sliderRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [activePreview, setActivePreview] = useState(preview || null);
  const shouldPlayAfterFetch = useRef(false);

  const isSeekingRef = useRef(false);

  // Global pointer/mouse up listener to ensure seeking state resets even if pointer leaves slider
  useEffect(() => {
    const handleGlobalPointerUp = () => {
      if (isSeekingRef.current) {
        isSeekingRef.current = false;
        const audio = audioRef.current;
        const slider = sliderRef.current;
        if (audio && slider && audio.duration && isFinite(audio.duration)) {
          audio.currentTime = (Number(slider.value) / 100) * audio.duration;
        }
      }
    };

    window.addEventListener('pointerup', handleGlobalPointerUp);
    window.addEventListener('mouseup', handleGlobalPointerUp);
    return () => {
      window.removeEventListener('pointerup', handleGlobalPointerUp);
      window.removeEventListener('mouseup', handleGlobalPointerUp);
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

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
    } else if (preview) {
      setActivePreview(preview);
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

  // High performance smooth 60fps progress update - Direct DOM mutation (Zero React re-renders!)
  useEffect(() => {
    let animId;
    const updateSmoothProgress = () => {
      const audio = audioRef.current;
      const slider = sliderRef.current;
      if (audio && audio.duration && !audio.paused && slider) {
        if (!isSeekingRef.current) {
          const pct = (audio.currentTime / audio.duration) * 100;
          slider.value = pct;
          slider.style.setProperty('--progress', `${pct}%`);
        }
        animId = requestAnimationFrame(updateSmoothProgress);
      }
    };

    if (isPlaying) {
      animId = requestAnimationFrame(updateSmoothProgress);
    }

    return () => {
      if (animId) cancelAnimationFrame(animId);
    };
  }, [isPlaying]);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  const togglePlay = (e) => {
    e.preventDefault();
    e.stopPropagation();

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

  const applySeek = (val) => {
    const audio = audioRef.current;
    if (sliderRef.current) {
      sliderRef.current.style.setProperty('--progress', `${val}%`);
    }
    if (audio && audio.duration && isFinite(audio.duration)) {
      audio.currentTime = (val / 100) * audio.duration;
    }
  };

  const handleSeek = (e) => {
    e.stopPropagation();
    const val = Number(e.target.value);
    applySeek(val);
  };

  const audioSrc = activePreview || preview;

  return (
    <div
      className="gh-card__music"
      draggable={false}
      onDragStart={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
      onMouseDown={(e) => {
        e.stopPropagation();
      }}
      onPointerDown={(e) => {
        e.stopPropagation();
      }}
      onClick={(e) => {
        e.stopPropagation();
        if (e.target.tagName !== 'INPUT') {
          e.preventDefault();
        }
      }}
    >
      {audioSrc && (
        <audio
          ref={audioRef}
          src={audioSrc}
          preload="metadata"
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
            if (sliderRef.current) {
              sliderRef.current.value = 0;
              sliderRef.current.style.setProperty('--progress', '0%');
            }
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

      <div className="gh-card__music-body">
        <div className="gh-card__music-header">
          <span className="gh-card__music-title" title={title}>
            {title}
          </span>
          {artist && (
            <span className="gh-card__music-artist" title={artist}>
              • {artist}
            </span>
          )}
          {isPlaying && (
            <span className="gh-music-eq" aria-label="Sedang diputar">
              <span className="gh-music-eq__bar" />
              <span className="gh-music-eq__bar" />
              <span className="gh-music-eq__bar" />
            </span>
          )}
        </div>

        {(audioSrc || songId) && (
          <div className="gh-card__music-controls">
            <button
              type="button"
              className="gh-card__music-play-btn"
              onClick={togglePlay}
              aria-label={isPlaying ? 'Jeda preview' : 'Putar preview'}
              title={isPlaying ? 'Jeda' : 'Putar'}
            >
              {isBuffering ? (
                <svg className="gh-music-spinner" width="10" height="10" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="2.5" strokeOpacity="0.25" />
                  <path d="M8 2a6 6 0 0 1 6 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
              ) : isPlaying ? (
                <svg width="8" height="8" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M4.5 2a.5.5 0 0 0-.5.5v11a.5.5 0 0 0 .5.5h2a.5.5 0 0 0 .5-.5v-11a.5.5 0 0 0-.5-.5h-2Zm5 0a.5.5 0 0 0-.5.5v11a.5.5 0 0 0 .5.5h2a.5.5 0 0 0 .5-.5v-11a.5.5 0 0 0-.5-.5h-2Z" />
                </svg>
              ) : (
                <svg width="8" height="8" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M4.5 2.25a.75.75 0 0 1 1.14-.64l8.5 5.75a.75.75 0 0 1 0 1.28l-8.5 5.75A.75.75 0 0 1 4.5 13.75V2.25Z" />
                </svg>
              )}
            </button>

            <div className="gh-card__music-track">
              <input
                ref={sliderRef}
                type="range"
                min="0"
                max="100"
                step="0.1"
                defaultValue="0"
                draggable={false}
                onDragStart={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onMouseDown={(e) => {
                  e.stopPropagation();
                  isSeekingRef.current = true;
                }}
                onPointerDown={(e) => {
                  e.stopPropagation();
                  isSeekingRef.current = true;
                }}
                onInput={handleSeek}
                onChange={handleSeek}
                onPointerUp={(e) => {
                  e.stopPropagation();
                  isSeekingRef.current = false;
                  applySeek(Number(e.target.value));
                }}
                onMouseUp={(e) => {
                  e.stopPropagation();
                  isSeekingRef.current = false;
                  applySeek(Number(e.target.value));
                }}
                onClick={(e) => {
                  e.stopPropagation();
                }}
                className="gh-card__music-slider"
                style={{ '--progress': '0%' }}
                aria-label="Seek preview lagu"
              />
            </div>
          </div>
        )}
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
}) {
  const anonId = String(id).padStart(3, '0');
  const safeLikes = likes ?? 0;
  const safeComments = comments_count ?? 0;
  const hasSong = Boolean(song_title || song_id || song_preview);

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
