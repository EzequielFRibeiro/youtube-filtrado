const axios = require('axios');

const COUNTRIES = {
  BR: 'Brasil',
  US: 'Estados Unidos',
  PT: 'Portugal',
  AR: 'Argentina',
  CO: 'Colômbia',
  MX: 'México',
  ES: 'Espanha',
  DE: 'Alemanha',
  FR: 'França',
  JP: 'Japão',
  CN: 'China',
  IN: 'Índia',
  GB: 'Reino Unido',
  CA: 'Canadá',
  AU: 'Austrália',
  IT: 'Itália',
  RU: 'Rússia',
  KR: 'Coreia do Sul',
  CH: 'Suíça',
  NL: 'Holanda',
  SE: 'Suécia',
  NO: 'Noruega',
  PL: 'Polônia',
  TR: 'Turquia',
  SA: 'Arábia Saudita',
  ZA: 'África do Sul',
  NG: 'Nigéria',
  EG: 'Egito',
  CL: 'Chile',
  PE: 'Peru',
  VE: 'Venezuela',
  EC: 'Equador',
  BO: 'Bolívia',
  PY: 'Paraguai',
  UY: 'Uruguai'
};

class GeolocationService {
  static async getCountryFromIP(ip) {
    try {
      if (ip === '127.0.0.1' || ip === '::1' || ip === '::ffff:127.0.0.1') {
        return { country: 'BR', countryName: COUNTRIES['BR'], city: 'São Paulo' };
      }

      const response = await axios.get(`https://ipinfo.io/${ip}/json`, {
        timeout: 5000,
        params: {
          token: process.env.GEOLOCATION_API_TOKEN
        }
      });

      if (response.data && response.data.country) {
        return {
          country: response.data.country,
          countryName: COUNTRIES[response.data.country] || response.data.country,
          city: response.data.city,
          region: response.data.region,
          loc: response.data.loc
        };
      }

      return { country: 'BR', countryName: COUNTRIES['BR'] };
    } catch (error) {
      console.error('Erro na geolocalização:', error.message);
      return { country: 'BR', countryName: COUNTRIES['BR'] };
    }
  }

  static isVideoAvailableForCountry(video, userCountry) {
    if (!video.allowedCountries || video.allowedCountries.length === 0) {
      if (!video.blockedCountries || video.blockedCountries.length === 0) {
        return true;
      }
      return !video.blockedCountries.includes(userCountry);
    }

    return video.allowedCountries.includes(userCountry);
  }

  static filterVideosForCountry(videos, userCountry) {
    return videos.filter(video => this.isVideoAvailableForCountry(video, userCountry));
  }

  static getCountryName(code) {
    return COUNTRIES[code] || code;
  }

  static getAllCountries() {
    return Object.entries(COUNTRIES).map(([code, name]) => ({ code, name }));
  }
}

module.exports = { GeolocationService, COUNTRIES };
