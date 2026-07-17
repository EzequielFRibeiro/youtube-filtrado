const { Playlist, PlaylistVideo, Video, User } = require('../models');
const { GeolocationService } = require('../services/geolocation');

const createPlaylist = async (req, res) => {
  try {
    const { name, description, isPublic, allowedCountries } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Nome é obrigatório' });
    }

    const playlist = await Playlist.create({
      name,
      description,
      isPublic: isPublic !== false,
      allowedCountries: allowedCountries || null,
      userId: req.user.id
    });

    res.status(201).json(playlist);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar playlist' });
  }
};

const getUserPlaylists = async (req, res) => {
  try {
    const playlists = await Playlist.findAll({
      where: { userId: req.params.userId || req.user.id },
      include: [
        {
          model: Video,
          through: { attributes: ['order'] },
          attributes: ['id', 'title', 'thumbnailUrl', 'duration', 'viewCount']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json(playlists);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar playlists' });
  }
};

const getPlaylistById = async (req, res) => {
  try {
    const playlist = await Playlist.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'owner',
          attributes: ['id', 'username', 'displayName', 'avatar']
        },
        {
          model: Video,
          through: { attributes: ['order'] },
          include: [
            {
              model: User,
              as: 'uploader',
              attributes: ['id', 'username', 'displayName', 'avatar']
            }
          ]
        }
      ]
    });

    if (!playlist) {
      return res.status(404).json({ error: 'Playlist não encontrada' });
    }

    if (!playlist.isPublic && playlist.userId !== req.user?.id) {
      return res.status(403).json({ error: 'Playlist privada' });
    }

    const userCountry = req.user?.country || 'BR';
    playlist.Videos = GeolocationService.filterVideosForCountry(playlist.Videos, userCountry);

    res.json(playlist);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar playlist' });
  }
};

const addVideoToPlaylist = async (req, res) => {
  try {
    const playlist = await Playlist.findByPk(req.params.id);

    if (!playlist) {
      return res.status(404).json({ error: 'Playlist não encontrada' });
    }

    if (playlist.userId !== req.user.id) {
      return res.status(403).json({ error: 'Não autorizado' });
    }

    const video = await Video.findByPk(req.body.videoId);
    if (!video) {
      return res.status(404).json({ error: 'Vídeo não encontrado' });
    }

    const existingEntry = await PlaylistVideo.findOne({
      where: { playlistId: playlist.id, videoId: video.id }
    });

    if (existingEntry) {
      return res.status(400).json({ error: 'Vídeo já está na playlist' });
    }

    const maxOrder = await PlaylistVideo.max('order', {
      where: { playlistId: playlist.id }
    });

    await PlaylistVideo.create({
      playlistId: playlist.id,
      videoId: video.id,
      order: (maxOrder || 0) + 1
    });

    res.json({ message: 'Vídeo adicionado à playlist' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao adicionar vídeo' });
  }
};

const removeVideoFromPlaylist = async (req, res) => {
  try {
    const playlist = await Playlist.findByPk(req.params.id);

    if (!playlist) {
      return res.status(404).json({ error: 'Playlist não encontrada' });
    }

    if (playlist.userId !== req.user.id) {
      return res.status(403).json({ error: 'Não autorizado' });
    }

    await PlaylistVideo.destroy({
      where: { playlistId: playlist.id, videoId: req.params.videoId }
    });

    res.json({ message: 'Vídeo removido da playlist' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao remover vídeo' });
  }
};

const deletePlaylist = async (req, res) => {
  try {
    const playlist = await Playlist.findByPk(req.params.id);

    if (!playlist) {
      return res.status(404).json({ error: 'Playlist não encontrada' });
    }

    if (playlist.userId !== req.user.id) {
      return res.status(403).json({ error: 'Não autorizado' });
    }

    await PlaylistVideo.destroy({ where: { playlistId: playlist.id } });
    await playlist.destroy();

    res.json({ message: 'Playlist removida' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao remover playlist' });
  }
};

module.exports = {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist
};
