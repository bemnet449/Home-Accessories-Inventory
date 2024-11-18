const { DataTypes } = require('sequelize');
const sequelize = require('../config/database'); // Import configured Sequelize instance

const Item = sequelize.define('Item', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,  // Define as primary key
        autoIncrement: true,  // Auto-increment to generate unique IDs
        allowNull: false  // ID must be present
    },
    image: {
        type: DataTypes.STRING, // Stores the filename of the image
        allowNull: true // Optional
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false // Required field
    },
    itemCode: {
        type: DataTypes.STRING, // Optional
        allowNull: true
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false // Required field
    },
    originalPrice: {
        type: DataTypes.FLOAT, // Optional
        allowNull: true
    },
    sellingPrice: {
        type: DataTypes.FLOAT, // Optional
        allowNull: true
    },
    profit: {
        type: DataTypes.FLOAT,
        defaultValue: 0 // Default to 0
    },
    typ: {
        type: DataTypes.FLOAT,
        allowNull: false // Required field
    },
    soldQuantity: {
        type: DataTypes.INTEGER,
        defaultValue: 0 // Default to 0
    }
}, {
    tableName: 'items' // Table name in the database
});

// Sync the Item model with the database (creates the table if it doesn’t exist)
Item.sync();

module.exports = Item;
