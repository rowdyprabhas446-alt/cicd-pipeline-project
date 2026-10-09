
const express = require('express');
const os = require('os');
const path = require('path');

const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Initial pipeline state
let pipelineStages = [
  { stage: 1, name: 'Build App', tool: 'Node.js + Express', status: 'done' },
  { stage: 2, name: 'Containerize', tool: 'Docker', status: 'pending' },
  { stage: 3, name: 'Continuous Integration', tool: 'GitHub Actions', status: 'pending' },
  { stage: 4, name: 'Continuous Delivery', tool: 'Docker Hub', status: 'pending' },
  { stage: 5, name: 'Cloud Deployment', tool: 'Render', status: 'pending' }
];

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

// Return current pipeline status
app.get('/api/pipeline', (req, res) => {
  res.json(pipelineStages);
});

// Protected endpoint for GitHub Actions
app.post('/api/pipeline/status', (req, res) => {
  const expectedToken = process.env.PIPELINE_STATUS_TOKEN;
  const suppliedToken = req.get('Authorization');

  if (
    !expectedToken ||
    suppliedToken !== `Bearer ${expectedToken}`
  ) {
    return res.status(401).json({
      error: 'Unauthorized'
    });
  }

  const { stages } = req.body;

  if (!Array.isArray(stages) || stages.length !== 5) {
    return res.status(400).json({
      error: 'Expected status updates for all five stages'
    });
  }

  const validStatuses = ['pending', 'done', 'failed'];

  for (let i = 0; i < pipelineStages.length; i++) {
    const update = stages.find(
      item => item.stage === pipelineStages[i].stage
    );

    if (!update || !validStatuses.includes(update.status)) {
      return res.status(400).json({
        error: `Invalid status for stage ${i + 1}`
      });
    }
  }

  pipelineStages = pipelineStages.map(stage => {
    const update = stages.find(item => item.stage === stage.stage);
    return { ...stage, status: update.status };
  });

  res.json({
    message: 'Pipeline status updated',
    stages: pipelineStages
  });
});

module.exports = app;
