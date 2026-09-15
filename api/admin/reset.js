// api/admin/reset.js - Endpoint POST /api/admin/reset
const { saveRemoteState, initialTeams } = require('../_store.js');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const newTeams = initialTeams();
  const newState = {
    phase: 'playing',
    resetCounter: Date.now(),
    teams: newTeams,
    updatedAt: Date.now()
  };
  await saveRemoteState(newState);
  return res.status(200).json({ success: true, gameState: newState });
};
