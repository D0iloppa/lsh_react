#!/bin/bash

# 프로젝트 루트 경로 설정 (필요시 수정)
cd "$(dirname "$0")"

# 실행 로그 경로
LOG_FILE="dev.log"

# 기존 백그라운드 프로세스 확인 및 차단
if pgrep -f "vite"; then
  echo "⚠️ Vite 서버가 이미 실행 중입니다. 먼저 dev_shutdown.sh로 종료하세요."
  exit 1
fi

# 백그라운드 실행
echo "🚀 Vite 개발 서버를 시작합니다..."
nohup npm run dev -- --host > "$LOG_FILE" 2>&1 &
echo "✅ dev 서버가 백그라운드에서 실행 중입니다. 로그: $LOG_FILE"
