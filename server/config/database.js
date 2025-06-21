const { Sequelize } = require('sequelize');
require('dotenv').config();

// Create a connection to the database
const sequelize = new Sequelize(
  process.env.DB_NAME || 'taskmanager',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || 'localhost',
    dialect: 'mysql',
    logging: false, // Set to console.log to see SQL queries
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

// Test the connection
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('MySQL connection has been established successfully.');
    return true;
  } catch (error) {
    console.error('Unable to connect to the MySQL database:', error);
    return false;
  }
};

module.exports = { sequelize, testConnection };
