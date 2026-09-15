import { Link, useLocation } from 'react-router-dom';
import BrandLogo from './BrandLogo';
import './Navbar.css';

function Navbar() {
  const location = useLocation();

  return (
    <header className="gh-header">
      <div className="gh-header__inner container">
        <div className="gh-header__left">
          <Link to="/" className="gh-header__logo" aria-label="Menfessfor Homepage">
            <BrandLogo size={32} />
          </Link>
          <div className="gh-header__repo-title">
            <Link to="/" className="gh-header__repo-owner">menfessfor</Link>
            <span className="gh-header__separator">/</span>
            <Link to="/" className="gh-header__repo-name">informatika</Link>
            <span className="gh-header__badge">Public</span>
          </div>
        </div>

        <nav className="gh-header__nav" aria-label="Global Navigation">
          <Link
            to="/"
            className={`gh-header__nav-link ${
              location.pathname === '/' ? 'gh-header__nav-link--active' : ''
            }`}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
              <path d="M1 2.75C1 1.784 1.784 1 2.75 1h10.5c.966 0 1.75.784 1.75 1.75v7.5A1.75 1.75 0 0 1 13.25 12H9.06l-2.573 2.573A1.458 1.458 0 0 1 4 13.543V12H2.75A1.75 1.75 0 0 1 1 10.25Zm1.75-.25a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h2a.75.75 0 0 1 .75.75v2.19l2.72-2.72a.749.749 0 0 1 .53-.22h4.5a.25.25 0 0 0 .25-.25v-7.5a.25.25 0 0 0-.25-.25Z" />
            </svg>
            <span className="gh-header__link-text">Discussions</span>
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
            <span className="gh-header__link-text">Moderation</span>
          </Link>

          <Link
            to="/submit"
            className="gh-btn gh-btn-primary gh-header__cta"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
              <path d="M7.75 2a.75.75 0 0 1 .75.75V7h4.25a.75.75 0 0 1 0 1.5H8.5v4.25a.75.75 0 0 1-1.5 0V8.5H2.75a.75.75 0 0 1 0-1.5H7V2.75A.75.75 0 0 1 7.75 2Z" />
            </svg>
            <span className="gh-header__link-text">New Menfess</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}

export default Navbar;
