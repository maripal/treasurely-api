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

      
    })
  })
})