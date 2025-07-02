import React, { useState, useEffect } from 'react';
import { overlay } from 'overlay-kit';
import { ImageIcon, Upload, X } from 'lucide-react';

/**
 * photoGalleryMode: {
 *   fetchList: () => Promise<array> | array (반드시 이미지 url 리스트 반환)
 * }
 * appendedImages: 새로 추가된 이미지들의 content_id 배열
 * onAppendedImagesChange: appendedImages 변경 시 호출되는 함수
 * onDeleted: 이미지 삭제 시 호출되는 함수 (deletedImageUrl) => void
 */
const PhotoGallery = ({ 
  photoGalleryMode = false,
  appendedImages = [], 
  onAppendedImagesChange,
  onDeleted
}) => {
  // validation
  if (!photoGalleryMode || typeof photoGalleryMode !== 'object' || typeof photoGalleryMode.fetchList !== 'function') {
    return <div style={{ color: 'red', fontSize: 13 }}>photoGalleryMode.fetchList 함수가 필요합니다.</div>;
  }

  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);

  // fetch images 함수
  const fetchImages = async () => {
    setLoading(true);
    try {
      const list = await photoGalleryMode.fetchList();
      setImages(Array.isArray(list) ? list : []);
    } catch (e) {
      setImages([]);
    } finally {
      setLoading(false);
    }
  };

  // fetch images
  useEffect(() => {
    let mounted = true;
    const fetch = async () => {
      if (mounted) {
        await fetchImages();
      }
    };
    fetch();
    return () => { mounted = false; };
  }, [photoGalleryMode, appendedImages]);

  // 썸네일 최대 4개 (2x2)
  const thumbnails = images.slice(0, 4);
  const emptyCount = 4 - thumbnails.length;

  // overlay 갤러리 오픈
  const openGalleryOverlay = () => {
    overlay.open(({ isOpen, close, unmount }) => {
      const [overlayImages, setOverlayImages] = useState(images);
      const [overlayLoading, setOverlayLoading] = useState(false);

      // 오버레이 내부에서 이미지 리로드 함수
      const reloadOverlayImages = async () => {

        setOverlayLoading(true);
        try {
          const list = await photoGalleryMode.fetchList();
          console.log('reloadOverlayImages', list, photoGalleryMode);
          setOverlayImages(Array.isArray(list) ? list : []);
        } catch (e) {
          setOverlayImages([]);
        } finally {
          setOverlayLoading(false);
        }
      };

      return (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0,0,0,0.85)',
          zIndex: 3000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }} onClick={e => { if (e.target === e.currentTarget) unmount(); }}>
          {/* 갤러리 컨테이너 */}
          <div style={{
            width: '300px',
            height: '400px',
            background: 'white',
            borderRadius: '12px',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
          }}>
            {/* 헤더 */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '16px 20px',
              borderBottom: '1px solid #eee',
              background: '#f8f9fa'
            }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: '#333' }}>
                갤러리
              </h3>
              <div style={{ display: 'flex', gap: '8px' }}>
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
                    gap: '6px' 
                  }} 
                  onClick={() => { document.getElementById('photo-gallery-upload-input')?.click(); }}
                >
                  <Upload size={16} /> 업로드
                </button>
              </div>
            </div>

            {/* 파일 업로드 input */}
            <input 
              id="photo-gallery-upload-input" 
              type="file" 
              accept="image/*" 
              style={{ display: 'none' }}
              onChange={async e => {
                const file = e.target.files?.[0];
                if (!file) return;
                if (typeof photoGalleryMode.onUpload === 'function') {
                  await photoGalleryMode.onUpload(file);
                  // 업로드 후 오버레이 내부 이미지 리스트 갱신
                  // await reloadOverlayImages();
                  unmount();
                  
                }
                e.target.value = '';
              }}
            />

            {/* 갤러리 그리드 (3x4 구조) */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gridTemplateRows: 'repeat(4, 1fr)',
              gap: '2px',
              padding: '20px',
              height: 'calc(400px - 80px)',
              overflowY: 'auto',
              background: '#f8f9fa'
            }}>
              {/* 실제 이미지들 */}
              {overlayImages.map((img, idx) => (
                <div key={idx} style={{ 
                  cursor: 'pointer', 
                  borderRadius: '8px', 
                  overflow: 'hidden', 
                  border: '1px solid #e9ecef', 
                  background: 'white', 
                  position: 'relative', 
                  aspectRatio: '1/1',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.02)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                  onClick={e => {
                    e.stopPropagation();
                    overlay.open(({ isOpen, close, unmount }) => (
                      <div style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100vw',
                        height: '100vh',
                        background: 'rgba(0,0,0,0.95)',
                        zIndex: 4000,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }} onClick={ev => { if (ev.target === ev.currentTarget) unmount(); }}>
                        <img src={img} alt="확대 이미지" style={{ maxWidth: '90vw', maxHeight: '90vh', borderRadius: 6, boxShadow: '0 2px 12px rgba(0,0,0,0.25)' }} />
                      </div>
                    ));
                  }}
                >
                  <img src={img} alt={`gallery-${idx}`} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                  
                  {/* 삭제 버튼 */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onDeleted) {
                        onDeleted(img);
                      }
                    }}
                    style={{
                      position: 'absolute',
                      top: '4px',
                      left: '4px',
                      background: '#ef4444',
                      color: 'white',
                      border: 'none',
                      borderRadius: '50%',
                      width: '20px',
                      height: '20px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      fontSize: '10px',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                      zIndex: 10
                    }}
                  >
                    <X size={12} />
                  </button>
                  
                  {/* 새로 추가된 이미지 표시 (임시 상태) */}
                  {appendedImages.includes(img) && (
                    <div style={{
                      position: 'absolute',
                      top: '6px',
                      right: '6px',
                      background: '#10b981',
                      color: 'white',
                      padding: '3px 8px',
                      borderRadius: '12px',
                      fontSize: '11px',
                      fontWeight: 'bold',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                    }}>
                      NEW
                    </div>
                  )}
                </div>
              ))}
              
              {/* 빈 placeholder들 */}
              {Array.from({ length: Math.max(0, 12 - overlayImages.length) }).map((_, idx) => (
                <div key={`placeholder-${idx}`} style={{
                  background: '#e9ecef',
                  border: '2px dashed #dee2e6',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#adb5bd'
                }}>
                  <ImageIcon size={24} />
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    });
  };

  if (loading) return <div style={{ color: '#888', fontSize: 13 }}>이미지 불러오는 중...</div>;

  // 2x2 네모 박스 썸네일 그리드
  return (
    <div style={{
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
      boxShadow: '0 1px 4px rgba(0,0,0,0.07)'
    }} onClick={openGalleryOverlay}>
      {thumbnails.map((img, idx) => (
        <div key={idx} style={{ position: 'relative' }}>
          <img src={img} alt={`thumb-${idx}`} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 3, border: '1px solid #eee', aspectRatio: '1/1' }} />
          {/* 새로 추가된 이미지 표시 (임시 상태) */}
          {appendedImages.includes(img) && (
            <div style={{
              position: 'absolute',
              top: '2px',
              right: '2px',
              background: '#10b981',
              color: 'white',
              padding: '1px 4px',
              borderRadius: '3px',
              fontSize: '8px',
              fontWeight: 'bold'
            }}>
              NEW
            </div>
          )}
        </div>
      ))}
      {/* 빈 박스 채우기 */}
      {Array.from({ length: emptyCount }).map((_, idx) => (
        <div key={idx} style={{ width: '100%', height: '100%', background: '#e5e7eb', borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <ImageIcon size={28} color="#bbb" />
        </div>
      ))}
    </div>
  );
};

export default PhotoGallery; 