import { useState } from 'react';
import { CATEGORIES } from '../data/dummyData';
import './SubmitMenfess.css';

const MAX_CHARS = 500;

function SubmitMenfess() {
  const [category, setCategory] = useState('');
  const [content, setContent] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const charCount = content.length;
  const isOverLimit = charCount > MAX_CHARS;
  const isValid = category && content.trim().length > 0 && !isOverLimit;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isValid) return;

    // Future: send to Supabase with status 'pending'
    console.log('Menfess submitted:', { category, content });
    setSubmitted(true);
  };

  const handleReset = () => {
    setCategory('');
    setContent('');
    setSubmitted(false);
  };

  if (submitted) {
    return (
      <main className="page">
        <div className="container">
          <div className="submit-success clay-card">
            <div className="submit-success__icon">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--color-success)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
            <h2 className="submit-success__title">Menfess Terkirim!</h2>
            <p className="submit-success__text">
              Menfess kamu sedang menunggu moderasi admin.
              Jika disetujui, menfess akan muncul di feed.
            </p>
            <button
              className="clay-button clay-button--cta"
              onClick={handleReset}
            >
              Kirim Menfess Lagi
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="page">
      <div className="container">
        <div className="submit-page">
          <div className="submit-page__header">
            <h1>Tulis Menfess</h1>
            <p className="submit-page__desc">
              Sampaikan isi hatimu secara anonim. Menfess akan ditinjau admin sebelum dipublikasikan.
            </p>
          </div>

          <form className="submit-form clay-card" onSubmit={handleSubmit}>
            {/* Category Selector */}
            <div className="submit-form__group">
              <label className="submit-form__label">Kategori</label>
              <div className="submit-form__categories">
                {CATEGORIES.map((cat) => {
                  const isActive = category === cat;
                  const categoryClass = `category-${cat.toLowerCase()}`;
                  return (
                    <button
                      key={cat}
                      type="button"
                      className={`submit-form__cat clay-pill ${categoryClass} ${
                        isActive ? 'clay-pill--active' : ''
                      }`}
                      onClick={() => setCategory(cat)}
                      aria-pressed={isActive}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Content */}
            <div className="submit-form__group">
              <label className="submit-form__label" htmlFor="menfess-content">
                Isi Menfess
              </label>
              <textarea
                id="menfess-content"
                className="submit-form__textarea clay-input"
                placeholder="Tulis isi menfess kamu di sini..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={6}
                maxLength={MAX_CHARS + 50}
              />
              <div className={`submit-form__counter ${isOverLimit ? 'submit-form__counter--over' : ''}`}>
                {charCount}/{MAX_CHARS}
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="clay-button clay-button--primary submit-form__submit"
              disabled={!isValid}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
              Kirim Menfess
            </button>

            <p className="submit-form__note">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              Identitasmu sepenuhnya anonim dan tidak disimpan.
            </p>
          </form>
        </div>
      </div>
    </main>
  );
}

export default SubmitMenfess;
