import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usersAPI } from '../services/api';
import VideoCard from '../components/Video/VideoCard';
import { format } from 'timeago.js';

export default function HistoryPage() {
  const { isAuthenticated } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated) {
      loadHistory();
    }
  }, [isAuthenticated]);

  const loadHistory = async () => {
    try {
      const res = await usersAPI.getHistory();
      setHistory(res.data);
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-secondary)' }}>
        <h2>Faça login para ver seu histórico</h2>
        <Link to="/login" className="btn-primary" style={{ display: 'inline-block', marginTop: 16, width: 'auto', padding: '12px 24px' }}>
          Entrar
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h2 style={{ marginBottom: 24 }}>🕒 Histórico de visualizações</h2>

      {loading ? (
        <div className="loading">
          <div className="spinner"></div>
        </div>
      ) : history.length > 0 ? (
        <div className="video-grid">
          {history.map(item => (
            <VideoCard key={item.id} video={item.Video} />
          ))}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-secondary)' }}>
          <p style={{ fontSize: '48px', marginBottom: '16px' }}>🕒</p>
          <h3>Nenhum vídeo no histórico</h3>
        </div>
      )}
    </div>
  );
}
