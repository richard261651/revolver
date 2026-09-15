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

const SYNC_OBJECT_ID = 'ff808181a09d98f701a0a6ae16af13fb';
const SYNC_API_URL = `https://api.restful-api.dev/objects/${SYNC_OBJECT_ID}`;

const initialTeams = () => ({
  "1": { id: "1", name: "Equipo 1", hearts: 1, bullets: 1, score: 0, currentCase: 1, status: "En Espera", occupied: false, occupiedBy: null, updatedAt: 0 },
  "2": { id: "2", name: "Equipo 2", hearts: 1, bullets: 1, score: 0, currentCase: 1, status: "En Espera", occupied: false, occupiedBy: null, updatedAt: 0 },
  "3": { id: "3", name: "Equipo 3", hearts: 1, bullets: 1, score: 0, currentCase: 1, status: "En Espera", occupied: false, occupiedBy: null, updatedAt: 0 },
  "4": { id: "4", name: "Equipo 4", hearts: 1, bullets: 1, score: 0, currentCase: 1, status: "En Espera", occupied: false, occupiedBy: null, updatedAt: 0 },
  "5": { id: "5", name: "Equipo 5", hearts: 1, bullets: 1, score: 0, currentCase: 1, status: "En Espera", occupied: false, occupiedBy: null, updatedAt: 0 },
  "6": { id: "6", name: "Equipo 6", hearts: 1, bullets: 1, score: 0, currentCase: 1, status: "En Espera", occupied: false, occupiedBy: null, updatedAt: 0 }
});

let inMemoryState = {
  phase: 'playing',
  resetCounter: 0,
  teams: initialTeams(),
  updatedAt: 0
};

async function fetchRemoteState() {
  try {
    const res = await fetch(SYNC_API_URL, { signal: AbortSignal.timeout(2500) });
    if (res.ok) {
      const remote = await res.json();
      if (remote && remote.data && remote.data.teams) {
        if (!inMemoryState.updatedAt || (remote.data.updatedAt && remote.data.updatedAt >= inMemoryState.updatedAt)) {
          inMemoryState = remote.data;
        }
      }
    }
  } catch (e) {}
  return inMemoryState;
}

async function saveRemoteState(newState) {
  inMemoryState = {
    ...newState,
    updatedAt: Date.now()
  };
  try {
    await fetch(SYNC_API_URL, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'revolver_classroom_state',
        data: inMemoryState
      }),
      signal: AbortSignal.timeout(3000)
    });
  } catch (e) {}
}

app.get('/api/state', async (req, res) => {
  const currentState = await fetchRemoteState();
  res.json({
    ...currentState,
    serverTime: Date.now()
  });
});

app.post('/api/admin/reset', async (req, res) => {
  const currentState = await fetchRemoteState();
  const newTeams = initialTeams();
  const newState = {
    phase: 'playing',
    resetCounter: (currentState.resetCounter || 0) + 1,
    teams: newTeams,
    updatedAt: Date.now()
  };
  await saveRemoteState(newState);
  res.json({ success: true, gameState: newState });
});

app.post('/api/team/action', async (req, res) => {
  const { teamId, teamState, type } = req.body;
  const currentState = await fetchRemoteState();

  if (type === 'RESET_ALL') {
    const newState = {
      phase: 'playing',
      resetCounter: (currentState.resetCounter || 0) + 1,
      teams: initialTeams(),
      updatedAt: Date.now()
    };
    await saveRemoteState(newState);
    return res.json({ success: true, gameState: newState });
  }

  let teams = { ...currentState.teams };
  if (teamId && teamState) {
    teams[teamId] = {
      ...(teams[teamId] || {}),
      ...teamState,
      updatedAt: teamState.updatedAt || Date.now()
    };
  }

  const newState = {
    ...currentState,
    teams,
    updatedAt: Date.now()
  };

  await saveRemoteState(newState);
  return res.json({ success: true, team: teams[teamId], teams });
});

module.exports = app;
