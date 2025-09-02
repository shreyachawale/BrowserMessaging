let ws;
let username;

function join() {
  username = document.getElementById("username").value.trim();
  if (!username) return alert("Enter a username");

  ws = new WebSocket("ws://localhost:3000");

  ws.onopen = () => {
    ws.send(JSON.stringify({ type: "join", username }));
    logMessage("✅ Connected as " + username);
  };

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    logMessage(`📩 ${data.from}: ${data.message}`);
  };

  ws.onclose = () => logMessage("❌ Disconnected");
}

function sendMessage() {
  const msg = document.getElementById("msg").value.trim();
  const to = document.getElementById("to").value.trim();
  if (!msg) return;

  const type = to ? "private" : "broadcast";

  ws.send(JSON.stringify({ type, message: msg, to }));
  logMessage(`📝 You (${type}): ${msg}`);

  document.getElementById("msg").value = "";
}

function logMessage(text) {
  const chat = document.getElementById("chat");
  const p = document.createElement("p");
  p.textContent = text;
  chat.appendChild(p);
  chat.scrollTop = chat.scrollHeight;
}
