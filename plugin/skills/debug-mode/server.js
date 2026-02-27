const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = parseInt(process.argv[2]) || 9742;
const LOG_DIR = '.debug-mode';
const LOG_FILE = path.join(LOG_DIR, 'debug.log');

if (!fs.existsSync(LOG_DIR)) fs.mkdirSync(LOG_DIR, { recursive: true });

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }
  if (req.url === '/health') { res.writeHead(200); res.end('ok'); return; }

  if (req.url === '/debug' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const { hypothesisId, location, message, data } = JSON.parse(body);
        const ts = new Date().toISOString();
        const hTag = hypothesisId ? `[${hypothesisId}] ` : '';
        const loc = location || 'unknown';
        const msg = message || '';
        const dataStr = data ? ' | ' + JSON.stringify(data) : '';
        const line = `[${ts}] ${hTag}${loc} | ${msg}${dataStr}\n`;
        fs.appendFileSync(LOG_FILE, line);
        res.writeHead(200); res.end('ok');
      } catch (e) { res.writeHead(400); res.end('bad json'); }
    });
    return;
  }
  res.writeHead(404); res.end();
});

server.listen(PORT, () => console.log(`Debug server on :${PORT}, logging to ${LOG_FILE}`));
process.on('SIGINT', () => { server.close(); process.exit(0); });
