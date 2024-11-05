require('dotenv').config();
process.env.NODE_TLS_REJECT_UNAUTHORIZED='0'
const fs = require('fs');
const path = require('path');
const { Sequelize } = require('sequelize');
const config = require('../config/config')[process.env.NODE_ENV || 'development'];
// console.log("config>>",config)
// Load the CA certificate
const caCert = fs.readFileSync(path.resolve(__dirname, '../ca.crt')).toString();


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

sequelize.authenticate()
  .then(() => {
    console.log('Database connection established successfully.');
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });

const Node = require('./node')(sequelize, Sequelize.DataTypes);

const db = {
  sequelize,
  Sequelize,
  Node,
};

module.exports = db;
