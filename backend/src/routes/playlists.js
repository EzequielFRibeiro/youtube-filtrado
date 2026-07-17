const router = require('express').Router();
const { createPlaylist, getUserPlaylists, getPlaylistById, addVideoToPlaylist, removeVideoFromPlaylist, deletePlaylist } = require('../controllers/playlistController');
const { authMiddleware, optionalAuth } = require('../middleware/auth');

router.post('/', authMiddleware, createPlaylist);
router.get('/user/:userId?', optionalAuth, getUserPlaylists);
router.get('/:id', optionalAuth, getPlaylistById);
router.post('/:id/videos', authMiddleware, addVideoToPlaylist);
router.delete('/:id/videos/:videoId', authMiddleware, removeVideoFromPlaylist);
router.delete('/:id', authMiddleware, deletePlaylist);

module.exports = router;
