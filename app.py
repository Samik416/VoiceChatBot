from fastapi import FastAPI, UploadFile, File
from fastapi.responses import RedirectResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from openai import AsyncOpenAI
from dotenv import load_dotenv
import os
import subprocess
import sys
import signal


voice_process = None

# Load environment variables
load_dotenv()

# FastAPI app
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# OpenAI client
client = AsyncOpenAI(
    api_key=os.getenv("OPENAI_API_KEY")
)

@app.post("/start_voice")
async def start_voice():

    global voice_process

    if (
        voice_process is None
        or voice_process.poll() is not None
    ):

        voice_process = subprocess.Popen([
            sys.executable,
            "bot.py"
        ])

    return {
        "status": "running"
    }

@app.post("/stop_voice")
async def stop_voice():

    global voice_process

    if (
        voice_process is not None
        and voice_process.poll() is None
    ):

        voice_process.terminate()

        voice_process.wait()

        voice_process = None

        return {
            "status": "stopped"
        }

    return {
        "status": "not running"
    }

# Root route
@app.get("/")
async def home():
    return RedirectResponse(url="/docs")


# Request model for text chat
class Message(BaseModel):
    text: str


# Text chat endpoint
@app.post("/chat")
async def chat(message: Message):

    response = await client.responses.create(
        model="gpt-4o-mini",
        input=message.text
    )

    return {
        "reply": response.output_text
    }