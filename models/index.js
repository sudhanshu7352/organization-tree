const fs = require('fs');
const path = require('path');
const { Sequelize } = require('sequelize');
const config = require('../config/config')[process.env.NODE_ENV || 'development'];

process.env.NODE_TLS_REJECT_UNAUTHORIZED='0'
// Load the CA certificate
const caCert = fs.readFileSync(path.resolve(__dirname, '../ca.crt')).toString();
// console.log("certificate",caCert);
// Initialize Sequelize with SSL options
const sequelize = new Sequelize(config.url, {
  dialect: 'postgres',
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false, // This ensures that self-signed certificates are accepted
      ca: caCert
    }
  },
});
const Node = require('./node')(sequelize, Sequelize.DataTypes);

const db = {
  sequelize,
  Sequelize,
  Node,
};

module.exports = db;
