import Koa from 'koa';
import Router from 'koa-router';
import bodyParser from 'koa-bodyparser';
import request from 'supertest';
import { addMsg } from '../routes/addMsg'; // Adjust to your actual file path

// Mock the msgs model
jest.mock('../models/msgs', () => ({
  add_Msg: jest.fn(() => Promise.resolve({ affectedRows: 1 }))
}));

const msgs = require('../models/msgs');

describe('addMsg controller', () => {
  const app = new Koa();
  const router = new Router();

  app.use(bodyParser());

  // Middleware to mock authentication
  app.use(async (ctx, next) => {
    ctx.state.user = {
      user: {
        id: 123,
        username: 'testuser',
        email: 'test@example.com'
      }
    };
    await next();
  });

  router.post('/api/v1/posts/:id/message', addMsg);
  app.use(router.routes()).use(router.allowedMethods());

  it('should add a message and return success', async () => {
    const response = await request(app.callback())
      .post('/api/v1/posts/456/message')
      .send({ messagetxt: 'This is a test message' });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: 'added' });
    expect(msgs.add_Msg).toHaveBeenCalledWith(
      456,
      123,
      'testuser',
      'test@example.com',
      'This is a test message'
    );
  });
});
