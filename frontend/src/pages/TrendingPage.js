import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { videosAPI } from '../services/api';
import VideoCard from '../components/Video/VideoCard';

export default function TrendingPage() {
  const { selectedCountry } = useAuth();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTrending();
  }, [selectedCountry]);

  const loadTrending = async () => {
    try {
      setLoading(true);
      const res = await videosAPI.getTrending();
      setVideos(res.data);
    } catch (error) {
      console.error('Erro ao carregar trending:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 style={{ marginBottom: 24 }}>🔥 Em alta</h2>

      {loading ? (
        <div className="loading">
          <div className="spinner"></div>
        </div>
      ) : videos.length > 0 ? (
        <div className="video-grid">
          {videos.map(video => (
            <VideoCard key={video.id} video={video} />
          ))}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-secondary)' }}>
          <p style={{ fontSize: '48px', marginBottom: '16px' }}>📈</p>
          <h3>Nenhum vídeo em alta no momento</h3>
        </div>
      )}
    </div>
  );
}
