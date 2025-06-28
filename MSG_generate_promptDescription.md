# 다국어 메시지 코드 생성 프롬프트

## 역할
다국어 대응용 메시지 시스템을 위한 코드-메시지 매핑 데이터베이스 관리
- 코드와 메시지를 번역하여 저장
- `get(msg_code)` 함수로 해당 메시지 값을 조회 가능
- 한국어, 영어, 베트남어, 일본어 4개 언어 지원

## INSERT 쿼리 예시
```sql
INSERT INTO public.lsh_message_code
(msg_code, "scope", msg_kr, msg_en, msg_vi, msg_ja)
VALUES(${msg_code}, ${scope}, ${msg_kr}, ${msg_en}, ${msg_vi}, ${msg_ja});
```

## 사용법
원하는 파라미터만 제공하면 INSERT문을 자동 생성.
(하나의 언어 메시지만 제공하면 나머지는 번역해서 생성)
- msg_code: 메시지 코드 (예: 'manager.login.description.1')
- scope: 범위 (예: 'system', 'ui', 'error' 등)
- msg_kr: 한국어 메시지
- msg_en: 영어 메시지  
- msg_vi: 베트남어 메시지
- msg_ja: 일본어 메시지