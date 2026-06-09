from fastapi import FastAPI, UploadFile, File
from fastapi.responses import RedirectResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from openai import AsyncOpenAI
from dotenv import load_dotenv
import os

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


@app.post("/voice")
async def voice_chat(audio: UploadFile = File(...)):

    temp_file = "temp.webm"

    try:
        audio_bytes = await audio.read()

        with open(temp_file, "wb") as f:
            f.write(audio_bytes)

        print("Uploaded file size:", len(audio_bytes))

        with open(temp_file, "rb") as f:
            transcript = await client.audio.transcriptions.create(
                model="gpt-4o-mini-transcribe",
                file=f
            )

        print("Transcript object:", transcript)

        user_text = (
            transcript.text.strip()
            if transcript.text
            else ""
        )

        print("Transcript text:", repr(user_text))

        if not user_text:
            return {
                "user": "",
                "reply": "No speech detected."
            }

        user_text = transcript.text.strip()

        chat_response = await client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "user",
                    "content": user_text
                }
            ]
        )

        assistant_text = (
            chat_response
            .choices[0]
            .message
            .content
        )
        print("Assistant:", assistant_text)
        return {
            "user": user_text,
            "reply": assistant_text
        }

    finally:
        if os.path.exists(temp_file):
            os.remove(temp_file)