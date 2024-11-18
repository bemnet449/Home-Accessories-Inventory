const { Sequelize } = require('sequelize');

// Initialize Sequelize for SQLite
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './server/database.sqlite'
  // Path to the SQLite database file
});

// Sync models with the database (create tables if not exist)
sequelize.sync();

module.exports = sequelize;
