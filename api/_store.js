// api/_store.js - Shared Cloud Store
const SYNC_OBJECT_ID = 'ff808181a09d98f701a0a6b51bb0141c';
const SYNC_API_URL = `https://api.restful-api.dev/objects/${SYNC_OBJECT_ID}`;

const initialTeams = () => ({
  "1": { id: "1", name: "Equipo 1", hearts: 1, bullets: 1, score: 0, currentCase: 1, status: "En Espera", occupied: false, occupiedBy: null, updatedAt: Date.now() },
  "2": { id: "2", name: "Equipo 2", hearts: 1, bullets: 1, score: 0, currentCase: 1, status: "En Espera", occupied: false, occupiedBy: null, updatedAt: Date.now() },
  "3": { id: "3", name: "Equipo 3", hearts: 1, bullets: 1, score: 0, currentCase: 1, status: "En Espera", occupied: false, occupiedBy: null, updatedAt: Date.now() },
  "4": { id: "4", name: "Equipo 4", hearts: 1, bullets: 1, score: 0, currentCase: 1, status: "En Espera", occupied: false, occupiedBy: null, updatedAt: Date.now() },
  "5": { id: "5", name: "Equipo 5", hearts: 1, bullets: 1, score: 0, currentCase: 1, status: "En Espera", occupied: false, occupiedBy: null, updatedAt: Date.now() },
  "6": { id: "6", name: "Equipo 6", hearts: 1, bullets: 1, score: 0, currentCase: 1, status: "En Espera", occupied: false, occupiedBy: null, updatedAt: Date.now() }
});

function compactEncode(fullState) {
  const compactTeams = {};
  const teams = fullState.teams || {};
  Object.keys(teams).forEach(id => {
    const t = teams[id];
    compactTeams[id] = [
      t.score || 0,
      t.currentCase || 1,
      t.status || 'En Espera',
      t.occupied ? 1 : 0,
      t.bullets !== undefined ? t.bullets : 1,
      t.hearts !== undefined ? t.hearts : 1,
      t.occupiedBy || ''
    ];
  });
  return {
    r: fullState.resetCounter || Date.now(),
    u: fullState.updatedAt || Date.now(),
    t: compactTeams
  };
}

function compactDecode(compactState) {
  if (!compactState || !compactState.t) return null;
  const teams = {};
  Object.keys(compactState.t).forEach(id => {
    const arr = compactState.t[id];
    teams[id] = {
      id: String(id),
      name: `Equipo ${id}`,
      score: arr[0] || 0,
      currentCase: arr[1] || 1,
      status: arr[2] || 'En Espera',
      occupied: Boolean(arr[3]),
      bullets: arr[4] !== undefined ? arr[4] : 1,
      hearts: arr[5] !== undefined ? arr[5] : 1,
      occupiedBy: arr[6] || null,
      updatedAt: compactState.u || Date.now()
    };
  });
  return {
    phase: 'playing',
    resetCounter: compactState.r || 0,
    teams: teams,
    updatedAt: compactState.u || Date.now()
  };
}

let inMemoryState = {
  phase: 'playing',
  resetCounter: Date.now(),
  teams: initialTeams(),
  updatedAt: 0
};

async function fetchRemoteState() {
  try {
    const res = await fetch(SYNC_API_URL, { signal: AbortSignal.timeout(2500) });
    if (res.ok) {
      const remote = await res.json();
      if (remote && remote.data && remote.data.raw) {
        const compactObj = JSON.parse(remote.data.raw);
        const decoded = compactDecode(compactObj);
        if (decoded && decoded.teams) {
          inMemoryState = decoded;
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
  const compact = compactEncode(inMemoryState);
  try {
    await fetch(SYNC_API_URL, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'revolver_v3',
        data: { raw: JSON.stringify(compact) }
      }),
      signal: AbortSignal.timeout(3000)
    });
  } catch (e) {}
}

module.exports = {
  initialTeams,
  compactEncode,
  compactDecode,
  fetchRemoteState,
  saveRemoteState
};
