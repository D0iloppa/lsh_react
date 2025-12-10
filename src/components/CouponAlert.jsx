import React, { useState } from "react";
import { Clock, Download, Timer } from "lucide-react";
import Swal from "sweetalert2";
import { useMsg } from "@contexts/MsgContext";
import { useAuth } from '@contexts/AuthContext';

import ApiClient from '@utils/ApiClient';

import EventTimer from "@components/EventTimer";




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
    lineHeight: "1",
  },

  middleRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "5px",
  },

  subMessage: {
    fontSize: "0.7rem",
    color: "#A34A4A",
  },

  rightCol: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: "6px",
    marginLeft: "16px",
  },

  issueBtn: {
    background: "linear-gradient(135deg, #ff6a6a, #ff3d3d)",
    border: "none",
    padding: "6px 15px",
    borderRadius: "20px",
    color: "white",
    fontWeight: 800,
    fontSize: "1rem",
    cursor: "pointer",
    boxShadow: "0 4px 12px rgba(255, 60, 60, 0.35)",
    width: "100%"
  },
  disabledBtn: {
    backgroundColor: "rgb(252 101 101 / 55%)",
    color: "white",
    padding: "6px 15px",
    borderRadius: "20px",
    border: "none",
    fontWeight: 800,
    fontSize: "1rem",
    cursor: "not-allowed",
    whiteSpace: "nowrap",
    width: "100%"
  },
  timerRow: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.6)", // 약간 더 밝게 강조
    borderRadius: "12px",
    padding: "6px",
    marginTop: "10px", // 메시지 밑으로 간격 둠
    marginBottom: "4px",
    border: "1px solid #FFCDCD",
  },
  timerText: {
    fontSize: "0.6rem",
    fontWeight: "800",
    color: "#E11D48", // 붉은 계열 강조색
    marginLeft: "6px",
    fontVariantNumeric: "tabular-nums", // 숫자 너비 고정 (시간 흔들림 방지)
  },
  timerLabel: {
    fontSize: "0.6rem",
    color: "#9CA3AF",
    marginRight: "4px",
    marginLeft: "2px",
    fontWeight: "600"
  }
};

// CouponCard 컴포넌트
const CouponCard = ({ downloaded, remain_cnt, coupon, nextOpenDate }) => {

  console.log('cpCard');

  
  const { get } = useMsg();
  const [visible, setVisible] = useState(true);
  const remain_count = typeof remain_cnt === "number" ? remain_cnt : 0;
  // 초기 상태 설정
 const initialStatus = downloaded
  ? "DOWNLOADED"
  : remain_count > 0
    ? "ISSUED"
    : "RANOUT";

const [currentStatus, setCurrentStatus] = useState(initialStatus);
  
  
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
          title: get('coupon_download_fail_title'),
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
            opacity: 0.95;
          }
        `}
      </style>
      
      <div className={currentStatus} style={styles.card}>
      {/* 상단 정보 영역 */}
      <div style={styles.row}>
        <div style={styles.leftCol}>
          
          {/* 아이콘/타이틀 */}
          <div style={styles.topRow}>
            <div style={styles.iconRow}>
              <Clock size={25} color={themeColor} className={!isRanout ? "wiggle-animate" : ""} />

              <span style={{ ...styles.chanceText, color: isRanout ? '#6B7280' : undefined }}>
                {coupon.discount_value}% {get('profile_coupon_item_label')}
              </span>

              {/* remain_count는 숫자가 아니어도 0으로 처리했으므로 항상 표시 가능 */}
              <span style={{
                ...styles.remainBadge,
                backgroundColor: isRanout ? '#E5E7EB' : '#FEE2E2',
                color: isRanout ? '#9CA3AF' : '#EF4444'
              }}>
                {remain_count} {get('coupon.remaining.count')}
              </span>
            </div>
            {/*<button style={{display:'none'}} onClick={() => setVisible(false)} style={{styles.closeBtnInner}}>×</button>*/}
            <button onClick={() => setVisible(false)} style={{display:'none'}}>×</button>
          </div>

          {/* 메시지 영역 */}
          <div style={styles.middleRow}>
            <div style={{
              ...styles.subMessage,
              color: themeColor
            }}>
              {isRanout ? get('coupon_limited_msg_end') : get('coupon_limited_msg')}
            </div>
          </div>

          {/* [NEW] 타이머 컴포넌트 삽입 영역 */}
          {/* isRanout이고, 다음 오픈 시간이 있을 때만 렌더링 */}
          {isRanout && nextOpenDate && (
            <div style={styles.timerRow}>
               <Timer size={16} color="#E11D48" />
               <span style={styles.timerLabel}>{get('coupon_next_open_left_msg')}</span>
               <div style={styles.timerText}>
                  <EventTimer targetDate={nextOpenDate} />
               </div>
            </div>
          )}

        </div>
      </div>

      {/* 버튼을 카드 하단으로 이동 */}
      <div style={{ marginTop: 12, display: "flex", justifyContent: "space-between" }}>
        {currentStatus === "ISSUED" && remain_count > 0 && (
          <>
            <button style={styles.issueBtn} onClick={handleIssueCoupon}>
              <Download size={16} style={{ marginRight: 6 }} />
              {get('coupon.issue.button')}
            </button>
          </>
        )}

        {(currentStatus === "DOWNLOADED" || currentStatus === "USED") && (
          <>
            <button style={styles.disabledBtn} disabled>
              {get('coupon.issue.done')}
            </button>
          </>
        )}

        {isRanout && (
          <>
            <button style={{ ...styles.disabledBtn, backgroundColor: '#D1D5DB', color: '#FFF' }} disabled>
              {get('coupon.issue.ranout')}
            </button>
          </>
        )}
      </div>

    </div>
    </>
  );
};


export default CouponCard;
