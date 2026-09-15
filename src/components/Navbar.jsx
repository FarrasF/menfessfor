import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import BrandLogo from './BrandLogo';
import './Navbar.css';

function Navbar() {
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="gh-header">
      <div className="gh-header__inner container">
        <div className="gh-header__left">
          <Link to="/" className="gh-header__logo" aria-label="Menfessfor Homepage">
            <BrandLogo size={32} />
          </Link>
          <div className="gh-header__repo-title">
            <Link to="/" className="gh-header__repo-name">menfessfor</Link>
            <span className="gh-header__badge">Publik</span>
          </div>
        </div>

        <nav className="gh-header__nav" aria-label="Navigasi Utama">
          <Link
            to="/"
            className={`gh-header__nav-link ${
              location.pathname === '/' ? 'gh-header__nav-link--active' : ''
            }`}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
              <path d="M1 2.75C1 1.784 1.784 1 2.75 1h10.5c.966 0 1.75.784 1.75 1.75v7.5A1.75 1.75 0 0 1 13.25 12H9.06l-2.573 2.573A1.458 1.458 0 0 1 4 13.543V12H2.75A1.75 1.75 0 0 1 1 10.25Zm1.75-.25a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h2a.75.75 0 0 1 .75.75v2.19l2.72-2.72a.749.749 0 0 1 .53-.22h4.5a.25.25 0 0 0 .25-.25v-7.5a.25.25 0 0 0-.25-.25Z" />
            </svg>
            <span className="gh-header__link-text">Diskusi</span>
          </Link>

          <Link
            to="/admin"
            className={`gh-header__nav-link ${
              location.pathname === '/admin' ? 'gh-header__nav-link--active' : ''
            }`}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
              <path d="M8.533.133a1.749 1.749 0 0 0-1.066 0l-5.25 1.68A1.75 1.75 0 0 0 1 3.48v4.27c0 4.29 2.78 8.01 6.74 9.17a1.749 1.749 0 0 0 .52 0c3.96-1.16 6.74-4.88 6.74-9.17V3.48a1.75 1.75 0 0 0-1.217-1.667Zm-.614 1.44a.25.25 0 0 1 .162 0l5.25 1.68a.25.25 0 0 1 .169.227v4.27c0 3.56-2.29 6.64-5.5 7.63a.25.25 0 0 1-.16 0C4.79 14.43 2.5 11.35 2.5 7.75V3.48a.25.25 0 0 1 .169-.227Z" />
            </svg>
            <span className="gh-header__link-text">Moderasi</span>
          </Link>

          {/* Theme Toggle Button */}
          <button
            type="button"
            className="gh-header__theme-btn"
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Beralih ke Tema Terang' : 'Beralih ke Tema Gelap'}
            title={theme === 'dark' ? 'Beralih ke Tema Terang' : 'Beralih ke Tema Gelap'}
          >
            {theme === 'dark' ? (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                <path d="M8 12a4 4 0 1 1 0-8 4 4 0 0 1 0 8Zm0-1.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Zm5.657-8.157a.75.75 0 0 1 0 1.06l-.707.708a.75.75 0 0 1-1.06-1.061l.707-.707a.75.75 0 0 1 1.06 0Zm-9.9 9.9a.75.75 0 0 1 0 1.06l-.707.707a.75.75 0 0 1-1.06-1.06l.707-.708a.75.75 0 0 1 1.06 0ZM8 0a.75.75 0 0 1 .75.75v1a.75.75 0 0 1-1.5 0v-1A.75.75 0 0 1 8 0Zm0 13.5a.75.75 0 0 1 .75.75v1a.75.75 0 0 1-1.5 0v-1a.75.75 0 0 1 .75-.75ZM2.343 2.343a.75.75 0 0 1 1.061 0l.707.707a.75.75 0 0 1-1.06 1.06l-.708-.707a.75.75 0 0 1 0-1.06Zm9.9 9.9a.75.75 0 0 1 1.06 0l.708.707a.75.75 0 0 1-1.061 1.061l-.707-.707a.75.75 0 0 1 0-1.061ZM0 8a.75.75 0 0 1 .75-.75h1a.75.75 0 0 1 0 1.5h-1A.75.75 0 0 1 0 8Zm13.5 0a.75.75 0 0 1 .75-.75h1a.75.75 0 0 1 0 1.5h-1a.75.75 0 0 1-.75-.75Z" />
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                <path d="M9.598 1.591a.749.749 0 0 1 .785-.175 7.001 7.001 0 1 1-8.967 8.967.75.75 0 0 1 .961-.96 5.5 5.5 0 0 0 7.046-7.046.75.75 0 0 1 .175-.786Zm1.616 1.945a7 7 0 0 1-7.678 7.678 5.499 5.499 0 1 0 7.678-7.678Z" />
              </svg>
            )}
          </button>

          <Link
            to="/submit"
            className="gh-btn gh-btn-primary gh-header__cta"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
              <path d="M7.75 2a.75.75 0 0 1 .75.75V7h4.25a.75.75 0 0 1 0 1.5H8.5v4.25a.75.75 0 0 1-1.5 0V8.5H2.75a.75.75 0 0 1 0-1.5H7V2.75A.75.75 0 0 1 7.75 2Z" />
            </svg>
            <span className="gh-header__link-text">Menfess Baru</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}

export default Navbar;
