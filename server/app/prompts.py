def get_system_prompt() -> str:
    """추천 기능을 위한 시스템 프롬프트를 반환합니다."""
    return """프롬프트 엔지니어링 전문가로서, 현재 프롬프트 문맥에 맞는 구성 요소만 추천하세요.

[규칙]
1. 현재 프롬프트 문맥에 어울리는 추천만 제안 (예: 동화→동화작가, 이메일→비즈니스 전문가)
2. element는 프롬프트에 바로 넣을 수 있는 짧은 태그 (role: 2~10단어, style: 1~5단어)
3. 반드시 유효한 JSON 형식만 출력하세요. 코드 블록(```json)이나 설명 없이 순수 JSON만 출력합니다.
4. description 형식: 📝 description: ... 💡 impact: ... ⚠️ risk: ...
5. 정확히 4개 추천, 서로 구별되는 옵션만
6. 현재 프롬프트와 동일한 언어 사용
7. element와 description의 📝 description 부분은 요청된 노드 타입과 직접 관련된 내용만 포함해야 합니다. 다른 노드 타입(role, style, audience, length, task, topic)의 내용은 element와 description에 포함하지 마세요.
8. 💡 impact와 ⚠️ risk에는 기존 프롬프트의 전체 맥락을 반영해도 됩니다."""


def get_recommendation_prompt(current_prompt: str, node_type: str, output_result: str = None) -> str:
    """
    노드 타입에 맞는 추천 프롬프트를 반환합니다.
    
    Args:
        current_prompt: 현재 작업 프롬프트
        node_type: 노드 타입 ("task", "role", "style", "audience", "length", "topic")
    
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
- 누락된 요구사항 보완 정확히 4개 제안 (입력 데이터, 제약 조건, 평가 기준, 산출물 형식)
- element: 프롬프트에 바로 넣을 수 있는 한 줄 요구사항 또는 짧은 태그
- ⚠️ 중요: element와 📝 description은 task(작업 지시문)의 본질을 최우선으로 반영해야 합니다. role, style, audience, length, topic와 관련된 내용은 element와 description에 포함하지 마세요.
- description 형식: 📝 description: ... 💡 impact: ... ⚠️ risk: ...
- 💡 impact와 ⚠️ risk에는 기존 프롬프트의 전체 맥락(role, style, audience, length, topic 포함)을 반영해도 됩니다.

[출력 형식]
반드시 다음 JSON 형식으로만 응답하세요. 코드 블록이나 설명 없이 순수 JSON만 출력합니다:
{json_schema}
""",

        "role": f"""
[현재 프롬프트]
{current_prompt}

[작성 지침]
- 이 작업에 적합한 정확히 4개 역할 제안
- element: 2~10단어 명사구 ("당신은 <element>입니다" 형태)
- 문맥에 맞는 역할만 (예: 동화→동화작가, 이메일→비즈니스 전문가)
- ⚠️ 중요: element와 📝 description은 role(역할)과 직접 관련된 내용만 포함해야 합니다. task, style, audience, length, topic와 관련된 내용은 element와 description에 포함하지 마세요.
- description 형식: 📝 description: ... 💡 impact: ... ⚠️ risk: ...
- 💡 impact와 ⚠️ risk에는 기존 프롬프트의 전체 맥락(task, style, audience, length, topic 포함)을 반영해도 됩니다.

[출력 형식]
반드시 다음 JSON 형식으로만 응답하세요. 코드 블록이나 설명 없이 순수 JSON만 출력합니다:
{json_schema}
""",

        "style": f"""
[현재 프롬프트]
{current_prompt}

[작성 지침]
- 어조/문체/표현 규칙 스타일 태그 정확히 4개 제안
- element: 1~5단어 (예: "따뜻한", "공손하고 포멀한", "간결한")
- 작업 유형에 맞는 스타일만 (동화→따뜻한, 이메일→공손한)
- ⚠️ 중요: element와 📝 description은 style(문체/톤/말투)과 직접 관련된 내용만 포함해야 합니다. task, role, audience, length, topic와 관련된 내용은 element와 description에 포함하지 마세요.
- description 형식: 📝 description: ... 💡 impact: ... ⚠️ risk: ...
- 💡 impact와 ⚠️ risk에는 기존 프롬프트의 전체 맥락(task, role, audience, length, topic 포함)을 반영해도 됩니다.

[출력 형식]
반드시 다음 JSON 형식으로만 응답하세요. 코드 블록이나 설명 없이 순수 JSON만 출력합니다:
{json_schema}
""",

        "audience": f"""
[현재 프롬프트]
{current_prompt}

[작성 지침]
- 잠재 독자군 정확히 4개 제안
- element: 2~10단어 명사구 (예: "7살 어린이", "비즈니스 의사결정자")
- ⚠️ 중요: element와 📝 description은 audience(대상 사용자)와 직접 관련된 내용만 포함해야 합니다. task, role, style, length, topic와 관련된 내용은 element와 description에 포함하지 마세요.
- description 형식: 📝 description: ... 💡 impact: ... ⚠️ risk: ...
- 💡 impact와 ⚠️ risk에는 기존 프롬프트의 전체 맥락(task, role, style, length, topic 포함)을 반영해도 됩니다.

[출력 형식]
반드시 다음 JSON 형식으로만 응답하세요. 코드 블록이나 설명 없이 순수 JSON만 출력합니다:
{json_schema}
""",

        "length": f"""
[현재 프롬프트]
{current_prompt}

[작성 지침]
- 채널/목적에 맞는 분량 옵션 정확히 4개 제안
- element: 분량 규칙 또는 형식 (예: "요약 3~5문장", "800~1,000단어")
- ⚠️ 중요: element와 📝 description은 length(권장 길이)와 직접 관련된 내용만 포함해야 합니다. task, role, style, audience, topic와 관련된 내용은 element와 description에 포함하지 마세요.
- description 형식: 📝 description: ... 💡 impact: ... ⚠️ risk: ...
- 💡 impact와 ⚠️ risk에는 기존 프롬프트의 전체 맥락(task, role, style, audience, topic 포함)을 반영해도 됩니다.

[출력 형식]
반드시 다음 JSON 형식으로만 응답하세요. 코드 블록이나 설명 없이 순수 JSON만 출력합니다:
{json_schema}
""",

        "topic": f"""
[현재 프롬프트]
{current_prompt}

[작성 지침]
- 작업에 적합한 주제 정확히 4개 제안
- element: 주제를 나타내는 명사구 또는 짧은 문구 (예: "테니스", "인공지능의 미래", "환경 보호")
- ⚠️ 중요: element와 📝 description은 topic(주제)와 직접 관련된 내용만 포함해야 합니다. task, role, style, audience, length와 관련된 내용은 element와 description에 포함하지 마세요.
- description 형식: 📝 description: ... 💡 impact: ... ⚠️ risk: ...
- 💡 impact와 ⚠️ risk에는 기존 프롬프트의 전체 맥락(task, role, style, audience, length 포함)을 반영해도 됩니다.

[출력 형식]
반드시 다음 JSON 형식으로만 응답하세요. 코드 블록이나 설명 없이 순수 JSON만 출력합니다:
{json_schema}
""",

        "output": (
            f"""[현재 프롬프트]
{current_prompt}
"""
            + (f"[현재 결과]\n{output_result}\n\n" if output_result else "")
            + f"""[작성 지침]
- 현재 프롬프트와 결과를 기반으로 다음 단계나 개선 방안을 정확히 4개 제안
- element: 다음 단계나 개선 방안을 나타내는 짧은 문구 (예: "다른 스타일로 재생성", "Role 노드 수정", "더 구체적인 지시 추가")
- description 형식: 📝 description: ... 💡 impact: ... ⚠️ risk: ...
- 추천 유형: 다음 단계(next-step), 프롬프트 개선(prompt-improvement), 출력 제안(output-suggestion)
- 💡 impact와 ⚠️ risk에는 기존 프롬프트와 결과의 전체 맥락을 반영해도 됩니다.

[출력 형식]
반드시 다음 JSON 형식으로만 응답하세요. 코드 블록이나 설명 없이 순수 JSON만 출력합니다:
{json_schema}
"""
        ),
    }

    return prompts.get(
        node_type,
        f"[오류] 정의되지 않은 노드 타입 '{node_type}'입니다. '{current_prompt}' 작업에 적합한 요소를 정확히 4개 추천해주세요."
    )
