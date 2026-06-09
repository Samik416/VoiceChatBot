// ── Speech-to-Text (Web Speech API) ──────────────────────────
const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;

let recognition = null;
let micActive   = false;

if (!SpeechRecognition) {
  document.getElementById("micBtn").disabled = true;
  document.getElementById("micBtn").title = "Speech Recognition not supported in this browser";
  console.warn("SpeechRecognition not supported.");
} else {
  recognition = new SpeechRecognition();
  recognition.lang            = "en-US";
  recognition.interimResults  = false;
  recognition.continuous      = false;

  recognition.onresult = function (event) {
    const transcript = event.results[0][0].transcript;
    console.log("Heard:", transcript);
    document.getElementById("userInput").value = transcript;

    // Auto-send after voice input
    sendMessage();
  };

  recognition.onerror = function (event) {
    console.error("Speech error:", event.error);
    resetMicBtn();
    setStatus("", "ready");
  };

  recognition.onend = function () {
    resetMicBtn();
  };
}

function toggleMic() {
  if (!recognition) return;

  if (micActive) {
    recognition.stop();
    resetMicBtn();
    setStatus("", "ready");
  } else {
    recognition.start();
    micActive = true;

    const micBtn   = document.getElementById("micBtn");
    const micLabel = document.getElementById("micLabel");
    micBtn.classList.add("mic-active");
    micLabel.textContent = "STOP";
    setStatus("listening", "listening…");
  }
}

function resetMicBtn() {
  micActive = false;
  const micBtn   = document.getElementById("micBtn");
  const micLabel = document.getElementById("micLabel");
  micBtn.classList.remove("mic-active");
  micLabel.textContent = "MIC";
}

// Keep old name working if called elsewhere
function startListening() { toggleMic(); }