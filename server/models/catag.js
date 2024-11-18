const { DataTypes } = require('sequelize');
const sequelize = require('../config/database'); // Import Sequelize instance

const Catag = sequelize.define('Catag', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,  // Define as primary key
        autoIncrement: true,  // Auto-increment to generate unique IDs
        allowNull: false  // ID must be present
    },
    image: {
        type: DataTypes.STRING, // Image file name
        allowNull: true // Not required
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false // `name` is required
    }
}, {
    tableName: 'catags' // Table name in the database
});

// Sync the Catag model with the database (creates the table if it doesn’t exist)
Catag.sync();

module.exports = Catag;
