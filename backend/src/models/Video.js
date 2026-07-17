const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');

const Video = sequelize.define('Video', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  filename: {
    type: DataTypes.STRING(500),
    allowNull: false
  },
  originalName: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  mimetype: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  size: {
    type: DataTypes.BIGINT,
    allowNull: false
  },
  duration: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  thumbnailUrl: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  viewCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  likeCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  dislikeCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  status: {
    type: DataTypes.ENUM('processing', 'published', 'private', 'rejected'),
    defaultValue: 'processing'
  },
  allowedCountries: {
    type: DataTypes.ARRAY(DataTypes.STRING(2)),
    allowNull: true,
    comment: 'Array de códigos de país ISO 3166-1 alpha-2'
  },
  blockedCountries: {
    type: DataTypes.ARRAY(DataTypes.STRING(2)),
    allowNull: true,
    comment: 'Array de códigos de país ISO 3166-1 alpha-2'
  },
  tags: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    allowNull: true
  },
  isPublic: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  publishedAt: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'videos',
  timestamps: true,
  indexes: [
    { fields: ['userId'] },
    { fields: ['status'] },
    { fields: ['publishedAt'] },
    { fields: ['viewCount'] }
  ]
});

Video.belongsTo(User, { as: 'uploader', foreignKey: 'userId' });
User.hasMany(Video, { as: 'videos', foreignKey: 'userId' });

module.exports = Video;
