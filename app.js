const express = require('express');
const dotenv = require('dotenv');
const nodeRoutes = require('./routes/nodeRoutes');
const swaggerConfig = require('./swagger/swaggerConfig');
const { sequelize } = require('./models');

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.use('/api', nodeRoutes);
swaggerConfig(app);

sequelize.sync().then(() => {
  app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });
});
module.exports = app;