import os
import sys
import asyncio
import pyaudio

from dotenv import load_dotenv
from loguru import logger

from pipecat.frames.frames import LLMRunFrame

from pipecat.pipeline.pipeline import Pipeline
from pipecat.pipeline.runner import PipelineRunner
from pipecat.pipeline.task import PipelineTask

from pipecat.services.openai.realtime.llm import OpenAIRealtimeLLMService

from pipecat.services.openai.realtime.events import (
    SessionProperties
)

from pipecat.transports.local.audio import (
    LocalAudioTransport,
    LocalAudioTransportParams
)

from mic_controller import MicController
from pipecat.frames.frames import *


load_dotenv()

logger.remove()
logger.add(sys.stderr, level="INFO")


async def main():

    audio_params = LocalAudioTransportParams(

        audio_in_enabled=True,

        audio_out_enabled=True,

        echo_cancellation=True
    )

    transport = LocalAudioTransport(params=audio_params)

    audio_input = transport.input()
    print([x for x in globals() if "Interrupt" in x or "Interruption" in x])

    # ---------------------------------
    # MIC GATING
    # ---------------------------------

    audio_input.mic_enabled = True

    original_callback = audio_input._audio_in_callback


    def patched_callback(
        in_data,
        frame_count,
        time_info,
        status
    ):

        if not audio_input.mic_enabled:

            return (
                None,
                pyaudio.paContinue
            )

        return original_callback(
            in_data,
            frame_count,
            time_info,
            status
        )


    audio_input._audio_in_callback = patched_callback

    # ---------------------------------
    # CONTROLLER
    # ---------------------------------

    mic_controller = MicController(audio_input)

    # ---------------------------------
    # OPENAI REALTIME
    # ---------------------------------

    llm = OpenAIRealtimeLLMService(

        api_key=os.getenv("OPENAI_API_KEY"),

        settings=OpenAIRealtimeLLMService.Settings(

            model="gpt-realtime-2",

            system_instruction="""
You are a voice assistant.

Keep answers short.

Never respond to your own voice.

Wait until the user finishes speaking.

If interrupted, stop speaking immediately.

Ignore any audio similar to your own output.
""",

            session_properties=SessionProperties(

                voice="shimmer"

            )
        )
    )

    # ---------------------------------
    # PIPELINE
    # ---------------------------------

    pipeline = Pipeline([

        audio_input,

        llm,

        mic_controller,

        transport.output(),

    ])

    task = PipelineTask(pipeline)

    logger.info("Voice Bot Active!")

    await task.queue_frames([

        LLMRunFrame()

    ])

    runner = PipelineRunner()

    await runner.run(task)


if __name__ == "__main__":

    try:

        asyncio.run(main())

    except KeyboardInterrupt:

        logger.info("Stopped")