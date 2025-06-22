import request from 'supertest';
import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import { router } from '../routes/hotels'; // adjust path as needed

const app = new Koa();
app.use(bodyParser());
app.use(router.routes());
app.use(router.allowedMethods());

describe('Hotel Routes', () => {
  it('GET /api/v1/hotels should return hotels list', async () => {
    const res = await request(app.callback()).get('/api/v1/hotels');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('GET /api/v1/hotels/1 should return single hotel or 404', async () => {
    const res = await request(app.callback()).get('/api/v1/hotels/1');
    expect([200, 404]).toContain(res.status);
  });

  // You can mock authentication for secured routes in separate describe blocks
});
