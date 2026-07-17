import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { videosAPI, commentsAPI } from '../../services/api';
import { format } from 'timeago.js';

export default function WatchPage() {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const [video, setVideo] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [liked, setLiked] = useState(false);
  const videoRef = useRef(null);

  useEffect(() => {
    loadVideo();
    loadComments();
  }, [id]);

  const loadVideo = async () => {
    try {
      setLoading(true);
      const res = await videosAPI.getById(id);
      setVideo(res.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao carregar vídeo');
    } finally {
      setLoading(false);
    }
  };

  const loadComments = async () => {
    try {
      const res = await commentsAPI.getByVideo(id);
      setComments(res.data.comments || []);
    } catch (err) {
      console.error('Erro ao carregar comentários:', err);
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const res = await commentsAPI.create(id, { content: newComment });
      setComments(prev => [res.data, ...prev]);
      setNewComment('');
    } catch (err) {
      console.error('Erro ao comentar:', err);
    }
  };

  const handleLike = () => {
    setLiked(!liked);
  };

  const formatViews = (count) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count?.toString() || '0';
  };

  if (loading) {
    return (
      <div className="loading" style={{ minHeight: '60vh' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-message" style={{ margin: '24px auto', maxWidth: 600 }}>
        {error}
      </div>
    );
  }

  if (!video) return null;

  return (
    <div className="video-player-page">
      <div className="video-player-container">
        <div className="video-player">
          <video
            ref={videoRef}
            controls
            poster={video.thumbnailUrl}
          >
            <source src={`/uploads/videos/${video.filename}`} type={video.mimetype} />
            Seu navegador não suporta a reprodução de vídeos.
          </video>
        </div>

        <div className="video-info-section">
          <h1>{video.title}</h1>

          <div className="video-actions">
            <div className="video-stats">
              {formatViews(video.viewCount)} visualizações • {format(video.publishedAt || video.createdAt)}
            </div>
            <div className="action-buttons">
              <button
                className={`action-btn ${liked ? 'liked' : ''}`}
                onClick={handleLike}
              >
                👍 {video.likeCount || 0}
              </button>
              <button className="action-btn">
                👎
              </button>
              <button className="action-btn">
                ↗️ Compartilhar
              </button>
              <button className="action-btn">
                💾 Salvar
              </button>
            </div>
          </div>

          <div className="video-uploader">
            <div className="uploader-info">
              <div className="video-avatar">
                {video.uploader?.displayName?.[0]?.toUpperCase() || 'U'}
              </div>
              <div>
                <h3>{video.uploader?.displayName || video.uploader?.username}</h3>
                <div className="country">
                  📍 {video.uploader?.country}
                </div>
              </div>
            </div>
            <button className="subscribe-btn">Inscrever-se</button>
          </div>

          {video.description && (
            <div className="video-description">
              <p>{video.description}</p>
            </div>
          )}

          {video.tags && video.tags.length > 0 && (
            <div className="video-tags">
              {video.tags.map((tag, i) => (
                <span key={i} className="video-tag">#{tag}</span>
              ))}
            </div>
          )}
        </div>

        <div className="comments-section">
          <div className="comments-header">
            <h2>{comments.length} Comentários</h2>
          </div>

          {isAuthenticated ? (
            <form className="comment-input" onSubmit={handleComment}>
              <div className="comment-avatar">
                {user?.displayName?.[0]?.toUpperCase() || 'U'}
              </div>
              <textarea
                placeholder="Adicione um comentário..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                rows={2}
              />
              {newComment.trim() && (
                <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 8 }}>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => setNewComment('')}
                  >
                    Cancelar
                  </button>
                  <button type="submit" className="btn-primary" style={{ width: 'auto', padding: '8px 16px' }}>
                    Comentar
                  </button>
                </div>
              )}
            </form>
          ) : (
            <div style={{ padding: '16px', color: 'var(--text-secondary)', textAlign: 'center' }}>
              <a href="/login" style={{ color: '#3ea6ff' }}>Faça login</a> para comentar
            </div>
          )}

          {comments.map(comment => (
            <div key={comment.id} className="comment-item">
              <div className="comment-avatar">
                {comment.author?.displayName?.[0]?.toUpperCase() || 'U'}
              </div>
              <div className="comment-content">
                <div className="comment-author">
                  {comment.author?.displayName || comment.author?.username}
                  <span>{format(comment.createdAt)}</span>
                </div>
                <div className="comment-text">{comment.content}</div>
                <div className="comment-actions">
                  <button className="comment-action-btn">👍</button>
                  <button className="comment-action-btn">👎</button>
                  <button className="comment-action-btn">Responder</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="video-sidebar" style={{ display: 'none' }}>
        {/* Recommended videos - can be implemented */}
      </div>
    </div>
  );
}
