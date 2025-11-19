import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Literal, Optional
from dotenv import load_dotenv
from . import prompts

# .env 탐색: 루트와 server 디렉토리 모두 시도
load_dotenv()  # 루트 디렉토리의 .env

# server 디렉토리의 .env 파일 경로
server_env_path = os.path.join(os.path.dirname(__file__), "..", ".env")
server_env_abs = os.path.abspath(server_env_path)
if os.path.exists(server_env_abs):
    print(f"🔍 DEBUG: Loading .env from: {server_env_abs}")
    load_dotenv(server_env_abs, override=True)  # override=True로 명시적으로 덮어쓰기
else:
    print(f"⚠️ WARNING: .env file not found at: {server_env_abs}")

# OpenAI API 키와 기본 모델 설정 (환경변수로 오버라이드 가능)
_api_key_raw = os.getenv("OPENAI_API_KEY")
if _api_key_raw:
    # 앞뒤 공백 제거 및 따옴표 제거
    _api_key = _api_key_raw.strip().strip('"').strip("'")
    # API 키 형식 검증 (sk- 또는 sk-proj-로 시작해야 함)
    if not (_api_key.startswith("sk-") or _api_key.startswith("sk-proj-")):
        print(f"⚠️ WARNING: API Key format may be incorrect. Should start with 'sk-' or 'sk-proj-'")
        print(f"⚠️ WARNING: API Key starts with: {_api_key[:10] if len(_api_key) > 10 else _api_key}")
else:
    _api_key = None

_default_model = os.getenv("OPENAI_DEFAULT_MODEL", "gpt-4o-mini")
print(f"🔍 DEBUG: API Key loaded: {_api_key is not None}")
if _api_key:
    # API 키의 앞부분만 표시 (보안)
    api_key_preview = _api_key[:10] + "..." + _api_key[-4:] if len(_api_key) > 14 else "***"
    print(f"🔍 DEBUG: API Key preview: {api_key_preview}")
    print(f"🔍 DEBUG: API Key length: {len(_api_key)} characters")
    print(f"🔍 DEBUG: API Key starts with: {_api_key[:7]}")
else:
    print(f"⚠️ WARNING: OPENAI_API_KEY environment variable is not set!")
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


app = FastAPI(
    title="Honors Thesis API",
    description="프롬프트 엔지니어링 시스템 API",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {
        "message": "Honors Thesis API",
        "docs": "/docs",
        "health": "/api/health"
    }


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
                        
                        # API 키가 에러 메시지에 포함되어 있으면 제거
                        if _api_key and _api_key in error_message:
                            error_message = error_message.replace(_api_key, "***API_KEY***")
                        
                        # quota 관련 에러 감지
                        if error_type == "insufficient_quota" or error_code == "insufficient_quota" or "quota" in error_message.lower():
                            error_detail = "OpenAI API 사용량이 초과되었습니다. 요금제를 확인하거나 새 API 키를 사용해주세요."
                        elif error_type == "rate_limit_exceeded" or error_code == "rate_limit_exceeded":
                            error_detail = "OpenAI API 요청 한도가 초과되었습니다. 잠시 후 다시 시도해주세요."
                        elif "Incorrect API key" in error_message or "invalid_api_key" in error_type.lower():
                            error_detail = "OpenAI API 키가 올바르지 않습니다. .env 파일의 OPENAI_API_KEY를 확인해주세요. (공백이나 따옴표가 포함되어 있지 않은지 확인하세요)"
                        else:
                            error_detail = error_message or str(error_json)
                except:
                    error_detail = f"OpenAI API error: {response.status_code} - {response.text[:200]}"
                
                raise HTTPException(status_code=500, detail=error_detail)
        
    except Exception as e:  # pragma: no cover
        print(f"🔍 DEBUG: Exception caught: {type(e).__name__}: {e}")
        # 에러 메시지에서 API 키 제거 (보안)
        error_msg = str(e)
        if _api_key and _api_key in error_msg:
            error_msg = error_msg.replace(_api_key, "***API_KEY***")
        # 에러 원인 가시화
        raise HTTPException(status_code=500, detail=f"OpenAI request failed: {type(e).__name__}: {error_msg}")


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
            "temperature": min(req.temperature, 0.5),  # 추천은 더 결정적으로 (최대 0.5)
            "max_tokens": 500  # JSON 완전성을 위해 충분한 토큰 확보
        }
        
        with httpx.Client(timeout=20.0) as client:  # 타임아웃 단축 (30초 -> 20초)
            response = client.post(
                "https://api.openai.com/v1/chat/completions",
                headers=headers,
                json=data,
                timeout=20.0
            )
            
            if response.status_code == 200:
                result = response.json()
                content = result["choices"][0]["message"]["content"]
                
                print(f"🔍 DEBUG: OpenAI response content: {content[:500]}...")
                
                # 추천 항목들을 파싱하여 배열로 반환
                recommendations = []
                
                # JSON 형식 응답 파싱 시도
                try:
                    import json
                    # content가 JSON 문자열인 경우 파싱
                    content_cleaned = content.strip()
                    
                    # JSON 코드 블록 제거 (```json ... ```)
                    if content_cleaned.startswith('```'):
                        lines = content_cleaned.split('\n')
                        json_start = -1
                        json_end = -1
                        for i, line in enumerate(lines):
                            if line.strip().startswith('```') and json_start == -1:
                                json_start = i + 1
                            elif line.strip().startswith('```') and json_start != -1:
                                json_end = i
                                break
                        if json_start != -1 and json_end != -1:
                            content_cleaned = '\n'.join(lines[json_start:json_end]).strip()
                    
                    if content_cleaned.startswith('{') or content_cleaned.startswith('['):
                        parsed_json = json.loads(content_cleaned)
                        if isinstance(parsed_json, dict) and "recommendations" in parsed_json:
                            for item in parsed_json["recommendations"]:
                                if isinstance(item, dict):
                                    element = item.get("element", "").strip()
                                    description = item.get("description", "").strip()
                                    if element:  # element가 비어있지 않을 때만 추가
                                        recommendations.append({
                                            "value": element,
                                            "description": description
                                        })
                        elif isinstance(parsed_json, list):
                            for item in parsed_json:
                                if isinstance(item, dict):
                                    element = item.get("element", "").strip()
                                    description = item.get("description", "").strip()
                                    if element:  # element가 비어있지 않을 때만 추가
                                        recommendations.append({
                                            "value": element,
                                            "description": description
                                        })
                    
                    print(f"🔍 DEBUG: Parsed {len(recommendations)} recommendations")
                    
                except json.JSONDecodeError as e:
                    print(f"🔍 DEBUG: JSON parsing failed: {e}")
                    print(f"🔍 DEBUG: Content that failed to parse: {content_cleaned[:200]}...")
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
                
                if not recommendations:
                    print(f"⚠️ WARNING: No recommendations parsed from response")
                
                return {
                    "nodeType": req.nodeType,
                    "recommendations": recommendations,
                    "rawContent": content
                }
            else:
                # OpenAI API 에러 응답 파싱
                error_text = response.text
                # API 키가 에러 텍스트에 포함되어 있으면 제거
                if _api_key and _api_key in error_text:
                    error_text = error_text.replace(_api_key, "***API_KEY***")
                
                try:
                    error_json = response.json()
                    if "error" in error_json:
                        error_obj = error_json["error"]
                        error_message = error_obj.get("message", "")
                        error_type = error_obj.get("type", "")
                        error_code = error_obj.get("code", "")
                        
                        # API 키가 에러 메시지에 포함되어 있으면 제거
                        if _api_key and _api_key in error_message:
                            error_message = error_message.replace(_api_key, "***API_KEY***")
                        
                        # 특정 에러 타입 처리
                        if error_type == "insufficient_quota" or error_code == "insufficient_quota":
                            error_detail = "OpenAI API 사용량이 초과되었습니다. 요금제를 확인하거나 새 API 키를 사용해주세요."
                        elif error_type == "rate_limit_exceeded" or error_code == "rate_limit_exceeded":
                            error_detail = "OpenAI API 요청 한도가 초과되었습니다. 잠시 후 다시 시도해주세요."
                        elif "Incorrect API key" in error_message or "invalid_api_key" in error_type.lower():
                            error_detail = "OpenAI API 키가 올바르지 않습니다. .env 파일의 OPENAI_API_KEY를 확인해주세요."
                        else:
                            error_detail = error_message
                    else:
                        error_detail = error_text[:200]
                except:
                    error_detail = error_text[:200]
                
                raise HTTPException(status_code=500, detail=f"OpenAI API error: {response.status_code} - {error_detail}")
        
    except Exception as e:
        print(f"🔍 DEBUG: Recommendation exception: {type(e).__name__}: {e}")
        # 에러 메시지에서 API 키 제거 (보안)
        error_msg = str(e)
        if _api_key and _api_key in error_msg:
            error_msg = error_msg.replace(_api_key, "***API_KEY***")
        raise HTTPException(status_code=500, detail=f"Recommendation request failed: {type(e).__name__}: {error_msg}")


