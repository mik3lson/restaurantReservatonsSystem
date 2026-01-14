const express = require('express');

const restaurantRoutes = require('./routes/restaurantRoutes');
const reservationRoutes = require('./routes/reservationRoutes');
const tableRoutes = require('./routes/tableRoutes');
const customerRoutes = require('./routes/customerRoutes');


const bodyParser = require('body-parser');
const app = express();
app.use(bodyParser.json());

app.use('/restaurants', restaurantRoutes);
app.use('/reservations', reservationRoutes);
app.use(tableRoutes);
app.use('/customers', customerRoutes);


app.get('/', (req, res) => {
  res.send('Hello World!');
});

module.exports = app;