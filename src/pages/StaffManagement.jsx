import React, { useState, useEffect} from 'react';
import SketchHeader from '@components/SketchHeader';
import SketchBtn from '@components/SketchBtn';
import SketchDiv from '@components/SketchDiv';
import HatchPattern from '@components/HatchPattern';
import ToggleRadio from '@components/ToggleRadio';
import '@components/SketchComponents.css';
import { useAuth } from '@contexts/AuthContext';
import { useMsg, useMsgGet, useMsgLang } from '@contexts/MsgContext';
import ApiClient from '@utils/ApiClient';
import { Star, Users } from 'lucide-react';

import Swal from 'sweetalert2';


const StaffManagement = ({  navigateToPage, navigateToPageWithData, PAGES, goBack, pageData, ...otherProps }) => {

  //console.log("PAGES", PAGES)

  const { user } = useAuth();
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(false);
  const { messages, isLoading, error, get, currentLang, setLanguage, availableLanguages, refresh } = useMsg();

// 스태프 토글 상태 변경 핸들러
const handleStaffToggle = async (staff, newToggleState) => {
  const newStatus = newToggleState ? 'active' : 'on_leave';
  const actionText = newStatus === 'active' 
    ? get('STAFF_ACTION_ACTIVATE') 
    : get('STAFF_ACTION_DEACTIVATE');
  
  const confirmText = newStatus === 'active' 
    ? get('STAFF_CONFIRM_ACTIVATE') 
    : get('STAFF_CONFIRM_DEACTIVATE');
  
  // 확인창 표시
  const result = await Swal.fire({
    title: get('STAFF_STATUS_CHANGE_TITLE'),
    text: confirmText,
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: actionText,
    cancelButtonText: get('STAFF_CANCEL_BUTTON'),
    confirmButtonColor: newStatus === 'active' ? '#10b981' : '#ef4444',
    cancelButtonColor: '#6b7280'
  });

   if (!result.isConfirmed) {
    // 취소 시 목록 새로고침으로 원래 상태로 되돌리기
    await loadStaffList();
    return;
  }

  try {
    const response = await ApiClient.postForm('/api/updateStaffStatus', {
      staff_id: staff.staff_id,
      venue_id: user.venue_id,
      status: newStatus
    });

    console.log(`Staff ${actionText} 응답:`, response);

    // 성공 시 목록 다시 불러오기
    await loadStaffList();
    
    const successMessage = newStatus === 'active' 
      ? get('STAFF_ACTIVATE_SUCCESS') 
      : get('STAFF_DEACTIVATE_SUCCESS');
    
    Swal.fire({
      title: get('SWAL_SUCCESS_TITLE'),
      text: successMessage,
      icon: 'success',
      confirmButtonText: get('SWAL_CONFIRM_BUTTON'),
      confirmButtonColor: '#10b981'
    });
  } catch (error) {
    console.error(`Staff ${actionText} 실패:`, error);
    
    const errorMessage = newStatus === 'active' 
      ? get('STAFF_ACTIVATE_ERROR') 
      : get('STAFF_DEACTIVATE_ERROR');
    
    Swal.fire({
      title: get('SWAL_ERROR_TITLE'),
      text: errorMessage,
      icon: 'error',
      confirmButtonText: get('SWAL_CONFIRM_BUTTON'),
      confirmButtonColor: '#ef4444'
    });
    
    // 실패 시 목록 새로고침으로 원래 상태로 되돌리기
    await loadStaffList();
  }
};

const renderStars = (rating) => {
  // null이나 undefined인 경우 0으로 처리
  const numRating = rating || 0;
  
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
      {[...Array(5)].map((_, i) => {
        const starValue = i + 1;
        let fillPercentage = 0;
        
        if (numRating >= starValue) {
          fillPercentage = 100; // 완전히 채워진 별
        } else if (numRating > i) {
          fillPercentage = (numRating - i) * 100; // 부분적으로 채워진 별
        }
        
        return (
          <div key={i} style={{ position: 'relative', display: 'inline-block' }}>
            {/* 배경 별 (빈 별) */}
            <Star
              size={14}
              fill="none"
              color="#d1d5db"
              style={{ display: 'block' }}
            />
            {/* 채워진 별 (오버레이) */}
            {fillPercentage > 0 && (
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: `${fillPercentage}%`,
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <Star
                  size={14}
                  fill="#fbbf24"
                  color="#fbbf24"
                  style={{ minWidth: '14px' }}
                />
              </div>
            )}
          </div>
        );
      })}
      <span style={{ marginLeft: '6px', fontSize: '0.85rem', color: '#666' }}>
        {numRating ? numRating.toFixed(1) : '0.0'}
      </span>
    </div>
  );
};

// API 데이터를 UI용 데이터로 변환하는 함수
const transformStaffData = (apiData) => {
  console.log('Raw API data for debugging:', apiData);
  
  return apiData.map(item => {
    console.log('Processing staff item:', item);
    console.log('Available fields:', Object.keys(item));
    console.log('Status field value:', item.status);
    
    // image_url과 images를 합쳐서 images 배열 생성
    const combinedImages = [];
    if (item.image_url) {
      combinedImages.push(item.image_url);
    }
    if (item.images && Array.isArray(item.images)) {
      combinedImages.push(...item.images);
    }
    
    return {
      id: item.staff_id,
      birth_year:item.birth_year,
      name: item.name || 'Unknown Staff',
      rating: item.avg_rating || 0,
      img: item.image_url || '',
      staff_id: item.staff_id,
      login_id: item.login_id,
      contact: item.contact,
      venue_id: item.venue_id,
      created_at: item.created_at,
      image_url:item.image_url,
      images: combinedImages, // image_url과 images를 합친 배열
      description:item.description,
      // 여러 가능성을 체크해서 status 설정
      status: item.status || 
              (item.is_active ? 'active' : 'on_leave') || 
              item.staff_status || 
              item.state || 
              'active' // 최종 기본값
    };
  });
};

// 스태프 추가 버튼 클릭 핸들러
const handleAddStaff = () => {
 navigateToPage(PAGES.CREATE_STAFF)
};

// 스태프 정보 보기 핸들러
const handleViewStaff = (staff) => {
  console.log('View staff info:', staff);
  navigateToPageWithData(PAGES.STAFFDETAIL, staff );
};

// 스태프 수정 핸들러
const handleEditStaff = (staff) => {
  console.log('Edit staff:', staff);
  
  // TODO: 스태프 수정 페이지로 이동
  navigateToPageWithData(PAGES.EDIT_STAFF,  {staff} );
};

// 스태프 삭제 핸들러
const handleDeleteStaff = async (staff) => {
  console.log('Delete staff:', staff);
  
  // 삭제 확인 다이얼로그
  const result = await Swal.fire({
    title: get('STAFF_DELETE_CONFIRM_TITLE'),
    text: get('STAFF_DELETE_CONFIRM_TEXT').replace('{name}', staff.name),
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: get('STAFF_DELETE_BUTTON'),
    cancelButtonText: get('STAFF_CANCEL_BUTTON'),
    confirmButtonColor: '#ef4444',
    cancelButtonColor: '#6b7280'
  });

  if (result.isConfirmed) {
    try {
      // TODO: 실제 삭제 API 호출
      // const response = await ApiClient.postForm('/api/deleteStaff', {
      //   staff_id: staff.staff_id,
      //   venue_id: user.venue_id
      // });

      await ApiClient.get('/api/staffDelete', {
        params: { staff_id: staff.staff_id }
      });

      
      console.log('Staff deleted successfully');
      
      // 성공 메시지 표시
      Swal.fire({
        title: get('SWAL_SUCCESS_TITLE'),
        text: get('STAFF_DELETE_SUCCESS'),
        icon: 'success',
        confirmButtonText: get('SWAL_CONFIRM_BUTTON'),
        confirmButtonColor: '#10b981'
      });
      
      // 목록 새로고침
      await loadStaffList();
    } catch (error) {
      console.error('Failed to delete staff:', error);
      
      Swal.fire({
        title: get('SWAL_ERROR_TITLE'),
        text: get('STAFF_DELETE_ERROR'),
        icon: 'error',
        confirmButtonText: get('SWAL_CONFIRM_BUTTON'),
        confirmButtonColor: '#ef4444'
      });
    }
  }
};

// 스태프 목록 로드 함수
const loadStaffList = async () => {
  if (!user?.venue_id) {
    console.warn('No venue_id found in user data');
    return;
  }

  setLoading(true);
  try {
    const response = await ApiClient.get('/api/getStaffList_mng', {
      params: { venue_id: user.venue_id }
    });

    console.log('Staff API response:', response);

    // API 응답 처리 (배열 직접 반환 또는 data 프로퍼티)
    let apiData = null;
    
    if (Array.isArray(response)) {
      apiData = response;
      console.log('Using response directly as array');
    } else if (response && response.data && Array.isArray(response.data)) {
      apiData = response.data;
      console.log('Using response.data as array');
    }
    
    if (apiData && apiData.length >= 0) {

      const _availList = apiData;

      // status가 "deleted"인 항목들 제외
      const filteredList = _availList.filter(staff => staff.status !== 'deleted');

      const transformedData = transformStaffData(filteredList);
      // created_at 기준으로 정렬 (오래된 순서대로 = 등록 순서)
      const sortedData = transformedData.sort((a, b) => a.created_at - b.created_at);
      setStaffList(transformedData);
    } else {
      console.log('No staff data found');
      setStaffList([]);
    }

  } catch (error) {
    console.error('Failed to load staff list:', error);
    // 에러 시 mock 데이터 사용 (개발 중에만)
    // setStaffList(mockStaffs);
    setStaffList([]);
  } finally {
    setLoading(false);
  }
};

  // 컴포넌트 마운트 시 스태프 목록 로드
  useEffect(() => {
    loadStaffList();
  }, [user?.venue_id]); // venue_id가 변경될 때만 실행

  return (
    <>
      <style jsx="true">{`
        .staff-container {
          max-width: 28rem;
          margin-bottom: 1rem;
          background: #fff;
          min-height: 100vh;
          font-family: 'BMHanna', 'Comic Sans MS', cursive, sans-serif;
        }
        .add-btn-row {
          display: flex;
          justify-content: flex-end;
          margin: 1.5rem 0 1rem 0;
        }
        .staff-list {
          display: flex;
          flex-direction: column;
          gap: 0.7rem;
        }
        .staff-card {
          position: relative;
          background: #fff;
          padding: 0.7rem 0.8rem;
          display: flex;
          align-items: center;
          gap: 0.7rem;
        }
        .staff-img {
          width: 70px;
          height: 70px;
          background: #f3f4f6;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2.1rem;
          color: #bbb;
          overflow: hidden;
        }
        .staff-img img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 6px;
          object-position: top;
        }
        .staff-info {
          flex: 1;
          margin-top: 2rem;
        }
        .staff-name {
          font-size: 1.02rem;
          font-weight: 600;
          margin-bottom: 0.1rem;
        }
        .staff-rating {
          font-size: 0.92rem;
          color: #222;
          white-space: nowrap;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          text-overflow: ellipsis;
          line-height: 1.5em;
          max-height: 3em;
        }
        .staff-actions {
          display: flex;
          align-items: center;
        }
        .action-btn {
          min-width: 38px;
          font-size: 1.1rem;
          padding: 0.18rem 0.5rem;
        }
        .loading-message {
          text-align: center;
          padding: 2rem;
          color: #666;
        }
        .no-staff-message {
          text-align: center;
          padding: 2rem;
          color: #888;
          font-size: 0.95rem;
        }
      `}</style>
          <div className="staff-container">
          <SketchHeader
            title={
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Users size={18} />
                {get('STAFF_MANAGEMENT_PAGE_TITLE')}
              </span>
            }
            showBack={true}
            onBack={goBack}
          />
          
          <div className="add-btn-row">
            <SketchBtn 
              variant="primary" 
              size="medium" 
              style={{padding: '0', fontSize: '14px', padding:'0.75rem 1rem'}} 
              onClick={handleAddStaff}
            >
              {get('STAFF_ADD_BUTTON')}
              <HatchPattern opacity={0.8} />
            </SketchBtn>
          </div>
          
          {loading ? (
            <div className="loading-message">{get('STAFF_LOADING_MESSAGE')}</div>
          ) : (
            <div className="staff-list">
              {staffList.length === 0 ? (
                <div className="no-staff-message">
                  {get('STAFF_NO_STAFF_TITLE')}
                  <br />
                  {get('STAFF_NO_STAFF_SUBTITLE')}
                </div>
              ) : (
                staffList.map(staff => (
                  <SketchDiv key={staff.id} className="staff-card">
                    <HatchPattern opacity={0.4} />
                    <div className="staff-img">
                      {staff.img ? (
                        <img src={staff.img} alt={staff.name} />
                      ) : (
                        <span>X</span>
                      )}
                    </div>
                    <div className="staff-info">
                      <div className="staff-name">{staff.name}</div>
                      <div className="staff-rating">
                        {renderStars(staff.rating)}
                      </div>
                    </div>
                    
                    {/* 스태프 액션 버튼들 - 상단에 배치 */}
                    <div style={{ 
                      position: 'absolute', 
                      top: '8px', 
                      right: '8px', 
                      display: 'flex', 
                      gap: '4px' 
                    }}>
                      
                      <button
                        onClick={() => handleViewStaff(staff)}
                        style={{
                          padding: '4px 8px',
                          border: '1px solid #e5e7eb',
                          borderRadius: '6px',
                          background: 'transparent',
                          color: '#6b7280',
                          fontSize: '12px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontFamily: 'inherit',
                          fontWeight: '500'
                        }}
                        title={get('STAFF_VIEW_BUTTON') || '정보'}
                      >
                        {get('STAFF_VIEW_BUTTON') || '정보'}
                      </button>


                      <button
                        onClick={() => handleEditStaff(staff)}
                        style={{
                          padding: '4px 8px',
                          border: '1px solid #e5e7eb',
                          borderRadius: '6px',
                          background: 'transparent',
                          color: '#6b7280',
                          fontSize: '12px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontFamily: 'inherit',
                          fontWeight: '500'
                        }}
                        title={get('STAFF_EDIT_BUTTON') || '수정'}
                      >
                        {get('STAFF_EDIT_BUTTON') || '수정'}
                      </button>
                      
                      <button
                        onClick={() => handleDeleteStaff(staff)}
                        style={{
                          padding: '4px 8px',
                          border: '1px solid #e5e7eb',
                          borderRadius: '6px',
                          background: 'transparent',
                          color: '#ef4444',
                          fontSize: '12px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontFamily: 'inherit',
                          fontWeight: '500'
                        }}
                        title={get('STAFF_DELETE_BUTTON') || '삭제'}
                      >
                        {get('STAFF_DELETE_BUTTON') || '삭제'}
                      </button>
                      
                    </div>
                    
                    {/* 근무 토글 버튼 - 아래로 내림 */}
                    <div className="staff-actions" style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '8px', 
                      marginTop: '4px',
                      position: 'absolute',
                      bottom: '25px',
                      right: '8px'
                    }}>
                      <ToggleRadio 
                        checked={staff.status === 'active'}
                        onChange={(newState) => handleStaffToggle(staff, newState)}
                        disabled={loading}
                      />
                      <span style={{ color: staff.status === 'active' ? 'green' : 'red' }}>{staff.status === 'active' ? get('SCHEDULE_MODAL_ON') : get('SCHEDULE_MODAL_LEAVE')}</span>
                    </div>
                  </SketchDiv>
                ))
              )}
            </div>
          )}
        </div>
    </>
  );
};

export default StaffManagement;