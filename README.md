AI Voice Chatbot

A real-time AI voice chatbot built using Python, FastAPI, asyncio, Pipecat, and OpenAI Realtime APIs for low-latency voice and text interactions.

Features
Real-time voice and text conversations
Low-latency asynchronous processing
Speech-to-Text (STT) and Text-to-Speech (TTS) integration
OpenAI Realtime API integration
Event-driven audio streaming
Microphone state management
Interruption handling
Modular backend architecture
API-based service integration
Architecture
User
  │
  ├── Voice Input
  │
  └── Text Input
        │
        ▼
   Pipecat Pipeline
        │
        ├── STT
        │
        ▼
 OpenAI Realtime API
        │
        ▼
       TTS
        │
        ▼
  Voice Response
        │
        ▼
      User
Tech Stack
Python
FastAPI
asyncio
Pipecat
OpenAI Realtime API
STT / TTS
Git / GitHub
Key Engineering Work

The chatbot uses an asynchronous pipeline to handle real-time conversational processing without blocking. Pipecat is used to orchestrate the STT, LLM, and TTS components.

The system also implements event-driven audio streaming, microphone state management, interruption handling, and callback handling across multiple processing stages.

The backend is designed in a modular manner to simplify API integrations and support reliable real-time audio processing.

Getting Started
Clone the repository
git clone <YOUR_REPOSITORY_URL>
cd AI-Voice-Chatbot
Install dependencies
pip install -r requirements.txt
Configure environment variables

Create a .env file and add your OpenAI API key:

OPENAI_API_KEY=your_api_key
Run the application
uvicorn <your_app_module>:app --reload

Replace <your_app_module> with the name of the Python file containing your FastAPI application.

Future Improvements
User authentication
Improved error handling and retry mechanisms
Conversation analytics
Additional voice providers
Production deployment and monitoring


Author,
Samik Amit Kadam
