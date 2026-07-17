import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { videosAPI } from '../services/api';

const COUNTRIES = {
  BR: 'Brasil', US: 'Estados Unidos', PT: 'Portugal', AR: 'Argentina',
  CO: 'Colômbia', MX: 'México', ES: 'Espanha', DE: 'Alemanha',
  FR: 'França', JP: 'Japão', CN: 'China', IN: 'Índia',
  GB: 'Reino Unido', CA: 'Canadá', AU: 'Austrália', IT: 'Itália',
  RU: 'Rússia', KR: 'Coreia do Sul'
};

export default function UploadPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    tags: '',
    isPublic: 'true'
  });
  const [countryFilter, setCountryFilter] = useState({
    mode: 'all',
    allowed: [],
    blocked: []
  });
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      if (selected.size > 500 * 1024 * 1024) {
        setError('Arquivo muito grande. Máximo: 500MB');
        return;
      }
      setFile(selected);
      if (!formData.title) {
        setFormData(prev => ({ ...prev, title: selected.name.replace(/\.[^/.]+$/, '') }));
      }
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const dropped = e.dataTransfer.files[0];
    if (dropped && dropped.type.startsWith('video/')) {
      setFile(dropped);
      if (!formData.title) {
        setFormData(prev => ({ ...prev, title: dropped.name.replace(/\.[^/.]+$/, '') }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Selecione um vídeo');
      return;
    }
    if (!formData.title.trim()) {
      setError('Título é obrigatório');
      return;
    }

    try {
      setUploading(true);
      setError('');

      const data = new FormData();
      data.append('video', file);
      data.append('title', formData.title);
      data.append('description', formData.description);
      data.append('tags', formData.tags);
      data.append('isPublic', formData.isPublic);

      if (countryFilter.mode === 'allowed') {
        data.append('allowedCountries', JSON.stringify(countryFilter.allowed));
      } else if (countryFilter.mode === 'blocked') {
        data.append('blockedCountries', JSON.stringify(countryFilter.blocked));
      }

      const res = await videosAPI.upload(data, (e) => {
        const pct = Math.round((e.loaded * 100) / e.total);
        setProgress(pct);
      });

      navigate(`/watch/${res.data.video.id}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao enviar vídeo');
    } finally {
      setUploading(false);
    }
  };

  const toggleCountry = (code, type) => {
    setCountryFilter(prev => {
      const list = prev[type];
      const newList = list.includes(code)
        ? list.filter(c => c !== code)
        : [...list, code];
      return { ...prev, [type]: newList };
    });
  };

  return (
    <div className="upload-page">
      <h1 style={{ marginBottom: 24 }}>Enviar vídeo</h1>

      {error && <div className="error-message">{error}</div>}

      {!file ? (
        <div
          className="upload-area"
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
        >
          <div className="icon">📤</div>
          <h3>Arraste e solte o vídeo aqui</h3>
          <p>ou clique para selecionar</p>
          <p style={{ marginTop: 8, fontSize: 12 }}>MP4, AVI, MOV, WebM • Máximo 500MB</p>
          <input
            ref={fileInputRef}
            type="file"
            accept="video/*"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
        </div>
      ) : (
        <div className="upload-form">
          <div style={{
            padding: 16,
            background: 'var(--bg-secondary)',
            borderRadius: 8,
            marginBottom: 16,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div>
              <strong>{file.name}</strong>
              <div style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
                {(file.size / (1024 * 1024)).toFixed(1)} MB
              </div>
            </div>
            <button
              className="btn-secondary"
              onClick={() => { setFile(null); setProgress(0); }}
            >
              Remover
            </button>
          </div>

          {uploading && (
            <div style={{
              height: 4,
              background: 'var(--bg-tertiary)',
              borderRadius: 2,
              marginBottom: 16,
              overflow: 'hidden'
            }}>
              <div style={{
                height: '100%',
                width: `${progress}%`,
                background: 'var(--primary-color)',
                transition: 'width 0.3s'
              }}></div>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Título *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Título do vídeo"
                required
              />
            </div>

            <div className="form-group">
              <label>Descrição</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Descreva o vídeo..."
                rows={4}
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

            <div className="form-group">
              <label>Tags (separadas por vírgula)</label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                placeholder="música, tutorial, vlog"
              />
            </div>

            <div className="form-group">
              <label>Visibilidade</label>
              <select
                value={formData.isPublic}
                onChange={(e) => setFormData(prev => ({ ...prev, isPublic: e.target.value }))}
              >
                <option value="true">Público</option>
                <option value="false">Privado</option>
              </select>
            </div>

            <div className="country-filter-section">
              <h4>Filtro de País</h4>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 12 }}>
                Controle em quais países seu vídeo estará disponível
              </p>

              <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="countryMode"
                    checked={countryFilter.mode === 'all'}
                    onChange={() => setCountryFilter(prev => ({ ...prev, mode: 'all' }))}
                  />
                  Todos os países
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="countryMode"
                    checked={countryFilter.mode === 'allowed'}
                    onChange={() => setCountryFilter(prev => ({ ...prev, mode: 'allowed' }))}
                  />
                  Apenas países selecionados
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="countryMode"
                    checked={countryFilter.mode === 'blocked'}
                    onChange={() => setCountryFilter(prev => ({ ...prev, mode: 'blocked' }))}
                  />
                  Bloquear países selecionados
                </label>
              </div>

              {countryFilter.mode !== 'all' && (
                <div className="country-checkboxes">
                  {Object.entries(COUNTRIES).map(([code, name]) => (
                    <label key={code} className="country-checkbox">
                      <input
                        type="checkbox"
                        checked={
                          countryFilter.mode === 'allowed'
                            ? countryFilter.allowed.includes(code)
                            : countryFilter.blocked.includes(code)
                        }
                        onChange={() => toggleCountry(code, countryFilter.mode === 'allowed' ? 'allowed' : 'blocked')}
                      />
                      {name}
                    </label>
                  ))}
                </div>
              )}
            </div>

            <button
              type="submit"
              className="btn-primary"
              disabled={uploading}
              style={{ marginTop: 16 }}
            >
              {uploading ? `Enviando... ${progress}%` : 'Enviar vídeo'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
