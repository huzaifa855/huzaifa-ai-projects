const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 5500;
const HOST = '127.0.0.1';
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml'
};

http.createServer((req, res) => {
  let file = req.url === '/' ? '/index.html' : req.url;
  let filePath = path.join(__dirname, req.url.split('?')[0]);
  if (req.url === '/') filePath = path.join(__dirname, 'index.html');
  
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end('404 Not Found');
      return;
    }
    let ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { 
      'Content-Type': MIME[ext] || 'application/octet-stream',
      'Access-Control-Allow-Origin': '*'
    });
    res.end(data);
  });
}).listen(PORT, HOST, () => {
  console.log(`Server running at http://${HOST}:${PORT}`);
});
