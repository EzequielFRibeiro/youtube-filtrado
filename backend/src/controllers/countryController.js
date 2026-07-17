const { GeolocationService } = require('../services/geolocation');

const getAllCountries = (req, res) => {
  const countries = GeolocationService.getAllCountries();
  res.json(countries);
};

const detectCountry = async (req, res) => {
  try {
    const ip = req.ip || req.connection.remoteAddress;
    const geo = await GeolocationService.getCountryFromIP(ip);
    res.json(geo);
  } catch (error) {
    res.json({ country: 'BR', countryName: 'Brasil' });
  }
};

module.exports = { getAllCountries, detectCountry };
