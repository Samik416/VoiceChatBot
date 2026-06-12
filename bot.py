import os
import sys
import asyncio
import pyaudio
from dotenv import load_dotenv
from loguru import logger

# Import core frames directly from Pipecat's root frames module
from pipecat.frames.frames import EndFrame, LLMRunFrame
from pipecat.pipeline.pipeline import Pipeline
from pipecat.pipeline.runner import PipelineRunner
from pipecat.pipeline.task import PipelineTask
from pipecat.services.openai.realtime.llm import OpenAIRealtimeLLMService
from pipecat.services.openai.realtime.events import SessionProperties
from pipecat.transports.local.audio import LocalAudioTransport, LocalAudioTransportParams

load_dotenv()

logger.remove()
logger.add(sys.stderr, level="INFO")

async def main():
    # 1. Setup Local Mic & Speaker configuration
    audio_params = LocalAudioTransportParams(
        audio_in_enabled=True,
        audio_out_enabled=True
    )
    transport = LocalAudioTransport(params=audio_params)

    # 2. Native OpenAI Realtime Engine (Preview Model Required)
    llm = OpenAIRealtimeLLMService(
        api_key=os.getenv("OPENAI_API_KEY"),
        settings=OpenAIRealtimeLLMService.Settings(
            model="gpt-realtime-2", # Corrected production naming identifier
            system_instruction="You are a fast, local voice bot. Keep answers short, punchy, and conversational.",
            session_properties=SessionProperties(
                voice="shimmer" # Options: alloy, echo, shimmer, ash, ballad
            )
        )
    )

    # 3. Assemble the Pipeline using your computer's physical hardware
    pipeline = Pipeline([
        transport.input(),     # Physical Microphone Input
        llm,                   # OpenAI Realtime Processing (Audio In -> Audio Out)
        transport.output(),    # Physical Speaker Output
    ])

    task = PipelineTask(pipeline)

    # 4. Trigger the opening greeting using Pipecat's standard layout frame
    logger.info("Local Voice Bot is active! Start speaking into your microphone...")
    await task.queue_frames([LLMRunFrame()])

    runner = PipelineRunner()
    await runner.run(task)

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        logger.info("Local Bot stopped.")