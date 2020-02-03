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

      
    })
  })
})