import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CATEGORIES } from '../data/dummyData';
import { supabase } from '../lib/supabase';
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

function SubmitMenfess() {
  const [category, setCategory] = useState('');
  const [content, setContent] = useState('');
  const [activeTab, setActiveTab] = useState('write');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    document.title = 'New Menfess · menfessfor/informatika';
  }, []);

  const charCount = content.length;
  const isOverLimit = charCount > MAX_CHARS;
  const isValid = category && content.trim().length > 0 && !isOverLimit;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValid) return;

    const { data: sessionData } = await supabase.auth.getSession();

    console.log('SESSION:', sessionData.session);

    const { error } = await supabase
      .from('menfess')
      .insert([
        {
          content: content.trim(),
          category: category,
          status: 'pending',
        },
      ]);

    if (error) {
      console.error('Gagal mengirim menfess:', error);
      alert('Menfess gagal dikirim. Coba lagi.');
      return;
    }

    setSubmitted(true);
  };

  const handleReset = () => {
    setCategory('');
    setContent('');
    setSubmitted(false);
    setActiveTab('write');
  };

  if (submitted) {
    return (
      <main className="page">
        <div className="container container--sm">
          <div className="gh-box submit-success">
            <div className="submit-success__icon">
              <svg width="48" height="48" viewBox="0 0 16 16" fill="var(--color-success-fg)" aria-hidden="true">
                <path d="M8 16A8 8 0 1 1 8 0a8 8 0 0 1 0 16Zm3.78-9.72a.751.751 0 0 0-.018-1.042.751.751 0 0 0-1.042-.018L6.75 9.19 5.28 7.72a.751.751 0 0 0-1.042.018.751.751 0 0 0 .018 1.042l2 2a.75.75 0 0 0 1.06 0Z" />
              </svg>
            </div>
            <h2 className="submit-success__title">Menfess Berhasil Dikirim!</h2>
            <p className="submit-success__text">
              Menfess kamu sekarang berstatus <code>pending</code> dan sedang menunggu peninjauan oleh moderator.
              Setelah disetujui, menfess akan otomatis dipublikasikan ke feed komunitas.
            </p>
            <div className="submit-success__actions">
              <button className="gh-btn gh-btn-primary" onClick={handleReset}>
                Tulis Menfess Baru
              </button>
              <Link to="/" className="gh-btn">
                Kembali ke Discussions
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="page">
      <div className="container container--sm">
        {/* Page Sub-header */}
        <div className="submit-header">
          <div className="submit-header__breadcrumb">
            <Link to="/" className="submit-header__back-link">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                <path d="M7.78 12.53a.75.75 0 0 1-1.06 0L2.47 8.28a.75.75 0 0 1 0-1.06l4.25-4.25a.751.751 0 0 1 1.042.018.751.751 0 0 1 .018 1.042L4.81 7h7.44a.75.75 0 0 1 0 1.5H4.81l2.97 2.97a.75.75 0 0 1 0 1.06Z" />
              </svg>
              <span>Discussions</span>
            </Link>
            <span className="submit-header__separator">/</span>
            <span className="submit-header__current">New Menfess</span>
          </div>
          <h1 className="submit-header__title">Create a new Menfess</h1>
          <p className="submit-header__desc">
            Sampaikan isi pikiran, unek-unek, atau cerita seputar perkuliahan Informatika secara anonim.
          </p>
        </div>

        {/* GitHub Flash Notice Banner */}
        <div className="gh-flash-banner">
          <div className="gh-flash-banner__icon">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="var(--color-accent-fg)" aria-hidden="true">
              <path d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8Zm8-6.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13ZM6.5 7.75A.75.75 0 0 1 7.25 7h1a.75.75 0 0 1 .75.75v2.75h.25a.75.75 0 0 1 0 1.5h-2a.75.75 0 0 1 0-1.5h.25v-2h-.25a.75.75 0 0 1-.75-.75ZM8 6a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z" />
            </svg>
          </div>
          <div className="gh-flash-banner__text">
            <strong>Informasi Anonimitas:</strong> Identitas pengirim tidak disimpan. Setiap menfess akan melalui peninjauan moderator demi kenyamanan bersama.
          </div>
        </div>

        {/* Form Container with Avatar pointing to it */}
        <div className="submit-layout">
          <div className="submit-layout__avatar" title="Pengirim Anonim">
            <svg width="24" height="24" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
              <path d="M10.561 8.073a6.005 6.005 0 0 1 3.432 5.142.75.75 0 1 1-1.498.07 4.5 4.5 0 0 0-8.99 0 .75.75 0 0 1-1.498-.07 6.004 6.004 0 0 1 3.431-5.142 3.999 3.999 0 1 1 5.123 0ZM10.5 5a2.5 2.5 0 1 0-5 0 2.5 2.5 0 0 0 5 0Z" />
            </svg>
          </div>

          <form className="gh-box submit-form-box" onSubmit={handleSubmit}>
            {/* Category / Label Selector */}
            <div className="submit-form-box__section">
              <div className="submit-form-box__label-group">
                <span className="submit-form-box__label-title">
                  Pilih Kategori / Labels <span className="submit-form-box__required">*</span>
                </span>
                <span className="submit-form-box__label-hint">Pilih salah satu label yang paling sesuai</span>
              </div>
              <div className="submit-form-box__labels-row">
                {CATEGORIES.map((cat) => {
                  const isSelected = category === cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      className={`gh-label submit-label-btn ${getCategoryLabelClass(cat)} ${isSelected ? 'submit-label-btn--selected' : ''
                        }`}
                      onClick={() => setCategory(cat)}
                      aria-pressed={isSelected}
                    >
                      {isSelected && (
                        <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                          <path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.751.751 0 0 1 .018-1.042.751.751 0 0 1 1.042-.018L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0Z" />
                        </svg>
                      )}
                      <span>{cat}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* GitHub Tabbed Editor (Write / Preview) */}
            <div className="submit-editor">
              <div className="submit-editor__tabnav">
                <div className="submit-editor__tabs">
                  <button
                    type="button"
                    className={`submit-editor__tab ${activeTab === 'write' ? 'submit-editor__tab--active' : ''}`}
                    onClick={() => setActiveTab('write')}
                  >
                    Write
                  </button>
                  <button
                    type="button"
                    className={`submit-editor__tab ${activeTab === 'preview' ? 'submit-editor__tab--active' : ''}`}
                    onClick={() => setActiveTab('preview')}
                  >
                    Preview
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
                    {content.trim() ? (
                      <p className="submit-editor__preview-text">{content}</p>
                    ) : (
                      <span className="submit-editor__preview-placeholder">Tidak ada yang bisa di-preview. Tulis sesuatu di tab Write terlebih dahulu.</span>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Footer with clean flexbox alignment */}
            <div className="submit-form-box__footer">
              <div className="submit-form-box__meta">
                <span className="submit-form-box__badge">
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                    <path d="M8.533.133a1.749 1.749 0 0 0-1.066 0l-5.25 1.68A1.75 1.75 0 0 0 1 3.48v4.27c0 4.29 2.78 8.01 6.74 9.17a1.749 1.749 0 0 0 .52 0c3.96-1.16 6.74-4.88 6.74-9.17V3.48a1.75 1.75 0 0 0-1.217-1.667Zm-.614 1.44a.25.25 0 0 1 .162 0l5.25 1.68a.25.25 0 0 1 .169.227v4.27c0 3.56-2.29 6.64-5.5 7.63a.25.25 0 0 1-.16 0C4.79 14.43 2.5 11.35 2.5 7.75V3.48a.25.25 0 0 1 .169-.227Z" />
                  </svg>
                  <span>100% Anonim</span>
                </span>
                <span className="submit-form-box__meta-dot">•</span>
                <span className={`submit-form-box__counter ${isOverLimit ? 'submit-form-box__counter--over' : ''}`}>
                  {charCount} / {MAX_CHARS} karakter
                </span>
              </div>

              <div className="submit-form-box__actions">
                <Link to="/" className="gh-btn">
                  Cancel
                </Link>
                <button
                  type="submit"
                  className="gh-btn gh-btn-primary"
                  disabled={!isValid}
                >
                  Submit new menfess
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
