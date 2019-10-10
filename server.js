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

/* mongoose.connect(DATABASE_URL, { useNewUrlParser: true });
const connection = mongoose.connection;

connection.once('open', () => {
  console.log('Mongo database connection established successfully');
}); */

const usersRouter = require('./routes/users');
const itemsRouter = require('./routes/items');

app.use('/users', usersRouter);
app.use('/items', itemsRouter);

app.get('/', (req, res) => {
  res.json({ message: 'Hello world!' });
});

let server;

function runServer(databaseUrl=DATABASE_URL, port=PORT) {
  return new Promise((resolve, reject) => {
    mongoose.connect(databaseUrl, {useNewUrlParser: true}, err => {
      if (err) {
        return reject(err);
      }
      server = app.listen(port, () => {
        console.log(`Your app is listening on port ${port}`);
        resolve();
      })
      .on('error', err => {
        mongoose.disconnect();
        reject(err);
      });
    });
  });
}

function closeServer() {
  return mongoose.disconnect().then(() => {
    return new Promise((resolve, reject) => {
      console.log('Closing server');
      server.close(err => {
        if (err) {
          return reject(err);
        }
        resolve();
      });
    });
  });
}

if (require.main === module) {
  runServer(DATABASE_URL).catch(err => console.error(err));
}

//app.listen(PORT, () => console.log(`Listening on port ${PORT}`));

module.exports = { runServer, app, closeServer };