const path = require("path");
const express = require("express");
const WebSocket = require("ws");

const app = express();
app.use(express.static(path.join(__dirname, "public"))); // serves index.html & app.js

// Start HTTP server
const server = app.listen(3000, () => 
  console.log("✅ HTTP server running at http://localhost:3000")
);

// Attach WebSocket server to the same HTTP server
const wss = new WebSocket.Server({ server });

let clients = {};

wss.on("connection", (ws) => {
  console.log("New client connected");

  ws.on("message", (msg) => {
    try {
      const data = JSON.parse(msg);

      if (data.type === "join") {
        clients[data.username] = ws;
        ws.username = data.username;
        console.log(`${data.username} joined`);
        return;
      }

      if (data.type === "private") {
        const target = clients[data.to];
        if (target && target.readyState === WebSocket.OPEN) {
          target.send(
            JSON.stringify({ from: ws.username, message: data.message })
          );
        }
        return;
      }

      if (data.type === "broadcast") {
        wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN && client !== ws) {
            client.send(
              JSON.stringify({ from: ws.username, message: data.message })
            );
          }
        });
      }
    } catch (err) {
      console.error("Invalid message", err);
    }
  });

  ws.on("close", () => {
    if (ws.username) {
      delete clients[ws.username];
      console.log(`${ws.username} disconnected`);
    }
  });
});
