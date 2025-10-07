import React, { useState, useEffect, useRef, useCallback } from 'react';
import HatchPattern from '@components/HatchPattern';
import SketchInput from '@components/SketchInput';
import ImagePlaceholder from '@components/ImagePlaceholder';
import '@components/SketchComponents.css';

import SketchHeader from '@components/SketchHeaderMain'
import SketchDiv from '@components/SketchDiv'
import SketchBtn from '@components/SketchBtn'
import { useMsg, useMsgGet, useMsgLang } from '@contexts/MsgContext';
import ApiClient from '@utils/ApiClient';
import LoadingScreen from '@components/LoadingScreen';
import { Heart, Filter, Martini, Store, User, ShieldCheck, Pencil, Trash2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

import { Star, Edit3 } from 'lucide-react';
import axios from 'axios';

import Swal from 'sweetalert2';

// Font Awesome (FaGoogle)
import { FaGoogle } from 'react-icons/fa';
// 또는 Simple Icons (브랜드 로고에 더 충실)
import { SiGoogle } from 'react-icons/si';

const ViewReviewPage = ({
  navigateToPageWithData,
  navigateToPage,
  PAGES,
  venueData = {
    name: 'Modern Bar',
    subtitle: 'The Rooftop',
    description: 'A chic rooftop bar offering panoramic views.',
    image: '/placeholder-venue.jpg'
  },
  goBack,
  ...otherProps
}) => {

  const venueId = otherProps?.venueId || null;
  const fromMyReview = otherProps?.fromMyReview || false;

  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  console.log("venueId", venueId)
  const [userImages, setUserImages] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder1, setSortOrder1] = useState('latest'); // 정렬 순서
  const [sortOrder, setSortOrder] = useState('latest'); // 정렬 순서

  const [targetTypeFilter, setTargetTypeFilter] = useState('ALL'); // 타겟 타입 필터
  const [originalReviews, setOriginalReviews] = useState([]); // 원본 데이터 보관
  const { messages, isLoading, error, get, currentLang, setLanguage, availableLanguages, refresh } = useMsg();
  const API_HOST = import.meta.env.VITE_API_HOST;
  const { user, isActiveUser, iauMasking, fetchFavorits, exts: { venueCatMap }  } = useAuth();
  const [iauData, setIauData] = useState(null);
  

  const [translationMap, setTranslationMap] = useState({});
  const [showTranslateIcon, setShowTranslateIcon] = useState({});
  
  const longPressTimer = useRef(null);

  
  // 번역 아이콘 표시 (꾹 눌렀을 때)
const handleLongPress = useCallback((reviewId) => {
  setShowTranslateIcon(prev => ({
    ...prev,
    [reviewId]: true,
  }));
}, []);

// 번역 실행
const handleTranslate = useCallback(async (reviewId, text) => {
  if (translationMap[reviewId]) return; // 이미 번역됨

  try {

    console.log("1234", user);

    let language=currentLang;
    
    if ( language == 'kr') language='ko';
    if ( language == 'cn') language='zh';
    
    const response = await axios.post(
      `https://translation.googleapis.com/language/translate/v2?key=AIzaSyAnvkb7_-zX-aI8WVw6zLMRn63yQQrss9c`,
      {
        q: text,
        target: language || 'vi',  // 사용자 언어 기준 (없으면 베트남어)
        format: 'text',
      }
    );

    const translated = response.data.data.translations[0].translatedText;

    setTranslationMap(prev => ({
      ...prev,
      [reviewId]: translated,
    }));
  } catch (error) {
    console.error('❌ 번역 실패:', error);
    Swal.fire('번역 오류', 'Google Translate API 호출에 실패했습니다.', 'error');
  }
}, [translationMap, user.language]);


  useEffect(() => {


    if (messages && Object.keys(messages).length > 0) {
      console.log('✅ Messages loaded:', messages);
      window.scrollTo(0, 0);
    }
  }, [messages, currentLang]);


  const handleReservation = (review) => {
    console.log('Rebook clicked:', review);
    navigateToPageWithData && navigateToPageWithData(PAGES.RESERVATION, {
      target: review.target_type,
      id: (review.target_type == 'venue') ? review.venue_id : review.target_id,
      staff: (review.target_type == 'staff') ? { name : review.targetName} : {}
    });
  };

  const handleViewDetail = (review) => {

      const container = document.querySelector('.content-area');

    if (container) {
      localStorage.setItem("viewReviewPageState", JSON.stringify({
      scrollY: container.scrollTop,
      sortOrder1,
      sortOrder,
      targetTypeFilter
    }));
    }

    let savedState =localStorage.getItem("viewReviewPageState");
    console.log("set scrollY",savedState);

    
  console.log('View detail clicked:', review);
  
  if (review.target_type === 'venue') {
    // venue인 경우 VIEWREVIEW 페이지로 이동
    navigateToPageWithData && navigateToPageWithData(PAGES.DISCOVER, {
      venueId: review.venue_id
    });
  } else if (review.target_type === 'staff') {
    // staff인 경우 STAFFDETAIL 페이지로 이동
    navigateToPageWithData && navigateToPageWithData(PAGES.STAFFDETAIL, {
      staff_id: review.target_id,
      image_url: review.image_url,
      fromReview: true
    });
  }
};

  const applyFiltersAndSort = () => {

    console.log('filter', otherProps);

    const { reservationId = false, clientId = false, target, targetId } = otherProps

    let userFilter = false;
    if (reservationId && clientId) userFilter = true;

    let filtered = [...originalReviews];

    // 타겟 타입 필터링
    if (targetTypeFilter !== 'ALL') {
      filtered = filtered.filter(review => review.target_type === targetTypeFilter);
    }

    if (userFilter) {
      // filtered = filtered.filter(review => review.user_id == clientId);
      filtered = filtered.filter(review => review.reservation_id == reservationId);
    }

    console.log('tt', filtered);

    // 날짜 정렬
    filtered.sort((a, b) => {


      switch (sortOrder1) {
        case 'rating_high':
          return b.rating - a.rating;   // 평점 높은순
        case 'rating_low':
          return a.rating - b.rating;   // 평점 낮은순
        case 'latest': {
          const dateA = new Date(a.created_at);
          const dateB = new Date(b.created_at);
          return dateB - dateA;         // 최신순
        }
        case 'oldest': {
          const dateA = new Date(a.created_at);
          const dateB = new Date(b.created_at);
          return dateA - dateB;         // 오래된순
        }
        default:
          return 0;
      }


      /*
      // 1차 정렬: 평점
      let ratingSort = 0;
      if (sortOrder1 === 'rating_high') {
        ratingSort = b.rating - a.rating;
      } else if (sortOrder1 === 'rating_low') {
        ratingSort = a.rating - b.rating;
      }

      // 평점이 다르면 평점으로 정렬
      if (ratingSort !== 0) {
        return ratingSort;
      }

      // 평점이 같으면 날짜로 정렬
      const dateA = new Date(a.created_at);
      const dateB = new Date(b.created_at);

      return sortOrder === 'latest' ? dateB - dateA : dateA - dateB;
      */

    });

    setReviews(filtered);
  };

  useEffect(() => {
    applyFiltersAndSort();
  }, [sortOrder, sortOrder1, targetTypeFilter, originalReviews]);

  // ViewReview
  useEffect(() => {
    const loadVenueReviews = async () => {
      //if (!venueId) return;

      try {
        setLoading(true);

      // venueCatMap 데이터 가져오기
      const vcm = await venueCatMap();

      // localStorage에서 현재 테마/카테고리 읽기
      const themeSource = localStorage.getItem('themeSource'); // 'BARLIST' or 'MASSAGELIST'


        const fvrs = (await fetchFavorits()).map(item => ({
          target_type: item.target_type,
          target_id: item.target_id
        }));
        

        const vnFvrs = fvrs.filter(item => item.target_type === 'venue').map(item => item.target_id);
        const stfFvrs = fvrs.filter(item => item.target_type === 'staff').map(item => item.target_id);

        const vnFvrsSet = new Set(vnFvrs);
        const staffFvrsSet = new Set(stfFvrs);



        const response = await ApiClient.postForm('/api/getVenueReviewList', {
          venue_id: venueId || -1
        });
        
        
        const iau = await isActiveUser();
        console.log('IAU:', iau);
        
        setIauData(iau);

        let reviewsData = response.data || [];
        
        reviewsData = reviewsData.map(item =>  {

           const catInfo = vcm.find(v => v.venue_id === item.venue_id);

          return {
          ...item,
          isFavorite: item.target_type == 'venue' ? 
                    vnFvrsSet.has(item.venue_id) : 
                    staffFvrsSet.has(item.target_id),
          cat_nm: catInfo ? catInfo.cat_nm : null, // 없으면 null
          cat_id: catInfo ? catInfo.cat_id : null, // 없으면 null
         };
    });



        console.log("reviewsData", reviewsData, vnFvrsSet, staffFvrsSet);

        let filteredReviews = reviewsData;
        if (themeSource === 'BARLIST') {
          filteredReviews = reviewsData.filter(r => r.cat_id === 1);
        } else if (themeSource === 'MASSAGELIST') {
          filteredReviews = reviewsData.filter(
            r => r.cat_id === 2 || r.cat_id === 3
          );
        }

        setOriginalReviews(filteredReviews);
        setReviews(filteredReviews);

        // 유니크한 user_id들 추출
        const userIds = [...new Set(filteredReviews.map(review => review.user_id))];

        // 모든 유저 정보를 병렬로 요청
        /*const userPromises = userIds.map(userId =>
          axios.get(`${API_HOST}/api/getUserInfo`, {
            params: { user_id: userId }
          }).catch(error => {
            console.error(`유저 ${userId} 정보 실패:`, error);
            return { data: { image_url: '/placeholder-user.jpg' } };
          })
        );

        const userResponses = await Promise.all(userPromises);

        const userImagesData = {};
        userIds.forEach((userId, index) => {
          userImagesData[userId] = userResponses[index].data?.image_url || '/placeholder-user.jpg';
        });

        console.log("userImagesData", userImagesData)

        setUserImages(userImagesData);
*/
      } catch (error) {
        console.error('리뷰 로딩 실패:', error);
        setReviews([]);
      } finally {
        setLoading(false);
      }
    };


    loadVenueReviews();
  }, [venueId]);

   useEffect(() => {
    if (!loading && reviews.length > 0) {
      const savedState = localStorage.getItem("viewReviewPageState");

      if (savedState) {
        const { scrollY, sortOrder1, sortOrder, targetTypeFilter } = JSON.parse(savedState);
        
        if (sortOrder1) setSortOrder1(sortOrder1); 
        if (sortOrder) setSortOrder(sortOrder);
        if (targetTypeFilter) setTargetTypeFilter(targetTypeFilter);

        
        const container = document.querySelector('.content-area');
        
        if (container) {
          container.scrollTop = scrollY;
        }
      }
    }
  }, [loading, reviews]);

  // utils.js 같은 곳에 빼도 되고, 컴포넌트 안에 선언해도 됨
const renderUserName = (userName) => {
  if (userName === '레탄톤 보안관') {
    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          fontWeight: 300,
          color: '#fff',
          backgroundColor: '#374151',  // Tailwind gray-700
          padding: '4px 10px',
          borderRadius: '20px',
          fontSize: '10px',
          boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
        }}
      >
        🎖️ 레탄톤 보안관 꿀팁
      </span>
    );
  }

  const GoogleG = ({ size = 12 }) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 256 262"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
      style={{ display: 'block' }}
    >
      <path fill="#4285F4" d="M255.88 133.51c0-10.6-.86-18.34-2.73-26.37H130.5v47.9h71.88c-1.45 12.3-9.3 30.78-26.76 43.23l-.24 1.62 38.86 30.12 2.69.27c24.72-22.8 38.95-56.45 38.95-97.77"/>
      <path fill="#34A853" d="M130.5 261.1c35.27 0 64.94-11.64 86.59-31.74l-41.27-32.03c-11.04 7.76-25.83 13.18-45.32 13.18-34.62 0-64-22.73-74.45-54.29l-1.54.13-40.35 31.23-.53 1.47C34.13 231.8 78.54 261.1 130.5 261.1"/>
      <path fill="#FBBC05" d="M56.05 155.22c-2.78-8.03-4.38-16.64-4.38-25.44 0-8.8 1.6-17.41 4.25-25.44l-.07-1.7-40.78-31.65-1.33.63C4.98 88.31 0 109.15 0 129.78c0 20.63 4.98 41.47 13.74 58.16l42.31-32.72"/>
      <path fill="#EA4335" d="M130.5 50.52c24.56 0 41.1 10.62 50.54 19.5l36.84-35.97C195.39 12.6 165.77 0 130.5 0 78.54 0 34.13 29.3 13.74 71.62l42.31 32.72C66.5 73.25 95.88 50.52 130.5 50.52"/>
    </svg>
  );

  if(userName === 'GOOGLE REVIEW'){
    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          padding: '4px 10px',
          borderRadius: 20,
          backgroundColor: '#fff',             // ✅ 흰색 배지
          color: '#111827',                    // gray-900 계열 텍스트
          border: '1px solid #E5E7EB',         // gray-200 보더
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          fontSize: 10,
          fontWeight: 500,
          lineHeight: 1,
        }}
      >
          <GoogleG size={12} />
         {/* <SiGoogle size={12} /> */}
         GOOGLE REVIEW
      </span>
    );
  }

  if (userName) {
    return userName.charAt(0) + '***';
  }

  return '';
};



  const handleEditReview = (review) => {
    console.log('Edit review:', review);

    navigateToPageWithData && navigateToPageWithData(PAGES.SHARE_EXP, {
      mode:'edit',
      review:review,

      reservation_id:review.reservation_id,
      image:review.targetImage,
      user_id:review.user_id,
      target:review.target_type,
      target_id:review.target_id,
      targetName:review.targetName
    });



    /*
    Swal.fire({
      title: '리뷰 수정',
      html: `
        <div style="display: flex; flex-direction: column; gap: 12px; text-align: left;">
          <label style="font-size: 14px;">평점</label>
          <div id="star-rating" style="display: flex; gap: 5px; font-size: 22px; cursor: pointer;">
            ${[1,2,3,4,5].map(i => `
              <span data-value="${i}" style="color: ${i <= review.rating ? '#facc15' : '#d1d5db'};">★</span>
            `).join('')}
          </div>
          
          <label style="font-size: 14px;">리뷰 내용</label>
          <textarea id="review-content" 
            class="swal2-textarea"
            style="width: 82%; height: 80px; font-size: 14px;"
          >${review.content !== '-' ? review.content : ''}</textarea>
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: '수정하기',
      cancelButtonText: '취소',
      didOpen: () => {
        const stars = Swal.getPopup().querySelectorAll('#star-rating span');
        stars.forEach(star => {
          star.addEventListener('click', () => {
            const val = parseInt(star.getAttribute('data-value'));
            stars.forEach((s, idx) => {
              s.style.color = (idx < val) ? '#facc15' : '#d1d5db';
            });
            Swal.getPopup().setAttribute('data-rating', val);
          });
        });
        // 초기 평점 저장
        Swal.getPopup().setAttribute('data-rating', review.rating);
      },
      preConfirm: () => {
        const rating = parseInt(Swal.getPopup().getAttribute('data-rating'), 10);
        const content = Swal.getPopup().querySelector('#review-content').value.trim();
  
        if (!rating || !content) {
          Swal.showValidationMessage(`평점과 리뷰 내용을 모두 입력해주세요.`);
          return false;
        }
  
        return { rating, content };
      }
    }).then((result) => {
      if (result.isConfirmed) {
        const payload = {
          review_id: review.review_id,
          rating: result.value.rating,
          content: result.value.content,
        };
        console.log('수정된 리뷰 payload:', payload);
        // 👉 API 호출은 여기서 따로 구현하면 됨
      }
    });

  */

  };

  const handleDeleteReview = async (reviewId) => {
    console.log('Delete review:', reviewId);

    try {
      // 삭제 확인 다이얼로그
      const result = await Swal.fire({
        title: get('REVIEW_DELETE_CONFIRM'),
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: get('PROMOTION_DELETE_BUTTON'),
        cancelButtonText: get('Reservation.CancelButton')
      });
      
      if (!result.isConfirmed) {
        return; // 사용자가 취소한 경우
      }
  
      const response = await ApiClient.postForm('/api/deleteReview', {
        user_id: user.user_id,
        review_id: reviewId
      });
      
      if (response == 1) {
        await Swal.fire({
          title: get('REVIEW_DELETE_SUCCESS'),
          icon: 'success',
          confirmButtonText: get('SWAL_CONFIRM_BUTTON')
        });
        goBack && goBack();
      } else {
        throw new Error(`서버 오류: ${response.status}`);
      }
    } catch (error) {
      console.error('리뷰 삭제 실패:', error);
      await Swal.fire({
        title: get('REVIEW_DELETE_ERROR'),
        icon: 'error',
        confirmButtonText: get('SWAL_CONFIRM_BUTTON')
      });
    }
    
  };

  const handleNotifications = () => {
    console.log('Notifications 클릭');
    navigateToPageWithData && navigateToPageWithData(PAGES.NOTIFICATIONS);
  };

  const handleBack = () => {
    if(fromMyReview){
      goBack && goBack();
    } else if (venueId) {
      goBack && goBack();
    } else{
       const rankingFromPage = localStorage.getItem('themeSource');
      console.log("rankingFromPage", rankingFromPage);

      switch (rankingFromPage) {
        case 'BARLIST':
          localStorage.removeItem('themeSource');
          navigateToPage(PAGES.BARLIST);
          break;
        case 'MASSAGELIST':
          localStorage.removeItem('themeSource');
          navigateToPage(PAGES.MASSAGELIST);
          break;
        default:
          navigateToPage(PAGES.HOME);
          break;
      }
    }
  };
  

  const handleSearch = (e) => {
    e.preventDefault();
    console.log('Search:', searchQuery);
    // 검색 로직
  };

 const renderStars = (rating) => {
  return (
    <>
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          size={14}
          fill={i < rating ? '#fbbf24' : 'none'}
          color={i < rating ? '#fbbf24' : '#d1d5db'}
          style={{ marginRight: 2 }}
        />
      ))}
    </>
  );
};


  return (
    <>
      <style jsx="true">{`
        .view-review-container {
          max-width: 28rem;
          margin: 0 auto;
          background-color: white;
          position: relative;
          margin: 1rem;
          font-family: 'BMHanna', 'Comic Sans MS', cursive, sans-serif;
        }

        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          border-bottom: 3px solid #1f2937;
          background-color: #f9fafb;
        }

        .logo {
          font-weight: bold;
          color: #1f2937;
          font-size: 1.1rem;
        }

        .notification-icon {
          width: 2rem;
          height: 2rem;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          background-color: white;
          font-size: 1rem;
        }

        .search-section {
            padding: 1rem;
            border-bottom: 2px solid #e5e7eb;
          }

          .select-box {
            padding: 4px 6px;
            border: 1px solid #333;
            border-radius: 8px;
            background: white;
            font-size: 13px;
            width: 40%;              
            appearance: none;
            background-image: url("data:image/svg+xml,%3Csvg fill='black' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M5.5 7l4.5 4 4.5-4'/%3E%3C/svg%3E");
            background-repeat: no-repeat;
            background-position: right 8px center;
            background-size: 12px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }

          .map-filter-selects {
            display: flex;
            gap: 8px;
            margin-top: 0.5rem;
            margin-bottom: 10px;
            width: 100%;
          }


        .map-filter-selects::-webkit-scrollbar { display: none; }

        .venue-section {
          padding: 1.5rem;
        }

        .venue-title {
          font-size: 1.3rem;
          font-weight: bold;
          color: #1f2937;
          margin: 0;
        }

        // .venue-image-container {
        //   margin-bottom: 1rem;
        // }

        .venue-image {
          width: 100%;
          height: 200px;
          border: 3px solid #1f2937;
          transform: rotate(-0.3deg);
          box-shadow: 3px 3px 0px #1f2937;
        }

        .venue-subtitle {
          font-size: 1rem;
          font-weight: bold;
          color: #d97706;
          margin-bottom: 0.5rem;
          margin-top: 20px;
        }

        .venue-description {
          font-size: 0.9rem;
          color: #4b5563;
          line-height: 1.4;
        }

        // .reviews-section {
        //   padding: 1.5rem;
        // }

        .reviews-title {
          font-size: 1.2rem;
          font-weight: bold;
          color: #1f2937;
          margin: 0;
          margin-top: 20px;
        }

        .review-card {
          background-color: #f8fafc;
          padding: 1rem;
          margin-bottom: 1rem;
          transform: rotate(0.2deg);
          position: relative;
          overflow: hidden;
        }

        .review-card:nth-child(even) {
          transform: rotate(-0.2deg);
        }

        .review-content {
          position: relative;
          z-index: 10;
        }

        .review-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 0.75rem;
        }

        .user-avatar {
          width: 60px;
          height: 60px;
          flex-shrink: 0;
        }

        .user-info {
          flex: 1;
        }

        .user-name {
          font-size: 0.95rem;
          font-weight: bold;
          color: #1f2937;
          margin: 0;
        }

        .review-meta {
          font-size: 0.8rem;
          color: #6b7280;
          margin: 0.25rem 0 0 0;
        }

        .review-text {
          font-size: 0.9rem;
          color: #374151;
          line-height: 1.4;
          margin: 0;
        }

        .review-type{margin-bottom: 10px;
          padding: 2px;
          border-radius: 10px;
          width: 50px;
          text-align: center;}

        .review-type.venue {
          background: #b8fbff;
        }

        .review-type.staff {
         background: #ffffaa;
        }

        @media (max-width: 480px) {
          .view-review-container {
            max-width: 100%;
            border-left: none;
            border-right: none;
            margin: 1rem;
          }
        }

        .review-header {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 8px;
          }

          .review-type-badge {
            display: inline-flex;
            align-items: center;
            padding: 4px 12px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: 600;
            border: 1px solid;
          }

          .review-type-badge.venue {
            background-color: #a7f3d0;
            color: #047857;
            border-color: #34d399;
          }

          .review-type-badge.staff {
            background-color: #fef08a;
            color: #92400e;
            border-color: #fbbf24;
          }

          .review-target-name {
            font-size: 16px;
            font-weight: 500;
            color: #333;
            letter-spacing: 0.3px;
          }

          /* 매니저 답변 스타일 (기존) */
          .manager-response {
            background-color: #f0f9ff;
            border: 1px solid #e0f2fe;
            border-left: 4px solid #0284c7;
            border-radius: 8px;
            padding: 0.75rem;
            margin-top: 0.75rem;
            position: relative;
          }

          /* 스태프 답변 스타일 (노란색) */
          .manager-response.staff-response {
            background-color: #fffbeb;
            border: 1px solid #fed7aa;
            border-left: 4px solid #f59e0b;
          }

          .response-header {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            margin-bottom: 0.5rem;
          }

          .response-label {
            font-size: 0.8rem;
            color: #0369a1;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }

          /* 스태프 답변일 때 라벨 색상 */
          .staff-response .response-label {
            color: #d97706;
          }

          .response-badge {
            background-color: #0284c7;
            color: white;
            font-size: 0.7rem;
            padding: 0.1rem 0.3rem;
            border-radius: 12px;
            font-weight: 500;
          }

          /* 스태프 답변일 때 배지 색상 */
          .staff-response .response-badge {
            background-color: #f59e0b;
          }

          .response-text {
            font-size: 0.9rem;
            color: #1e40af;
            line-height: 1.4;
            font-style: italic;
          }

          /* 스태프 답변일 때 텍스트 색상 */
          .staff-response .response-text {
            color: #92400e;
          }

          .review-meta-date {
            position: relative;
            top: -2px; /* 원하는 만큼 위로 조정 */
          }

           .notification-item {
              background-color: white;
              padding: 1rem;
              margin-bottom: 0.75rem;
              cursor: pointer;
              transform: rotate(-0.1deg);
              transition: all 0.2s;
              position: relative;
              overflow: hidden;
            }

            .empty-state {
          text-align: center;
          padding: 2rem 0;
          color: #6b7280;
        }

        .empty-state h3 {
          font-size: 1.1rem;
          margin-bottom: 0.5rem;
          color: #374151;
        }

        .empty-state p {
          font-size: 0.83rem;
        }

        .filter-tab {
          flex: 1;
          text-align: center;
          padding: 8px 12px;
          border: 1px solid #333;
          border-radius: 8px;
          background: white;
          font-size: 14px;
          color: #333;
          cursor: pointer;
          transition: all 0.2s;
        }
        .filter-tab.active {
          background: #374151;
          color: white;
          font-weight: 600;
          border: 2px solid #333;
        }

      `}</style>
<div>

   {/* Header */}

        <SketchHeader
          title={get('Profile1.1')}
          showBack={true}
          onBack={handleBack}
          rightButtons={[]}
        />
      <div className="view-review-container">
     

        {/* Search Section */}
        <div className="map-filter-selects">
          <select
  className="select-box"
  value={sortOrder1}
  onChange={(e) => {
    const value = e.target.value;
    setSortOrder1(value);
    localStorage.setItem(
      "viewReviewPageState",
      JSON.stringify({
        scrollY: 0,
        sortOrder1: value,
        sortOrder,
        targetTypeFilter
      })
    );
  }}
>
  <option value="latest">{get('Newest.filter')}</option>
  <option value="oldest">{get('Oldest.filter')}</option>
  <option value="rating_high">{get('Sort.Rating.High')}</option>
  <option value="rating_low">{get('Sort.Rating.Low')}</option>
  
</select>

<select
  className="select-box"
  value={sortOrder}
  style={{display: 'none'}}
  onChange={(e) => {
    const value = e.target.value;
    setSortOrder(value);
    /*
    localStorage.setItem(
      "viewReviewPageState",
      JSON.stringify({
        scrollY: 0,
        sortOrder1,
        sortOrder: value,
        targetTypeFilter
      })
    );
    */
  }}
>
  <option value="latest">{get('Newest.filter')}</option>
  <option value="oldest">{get('Oldest.filter')}</option>
</select>

<div className="filter-buttons" style={{ display: 'flex', gap: '8px', width: '60%' }}>
  <div
    className={`filter-tab ${targetTypeFilter === 'venue' ? 'active' : ''}`}
    onClick={() => {
      setTargetTypeFilter('venue');
      localStorage.setItem(
        "viewReviewPageState",
        JSON.stringify({
          scrollY: 0,
          sortOrder1,
          sortOrder,
          targetTypeFilter: 'venue'
        })
      );
    }}
  >
    {get('title.text.14')}
  </div>

  <div
    className={`filter-tab ${targetTypeFilter === 'staff' ? 'active' : ''}`}
    onClick={() => {
      setTargetTypeFilter('staff');
      localStorage.setItem(
        "viewReviewPageState",
        JSON.stringify({
          scrollY: 0,
          sortOrder1,
          sortOrder,
          targetTypeFilter: 'staff'
        })
      );
    }}
  >
    {get('title.text.16')}
  </div>
</div>









        </div>
        {/* <div className="search-section">
          <form onSubmit={handleSearch}>
            <SketchInput
              type="text"
              placeholder="Search for venues..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>
        </div> */}

        {/* User Reviews */}
        <div className="reviews-section">

          {loading ? (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              textAlign: 'center',
              color: 'gray',
              height: '200px'
            }}>
              <Martini size={15} />
              <span>Loading...</span>
            </div>
          ) : reviews.length > 0 ? (
            reviews.map((review, index) => (
              <SketchDiv key={review.review_id} className="review-card" onClick={() => handleViewDetail(review)}>
                <HatchPattern opacity={0.03} />
                <div className="review-content">
                  <div className="review-header">
                    <ImagePlaceholder
                      //src={userImages[review.user_id] || '/placeholder-user.jpg'}
                      src={review.targetImage || '/cdn/defaultC/staff.png'}
                      className="user-avatar" alt="profile"
                    />
                    <div>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        marginBottom: '8px'
                      }}>
                        <div style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '24px',
                          height: '24px',
                          borderRadius: '50%',
                          backgroundColor: review.target_type === 'venue' ? '#dcfce7' : '#fef3c7',
                          color: review.target_type === 'venue' ? '#16a34a' : '#d97706'
                        }}>
                          {review.target_type === 'venue' ? (
                            <Store size={14} />
                          ) : (
                            <User size={14} />
                          )}
                        </div>
                        <span style={{
                          fontSize: '15px',
                          fontWeight: '500',
                          color: '#333'
                        }}>
                            
                              {review.target_type === 'staff' && !iauData.isActiveUser
                                ? review.targetName
                                    ? review.targetName.charAt(0) + '***'
                                    : ''
                                : review.targetName}
                        </span>

                        <span
                          style={{
                            display:'none'
                          }}
                        >
                          <Heart size={12} fill={review.isFavorite ? '#f43f5e' : 'none'} color="black" />
                        </span>

                        

                      </div>



                      <div className="user-info"></div>
                    
                      <p className="review-meta">
                      {renderStars(review.rating)}  
                      <span className="review-meta-date">
                        {new Date(review.created_at).toLocaleDateString()}
                      </span>
                    </p>


                    <p className="review-meta">
  <span
    className="review-meta-date"
    style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
  >
    {renderUserName(review.user_name)}
  </span>
</p>



                    </div>
                  </div>
                  {review.content !== '-' && review.content !== '' && (
  <div 
    style={{ 
      border: 'none', 
      boxShadow: 'none', 
      marginBottom: 0, 
      padding: '8px 0' 
    }}
    onClick={() => handleViewDetail(review)}
  >
    <HatchPattern opacity={0.03} />
    <div className="review-content" style={{minHeight: '25px'}}>
      <p className="review-text">
        {review.content}
      </p>

      {/* 번역된 결과 */}
      {translationMap[review.review_id] && (
        <div style={{ marginTop: 6, fontSize: 12, color: '#6b7280', fontStyle: 'italic' }}>
          {translationMap[review.review_id]}
          <span style={{ fontSize: 10, marginLeft: 4 }}>({get('trans_1')})</span>
        </div>
      )}


      

      {/* 수정/삭제 버튼 (작성자 본인일 때만) */}
      <div
        style={{
          display: fromMyReview ? 'block' : 'none',
          position: 'absolute',
          right: '0',
          top: 10,
        }}>
          {review.user_id === user.user_id && (
            <div style={{ display: 'flex', gap: '3px', marginLeft: 'auto' }}>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEditReview(review);
                  }}
                  style={{
                    background: '#3b82f6',
                    color: '#fff',
                    fontSize: 12,
                    padding: '4px 10px',
                    border: 'none',
                    borderRadius: 6,
                    cursor: 'pointer'
                  }}
                >
                  {/*<Pencil size={14} color="#374151" />*/}

                  {get('PROMOTION_EDIT_BUTTON')}
                </button>
                <button
                  style={{
                    background: 'rgb(194 44 51)',
                    color: '#fff',
                    fontSize: 12,
                    padding: '4px 10px',
                    border: 'none',
                    borderRadius: 6,
                    cursor: 'pointer'
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteReview(review.review_id);
                  }}
                  
                >
                  {/*<Trash2 size={14} color="#ef4444" />*/}

                  {get('PROMOTION_DELETE_BUTTON')}
                </button>
              </div>
              )}
      </div>

      {/* 번역 버튼 */}
      <div style={{ 
         display: fromMyReview ? 'none' : 'block',
         marginTop: 8, textAlign: 'right' }}>


        
        <button
          style={{
            background: '#3b82f6',
            color: '#fff',
            fontSize: 12,
            padding: '4px 10px',
            border: 'none',
            borderRadius: 6,
            cursor: 'pointer'
          }}
          onClick={(e) => {
            e.stopPropagation(); // 상세보기 클릭 방지
            handleTranslate(review.review_id, review.content);
          }}
        >
          {get('Translation')}
        </button>
      </div>
    </div>
  </div>
)}



                  {/* 매니저 답변 표시 */}
               

                  {/* 예약하기 버튼 */}
                  {/* <div className="review-actions" style={{
                    paddingTop: '1rem',
                    borderTop: '1px solid #e5e7eb',
                    display: 'flex',
                    justifyContent: 'flex-end'
                  }}>
                    <SketchBtn
                      className="reservation-btn"
                      onClick={() => {
                        if (review.is_reservation) {
                          handleReservation(review);
                        }
                      }}
                      disabled={!review.is_reservation}
                      style={{
                        width: '30%',
                        backgroundColor: review.is_reservation ? '#10b981' : '#9ca3af', // 회색으로 비활성화 느낌
                        color: '#fefefe',
                        padding: '0.5rem 1rem',
                        cursor: review.is_reservation ? 'pointer' : 'not-allowed',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      {review.is_reservation ? '예약하기' : '예약 마감'}
                    </SketchBtn>

                  </div> */}

                </div>
              </SketchDiv>
            ))
          ) : (
             <SketchDiv className="notification-item">
              <HatchPattern opacity={0.02} />
              <div className="empty-state">
                <h3>{get('Review3.5')}</h3>
                <p style={{fontSize: '0.83rem'}}>{get('REVIEW_NO_REVIEWS_MESSAGE')}</p>
              </div>
            </SketchDiv>
          )}
        </div>
      </div>
      </div>
    </>
  );
};

export default ViewReviewPage;