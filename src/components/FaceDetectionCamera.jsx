import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as faceapi from 'face-api.js';

const FaceDetectionCamera = ({ onCapture }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingStatus, setLoadingStatus] = useState('준비 중...');
  const [error, setError] = useState(null);
  const [isFrontCamera, setIsFrontCamera] = useState(true);
  const [currentStream, setCurrentStream] = useState(null);

  // 베이스 URL을 고려한 모델 경로 생성
  const getModelPath = () => {
    const baseUrl = import.meta.env.BASE_URL || '/';
    return `${baseUrl}models`;
  };

  // 카메라 스트림 시작
  const startVideo = useCallback(async (facingMode = 'user') => {
    try {
      // 기존 스트림 정리
      if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
      }

      console.log('📹 카메라 스트림 시작...', facingMode);
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: facingMode
        } 
      });
      
      setCurrentStream(stream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        console.log('✅ 카메라 스트림 설정 완료');
      }
    } catch (error) {
      console.error('❌ 카메라 접근 실패:', error);
      setError(`카메라 접근 실패: ${error.message}`);
    }
  }, [currentStream]);

  // 카메라 전환 함수
  const switchCamera = useCallback(async () => {
    const newFacingMode = isFrontCamera ? 'environment' : 'user';
    setIsFrontCamera(!isFrontCamera);
    await startVideo(newFacingMode);
  }, [isFrontCamera, startVideo]);

  // 얼굴 인식 모델 로드
  useEffect(() => {
    const loadModels = async () => {
      try {
        const modelPath = getModelPath();
        console.log('🔄 모델 경로:', modelPath);
        
        setLoadingStatus('모델 파일 확인 중...');
        setLoadingProgress(10);
        
        setLoadingStatus('TinyFaceDetector 로딩 중...');
        console.log('🔄 TinyFaceDetector 모델 로딩 시작...');
        await faceapi.nets.tinyFaceDetector.loadFromUri(modelPath);
        setLoadingProgress(40);
        console.log('✅ TinyFaceDetector 모델 로드 완료');
        
        setLoadingStatus('FaceLandmark 로딩 중...');
        await faceapi.nets.faceLandmark68Net.loadFromUri(modelPath);
        setLoadingProgress(70);
        console.log('✅ FaceLandmark68Net 모델 로드 완료');
        
        setLoadingStatus('FaceRecognition 로딩 중...');
        await faceapi.nets.faceRecognitionNet.loadFromUri(modelPath);
        setLoadingProgress(100);
        console.log('✅ FaceRecognitionNet 모델 로드 완료');
        
        setLoadingStatus('로딩 완료!');
        setIsModelLoaded(true);
        console.log('🎉 모든 모델 로드 성공!');
        
        // 모델 로드 성공 확인
        console.log('📊 모델 상태 확인:');
        console.log('- TinyFaceDetector:', faceapi.nets.tinyFaceDetector.isLoaded);
        console.log('- FaceLandmark68Net:', faceapi.nets.faceLandmark68Net.isLoaded);
        console.log('- FaceRecognitionNet:', faceapi.nets.faceRecognitionNet.isLoaded);
        
      } catch (error) {
        console.error('❌ 모델 로드 실패:', error);
        setError(`모델 로드 실패: ${error.message}`);
        setLoadingStatus('로딩 실패');
        
        // 상세한 에러 정보 제공
        if (error.message.includes('404')) {
          setError(`모델 파일을 찾을 수 없습니다. 경로를 확인해주세요: ${getModelPath()}`);
        } else if (error.message.includes('fetch')) {
          setError('네트워크 오류: 모델 파일을 다운로드할 수 없습니다.');
        }
      }
    };

    loadModels();
  }, []);

  // 초기 카메라 스트림 시작
  useEffect(() => {
    startVideo('user');

    return () => {
      if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
        console.log('🔄 카메라 스트림 정리 완료');
      }
    };
  }, []);

  // 얼굴 인식 시작
  const startFaceDetection = useCallback(async () => {
    if (!isModelLoaded || !videoRef.current || isDetecting) return;

    console.log('🔍 얼굴 인식 시작...');
    setIsDetecting(true);
    
    const detectFaces = async () => {
      if (!videoRef.current || videoRef.current.paused || videoRef.current.ended) {
        setIsDetecting(false);
        return;
      }

      try {
        const detections = await faceapi
          .detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions({
            inputSize: 416,
            scoreThreshold: 0.5
          }))
          .withFaceLandmarks()
          .withFaceDescriptors();

        // 캔버스에 감지 결과 그리기
        if (canvasRef.current) {
          const canvas = canvasRef.current;
          const displaySize = { 
            width: videoRef.current.videoWidth, 
            height: videoRef.current.videoHeight 
          };
          
          faceapi.matchDimensions(canvas, displaySize);
          
          const ctx = canvas.getContext('2d');
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          
          // 전면 카메라일 때만 좌우 반전
          if (isFrontCamera) {
            ctx.save();
            ctx.scale(-1, 1);
            ctx.translate(-canvas.width, 0);
          }
          
          const resizedDetections = faceapi.resizeResults(detections, displaySize);
          
          if (resizedDetections.length > 0) {
            // 얼굴 감지 박스 그리기
            faceapi.draw.drawDetections(canvas, resizedDetections);
            faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
            
            // 추가적인 시각적 피드백
            resizedDetections.forEach((detection, index) => {
              const box = detection.detection.box;
              const score = detection.detection.score;
              
              // 박스 테두리 그리기
              ctx.strokeStyle = score > 0.8 ? '#00ff00' : score > 0.6 ? '#ffff00' : '#ff0000';
              ctx.lineWidth = 3;
              ctx.strokeRect(box.x, box.y, box.width, box.height);
              
              // 신뢰도 점수 표시
              ctx.fillStyle = ctx.strokeStyle;
              ctx.font = '16px Arial';
              ctx.fillText(`신뢰도: ${(score * 100).toFixed(1)}%`, box.x, box.y - 10);
            });
          }
          
          if (isFrontCamera) {
            ctx.restore();
          }
        }

        // 얼굴 감지 시 자동 촬영
        if (detections.length > 0 && !faceDetected) {
          console.log('📸 얼굴 감지됨! 1초 후 자동 촬영...');
          setFaceDetected(true);
          setTimeout(() => {
            capturePhoto();
            setFaceDetected(false);
          }, 1000);
        } else if (detections.length === 0) {
          setFaceDetected(false);
        }

      } catch (error) {
        console.error('❌ 얼굴 인식 오류:', error);
      }

      if (isDetecting) {
        requestAnimationFrame(detectFaces);
      }
    };

    detectFaces();
  }, [isModelLoaded, isDetecting, faceDetected, isFrontCamera]);

  // 사진 촬영 함수
  const capturePhoto = useCallback(() => {
    if (!videoRef.current) return;

    console.log('📷 사진 촬영 중...');
    const canvas = document.createElement('canvas');
    const video = videoRef.current;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext('2d');
    
    // 전면 카메라일 때만 좌우 반전
    if (isFrontCamera) {
      ctx.save();
      ctx.scale(-1, 1);
      ctx.translate(-canvas.width, 0);
    }
    
    ctx.drawImage(video, 0, 0);
    
    if (isFrontCamera) {
      ctx.restore();
    }
    
    const imageData = canvas.toDataURL('image/jpeg', 0.8);
    
    console.log('✅ 사진 촬영 완료!');
    
    if (onCapture) {
      onCapture(imageData);
    }
  }, [onCapture, isFrontCamera]);

  // 비디오 로드 완료 시 얼굴 인식 시작
  const handleVideoLoad = () => {
    console.log('✅ 비디오 로드 완료');
    if (isModelLoaded) {
      startFaceDetection();
    }
  };

  // 모델 로드 완료 시 얼굴 인식 시작
  useEffect(() => {
    if (isModelLoaded && videoRef.current && videoRef.current.readyState >= 2) {
      startFaceDetection();
    }
  }, [isModelLoaded, startFaceDetection]);

  // 에러 발생 시 UI
  if (error) {
    return (
      <div className="relative w-full max-w-2xl mx-auto">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <h3 className="font-bold mb-2">오류 발생</h3>
          <p className="mb-3">{error}</p>
          
          <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded">
            <p className="text-sm font-semibold mb-2">현재 설정:</p>
            <div className="text-sm space-y-1">
              <div>베이스 URL: {import.meta.env.BASE_URL}</div>
              <div>모델 경로: {getModelPath()}</div>
              <div>예상 URL: {window.location.origin}{getModelPath()}/tiny_face_detector_model-weights_manifest.json</div>
            </div>
          </div>
          
          <button
            onClick={() => window.location.reload()}
            className="mt-3 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            페이지 새로고침
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <div className="flex justify-center" style={{ marginBottom: '10px' }}>
        <button
            onClick={switchCamera}
            disabled={!isModelLoaded}
            className="px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {/*isFrontCamera ? '📷 후면카메라' : '📱 전면카메라'*/}
            🔃 카메라 전환
          </button>
      </div>
      <div className="relative bg-black rounded-lg overflow-hidden">
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          onLoadedData={handleVideoLoad}
          className="w-full h-auto"
          style={{ 
            maxHeight: '480px',
            transform: isFrontCamera ? 'scaleX(-1)' : 'none'
          }}
        />
        
        <canvas
          ref={canvasRef}
          className="absolute top-0 left-0 w-full h-full"
          style={{ 
            pointerEvents: 'none',
            transform: isFrontCamera ? 'scaleX(-1)' : 'none'
          }}
        />
        
        {/* 상태 표시 */}
        <div className="absolute top-4 left-4 space-y-2">
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${
            isModelLoaded ? 'bg-green-500 text-white' : 'bg-yellow-500 text-black'
          }`}>
            {isModelLoaded ? '✅ 모델 준비완료' : `🔄 ${loadingStatus} ${loadingProgress}%`}
          </div>
          
          {isDetecting && (
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              faceDetected ? 'bg-blue-500 text-white animate-pulse' : 'bg-gray-500 text-white'
            }`}>
              {faceDetected ? '🎯 얼굴감지 📸' : '🔍 얼굴탐지중...'}
            </div>
          )}
        </div>

        {/* 카메라 전환 버튼 */}
        <button
          onClick={switchCamera}
          className="absolute top-4 right-4 px-3 py-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition-all"
          title={`${isFrontCamera ? '후면' : '전면'} 카메라로 전환`}
        >
          {isFrontCamera ? '📷' : '📱'}
        </button>

        {/* 디버그 정보 */}
        <div className="absolute bottom-4 left-4 text-xs text-white bg-black bg-opacity-50 px-2 py-1 rounded">
          {isFrontCamera ? '전면' : '후면'} 카메라 | 모델 경로: {getModelPath()}
        </div>
      </div>
      
      <div className="mt-4 flex gap-4 justify-center">
        <button
          onClick={capturePhoto}
          disabled={!isModelLoaded}
          className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          📸 수동 촬영
        </button>
        
        <button
          onClick={() => {
            setIsDetecting(false);
            setTimeout(() => startFaceDetection(), 100);
          }}
          disabled={!isModelLoaded}
          className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          🔄 인식 재시작
        </button>
      </div>
      
      <div className="mt-4 text-sm text-gray-600 text-center">
        얼굴이 감지되면 자동으로 사진을 촬영합니다. 카메라 전환 버튼으로 전면/후면 카메라를 바꿀 수 있습니다.
      </div>
    </div>
  );
};

export default FaceDetectionCamera;