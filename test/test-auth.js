const chai = require('chai');
const chaiHttp = require('chai-http');
const jwt = require('jsonwebtoken');

const { app, runServer, closeServer } = require('../server');
const User = require('../models/users');
const { JWT_SECRET, TEST_DATABASE_URL } = require('../config');

const expect = chai.expect;

chai.use(chaiHttp);

describe('Auth endpoints', function () {
  const username = 'exampleUser';
  const password = 'examplePass';
  const firstName = 'Example';

  before(function () {
    return runServer(TEST_DATABASE_URL);
  });

  after(function () {
    return closeServer();
  });

  beforeEach(function() {
    return User.hashPassword(password).then(password => {
      User.create({
        username,
        password,
        firstName
      });
    });
  });

  afterEach(function() {
    return User.deleteOne();
  });

  describe('/auth/login', function () {
    it('should reject requests with no credentials', function() {
      return chai
        .request(app)
        .post('/auth/login')
        .then(res => expect(res).to.have.status(400))
    });

    it('Should reject requests with incorrect username', function() {
      return chai
        .request(app)
        .post('/auth/login')
        .send({
          username: 'wrongUser',
          password
        })
        .then(res => expect(res).to.have.status(401))
    });

    it('Should reject requests with incorrect passwords', function() {
      return chai 
        .request(app)
        .post('/auth/login')
        .send({
          username,
          password: 'wrongPass'
        })
        .then(res => expect(res).to.have.status(401))
    });

    it('Should return a valid token', function() {
      return chai
        .request(app)
        .post('/auth/login')
        .send({ username, password })
        .then(res => {
          expect(res).to.have.status(200);
          expect(res.body).to.be.an('object');
          const token = res.body.authToken;
          expect(token).to.be.a('string');
          const payload = jwt.verify(token, JWT_SECRET, {
            algorithm: ['HS256']
          });
          const { id, username, firstName } = payload.user
          console.log(payload.user)
          expect({id, username, firstName}).to.deep.equal({ id: payload.user.id, username, firstName})
        });
    });
  });

  describe('/auth/refresh', function() {
    it('Should reject requests with no credentials', function() {
      return chai
        .request(app)
        .post('/auth/refresh')
        .then(res => expect(res).to.have.status(401));
    });

    it('Should reject requests with an invalid token', function() {
      const token = jwt.sign({
        username,
        firstName
      },
        'wrongSecret',
      {
        algorithm: 'HS256',
        expiresIn: '7d'
      }
      );

      return chai 
        .request(app)
        .post('/auth/refresh')
        .set('Authorization', `Bearer ${token}`)
        .then(res => expect(res).to.have.status(401))
    });

    it('Should reject requests with an expired token', function() {
      const token = jwt.sign({
        user : {
          username,
          firstName
        },
        exp: Math.floor(Date.now() / 1000) - 10 
      },
        JWT_SECRET,
      {
        algorithm: 'HS256',
        subject: username
      }
      );

      return chai
        .request(app)
        .post('/auth/refresh')
        .set('Authorization', `Bearer ${token}`)
        .then(res => expect(res).to.have.status(401))
    });

    it('Should return a valid token with newer expiry date', function() {
      const token = jwt.sign({
        user : {
          username,
          firstName
        }
      },
        JWT_SECRET,
      {
        algorithm: 'HS256',
        subject: username,
        expiresIn: '7d'
      }
      );

      const decoded = jwt.decode(token);

      return chai
        .request(app)
        .post('/auth/refresh')
        .set('Authorization', `Bearer ${token}`)
        .then(res => {
          expect(res).to.have.status(200);
          expect(res.body).to.be.an('object');
          const token = res.body.authToken;
          expect(token).to.be.a('string');
          const payload = jwt.verify(token, JWT_SECRET, {
            algorithm: ['HS256']
          });
          expect(payload.user).to.deep.equal({ username, firstName });
          expect(payload.exp).to.be.at.least(decoded.exp);
        });
    });
  });
})