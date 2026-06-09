let lastReply = "";

// ── UI helpers ────────────────────────────────────────────────
function setStatus(state, label) {
  const pill = document.getElementById("statusPill");
  const text = document.getElementById("statusText");
  pill.className = "status-pill" + (state ? " " + state : "");
  text.textContent = label;
}

function appendMsg(role, html) {
  const chatbox = document.getElementById("chatbox");
  const div = document.createElement("div");
  div.className = "msg " + role;

  const labelMap = { user: "YOU", ai: "AI", system: "" };
  if (labelMap[role] !== undefined && labelMap[role] !== "") {
    div.innerHTML = `<span class="label">${labelMap[role]}</span>${html}`;
  } else {
    div.innerHTML = html;
  }

  chatbox.appendChild(div);
  chatbox.scrollTop = chatbox.scrollHeight;
  return div;
}

function showThinking() {
  const chatbox = document.getElementById("chatbox");
  const div = document.createElement("div");
  div.className = "msg ai";
  div.id = "thinkingMsg";
  div.innerHTML = `
    <span class="label">AI</span>
    <div class="thinking-dots"><span></span><span></span><span></span></div>
  `;
  chatbox.appendChild(div);
  chatbox.scrollTop = chatbox.scrollHeight;
}

function removeThinking() {
  const el = document.getElementById("thinkingMsg");
  if (el) el.remove();
}

// ── Send message ──────────────────────────────────────────────
async function sendMessage() {
  const input   = document.getElementById("userInput");
  const sendBtn = document.getElementById("sendBtn");
  const label   = document.getElementById("sendLabel");
  const message = input.value.trim();

  if (!message) return;

  appendMsg("user", message);
  input.value = "";

  // Button → spinner
  label.innerHTML = '<span class="spinner"></span>';
  sendBtn.disabled = true;
  setStatus("thinking", "thinking…");
  showThinking();

  try {
    const response = await fetch("http://127.0.0.1:8000/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: message })
    });

    const data = await response.json();
    lastReply = data.reply;

    removeThinking();
    appendMsg("ai", lastReply);
    setStatus("", "ready");

  } catch (err) {
    removeThinking();
    appendMsg("system", "// Error: could not reach backend. Is it running?");
    setStatus("", "error");
    console.error("Backend error:", err);
  }

  label.textContent = "SEND";
  sendBtn.disabled = false;
}