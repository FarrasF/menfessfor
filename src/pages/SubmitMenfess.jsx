import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import MenfessCard from '../components/MenfessCard';
import { CATEGORIES } from '../data/dummyData';
import { supabase } from '../lib/supabase';
import { searchMusic, getMusicById } from '../lib/music';
import './SubmitMenfess.css';

const MAX_CHARS = 500;

function getCategoryLabelClass(category) {
  const map = {
    Confess: 'gh-label-confess',
    Curhat: 'gh-label-curhat',
    Akademik: 'gh-label-akademik',
    Random: 'gh-label-random',
  };

  return map[category] || '';
}

function MiniAudioPlayer({ src, currentAudioRef, className = '' }) {
  const audioRef = useRef(null);
  const sliderRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);

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
    setIsPlaying(false);
    setIsBuffering(false);
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
    }
    if (sliderRef.current) {
      sliderRef.current.value = 0;
      sliderRef.current.style.setProperty('--progress', '0%');
    }
  }, [src]);

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

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      if (currentAudioRef?.current && currentAudioRef.current !== audio) {
        currentAudioRef.current.pause();
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
    const val = Number(e.target.value);
    applySeek(val);
  };

  return (
    <div className={`mini-audio-player ${className}`}>
      <audio
        ref={audioRef}
        src={src}
        preload="metadata"
        onWaiting={() => setIsBuffering(true)}
        onPlaying={() => {
          setIsBuffering(false);
          setIsPlaying(true);
        }}
        onCanPlay={() => setIsBuffering(false)}
        onPlay={(e) => {
          if (
            currentAudioRef?.current &&
            currentAudioRef.current !== e.currentTarget
          ) {
            currentAudioRef.current.pause();
          }
          if (currentAudioRef) {
            currentAudioRef.current = e.currentTarget;
          }
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
        onError={() => setIsBuffering(false)}
      />

      <button
        type="button"
        className="mini-audio-player__btn"
        onClick={togglePlay}
        title={isPlaying ? 'Jeda preview' : 'Putar preview'}
        aria-label={isPlaying ? 'Jeda preview' : 'Putar preview'}
      >
        {isBuffering ? (
          <svg className="gh-music-spinner" width="10" height="10" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="2.5" strokeOpacity="0.25" />
            <path d="M8 2a6 6 0 0 1 6 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        ) : isPlaying ? (
          <svg width="10" height="10" viewBox="0 0 16 16" fill="currentColor">
            <path d="M4.5 2a.5.5 0 0 0-.5.5v11a.5.5 0 0 0 .5.5h2a.5.5 0 0 0 .5-.5v-11a.5.5 0 0 0-.5-.5h-2Zm5 0a.5.5 0 0 0-.5.5v11a.5.5 0 0 0 .5.5h2a.5.5 0 0 0 .5-.5v-11a.5.5 0 0 0-.5-.5h-2Z" />
          </svg>
        ) : (
          <svg width="10" height="10" viewBox="0 0 16 16" fill="currentColor">
            <path d="M4.5 2.25a.75.75 0 0 1 1.14-.64l8.5 5.75a.75.75 0 0 1 0 1.28l-8.5 5.75A.75.75 0 0 1 4.5 13.75V2.25Z" />
          </svg>
        )}
      </button>

      <div className="mini-audio-player__track">
        <input
          ref={sliderRef}
          type="range"
          min="0"
          max="100"
          step="0.1"
          defaultValue="0"
          onMouseDown={() => {
            isSeekingRef.current = true;
          }}
          onPointerDown={() => {
            isSeekingRef.current = true;
          }}
          onInput={handleSeek}
          onChange={handleSeek}
          onMouseUp={(e) => {
            isSeekingRef.current = false;
            applySeek(Number(e.target.value));
          }}
          onPointerUp={(e) => {
            isSeekingRef.current = false;
            applySeek(Number(e.target.value));
          }}
          className="mini-audio-player__slider"
          style={{ '--progress': '0%' }}
          aria-label="Seek progress"
        />
      </div>
    </div>
  );
}

function SubmitMenfess() {
  const [category, setCategory] = useState('');
  const [content, setContent] = useState('');
  const [activeTab, setActiveTab] = useState('write');
  const [submitted, setSubmitted] = useState(false);

  // Music
  const [musicQuery, setMusicQuery] = useState('');
  const [songs, setSongs] = useState([]);
  const [selectedSong, setSelectedSong] = useState(null);
  const [musicLoading, setMusicLoading] = useState(false);
  const [musicError, setMusicError] = useState('');

  // Audio preview playback for the search list
  const [playingSongId, setPlayingSongId] = useState(null);
  const [isAudioBuffering, setIsAudioBuffering] = useState(false);
  const listAudioRef = useRef(null);
  const searchTimerRef = useRef(null);

  // Audio preview for attached song
  const currentAudioRef = useRef(null);

  useEffect(() => {
    document.title = 'Menfess Baru · menfessfor';
    return () => {
      if (listAudioRef.current) {
        listAudioRef.current.pause();
      }
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
      }
      if (searchTimerRef.current) {
        clearTimeout(searchTimerRef.current);
      }
    };
  }, []);

  const charCount = content.length;
  const isOverLimit = charCount > MAX_CHARS;

  const isValid =
    category &&
    content.trim().length > 0 &&
    !isOverLimit;

  // =========================
  // MUSIC SEARCH
  // =========================

  const executeMusicSearch = async (queryText) => {
    const q = (queryText !== undefined ? queryText : musicQuery).trim();
    if (!q) {
      setSongs([]);
      setMusicError('');
      setMusicLoading(false);
      return;
    }

    setMusicLoading(true);
    setMusicError('');

    if (listAudioRef.current) {
      listAudioRef.current.pause();
      setPlayingSongId(null);
    }

    try {
      const results = await searchMusic(q);
      // Display matching songs (up to 10)
      setSongs(results.slice(0, 10));
    } catch (error) {
      console.error('Music search error:', error);
      setMusicError('Gagal mencari lagu. Coba kata kunci lain.');
      setSongs([]);
    } finally {
      setMusicLoading(false);
    }
  };

  const handleSearchInputChange = (val) => {
    setMusicQuery(val);
    if (!val.trim()) {
      if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
      if (listAudioRef.current) {
        listAudioRef.current.pause();
        setPlayingSongId(null);
      }
      setSongs([]);
      setMusicError('');
      setMusicLoading(false);
      return;
    }

    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => {
      executeMusicSearch(val);
    }, 350);
  };

  const handleTogglePlaySong = async (song, e) => {
    if (e?.target?.closest('.ig-music-item__action')) {
      return;
    }

    const audio = listAudioRef.current;
    if (!audio) return;

    if (playingSongId === song.id) {
      audio.pause();
      setPlayingSongId(null);
      setIsAudioBuffering(false);
      return;
    }

    audio.pause();
    setPlayingSongId(song.id);
    setIsAudioBuffering(true);

    try {
      let previewUrl = song.preview;
      if (song.id) {
        try {
          const fresh = await getMusicById(song.id);
          if (fresh?.preview) {
            previewUrl = fresh.preview;
          }
        } catch {
          // ignore error
        }
      }

      if (!previewUrl) {
        setIsAudioBuffering(false);
        setPlayingSongId(null);
        return;
      }

      audio.src = previewUrl;
      audio.currentTime = 0;
      await audio.play();
      setIsAudioBuffering(false);
    } catch (err) {
      console.error('Play audio error:', err);
      setIsAudioBuffering(false);
      setPlayingSongId(null);
    }
  };

  // =========================
  // SELECT SONG
  // =========================

  const handleSelectSong = (song) => {
    if (listAudioRef.current) {
      listAudioRef.current.pause();
      setPlayingSongId(null);
    }
    setSelectedSong(song);
  };

  // =========================
  // REMOVE SONG
  // =========================

  const handleRemoveSong = () => {
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
    }
    setSelectedSong(null);
    setMusicQuery('');
    setSongs([]);
    setMusicError('');
  };

  // =========================
  // SUBMIT
  // =========================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isValid) return;

    const { error } = await supabase
      .from('menfess')
      .insert([
        {
          content: content.trim(),
          category: category,
          status: 'pending',

          song_id: selectedSong?.id ?? null,
          song_title: selectedSong?.title ?? null,
          song_artist: selectedSong?.artist ?? null,
          song_album: selectedSong?.album ?? null,
          song_cover: selectedSong?.cover ?? null,
          song_preview: selectedSong?.preview ?? null,
        },
      ]);

    if (error) {
      console.error('Gagal mengirim menfess:', error);
      alert('Menfess gagal dikirim. Coba lagi.');
      return;
    }

    setSubmitted(true);
  };

  // =========================
  // RESET FORM
  // =========================

  const handleReset = () => {
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current = null;
    }

    setCategory('');
    setContent('');
    setSubmitted(false);
    setActiveTab('write');

    setMusicQuery('');
    setSongs([]);
    setSelectedSong(null);
    setMusicError('');
  };

  // =========================
  // SUCCESS PAGE
  // =========================

  if (submitted) {
    return (
      <main className="page">
        <div className="container container--sm">
          <div className="gh-box submit-success">
            <div className="submit-success__icon">
              <svg
                width="48"
                height="48"
                viewBox="0 0 16 16"
                fill="var(--color-success-fg)"
                aria-hidden="true"
              >
                <path d="M8 16A8 8 0 1 1 8 0a8 8 0 0 1 0 16Zm3.78-9.72a.751.751 0 0 0-.018-1.042.751.751 0 0 0-1.042-.018L6.75 9.19 5.28 7.72a.751.751 0 0 0-1.042.018.751.751 0 0 0 .018 1.042l2 2a.75.75 0 0 0 1.06 0Z" />
              </svg>
            </div>

            <h2 className="submit-success__title">
              Menfess Berhasil Dikirim!
            </h2>

            <p className="submit-success__text">
              Menfess kamu sekarang berstatus <code>pending</code> dan sedang
              menunggu peninjauan oleh moderator. Setelah disetujui, menfess
              akan otomatis dipublikasikan ke feed komunitas.
            </p>

            <div className="submit-success__actions">
              <button
                className="gh-btn gh-btn-primary"
                onClick={handleReset}
              >
                Tulis Menfess Baru
              </button>

              <Link to="/" className="gh-btn">
                Kembali ke Diskusi
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // =========================
  // MAIN PAGE
  // =========================

  return (
    <main className="page">
      <div className="container container--sm">

        {/* Page Sub-header */}
        <div className="submit-header">
          <div className="submit-header__breadcrumb">
            <Link to="/" className="submit-header__back-link">
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M7.78 12.53a.75.75 0 0 1-1.06 0L2.47 8.28a.75.75 0 0 1 0-1.06l4.25-4.25a.751.751 0 0 1 1.042.018.751.751 0 0 1 .018 1.042L4.81 7h7.44a.75.75 0 0 1 0 1.5H4.81l2.97 2.97a.75.75 0 0 1 0 1.06Z" />
              </svg>

              <span>Diskusi</span>
            </Link>

            <span className="submit-header__separator">/</span>

            <span className="submit-header__current">
              Menfess Baru
            </span>
          </div>

          <h1 className="submit-header__title">
            Buat Menfess Baru
          </h1>

          <p className="submit-header__desc">
            Sampaikan isi pikiran, unek-unek, atau cerita secara anonim.
          </p>
        </div>

        {/* Anonymous Notice */}
        <div className="gh-flash-banner">
          <div className="gh-flash-banner__icon">
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="var(--color-accent-fg)"
              aria-hidden="true"
            >
              <path d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8Zm8-6.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13ZM6.5 7.75A.75.75 0 0 1 7.25 7h1a.75.75 0 0 1 .75.75v2.75h.25a.75.75 0 0 1 0 1.5h-2a.75.75 0 0 1 0-1.5h.25v-2h-.25a.75.75 0 0 1-.75-.75ZM8 6a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z" />
            </svg>
          </div>

          <div className="gh-flash-banner__text">
            <strong>Informasi Anonimitas:</strong> Identitas pengirim tidak
            disimpan. Setiap menfess akan melalui peninjauan moderator demi
            kenyamanan bersama.
          </div>
        </div>

        {/* Form */}
        <div className="submit-layout">

          <div
            className="submit-layout__avatar"
            title="Pengirim Anonim"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 16 16"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M10.561 8.073a6.005 6.005 0 0 1 3.432 5.142.75.75 0 1 1-1.498.07 4.5 4.5 0 0 0-8.99 0 .75.75 0 0 1-1.498-.07 6.004 6.004 0 0 1 3.431-5.142 3.999 3.999 0 1 1 5.123 0ZM10.5 5a2.5 2.5 0 1 0-5 0 2.5 2.5 0 0 0 5 0Z" />
            </svg>
          </div>

          <form
            className="gh-box submit-form-box"
            onSubmit={handleSubmit}
          >

            {/* Category */}
            <div className="submit-form-box__section">
              <div className="submit-form-box__label-group">
                <span className="submit-form-box__label-title">
                  Pilih Kategori / Label{' '}
                  <span className="submit-form-box__required">
                    *
                  </span>
                </span>

                <span className="submit-form-box__label-hint">
                  Pilih salah satu label yang paling sesuai
                </span>
              </div>

              <div className="submit-form-box__labels-row">
                {CATEGORIES.map((cat) => {
                  const isSelected = category === cat;

                  return (
                    <button
                      key={cat}
                      type="button"
                      className={`gh-label submit-label-btn ${getCategoryLabelClass(
                        cat
                      )} ${isSelected
                          ? 'submit-label-btn--selected'
                          : ''
                        }`}
                      onClick={() => setCategory(cat)}
                      aria-pressed={isSelected}
                    >
                      {isSelected && (
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 16 16"
                          fill="currentColor"
                          aria-hidden="true"
                        >
                          <path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.751.751 0 0 1 .018-1.042.751.751 0 0 1 1.042-.018L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0Z" />
                        </svg>
                      )}

                      <span>{cat}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Editor */}
            <div className="submit-editor">

              <div className="submit-editor__tabnav">
                <div className="submit-editor__tabs">

                  <button
                    type="button"
                    className={`submit-editor__tab ${activeTab === 'write'
                        ? 'submit-editor__tab--active'
                        : ''
                      }`}
                    onClick={() => setActiveTab('write')}
                  >
                    Tulis
                  </button>

                  <button
                    type="button"
                    className={`submit-editor__tab ${activeTab === 'preview'
                        ? 'submit-editor__tab--active'
                        : ''
                      }`}
                    onClick={() => setActiveTab('preview')}
                  >
                    Pratinjau
                  </button>

                </div>
              </div>

              <div className="submit-editor__body">

                {activeTab === 'write' ? (
                  <textarea
                    id="menfess-content"
                    className="gh-input submit-editor__textarea"
                    placeholder="Tulis pesan atau ceritamu secara anonim di sini..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows={8}
                    maxLength={MAX_CHARS + 50}
                  />
                ) : (
                  <div className="submit-editor__preview">
                    {!content.trim() && !selectedSong ? (
                      <div className="submit-editor__preview-empty">
                        <svg
                          width="32"
                          height="32"
                          viewBox="0 0 16 16"
                          fill="var(--color-fg-muted)"
                          aria-hidden="true"
                        >
                          <path d="M1.75 1A1.75 1.75 0 0 0 0 2.75v9.5C0 13.216.784 14 1.75 14H3v1.543a1.457 1.457 0 0 0 2.487 1.03L8.06 14h6.19A1.75 1.75 0 0 0 16 12.25v-9.5A1.75 1.75 0 0 0 14.25 1H1.75ZM1.5 2.75a.25.25 0 0 1 .25-.25h12.5a.25.25 0 0 1 .25.25v9.5a.25.25 0 0 1-.25.25h-6.5a.75.75 0 0 0-.53.22L4.5 15.44v-2.19a.75.75 0 0 0-.75-.75h-2a.25.25 0 0 1-.25-.25v-9.5Z" />
                        </svg>
                        <span className="submit-editor__preview-placeholder">
                          Tidak ada yang bisa dipratinjau. Tulis sesuatu di
                          tab Tulis atau lampirkan lagu terlebih dahulu.
                        </span>
                      </div>
                    ) : (
                      <div className="submit-editor__preview-wrap">
                        <div className="submit-editor__preview-header">
                          <span className="submit-editor__preview-tag">
                            Pratinjau Tampilan di Beranda
                          </span>
                        </div>
                        <MenfessCard
                          isPreview={true}
                          content={content.trim() || '(Belum ada teks pesan)'}
                          category={category || 'Curhat'}
                          song_id={selectedSong?.id}
                          song_title={selectedSong?.title}
                          song_artist={selectedSong?.artist}
                          song_album={selectedSong?.album}
                          song_cover={selectedSong?.cover}
                          song_preview={selectedSong?.preview}
                        />
                      </div>
                    )}
                  </div>
                )}

              </div>
            </div>

            {/* MUSIC SECTION */}
            <div className="submit-music-section">
              <div className="submit-music-header">
                <div className="submit-music-title-wrap">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 16 16"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path d="M12 2.5a.5.5 0 0 0-.67-.47l-6 2A.5.5 0 0 0 5 4.5v6.085A2.5 2.5 0 1 0 6.5 13V5.424l4.5-1.5v4.661A2.5 2.5 0 1 0 12.5 11V2.5Z" />
                  </svg>
                  <span className="submit-music-title">
                    Tambahkan Lagu
                  </span>
                  <span className="submit-music-optional">
                    (Opsional)
                  </span>
                </div>

                <span className="submit-music-hint">
                  Pilih lagu latar yang sesuai dengan isi menfess
                </span>
              </div>

              {/* Selected Song View */}
              {selectedSong ? (
                <div className="submit-music-selected">
                  <div className="submit-music-selected__header">
                    <span className="submit-music-selected__badge">
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 16 16"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.751.751 0 0 1 .018-1.042.751.751 0 0 1 1.042-.018L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0Z" />
                      </svg>
                      <span>Lagu Terlampir</span>
                    </span>

                    <button
                      type="button"
                      className="gh-btn gh-btn-sm gh-btn-danger submit-music-selected__remove-btn"
                      onClick={handleRemoveSong}
                      title="Hapus lagu yang dipilih"
                    >
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 16 16"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path d="M11 1.75V3h2.25a.75.75 0 0 1 0 1.5H2.75a.75.75 0 0 1 0-1.5H5V1.75C5 .784 5.784 0 6.75 0h2.5C10.216 0 11 .784 11 1.75ZM4.496 6.675l.66 6.6a.75.75 0 0 0 .746.675h4.196a.75.75 0 0 0 .746-.675l.66-6.6a.75.75 0 0 0-1.492-.15l-.615 6.15H6.603l-.615-6.15a.75.75 0 0 0-1.492.15Z" />
                      </svg>
                      <span>Hapus Lagu</span>
                    </button>
                  </div>

                  <div className="submit-music-selected__content">
                    {selectedSong.cover && (
                      <img
                        src={selectedSong.cover}
                        alt={selectedSong.title}
                        className="submit-music-selected__cover"
                      />
                    )}

                    <div className="submit-music-selected__info">
                      <div className="submit-music-selected__title">
                        {selectedSong.title}
                      </div>

                      <div className="submit-music-selected__artist">
                        {selectedSong.artist}
                      </div>

                      {selectedSong.album && (
                        <div className="submit-music-selected__album">
                          Album: {selectedSong.album}
                        </div>
                      )}
                    </div>
                  </div>

                  {selectedSong.preview && (
                    <MiniAudioPlayer
                      src={selectedSong.preview}
                      currentAudioRef={currentAudioRef}
                    />
                  )}
                </div>
              ) : (
                <div className="ig-music-sheet">
                  {/* Search Bar */}
                  <div className="ig-music-search">
                    <svg className="ig-music-search__icon" width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                      <path d="M10.68 11.74a6 6 0 0 1-7.922-8.982 6 6 0 0 1 8.982 7.922l3.04 3.04a.749.749 0 0 1-.326 1.275.749.749 0 0 1-.734-.215ZM11.5 7a4.5 4.5 0 1 0-9 0 4.5 4.5 0 0 0 9 0Z" />
                    </svg>
                    <input
                      type="text"
                      className="ig-music-search__input"
                      placeholder="Cari..."
                      value={musicQuery}
                      onChange={(e) => handleSearchInputChange(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          executeMusicSearch();
                        }
                      }}
                    />
                    {musicQuery && (
                      <button
                        type="button"
                        className="ig-music-search__clear"
                        onClick={() => {
                          setMusicQuery('');
                          setSongs([]);
                          setMusicError('');
                          if (listAudioRef.current) {
                            listAudioRef.current.pause();
                            setPlayingSongId(null);
                          }
                        }}
                        aria-label="Hapus pencarian"
                      >
                        <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
                          <path d="M3.72 3.72a.75.75 0 0 1 1.06 0L8 6.94l3.22-3.22a.749.749 0 0 1 1.275.326.749.749 0 0 1-.215.734L9.06 8l3.22 3.22a.749.749 0 0 1-.326 1.275.749.749 0 0 1-.734-.215L8 9.06l-3.22 3.22a.751.751 0 0 1-1.042-.018.751.751 0 0 1-.018-1.042L6.94 8 3.72 4.78a.75.75 0 0 1 0-1.06Z" />
                        </svg>
                      </button>
                    )}
                  </div>

                  {/* Loading State */}
                  {musicLoading && (
                    <div className="ig-music-loading">
                      <svg className="gh-music-spinner" width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="2.5" strokeOpacity="0.25" />
                        <path d="M8 2a6 6 0 0 1 6 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                      </svg>
                      <span>Mencari lagu...</span>
                    </div>
                  )}

                  {/* Error State */}
                  {musicError && (
                    <div className="submit-music-error">
                      <span>{musicError}</span>
                    </div>
                  )}

                  {/* No Results State */}
                  {!musicLoading && !musicError && musicQuery.trim() && songs.length === 0 && (
                    <div className="ig-music-empty">
                      <span>Tidak ada lagu yang cocok dengan "{musicQuery}"</span>
                    </div>
                  )}

                  {/* Audio element for list preview playback */}
                  <audio
                    ref={listAudioRef}
                    preload="none"
                    onEnded={() => setPlayingSongId(null)}
                    onError={() => {
                      setPlayingSongId(null);
                      setIsAudioBuffering(false);
                    }}
                    onWaiting={() => setIsAudioBuffering(true)}
                    onPlaying={() => setIsAudioBuffering(false)}
                    onPause={() => setIsAudioBuffering(false)}
                  />

                  {/* Songs List - Only displayed when query exists and songs are found */}
                  {musicQuery.trim() && songs.length > 0 && (
                    <div className="ig-music-list">
                      {songs.map((song) => {
                        const isThisPlaying = playingSongId === song.id;
                        const isThisBuffering = isThisPlaying && isAudioBuffering;
                        const isSelected = selectedSong?.id === song.id;

                        return (
                          <div
                            key={song.id}
                            className={`ig-music-item ${isThisPlaying ? 'ig-music-item--playing' : ''} ${isSelected ? 'ig-music-item--selected' : ''}`}
                            onClick={(e) => handleTogglePlaySong(song, e)}
                            title="Klik baris untuk memutar preview lagu"
                          >
                            {/* Album Cover with Play/Equalizer State */}
                            <div className="ig-music-item__cover-wrap">
                              <img
                                src={song.cover}
                                alt={song.title}
                                className="ig-music-item__cover"
                                loading="lazy"
                              />
                              {isThisPlaying ? (
                                <div className="ig-music-item__playing-overlay">
                                  {isThisBuffering ? (
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
                                <div className="ig-music-item__hover-overlay">
                                  <svg width="10" height="10" viewBox="0 0 16 16" fill="#ffffff">
                                    <path d="M4.5 2.25a.75.75 0 0 1 1.14-.64l8.5 5.75a.75.75 0 0 1 0 1.28l-8.5 5.75A.75.75 0 0 1 4.5 13.75V2.25Z" />
                                  </svg>
                                </div>
                              )}
                            </div>

                            {/* Song Title & Subtitle */}
                            <div className="ig-music-item__details">
                              <div className="ig-music-item__title-row">
                                <span className="ig-music-item__title" title={song.title}>
                                  {song.title}
                                </span>
                                {song.explicit && (
                                  <span className="ig-music-item__explicit" title="Explicit">
                                    E
                                  </span>
                                )}
                              </div>

                              <div className="ig-music-item__subtitle">
                                <span>{song.artist}</span>
                                {song.album && (
                                  <>
                                    <span className="ig-music-item__dot">•</span>
                                    <span>{song.album}</span>
                                  </>
                                )}
                              </div>
                            </div>

                            {/* Action: Clean Pilih button (bookmark removed) */}
                            <div className="ig-music-item__action">
                              <button
                                type="button"
                                className="gh-btn gh-btn-sm gh-btn-primary ig-music-item__select-btn"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSelectSong(song);
                                }}
                                title="Pilih lagu ini untuk menfess"
                              >
                                Pilih
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="submit-form-box__footer">

              <div className="submit-form-box__meta">

                <span className="submit-form-box__badge">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 16 16"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path d="M8.533.133a1.749 1.749 0 0 0-1.066 0l-5.25 1.68A1.75 1.75 0 0 0 1 3.48v4.27c0 4.29 2.78 8.01 6.74 9.17a1.749 1.749 0 0 0 .52 0c3.96-1.16 6.74-4.88 6.74-9.17V3.48a1.75 1.75 0 0 0-1.217-1.667Zm-.614 1.44a.25.25 0 0 1 .162 0l5.25 1.68a.25.25 0 0 1 .169.227v4.27c0 3.56-2.29 6.64-5.5 7.63a.25.25 0 0 1-.16 0C4.79 14.43 2.5 11.35 2.5 7.75V3.48a.25.25 0 0 1 .169-.227Z" />
                  </svg>

                  <span>100% Anonim</span>
                </span>

                <span className="submit-form-box__meta-dot">
                  •
                </span>

                <span
                  className={`submit-form-box__counter ${isOverLimit
                      ? 'submit-form-box__counter--over'
                      : ''
                    }`}
                >
                  {charCount} / {MAX_CHARS} karakter
                </span>

              </div>

              <div className="submit-form-box__actions">

                <Link to="/" className="gh-btn">
                  Batal
                </Link>

                <button
                  type="submit"
                  className="gh-btn gh-btn-primary"
                  disabled={!isValid}
                >
                  Kirim Menfess
                </button>

              </div>

            </div>

          </form>
        </div>
      </div>
    </main>
  );
}

export default SubmitMenfess;
