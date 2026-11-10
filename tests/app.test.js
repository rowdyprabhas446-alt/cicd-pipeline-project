
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

describe('POST /api/deploy', () => {
  const savedEnvironment = {};

  beforeEach(() => {
    ['DEPLOY_TRIGGER_TOKEN', 'GITHUB_TOKEN', 'GITHUB_REPOSITORY', 'GITHUB_DEPLOY_BRANCH'].forEach(key => {
      savedEnvironment[key] = process.env[key];
    });
    process.env.DEPLOY_TRIGGER_TOKEN = 'test-deploy-token-with-at-least-32-chars';
    process.env.GITHUB_TOKEN = 'test-github-token';
    process.env.GITHUB_REPOSITORY = 'example/cicd-demo';
    process.env.GITHUB_DEPLOY_BRANCH = 'main';
  });

  afterEach(() => {
    Object.entries(savedEnvironment).forEach(([key, value]) => {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
      delete savedEnvironment[key];
    });
    jest.restoreAllMocks();
  });

  test('rejects requests without the deployment access key', async () => {
    const res = await request(app).post('/api/deploy');

    expect(res.statusCode).toBe(401);
    expect(res.body.error).toMatch(/access key/i);
  });

  test('dispatches the configured GitHub Actions workflow', async () => {
    const fetchSpy = jest.spyOn(global, 'fetch').mockResolvedValue({ ok: true, status: 204 });
    const res = await request(app)
      .post('/api/deploy')
      .set('Authorization', 'Bearer test-deploy-token-with-at-least-32-chars');

    expect(res.statusCode).toBe(202);
    expect(res.body.message).toMatch(/started for main/);
    expect(fetchSpy).toHaveBeenCalledWith(
      'https://api.github.com/repos/example/cicd-demo/actions/workflows/ci.yml/dispatches',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ ref: 'main' })
      })
    );
  });
});
