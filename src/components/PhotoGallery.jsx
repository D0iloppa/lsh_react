import React, { useState, useEffect, useRef } from 'react';
import { overlay } from 'overlay-kit';
import { ImageIcon, Upload, ChevronLeft, ChevronRight } from 'lucide-react';
import Swal from 'sweetalert2';

const PhotoGallery = ({
  photoGalleryMode = false,
  appendedImages = [],
  onAppendedImagesChange,
  onDeleted,
}) => {
  if (
    !photoGalleryMode ||
    typeof photoGalleryMode !== 'object' ||
    typeof photoGalleryMode.fetchList !== 'function'
  ) {
    return (
      <div style={{ color: 'red', fontSize: 13 }}>
        photoGalleryMode.fetchList 함수가 필요합니다.
      </div>
    );
  }

  const [images, setImages] = useState([]);
  const [contentId, setContentId] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchImages = async () => {
    setLoading(true);
    try {
      const {images, contentId} = await photoGalleryMode.fetchList();

      console.log('images', images);
      console.log('contentId', contentId);

      setImages(Array.isArray(images) ? images : []);
      setContentId(contentId);
    } catch (e) {
      setImages([]);
      setContentId([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    const fetch = async () => {
      if (mounted) {
        await fetchImages();
      }
    };
    fetch();
    return () => {
      mounted = false;
    };
  }, [photoGalleryMode, appendedImages]);

  const thumbnails = images.slice(0, 4);
  const emptyCount = 4 - thumbnails.length;

  const openGalleryOverlay = () => {
    overlay.open(({ isOpen, close, unmount }) => {


      console.log('overlayimages', contentId);


      const [overlayImages, setOverlayImages] = useState(images);
      const [overlayContentId, setOverlayContentId] = useState(contentId);
      const [fullscreenIndex, setFullscreenIndex] = useState(null);
      const touchStartX = useRef(null);
      const mouseStartX = useRef(null);

      const openFullscreen = (index) => {
        setFullscreenIndex(index);
      };

      const closeFullscreen = () => {
        setFullscreenIndex(null);
      };

      useEffect(() => {
        const handleKeyDown = (e) => {
          if (fullscreenIndex === null) return;

          if (e.key === 'ArrowLeft') {
            setFullscreenIndex((prev) => Math.max(0, prev - 1));
          } else if (e.key === 'ArrowRight') {
            setFullscreenIndex((prev) => Math.min(overlayImages.length - 1, prev + 1));
          } else if (e.key === 'Escape') {
            closeFullscreen();
          }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
      }, [fullscreenIndex, overlayImages]);

      const handleLongPressDelete = (img) => {
        const confirmed = window.confirm('이미지를 삭제하시겠습니까?');
        if (confirmed) {
          alert('삭제!',JSON.stringify(img));
          // 실제 삭제 로직이 있다면 여기에 구현
        }
      };

      return (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0,0,0,0.85)',
            zIndex: 3000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            touchAction: 'pan-y',
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) unmount();
          }}
        >
          <div
            style={{
              width: '300px',
              height: '400px',
              background: 'white',
              borderRadius: '12px',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '16px 20px',
                borderBottom: '1px solid #eee',
                background: '#f8f9fa',
              }}
            >
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: '#333' }}>갤러리</h3>
              <button
                style={{
                  background: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '8px 16px',
                  fontSize: '14px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
                onClick={() => {
                  document.getElementById('photo-gallery-upload-input')?.click();
                }}
              >
                <Upload size={16} /> 업로드
              </button>
              <input
                id="photo-gallery-upload-input"
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  if (typeof photoGalleryMode.onUpload === 'function') {
                    await photoGalleryMode.onUpload(file);
                    unmount();
                  }
                  e.target.value = '';
                }}
              />
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '8px',
                padding: '20px',
                background: '#f8f9fa',
                height: '260px', // 원하는 높이로 조정
                overflowY: 'auto',
              }}
            >
              {overlayImages.map((img, idx) => (
                <div
                  key={idx}
                  style={{
                    position: 'relative',
                    width: '100%',
                    paddingBottom: '100%', // 정사각형
                    borderRadius: '8px',
                    overflow: 'hidden',
                    border: '1px solid #e9ecef',
                    background: 'white',
                  }}
                >
                  <img
                    src={img}
                    alt={`gallery-${idx}`}
                    style={{
                      position: 'absolute',
                      top: 0, left: 0, width: '100%', height: '100%',
                      objectFit: 'cover', display: 'block'
                    }}
                  />
                </div>
              ))}
            </div>
          </div>

          {fullscreenIndex !== null && (
  <div
    style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'rgba(0,0,0,0.95)',
      zIndex: 4000,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
    }}
    onClick={(e) => {
      if (e.target === e.currentTarget) closeFullscreen();
    }}
    onTouchStart={(e) => {
      if (e.touches.length === 1) {
        touchStartX.current = e.touches[0].clientX;
      }
    }}
    onTouchEnd={(e) => {
      if (touchStartX.current === null) return;
      const touchEndX = e.changedTouches[0].clientX;
      const deltaX = touchEndX - touchStartX.current;

      if (deltaX > 50) {
        setFullscreenIndex((prev) => Math.max(0, prev - 1));
      } else if (deltaX < -50) {
        setFullscreenIndex((prev) => Math.min(overlayImages.length - 1, prev + 1));
      }
      touchStartX.current = null;
    }}
    onMouseDown={(e) => {
      mouseStartX.current = e.clientX;
    }}
    onMouseUp={(e) => {
      if (mouseStartX.current === null) return;
      const deltaX = e.clientX - mouseStartX.current;
      if (deltaX > 50) {
        setFullscreenIndex((prev) => Math.max(0, prev - 1));
      } else if (deltaX < -50) {
        setFullscreenIndex((prev) => Math.min(overlayImages.length - 1, prev + 1));
      }
      mouseStartX.current = null;
    }}
  >
    {/* 삭제 버튼 (오른쪽 상단) */}
    <button
      onClick={(e) => {
        e.stopPropagation();

        
        const contentId = overlayContentId[fullscreenIndex];


        if(contentId){
          // z-index 5000 추가
          Swal.fire({
            title: '삭제하시겠습니까?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            customClass: {
              popup: 'swal-zindex-10000'
            }
          }).then((result) => {
            if (result.isConfirmed) {
              photoGalleryMode.onDeleted({
                img_url: overlayImages[fullscreenIndex],
                content_id: contentId
              }).then((response) => {
                setOverlayImages(prev => prev.filter((_, idx) => idx !== fullscreenIndex));
                setOverlayContentId(prev => prev.filter((_, idx) => idx !== fullscreenIndex));
              });
            }
          });
        }
        
      }}
      style={{
        position: 'absolute',
        top: 20,
        right: 20,
        background: 'rgba(255, 0, 0, 0.7)',
        border: 'none',
        borderRadius: 4,
        padding: '6px 10px',
        color: 'white',
        fontWeight: 'bold',
        cursor: 'pointer',
        zIndex: 5000,
      }}
    >
      삭제
    </button>

    {/* 좌우 이동 버튼 */}
    <button
      onClick={(e) => {
        e.stopPropagation();
        setFullscreenIndex((prev) => Math.max(0, prev - 1));
      }}
      style={{
        position: 'absolute',
        left: '20px',
        background: 'transparent',
        border: 'none',
        color: 'white',
        cursor: 'pointer',
      }}
    >
      <ChevronLeft size={48} />
    </button>

    <img
      src={overlayImages[fullscreenIndex]}
      alt="fullscreen"
      style={{
        maxWidth: '90vw',
        maxHeight: '80vh',
        borderRadius: 6,
        boxShadow: '0 2px 12px rgba(0,0,0,0.25)',
        userSelect: 'none',
      }}
    />

    <button
      onClick={(e) => {
        e.stopPropagation();
        setFullscreenIndex((prev) => Math.min(overlayImages.length - 1, prev + 1));
      }}
      style={{
        position: 'absolute',
        right: '20px',
        background: 'transparent',
        border: 'none',
        color: 'white',
        cursor: 'pointer',
      }}
    >
      <ChevronRight size={48} />
    </button>

    {/* 페이지 인디케이터 */}
    <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
      {overlayImages.map((_, i) => (
        <div
          key={i}
          style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            backgroundColor: i === fullscreenIndex ? '#10b981' : '#888',
          }}
        ></div>
      ))}
    </div>
  </div>
)}
        </div>
      );
    });
  };

  if (loading) return <div style={{ color: '#888', fontSize: 13 }}>이미지 불러오는 중...</div>;

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gridTemplateRows: 'repeat(2, 1fr)',
        gap: 3,
        width: 125,
        height: 125,
        cursor: 'pointer',
        borderRadius: 5,
        overflow: 'hidden',
        background: '#f3f4f6',
        boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
      }}
      onClick={openGalleryOverlay}
    >
      {thumbnails.map((img, idx) => (
        <div key={idx} style={{ position: 'relative' }}>
          <img
            src={img}
            alt={`thumb-${idx}`}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              borderRadius: 3,
              border: '1px solid #eee',
              aspectRatio: '1/1',
            }}
          />
          {appendedImages.includes(img) && (
            <div
              style={{
                position: 'absolute',
                top: '2px',
                right: '2px',
                background: '#10b981',
                color: 'white',
                padding: '1px 4px',
                borderRadius: '3px',
                fontSize: '8px',
                fontWeight: 'bold',
              }}
            >
              NEW
            </div>
          )}
        </div>
      ))}
      {Array.from({ length: emptyCount }).map((_, idx) => (
        <div
          key={idx}
          style={{
            width: '100%',
            height: '100%',
            background: '#e5e7eb',
            borderRadius: 3,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <ImageIcon size={28} color="#bbb" />
        </div>
      ))}
    </div>
  );
};

export default PhotoGallery;
