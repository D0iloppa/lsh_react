import React, { useState, useRef, useEffect } from 'react';

const AdBannerSlider = ({ banners }) => {
  // props로 받은 배너 데이터 사용, 없으면 기본값
  const bannerData = banners || [
    {
      type: 'video',
      src: '/cdn/video_mobile.mp4',
      poster: 'https://via.placeholder.com/800x300/4ECDC4/FFFFFF?text=광고+비디오+1'
    },
    {
      type: 'image',
      src: 'https://via.placeholder.com/800x300/FF6B6B/FFFFFF?text=광고+이미지+1',
      alt: '광고 이미지 1'
    },
    {
      type: 'image', 
      src: 'https://via.placeholder.com/800x300/45B7D1/FFFFFF?text=광고+이미지+2',
      alt: '광고 이미지 2'
    }
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [translateX, setTranslateX] = useState(0);
  const sliderRef = useRef(null);

  // 드래그 시작
  const handleDragStart = (clientX) => {
    setIsDragging(true);
    setStartX(clientX);
  };

  // 드래그 중
  const handleDragMove = (clientX) => {
    if (!isDragging) return;
    
    const diff = clientX - startX;
    setTranslateX(diff);
  };

  // 드래그 끝
  const handleDragEnd = () => {
    if (!isDragging) return;
    
    setIsDragging(false);
    
    // 드래그 거리가 충분하면 슬라이드 변경
    const threshold = 50; // 최소 드래그 거리
    
    if (translateX > threshold && currentIndex > 0) {
      // 왼쪽으로 스와이프 (이전 슬라이드)
      setCurrentIndex(currentIndex - 1);
    } else if (translateX < -threshold && currentIndex < bannerData.length - 1) {
      // 오른쪽으로 스와이프 (다음 슬라이드)
      setCurrentIndex(currentIndex + 1);
    }
    
    setTranslateX(0);
  };

  // 마우스 이벤트
  const handleMouseDown = (e) => {
    e.preventDefault();
    handleDragStart(e.clientX);
  };

  const handleMouseMove = (e) => {
    handleDragMove(e.clientX);
  };

  const handleMouseUp = () => {
    handleDragEnd();
  };


  /*
  // 터치 이벤트
  const handleTouchStart = (e) => {
    e.preventDefault(); // 터치 이벤트 기본 동작 방지
    handleDragStart(e.touches[0].clientX);
  };

  const handleTouchMove = (e) => {
    e.preventDefault(); // 스크롤 방지
    handleDragMove(e.touches[0].clientX);
  };

  const handleTouchEnd = (e) => {
    e.preventDefault();
    handleDragEnd();
  };
*/
const handleTouchStart = (e) => {
  // 🎯 비디오 요소 클릭일 경우, 드래그 이벤트 완전히 무시
  if (e.target.tagName.toLowerCase() === 'video') return;
  
  // preventDefault 제거 (WebView 클릭 막힘 방지)
  handleDragStart(e.touches[0].clientX);
};

const handleTouchMove = (e) => {
  if (e.target.tagName.toLowerCase() === 'video') return;
  
  // WebView 환경에서는 preventDefault()를 호출하지 않아야 onClick 유지됨
  handleDragMove(e.touches[0].clientX);
};

const handleTouchEnd = (e) => {
  if (e.target.tagName.toLowerCase() === 'video') return;
  handleDragEnd();
};


  // 마우스 이벤트 리스너 등록/해제
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, startX, translateX]);

  // 인디케이터 클릭
  const handleIndicatorClick = (index) => {
    setCurrentIndex(index);
  };
  
  
  useEffect(() => {
  const videos = sliderRef.current?.querySelectorAll('video');
  if (!videos) return;

  let lastTime = 0;

  const handleTimeUpdate = (e) => {
    lastTime = e.target.currentTime;
  };

  const resumePlayback = (video) => {
    if (!video) return;
    try {
      video.currentTime = lastTime;
      // ✅ 0.5초 지연 후 재생 시도 (WebView에서 성공률 ↑)
      setTimeout(() => {
        video.play().catch(err => {
          console.warn('자동재생 실패, 사용자 제스처 필요:', err);
        });
      }, 500);
    } catch (e) {
      console.warn('resumePlayback error', e);
    }
  };

  const handleFullscreenChange = () => {
    const fullscreenElement =
      document.fullscreenElement ||
      document.webkitFullscreenElement ||
      document.msFullscreenElement;

    if (!fullscreenElement) {
      resumePlayback(videos[currentIndex]);
    }
  };

  const handleWebkitEndFullscreen = () => {
    resumePlayback(videos[currentIndex]);
  };

  videos.forEach((video) => {
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('webkitendfullscreen', handleWebkitEndFullscreen);
  });

  document.addEventListener('fullscreenchange', handleFullscreenChange);
  document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
  document.addEventListener('msfullscreenchange', handleFullscreenChange);

  return () => {
    videos.forEach((video) => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('webkitendfullscreen', handleWebkitEndFullscreen);
    });
    document.removeEventListener('fullscreenchange', handleFullscreenChange);
    document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.removeEventListener('msfullscreenchange', handleFullscreenChange);
  };
}, [currentIndex]);


  
  return (
    <div className="ad-banner-slider">
      {/* 슬라이더 컨테이너 */}
      <div 
        ref={sliderRef}
        className="slider-container"
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          //transform: `translateX(${isDragging ? translateX : 0}px)`,
          //transition: isDragging ? 'none' : 'transform 0.3s ease-out'
        }}
      >
        <div 
          className="slider-track"
          style={{
            transform: `translateX(${-currentIndex * (100 / bannerData.length) + (isDragging ? (translateX / (sliderRef.current?.offsetWidth || 1)) * 100 : 0)}%)`,
            transition: isDragging ? 'none' : 'transform 0.3s ease-out'
          }}
        >
          {bannerData.map((banner, index) => (
            <div key={index} className="slide">
              {banner.type === 'image' ? (
                <img 
                  src={banner.src} 
                  alt={banner.alt || `광고 배너 ${index + 1}`}
                  draggable={false}
                  className="banner-media"
                />
              ) : (
                <video
                  width="100%"
                  height="100%"
                  autoPlay
                  loop
                  playsInline
                  muted
                  poster={banner.poster}
                  className="banner-media"
                  onClick={(e) => {
                    e.stopPropagation();
                    const video = e.currentTarget;

                    try {
                      if (video.requestFullscreen) {
                        video.requestFullscreen();
                      } else if (video.webkitEnterFullscreen) { // ✅ iOS Safari / WKWebView
                        video.webkitEnterFullscreen();
                      } else if (video.webkitRequestFullscreen) {
                        video.webkitRequestFullscreen();
                      } else if (video.msRequestFullscreen) {
                        video.msRequestFullscreen();
                      }
                      video.play().catch(() => {});
                    } catch (err) {
                      console.warn('Fullscreen request failed:', err);
                    }
                  }}
                >
                  <source src={banner.src} type="video/mp4" />
                </video>

              )}
            </div>
          ))}
        </div>
      </div>

      {/* 인디케이터 */}
      <div className="indicators">
        {bannerData.map((_, index) => (
          <button
            key={index}
            className={`indicator ${index === currentIndex ? 'active' : ''}`}
            onClick={() => handleIndicatorClick(index)}
            aria-label={`슬라이드 ${index + 1}으로 이동`}
          />
        ))}
      </div>

      <style jsx>{`
        .ad-banner-slider {
          width: 100%;
          max-width: 800px;
          margin: 0 auto;
          position: relative;
          background: #f5f5f5;
          border-radius: 8px;
          overflow: hidden;
        }

        .slider-container {
          width: 100%;
          height: 150px;
          overflow: hidden;
          cursor: grab;
          user-select: none;
          touch-action: pan-y; /* 수직 스크롤만 허용 */
          border-radius: 8px;
        }

        .slider-container:active {
          cursor: grabbing;
        }

        .slider-track {
          display: flex;
          width: ${bannerData.length * 100}%;
          height: 100%;
        }

        .slide {
          width: ${100 / bannerData.length}%;
          height: 100%;
          flex-shrink: 0;
        }

        .banner-media {
          width: 100%;
          height: 100%;
          object-fit: fill; /* 컨테이너에 완전히 맞춤 */
          display: block;
        }

        .banner-media video {
          pointer-events: auto;
        }

        /* 비디오 컨트롤 스타일링 */
        video::-webkit-media-controls-panel {
          background-color: rgba(0, 0, 0, 0.8);
        }

        video::-webkit-media-controls-play-button,
        video::-webkit-media-controls-volume-slider,
        video::-webkit-media-controls-timeline {
          filter: brightness(1.2);
        }

        .indicators {
          display: none;
          justify-content: center;
          align-items: center;
          padding: 16px;
          gap: 8px;
        }

        .indicator {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          border: none;
          background: rgba(0, 0, 0, 0.3);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .indicator:hover {
          background: rgba(0, 0, 0, 0.5);
          transform: scale(1.1);
        }

        .indicator.active {
          background: #007bff;
          transform: scale(1.2);
        }

        /* 모바일 최적화 */
        @media (max-width: 768px) {
          .ad-banner-slider {
            border-radius: 0;
          }
          
          .slider-container {
            height: 270px;
          }
          
          .indicators {
            padding: 8px;
          }
        }
      `}</style>
    </div>
  );
};

export default AdBannerSlider;