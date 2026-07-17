import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { countriesAPI } from '../../services/api';

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

export default function Header() {
  const { user, selectedCountry, changeCountry, logout, isAuthenticated } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const dropdownRef = useRef(null);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowCountryDropdown(false);
      }
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const filteredCountries = Object.entries(COUNTRIES).filter(([code, { name }]) =>
    name.toLowerCase().includes(countrySearch.toLowerCase()) ||
    code.toLowerCase().includes(countrySearch.toLowerCase())
  );

  const currentCountry = COUNTRIES[selectedCountry] || COUNTRIES.BR;

  return (
    <header className="header">
      <div className="header-left">
        <Link to="/" className="logo">
          <div className="logo-icon"></div>
          <span>Filtrado</span>
        </Link>
      </div>

      <div className="header-center">
        <form className="search-bar" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Pesquisar"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button type="submit">🔍</button>
        </form>
      </div>

      <div className="header-right">
        <div className="country-selector" ref={dropdownRef} style={{ position: 'relative' }}>
          <button
            className="country-selector"
            onClick={() => setShowCountryDropdown(!showCountryDropdown)}
          >
            <span className="country-flag">{currentCountry.flag}</span>
            {currentCountry.name}
          </button>

          {showCountryDropdown && (
            <div className="country-dropdown">
              <input
                className="search"
                type="text"
                placeholder="Buscar país..."
                value={countrySearch}
                onChange={(e) => setCountrySearch(e.target.value)}
                autoFocus
              />
              <div className="country-list">
                {filteredCountries.map(([code, { name, flag }]) => (
                  <button
                    key={code}
                    className={`country-option ${selectedCountry === code ? 'active' : ''}`}
                    onClick={() => {
                      changeCountry(code);
                      setShowCountryDropdown(false);
                      setCountrySearch('');
                    }}
                  >
                    <span>{flag}</span>
                    <span>{name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {isAuthenticated ? (
          <>
            <Link to="/upload" className="btn-icon" title="Upload">📤</Link>
            <div ref={menuRef} style={{ position: 'relative' }}>
              <button
                className="btn-icon avatar-btn"
                onClick={() => setShowMenu(!showMenu)}
              >
                {user?.displayName?.[0]?.toUpperCase() || 'U'}
              </button>
              {showMenu && (
                <div className="country-dropdown" style={{ right: 0, left: 'auto', width: 200 }}>
                  <Link
                    to={`/profile/${user?.id}`}
                    className="country-option"
                    onClick={() => setShowMenu(false)}
                  >
                    👤 Meu Canal
                  </Link>
                  <Link
                    to="/settings"
                    className="country-option"
                    onClick={() => setShowMenu(false)}
                  >
                    ⚙️ Configurações
                  </Link>
                  <button
                    className="country-option"
                    onClick={() => { logout(); setShowMenu(false); navigate('/'); }}
                    style={{ width: '100%', textAlign: 'left' }}
                  >
                    🚪 Sair
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <Link to="/login" className="btn-icon">
            👤
          </Link>
        )}
      </div>
    </header>
  );
}
