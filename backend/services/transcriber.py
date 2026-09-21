import os
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

def transcribe_audio(audio_bytes: bytes, filename: str = "audio.webm") -> str:
    client = Groq(api_key=os.getenv("GROQ_API_KEY"))
    transcription = client.audio.transcriptions.create(
        file=(filename, audio_bytes, "audio/webm"),
        model="whisper-large-v3",
        response_format="text",
        language=None,  # auto-detect Hindi/Marathi/English
    )
    return transcription
