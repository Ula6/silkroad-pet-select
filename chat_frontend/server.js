const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');

const { createRuntimeConfig } = require('./lib/chat-service');
const healthHandler = require('./api/health');
const chatHandler = require('./api/chat');

const config = createRuntimeConfig();
const publicDir = path.join(__dirname, 'public');

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(payload));
}

function createNodeResponse(res) {
  return {
    status(code) {
      res.statusCode = code;
      return this;
    },
    json(payload) {
      sendJson(res, res.statusCode || 200, payload);
      return this;
    },
  };
}

function sendFile(res, filePath) {
  const ext = path.extname(filePath);
  const types = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
  };

  fs.readFile(filePath, (err, data) => {
    if (err) {
      sendJson(res, 404, { error: 'Not found' });
      return;
    }

    res.writeHead(200, {
      'Content-Type': types[ext] || 'application/octet-stream',
    });
    res.end(data);
  });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const nodeRes = createNodeResponse(res);

  if (req.method === 'GET' && url.pathname === '/api/health') {
    await healthHandler(req, nodeRes, config);
    return;
  }

  if (req.method === 'POST' && url.pathname === '/api/chat') {
    await chatHandler(req, nodeRes, config);
    return;
  }

  if (req.method === 'GET' && (url.pathname === '/' || url.pathname === '/index.html')) {
    sendFile(res, path.join(publicDir, 'index.html'));
    return;
  }

  const staticFile = path.join(publicDir, url.pathname.replace(/^\/+/, ''));
  if (staticFile.startsWith(publicDir) && fs.existsSync(staticFile)) {
    sendFile(res, staticFile);
    return;
  }

  sendJson(res, 404, { error: 'Not found' });
});

server.listen(config.port, config.host, () => {
  console.log(`SilkRoad chat frontend running at http://${config.host}:${config.port}`);
  if (config.host === '0.0.0.0') {
    console.log('This server is reachable from other devices on the same network via your LAN IP.');
  }
});
