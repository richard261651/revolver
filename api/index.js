// api/index.js - Vercel Serverless Backend Handler (3 Vidas / Sin Emojis / Ganador por Puntos)
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
  "1": { id: "1", name: "Equipo 1", hearts: 3, bullets: 1, score: 0, currentCase: 0, status: "En Espera" },
  "2": { id: "2", name: "Equipo 2", hearts: 3, bullets: 1, score: 0, currentCase: 0, status: "En Espera" },
  "3": { id: "3", name: "Equipo 3", hearts: 3, bullets: 1, score: 0, currentCase: 0, status: "En Espera" },
  "4": { id: "4", name: "Equipo 4", hearts: 3, bullets: 1, score: 0, currentCase: 0, status: "En Espera" },
  "5": { id: "5", name: "Equipo 5", hearts: 3, bullets: 1, score: 0, currentCase: 0, status: "En Espera" },
  "6": { id: "6", name: "Equipo 6", hearts: 3, bullets: 1, score: 0, currentCase: 0, status: "En Espera" }
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
  const { teamId, caseIndex, isCorrect, bulletsAdd, pointsAdd } = req.body;

  if (!teamId || !gameState.teams[teamId]) {
    return res.status(400).json({ error: 'Equipo no válido' });
  }

  const team = gameState.teams[teamId];
  team.currentCase = caseIndex + 1;

  if (isCorrect) {
    team.bullets = Math.max(1, team.bullets - 1);
    team.score += pointsAdd || 150;
    team.status = "LÍMITE FIRME";
    return res.json({ success: true, team, disparo: false });
  } else {
    team.bullets = Math.min(6, team.bullets + (bulletsAdd || 1));
    const disparo = Math.random() < (team.bullets / 6);

    if (disparo) {
      team.hearts = Math.max(0, team.hearts - 1);
      team.status = team.hearts > 0 ? "DISPARO (-1 VIDA)" : "COLAPSO TOTAL";
    } else {
      team.score += 40;
      team.status = "CLIC (SALVADO)";
    }

    return res.json({ success: true, team, disparo });
  }
});

module.exports = app;
