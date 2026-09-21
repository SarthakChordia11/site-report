import os
import json
from groq import Groq
from models.dpr_models import DPRFullReport


class DPRExtractor:
    """
    Sends a construction-site transcript to Groq LLaMA 3.3 and returns
    a fully structured DPRFullReport (labour, materials, safety, NCRs, etc.)
    """

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

    def extract(self, transcript: str, language: str = "hi") -> DPRFullReport:
        try:
            prompt = self._build_prompt(transcript, language)
            response = self.client.chat.completions.create(
                model="openai/gpt-oss-120b",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.2,
            )
            raw = response.choices[0].message.content.strip()

            if raw.startswith("```"):
                raw = raw.split("\n", 1)[1]
                if raw.endswith("```"):
                    raw = raw[: raw.rfind("```")]
            if raw.startswith("json\n"):
                raw = raw[5:]

            data = json.loads(raw)
            return DPRFullReport(**data)
        except Exception as e:
            print(f"Groq API Error: {e}")
            raise e

    def _build_prompt(self, transcript: str, language: str) -> str:
        return f"""You are a construction site report parser. The site manager gave a daily update in {language}.
Parse the following speech transcript into a structured JSON report.
CRITICAL REQUIREMENT: ALL text and values in the output JSON MUST be translated to and written in ENGLISH, regardless of the input language.

RULES:
- Extract all information mentioned by the speaker
- If information is not mentioned, use reasonable defaults (empty string, 0, empty list)
- Productivity ratings: "Good", "Average", or "Excellent" based on context
- Safety status: "PASS", "FAIL", or "PARTIAL"
- NCR severity: "MAJOR" or "MINOR"
- Work status: "On track", "Ahead of schedule", "Behind schedule", or "Complete"
- Calculate man_days as (present * hours) / 8
- Risk level: "Low", "Medium", or "High"
- Include relevant IS codes based on activities mentioned
- Output ONLY valid JSON, no markdown

TRANSCRIPT:
{transcript}

OUTPUT JSON SCHEMA:
{{
    "site_info": {{
        "project_name": "string",
        "date": "string",
        "location": "string",
        "inspector": "string",
        "progress_pct": 0,
        "weather": "string"
    }},
    "summary": {{
        "overall_progress": 0,
        "workers_today": 0,
        "ncrs_raised": 0,
        "delay_risk": "Low"
    }},
    "cautions": ["string"],
    "observations": [
        {{
            "description": "string",
            "area": "string",
            "severity": "normal"
        }}
    ],
    "labour": [
        {{
            "trade": "string",
            "contractor": "string",
            "present": 0,
            "hours": 8,
            "productivity": "Good",
            "man_days": 0.0
        }}
    ],
    "materials": [
        {{
            "item": "string",
            "quantity": "string",
            "status": "Received"
        }}
    ],
    "safety": [
        {{
            "item": "string",
            "status": "PASS"
        }}
    ],
    "work_progress": [
        {{
            "activity": "string",
            "actual_pct": 0,
            "planned_pct": 0,
            "status": "On track"
        }}
    ],
    "ncr_reports": [
        {{
            "id": "NCR-001",
            "title": "string",
            "severity": "MINOR",
            "description": "string",
            "action_required": "string",
            "deadline": "string"
        }}
    ],
    "delay_risk": {{
        "probability": "string",
        "risk_level": "Low",
        "risk_pct": 0,
        "causes": ["string"],
        "preventive_measures": ["string"]
    }},
    "is_codes": [
        {{
            "code": "IS XXXXX",
            "description": "string"
        }}
    ],
    "recommended_actions": [
        {{
            "priority": 1,
            "action": "string"
        }}
    ]
}}"""
