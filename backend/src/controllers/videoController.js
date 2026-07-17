const { Video, User, ViewHistory } = require('../models');
const { GeolocationService } = require('../services/geolocation');
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../../uploads/videos');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['video/mp4', 'video/avi', 'video/mov', 'video/webm', 'video/mkv'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Tipo de arquivo não suportado'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 500 * 1024 * 1024 }
}).single('video');

const uploadVideo = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'Nenhum vídeo enviado' });
    }

    try {
      const { title, description, tags, allowedCountries, blockedCountries, isPublic } = req.body;

      if (!title) {
        return res.status(400).json({ error: 'Título é obrigatório' });
      }

      const video = await Video.create({
        title,
        description,
        filename: req.file.filename,
        originalName: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        tags: tags ? tags.split(',').map(t => t.trim()) : [],
        allowedCountries: allowedCountries ? JSON.parse(allowedCountries) : null,
        blockedCountries: blockedCountries ? JSON.parse(blockedCountries) : null,
        isPublic: isPublic !== 'false',
        status: 'published',
        publishedAt: new Date(),
        userId: req.user.id
      });

      res.status(201).json({
        message: 'Vídeo enviado com sucesso',
        video
      });
    } catch (error) {
      console.error('Erro ao upload vídeo:', error);
      res.status(500).json({ error: 'Erro ao enviar vídeo' });
    }
  });
};

const getAllVideos = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, country, sortBy = 'latest' } = req.query;
    const offset = (page - 1) * limit;

    const where = { status: 'published', isPublic: true };

    if (search) {
      where[require('sequelize').Op.or] = [
        { title: { [require('sequelize').Op.iLike]: `%${search}%` } },
        { description: { [require('sequelize').Op.iLike]: `%${search}%` } }
      ];
    }

    let order;
    switch (sortBy) {
      case 'popular': order = [['viewCount', 'DESC']]; break;
      case 'oldest': order = [['publishedAt', 'ASC']]; break;
      default: order = [['publishedAt', 'DESC']];
    }

    const videos = await Video.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: 'uploader',
          attributes: ['id', 'username', 'displayName', 'avatar']
        }
      ],
      order,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    const userCountry = country || req.user?.country || 'BR';
    const filteredVideos = GeolocationService.filterVideosForCountry(videos.rows, userCountry);

    res.json({
      videos: filteredVideos,
      pagination: {
        total: videos.count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(videos.count / limit)
      }
    });
  } catch (error) {
    console.error('Erro ao buscar vídeos:', error);
    res.status(500).json({ error: 'Erro ao buscar vídeos' });
  }
};

const getVideoById = async (req, res) => {
  try {
    const video = await Video.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'uploader',
          attributes: ['id', 'username', 'displayName', 'avatar', 'country']
        }
      ]
    });

    if (!video) {
      return res.status(404).json({ error: 'Vídeo não encontrado' });
    }

    const userCountry = req.user?.country || 'BR';
    if (!GeolocationService.isVideoAvailableForCountry(video, userCountry)) {
      return res.status(403).json({ error: 'Vídeo indisponível na sua região' });
    }

    await video.increment('viewCount');

    if (req.user) {
      const existingView = await ViewHistory.findOne({
        where: { userId: req.user.id, videoId: video.id }
      });

      if (existingView) {
        await existingView.update({ watchCount: existingView.watchCount + 1 });
      } else {
        await ViewHistory.create({
          userId: req.user.id,
          videoId: video.id
        });
      }
    }

    res.json(video);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar vídeo' });
  }
};

const updateVideo = async (req, res) => {
  try {
    const video = await Video.findByPk(req.params.id);

    if (!video) {
      return res.status(404).json({ error: 'Vídeo não encontrado' });
    }

    if (video.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Não autorizado' });
    }

    const { title, description, tags, allowedCountries, blockedCountries, isPublic } = req.body;

    if (title !== undefined) video.title = title;
    if (description !== undefined) video.description = description;
    if (tags !== undefined) video.tags = tags.split(',').map(t => t.trim());
    if (allowedCountries !== undefined) video.allowedCountries = JSON.parse(allowedCountries);
    if (blockedCountries !== undefined) video.blockedCountries = JSON.parse(blockedCountries);
    if (isPublic !== undefined) video.isPublic = isPublic === 'true';

    await video.save();

    res.json({ message: 'Vídeo atualizado', video });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar vídeo' });
  }
};

const deleteVideo = async (req, res) => {
  try {
    const video = await Video.findByPk(req.params.id);

    if (!video) {
      return res.status(404).json({ error: 'Vídeo não encontrado' });
    }

    if (video.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Não autorizado' });
    }

    const filePath = path.join(__dirname, '../../uploads/videos', video.filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await video.destroy();

    res.json({ message: 'Vídeo removido' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao remover vídeo' });
  }
};

const getTrending = async (req, res) => {
  try {
    const videos = await Video.findAll({
      where: { status: 'published', isPublic: true },
      include: [
        {
          model: User,
          as: 'uploader',
          attributes: ['id', 'username', 'displayName', 'avatar']
        }
      ],
      order: [['viewCount', 'DESC']],
      limit: 20
    });

    const userCountry = req.user?.country || 'BR';
    const filtered = GeolocationService.filterVideosForCountry(videos, userCountry);

    res.json(filtered);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar trending' });
  }
};

module.exports = {
  uploadVideo,
  getAllVideos,
  getVideoById,
  updateVideo,
  deleteVideo,
  getTrending
};
