// ── Text-to-Speech (Web Speech Synthesis) ────────────────────

function speakText(text) {
  window.speechSynthesis.cancel();

  const utterance   = new SpeechSynthesisUtterance(text);
  utterance.lang    = "en-US";
  utterance.rate    = 1;
  utterance.pitch   = 1;

  const speakBtn   = document.getElementById("speakBtn");
  const speakLabel = document.getElementById("speakLabel");

  utterance.onstart = () => {
    setStatus("speaking", "speaking…");
    speakLabel.innerHTML = `
      <span class="wave">
        <span></span><span></span><span></span><span></span><span></span>
      </span>`;
    speakBtn.disabled = true;
  };

  utterance.onend = () => {
    setStatus("", "ready");
    speakLabel.textContent = "SPEAK";
    speakBtn.disabled = false;
  };

  utterance.onerror = () => {
    setStatus("", "ready");
    speakLabel.textContent = "SPEAK";
    speakBtn.disabled = false;
  };

  window.speechSynthesis.speak(utterance);
}

function speak() {
  if (lastReply) {
    speakText(lastReply);
  } else {
    const chatbox = document.getElementById("chatbox");
    const div = document.createElement("div");
    div.className = "msg system";
    div.textContent = "// No reply yet — ask a question first.";
    chatbox.appendChild(div);
    chatbox.scrollTop = chatbox.scrollHeight;
  }
}