import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Literal, Optional
from dotenv import load_dotenv
from . import prompts

# .env 탐색: 루트와 server 디렉토리 모두 시도
load_dotenv()
server_env_path = os.path.join(os.path.dirname(__file__), "..", ".env")
if os.path.exists(os.path.abspath(server_env_path)):
    load_dotenv(os.path.abspath(server_env_path))

# OpenAI API 키와 기본 모델 설정 (환경변수로 오버라이드 가능)
_api_key = os.getenv("OPENAI_API_KEY")
_default_model = os.getenv("OPENAI_DEFAULT_MODEL", "gpt-4o-mini")
print(f"🔍 DEBUG: API Key loaded: {_api_key is not None}")
print(f"🔍 DEBUG: Default model: {_default_model}")


class ChatMessage(BaseModel):
    role: Literal["system", "user", "assistant"]
    content: str


class ChatRequest(BaseModel):
    messages: List[ChatMessage]
    model: Optional[str] = _default_model
    temperature: Optional[float] = 0.7


class FlowRequest(BaseModel):
    prompt: str
    model: Optional[str] = _default_model
    temperature: Optional[float] = 0.7
    system: Optional[str] = None


class NodeRecommendationRequest(BaseModel):
    currentPrompt: str
    nodeType: str  # "role", "style", "audience", "length" 등
    model: Optional[str] = _default_model
    temperature: Optional[float] = 0.7


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

        print(f"🔍 DEBUG: Prompt length: {len(req.prompt)} characters")
        print(f"🔍 DEBUG: Prompt preview: {req.prompt[:200]}...")
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
                # OpenAI API 에러 응답 파싱
                error_detail = f"OpenAI API error: {response.status_code}"
                try:
                    error_json = response.json()
                    if "error" in error_json:
                        error_obj = error_json["error"]
                        error_message = error_obj.get("message", "")
                        error_type = error_obj.get("type", "")
                        error_code = error_obj.get("code", "")
                        
                        # quota 관련 에러 감지
                        if error_type == "insufficient_quota" or error_code == "insufficient_quota" or "quota" in error_message.lower():
                            error_detail = "OpenAI API 사용량이 초과되었습니다. 요금제를 확인하거나 새 API 키를 사용해주세요."
                        elif error_type == "rate_limit_exceeded" or error_code == "rate_limit_exceeded":
                            error_detail = "OpenAI API 요청 한도가 초과되었습니다. 잠시 후 다시 시도해주세요."
                        else:
                            error_detail = error_message or str(error_json)
                except:
                    error_detail = f"OpenAI API error: {response.status_code} - {response.text[:200]}"
                
                raise HTTPException(status_code=500, detail=error_detail)
        
    except Exception as e:  # pragma: no cover
        print(f"🔍 DEBUG: Exception caught: {type(e).__name__}: {e}")
        # 에러 원인 가시화
        raise HTTPException(status_code=500, detail=f"OpenAI request failed: {type(e).__name__}: {e}")


@app.post("/api/recommend")
def recommend_nodes(req: NodeRecommendationRequest):
    """
    현재 프롬프트를 기반으로 특정 노드 타입에 대한 추천을 제공합니다.
    예: Task가 "일본어 문장 1개 작성"이면 Role을 "일본어 전문가", "중학생" 등으로 추천
    """
    print(f"🔍 DEBUG: Node recommendation request: {req.nodeType} for prompt: {req.currentPrompt}")
    
    if not _api_key:
        raise HTTPException(status_code=500, detail="Missing OPENAI_API_KEY")

    try:
        import httpx
        
        # 프롬프트 모듈에서 추천 프롬프트 가져오기
        prompt = prompts.get_recommendation_prompt(req.currentPrompt, req.nodeType)
        
        messages = [
            {"role": "system", "content": prompts.get_system_prompt()},
            {"role": "user", "content": prompt}
        ]

        print(f"🔍 DEBUG: Recommendation messages: {messages}")

        # OpenAI API에 직접 HTTP 요청
        headers = {
            "Authorization": f"Bearer {_api_key}",
            "Content-Type": "application/json"
        }
        
        data = {
            "model": req.model,
            "messages": messages,
            "temperature": req.temperature,
            "max_tokens": 500
        }
        
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
                
                # 추천 항목들을 파싱하여 배열로 반환
                recommendations = []
                
                # JSON 형식 응답 파싱 시도
                try:
                    import json
                    # content가 JSON 문자열인 경우 파싱
                    content_cleaned = content.strip()
                    if content_cleaned.startswith('{') or content_cleaned.startswith('['):
                        parsed_json = json.loads(content_cleaned)
                        if isinstance(parsed_json, dict) and "recommendations" in parsed_json:
                            for item in parsed_json["recommendations"]:
                                if isinstance(item, dict):
                                    recommendations.append({
                                        "value": item.get("element", "").strip(),
                                        "description": item.get("description", "").strip()
                                    })
                        elif isinstance(parsed_json, list):
                            for item in parsed_json:
                                if isinstance(item, dict):
                                    recommendations.append({
                                        "value": item.get("element", "").strip(),
                                        "description": item.get("description", "").strip()
                                    })
                except json.JSONDecodeError:
                    # JSON 파싱 실패 시 기존 줄 단위 파싱 시도
                    lines = content.strip().split('\n')
                    for line in lines:
                        line = line.strip()
                        if line.startswith('-') or line.startswith('•'):
                            # "- 항목: 설명" 형식을 파싱
                            parts = line[1:].strip().split(':', 1)
                            if len(parts) == 2:
                                recommendations.append({
                                    "value": parts[0].strip(),
                                    "description": parts[1].strip()
                                })
                            else:
                                recommendations.append({
                                    "value": parts[0].strip(),
                                    "description": ""
                                })
                
                return {
                    "nodeType": req.nodeType,
                    "recommendations": recommendations,
                    "rawContent": content
                }
            else:
                raise HTTPException(status_code=500, detail=f"OpenAI API error: {response.status_code} - {response.text}")
        
    except Exception as e:
        print(f"🔍 DEBUG: Recommendation exception: {type(e).__name__}: {e}")
        raise HTTPException(status_code=500, detail=f"Recommendation request failed: {type(e).__name__}: {e}")


