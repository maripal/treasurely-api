const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const {CLIENT_ORIGIN} = require('./config');
const app = express();

const { PORT, DATABASE_URL } = require('./config');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(
  cors({
    origin: CLIENT_ORIGIN
  })
);

mongoose.connect(DATABASE_URL, { useNewUrlParser: true });
const connection = mongoose.connection;

connection.once('open', () => {
  console.log('Mongo database connection established successfully');
});

const usersRouter = require('./routes/users');

app.use('/users', usersRouter);

app.get('/', (req, res) => {
  res.send('Hello world!');
});

app.listen(PORT, () => console.log(`Listening on port ${PORT}`));

module.exports = { app };