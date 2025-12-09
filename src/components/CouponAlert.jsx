import React, { useState } from "react";
import { Clock, Download } from "lucide-react";
import Swal from "sweetalert2";
import { useMsg } from "@contexts/MsgContext";
import { useAuth } from '@contexts/AuthContext';

import ApiClient from '@utils/ApiClient';




// 스타일 모음
const styles = {
  card: {
    border: "1px dashed #FF6A6A",
     background: "rgba(255, 218, 218, 0.25)",   // 반투명 유리
     backdropFilter: "blur(10px)",              // 핵심: 유리 흐림 효과
    WebkitBackdropFilter: "blur(10px)",        // Safari 지원용
    borderRadius: "20px",
    padding: "10px 13px",
    marginBottom: "14px",
    fontFamily: "Pretendard, sans-serif",
    position: "relative",
    borderLeft: "4px solid #FF5A5A",
     boxShadow: "0 4px 30px rgba(255, 90, 90, 0.2)",
     
  },

  row: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    width: "100%",
  },

  leftCol: {
    flex: 1,
    marginLeft: "8px",
  },

  topRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "4px",
  },

  iconRow: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
  },

  chanceText: {
    fontWeight: 900,
    color: "#423434ff",
    fontSize: "1.1rem",
  },

  remainBadge: {
    backgroundColor: "#FF5A5A",
    color: "white",
    fontSize: "0.5rem",
    padding: "1px 6px",
    borderRadius: "8px",
    fontWeight: 600,
  },

  closeBtnInner: {
    background: "none",
    border: "none",
    fontSize: "18px",
    cursor: "pointer",
    color: "#FF8484",
    marginLeft: "8px",
  },

  middleRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "5px",
  },

  subMessage: {
    fontSize: "0.5rem",
    color: "#A34A4A",
  },

  rightCol: {
    display: "flex",
    alignItems: "center",
    marginLeft: "16px",
    alignSelf: "center",
  },

  issueBtn: {
    background: "linear-gradient(135deg, #ff6a6a, #ff3d3d)",
    border: "none",
    padding: "5px 12px",
    borderRadius: "18px",
    color: "white",
    fontWeight: 800,
    fontSize: "0.95rem",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    boxShadow: "0 4px 12px rgba(255, 60, 60, 0.35)",
  },
  disabledBtn: {
    backgroundColor: "rgb(252 101 101 / 55%)",
    color: "white",
    padding: "6px 15px",
    borderRadius: "20px",
    border: "none",
    fontWeight: 600,
    cursor: "not-allowed",
    whiteSpace: "nowrap",
  },
};

// CouponCard 컴포넌트
const CouponCard = ({ downloaded, remain_cnt, coupon }) => {
  const { get } = useMsg();
  const [visible, setVisible] = useState(true);
  
  // 초기 상태 설정
  const [currentStatus, setCurrentStatus] = useState(
    downloaded ? 'DOWNLOADED' : (remain_cnt > 0 ? "ISSUED" : "RANOUT")
  );
  
  const remain_count = remain_cnt;
  const { user } = useAuth(); // 필요한 부분만 destructuring

  // 편의를 위한 상태 변수
  const isRanout = currentStatus === "RANOUT";

  if (!visible) return null;

  // 발급 버튼 클릭
  const handleIssueCoupon = () => {
    const userId = user?.user_id;

    ApiClient.get('/api/coupon/download', {
      params: { owner_id: userId }
    }).then(res => {
      const { success = true, message = '' } = res;

      if (!success) {
        Swal.fire({
          title: get('coupon.issue.complete.title'),
          text: get(message),
          icon: "error",
          confirmButtonColor: "rgb(55, 65, 81)",
        });
      } else {
        Swal.fire({
          title: get('coupon.issue.complete.title'),
          text: get('coupon.issue.complete.desc'),
          icon: "success",
          confirmButtonColor: "rgb(55, 65, 81)",
        }).then(() => {
          setCurrentStatus("DOWNLOADED");
        });
      }
    });
  };

  // 상태에 따른 동적 값 설정
  const themeColor = isRanout ? "#9CA3AF" : "#FF5A5A"; // 마감이면 회색, 아니면 붉은색
  const statusMessage = isRanout ? get('coupon_limited_msg_end') : get('coupon_limited_msg');

  return (
    <>
      <style>
        {`
          @keyframes wiggle {
            0% { transform: rotate(0deg); }
            25% { transform: rotate(-8deg); }
            50% { transform: rotate(8deg); }
            75% { transform: rotate(-6deg); }
            100% { transform: rotate(0deg); }
          }

          .wiggle-animate {
            animation: wiggle 1.8s ease-in-out infinite;
            transform-origin: 50% 0%;
          }
          
          /* RANOUT 클래스가 붙으면 테두리와 배경을 차분하게 변경 */
          .RANOUT {
            border-color: #E5E7EB !important; /* 연한 회색 테두리 */
            background-color: #F9FAFB !important; /* 아주 연한 회색 배경 */
            opacity: 0.9;
          }
        `}
      </style>
      
      {/* 상태 클래스 적용 */}
      <div className={currentStatus} style={styles.card}>
        <div style={styles.row}>
          {/* 왼쪽 */}
          <div style={styles.leftCol}>
            <div style={styles.topRow}>
              <div style={styles.iconRow}>
                {/* 시계 아이콘 색상 동적 변경 */}
                <Clock
                  size={25}
                  color={themeColor} 
                  className={!isRanout ? "wiggle-animate" : ""} /* 마감되면 흔들림 멈춤 (선택사항) */
                />
                
                {/* 할인율 텍스트 색상 변경 */}
                <span style={{ ...styles.chanceText, color: isRanout ? '#6B7280' : undefined }}>
                  {coupon.discount_value}% {get('profile_coupon_item_label')}
                </span>

                {typeof remain_count === "number" && (
                  <span style={{ 
                      ...styles.remainBadge, 
                      // 마감 시 뱃지도 회색 처리
                      backgroundColor: isRanout ? '#E5E7EB' : '#FEE2E2', 
                      color: isRanout ? '#9CA3AF' : '#EF4444'
                    }}>
                    {remain_count} {get('coupon.remaining.count')}
                  </span>
                )}
              </div>
            </div>

            <div style={styles.middleRow}>
              {/* 기존 조건(remain_count > 0) 제거하고 메시지 항시 노출하되 내용만 변경 */}
              <div style={{
                  ...styles.subMessage,
                  color: themeColor, // 메시지 색상도 테마 컬러 따라감
                  fontWeight: isRanout ? 'normal' : 'bold'
                }}>
                {statusMessage}
              </div>
            </div>
          </div>

          {/* 오른쪽 */}
          <div style={styles.rightCol}>
            {currentStatus === "ISSUED" && remain_count > 0 && (
              <>
                <button style={styles.issueBtn} onClick={handleIssueCoupon}>
                  <Download size={16} style={{ marginRight: 6 }} />
                  {get('coupon.issue.button')}
                </button>
                <button onClick={() => setVisible(false)} style={styles.closeBtnInner}>×</button>
              </>
            )}

            {(currentStatus === "DOWNLOADED" || currentStatus === "USED") && (
              <>
                <button style={styles.disabledBtn} disabled>
                  {get('coupon.issue.done')}
                </button>
                <button onClick={() => setVisible(false)} style={styles.closeBtnInner}>×</button>
              </>
            )}

            {currentStatus === "RANOUT" && (
              <>
                {/* 마감 버튼 스타일: 회색조로 변경 */}
                <button style={{...styles.disabledBtn, backgroundColor: '#D1D5DB', color: '#FFF'}} disabled>
                  {get('coupon.issue.ranout')}
                </button>
                <button onClick={() => setVisible(false)} style={styles.closeBtnInner}>×</button>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};


export default CouponCard;
