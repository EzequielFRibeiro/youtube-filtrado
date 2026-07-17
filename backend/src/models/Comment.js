const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');
const Video = require('./Video');

const Comment = sequelize.define('Comment', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  isApproved: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  isFlagged: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  flagReason: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  likeCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  dislikeCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  tableName: 'comments',
  timestamps: true,
  indexes: [
    { fields: ['videoId'] },
    { fields: ['userId'] },
    { fields: ['parentId'] }
  ]
});

Comment.belongsTo(User, { as: 'author', foreignKey: 'userId' });
Comment.belongsTo(Video, { foreignKey: 'videoId' });
Video.hasMany(Comment, { foreignKey: 'userId' });
User.hasMany(Comment, { as: 'comments', foreignKey: 'userId' });

Comment.belongsTo(Comment, { as: 'parent', foreignKey: 'parentId' });
Comment.hasMany(Comment, { as: 'replies', foreignKey: 'parentId' });

module.exports = Comment;
