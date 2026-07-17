const router = require('express').Router();
const { getCommentsByVideo, createComment, updateComment, deleteComment, flagComment } = require('../controllers/commentController');
const { authMiddleware, optionalAuth } = require('../middleware/auth');

router.get('/video/:videoId', optionalAuth, getCommentsByVideo);
router.post('/video/:videoId', authMiddleware, createComment);
router.put('/:id', authMiddleware, updateComment);
router.delete('/:id', authMiddleware, deleteComment);
router.post('/:id/flag', authMiddleware, flagComment);

module.exports = router;
