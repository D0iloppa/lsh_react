import React, { useState, useEffect } from 'react';
import { overlay } from 'overlay-kit';
import { ImageIcon, Upload } from 'lucide-react';

/**
 * photoGalleryMode: {
 *   fetchList: () => Promise<array> | array (반드시 이미지 url 리스트 반환)
 * }
 */
const PhotoGallery = ({ photoGalleryMode = false }) => {
  // validation
  if (!photoGalleryMode || typeof photoGalleryMode !== 'object' || typeof photoGalleryMode.fetchList !== 'function') {
    return <div style={{ color: 'red', fontSize: 13 }}>photoGalleryMode.fetchList 함수가 필요합니다.</div>;
  }

  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);

  // fetch images
  useEffect(() => {
    let mounted = true;
    const fetch = async () => {
      setLoading(true);
      try {
        const list = await photoGalleryMode.fetchList();
        if (mounted) setImages(Array.isArray(list) ? list : []);
      } catch (e) {
        setImages([]);
      } finally {
        setLoading(false);
      }
    };
    fetch();
    return () => { mounted = false; };
  }, [photoGalleryMode]);

  // 썸네일 최대 4개 (2x2)
  const thumbnails = images.slice(0, 4);
  const emptyCount = 4 - thumbnails.length;

  // overlay 갤러리 오픈
  const openGalleryOverlay = () => {
    overlay.open(({ isOpen, close, unmount }) => {
      const [detailImage, setDetailImage] = useState(null);
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
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'flex-start',
          paddingTop: 40
        }} onClick={e => { if (e.target === e.currentTarget) unmount(); }}>
          {/* 상단 업로드 버튼 */}
          <div style={{ width: '100%', maxWidth: 600, display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
            <button style={{ background: '#10b981', color: 'white', border: 'none', borderRadius: 6, padding: '8px 16px', fontSize: 15, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }} onClick={() => { document.getElementById('photo-gallery-upload-input')?.click(); }}>
              <Upload size={18} /> 업로드
            </button>
            <input id="photo-gallery-upload-input" type="file" accept="image/*" style={{ display: 'none' }}
              onChange={async e => {
                const file = e.target.files?.[0];
                if (!file) return;
                if (typeof photoGalleryMode.onUpload === 'function') {
                  await photoGalleryMode.onUpload(file);
                  // 업로드 후 리스트 갱신
                  try {
                    const list = await photoGalleryMode.fetchList();
                    setImages(Array.isArray(list) ? list : []);
                  } catch {
                    setImages([]);
                  }
                }
                e.target.value = '';
              }}
            />
          </div>
          {/* 갤러리 그리드 (아이폰 갤러리 스타일) */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 1,
            width: '100%',
            maxWidth: 600,
            background: 'white',
            borderRadius: 3,
            boxSizing: 'border-box',
            maxHeight: '70vh',
            overflowY: 'auto',
            margin: '0 auto'
          }}>
            {images.length === 0 && <div style={{ gridColumn: '1/-1', textAlign: 'center', color: '#888' }}>이미지가 없습니다.</div>}
            {images.map((img, idx) => (
              <div key={idx} style={{ cursor: 'pointer', borderRadius: 3, overflow: 'hidden', border: '1px solid #eee', background: '#fafafa', position: 'relative', aspectRatio: '1/1', width: '100%', height: '100%' }}
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
              </div>
            ))}
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
      width: 120,
      height: 120,
      cursor: 'pointer',
      borderRadius: 5,
      overflow: 'hidden',
      background: '#f3f4f6',
      boxShadow: '0 1px 4px rgba(0,0,0,0.07)'
    }} onClick={openGalleryOverlay}>
      {thumbnails.map((img, idx) => (
        <img key={idx} src={img} alt={`thumb-${idx}`} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 3, border: '1px solid #eee', aspectRatio: '1/1' }} />
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