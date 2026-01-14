require("dotenv").config();


const app = require('./app');
const { connectDB, sequelize} = require('./db');

require('./models');

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  await connectDB();

  await sequelize.sync({ alter: true });
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
};

startServer();