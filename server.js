const express = require('express');
const cors = require('cors');
const {CLIENT_ORIGIN} = require('./config');
const app = express();

const PORT = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(
  cors({
    origin: CLIENT_ORIGIN
  })
);

app.get('/api/', (req, res) => {
  res.send('Hello world!');
});

app.listen(PORT, () => console.log(`Listening on port ${PORT}`));

module.exports = { app };