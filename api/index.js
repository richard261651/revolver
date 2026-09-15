// api/index.js - Vercel Serverless Function Handler (3 Casos Fijos)
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json());

const INFILTRADOS = ["3", "6"];

// 3 Casos Fijos
const CASOS_FIJOS = [
  {
    titulo: "Caso 1: La Fachada en Redes",
    desc: "Una pareja finge amor idílico en redes sociales, pero descubres que hay agresión e infidelidad oculta. Al pedir explicaciones, te exigen guardar silencio por 'el qué dirán'. ¿Confrontar la farsa o mantener las apariencias del círculo?"
  },
  {
    titulo: "Caso 2: Lujos y Falsa Reparación",
    desc: "Tras un hecho de violencia física, el agresor intenta 'resarcir' el daño regalando artículos de lujo, joyas y pidiendo disculpas. ¿Aceptar la transferencia patrimonial equivale a perdonar el maltrato?"
  },
  {
    titulo: "Caso 3: La Amenaza Velada (El Revólver)",
    desc: "Consigues una prueba/arma objetiva con la que puedes neutralizar al agresor. ¿Es mejor ejecutar una venganza/disparo inmediato, o mantener la amenaza en silencio para garantizar disuasión constante sin derramar sangre?"
  }
];

let gameState = {
  phase: 'lobby',
  currentCaseIndex: 0,
  joinedTeams: {},
  votes: {},
  revealDone: false,
  casos: CASOS_FIJOS
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

// POST /api/join
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
    if (gameState.currentCaseIndex < CASOS_FIJOS.length - 1) {
      gameState.currentCaseIndex++;
      gameState.votes = {};
      gameState.revealDone = false;
    }
  } else if (action === 'prev') {
    if (gameState.currentCaseIndex > 0) {
      gameState.currentCaseIndex--;
      gameState.votes = {};
      gameState.revealDone = false;
    }
  } else if (action === 'reset') {
    gameState = {
      phase: 'lobby',
      currentCaseIndex: 0,
      joinedTeams: {},
      votes: {},
      revealDone: false,
      casos: CASOS_FIJOS
    };
  }

  return res.json({ success: true, gameState });
});

module.exports = app;
