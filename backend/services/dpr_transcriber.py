import os
from groq import Groq


class DPRTranscriber:
    """Wraps Groq Whisper for audio → text transcription."""

    def __init__(self):
        self._client = None

    @property
    def client(self) -> Groq:
        if self._client is None:
            api_key = os.getenv("GROQ_API_KEY", "")
            if not api_key:
                raise ValueError("GROQ_API_KEY environment variable not set")
            self._client = Groq(api_key=api_key)
        return self._client

    def transcribe_bytes(self, audio_bytes: bytes) -> dict:
        """
        Transcribes raw audio bytes using Groq Whisper large-v3.
        Browser recordings are sent as webm (supported by Groq).
        Returns: {"transcript": str, "language": str}
        """
        response = self.client.audio.transcriptions.create(
            file=("audio.webm", audio_bytes),
            model="whisper-large-v3",
            response_format="verbose_json",
        )
        return {
            "transcript": response.text.strip(),
            "language": getattr(response, "language", "unknown"),
        }

    def transcribe_file(self, file_path: str) -> dict:
        with open(file_path, "rb") as f:
            return self.transcribe_bytes(f.read())
