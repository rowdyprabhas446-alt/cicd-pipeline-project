const request = require('supertest');
const app = require('../app');

describe('API endpoints', () => {
  test('GET /health returns UP', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('UP');
  });

  test('GET /api/info returns app info', async () => {
    const res = await request(app).get('/api/info');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('version');
    expect(res.body).toHaveProperty('hostname');
  });

  test('GET /api/pipeline returns 5 stages', async () => {
    const res = await request(app).get('/api/pipeline');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveLength(5);
  });
});
