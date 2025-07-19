import React, { useState, useEffect, useRef } from 'react';
import { overlay } from 'overlay-kit';
import { ImageIcon, Upload, ChevronLeft, ChevronRight } from 'lucide-react';
import Swal from 'sweetalert2';
import { useMsg, useMsgGet, useMsgLang } from '@contexts/MsgContext';

const PhotoGallery = ({
  photoGalleryMode = false,
  appendedImages = [],
  onAppendedImagesChange,
  onDeleted,
  venue_id = 0
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
  const [venueId, setVenueId] = useState(venue_id);
  const { messages, isLoading, error, get, currentLang, setLanguage, availableLanguages, refresh } = useMsg();

  // DB 이미지와 새로 업로드된 이미지를 합친 최종 이미지 배열
  const finalImages = [...(images || []), ...(appendedImages || [])];
  const finalContentIds = [...(contentId || []), ...Array((appendedImages || []).length).fill(null)]; // 새 이미지는 contentId가 없음

  const fetchImages = async () => {
    setLoading(true);
    try {
      const result = await photoGalleryMode.fetchList();

      console.log('fetchList result:', result);

      // result가 배열인 경우 (이미지 URL 배열)
      if (Array.isArray(result)) {
        setImages(result);
        setContentId(Array(result.length).fill(null)); // contentId는 null로 설정
      } 
      // result가 객체인 경우 {images, contentId}
      else if (result && typeof result === 'object') {
        const {images, contentId} = result;
        const imageArray = Array.isArray(images) ? images : [];
        const contentIdArray = Array.isArray(contentId) ? contentId : [];
        
        setImages(imageArray);
        setContentId(contentIdArray);
        
        // DB 이미지들을 galleryImagesMap에 저장 (부모 컴포넌트에서 사용)
        const dbImageMap = imageArray.map((url, index) => ({
          url,
          contentId: contentIdArray[index] || null
        }));
        
        // 부모 컴포넌트의 onAppendedImagesChange를 통해 galleryImagesMap 업데이트
        if (typeof onAppendedImagesChange === 'function') {
          onAppendedImagesChange(dbImageMap);
        }
      } 
      // 그 외의 경우 빈 배열로 설정
      else {
        setImages([]);
        setContentId([]);
      }
    } catch (e) {
      console.error('Failed to fetch images:', e);
      setImages([]);
      setContentId([]);
    } finally {
      setLoading(false);
    }
  };


   useEffect(() => {
        if (messages && Object.keys(messages).length > 0) {
          console.log('✅ Messages loaded:', messages);
          // setLanguage('en'); // 기본 언어 설정
          console.log('Current language set to:', currentLang);
          window.scrollTo(0, 0);
        }
      }, [messages, currentLang]);


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
  }, []); // 빈 의존성 배열로 변경 - 컴포넌트 마운트 시에만 실행

  // appendedImages가 변경될 때 갤러리 새로고침 (삭제 후 상태 반영을 위해)
  useEffect(() => {
    fetchImages();
  }, [appendedImages]);

  const thumbnails = finalImages.slice(0, 4);
  const emptyCount = 4 - thumbnails.length;

  const openGalleryOverlay = () => {

    /*
    if(venue_id < 1){

      Swal.fire({
        title: get('SWAL_VENUE_REG1'),
        text:  get('SWAL_VENUE_REG2'),
        icon: 'warning',
        confirmButtonText: get('INQUIRY_CONFIRM'),
        showCancelButton: false,
        allowOutsideClick: true
      });

      return;
    }
      */

    overlay.open(({ isOpen, close, unmount }) => {

      console.log('overlayimages', contentId);


      const [overlayImages, setOverlayImages] = useState(finalImages);
      const [overlayContentId, setOverlayContentId] = useState(finalContentIds);
      const [fullscreenIndex, setFullscreenIndex] = useState(null);
      const touchStartX = useRef(null);
      const mouseStartX = useRef(null);

      // overlay가 열릴 때마다 최신 이미지로 업데이트
      useEffect(() => {
        setOverlayImages(finalImages);
        setOverlayContentId(finalContentIds);
      }, [finalImages, finalContentIds]);

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
              height: '450px',
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
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: '#333' }}>
              Gallery
              <span style={{
                fontSize: '14px',
                color: '#666',
                fontWeight: 'normal',
                marginLeft: '8px'
              }}>
                ({overlayImages.length}{get('text.cnt.1')})
              </span>
            </h3>
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
                <Upload size={16} /> {get('PHOTO_INFO8')}
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
                gridTemplateRows: 'repeat(4, 1fr)',
                gap: '10px 5px', // row-gap, column-gap
                padding: '20px',
                //height: 'calc(400px - 80px)',
                overflowY: 'auto',
                background: 'rgb(248, 249, 250)',
              }}
            >
              {overlayImages.map((img, idx) => (
                <div
                  key={idx}
                  style={{
                    cursor: 'pointer',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    border: '1px solid #e9ecef',
                    background: 'white',
                    position: 'relative',
                    aspectRatio: '1/1',
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    openFullscreen(idx);
                  }}
                >
                  <img
                    src={img}
                    alt={`gallery-${idx}`}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
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
        const imageUrl = overlayImages[fullscreenIndex];

        console.log('삭제 시도:', { imageUrl, contentId, fullscreenIndex });

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
            console.log('삭제 확인됨');
            
            // 부모 컴포넌트의 onDeleted 콜백 호출
            if (typeof onDeleted === 'function') {
              onDeleted(imageUrl);
            }
            
            
            // overlay 상태 업데이트
            setOverlayImages(prev => {
              const newImages = prev.filter((_, idx) => idx !== fullscreenIndex);
              
              // 이미지가 없으면 overlay 닫기
              if (newImages.length === 0) {
                console.log('모든 이미지 삭제됨, overlay 닫기');
                unmount();
                return [];
              }
              
              return newImages;
            });
            setOverlayContentId(prev => prev.filter((_, idx) => idx !== fullscreenIndex));
            
            // fullscreenIndex 조정 (이미지가 남아있는 경우에만)
            if (overlayImages.length > 1) {
              if (fullscreenIndex >= overlayImages.length - 1) {
                setFullscreenIndex(Math.max(0, overlayImages.length - 2));
              }
            }
            
            console.log('삭제 완료');
          }
        });
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
