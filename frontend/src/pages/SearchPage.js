import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { videosAPI } from '../services/api';
import VideoCard from '../components/Video/VideoCard';

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const { selectedCountry } = useAuth();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (query) {
      searchVideos();
    }
  }, [query, selectedCountry]);

  const searchVideos = async () => {
    try {
      setLoading(true);
      const res = await videosAPI.getAll({
        search: query,
        country: selectedCountry,
        limit: 50
      });
      setVideos(res.data.videos);
    } catch (error) {
      console.error('Erro na busca:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 style={{ marginBottom: 24 }}>
        Resultados para: <span style={{ color: '#3ea6ff' }}>{query}</span>
      </h2>

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
          <p style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</p>
          <h3>Nenhum resultado para "{query}"</h3>
          <p>Tente outros termos ou verifique o país selecionado.</p>
        </div>
      )}
    </div>
  );
}
