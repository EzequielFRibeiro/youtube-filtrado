const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');
const Video = require('./Video');

const ViewHistory = sequelize.define('ViewHistory', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  watchProgress: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Posição em segundos onde o usuário parou'
  },
  watchedFully: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  watchCount: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  }
}, {
  tableName: 'view_history',
  timestamps: true
});

ViewHistory.belongsTo(User, { foreignKey: 'userId' });
ViewHistory.belongsTo(Video, { foreignKey: 'videoId' });
User.hasMany(ViewHistory, { foreignKey: 'userId' });
Video.hasMany(ViewHistory, { foreignKey: 'videoId' });

module.exports = ViewHistory;
