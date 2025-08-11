# Qwen3 CLI

사내 배포된 Qwen3 API를 활용한 명령줄 인터페이스 도구입니다. gemini-cli와 유사한 방식으로 사용할 수 있습니다.

## 설치

```bash
# 의존성 설치
npm install

# 전역 설치 (필수)
npm install -g .
```

## 사용법

### 기본 사용법

```bash
# 단일 질문
qwen "안녕하세요"

# 대화형 모드
qwen -i

# 또는 인수 없이 실행
qwen
```

### 옵션

- `-s, --save <filename>`: 결과를 파일로 저장
- `-l, --last-save <filename>`: 마지막 답변을 파일로 저장
- `-h, --history`: 대화 이력 확인
- `-f, --format <format>`: 출력 형식 (text, markdown)
- `-p, --system-prompt <prompt>`: 임시 시스템 프롬프트 설정
- `-P, --permanent-prompt <prompt>`: 영구 시스템 프롬프트 설정 (질문과 함께)
- `-S, --set-prompt <prompt>`: 시스템 프롬프트만 영구 변경
- `-t, --temperature <value>`: temperature 값 설정 (0.0-1.0)
- `-T, --set-temperature <value>`: temperature만 영구 변경
- `-c, --config`: 설정 파일 생성/수정
- `-i, --interactive`: 대화형 모드

### 사용 예시

```bash
# 마크다운 형식으로 출력
qwen -f markdown "Python으로 웹 스크래핑하는 방법을 알려줘"

# 마크다운 형식으로 출력하고 파일로 저장
qwen -f markdown -s output.md "Python으로 웹 스크래핑하는 방법을 알려줘"

# 결과를 파일로 저장
qwen -s output.md "프로젝트 구조 설계 방법"

# 마지막 답변을 파일로 저장
qwen -l last_response.md

# 임시 시스템 프롬프트 사용
qwen -p "당신은 전문 프로그래머입니다." "코드 리뷰를 해주세요"

# 영구 시스템 프롬프트 설정 (질문과 함께)
qwen -P "당신은 친근하고 유머러스한 AI입니다." "재미있는 이야기를 해줘"

# 시스템 프롬프트만 영구 변경
qwen -S "당신은 전문 프로그래머입니다."

# temperature 조정
qwen -t 0.7 "창의적인 아이디어를 제안해줘"

# temperature만 영구 변경
qwen -T 0.8

# 설정 변경
qwen -c
```

### 대화형 모드

대화형 모드에서는 다음과 같은 명령어를 사용할 수 있습니다:

- `quit`, `exit`, `bye`: 종료
- `help`: 도움말 표시
- `save <filename>`: 마지막 답변을 파일로 저장

## 설정

설정은 프로젝트 폴더의 `.qwen3-cli-config.json` 파일에 저장됩니다:

```json
{
  "systemPrompt": "간결한 어투로 답변해",
  "temperature": "0.7"
}
```

## 대화 이력

대화 이력은 프로젝트 폴더의 `.qwen3-cli-history.json` 파일에 자동으로 저장됩니다.

### 📊 히스토리 관리:
- **최대 100개의 대화** 저장
- **최신 대화가 맨 위**에 저장
- **100개 초과 시** 가장 오래된 대화 자동 삭제
- **저장 정보**: 시간, 질문, 답변

### 📁 설정 파일들:
- `.qwen3-cli-config.json` - CLI 설정 (API URL, 시스템 프롬프트, temperature)
- `.qwen3-cli-history.json` - 대화 이력 (최대 100개)
- `.qwen3-cli-last-response.json` - 마지막 답변 (임시 저장)

## 특징

- 🚀 **빠른 응답**: 사내 배포된 Qwen3 API 활용
- 💾 **자동 저장**: 대화 이력 자동 저장
- 📝 **다양한 출력**: 텍스트 및 마크다운 형식 지원
- ⚙️ **유연한 설정**: API URL, 시스템 프롬프트, temperature 조정 가능
- 🔄 **대화형 모드**: 연속적인 대화 지원
- 📁 **파일 저장**: 결과를 파일로 저장 가능

## 개발

```bash
# 의존성 설치
npm install

# 실행
node bin/qwen.js
```

## 라이선스

Apache 2.0 license 
