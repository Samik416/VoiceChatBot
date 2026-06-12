let voiceMode = false;

async function toggleVoiceMode() {

    try {

        if (!voiceMode) {

            const response = await fetch(
                "http://localhost:8000/start_voice",
                {
                    method: "POST"
                }
            );

            const data = await response.json();

            console.log(data);

            voiceMode = true;

            document.getElementById(
                "voiceModeLabel"
            ).textContent = "STOP VOICE";

        } else {

            const response = await fetch(
                "http://localhost:8000/stop_voice",
                {
                    method: "POST"
                }
            );

            const data = await response.json();

            console.log(data);

            voiceMode = false;

            document.getElementById(
                "voiceModeLabel"
            ).textContent = "VOICE MODE";
        }

    } catch (error) {

        console.error(
            "Voice mode error:",
            error
        );
    }
}