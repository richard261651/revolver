// api/state.js - Endpoint GET /api/state
const { fetchRemoteState } = require('./_store.js');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const state = await fetchRemoteState();
  return res.status(200).json({
    ...state,
    serverTime: Date.now()
  });
};
