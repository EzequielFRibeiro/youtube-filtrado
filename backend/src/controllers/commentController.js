const { Comment, User, Video } = require('../models');
const { GeolocationService } = require('../services/geolocation');

const getCommentsByVideo = async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    const comments = await Comment.findAndCountAll({
      where: {
        videoId: req.params.videoId,
        isApproved: true,
        parentId: null
      },
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'username', 'displayName', 'avatar']
        },
        {
          model: Comment,
          as: 'replies',
          where: { isApproved: true },
          required: false,
          include: [
            {
              model: User,
              as: 'author',
              attributes: ['id', 'username', 'displayName', 'avatar']
            }
          ]
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      comments: comments.rows,
      pagination: {
        total: comments.count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(comments.count / limit)
      }
    });
  } catch (error) {
    console.error('Erro ao buscar comentários:', error);
    res.status(500).json({ error: 'Erro ao buscar comentários' });
  }
};

const createComment = async (req, res) => {
  try {
    const { content, parentId } = req.body;
    const { videoId } = req.params;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ error: 'Comentário não pode ser vazio' });
    }

    const video = await Video.findByPk(videoId);
    if (!video) {
      return res.status(404).json({ error: 'Vídeo não encontrado' });
    }

    const userCountry = req.user.country;
    if (!GeolocationService.isVideoAvailableForCountry(video, userCountry)) {
      return res.status(403).json({ error: 'Vídeo indisponível na sua região' });
    }

    if (parentId) {
      const parentComment = await Comment.findByPk(parentId);
      if (!parentComment || parentComment.videoId !== parseInt(videoId)) {
        return res.status(400).json({ error: 'Comentário pai inválido' });
      }
    }

    const comment = await Comment.create({
      content: content.trim(),
      videoId,
      userId: req.user.id,
      parentId: parentId || null
    });

    const fullComment = await Comment.findByPk(comment.id, {
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'username', 'displayName', 'avatar']
        }
      ]
    });

    const io = req.app.get('io');
    if (io) {
      io.to(`video_${videoId}`).emit('comment_added', fullComment);
    }

    res.status(201).json(fullComment);
  } catch (error) {
    console.error('Erro ao criar comentário:', error);
    res.status(500).json({ error: 'Erro ao criar comentário' });
  }
};

const updateComment = async (req, res) => {
  try {
    const comment = await Comment.findByPk(req.params.id);

    if (!comment) {
      return res.status(404).json({ error: 'Comentário não encontrado' });
    }

    if (comment.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Não autorizado' });
    }

    comment.content = req.body.content;
    await comment.save();

    res.json(comment);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar comentário' });
  }
};

const deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findByPk(req.params.id);

    if (!comment) {
      return res.status(404).json({ error: 'Comentário não encontrado' });
    }

    if (comment.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Não autorizado' });
    }

    await comment.destroy();

    res.json({ message: 'Comentário removido' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao remover comentário' });
  }
};

const flagComment = async (req, res) => {
  try {
    const comment = await Comment.findByPk(req.params.id);

    if (!comment) {
      return res.status(404).json({ error: 'Comentário não encontrado' });
    }

    comment.isFlagged = true;
    comment.flagReason = req.body.reason || 'Reportado pelo usuário';
    await comment.save();

    res.json({ message: 'Comentário reportado' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao reportar comentário' });
  }
};

module.exports = {
  getCommentsByVideo,
  createComment,
  updateComment,
  deleteComment,
  flagComment
};
