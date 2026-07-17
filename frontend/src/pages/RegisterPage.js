import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { countriesAPI } from '../services/api';

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

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    displayName: '',
    country: ''
  });
  const [error, setError] = useState('');
  const [detectedCountry, setDetectedCountry] = useState(null);
  const { register, loading } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    countriesAPI.detect().then(res => {
      setDetectedCountry(res.data.country);
      if (!formData.country) {
        setFormData(prev => ({ ...prev, country: res.data.country }));
      }
    }).catch(() => {});
  }, []);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }

    if (formData.password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    try {
      const { confirmPassword, ...data } = formData;
      await register(data);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao criar conta');
    }
  };

  return (
    <div className="auth-container">
      <h2>Criar conta</h2>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Nome de usuário</label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            placeholder="seu_usuario"
            required
            minLength={3}
          />
        </div>

        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="seu@email.com"
            required
          />
        </div>

        <div className="form-group">
          <label>Nome para exibição</label>
          <input
            type="text"
            name="displayName"
            value={formData.displayName}
            onChange={handleChange}
            placeholder="Seu Nome"
          />
        </div>

        <div className="form-group">
          <label>País {detectedCountry && `(detectado: ${COUNTRIES[detectedCountry]?.name || detectedCountry})`}</label>
          <select
            name="country"
            value={formData.country}
            onChange={handleChange}
          >
            {Object.entries(COUNTRIES).map(([code, { name, flag }]) => (
              <option key={code} value={code}>{flag} {name}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Senha</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Mínimo 6 caracteres"
            required
            minLength={6}
          />
        </div>

        <div className="form-group">
          <label>Confirmar senha</label>
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Repita a senha"
            required
          />
        </div>

        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Criando conta...' : 'Criar conta'}
        </button>
      </form>

      <div className="auth-link">
        Já tem uma conta? <Link to="/login">Entrar</Link>
      </div>
    </div>
  );
}
