def get_system_prompt() -> str:
    """추천 기능을 위한 시스템 프롬프트를 반환합니다."""
    return """프롬프트 엔지니어링 전문가로서, 현재 프롬프트 문맥에 맞는 구성 요소만 추천하세요.

[규칙]
1. 현재 프롬프트 문맥에 어울리는 추천만 제안 (예: 동화→동화작가, 이메일→비즈니스 전문가)
2. element는 프롬프트에 바로 넣을 수 있는 짧은 태그 (role: 2~10단어, style: 1~5단어)
3. 반드시 유효한 JSON 형식만 출력하세요. 코드 블록(```json)이나 설명 없이 순수 JSON만 출력합니다.
4. description 형식: 📝 description: ... 💡 impact: ... ⚠️ risk: ...
5. 3~5개 추천, 서로 구별되는 옵션만
6. 현재 프롬프트와 동일한 언어 사용"""


def get_recommendation_prompt(current_prompt: str, node_type: str) -> str:
    """
    노드 타입에 맞는 추천 프롬프트를 반환합니다.
    
    Args:
        current_prompt: 현재 작업 프롬프트
        node_type: 노드 타입 ("task", "role", "style", "audience", "length")
    
    Returns:
        OpenAI API에 전달할 추천 프롬프트 (JSON 형식 응답 요청)
    """
    
    json_schema = """
{
  "recommendations": [
    {
      "element": "추천 항목(짧은 태그 형태)",
      "description": "📝 description / 💡 impact / ⚠️ risk 형식으로 간단 설명"
    }
  ]
}
"""

    prompts = {
        "task": f"""
[현재 프롬프트]
{current_prompt}

[작성 지침]
- 누락된 요구사항 보완 3~5개 제안 (입력 데이터, 제약 조건, 평가 기준, 산출물 형식)
- element: 프롬프트에 바로 넣을 수 있는 한 줄 요구사항 또는 짧은 태그
- description 형식: 📝 description: ... 💡 impact: ... ⚠️ risk: ...

[출력 형식]
반드시 다음 JSON 형식으로만 응답하세요. 코드 블록이나 설명 없이 순수 JSON만 출력합니다:
{json_schema}
""",

        "role": f"""
[현재 프롬프트]
{current_prompt}

[작성 지침]
- 이 작업에 적합한 3~5개 역할 제안
- element: 2~10단어 명사구 ("당신은 <element>입니다" 형태)
- 문맥에 맞는 역할만 (예: 동화→동화작가, 이메일→비즈니스 전문가)
- description 형식: 📝 description: ... 💡 impact: ... ⚠️ risk: ...

[출력 형식]
반드시 다음 JSON 형식으로만 응답하세요. 코드 블록이나 설명 없이 순수 JSON만 출력합니다:
{json_schema}
""",

        "style": f"""
[현재 프롬프트]
{current_prompt}

[작성 지침]
- 어조/문체/표현 규칙 스타일 태그 3~5개 제안
- element: 1~5단어 (예: "따뜻한", "공손하고 포멀한", "간결한")
- 작업 유형에 맞는 스타일만 (동화→따뜻한, 이메일→공손한)
- description 형식: 📝 description: ... 💡 impact: ... ⚠️ risk: ...

[출력 형식]
반드시 다음 JSON 형식으로만 응답하세요. 코드 블록이나 설명 없이 순수 JSON만 출력합니다:
{json_schema}
""",

        "audience": f"""
[현재 프롬프트]
{current_prompt}

[작성 지침]
- 잠재 독자군 3~5개 제안
- element: 2~10단어 명사구 (예: "7살 어린이", "비즈니스 의사결정자")
- description 형식: 📝 description: ... 💡 impact: ... ⚠️ risk: ...

[출력 형식]
반드시 다음 JSON 형식으로만 응답하세요. 코드 블록이나 설명 없이 순수 JSON만 출력합니다:
{json_schema}
""",

        "length": f"""
[현재 프롬프트]
{current_prompt}

[작성 지침]
- 채널/목적에 맞는 분량 옵션 3~5개 제안
- element: 분량 규칙 또는 형식 (예: "요약 3~5문장", "800~1,000단어")
- description 형식: 📝 description: ... 💡 impact: ... ⚠️ risk: ...

[출력 형식]
반드시 다음 JSON 형식으로만 응답하세요. 코드 블록이나 설명 없이 순수 JSON만 출력합니다:
{json_schema}
""",
    }

    return prompts.get(
        node_type,
        f"[오류] 정의되지 않은 노드 타입 '{node_type}'입니다. '{current_prompt}' 작업에 적합한 요소를 3개 추천해주세요."
    )
