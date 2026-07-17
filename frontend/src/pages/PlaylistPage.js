import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { playlistsAPI } from '../services/api';
import VideoCard from '../components/Video/VideoCard';

export default function PlaylistPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [playlist, setPlaylist] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPlaylist();
  }, [id]);

  const loadPlaylist = async () => {
    try {
      const res = await playlistsAPI.getById(id);
      setPlaylist(res.data);
    } catch (error) {
      console.error('Erro ao carregar playlist:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading" style={{ minHeight: '60vh' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  if (!playlist) {
    return (
      <div className="error-message" style={{ margin: '24px auto', maxWidth: 600 }}>
        Playlist não encontrada
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1>{playlist.name}</h1>
        {playlist.description && (
          <p style={{ color: 'var(--text-secondary)', marginTop: 8 }}>{playlist.description}</p>
        )}
        <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginTop: 8 }}>
          {playlist.owner?.displayName} • {playlist.Videos?.length || 0} vídeos
        </p>
      </div>

      {playlist.Videos && playlist.Videos.length > 0 ? (
        <div className="video-grid">
          {playlist.Videos.map(video => (
            <VideoCard key={video.id} video={video} />
          ))}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-secondary)' }}>
          <p style={{ fontSize: '48px', marginBottom: '16px' }}>📋</p>
          <h3>Playlist vazia</h3>
        </div>
      )}
    </div>
  );
}
