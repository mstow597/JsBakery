import supertest from 'supertest';
import mongoose from 'mongoose';
import { getServer } from '../tempServer.mjs';
import { User } from '../../models/userModel.mjs';

describe('Routes - /api/v1/users', () => {
  describe('Signup', () => {
    let server;
    let existingUser = {
      name: 'testing test',
      email: 'testing5@test.io',
      emailConfirm: 'testing5@test.io',
      phone: '5555555555',
      password: 'Testing1234!@',
      passwordConfirm: 'Testing1234!@',
    };
    beforeEach(async () => {
      server = await getServer();
      await User.create(existingUser);
    });
    afterEach(async () => {
      await User.deleteMany({});
      server.close();
    });
    it('should create a new user successfully (no duplicate key)', async () => {
      const user = {
        name: 'testing testing',
        email: 'testing1@test.io',
        emailConfirm: 'testing1@test.io',
        phone: '5555555555',
        password: 'Testing1234!@#',
        passwordConfirm: 'Testing1234!@#',
      };

      const expectedResponseObject = {
        status: 'success',
        data: {
          name: 'testing testing',
          email: 'testing1@test.io',
          message: `testing testing, you're account was successfully created. Prior to accessing you account, you must verify your email address with the link provided in a message sent to your email address: testing1@test.io.`,
        },
      };
      const res = await supertest(server).post('/api/v1/users/signup').send(user);
      expect(res.status).toBe(201);
      expect(res.body).toMatchObject(expectedResponseObject);
    });

    it('should reject user signup when desired email already in use by an account in database', async () => {
      const res = await supertest(server).post('/api/v1/users/signup').send(existingUser);
      expect(res.status).toBe(400);
      expect(res.body).toMatchObject({
        status: 'failed',
        message: `Sorry we were unable to create your account. If you are unsure if an account exists for the requested email address, consider submitting a password reset or email verification request.`,
      });
    });
  });
  afterAll(async () => {
    await User.deleteMany({});
    await mongoose.disconnect();
  });
});
