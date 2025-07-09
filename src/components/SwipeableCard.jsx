import React, { useState, useRef, useEffect } from 'react';

const SwipeableCard = ({ 
  children, 
  onDelete, 
  onCardClick, 
  deleteText = "삭제",
  swipeThreshold = 40,
  maxSwipeDistance = 80,
  showDeleteIcon = true,
  confirmDelete = false,
  data = null, // 추가: 삭제 시 전달할 데이터
  ...props 
}) => {
  const [isSwiped, setIsSwiped] = useState(false);
  const [startX, setStartX] = useState(0);
  const [currentX, setCurrentX] = useState(0);
  const cardRef = useRef(null);

  const [isDragging, setIsDragging] = useState(false);

  const getClientX = (e) => {
    // 터치 이벤트와 마우스 이벤트 모두 지원
    return e.touches ? e.touches[0].clientX : e.clientX;
  };

  const handleStart = (e) => {
    setStartX(getClientX(e));
    setIsDragging(true);
  };

  const handleMove = (e) => {
    if (!isDragging) return;
    
    const currentX = getClientX(e);
    const diff = startX - currentX;
    
    // 양방향 스와이프 허용
    if (isSwiped) {
      // 이미 스와이프된 상태에서는 왼쪽으로 스와이프하여 닫기 허용
      if (diff < 0) {
        setCurrentX(Math.max(maxSwipeDistance + diff, 0));
      }
    } else {
      // 스와이프되지 않은 상태에서는 오른쪽으로 스와이프하여 열기 허용
      if (diff > 0) {
        setCurrentX(Math.min(diff, maxSwipeDistance));
      }
    }
  };

  const handleEnd = () => {
    setIsDragging(false);
    
    if (isSwiped) {
      // 이미 스와이프된 상태에서
      if (currentX < maxSwipeDistance - swipeThreshold) {
        // 임계값 이상 왼쪽으로 스와이프되면 닫힘
        setIsSwiped(false);
        setCurrentX(0);
      } else {
        // 임계값 미만이면 다시 열린 상태로
        setIsSwiped(true);
        setCurrentX(maxSwipeDistance);
      }
    } else {
      // 스와이프되지 않은 상태에서
      if (currentX > swipeThreshold) {
        // 임계값 이상 스와이프되면 완전히 열림
        setIsSwiped(true);
        setCurrentX(maxSwipeDistance);
      } else {
        // 임계값 미만이면 원래대로
        setIsSwiped(false);
        setCurrentX(0);
      }
    }
  };

  // 터치 이벤트 핸들러
  const handleTouchStart = handleStart;
  const handleTouchMove = handleMove;
  const handleTouchEnd = handleEnd;

  // 마우스 이벤트 핸들러
  const handleMouseDown = (e) => {
    handleStart(e);
    // 전역 마우스 이벤트 리스너 추가
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault(); // 기본 드래그 동작 방지
    handleMove(e);
  };

  const handleMouseUp = (e) => {
    handleEnd();
    // 전역 이벤트 리스너 제거
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  // 컴포넌트 언마운트 시 이벤트 리스너 정리
  useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  const handleDelete = async (e) => {
    e.stopPropagation();
    
    if (confirmDelete) {
      // SweetAlert2를 사용한 확인 다이얼로그
      const { default: Swal } = await import('sweetalert2');
      const result = await Swal.fire({
        title: '정말 삭제하시겠습니까?',
        text: "이 작업은 되돌릴 수 없습니다.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ef4444',
        cancelButtonColor: '#6b7280',
        confirmButtonText: '삭제',
        cancelButtonText: '취소'
      });
      
      if (result.isConfirmed) {
        onDelete?.(data);
      }
    } else {
      onDelete?.(data);
    }
  };

  const handleCardClick = (e) => {
    // 드래그 중이면 클릭 이벤트 무시
    if (isDragging) {
      e.preventDefault();
      return;
    }
    
    if (isSwiped) {
      // 스와이프된 상태에서 카드 클릭 시 닫기
      setIsSwiped(false);
      setCurrentX(0);
    } else {
      onCardClick?.();
    }
  };

  return (
    <div className="swipeable-container" {...props}>
      {/* 삭제 버튼 (배경) */}
      <div className="delete-button" onClick={handleDelete}>
        {showDeleteIcon && <span className="delete-icon">🗑️</span>}
        {deleteText}
      </div>
      
      {/* 카드 (전면) */}
      <div
        ref={cardRef}
        className={`swipeable-card ${isSwiped ? 'swiped' : ''}`}
        style={{
          transform: `translateX(-${currentX}px)`,
          transition: currentX === 0 ? 'transform 0.3s ease' : 'none'
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onClick={handleCardClick}
      >
        {children}
      </div>
    </div>
  );
};

export default SwipeableCard; 