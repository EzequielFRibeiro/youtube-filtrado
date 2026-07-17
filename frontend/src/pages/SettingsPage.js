import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { usersAPI } from '../services/api';

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

export default function SettingsPage() {
  const { user, changeCountry, logout } = useAuth();
  const [formData, setFormData] = useState({
    displayName: '',
    bio: '',
    country: ''
  });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        displayName: user.displayName || '',
        bio: user.bio || '',
        country: user.country || 'BR'
      });
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      await usersAPI.updateProfile({
        ...formData,
        countryManuallySet: true
      });
      changeCountry(formData.country);
      setMessage('Configurações salvas com sucesso!');
    } catch (error) {
      setMessage('Erro ao salvar configurações');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm('Tem certeza que deseja desativar sua conta? Esta ação não pode ser desfeita.')) {
      try {
        await usersAPI.deleteAccount();
        logout();
      } catch (error) {
        console.error('Erro ao deletar conta:', error);
      }
    }
  };

  if (!user) {
    return (
      <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-secondary)' }}>
        <h2>Faça login para acessar as configurações</h2>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 600, margin: '0 auto' }}>
      <h1 style={{ marginBottom: 24 }}>⚙️ Configurações</h1>

      {message && (
        <div className={message.includes('sucesso') ? 'success-message' : 'error-message'}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Nome para exibição</label>
          <input
            type="text"
            value={formData.displayName}
            onChange={(e) => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
          />
        </div>

        <div className="form-group">
          <label>Bio</label>
          <textarea
            value={formData.bio}
            onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
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
          <label>País</label>
          <select
            value={formData.country}
            onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
          >
            {Object.entries(COUNTRIES).map(([code, { name, flag }]) => (
              <option key={code} value={code}>{flag} {name}</option>
            ))}
          </select>
          <small style={{ color: 'var(--text-secondary)', fontSize: 12 }}>
            Alterar o país manualmente desativa a detecção automática por IP.
          </small>
        </div>

        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Salvando...' : 'Salvar alterações'}
        </button>
      </form>

      <div style={{ marginTop: 48, paddingTop: 24, borderTop: '1px solid var(--border-color)' }}>
        <h3 style={{ color: 'var(--error-color)', marginBottom: 16 }}>Zona de perigo</h3>
        <button
          className="btn-secondary"
          onClick={handleDeleteAccount}
          style={{ color: 'var(--error-color)', borderColor: 'var(--error-color)' }}
        >
          Desativar conta
        </button>
      </div>
    </div>
  );
}
