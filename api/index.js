// api/index.js - Real-time State Sync Serverless Backend
const express = require('express');

const app = express();

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

app.use(express.json());

const initialTeams = () => ({
  "1": { id: "1", name: "Equipo 1", hearts: 1, bullets: 1, score: 0, currentCase: 0, status: "En Espera" },
  "2": { id: "2", name: "Equipo 2", hearts: 1, bullets: 1, score: 0, currentCase: 0, status: "En Espera" },
  "3": { id: "3", name: "Equipo 3", hearts: 1, bullets: 1, score: 0, currentCase: 0, status: "En Espera" },
  "4": { id: "4", name: "Equipo 4", hearts: 1, bullets: 1, score: 0, currentCase: 0, status: "En Espera" },
  "5": { id: "5", name: "Equipo 5", hearts: 1, bullets: 1, score: 0, currentCase: 0, status: "En Espera" },
  "6": { id: "6", name: "Equipo 6", hearts: 1, bullets: 1, score: 0, currentCase: 0, status: "En Espera" }
});

let gameState = {
  phase: 'playing',
  teams: initialTeams()
};

app.get('/api/state', (req, res) => {
  res.json({
    ...gameState,
    serverTime: Date.now()
  });
});

app.post('/api/admin/reset', (req, res) => {
  gameState.teams = initialTeams();
  res.json({ success: true, gameState });
});

app.post('/api/team/action', (req, res) => {
  const { teamId, teamState } = req.body;

  if (teamId && teamState && gameState.teams[teamId]) {
    gameState.teams[teamId] = {
      ...gameState.teams[teamId],
      ...teamState,
      updatedAt: teamState.updatedAt || Date.now()
    };
  }

  return res.json({ success: true, team: gameState.teams[teamId], teams: gameState.teams });
});

module.exports = app;
