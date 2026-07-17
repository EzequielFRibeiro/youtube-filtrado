const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');
const Video = require('./Video');

const Playlist = sequelize.define('Playlist', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  isPublic: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  thumbnailUrl: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  allowedCountries: {
    type: DataTypes.ARRAY(DataTypes.STRING(2)),
    allowNull: true
  }
}, {
  tableName: 'playlists',
  timestamps: true
});

const PlaylistVideo = sequelize.define('PlaylistVideo', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  order: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  tableName: 'playlist_videos',
  timestamps: true
});

Playlist.belongsTo(User, { as: 'owner', foreignKey: 'userId' });
User.hasMany(Playlist, { as: 'playlists', foreignKey: 'userId' });

Playlist.belongsToMany(Video, { through: PlaylistVideo, foreignKey: 'playlistId' });
Video.belongsToMany(Playlist, { through: PlaylistVideo, foreignKey: 'videoId' });

module.exports = { Playlist, PlaylistVideo };
