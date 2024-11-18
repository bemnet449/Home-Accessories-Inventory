const { DataTypes } = require('sequelize');
const sequelize = require('../config/database'); // Import Sequelize instance

const History = sequelize.define('History', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,  // Define as primary key
        autoIncrement: true,  // Auto-increment to generate unique IDs
        allowNull: false  // ID must be present
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false // `name` is required
    },
    itemCode: {
        type: DataTypes.STRING,
        allowNull: false // `itemCode` is required
    },
    datePurchased: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW // Default to the current date
    }
}, {
    tableName: 'histories' // Table name in the database
});

// Sync the History model with the database (creates the table if it doesn’t exist)
History.sync();

module.exports = History;
