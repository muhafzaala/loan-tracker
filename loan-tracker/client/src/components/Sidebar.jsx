import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import './Sidebar.css';

export default function Sidebar() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <>
      <button className="hamburger" onClick={() => setMobileOpen(!mobileOpen)}>
        {mobileOpen ? '✕' : '☰'}
      </button>

      <aside className={`sidebar ${mobileOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-brand">
          <span className="brand-icon">◈</span>
          <span className="brand-name">LoanTrack</span>
        </div>

        <nav className="sidebar-nav">
          <NavLink
            to="/dashboard"
            className={({ isActive }) => `nav-item ${isActive ? 'nav-item-active' : ''}`}
            onClick={() => setMobileOpen(false)}
          >
            <span>▤</span> Dashboard
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">{currentUser?.name?.[0]?.toUpperCase()}</div>
            <div>
              <div className="user-name">{currentUser?.name}</div>
              <div className="user-email">{currentUser?.email}</div>
            </div>
          </div>
          <button className="btn btn-ghost logout-btn" onClick={handleLogout}>
            Sign out
          </button>
        </div>
      </aside>

      {mobileOpen && (
        <div className="sidebar-overlay" onClick={() => setMobileOpen(false)} />
      )}
    </>
  );
}
