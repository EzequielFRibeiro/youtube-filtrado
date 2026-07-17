import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Sidebar() {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sidebar">
      <Link to="/" className={`sidebar-item ${isActive('/') ? 'active' : ''}`}>
        <span className="icon">🏠</span>
        <span>Início</span>
      </Link>

      <Link to="/trending" className={`sidebar-item ${isActive('/trending') ? 'active' : ''}`}>
        <span className="icon">🔥</span>
        <span>Em alta</span>
      </Link>

      <Link to="/subscriptions" className={`sidebar-item ${isActive('/subscriptions') ? 'active' : ''}`}>
        <span className="icon">📺</span>
        <span>Inscrições</span>
      </Link>

      <div className="sidebar-divider"></div>

      <div className="sidebar-title">Você</div>

      {isAuthenticated ? (
        <>
          <Link to={`/profile/${user?.id}`} className={`sidebar-item ${isActive('/profile') ? 'active' : ''}`}>
            <span className="icon">👤</span>
            <span>Meu canal</span>
          </Link>

          <Link to="/history" className={`sidebar-item ${isActive('/history') ? 'active' : ''}`}>
            <span className="icon">🕒</span>
            <span>Histórico</span>
          </Link>

          <Link to="/playlists" className={`sidebar-item ${isActive('/playlists') ? 'active' : ''}`}>
            <span className="icon">📋</span>
            <span>Playlists</span>
          </Link>

          <Link to="/upload" className={`sidebar-item ${isActive('/upload') ? 'active' : ''}`}>
            <span className="icon">📤</span>
            <span>Upload</span>
          </Link>
        </>
      ) : (
        <Link to="/login" className="sidebar-item">
          <span className="icon">🔑</span>
          <span>Fazer login</span>
        </Link>
      )}

      <div className="sidebar-divider"></div>

      <div className="sidebar-title">Configurações</div>

      <Link to="/settings" className={`sidebar-item ${isActive('/settings') ? 'active' : ''}`}>
        <span className="icon">⚙️</span>
        <span>Configurações</span>
      </Link>
    </nav>
  );
}
