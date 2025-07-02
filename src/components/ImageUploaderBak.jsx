import React, { useRef, useState, useCallback, useEffect } from 'react';
import { ImageIcon, Upload, Camera, Folder, X } from 'lucide-react';
import { overlay } from 'overlay-kit';
import SketchInput from '@components/SketchInput';
import SketchDiv from '@components/SketchDiv';

export const ImageUploader = ({
  apiClient,
  onUploadComplete,
  onUploadStart,
  onUploadError,
  usingCameraModule = false,
  containerAsUploader = false,
  showContextMenu = false,
  showPreview = true,
  className = '',
  disabled = false,
  // containerAsUploader 관련 props
  uploadedImages = [],
  onImagesChange,
  maxImages = 1,
  imageHolderStyle = {},
  showRemoveButton = true,
  // 단일 이미지 홀더 관련 props
  initialImageUrl = null,
  imageHolderSize = { width: '120px', height: '120px' },
  // inputDivAsUploader 관련
  inputDivAsUploader = false,
  value = '',
  onChange,
  placeholder = '',
  initImage = null,
}) => {
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const [fileName, setFileName] = useState('');
  const [imageUrl, setImageUrl] = useState(null);
  const [uploadState, setUploadState] = useState({
    isUploading: false
  });

  // 최초 로딩 시 initImage가 있으면 imageUrl에 반영
  useEffect(() => {
    if (inputDivAsUploader && initImage) {
      setImageUrl(initImage);
    }
  }, [inputDivAsUploader, initImage]);

  // 파일 업로드 처리 함수 (썸네일 url 저장 추가)
  const handleFileUpload = useCallback(async (file) => {
    if (!file || disabled) return;
    setUploadState(prev => ({ 
      ...prev, 
      isUploading: true, 
      error: undefined,
      file 
    }));
    setFileName(file.name);
    onUploadStart?.();
    try {
      const validatedFile = await validateAndProcessFile(file);
      let processedFile = validatedFile;
      if (/Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
        processedFile = await convertFileForMobile(validatedFile);
      }
      const response = await apiClient.uploadImage(processedFile);
      if (response.success) {
        const contentId = response.content_id || 'unknown';
        setUploadState(prev => ({
          ...prev,
          isUploading: false,
          contentId,
          file: processedFile
        }));
        setFileName(processedFile.name);
        setImageUrl(URL.createObjectURL(processedFile));
        if (containerAsUploader) {
          const newImage = {
            contentId,
            file: processedFile,
            previewUrl: URL.createObjectURL(processedFile),
            name: processedFile.name,
            size: processedFile.size
          };
          const updatedImages = maxImages === 1 ? [newImage] : [...uploadedImages, newImage];
          onImagesChange?.(updatedImages);
        }
        if (showPreview && !containerAsUploader) {
          showImagePreview(processedFile, contentId);
        }
        onUploadComplete?.(contentId, processedFile);
        if (onChange) onChange({ target: { value: contentId, name: 'image' } });
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
  }, [apiClient, onUploadComplete, onUploadStart, onUploadError, disabled, showPreview, containerAsUploader, uploadedImages, onImagesChange, maxImages, onChange]);

  // 이미지 제거 함수
  const handleRemoveImage = useCallback((index) => {
    const updatedImages = uploadedImages.filter((_, i) => i !== index);
    onImagesChange?.(updatedImages);
  }, [uploadedImages, onImagesChange]);

  // 파일 검증 및 전처리 함수
  const validateAndProcessFile = useCallback(async (file) => {
    /*
    console.log('Validating file:', {
      name: file.name,
      size: file.size,
      type: file.type
    });
    */

    // 파일 크기 제한 (50MB)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      throw new Error(`파일 크기가 너무 큽니다. 최대 ${Math.round(maxSize / 1024 / 1024)}MB까지 업로드 가능합니다.`);
    }

    // 지원하는 이미지 형식 확인
    const supportedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/heic', 'image/heif'];
    const isSupportedType = supportedTypes.includes(file.type.toLowerCase());
    
    if (!isSupportedType) {
      console.warn('Unsupported file type:', file.type, 'Converting to JPEG...');
      // 지원하지 않는 형식이면 JPEG로 변환
      return await convertToJPEG(file);
    }

    // HEIC/HEIF 형식 처리 (iOS에서 자주 사용)
    if (file.type.toLowerCase().includes('heic') || file.type.toLowerCase().includes('heif')) {
      console.log('HEIC/HEIF format detected, converting...');
      return await convertToJPEG(file);
    }

    // 파일이 손상되었는지 확인
    try {
      await validateImageFile(file);
    } catch (error) {
      console.warn('Image validation failed, attempting conversion:', error);
      return await convertToJPEG(file);
    }

    return file;
  }, []);

  // 이미지 파일 유효성 검사
  const validateImageFile = useCallback((file) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      
      img.onload = () => {
        URL.revokeObjectURL(url);
        resolve();
      };
      
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Invalid image file'));
      };
      
      img.src = url;
    });
  }, []);

  // JPEG로 변환하는 함수
  const convertToJPEG = useCallback(async (file) => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        try {
          // 원본 크기 유지하되 최대 크기 제한
          const maxSize = 4096; // 최대 4096px
          let { width, height } = img;
          
          if (width > height) {
            if (width > maxSize) {
              height = (height * maxSize) / width;
              width = maxSize;
            }
          } else {
            if (height > maxSize) {
              width = (width * maxSize) / height;
              height = maxSize;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          
          // 이미지 그리기
          ctx.drawImage(img, 0, 0, width, height);
          
          // Canvas를 Blob으로 변환 (품질 조정)
          canvas.toBlob((blob) => {
            if (blob) {
              // 파일명 확장자 변경
              const fileName = file.name.replace(/\.[^/.]+$/, '.jpg');
              const convertedFile = new File([blob], fileName, {
                type: 'image/jpeg',
                lastModified: Date.now()
              });
              
              console.log('File converted to JPEG:', {
                originalSize: file.size,
                convertedSize: convertedFile.size,
                originalType: file.type,
                convertedType: convertedFile.type
              });
              
              resolve(convertedFile);
            } else {
              reject(new Error('Failed to convert to JPEG'));
            }
          }, 'image/jpeg', 0.85); // JPEG 품질 85%
        } catch (error) {
          reject(error);
        }
      };
      
      img.onerror = () => {
        reject(new Error('Failed to load image for conversion'));
      };
      
      const reader = new FileReader();
      reader.onload = (e) => {
        img.src = e.target.result;
      };
      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };
      reader.readAsDataURL(file);
    });
  }, []);

  // 모바일 환경에서 파일 변환 함수
  const convertFileForMobile = useCallback(async (file) => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        try {
          // 이미지 크기 조정 (최대 1920px)
          const maxSize = 1920;
          let { width, height } = img;
          
          if (width > height) {
            if (width > maxSize) {
              height = (height * maxSize) / width;
              width = maxSize;
            }
          } else {
            if (height > maxSize) {
              width = (width * maxSize) / height;
              height = maxSize;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          
          // 이미지 그리기
          ctx.drawImage(img, 0, 0, width, height);
          
          // Canvas를 Blob으로 변환
          canvas.toBlob((blob) => {
            if (blob) {
              // 원본 파일명 유지하면서 새로운 Blob 생성
              const convertedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now()
              });
              
              /*
              console.log('File converted for mobile:', {
                originalSize: file.size,
                convertedSize: convertedFile.size,
                originalType: file.type,
                convertedType: convertedFile.type
              });
              */
              
              resolve(convertedFile);
            } else {
              reject(new Error('Failed to convert image'));
            }
          }, 'image/jpeg', 0.9); // JPEG 품질 90%
        } catch (error) {
          reject(error);
        }
      };
      
      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };
      
      // 파일을 Data URL로 읽기
      const reader = new FileReader();
      reader.onload = (e) => {
        img.src = e.target.result;
      };
      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };
      reader.readAsDataURL(file);
    });
  }, []);

  // 파일 선택 핸들러
  const handleImageSelect = useCallback((event) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
    event.target.value = '';
  }, [handleFileUpload]);

  // 갤러리에서 선택
  const selectFromGallery = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  // 카메라로 촬영
  const selectFromCamera = useCallback(() => {
    console.log('Camera selection triggered');
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

  // 이미지 프리뷰 오버레이 함수
  const showImagePreviewFromUrl = useCallback((url) => {
    overlay.open(({ isOpen, close, unmount }) => (
      <div 
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0,0,0,0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000
        }}
        onClick={e => { if (e.target === e.currentTarget) unmount(); }}
      >
        <img src={url} alt="미리보기" style={{ maxWidth: '90vw', maxHeight: '80vh', borderRadius: 12, boxShadow: '0 4px 24px rgba(0,0,0,0.25)' }} />
      </div>
    ));
  }, []);

  // inputDivAsUploader 모드
  if (inputDivAsUploader) {
    return (
      <SketchDiv style={{
        display: 'flex',
        alignItems: 'center',
        width: '100%',
        gap: 6,
        border: '1.2px solid #d1d5db',
        borderRadius: '8px',
        background: '#f8f8f8',
        padding: '0.2rem 0.7rem',
        boxSizing: 'border-box',
        marginBottom: 4
      }}>
        {/* 왼쪽 아이콘 (flex item) */}
        <span
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: 32,
            width: 32,
            minWidth: 32,
            cursor: 'pointer',
            color: '#888',
            marginRight: 2
          }}
          onClick={showUploadOptions}
          title="이미지 첨부"
        >
          <ImageIcon size={20} />
        </span>
        {/* SketchInput (flex: 1) */}
        <input
          name="image"
          value={fileName || ''}
          onChange={onChange}
          placeholder={placeholder}
          style={{ flex: 1, minWidth: 0, border: 'none', background: 'transparent', boxShadow: 'none', outline: 'none' }}
          readOnly
        />
        {/* 오른쪽 썸네일 (flex item) */}
        {imageUrl ? (
          <span
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 28,
              height: 28,
              borderRadius: 6,
              overflow: 'hidden',
              boxShadow: '0 1px 4px rgba(0,0,0,0.13)',
              cursor: 'pointer',
              background: '#f3f4f6',
              marginLeft: 4
            }}
            onClick={() => showImagePreviewFromUrl(imageUrl)}
            title="이미지 미리보기"
          >
            <img
              src={imageUrl}
              alt="thumbnail"
              style={{ width: 28, height: 28, objectFit: 'cover', borderRadius: 6 }}
            />
          </span>
        ) : (
          <span style={{ width: 28, height: 28, marginLeft: 4 }} />
        )}
        {/* 파일 input */}
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          style={{ display: 'none' }}
          onChange={handleImageSelect}
        />
      </SketchDiv>
    );
  }

  // containerAsUploader 모드일 때의 렌더링
  if (containerAsUploader) {
    const currentImage = uploadedImages[0]; // 단일 이미지만 표시
    
    return (
      <div className={`image-uploader-container ${className}`}>
        {/* 이미지 홀더 영역 */}
        <div
          className="image-holder"
          onClick={showUploadOptions}
          style={{
            width: imageHolderSize.width,
            height: imageHolderSize.height,
            border: '2px dashed #d1d5db',
            borderRadius: '8px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            backgroundColor: '#f9fafb',
            transition: 'all 0.2s ease',
            overflow: 'hidden',
            position: 'relative',
            ...imageHolderStyle
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#9ca3af';
            e.currentTarget.style.backgroundColor = '#f3f4f6';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = '#d1d5db';
            e.currentTarget.style.backgroundColor = '#f9fafb';
          }}
        >
          {uploadState.isUploading ? (
            <>
              <Upload size={24} className="animate-pulse" />
              <span style={{ fontSize: '12px', marginTop: '4px' }}>업로드 중...</span>
            </>
          ) : currentImage ? (
            <>
              <img
                src={currentImage.previewUrl}
                alt={currentImage.name}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  borderRadius: '6px'
                }}
              />
              {/* 제거 버튼 */}
              {showRemoveButton && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveImage(0);
                  }}
                  style={{
                    position: 'absolute',
                    top: '4px',
                    right: '4px',
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
                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                  }}
                >
                  <X size={10} />
                </button>
              )}
              {/* Content ID 표시 (개발용) */}
              <div
                style={{
                  position: 'absolute',
                  bottom: '4px',
                  left: '4px',
                  background: 'rgba(0,0,0,0.7)',
                  color: 'white',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  fontSize: '10px',
                  fontFamily: 'monospace'
                }}
              >
                {currentImage.contentId}
              </div>
            </>
          ) : initialImageUrl ? (
            <>
              <img
                src={initialImageUrl}
                alt="Profile"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  borderRadius: '6px'
                }}
              />
              {/* 교체 버튼 */}
              <div
                style={{
                  position: 'absolute',
                  top: '0',
                  left: '0',
                  right: '0',
                  bottom: '0',
                  background: 'rgba(0,0,0,0.5)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: 0,
                  transition: 'opacity 0.2s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = 1}
                onMouseLeave={(e) => e.currentTarget.style.opacity = 0}
              >
                <span style={{ color: 'white', fontSize: '12px' }}>클릭하여 교체</span>
              </div>
            </>
          ) : (
            <>
              <ImageIcon size={24} />
              <span style={{ fontSize: '12px', marginTop: '4px' }}>이미지 추가</span>
            </>
          )}
        </div>

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
  }

  // 기존 모드 렌더링
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