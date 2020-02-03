const chai = require('chai');
const chaiHttp = require('chai-http');

const User = require('../models/users');
const { app, runServer, closeServer } = require('../server');
const { TEST_DATABASE_URL } = require('../config');

const expect = chai.expect;

chai.use(chaiHttp);

describe('User API', function() {
  const username = 'exampleUser';
  const password = 'examplePass';
  const firstName = 'Example';

  before(function() {
    return runServer(TEST_DATABASE_URL);
  });

  beforeEach(function() {});

  after(function() {
    return closeServer();
  });

  afterEach(function() {
    return User.deleteOne({});
  });

  describe('/users', function() {
    describe('POST', function() {
      it('should reject users with missing username', function() {
        return chai
          .request(app)
          .post('/users/add')
          .send({ password, firstName })
          .then(res => {
            expect(res).to.have.status(422);
            expect(res.body.reason).to.equal('ValidationError');
            expect(res.body.message).to.equal('Missing field');
            expect(res.body.location).to.equal('username');
          });
      });

      it('should reject user with missing password', function() {
        return chai
          .request(app)
          .post('/users/add')
          .send({ username, firstName })
          .then(res => {
            expect(res).to.have.status(422);
            expect(res.body.reason).to.equal('ValidationError');
            expect(res.body.message).to.equal('Missing field');
            expect(res.body.location).to.equal('password');
          });
      });

      it('should reject users with non-string username', function() {
        return chai
          .request(app)
          .post('/users/add')
          .send({ username: 1234, password, firstName })
          .then(res => {
            expect(res).to.have.status(422);
            expect(res.body.reason).to.equal('ValidationError');
            expect(res.body.message).to.equal('Incorrect field type: expected a string');
            expect(res.body.location).to.equal('username');
          });
      });

      it('should reject users with non-string password', function() {
        return chai
          .request(app)
          .post('/users/add')
          .send({ username, password: 1234, firstName })
          .then(res => {
            expect(res).to.have.status(422);
            expect(res.body.reason).to.equal('ValidationError');
            expect(res.body.message).to.equal('Incorrect field type: expected a string');
            expect(res.body.location).to.equal('password');
          });
      });

      it('should reject users with non-string first name', function() {
        return chai
          .request(app)
          .post('/users/add')
          .send({ username, password, firstName: 1234 })
          .then(res => {
            expect(res).to.have.status(422);
            expect(res.body.reason).to.equal('ValidationError');
            expect(res.body.message).to.equal('Incorrect field type: expected a string');
            expect(res.body.location).to.equal('firstName');
          });
      });

      it('should reject users with non-trimmed username', function() {
        return chai
          .request(app)
          .post('/users/add')
          .send({ username: ` ${username}`, password, firstName })
          .then(res => {
            expect(res).to.have.status(422);
            expect(res.body.reason).to.equal('ValidationError');
            expect(res.body.message).to.equal('Cannot start or end with whitespace');
            expect(res.body.location).to.equal('username');
          });
      });

      it('should reject users with non-trimmed password', function() {
        return chai
          .request(app)
          .post('/users/add')
          .send({ username, password: ` ${password}`, firstName })
          .then(res => {
            expect(res).to.have.status(422);
            expect(res.body.reason).to.equal('ValidationError');
            expect(res.body.message).to.equal('Cannot start or end with whitespace');
            expect(res.body.location).to.equal('password');
          });
      });

      it('should reject users with empty username', function() {
        return chai
          .request(app)
          .post('/users/add')
          .send({ username: '', password, firstName })
          .then(res => {
            expect(res).to.have.status(422);
            expect(res.body.reason).to.equal('ValidationError');
            expect(res.body.message).to.equal('Must be at least 3 characters long');
            expect(res.body.location).to.equal('username');
          });
      });

      it('should reject users with password less than 10 characters', function() {
        return chai
          .request(app)
          .post('/users/add')
          .send({ username, password: 'asd', firstName })
          .then(res => {
            expect(res).to.have.status(422);
            expect(res.body.reason).to.equal('ValidationError');
            expect(res.body.message).to.equal('Must be at least 10 characters long');
            expect(res.body.location).to.equal('password');
          });
      });

      it('should reject users with password greater than 72 characters', function() {
        return chai
          .request(app)
          .post('/users/add')
          .send({ username, password: new Array(73).fill('a').join(''), firstName })
          .then(res => {
            expect(res).to.have.status(422);
            expect(res.body.reason).to.equal('ValidationError');
            expect(res.body.message).to.equal('Must be at most 72 characters long');
            expect(res.body.location).to.equal('password');
          });
      });

      it('should reject users with duplicate username', function() {
        return User.create({
          username: 'exampleUser',
          password,
          firstName
        })
        .then(() => {
          return chai
            .request(app)
            .post('/users/add')
            .send({ username: 'exampleUser', password, firstName })
        })
        .then(res => {
          expect(res).to.have.status(422);
          expect(res.body.reason).to.equal('ValidationError');
          expect(res.body.message).to.equal('Username already exists');
          expect(res.body.location).to.equal('exampleUser');
        });
      });

      it('should create a new user', function() {
        return chai
          .request(app)
          .post('/users/add')
          .send({ username, password, firstName })
          .then(res => {
            expect(res).to.have.status(201);
            expect(res.body).to.be.an('object');
            expect(res.body).to.have.any.keys('id', 'username', 'firstName');
            expect(res.body.id).to.equal(res.body.id)
            expect(res.body.username).to.equal(username);
            expect(res.body.firstName).to.equal(firstName);
            return User.findOne({ username })
          })
          .then(user => {
            expect(user).to.not.be.null;
            expect(user.id).to.equal(user.id)
            expect(user.firstName).to.equal(firstName);
            return user.validatePassword(password);
          })
          .then(passwordIsCorrect => {
            expect(passwordIsCorrect).to.be.true;
          });
      });

      it('should trim firstName', function() {
        return chai
          .request(app)
          .post('/users/add')
          .send({ username, password, firstName: ` ${firstName} ` })
          .then(res => {
            expect(res).to.have.status(201);
            expect(res.body).to.be.an('object');
            expect(res.body).to.have.keys('id', 'username', 'firstName');
            return User.findOne({ username })
          })
          .then(user => {
            expect(user).to.not.be.null;
            expect(user.firstName).to.equal(firstName);
          });
      });
    });

    describe('GET', function() {
      it('should return an empty array initially', function() {
        return chai
          .request(app)
          .get('/users')
          .then(res => {
            expect(res).to.have.status(200);
            expect(res.body).to.be.an('array');
            expect(res.body).to.have.length(0);
          });
      });

      
    })
  })
})