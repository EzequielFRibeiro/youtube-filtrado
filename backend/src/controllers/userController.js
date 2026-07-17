const { User, Video, ViewHistory, Comment } = require('../models');
const { GeolocationService } = require('../services/geolocation');

const getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ['password', 'lastLoginIp'] },
      include: [
        {
          model: Video,
          as: 'videos',
          where: { status: 'published' },
          required: false,
          attributes: ['id', 'title', 'thumbnailUrl', 'viewCount', 'createdAt']
        }
      ]
    });

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar perfil' });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { displayName, bio, avatar, country, countryManuallySet } = req.body;
    const user = req.user;

    if (displayName !== undefined) user.displayName = displayName;
    if (bio !== undefined) user.bio = bio;
    if (avatar !== undefined) user.avatar = avatar;

    if (country !== undefined) {
      if (!COUNTRIES[country]) {
        return res.status(400).json({ error: 'País inválido' });
      }
      user.country = country;
      user.countryManuallySet = countryManuallySet !== undefined ? countryManuallySet : true;
    }

    await user.save();

    res.json({
      message: 'Perfil atualizado com sucesso',
      user: user.toPublicJSON()
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar perfil' });
  }
};

const getWatchHistory = async (req, res) => {
  try {
    const history = await ViewHistory.findAll({
      where: { userId: req.user.id },
      include: [
        {
          model: Video,
          attributes: ['id', 'title', 'thumbnailUrl', 'duration', 'viewCount', 'createdAt'],
          where: { status: 'published' }
        }
      ],
      order: [['updatedAt', 'DESC']],
      limit: 50
    });

    res.json(history);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar histórico' });
  }
};

const deleteAccount = async (req, res) => {
  try {
    const user = req.user;
    user.isActive = false;
    await user.save();
    res.json({ message: 'Conta desativada com sucesso' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao desativar conta' });
  }
};

const COUNTRIES = GeolocationService.getAllCountries().reduce((acc, c) => {
  acc[c.code] = c.name;
  return acc;
}, {});

module.exports = { getProfile, updateProfile, getWatchHistory, deleteAccount };
