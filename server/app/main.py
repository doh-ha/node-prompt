import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Literal, Optional
from dotenv import load_dotenv

# .env 탐색: 루트와 server 디렉토리 모두 시도
load_dotenv()
server_env_path = os.path.join(os.path.dirname(__file__), "..", ".env")
if os.path.exists(os.path.abspath(server_env_path)):
    load_dotenv(os.path.abspath(server_env_path))

# OpenAI API 키만 저장하고 직접 HTTP 요청 사용
_api_key = os.getenv("OPENAI_API_KEY")
print(f"🔍 DEBUG: API Key loaded: {_api_key is not None}")


class ChatMessage(BaseModel):
    role: Literal["system", "user", "assistant"]
    content: str


class ChatRequest(BaseModel):
    messages: List[ChatMessage]
    model: Optional[str] = "gpt-4"
    temperature: Optional[float] = 0.7


class FlowRequest(BaseModel):
    prompt: Optional[str] = "너는 영어 교사야. 영어로 한 문장 작성해줘"
    model: Optional[str] = "gpt-4"
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
    print(f"🔍 DEBUG: API Key exists: {_api_key is not None}")
    
    if not _api_key:
        raise HTTPException(status_code=500, detail="Missing OPENAI_API_KEY")

    try:
        import httpx
        
        messages: List[dict] = []
        if req.system:
            messages.append({"role": "system", "content": req.system})
        messages.append({"role": "user", "content": req.prompt})

        print(f"🔍 DEBUG: Messages: {messages}")
        print(f"🔍 DEBUG: Model: {req.model}")

        # OpenAI API에 직접 HTTP 요청
        headers = {
            "Authorization": f"Bearer {_api_key}",
            "Content-Type": "application/json"
        }
        
        data = {
            "model": req.model,
            "messages": messages,
            "temperature": req.temperature,
            "max_tokens": 1000
        }
        
        print("🔍 DEBUG: Making direct HTTP request to OpenAI")
        
        with httpx.Client() as client:
            response = client.post(
                "https://api.openai.com/v1/chat/completions",
                headers=headers,
                json=data,
                timeout=30.0
            )
            
            if response.status_code == 200:
                result = response.json()
                content = result["choices"][0]["message"]["content"]
                return {"content": content, "raw": result}
            else:
                raise HTTPException(status_code=500, detail=f"OpenAI API error: {response.status_code} - {response.text}")
        
    except Exception as e:  # pragma: no cover
        print(f"🔍 DEBUG: Exception caught: {type(e).__name__}: {e}")
        # 에러 원인 가시화
        raise HTTPException(status_code=500, detail=f"OpenAI request failed: {type(e).__name__}: {e}")


