// api/admin/start.js - Endpoint POST /api/admin/start
const { fetchRemoteState, saveRemoteState } = require('../_store.js');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const currentState = await fetchRemoteState();
  const newState = {
    ...currentState,
    phase: 'playing',
    updatedAt: Date.now()
  };
  await saveRemoteState(newState);
  return res.status(200).json({ success: true, gameState: newState });
};
