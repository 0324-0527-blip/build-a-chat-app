
import http from "http";
import fs from "fs";
import { WebSocketServer, WebSocket } from "ws";

const PORT = 3001;

// Create HTTP server
const server = http.createServer((req, res) => {
  fs.readFile("./public/index.html", (err, data) => {
    if (err) {
      res.writeHead(500);
      res.end("Error loading page");
      return;
    }

    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(data);
  });
});

// Create WebSocket server
const wss = new WebSocketServer({ server });

// Broadcast function
function broadcast(payload) {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(payload));
    }
  });
}

// Handle connections
wss.on("connection", (socket, req) => {
  const username = new URL(
    req.url,
    "http://localhost"
  ).searchParams.get("username");

  broadcast({
    type: "system",
    text: `${username} joined`
  });

  // Handle messages
  socket.on("message", (message) => {
    const { username, text } = JSON.parse(message);

    broadcast({
      type: "chat",
      username,
      text
    });
  });

  // Handle disconnections
  socket.on("close", () => {
    broadcast({
      type: "system",
      text: `${username} left`
    });
  });
});

// Start server
server.listen(PORT, () => {
  console.log(`Chat server running at http://localhost:3001`);
});
