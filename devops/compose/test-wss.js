const WebSocket = require('ws');

const ws = new WebSocket('wss://broker.visiongrid.online:8084/mqtt', {
  rejectUnauthorized: false, // Ignore self-signed certificate errors
});

ws.on('open', () => {
  console.log('Connected to WebSocket server!');
  ws.close();
});

ws.on('error', (err) => {
  console.error('Connection error:', err);
});
