// api/index.js - Vercel Serverless Backend Handler
const express = require('express');

const app = express();

// Native CORS middleware without external package dependency
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

app.use(express.json());

const initialTeams = () => ({
  "1": { id: "1", name: "Equipo 1", hearts: 6, bullets: 1, score: 0, currentCase: 0, status: "En Espera" },
  "2": { id: "2", name: "Equipo 2", hearts: 6, bullets: 1, score: 0, currentCase: 0, status: "En Espera" },
  "3": { id: "3", name: "Equipo 3", hearts: 6, bullets: 1, score: 0, currentCase: 0, status: "En Espera" },
  "4": { id: "4", name: "Equipo 4", hearts: 6, bullets: 1, score: 0, currentCase: 0, status: "En Espera" },
  "5": { id: "5", name: "Equipo 5", hearts: 6, bullets: 1, score: 0, currentCase: 0, status: "En Espera" },
  "6": { id: "6", name: "Equipo 6", hearts: 6, bullets: 1, score: 0, currentCase: 0, status: "En Espera" }
});

let gameState = {
  phase: 'playing',
  teams: initialTeams()
};

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

app.post('/api/admin/reset', (req, res) => {
  gameState.teams = initialTeams();
  res.json({ success: true, gameState });
});

app.post('/api/team/action', (req, res) => {
  const { teamId, caseIndex, optionIdx, isCorrect, bulletsAdd, heartsCost, pointsAdd } = req.body;

  if (!teamId || !gameState.teams[teamId]) {
    return res.status(400).json({ error: 'Equipo no válido' });
  }

  const team = gameState.teams[teamId];
  team.currentCase = caseIndex + 1;

  if (isCorrect) {
    team.bullets = Math.max(1, team.bullets - 1);
    team.score += pointsAdd || 150;
    team.status = "🛑 Límite Firme";
    return res.json({ success: true, team, triggeredSpin: false, disparo: false });
  } else {
    // Mal: Carga bala y fuerza a girar revólver
    team.bullets = Math.min(6, team.bullets + (bulletsAdd || 1));
    const disparo = Math.random() < (team.bullets / 6);

    if (disparo) {
      team.hearts = Math.max(0, team.hearts - 1);
      team.status = team.hearts > 0 ? "💥 ¡BANG! Disparo" : "💔 Colapsó";
    } else {
      team.score += 40;
      team.status = "⚠️ Clic... Salvado";
    }

    return res.json({ success: true, team, triggeredSpin: true, disparo });
  }
});

module.exports = app;
