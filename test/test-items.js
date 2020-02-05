const chai = require('chai');
const chaiHttp = require('chai-http');
const faker = require('faker');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const expect = chai.expect;

const Item = require('../models/items');
const User = require('../models/users');
const { app, runServer, closeServer } = require('../server');
const { JWT_SECRET, TEST_DATABASE_URL } = require('../config');

chai.use(chaiHttp);

// Input fake data to work with
function seedItemData() {
  const seedData = []
  for (let i = 1; i <= 5; i++) {
    seedData.push(generateItem());
  }
  return Item.insertMany(seedData);
}

// Generate an object with item data
function generateItem() {
  return {
    name: faker.commerce.productName(),
    price: +faker.finance.amount(),
    purchased: false
  };
}

// Create user to authenticate posts
const username = 'testUser';
const password = 'testPass';
const firstName = 'Tester';

let token = jwt.sign({
  user: {
    username,
    password
  }
},
  JWT_SECRET,
  {
    algorithm: 'HS256',
    subject: username,
    expiresIn: '7d'
  }
);

function tearDownDb() {
  console.warn('Deleting database!');
  return mongoose.connection.dropDatabase();
}

describe('Item API', function() {
  before(function() {
    return runServer(TEST_DATABASE_URL);
  });

  beforeEach(function() {
    return seedItemData();
  });

  afterEach(function() {
    return tearDownDb();
  });

  after(function() {
    return closeServer();
  });

  describe('GET', function() {
    it('should return all items', function() {
      let res;
      return chai
        .request(app)
        .get('/items')
        .set('Authorization', `Bearer ${token}`)
        .then(_res => {
          res = _res;
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.have.lengthOf.at.least(1);
          return Item.countDocuments();
        })
        .then(count => {
          expect(res.body).to.have.lengthOf(count);
        });
    });

    it('should return all items with right fields', function() {
      let resItem;
      return chai
        .request(app)
        .get('/items')
        .set('Authorization', `Bearer ${token}`)
        .then(res => {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.a('array');
          expect(res.body).to.have.lengthOf.at.least(1);

          res.body.forEach(item => {
            expect(item).to.be.a('object');
            expect(item).to.include.keys('id', 'name', 'price', 'purchased');
          })
          resItem = res.body[0];
        });
    });
  });

  describe('POST', function() {
    it('should add a new item', function() {
      const newItem = generateItem();
      return chai
        .request(app)
        .post('/items/add')
        .set('Authorization', `Bearer ${token}`)
        .send(newItem)
        .then(res => {
          expect(res).to.have.status(201);
          expect(res).to.be.json;
          expect(res.body).to.be.a('object');
          expect(res.body).to.include.keys('id', 'name', 'price', 'purchased');
          expect(res.body.id).to.not.be.null;
          expect(res.body.name).to.deep.equal(newItem.name);
          expect(res.body.price).to.deep.equal(newItem.price);
          expect(res.body.purchased).to.deep.equal(newItem.purchased);
        })
    })
  })
})