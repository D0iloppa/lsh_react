import React, { useRef, useState, useCallback } from 'react';
import { ImageIcon, Upload, Camera, Folder } from 'lucide-react';
import { overlay } from 'overlay-kit';

export const ImageUploader = ({
  apiClient,
  onUploadComplete,
  onUploadStart,
  onUploadError,
  showContextMenu = false,
  showPreview = true,
  className = '',
  disabled = false
}) => {
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  
  const [uploadState, setUploadState] = useState({
    isUploading: false
  });

  // 파일 업로드 처리 함수
  const handleFileUpload = useCallback(async (file) => {
    if (!file || disabled) return;

    setUploadState(prev => ({ 
      ...prev, 
      isUploading: true, 
      error: undefined,
      file 
    }));
    
    onUploadStart?.();

    try {
      const response = await apiClient.uploadImage(file);
      
      // WAS 응답 구조에 맞게 처리
      if (response.success) {
        // content_id 필드명으로 받기
        const contentId = response.content_id || 'unknown';
        
        setUploadState(prev => ({
          ...prev,
          isUploading: false,
          contentId,
          file
        }));
        
        // Preview overlay 표시
        if (showPreview) {
          showImagePreview(file, contentId);
        }
        
        onUploadComplete?.(contentId, file);
      } else {
        throw new Error(response.error || 'Upload failed');
      }
    } catch (error) {
      const uploadError = error instanceof Error ? error : new Error('Upload failed');
      
      setUploadState(prev => ({
        ...prev,
        isUploading: false,
        error: uploadError
      }));
      
      onUploadError?.(uploadError);
    }
  }, [apiClient, onUploadComplete, onUploadStart, onUploadError, disabled, showPreview]);

  // 파일 선택 핸들러
  const handleImageSelect = useCallback((event) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
    // 같은 파일을 다시 선택할 수 있도록 value 초기화
    event.target.value = '';
  }, [handleFileUpload]);

  // 갤러리에서 선택
  const selectFromGallery = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  // 카메라로 촬영
  const selectFromCamera = useCallback(() => {
    cameraInputRef.current?.click();
  }, []);

  // 컨텍스트 메뉴 표시
  const showUploadOptions = useCallback((event) => {
    if (!showContextMenu) {
      selectFromGallery();
      return;
    }

    event.preventDefault();
    
    overlay.open(({ isOpen, close, unmount }) => {
      // 외부 클릭 시 닫기
      const handleOutsideClick = (e) => {
        if (!e.target.closest('.context-menu')) {
          unmount();
          document.removeEventListener('click', handleOutsideClick);
        }
      };

      // 약간의 지연 후 이벤트 리스너 추가 (현재 클릭 이벤트가 처리된 후)
      setTimeout(() => {
        document.addEventListener('click', handleOutsideClick);
      }, 0);

      // ESC 키로 닫기
      const handleEscape = (e) => {
        if (e.key === 'Escape') {
          unmount();
          document.removeEventListener('keydown', handleEscape);
        }
      };
      document.addEventListener('keydown', handleEscape);

      return (
        <div 
          className={`context-menu ${isOpen ? 'open' : ''}`}
          style={{
            position: 'fixed',
            top: event.clientY,
            left: event.clientX,
            backgroundColor: 'white',
            border: '1px solid #ccc',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            zIndex: 1000,
            minWidth: '160px',
            overflow: 'hidden'
          }}
        >
          <button
            className="context-menu-item"
            onClick={() => {
              selectFromGallery();
              unmount();
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              width: '100%',
              padding: '12px 16px',
              border: 'none',
              backgroundColor: 'transparent',
              cursor: 'pointer',
              fontSize: '14px'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f5f5f5'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <Folder size={16} />
            갤러리에서 선택
          </button>
          
          <button
            className="context-menu-item"
            onClick={() => {
              selectFromCamera();
              unmount();
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              width: '100%',
              padding: '12px 16px',
              border: 'none',
              backgroundColor: 'transparent',
              cursor: 'pointer',
              fontSize: '14px'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f5f5f5'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <Camera size={16} />
            카메라로 촬영
          </button>
        </div>
      );
    });
  }, [showContextMenu, selectFromGallery, selectFromCamera]);

  // 이미지 preview overlay 표시
  const showImagePreview = useCallback((file, contentId) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const imageUrl = e.target.result;
      
      overlay.open(({ isOpen, close, unmount }) => {
        return (
          <div 
            className={`image-preview-overlay ${isOpen ? 'open' : ''}`}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 2000
            }}
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                unmount();
              }
            }}
          >
            <div 
              className="preview-container"
              style={{
                position: 'relative',
                maxWidth: '90%',
                maxHeight: '90%',
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '20px',
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)'
              }}
            >
              {/* 닫기 버튼 */}
              <button
                onClick={() => unmount()}
                style={{
                  position: 'absolute',
                  top: '10px',
                  right: '10px',
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#666',
                  zIndex: 1
                }}
              >
                ×
              </button>
              
              {/* 이미지 */}
              <img
                src={imageUrl}
                alt="Preview"
                style={{
                  maxWidth: '100%',
                  maxHeight: '70vh',
                  borderRadius: '8px',
                  display: 'block'
                }}
              />
              
              {/* 정보 */}
              <div style={{ marginTop: '15px', textAlign: 'center' }}>
                <p style={{ margin: '5px 0', fontSize: '14px', color: '#666' }}>
                  파일명: {file.name}
                </p>
                <p style={{ margin: '5px 0', fontSize: '14px', color: '#666' }}>
                  크기: {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
                <p style={{ margin: '5px 0', fontSize: '14px', color: '#10b981' }}>
                  Content ID: {contentId}
                </p>
              </div>
              
              {/* 액션 버튼들 */}
              <div style={{ 
                marginTop: '15px', 
                display: 'flex', 
                gap: '10px', 
                justifyContent: 'center' 
              }}>
                <button
                  onClick={() => {
                    // 이미지 다운로드 또는 다른 액션
                    const link = document.createElement('a');
                    link.href = imageUrl;
                    link.download = file.name;
                    link.click();
                  }}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#10b981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  다운로드
                </button>
                <button
                  onClick={() => unmount()}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#6b7280',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  닫기
                </button>
              </div>
            </div>
          </div>
        );
      });
    };
    reader.readAsDataURL(file);
  }, []);

  return (
    <div className={`image-uploader ${className}`}>
      <button
        className={`image-button ${uploadState.isUploading ? 'uploading' : ''} ${disabled ? 'disabled' : ''}`}
        onClick={showUploadOptions}
        disabled={disabled || uploadState.isUploading}
        style={{
          position: 'relative',
          border: 'none',
          background: 'none',
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.5 : 1
        }}
      >
        {uploadState.isUploading ? (
          <Upload size={22} strokeWidth={1.6} className="animate-pulse" />
        ) : (
          <ImageIcon size={22} strokeWidth={1.6} />
        )}
      </button>

      {/* 갤러리 파일 선택용 input */}
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={handleImageSelect}
      />

      {/* 카메라 촬영용 input */}
      <input
        type="file"
        accept="image/*"
        ref={cameraInputRef}
        style={{ display: 'none' }}
        onChange={handleImageSelect}
        capture="environment"
      />
    </div>
  );
};

// 업로드 상태를 외부에서 접근할 수 있도록 하는 훅
export const useImageUploader = () => {
  const [uploadStates, setUploadStates] = useState(new Map());

  const getUploadState = useCallback((uploaderId) => {
    return uploadStates.get(uploaderId) || { isUploading: false };
  }, [uploadStates]);

  const setUploadState = useCallback((uploaderId, state) => {
    setUploadStates(prev => new Map(prev.set(uploaderId, state)));
  }, []);

  const isAnyUploading = useCallback(() => {
    return Array.from(uploadStates.values()).some(state => state.isUploading);
  }, [uploadStates]);

  const getAllContentIds = useCallback(() => {
    return Array.from(uploadStates.values())
      .filter(state => state.contentId)
      .map(state => state.contentId);
  }, [uploadStates]);

  return {
    getUploadState,
    setUploadState,
    isAnyUploading,
    getAllContentIds,
    uploadStates
  };
};

// 기본 export (기존 코드와의 호환성을 위해)
export default ImageUploader; 