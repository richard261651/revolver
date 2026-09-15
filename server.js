// server.js - Servidor en tiempo real ultraliviano y optimizado para Operación Amatista / El Revólver
const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');

const PORT = process.env.PORT || 8000;

// Obtener IP de red local para código QR y enlace de unión
function getLocalIpAddress() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

const LOCAL_IP = getLocalIpAddress();
const BASE_URL = `http://${LOCAL_IP}:${PORT}`;

// Infiltrados definidos
const INFILTRADOS = ["3", "6"];

// Estado Global del Juego en el Servidor
let gameState = {
  phase: 'lobby', // 'lobby' | 'game'
  currentCaseIndex: 0,
  joinedTeams: {}, // { "1": { vocero: "Carlos", deviceId: "xyz" } }
  votes: {},       // { "1": "3" }
  revealDone: false,
  adminConnected: false
};

// Clientes SSE (Server-Sent Events) para empuje de datos en tiempo real
let sseClients = [];

function broadcastState() {
  const data = `data: ${JSON.stringify(gameState)}\n\n`;
  sseClients.forEach(res => {
    try {
      res.write(data);
    } catch (e) {
      // Cliente desconectado
    }
  });
}

// Servidor HTTP
const server = http.createServer((req, res) => {
  const urlObj = new URL(req.url, `http://${req.headers.host}`);
  const pathname = urlObj.pathname;

  // Habilitar CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // --- ENDPOINT SSE TIEMPO REAL ---
  if (pathname === '/api/events') {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    });

    res.write(`data: ${JSON.stringify(gameState)}\n\n`);
    sseClients.push(res);

    req.on('close', () => {
      sseClients = sseClients.filter(c => c !== res);
    });
    return;
  }

  // --- API GET STATE ---
  if (pathname === '/api/state' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ...gameState, localIp: LOCAL_IP, baseUrl: BASE_URL }));
    return;
  }

  // --- API POST JOIN (UN SOLO DISPOSITIVO POR EQUIPO) ---
  if (pathname === '/api/join' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const { teamId, vocero, deviceId } = JSON.parse(body);

        if (!teamId || !vocero || !deviceId) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Faltan datos del equipo o dispositivo.' }));
          return;
        }

        // Verificar si el equipo ya está tomado por OTRO dispositivo
        const existing = gameState.joinedTeams[teamId];
        if (existing && existing.deviceId !== deviceId) {
          res.writeHead(409, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: `El Equipo ${teamId} ya fue tomado por otro dispositivo en la sala.` }));
          return;
        }

        // Registrar equipo exitosamente
        gameState.joinedTeams[teamId] = { vocero, deviceId };
        broadcastState();

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, teamId, vocero }));
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'JSON inválido' }));
      }
    });
    return;
  }

  // --- API POST VOTE ---
  if (pathname === '/api/vote' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const { teamId, targetId, deviceId } = JSON.parse(body);

        // Validar que el dispositivo sea el dueño del equipo
        const team = gameState.joinedTeams[teamId];
        if (!team || team.deviceId !== deviceId) {
          res.writeHead(403, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'No autorizado para este equipo.' }));
          return;
        }

        // Registrar voto
        gameState.votes[teamId] = targetId;
        broadcastState();

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true }));
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Error procesando voto' }));
      }
    });
    return;
  }

  // --- API ADMIN CONTROLS ---
  if (pathname.startsWith('/api/admin/')) {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      const action = pathname.replace('/api/admin/', '');

      if (action === 'start') {
        gameState.phase = 'game';
        gameState.currentCaseIndex = 0;
        gameState.votes = {};
        gameState.revealDone = false;
      } else if (action === 'reveal') {
        gameState.revealDone = true;
      } else if (action === 'next') {
        if (gameState.currentCaseIndex < 2) {
          gameState.currentCaseIndex++;
          gameState.votes = {};
          gameState.revealDone = false;
        }
      } else if (action === 'reset') {
        gameState = {
          phase: 'lobby',
          currentCaseIndex: 0,
          joinedTeams: {},
          votes: {},
          revealDone: false,
          adminConnected: false
        };
      }

      broadcastState();
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, gameState }));
    });
    return;
  }

  // --- ARCHIVOS ESTÁTICOS ---
  let filePath = '.' + (pathname === '/' ? '/index.html' : pathname);
  let extname = path.extname(filePath);
  let contentType = 'text/html';

  switch (extname) {
    case '.js': contentType = 'text/javascript'; break;
    case '.css': contentType = 'text/css'; break;
    case '.json': contentType = 'application/json'; break;
    case '.png': contentType = 'image/png'; break;
    case '.jpg': contentType = 'image/jpg'; break;
    case '.svg': contentType = 'image/svg+xml'; break;
  }

  fs.readFile(filePath, (error, content) => {
    if (error) {
      if (error.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/html' });
        res.end('<h1>404 Página no encontrada</h1>', 'utf-8');
      } else {
        res.writeHead(500);
        res.end('Error de servidor: ' + error.code, 'utf-8');
      }
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
});

server.listen(PORT, () => {
  console.log(`================================================`);
  console.log(`🚀 SERVIDOR "EL REVÓLVER" EN TIEMPO REAL INICIADO`);
  console.log(`📍 Acceso Local: http://localhost:${PORT}`);
  console.log(`📡 Acceso de Equipos (Wi-Fi): ${BASE_URL}`);
  console.log(`================================================`);
});
