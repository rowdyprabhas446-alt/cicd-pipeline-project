const express = require('express');
const os = require('os');
const path = require('path');

const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Health check (used later by Docker HEALTHCHECK and the CD smoke test)
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP', timestamp: new Date().toISOString() });
});

// App/runtime info shown on the dashboard
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

// Pipeline stages (the architecture this project builds up step by step)
app.get('/api/pipeline', (req, res) => {
  res.json([
    { stage: 1, name: 'Build App', tool: 'Node.js + Express', status: 'done' },
    { stage: 2, name: 'Containerize', tool: 'Docker', status: 'pending' },
    { stage: 3, name: 'Continuous Integration', tool: 'GitHub Actions', status: 'pending' },
    { stage: 4, name: 'Continuous Delivery', tool: 'Docker Registry', status: 'pending' },
    { stage: 5, name: 'Cloud Deployment', tool: 'Cloud Platform', status: 'pending' }
  ]);
});

module.exports = app;
