from pipecat.processors.frame_processor import FrameProcessor

from pipecat.frames.frames import (
    BotStartedSpeakingFrame,
    BotStoppedSpeakingFrame,
)


class MicController(FrameProcessor):

    def __init__(self, audio_input):
        super().__init__()

        self.audio_input = audio_input

    async def process_frame(self, frame, direction):

        await super().process_frame(frame, direction)

        if isinstance(frame, BotStartedSpeakingFrame):

            print("🔇 Mic disabled")

            self.audio_input.mic_enabled = False

        elif isinstance(frame, BotStoppedSpeakingFrame):

            print("🎤 Mic enabled")

            self.audio_input.mic_enabled = True

        await self.push_frame(frame, direction)