#!/bin/bash

# Vite 프로세스 종료
echo "🛑 Vite 개발 서버 종료 중..."
pkill -f "vite"

if [ $? -eq 0 ]; then
  echo "✅ 종료 완료"
else
  echo "⚠️ 종료할 프로세스를 찾지 못했습니다."
fi