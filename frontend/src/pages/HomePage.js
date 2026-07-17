import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { videosAPI } from '../services/api';
import VideoCard from '../Video/VideoCard';

export default function HomePage() {
  const { selectedCountry } = useAuth();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    loadVideos();
  }, [selectedCountry, page]);

  const loadVideos = async () => {
    try {
      setLoading(true);
      const res = await videosAPI.getAll({
        page,
        limit: 20,
        country: selectedCountry
      });
      if (page === 1) {
        setVideos(res.data.videos);
      } else {
        setVideos(prev => [...prev, ...res.data.videos]);
      }
      setHasMore(res.data.pagination.page < res.data.pagination.totalPages);
    } catch (error) {
      console.error('Erro ao carregar vídeos:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="video-grid">
        {videos.map(video => (
          <VideoCard key={video.id} video={video} />
        ))}
      </div>

      {loading && (
        <div className="loading">
          <div className="spinner"></div>
        </div>
      )}

      {!loading && videos.length === 0 && (
        <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-secondary)' }}>
          <p style={{ fontSize: '48px', marginBottom: '16px' }}>🎬</p>
          <h2 style={{ marginBottom: '8px' }}>Nenhum vídeo encontrado</h2>
          <p>Nenhum vídeo disponível para o país selecionado.</p>
        </div>
      )}

      {hasMore && !loading && videos.length > 0 && (
        <div style={{ textAlign: 'center', padding: '24px' }}>
          <button
            className="btn-secondary"
            onClick={() => setPage(p => p + 1)}
            style={{ padding: '12px 24px' }}
          >
            Carregar mais
          </button>
        </div>
      )}
    </div>
  );
}
