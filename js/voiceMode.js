let voiceMode = false;
let mediaRecorder = null;
let stream = null;
let audioChunks = [];

console.log("voiceMode.js loaded");

const voiceBtn = document.getElementById("voiceModeBtn");
const voiceLabel = document.getElementById("voiceModeLabel");
const statusPill = document.getElementById("statusPill");
const statusText = document.getElementById("statusText");

function updateStatus(state) {

    if (!statusPill || !statusText) return;

    statusPill.classList.remove(
        "listening",
        "thinking",
        "speaking"
    );

    switch (state) {

        case "listening":
            statusPill.classList.add("listening");
            statusText.textContent = "listening";
            break;

        case "thinking":
            statusPill.classList.add("thinking");
            statusText.textContent = "thinking";
            break;

        case "speaking":
            statusPill.classList.add("speaking");
            statusText.textContent = "speaking";
            break;

        default:
            statusText.textContent = "ready";
    }
}

async function toggleVoiceMode() {

    console.log("Voice button clicked");
    console.log("Current state:", voiceMode);

    voiceMode = !voiceMode;

    if (voiceMode) {

        voiceBtn.classList.add("mic-active");
        voiceLabel.textContent = "STOP";

        await startVoiceSession();

    } else {

        voiceBtn.classList.remove("mic-active");
        voiceLabel.textContent = "VOICE MODE";

        stopVoiceSession();
    }
}

async function startVoiceSession() {

    try {

        console.log("Requesting microphone");

        audioChunks = [];

        updateStatus("listening");

        stream = await navigator.mediaDevices.getUserMedia({
            audio: true
        });

        console.log("Microphone granted");

        mediaRecorder = new MediaRecorder(stream);

        mediaRecorder.onstart = () => {
            console.log("Recording started");
        };

        mediaRecorder.ondataavailable = (event) => {

            console.log(
                "Chunk received:",
                event.data.size
            );

            if (event.data.size > 0) {
                audioChunks.push(event.data);
            }
        };

        mediaRecorder.onstop = async () => {

            console.log("Recorder stopped");

            const audioBlob = new Blob(
                audioChunks,
                {
                    type: "audio/webm"
                }
            );

            console.log(
                "Audio blob size:",
                audioBlob.size
            );

            audioChunks = [];

            await sendAudio(audioBlob);
        };

        mediaRecorder.onerror = (event) => {
            console.error(
                "MediaRecorder error:",
                event
            );
        };

        mediaRecorder.start();

    } catch (error) {

        console.error(
            "Microphone error:",
            error
        );

        updateStatus("ready");

        voiceMode = false;
    }
}

function stopVoiceSession() {

    console.log("Stopping recording");

    if (
        mediaRecorder &&
        mediaRecorder.state !== "inactive"
    ) {
        mediaRecorder.stop();
    }

    if (stream) {

        stream.getTracks().forEach(track => {
            track.stop();
        });

        stream = null;
    }
}

async function sendAudio(audioBlob) {

    try {

        updateStatus("thinking");

        console.log("Sending audio");

        const formData = new FormData();

        formData.append(
            "audio",
            audioBlob,
            "recording.webm"
        );

        const response = await fetch(
            "http://localhost:8000/voice",
            {
                method: "POST",
                body: formData
            }
        );

        console.log(
            "Response status:",
            response.status
        );

        if (!response.ok) {
            throw new Error(
                `HTTP ${response.status}`
            );
        }

        const data = await response.json();

        console.log("VOICE RESPONSE:", data);

        addMessage(
            data.user,
            "user"
        );

        addMessage(
            data.reply,
            "ai"
        );

        console.log(
            "Speaking:",
            data.reply
        );

        speakText(data.reply);

    } catch (error) {

        console.error(
            "sendAudio error:",
            error
        );

        updateStatus("ready");
    }
}

function addMessage(text, role) {

    const chatbox =
        document.getElementById("chatbox");

    if (!chatbox) {
        console.error(
            "chatbox not found"
        );
        return;
    }

    const msg =
        document.createElement("div");

    msg.className =
        `msg ${role}`;

    const label =
        role === "user"
            ? "USER"
            : "AI";

    msg.innerHTML = `
        <div class="label">${label}</div>
        <div>${text}</div>
    `;

    chatbox.appendChild(msg);

    chatbox.scrollTop =
        chatbox.scrollHeight;
}

function speakText(text) {

    console.log("Speaking:", text);

    const utterance =
        new SpeechSynthesisUtterance(text);

    utterance.onstart = () => {
        console.log("Speech started");
    };

    utterance.onend = () => {
        console.log("Speech ended");
    };

    utterance.onerror = (e) => {
        console.error("Speech error:", e);
    };

    speechSynthesis.cancel();
    speechSynthesis.speak(utterance);
}