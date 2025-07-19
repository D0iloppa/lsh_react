import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@contexts/AuthContext';
import { useMsg } from '@contexts/MsgContext';
import { ImageUploader } from '@components/ImageUploader';
import SketchBtn from '@components/SketchBtn';
import SketchDiv from '@components/SketchDiv';
import SketchInput from '@components/SketchInput';
import HatchPattern from '@components/HatchPattern';
import { Plus, Edit, Trash2, X, Eye, Upload, ChevronLeft, ChevronRight, ImageIcon } from 'lucide-react';
import Swal from 'sweetalert2';
import ApiClient from '@utils/ApiClient';

const MenuManagement = ({ 
  venueId,
  onMenuUpdate,
  onClose,
  user,
  get,
  lazyInsertMenu: initialLazyInsertMenu = [] // 이전 lazyInsertMenu 데이터
}) => {
  const [menuList, setMenuList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showGallery, setShowGallery] = useState(true);
  const [fullscreenIndex, setFullscreenIndex] = useState(null);
  const [lazyInsertMenu, setLazyInsertMenu] = useState(initialLazyInsertMenu); // 초기값으로 설정
  const touchStartX = useRef(null);
  const mouseStartX = useRef(null);

  // 실제 API 함수들
  const menuImageApi = {
    // 메뉴판 이미지 목록 조회
    getMenuImages: async (venueId) => {
      try {
        const response = await ApiClient.getVenueMenuList(venueId);
        return response.menuList || [];
      } catch (error) {
        console.error('메뉴판 이미지 조회 API 오류:', error);
        throw error;
      }
    },

    // 메뉴판 이미지 업로드
    uploadMenuImage: async (file) => {
      try {
        // 1. 먼저 이미지를 contentUpload API로 업로드
        const uploadResponse = await ApiClient.uploadImage(file);
        
        if (uploadResponse.success && uploadResponse.content_id) {
          // accessUrl을 우선 사용하고, 없으면 기존 필드 사용
          const imageUrl = uploadResponse.accessUrl || uploadResponse.image_url || uploadResponse.url;
          
          // venueId가 있고 유효한 경우에만 메뉴 등록
          if (venueId && venueId > 0) {
            // 2. 업로드된 content_id로 메뉴 등록
            const menuResponse = await ApiClient.insertVenueMenu(venueId, uploadResponse.content_id);
            
            if (menuResponse.success) {
              return {
                success: true,
                content_id: uploadResponse.content_id,
                image_url: imageUrl,
                item_id: menuResponse.item_id,
                message: '메뉴판 이미지가 성공적으로 업로드되었습니다.'
              };
            } else {
              throw new Error('메뉴 등록에 실패했습니다.');
            }
          } else {
            // venueId가 없는 경우 임시 저장
            return {
              success: true,
              content_id: uploadResponse.content_id,
              image_url: imageUrl,
              isTemporary: true,
              message: '메뉴판 이미지가 임시로 저장되었습니다. 매장 등록 후 자동으로 등록됩니다.'
            };
          }
        } else {
          throw new Error('이미지 업로드에 실패했습니다.');
        }
      } catch (error) {
        console.error('메뉴판 이미지 업로드 API 오류:', error);
        throw error;
      }
    },

    // 메뉴판 이미지 삭제
    deleteMenuImage: async (itemId) => {
      try {
        const response = await ApiClient.deleteVenueMenu(itemId, venueId);
        return {
          success: response.success || true,
          message: response.message || '메뉴판 이미지가 성공적으로 삭제되었습니다.'
        };
      } catch (error) {
        console.error('메뉴판 이미지 삭제 API 오류:', error);
        throw error;
      }
    }
  };

  // 메뉴판 이미지 목록 조회
  const fetchMenuImages = useCallback(async () => {
    if (!venueId || venueId === -1) return;
    
    setIsLoading(true);
    try {
      const response = await menuImageApi.getMenuImages(venueId);
      // 메뉴 리스트 설정
      const menuList = response || [];
      setMenuList(menuList);
      
    } catch (error) {
      console.error('메뉴판 이미지 조회 실패:', error);
      // 에러가 나도 빈 배열로 설정
      setMenuList([]);
              Swal.fire({
          title: get('SWAL_ERROR_TITLE'),
          text: get('MENU_LOAD_FAILED'),
          icon: 'error',
          confirmButtonText: get('SWAL_CONFIRM_BUTTON')
        });
    } finally {
      setIsLoading(false);
    }
  }, [venueId, get]);

  useEffect(() => {
    if (venueId) {
      fetchMenuImages();
    }
  }, [venueId, fetchMenuImages]);

  // 이전 lazyInsertMenu 데이터를 UI에 표시
  useEffect(() => {
    if (initialLazyInsertMenu && initialLazyInsertMenu.length > 0) {
      const tempMenuList = initialLazyInsertMenu.map((menu, index) => ({
        item_id: `temp_${Date.now()}_${index}`, // 고유한 임시 ID
        url: menu.image_url,
        isTemporary: true
      }));
      
      // 기존 메뉴 리스트에 임시 메뉴들 추가
      setMenuList(prev => {
        // 이미 임시 메뉴가 있는지 확인하여 중복 방지
        const existingTempMenus = prev.filter(menu => menu.isTemporary);
        if (existingTempMenus.length === 0) {
          return [...prev, ...tempMenuList];
        }
        return prev;
      });
    }
  }, [initialLazyInsertMenu]);

  // 메뉴판 이미지 업로드
  const handleUploadMenuImage = async (file) => {
    try {
      const response = await menuImageApi.uploadMenuImage(file);
      if (response.success) {
        if (response.isTemporary) {
          // 임시 메뉴인 경우 lazyInsertMenu에 추가
          setLazyInsertMenu(prev => [...prev, {
            content_id: response.content_id,
            image_url: response.image_url,
            uploaded_at: new Date().toISOString()
          }]);
          
          // 임시 메뉴 목록에 추가하여 UI에 표시
          setMenuList(prev => [...prev, {
            item_id: `temp_${Date.now()}`, // 임시 ID
            url: response.image_url, // 올바른 image_url 사용
            isTemporary: true
          }]);
        } else {
          // 정상 등록된 경우 리스트 갱신
          await fetchMenuImages();
        }
        
        onMenuUpdate?.();
        Swal.fire({
          title: get('MENU_UPLOAD_COMPLETE'),
          text: response.message,
          icon: 'success',
          timer: 1500
        });
      }
    } catch (error) {
      console.error('메뉴판 이미지 업로드 실패:', error);
      Swal.fire({
        title: get('SWAL_ERROR_TITLE'),
        text: get('MENU_UPLOAD_FAILED'),
        icon: 'error'
      });
    }
  };

  // 메뉴판 이미지 삭제
  const handleDeleteMenuImage = async (itemId) => {
    const result = await Swal.fire({
      title: get('MENU_DELETE_TITLE'),
      text: get('MENU_DELETE_CONFIRM'),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: get('MENU_DELETE_CONFIRM_BUTTON'),
      cancelButtonText: get('MENU_DELETE_CANCEL_BUTTON'),
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6'
    });

    if (result.isConfirmed) {
      try {
        // 임시 메뉴인지 확인
        const isTemporary = itemId.startsWith('temp_');
        
        if (isTemporary) {
          // 임시 메뉴 삭제
          setMenuList(prev => prev.filter(menu => menu.item_id !== itemId));
          // lazyInsertMenu에서도 제거 (content_id로 찾기)
          const menuToRemove = menuList.find(menu => menu.item_id === itemId);
          if (menuToRemove && menuToRemove.url) {
            setLazyInsertMenu(prev => prev.filter(menu => menu.image_url !== menuToRemove.url));
          }
          
          Swal.fire({
            title: get('MENU_DELETE_COMPLETE'),
            text: '임시 메뉴가 삭제되었습니다.',
            icon: 'success',
            timer: 1500
          });
        } else {
          // 실제 메뉴 삭제
          const response = await menuImageApi.deleteMenuImage(itemId);
          if (response.success) {
            // 삭제 성공 후 리스트 갱신
            await fetchMenuImages();
            onMenuUpdate?.();
            Swal.fire({
              title: get('MENU_DELETE_COMPLETE'),
              text: response.message,
              icon: 'success',
              timer: 1500
            });
          }
        }
      } catch (error) {
        console.error('메뉴판 이미지 삭제 실패:', error);
        Swal.fire({
          title: get('SWAL_ERROR_TITLE'),
          text: get('MENU_DELETE_FAILED'),
          icon: 'error'
        });
      }
    }
  };

  // 전체화면 열기
  const openFullscreen = (index) => {
    setFullscreenIndex(index);
  };

  // 전체화면 닫기
  const closeFullscreen = () => {
    setFullscreenIndex(null);
  };

  // 키보드 이벤트 처리
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (fullscreenIndex === null) return;

      if (e.key === 'ArrowLeft') {
        setFullscreenIndex((prev) => Math.max(0, prev - 1));
      } else if (e.key === 'ArrowRight') {
        setFullscreenIndex((prev) => Math.min(menuList.length - 1, prev + 1));
      } else if (e.key === 'Escape') {
        closeFullscreen();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [fullscreenIndex, menuList]);

  // 갤러리 닫기
  const handleCloseGallery = () => {
    setShowGallery(false);
    // lazyInsertMenu 데이터를 onClose 콜백으로 전달
    onClose?.(lazyInsertMenu);
  };

  if (!showGallery) {
    return null;
  }

  return (
    <>
      {/* 갤러리 오버레이 */}
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
          if (e.target === e.currentTarget) handleCloseGallery();
        }}
      >
        <div
          style={{
            width: '90%',
            maxWidth: '400px',
            height: '80vh',
            background: 'white',
            borderRadius: '12px',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}
          onClick={(e) => e.stopPropagation()}
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
              {get('MENU_MANAGEMENT')}
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
                document.getElementById('menu-gallery-upload-input')?.click();
              }}
            >
              <Upload size={16} /> {get('PHOTO_INFO8')}
            </button>
            <input
              id="menu-gallery-upload-input"
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                await handleUploadMenuImage(file);
                e.target.value = '';
              }}
            />
          </div>

          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '20px',
              background: 'rgb(248, 249, 250)',
            }}
          >
            {isLoading ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
                {get('PROMOTION_LOADING_TITLE')}
              </div>
            ) : !menuList || menuList.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
                {get('PHOTO_INFO9')} (개수: {menuList?.length || 0})
              </div>
            ) : (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '15px',
                }}
              >

                {menuList && menuList.length > 0 ? menuList.map((menu, idx) => (
                  <div
                    key={menu.item_id}
                    style={{
                      cursor: 'pointer',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      border: '1px solid #e9ecef',
                      background: 'white',
                      position: 'relative',
                      aspectRatio: '2/3',
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      openFullscreen(idx);
                    }}
                  >
                    <img
                      src={menu.url}
                      alt={`menu-${idx}`}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                    {/* 임시 메뉴 표시 */}
                    {menu.isTemporary && (
                      <div style={{
                        position: 'absolute',
                        top: '8px',
                        left: '8px',
                        background: 'rgba(255, 193, 7, 0.9)',
                        color: '#000',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '10px',
                        fontWeight: 'bold'
                      }}>
                        임시
                      </div>
                    )}
                  </div>
                )) : null}
              </div>
            )}
          </div>
        </div>

        {/* 전체화면 모달 */}
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
                setFullscreenIndex((prev) => Math.min(menuList.length - 1, prev + 1));
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
                setFullscreenIndex((prev) => Math.min(menuList.length - 1, prev + 1));
              }
              mouseStartX.current = null;
            }}
          >
            {/* 삭제 버튼 (오른쪽 상단) */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                const menu = menuList[fullscreenIndex];
                if (menu && menu.item_id) {
                    handleDeleteMenuImage(menu.item_id)
                    .then(() => {
                        closeFullscreen();
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
              {get('MENU_DELETE_BUTTON')}
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
              src={menuList[fullscreenIndex]?.url.startsWith('http') ? menuList[fullscreenIndex]?.url : menuList[fullscreenIndex]?.url}
              alt="fullscreen"
              style={{
                maxWidth: '90vw',
                maxHeight: '80vh',
                borderRadius: 6,
                boxShadow: '0 2px 12px rgba(0,0,0,0.25)',
                userSelect: 'none',
              }}
              onError={(e) => {
                // 이미지 로드 실패 시 처리
              }}
            />

            <button
              onClick={(e) => {
                e.stopPropagation();
                setFullscreenIndex((prev) => Math.min(menuList.length - 1, prev + 1));
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
              {menuList.map((_, i) => (
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
    </>
  );
};

// 커스텀 hook을 사용하는 방법
export const useMenuManagement = () => {
  const { user } = useAuth();
  const { get } = useMsg();
  
  const openMenuManagement = useCallback((venueId, onMenuUpdate, onClose) => {
    return (
      <MenuManagement 
        venueId={venueId} 
        onMenuUpdate={onMenuUpdate}
        onClose={onClose}
        user={user}
        get={get}
      />
    );
  }, [user, get]);
  
  return { openMenuManagement };
};

export default MenuManagement; 