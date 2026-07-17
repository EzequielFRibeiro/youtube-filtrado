import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { playlistsAPI } from '../services/api';

export default function PlaylistsPage() {
  const { user, isAuthenticated } = useAuth();
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newPlaylist, setNewPlaylist] = useState({ name: '', description: '' });

  useEffect(() => {
    if (isAuthenticated) {
      loadPlaylists();
    }
  }, [isAuthenticated]);

  const loadPlaylists = async () => {
    try {
      const res = await playlistsAPI.getUserPlaylists(user.id);
      setPlaylists(res.data);
    } catch (error) {
      console.error('Erro ao carregar playlists:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await playlistsAPI.create(newPlaylist);
      setNewPlaylist({ name: '', description: '' });
      setShowCreate(false);
      loadPlaylists();
    } catch (error) {
      console.error('Erro ao criar playlist:', error);
    }
  };

  if (!isAuthenticated) {
    return (
      <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-secondary)' }}>
        <h2>Faça login para ver suas playlists</h2>
        <Link to="/login" className="btn-primary" style={{ display: 'inline-block', marginTop: 16, width: 'auto', padding: '12px 24px' }}>
          Entrar
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2>📋 Minhas Playlists</h2>
        <button className="btn-primary" style={{ width: 'auto', padding: '10px 20px' }} onClick={() => setShowCreate(true)}>
          + Nova Playlist
        </button>
      </div>

      {showCreate && (
        <div className="modal-overlay" onClick={() => setShowCreate(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Criar Playlist</h2>
            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label>Nome</label>
                <input
                  type="text"
                  value={newPlaylist.name}
                  onChange={(e) => setNewPlaylist(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Nome da playlist"
                  required
                />
              </div>
              <div className="form-group">
                <label>Descrição</label>
                <textarea
                  value={newPlaylist.description}
                  onChange={(e) => setNewPlaylist(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Descrição (opcional)"
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 8,
                    color: 'var(--text-primary)',
                    fontSize: 14,
                    resize: 'vertical'
                  }}
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowCreate(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn-primary" style={{ width: 'auto', padding: '10px 20px' }}>
                  Criar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div className="loading">
          <div className="spinner"></div>
        </div>
      ) : playlists.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          {playlists.map(playlist => (
            <Link
              key={playlist.id}
              to={`/playlist/${playlist.id}`}
              style={{
                padding: 16,
                background: 'var(--bg-secondary)',
                borderRadius: 12,
                display: 'block'
              }}
            >
              <div style={{ fontSize: 32, marginBottom: 8 }}>🎬</div>
              <h3 style={{ marginBottom: 4 }}>{playlist.name}</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
                {playlist.Videos?.length || 0} vídeos
              </p>
            </Link>
          ))}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-secondary)' }}>
          <p style={{ fontSize: '48px', marginBottom: '16px' }}>📋</p>
          <h3>Nenhuma playlist criada</h3>
          <p>Crie sua primeira playlist para organizar seus vídeos favoritos.</p>
        </div>
      )}
    </div>
  );
}
