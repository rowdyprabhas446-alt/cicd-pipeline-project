
const request = require('supertest');

jest.mock('mongodb', () => {
  const mockCollection = {
    updateOne: jest.fn().mockResolvedValue({ acknowledged: true }),
    findOne: jest.fn().mockResolvedValue({
      _id: 'current',
      stages: [
        { stage: 1, name: 'Build App', tool: 'Node.js + Express', status: 'done' },
        { stage: 2, name: 'Containerize', tool: 'Docker', status: 'pending' },
        { stage: 3, name: 'Continuous Integration', tool: 'GitHub Actions', status: 'pending' },
        { stage: 4, name: 'Continuous Delivery', tool: 'Docker Hub', status: 'pending' },
        { stage: 5, name: 'Cloud Deployment', tool: 'Render', status: 'pending' }
      ]
    })
  };

  return {
    MongoClient: jest.fn().mockImplementation(() => ({
      connect: jest.fn().mockResolvedValue(undefined),
      db: jest.fn().mockReturnValue({
        collection: jest.fn().mockReturnValue(mockCollection)
      })
    }))
  };
});

process.env.MONGODB_URI = 'mongodb://localhost:27017/test';

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
    expect(res.body.name).toBe('CI/CD Pipeline Demo');
  });

  test('GET /api/pipeline returns 5 stages', async () => {
    const res = await request(app).get('/api/pipeline');

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveLength(5);
  });
});
