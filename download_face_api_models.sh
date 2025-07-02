#!/bin/bash

# face-api.js 모델 파일 다운로드 스크립트
# public/models 폴더에 모든 필요한 모델 파일들을 다운로드합니다.

MODELS_DIR="public/models"
BASE_URL="https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights"

# models 디렉토리 생성
mkdir -p "$MODELS_DIR"

echo "🚀 face-api.js 모델 파일 다운로드를 시작합니다..."
echo "📁 다운로드 위치: $MODELS_DIR"

# 다운로드할 모델 파일 목록
MODELS=(
    "tiny_face_detector_model-weights_manifest.json"
    "tiny_face_detector_model-shard1"
    "face_landmark_68_model-weights_manifest.json"
    "face_landmark_68_model-shard1"
    "face_recognition_model-weights_manifest.json"
    "face_recognition_model-shard1"
    "face_expression_model-weights_manifest.json"
    "face_expression_model-shard1"
    "age_gender_model-weights_manifest.json"
    "age_gender_model-shard1"
)

# 각 모델 파일 다운로드
for model in "${MODELS[@]}"; do
    if [ -f "$MODELS_DIR/$model" ]; then
        echo "✅ $model (이미 존재함)"
    else
        echo "�� $model 다운로드 중..."
        if curl -L -o "$MODELS_DIR/$model" "$BASE_URL/$model" --silent --show-error; then
            echo "✅ $model 다운로드 완료"
        else
            echo "❌ $model 다운로드 실패"
        fi
    fi
done

echo ""
echo "📊 다운로드 완료된 파일들:"
ls -la "$MODELS_DIR"

echo ""
echo "🎉 face-api.js 모델 파일 다운로드가 완료되었습니다!"
echo "이제 얼굴 인식 카메라 기능을 사용할 수 있습니다." 