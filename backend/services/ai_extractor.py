import os, json
import base64
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

MODULE_PROMPTS = {
    "labour": """Extract attendance and labour data from this site manager's voice note (Hindi/Marathi/English/Hinglish).
Return JSON:
{
  "attendance": [
    {"trade": "mason|helper|carpenter|fabricator|welder|rigger|module_fitter|equipment_operator|other",
     "agency": "", "location": "on_site|factory|casting_yard",
     "present": 0, "absent": 0, "ot_hours": 0, "remarks": ""}
  ],
  "productivity_note": "",
  "safety_note": "",
  "summary": ""
}""",

    "resource": """Extract material receipt, consumption and inventory data from this voice note (Hindi/Marathi/English).
Return JSON:
{
  "materials": [
    {"name": "", "unit": "", "received": 0, "consumed": 0, "invoice_no": "", "vendor": "", "remarks": ""}
  ],
  "dispatches": [
    {"type": "material|element", "element_id": "", "transporter": "", "vehicle_no": "", "quantity": "", "eta": ""}
  ],
  "summary": ""
}""",

    "equipment": """Extract equipment utilization data from this voice note (Hindi/Marathi/English).
Return JSON:
{
  "equipment": [
    {"name": "", "working_hrs": 0, "idle_hrs": 0, "breakdown_hrs": 0,
     "idle_reason": "", "breakdown_reason": "", "remarks": ""}
  ],
  "summary": ""
}""",

    "general": """Extract construction site daily report data from this voice note (Hindi/Marathi/English/Hinglish).
Return JSON with keys: executiveSummary, weather, workCompleted, manpowerSummary, materialsLog, equipmentLog, aiHighlights."""
}

def extract_module_data(transcript: str, module: str, site_name: str = "", extra_context: str = "") -> dict:
    prompt_template = MODULE_PROMPTS.get(module, MODULE_PROMPTS["general"])
    prompt = f"""Site: {site_name}
Voice Transcript: "{transcript}"
{extra_context}

{prompt_template}

Only return valid JSON. Translate Hindi/Marathi terms to standard English construction terms."""

    try:
        response = client.chat.completions.create(
            model="openai/gpt-oss-120b",
            messages=[{"role": "user", "content": prompt}],
            response_format={"type": "json_object"},
            temperature=0.1,
        )
        raw = response.choices[0].message.content or "{}"
        return json.loads(raw)
    except Exception as e:
        print(f"Groq API Error: {e}")
        return {"raw": transcript, "error": f"JSON parse failed: {str(e)}"}


def extract_image_data(image_bytes: bytes, mime_type: str, module: str, site_name: str = "") -> dict:
    """Read a delivery document with Groq vision and return the same module schema as voice input."""
    prompt_template = MODULE_PROMPTS.get(module, MODULE_PROMPTS["resource"])
    image_url = f"data:{mime_type};base64,{base64.b64encode(image_bytes).decode('ascii')}"
    response = client.chat.completions.create(
        model=os.getenv("GROQ_VISION_MODEL", "meta-llama/llama-4-scout-17b-16e-instruct"),
        messages=[{
            "role": "user",
            "content": [
                {"type": "text", "text": f"Site: {site_name}\nRead this construction document. {prompt_template}\nOnly return valid JSON."},
                {"type": "image_url", "image_url": {"url": image_url}},
            ],
        }],
        response_format={"type": "json_object"},
        temperature=0.1,
    )
    raw = response.choices[0].message.content or "{}"
    try:
        return json.loads(raw)
    except Exception:
        return {"raw": raw, "error": "JSON parse failed"}
