const sequelize = require('./database');
const { User, Video, Comment, Playlist, PlaylistVideo, ViewHistory } = require('../models');

async function migrate() {
  try {
    await sequelize.authenticate();
    console.log('Conexão com o banco estabelecida');

    await sequelize.sync({ force: true });
    console.log('Tabelas criadas com sucesso');

    process.exit(0);
  } catch (error) {
    console.error('Erro na migração:', error);
    process.exit(1);
  }
}

migrate();
