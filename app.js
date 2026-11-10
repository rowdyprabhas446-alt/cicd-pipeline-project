
const express = require('express');
const os = require('os');
const path = require('path');
const crypto = require('crypto');
const { MongoClient } = require('mongodb');

const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const defaultPipelineStages = [
  { stage: 1, name: 'Build App', tool: 'Node.js + Express', status: 'done' },
  { stage: 2, name: 'Containerize', tool: 'Docker', status: 'pending' },
  { stage: 3, name: 'Continuous Integration', tool: 'GitHub Actions', status: 'pending' },
  { stage: 4, name: 'Continuous Delivery', tool: 'Docker Hub', status: 'pending' },
  { stage: 5, name: 'Cloud Deployment', tool: 'Render', status: 'pending' }
];

let memoryPipelineStages = defaultPipelineStages.map(stage => ({ ...stage }));
let mongoClient;
let pipelineCollection;

async function getPipelineCollection() {
  if (pipelineCollection) return pipelineCollection;

  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error('MONGODB_URI environment variable is not configured');
  }

  mongoClient = new MongoClient(uri);
  await mongoClient.connect();

  const db = mongoClient.db(
    process.env.MONGODB_DB || 'cicd_pipeline'
  );

  pipelineCollection = db.collection('pipeline_status');

  await pipelineCollection.updateOne(
    { _id: 'current' },
    { $setOnInsert: { stages: defaultPipelineStages } },
    { upsert: true }
  );

  return pipelineCollection;
}

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'UP',
    timestamp: new Date().toISOString()
  });
});

// Application information
app.get('/api/info', (req, res) => {
  res.json({
    name: 'CI/CD Pipeline Demo',
    version: process.env.APP_VERSION || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    hostname: os.hostname(),
    nodeVersion: process.version,
    uptimeSeconds: Math.floor(process.uptime())
  });
});

// Read pipeline status from MongoDB

// Read pipeline status from MongoDB
app.get('/api/pipeline', async (req, res) => {
  if (!process.env.MONGODB_URI) {
    return res.json(memoryPipelineStages);
  }

  try {
    const collection = await getPipelineCollection();
    const document = await collection.findOne({ _id: 'current' });

    if (!document) {
      return res.status(404).json({
        error: 'Pipeline status document not found'
      });
    }

    res.json(document.stages);
  } catch (error) {
    console.error('MongoDB pipeline read error:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });

    return res.status(503).json({
      error: 'Unable to read pipeline status from database'
    });
  }
});


// Protected endpoint for GitHub Actions
app.post('/api/pipeline/status', async (req, res) => {
  const expectedToken = process.env.PIPELINE_STATUS_TOKEN;
  const suppliedToken = req.get('Authorization');

  if (!expectedToken || suppliedToken !== `Bearer ${expectedToken}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { stages } = req.body;

  if (!Array.isArray(stages) || stages.length !== 5) {
    return res.status(400).json({
      error: 'Expected status updates for all five stages'
    });
  }

  const validStatuses = ['pending', 'done', 'failed'];
  const validStageNumbers = new Set(
    defaultPipelineStages.map(stage => stage.stage)
  );

  for (const update of stages) {
    if (
      !update ||
      !validStageNumbers.has(update.stage) ||
      !validStatuses.includes(update.status)
    ) {
      return res.status(400).json({
        error: 'Each stage must have a valid stage number and status'
      });
    }
  }

  if (new Set(stages.map(update => update.stage)).size !== 5) {
    return res.status(400).json({
      error: 'Each of the five stages must appear exactly once'
    });
  }

  try {
    const updatedStages = defaultPipelineStages.map(stage => {
      const update = stages.find(
        item => item.stage === stage.stage
      );

      return { ...stage, status: update.status };
    });

    if (!process.env.MONGODB_URI) {
      memoryPipelineStages = updatedStages.map(stage => ({ ...stage }));
      return res.json({
        message: 'Pipeline status updated in memory',
        stages: memoryPipelineStages
      });
    }

    const collection = await getPipelineCollection();
    await collection.updateOne(
      { _id: 'current' },
      {
        $set: {
          stages: updatedStages,
          updatedAt: new Date()
        }
      },
      { upsert: true }
    );

    res.json({
      message: 'Pipeline status updated',
      stages: updatedStages
    });
  } catch (error) {
    console.error('Failed to save pipeline status:', error.message);

    res.status(503).json({
      error: 'Unable to save pipeline status to database'
    });
  }
});

// Trigger GitHub Actions deployment from the dashboard
app.post('/api/deploy', async (req, res) => {
  const expectedToken = process.env.DEPLOY_TRIGGER_TOKEN;

  if (!expectedToken) {
    return res.status(503).json({
      error: 'Deployment access key is not configured'
    });
  }

  const authHeader = req.get('Authorization') || '';
  const match = authHeader.match(/^Bearer\s+(.+)$/i);
  const suppliedToken = match ? match[1] : '';

  const expectedBuffer = Buffer.from(expectedToken);
  const suppliedBuffer = Buffer.from(suppliedToken);

  const validToken =
    suppliedBuffer.length === expectedBuffer.length &&
    crypto.timingSafeEqual(suppliedBuffer, expectedBuffer);

  if (!validToken) {
    return res.status(401).json({
      error: 'Invalid or missing deployment access key'
    });
  }

  const githubToken = process.env.GITHUB_TOKEN;
  const repository = process.env.GITHUB_REPOSITORY;
  const branch = process.env.GITHUB_DEPLOY_BRANCH || 'main';
  const workflowFile = process.env.GITHUB_WORKFLOW_FILE || 'ci.yml';

  if (
    !githubToken ||
    !repository ||
    !/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(repository)
  ) {
    return res.status(503).json({
      error: 'GitHub deployment configuration is missing or invalid'
    });
  }

  const dispatchUrl =
    `https://api.github.com/repos/${repository}/actions/workflows/${encodeURIComponent(workflowFile)}/dispatches`;

  try {
    const githubResponse = await fetch(dispatchUrl, {
      method: 'POST',
      headers: {
        Accept: 'application/vnd.github+json',
        Authorization: `Bearer ${githubToken}`,
        'X-GitHub-Api-Version': '2022-11-28',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ ref: branch })
    });

    if (!githubResponse.ok) {
      console.error(
        'GitHub workflow dispatch failed:',
        githubResponse.status
      );

      return res.status(502).json({
        error: `GitHub workflow dispatch failed (HTTP ${githubResponse.status})`
      });
    }

    return res.status(202).json({
      message: `Deployment workflow started for ${branch}`
    });
  } catch (error) {
    console.error('Deployment dispatch error:', error.message);

    return res.status(502).json({
      error: 'Unable to contact GitHub Actions'
    });
  }
});

module.exports = app;
