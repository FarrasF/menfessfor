import { Link, useLocation } from 'react-router-dom';
import './Navbar.css';

function Navbar() {
  const location = useLocation();

  return (
    <nav className="navbar">
      <div className="navbar__inner container">
        <Link to="/" className="navbar__logo">
          <span className="navbar__logo-icon" aria-hidden="true">💬</span>
          <span className="navbar__logo-text">Menfessfor</span>
        </Link>

        <div className="navbar__links">
          <Link
            to="/"
            className={`navbar__link clay-button clay-button--ghost ${
              location.pathname === '/' ? 'navbar__link--active' : ''
            }`}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            <span className="navbar__link-text">Home</span>
          </Link>
          <Link
            to="/submit"
            className={`navbar__link clay-button clay-button--primary ${
              location.pathname === '/submit' ? 'navbar__link--active' : ''
            }`}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            <span className="navbar__link-text">Kirim</span>
          </Link>
          <Link
            to="/admin"
            className={`navbar__link clay-button clay-button--ghost ${
              location.pathname === '/admin' ? 'navbar__link--active' : ''
            }`}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            <span className="navbar__link-text">Admin</span>
          </Link>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
