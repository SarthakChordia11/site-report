from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from services.auth_utils import get_current_user
from services.transcriber import transcribe_audio
from services.ai_extractor import extract_module_data, extract_image_data
from models.site import Site
from typing import Optional

router = APIRouter(prefix="/api/ai", tags=["ai"], dependencies=[Depends(get_current_user)])

@router.get("/health")
def health():
    return {"status": "ok"}

@router.post("/transcribe")
async def transcribe(file: UploadFile = File(...)):
    audio_bytes = await file.read()
    try:
        text = transcribe_audio(audio_bytes, file.filename or "audio.webm")
        return {"transcript": text}
    except Exception as e:
        raise HTTPException(500, f"Transcription failed: {str(e)}")

@router.post("/extract/{module}")
async def extract(
    module: str,
    transcript: str = Form(...),
    site_id: Optional[str] = Form(None),
    db: Session = Depends(get_db)
):
    site_name = ""
    if site_id:
        site = db.query(Site).filter(Site.id == site_id).first()
        if site:
            site_name = site.name
    if module not in ["labour", "resource", "equipment", "general"]:
        raise HTTPException(400, "Module must be labour, resource, equipment, or general")
    data = extract_module_data(transcript, module, site_name)
    return {"module": module, "data": data, "transcript": transcript}


@router.post("/extract-image/{module}")
async def extract_image(
    module: str,
    file: UploadFile = File(...),
    site_id: Optional[str] = Form(None),
    db: Session = Depends(get_db),
):
    if module not in ["labour", "resource", "equipment", "general"]:
        raise HTTPException(400, "Module must be labour, resource, equipment, or general")
    if not (file.content_type or "").startswith("image/"):
        raise HTTPException(400, "Only image uploads are supported")
    site = db.query(Site).filter(Site.id == site_id).first() if site_id else None
    try:
        data = extract_image_data(await file.read(), file.content_type or "image/jpeg", module, site.name if site else "")
        return {"module": module, "data": data}
    except Exception as exc:
        raise HTTPException(500, f"Document extraction failed: {str(exc)}")

@router.post("/voice-log")
async def voice_log(
    file: UploadFile = File(...),
    module: str = Form("general"),
    site_id: Optional[str] = Form(None),
    db: Session = Depends(get_db)
):
    """Full pipeline: audio → Whisper → LLaMA extraction"""
    audio_bytes = await file.read()
    try:
        transcript = transcribe_audio(audio_bytes, file.filename or "audio.webm")
    except Exception as e:
        raise HTTPException(500, f"Transcription failed: {str(e)}")

    site_name = ""
    if site_id:
        site = db.query(Site).filter(Site.id == site_id).first()
        if site:
            site_name = site.name

    extracted = extract_module_data(transcript, module, site_name)
    return {"transcript": transcript, "module": module, "data": extracted}
