import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Literal, Optional
from dotenv import load_dotenv

load_dotenv()

try:
    # OpenAI Python SDK >= 1.0
    from openai import OpenAI
    _client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
except Exception as _e:  # pragma: no cover
    _client = None


class ChatMessage(BaseModel):
    role: Literal["system", "user", "assistant"]
    content: str


class ChatRequest(BaseModel):
    messages: List[ChatMessage]
    model: Optional[str] = "gpt-4o-mini"
    temperature: Optional[float] = 0.7


class FlowRequest(BaseModel):
    prompt: str
    model: Optional[str] = "gpt-4o-mini"
    temperature: Optional[float] = 0.7
    system: Optional[str] = None


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
def health():
    return {"ok": True}


@app.post("/api/flow")
def run_flow(req: FlowRequest):
    if not os.getenv("OPENAI_API_KEY"):
        raise HTTPException(status_code=500, detail="Missing OPENAI_API_KEY")
    if _client is None:
        raise HTTPException(status_code=500, detail="OpenAI client not available")

    try:
        messages: List[dict] = []
        if req.system:
            messages.append({"role": "system", "content": req.system})
        messages.append({"role": "user", "content": req.prompt})

        completion = _client.chat.completions.create(
            model=req.model,
            messages=messages,
            temperature=req.temperature,
        )
        content = (completion.choices or [{}])[0].get("message", {}).get("content", "")
        return {"content": content, "raw": completion}  # raw는 클라이언트 디버깅용
    except Exception as e:  # pragma: no cover
        raise HTTPException(status_code=500, detail="OpenAI request failed") from e


