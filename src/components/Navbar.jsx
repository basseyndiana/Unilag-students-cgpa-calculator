import { Link, useLocation } from 'react-router-dom';

export default function Navbar() {
  const location = useLocation();

  function isActive(path) {
    return location.pathname === path ? 'nav__link nav__link--active' : 'nav__link';
  }

  return (
    <nav className="navbar" aria-label="Main navigation">
      <div className="navbar__brand">
        <span className="navbar__logo">🎓</span>
        <span className="navbar__title">UNILAG CGPA</span>
      </div>
      <ul className="nav__list">
        <li><Link to="/" className={isActive('/')}>Dashboard</Link></li>
        <li><Link to="/history" className={isActive('/history')}>History</Link></li>
        <li><Link to="/semester/new" className="btn btn--primary btn--sm">+ Add Semester</Link></li>
      </ul>
    </nav>
  );
}

