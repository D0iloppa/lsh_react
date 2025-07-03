#!/bin/bash

# models 디렉토리 생성
mkdir -p public/models

# GitHub에서 모델 파일들 다운로드
echo "Face-API.js 모델 파일들을 다운로드 중..."

# TinyFaceDetector 모델
curl -L -o public/models/tiny_face_detector_model-weights_manifest.json \
  "https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/tiny_face_detector_model-weights_manifest.json"
curl -L -o public/models/tiny_face_detector_model-shard1 \
  "https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/tiny_face_detector_model-shard1"

# Face Landmark 68점 모델
curl -L -o public/models/face_landmark_68_model-weights_manifest.json \
  "https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/face_landmark_68_model-weights_manifest.json"
curl -L -o public/models/face_landmark_68_model-shard1 \
  "https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/face_landmark_68_model-shard1"

# Face Recognition 모델
curl -L -o public/models/face_recognition_model-weights_manifest.json \
  "https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/face_recognition_model-weights_manifest.json"
curl -L -o public/models/face_recognition_model-shard1 \
  "https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/face_recognition_model-shard1"
curl -L -o public/models/face_recognition_model-shard2 \
  "https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/face_recognition_model-shard2"

echo "모델 다운로드 완료!"
echo "public/models/ 폴더에 저장되었습니다."