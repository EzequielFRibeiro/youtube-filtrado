import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { usersAPI } from '../services/api';
import VideoCard from '../components/Video/VideoCard';

const COUNTRIES = {
  BR: { name: 'Brasil', flag: '🇧🇷' },
  US: { name: 'Estados Unidos', flag: '🇺🇸' },
  PT: { name: 'Portugal', flag: '🇵🇹' },
  AR: { name: 'Argentina', flag: '🇦🇷' },
  CO: { name: 'Colômbia', flag: '🇨🇴' },
  MX: { name: 'México', flag: '🇲🇽' },
  ES: { name: 'Espanha', flag: '🇪🇸' },
  DE: { name: 'Alemanha', flag: '🇩🇪' },
  FR: { name: 'França', flag: '🇫🇷' },
  JP: { name: 'Japão', flag: '🇯🇵' },
  CN: { name: 'China', flag: '🇨🇳' },
  IN: { name: 'Índia', flag: '🇮🇳' },
  GB: { name: 'Reino Unido', flag: '🇬🇧' },
  CA: { name: 'Canadá', flag: '🇨🇦' },
  AU: { name: 'Austrália', flag: '🇦🇺' },
  IT: { name: 'Itália', flag: '🇮🇹' },
  RU: { name: 'Rússia', flag: '🇷🇺' },
  KR: { name: 'Coreia do Sul', flag: '🇰🇷' }
};

export default function ProfilePage() {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, [id]);

  const loadProfile = async () => {
    try {
      const res = await usersAPI.getProfile(id);
      setProfile(res.data);
    } catch (err) {
      console.error('Erro ao carregar perfil:', err);
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

  if (!profile) {
    return (
      <div className="error-message" style={{ margin: '24px auto', maxWidth: 600 }}>
        Usuário não encontrado
      </div>
    );
  }

  const countryInfo = COUNTRIES[profile.country] || { name: profile.country, flag: '🌍' };

  return (
    <div>
      <div className="profile-header">
        <div className="profile-avatar">
          {profile.displayName?.[0]?.toUpperCase() || profile.username?.[0]?.toUpperCase() || 'U'}
        </div>
        <div className="profile-info">
          <h1>{profile.displayName || profile.username}</h1>
          <div className="username">@{profile.username}</div>
          {profile.bio && <p style={{ marginTop: 8, color: 'var(--text-secondary)' }}>{profile.bio}</p>}
          <div className="stats">
            <span>{profile.videos?.length || 0} vídeos</span>
          </div>
          <div className="country-badge">
            {countryInfo.flag} {countryInfo.name}
          </div>
        </div>
      </div>

      <h2 style={{ marginBottom: 16 }}>Vídeos</h2>

      {profile.videos && profile.videos.length > 0 ? (
        <div className="video-grid">
          {profile.videos.map(video => (
            <VideoCard key={video.id} video={{ ...video, uploader: profile }} />
          ))}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-secondary)' }}>
          <p style={{ fontSize: '48px', marginBottom: '16px' }}>📹</p>
          <p>Nenhum vídeo publicado ainda.</p>
        </div>
      )}
    </div>
  );
}
