const request = require('supertest');
const faker = require('faker');

const app = require('../../app');
const models = require('../../models');

const { sequelize, User } = models;
const {
  internet: { email, password },
} = faker;

describe('POST /api/auth', () => {
  describe('with correct credentials', () => {
    test('should respond with access token', async (done) => {
      const user = {
        email: email(),
        password: password(),
      };
      await User.create(user);

      request(app)
        .post('/api/auth')
        .send(user)
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);

          expect(res.body.data.token).toMatch(
            /^[a-zA-Z0-9\-_]+?\.[a-zA-Z0-9\-_]+?\.[a-zA-Z0-9\-_]+?$/,
          );

          done();
        });
    });
  });

  describe('with wrong credentials', () => {
    test('should respond with wrong password error', async (done) => {
      const user = {
        email: email(),
        password: password(),
      };
      await User.create(user);

      request(app)
        .post('/api/auth')
        .send({ ...user, password: password() })
        .expect(401)
        .end((err, res) => {
          if (err) return done(err);

          expect(res.body.errors.length).toBe(1);
          expect(res.body.errors[0]).toEqual({ title: 'Wrong password' });

          done();
        });
    });

    test('should respond with user not found error', (done) => {
      const user = {
        email: email(),
        password: password(),
      };

      request(app)
        .post('/api/auth')
        .send(user)
        .expect(401)
        .end((err, res) => {
          if (err) return done(err);

          expect(res.body.errors.length).toBe(1);
          expect(res.body.errors[0]).toEqual({ title: 'User not found' });

          done();
        });
    });

    test('should respond with missing credentials error', (done) => {
      const user = {};

      request(app)
        .post('/api/auth')
        .send(user)
        .expect(401)
        .end((err, res) => {
          if (err) return done(err);

          expect(res.body.errors.length).toBe(1);
          expect(res.body.errors[0]).toEqual({ title: 'Missing credentials' });

          done();
        });
    });
  });

  // TODO: global afterEach clean database?
  afterEach(async () => {
    // drop and recreate given table
    // User.sync({ force: true });

    // truncate given table
    // User.truncate();

    // run .sync() only if database name ends with '_test'
    // await sequelize.sync({ force: true, match: /_test$/ });

    await sequelize.truncate();
  });

  afterAll(async () => {
    await sequelize.close();
  });
});
