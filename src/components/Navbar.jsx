import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AuthModal from './AuthModal';

export default function Navbar() {
  const location = useLocation();
  const { user, signOut, loading } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('signin');

  function isActive(path) {
    return location.pathname === path ? 'nav__link nav__link--active' : 'nav__link';
  }

  function openAuth(mode) {
    setAuthMode(mode);
    setShowAuthModal(true);
  }

  async function handleSignOut() {
    try {
      await signOut();
    } catch (err) {
      console.error('[Navbar] Sign out error:', err);
    }
  }

  return (
    <>
      <nav className="navbar" aria-label="Main navigation">
        <div className="navbar__brand">
          <Link to="/" className="navbar__brand-link">
            <span className="navbar__logo">🎓</span>
            <span className="navbar__title">UNILAG CGPA</span>
          </Link>
        </div>

        <ul className="nav__list">
          <li><Link to="/" className={isActive('/')}>Dashboard</Link></li>
          <li><Link to="/history" className={isActive('/history')}>History</Link></li>
          <li><Link to="/semester/new" className="btn btn--primary btn--sm">+ Add Semester</Link></li>
        </ul>

        <div className="navbar__auth">
          {!loading && (
            user ? (
              <div className="navbar__user-menu">
                <span className="navbar__user-pill" title={user.email}>
                  <span className="navbar__user-dot"></span>
                  <span className="navbar__user-email">{user.email?.split('@')[0]}</span>
                </span>
                <button
                  type="button"
                  className="btn btn--ghost btn--sm"
                  onClick={handleSignOut}
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="navbar__auth-actions">
                <button
                  type="button"
                  className="btn btn--ghost btn--sm"
                  onClick={() => openAuth('signin')}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  className="btn btn--secondary btn--sm"
                  onClick={() => openAuth('signup')}
                >
                  Sign Up
                </button>
              </div>
            )
          )}
        </div>
      </nav>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        initialMode={authMode}
      />
    </>
  );
}
