const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { GeolocationService } = require('../services/geolocation');

const register = async (req, res) => {
  try {
    const { username, email, password, displayName, country } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Username, email e senha são obrigatórios' });
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Email já cadastrado' });
    }

    const existingUsername = await User.findOne({ where: { username } });
    if (existingUsername) {
      return res.status(400).json({ error: 'Username já existe' });
    }

    let userCountry = country || 'BR';
    let countryManuallySet = !!country;

    if (!country) {
      try {
        const ip = req.ip || req.connection.remoteAddress;
        const geo = await GeolocationService.getCountryFromIP(ip);
        userCountry = geo.country;
      } catch (e) {
        userCountry = 'BR';
      }
    }

    const user = await User.create({
      username,
      email,
      password,
      displayName: displayName || username,
      country: userCountry,
      countryManuallySet,
      lastLoginIp: req.ip
    });

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.status(201).json({
      message: 'Usuário criado com sucesso',
      token,
      user: user.toPublicJSON()
    });
  } catch (error) {
    console.error('Erro no registro:', error);
    res.status(500).json({ error: 'Erro ao criar usuário' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email e senha são obrigatórios' });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    if (!user.isActive) {
      return res.status(401).json({ error: 'Conta desativada' });
    }

    const isValidPassword = await user.validatePassword(password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    try {
      const ip = req.ip || req.connection.remoteAddress;
      const geo = await GeolocationService.getCountryFromIP(ip);
      if (!user.countryManuallySet) {
        await user.update({ country: geo.country, lastLoginIp: ip });
      } else {
        await user.update({ lastLoginIp: ip });
      }
    } catch (e) {
      // Continue with existing country
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({
      message: 'Login realizado com sucesso',
      token,
      user: user.toPublicJSON()
    });
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ error: 'Erro ao fazer login' });
  }
};

module.exports = { register, login };
