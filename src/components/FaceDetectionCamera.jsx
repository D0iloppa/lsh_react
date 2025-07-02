import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as faceapi from 'face-api.js';

const FaceDetectionCamera = ({ onCapture }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);

  // 얼굴 인식 모델 로드
  useEffect(() => {
    const loadModels = async () => {
      try {
        setLoadingProgress(10);
        console.log('얼굴 인식 모델 로딩 시작...');
        
        // 모델 파일들을 public/models 폴더에서 로드
        await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
        setLoadingProgress(30);
        console.log('TinyFaceDetector 모델 로드 완료');
        
        await faceapi.nets.faceLandmark68Net.loadFromUri('/models');
        setLoadingProgress(60);
        console.log('FaceLandmark68Net 모델 로드 완료');
        
        await faceapi.nets.faceRecognitionNet.loadFromUri('/models');
        setLoadingProgress(100);
        console.log('FaceRecognitionNet 모델 로드 완료');
        
        setIsModelLoaded(true);
        console.log('모든 모델 로드 완료!');
      } catch (error) {
        console.error('모델 로드 실패:', error);
        // 에러 발생 시 사용자에게 알림
        // alert('얼굴 인식 모델 로드에 실패했습니다. 페이지를 새로고침해주세요.');
      }
    };

    loadModels();
  }, []);

  // 카메라 스트림 시작
  useEffect(() => {
    const startVideo = async () => {
      try {
        console.log('카메라 스트림 시작...');
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            width: { ideal: 640 },
            height: { ideal: 480 },
            facingMode: 'user' // 전면 카메라 우선
          } 
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          console.log('카메라 스트림 설정 완료');
        }
      } catch (error) {
        console.error('카메라 접근 실패:', error);
        // alert('카메라 접근에 실패했습니다. 카메라 권한을 확인해주세요.');
      }
    };

    startVideo();

    return () => {
      // 컴포넌트 언마운트 시 스트림 정리
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach(track => track.stop());
        console.log('카메라 스트림 정리 완료');
      }
    };
  }, []);

  // 얼굴 인식 시작
  const startFaceDetection = useCallback(async () => {
    if (!isModelLoaded || !videoRef.current || isDetecting) return;

    console.log('얼굴 인식 시작...');
    setIsDetecting(true);
    
    const detectFaces = async () => {
      if (!videoRef.current || videoRef.current.paused || videoRef.current.ended) {
        setIsDetecting(false);
        return;
      }

      try {
        const detections = await faceapi
          .detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions())
          .withFaceLandmarks()
          .withFaceDescriptors();

        // 캔버스에 감지 결과 그리기 (좌우반전 적용)
        if (canvasRef.current) {
          const canvas = canvasRef.current;
          const displaySize = { 
            width: videoRef.current.videoWidth, 
            height: videoRef.current.videoHeight 
          };
          
          faceapi.matchDimensions(canvas, displaySize);
          
          const ctx = canvas.getContext('2d');
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          
          // 좌우반전을 위한 변환 적용
          ctx.save();
          ctx.scale(-1, 1); // 좌우반전
          ctx.translate(-canvas.width, 0); // 위치 조정
          
          const resizedDetections = faceapi.resizeResults(detections, displaySize);
          
          // 얼굴 경계박스 그리기 (좌우반전된 상태에서)
          faceapi.draw.drawDetections(canvas, resizedDetections);
          faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
          
          ctx.restore(); // 변환 복원
        }

        // 얼굴이 감지되면 자동으로 사진 촬영
        if (detections.length > 0 && !faceDetected) {
          console.log('얼굴 감지됨! 1초 후 자동 촬영...');
          setFaceDetected(true);
          setTimeout(() => {
            capturePhoto();
            setFaceDetected(false);
          }, 1000); // 1초 후 자동 촬영
        } else if (detections.length === 0) {
          setFaceDetected(false);
        }

      } catch (error) {
        console.error('얼굴 인식 오류:', error);
      }

      // 다음 프레임 처리
      if (isDetecting) {
        requestAnimationFrame(detectFaces);
      }
    };

    detectFaces();
  }, [isModelLoaded, isDetecting, faceDetected]);

  // 사진 촬영 함수 (좌우반전 적용)
  const capturePhoto = useCallback(() => {
    if (!videoRef.current) return;

    console.log('사진 촬영 중...');
    const canvas = document.createElement('canvas');
    const video = videoRef.current;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext('2d');
    
    // 좌우반전을 위한 변환 적용
    ctx.save();
    ctx.scale(-1, 1); // 좌우반전
    ctx.translate(-canvas.width, 0); // 위치 조정
    ctx.drawImage(video, 0, 0);
    ctx.restore(); // 변환 복원
    
    // base64 이미지 데이터 생성
    const imageData = canvas.toDataURL('image/jpeg', 0.8);
    
    console.log('사진 촬영 완료!');
    
    // 부모 컴포넌트에 사진 데이터 전달
    if (onCapture) {
      onCapture(imageData);
    }
  }, [onCapture]);

  // 비디오 로드 완료 시 얼굴 인식 시작
  const handleVideoLoad = () => {
    console.log('비디오 로드 완료');
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

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <div className="relative bg-black rounded-lg overflow-hidden">
        {/* 카메라 비디오 스트림 (좌우반전 적용) */}
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          onLoadedData={handleVideoLoad}
          className="w-full h-auto"
          style={{ 
            maxHeight: '480px',
            transform: 'scaleX(-1)' // CSS로 좌우반전 적용
          }}
        />
        
        {/* 얼굴 인식 오버레이 캔버스 (좌우반전 적용) */}
        <canvas
          ref={canvasRef}
          className="absolute top-0 left-0 w-full h-full"
          style={{ 
            pointerEvents: 'none',
            transform: 'scaleX(-1)' // CSS로 좌우반전 적용
          }}
        />
        
        {/* 상태 표시 */}
        <div className="absolute top-4 left-4 space-y-2">
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${
            isModelLoaded ? 'bg-green-500 text-white' : 'bg-yellow-500 text-black'
          }`}>
            {isModelLoaded ? '모델 로드 완료' : `모델 로딩 중... ${loadingProgress}%`}
          </div>
          
          {isDetecting && (
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              faceDetected ? 'bg-blue-500 text-white' : 'bg-gray-500 text-white'
            }`}>
              {faceDetected ? '얼굴 감지됨 📸' : '얼굴 탐지 중...'}
            </div>
          )}
        </div>
      </div>
      
      {/* 수동 촬영 버튼 */}
      <div className="mt-4 text-center">
        <button
          onClick={capturePhoto}
          disabled={!isModelLoaded}
          className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          수동 촬영
        </button>
      </div>
      
      {/* 사용 안내 */}
      <div className="mt-4 text-sm text-gray-600 text-center">
        얼굴이 감지되면 자동으로 1초 후 사진을 촬영합니다.
      </div>
    </div>
  );
};

// 사용 예시 컴포넌트
const App = () => {
  const [capturedImage, setCapturedImage] = useState(null);

  const handleCapture = (imageData) => {
    setCapturedImage(imageData);
    console.log('사진이 촬영되었습니다!');
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8">얼굴 인식 카메라</h1>
        
        <FaceDetectionCamera onCapture={handleCapture} />
        
        {capturedImage && (
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4 text-center">촬영된 사진</h2>
            <div className="max-w-md mx-auto">
              <img 
                src={capturedImage} 
                alt="촬영된 사진" 
                className="w-full rounded-lg shadow-lg"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;