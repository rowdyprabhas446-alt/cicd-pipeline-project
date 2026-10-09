
const express = require('express');
const os = require('os');
const path = require('path');
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
app.get('/api/pipeline', async (req, res) => {
  try {
    const collection = await getPipelineCollection();
    const document = await collection.findOne({ _id: 'current' });

    res.json(document.stages);
  } catch (error) {
    console.error('Failed to read pipeline status:', error.message);

    res.status(503).json({
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
    const collection = await getPipelineCollection();

    const updatedStages = defaultPipelineStages.map(stage => {
      const update = stages.find(
        item => item.stage === stage.stage
      );

      return { ...stage, status: update.status };
    });

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

module.exports = app;
