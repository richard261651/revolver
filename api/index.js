// api/index.js - Vercel Serverless Function Handler (Modo Rápido)
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json());

const INFILTRADOS = ["3", "6"];

// 3 Casos Fijos Sintéticos con Pistas Secretas para Infiltrados
const CASOS_FIJOS = [
  {
    titulo: "Caso 1: Apariencias y Redes",
    desc: "Una pareja finge amor idílico en redes pero oculta maltrato e infidelidad. El entorno pide no hacer escándalo. ¿Confrontar de frente o guardar silencio?",
    pistaImpostor: "💡 Argumenten que lo que ocurre en la pareja es privado y que denunciar públicamente o hacer escándalo arruina la estabilidad familiar."
  },
  {
    titulo: "Caso 2: Lujos y Falsa Reparación",
    desc: "Tras una agresión física, el agresor regaló joyas caras y teléfonos para 'comprar' el perdón. ¿Aceptar lujos equivale a saldar el maltrato?",
    pistaImpostor: "💡 Sostengan que los regalos costosos demuestran arrepentimiento real y la intención sincera del agresor de reparar las cosas."
  },
  {
    titulo: "Caso 3: La Amenaza Velada (El Revólver)",
    desc: "Consigues un arma/prueba decisiva. ¿Es mejor la venganza pública inmediata o la amenaza en silencio para lograr disuasión constante?",
    pistaImpostor: "💡 Defiendan que mantener la amenaza guardada sin usarla genera una 'tregua en paz' disuasiva y prudente que evita tragedias."
  }
];

let gameState = {
  phase: 'lobby',
  currentCaseIndex: 0,
  joinedTeams: {},
  votes: {},
  allVotes: [{}, {}, {}],
  revealDone: false,
  turnTeamId: "1",
  turnEndsAt: Date.now() + 60000,
  caseEndsAt: Date.now() + 45000,
  casos: CASOS_FIJOS
};

// GET /api/state
app.get('/api/state', (req, res) => {
  const host = req.headers.host || 'localhost';
  const protocol = req.headers['x-forwarded-proto'] || 'http';
  const baseUrl = `${protocol}://${host}`;

  res.json({
    ...gameState,
    serverTime: Date.now(),
    baseUrl
  });
});

// POST /api/join
app.post('/api/join', (req, res) => {
  const { teamId, vocero, deviceId } = req.body;

  if (!teamId || !vocero || !deviceId) {
    return res.status(400).json({ error: 'Faltan datos requeridos.' });
  }

  const existing = gameState.joinedTeams[teamId];
  if (existing && existing.deviceId !== deviceId) {
    return res.status(409).json({ error: `El Equipo ${teamId} ya está en la sala.` });
  }

  gameState.joinedTeams[teamId] = { vocero, deviceId };
  return res.json({ success: true, teamId, vocero });
});

// POST /api/vote
app.post('/api/vote', (req, res) => {
  const { teamId, targetId, deviceId } = req.body;

  const team = gameState.joinedTeams[teamId];
  if (!team || team.deviceId !== deviceId) {
    return res.status(403).json({ error: 'Dispositivo no autorizado.' });
  }

  gameState.votes[teamId] = targetId;
  if (!gameState.allVotes) gameState.allVotes = [{}, {}, {}];
  if (!gameState.allVotes[gameState.currentCaseIndex]) gameState.allVotes[gameState.currentCaseIndex] = {};
  gameState.allVotes[gameState.currentCaseIndex][teamId] = targetId;

  return res.json({ success: true });
});

// POST /api/turn/next
app.post('/api/turn/next', (req, res) => {
  const current = parseInt(gameState.turnTeamId || "1");
  const next = current < 6 ? current + 1 : 1;
  gameState.turnTeamId = String(next);
  gameState.turnEndsAt = Date.now() + 60000;
  return res.json({ success: true, turnTeamId: gameState.turnTeamId, gameState });
});

// POST /api/turn/reset-timer
app.post('/api/turn/reset-timer', (req, res) => {
  gameState.turnEndsAt = Date.now() + 60000;
  return res.json({ success: true, gameState });
});

// POST /api/turn/select
app.post('/api/turn/select', (req, res) => {
  const { teamId } = req.body;
  if (teamId) {
    gameState.turnTeamId = String(teamId);
    gameState.turnEndsAt = Date.now() + 60000;
  }
  return res.json({ success: true, turnTeamId: gameState.turnTeamId, gameState });
});

// POST /api/admin/:action
app.post('/api/admin/:action', (req, res) => {
  const action = req.params.action;

  if (action === 'start') {
    gameState.phase = 'game';
    gameState.currentCaseIndex = 0;
    gameState.turnTeamId = "1";
    gameState.turnEndsAt = Date.now() + 60000;
    gameState.caseEndsAt = Date.now() + 45000;
    gameState.votes = {};
    gameState.allVotes = [{}, {}, {}];
    gameState.revealDone = false;
  } else if (action === 'reveal') {
    gameState.revealDone = true;
  } else if (action === 'next') {
    if (gameState.currentCaseIndex < CASOS_FIJOS.length - 1) {
      gameState.currentCaseIndex++;
      gameState.turnTeamId = "1";
      gameState.turnEndsAt = Date.now() + 60000;
      gameState.caseEndsAt = Date.now() + 45000;
      gameState.votes = {};
      gameState.revealDone = false;
    }
  } else if (action === 'prev') {
    if (gameState.currentCaseIndex > 0) {
      gameState.currentCaseIndex--;
      gameState.turnTeamId = "1";
      gameState.turnEndsAt = Date.now() + 60000;
      gameState.caseEndsAt = Date.now() + 45000;
      gameState.votes = {};
      gameState.revealDone = false;
    }
  } else if (action === 'quick-advance') {
    if (!gameState.revealDone) {
      gameState.revealDone = true;
    } else {
      if (gameState.currentCaseIndex < CASOS_FIJOS.length - 1) {
        gameState.currentCaseIndex++;
        gameState.turnTeamId = "1";
        gameState.turnEndsAt = Date.now() + 60000;
        gameState.caseEndsAt = Date.now() + 45000;
        gameState.votes = {};
        gameState.revealDone = false;
      }
    }
  } else if (action === 'reset') {
    gameState = {
      phase: 'lobby',
      currentCaseIndex: 0,
      joinedTeams: {},
      votes: {},
      allVotes: [{}, {}, {}],
      revealDone: false,
      turnTeamId: "1",
      turnEndsAt: Date.now() + 60000,
      caseEndsAt: Date.now() + 45000,
      casos: CASOS_FIJOS
    };
  }

  return res.json({ success: true, gameState });
});

module.exports = app;
