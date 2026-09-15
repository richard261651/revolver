// api/index.js - Express backend fallback for serverless
const express = require('express');
const app = express();
const stateHandler = require('./state.js');
const resetHandler = require('./admin/reset.js');
const startHandler = require('./admin/start.js');
const actionHandler = require('./team/action.js');

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

app.use(express.json());

app.get('/api/state', stateHandler);
app.get('/state', stateHandler);

app.post('/api/admin/reset', resetHandler);
app.post('/admin/reset', resetHandler);

app.post('/api/admin/start', startHandler);
app.post('/admin/start', startHandler);

app.post('/api/team/action', actionHandler);
app.post('/team/action', actionHandler);

module.exports = app;
