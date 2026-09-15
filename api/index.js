// api/index.js - Vercel Serverless Function API Handler
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json());

// Infiltrados definidos
const INFILTRADOS = ["3", "6"];

// Estado Global del Juego (In-Memory Serverless State Store)
let gameState = {
  phase: 'lobby', // 'lobby' | 'game'
  currentCaseIndex: 0,
  joinedTeams: {}, // { "1": { vocero: "Carlos", deviceId: "xyz" } }
  votes: {},       // { "1": "3" }
  revealDone: false
};

// GET /api/state
app.get('/api/state', (req, res) => {
  const host = req.headers.host || 'localhost';
  const protocol = req.headers['x-forwarded-proto'] || 'http';
  const baseUrl = `${protocol}://${host}`;

  res.json({
    ...gameState,
    baseUrl
  });
});

// POST /api/join - 1 Dispositivo Por Equipo
app.post('/api/join', (req, res) => {
  const { teamId, vocero, deviceId } = req.body;

  if (!teamId || !vocero || !deviceId) {
    return res.status(400).json({ error: 'Faltan datos requeridos (teamId, vocero, deviceId).' });
  }

  const existing = gameState.joinedTeams[teamId];
  if (existing && existing.deviceId !== deviceId) {
    return res.status(409).json({ error: `El Equipo ${teamId} ya fue tomado por otro dispositivo en la sala.` });
  }

  gameState.joinedTeams[teamId] = { vocero, deviceId };
  return res.json({ success: true, teamId, vocero });
});

// POST /api/vote
app.post('/api/vote', (req, res) => {
  const { teamId, targetId, deviceId } = req.body;

  const team = gameState.joinedTeams[teamId];
  if (!team || team.deviceId !== deviceId) {
    return res.status(403).json({ error: 'Dispositivo no autorizado para este equipo.' });
  }

  gameState.votes[teamId] = targetId;
  return res.json({ success: true });
});

// POST /api/admin/:action
app.post('/api/admin/:action', (req, res) => {
  const action = req.params.action;

  if (action === 'start') {
    gameState.phase = 'game';
    gameState.currentCaseIndex = 0;
    gameState.votes = {};
    gameState.revealDone = false;
  } else if (action === 'reveal') {
    gameState.revealDone = true;
  } else if (action === 'next') {
    if (gameState.currentCaseIndex < 2) {
      gameState.currentCaseIndex++;
      gameState.votes = {};
      gameState.revealDone = false;
    }
  } else if (action === 'reset') {
    gameState = {
      phase: 'lobby',
      currentCaseIndex: 0,
      joinedTeams: {},
      votes: {},
      revealDone: false
    };
  }

  return res.json({ success: true, gameState });
});

module.exports = app;
