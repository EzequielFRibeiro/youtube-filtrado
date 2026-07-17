import React from 'react';
import { Link } from 'react-router-dom';

export default function VideoCard({ video }) {
  const formatViews = (count) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M de visualizações`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K de visualizações`;
    return `${count} visualizações`;
  };

  const formatDate = (date) => {
    const now = new Date();
    const d = new Date(date);
    const diffMs = now - d;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Hoje';
    if (diffDays === 1) return 'Há 1 dia';
    if (diffDays < 7) return `Há ${diffDays} dias`;
    if (diffDays < 30) return `Há ${Math.floor(diffDays / 7)} semanas`;
    if (diffDays < 365) return `Há ${Math.floor(diffDays / 30)} meses`;
    return `Há ${Math.floor(diffDays / 365)} anos`;
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <Link to={`/watch/${video.id}`} className="video-card">
      <div className="video-thumbnail">
        {video.thumbnailUrl ? (
          <img src={video.thumbnailUrl} alt={video.title} />
        ) : (
          <div style={{
            width: '100%',
            height: '100%',
            background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '48px'
          }}>
            🎬
          </div>
        )}
        {video.duration && (
          <span className="video-duration">{formatDuration(video.duration)}</span>
        )}
      </div>

      <div className="video-info">
        <div className="video-avatar">
          {video.uploader?.displayName?.[0]?.toUpperCase() || video.uploader?.username?.[0]?.toUpperCase() || 'U'}
        </div>
        <div className="video-details">
          <h3>{video.title}</h3>
          <div className="video-meta">
            <div>{video.uploader?.displayName || video.uploader?.username}</div>
            <div>{formatViews(video.viewCount)} • {formatDate(video.publishedAt || video.createdAt)}</div>
          </div>
        </div>
      </div>
    </Link>
  );
}
