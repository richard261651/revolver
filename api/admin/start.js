// api/admin/start.js - Endpoint POST /api/admin/start
const { fetchRemoteState, saveRemoteState } = require('../_store.js');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const currentState = await fetchRemoteState();

  // Limpiar puntuaciones y casos de cada equipo para iniciar una partida 100% limpia de 0
  const freshTeams = {};
  const currentTeams = currentState.teams || {};
  Object.keys(currentTeams).forEach(id => {
    const t = currentTeams[id];
    freshTeams[id] = {
      ...t,
      score: 0,
      currentCase: 1,
      bullets: 1,
      hearts: 1,
      status: t.occupied ? 'En Juego' : 'En Espera',
      updatedAt: Date.now()
    };
  });

  const newState = {
    ...currentState,
    phase: 'playing',
    teams: freshTeams,
    resetCounter: (currentState.phase === 'results') ? Date.now() : (currentState.resetCounter || 0),
    updatedAt: Date.now()
  };

  await saveRemoteState(newState);
  return res.status(200).json({ success: true, gameState: newState });
};
