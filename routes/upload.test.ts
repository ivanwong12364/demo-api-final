import request from 'supertest';
import Koa from 'koa';
import fs from 'fs';
import path from 'path';
import { router } from '../routes/upload'; // adjust the path to your router

const app = new Koa();
app.use(router.routes());
app.use(router.allowedMethods());

describe('Image Upload Endpoint', () => {
  it('should upload an image and respond with status 201 and file info', async () => {
    const testImagePath = path.join(__dirname, 'test-image.jpg'); // Provide your own small image
    if (!fs.existsSync(testImagePath)) {
      fs.writeFileSync(testImagePath, 'fake image content'); // dummy file for testing
    }

    const res = await request(app.callback())
      .post('/api/v1/images')
      .attach('upload', testImagePath);

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('filename');
    expect(res.body).toHaveProperty('type');
    expect(res.body).toHaveProperty('extension');
    expect(res.body).toHaveProperty('links');
    expect(res.body.links).toHaveProperty('path');
  });

  it('should return 404 when requesting a non-existing image', async () => {
    const res = await request(app.callback()).get('/api/v1/images/00000000-0000-0000-0000-000000000000');
    expect(res.status).toBe(404);
  });
});
