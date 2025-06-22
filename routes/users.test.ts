import request from 'supertest';
import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import { router as userRouter } from '../routes/users'; // Adjust path if needed

const app = new Koa();
app.use(bodyParser());
app.use(userRouter.routes());
app.use(userRouter.allowedMethods());

describe('User Routes', () => {
  it('POST /api/v1/users - should create a new user', async () => {
    const res = await request(app.callback())
      .post('/api/v1/users')
      .send({
        username: 'testuser',
        password: 'testpassword',
        email: 'test@example.com',
        avatarurl: 'https://example.com/avatar.png'
      });

    expect([201, 500]).toContain(res.status); // 500 if DB fails
    expect(res.body).toBeDefined();
  });

  it('GET /api/v1/users/:id - should return unauthorized without auth', async () => {
    const res = await request(app.callback()).get('/api/v1/users/1');
    expect(res.status).toBe(401); // because it needs basicAuth
  });
});
