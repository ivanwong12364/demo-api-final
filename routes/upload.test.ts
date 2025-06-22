import Koa from 'koa';
import Router from 'koa-router';
import request from 'supertest';
import fs from 'fs';
import path from 'path';
import { router as uploadRouter } from '../../Demo_API_Final/routes/uploads';

import koaBody from 'koa-body';

describe('Image upload API', () => {
  const app = new Koa();
  app.use(uploadRouter.routes()).use(uploadRouter.allowedMethods());

  const dummyImagePath = path.join(__dirname, 'test-image.jpg');
  const dummyFileContent = Buffer.from('dummy image content');

  beforeAll(() => {
    if (!fs.existsSync(dummyImagePath)) {
      fs.writeFileSync(dummyImagePath, dummyFileContent);
    }
  });

  it('should upload an image and return 201 with file info', async () => {
    const res = await request(app.callback())
      .post('/api/v1/images')
      .attach('upload', dummyImagePath);

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('filename');
    expect(res.body).toHaveProperty('type');
    expect(res.body).toHaveProperty('extension');
    expect(res.body.links).toHaveProperty('path');
  });

  it('should return 404 for nonexistent image UUID', async () => {
    const res = await request(app.callback()).get(
      '/api/v1/images/1b0b6b17c12d236949bd67200'
    );
    expect(res.status).toBe(404);
  });

  afterAll(() => {
    if (fs.existsSync(dummyImagePath)) {
      fs.unlinkSync(dummyImagePath);
    }
  });
});
