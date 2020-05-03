require('dotenv').config();

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const passport = require('passport');

const {CLIENT_ORIGIN} = require('./config');
const usersRouter = require('./routes/users');
const itemsRouter = require('./routes/items');
const authRouter = require('./auth/router');
const { localStrategy, jwtStrategy } = require('./auth/strategies');

const app = express();
const { PORT, DATABASE_URL } = require('./config');

app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(
  cors({
    origin: CLIENT_ORIGIN
  })
);


app.use('/users', usersRouter);
app.use('/items', itemsRouter);
app.use('/auth', authRouter);

passport.use(localStrategy);
passport.use(jwtStrategy);

app.get('/', (req, res) => {
  // res.json({ message: 'Hello world!' });
  res.status(200).res.sendFile(__dirname + '/index.html')
});

let server;

function runServer(databaseUrl=DATABASE_URL, port=PORT) {
  return new Promise((resolve, reject) => {
    mongoose.connect(databaseUrl, { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true, useFindAndModify: false }, err => {
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

module.exports = { runServer, app, closeServer };