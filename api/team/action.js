// api/team/action.js - Endpoint POST /api/team/action
const { fetchRemoteState, saveRemoteState, initialTeams } = require('../_store.js');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch(e){}
  }
  body = body || {};

  const currentState = await fetchRemoteState();

  if (body.type === 'RESET_ALL') {
    const newState = {
      phase: 'playing',
      resetCounter: Date.now(),
      teams: initialTeams(),
      updatedAt: Date.now()
    };
    await saveRemoteState(newState);
    return res.status(200).json({ success: true, gameState: newState });
  }

  let teams = { ...currentState.teams };
  if (body.teamId && body.teamState) {
    teams[body.teamId] = {
      ...(teams[body.teamId] || {}),
      ...body.teamState,
      updatedAt: body.teamState.updatedAt || Date.now()
    };
  }

  const newState = {
    ...currentState,
    teams,
    updatedAt: Date.now()
  };

  await saveRemoteState(newState);
  return res.status(200).json({ success: true, team: teams[body.teamId], teams });
};
