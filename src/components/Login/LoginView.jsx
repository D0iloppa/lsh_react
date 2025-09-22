import React, { useState, useEffect } from 'react';
import axios from 'axios';

import SketchDiv from '@components/SketchDiv';
import LoginForm from './LoginForm';
import ImagePlaceholder from '@components/ImagePlaceholder';
import './LoginView.css';
import '@components/SketchComponents.css';
import InitFooter from '@components/InitFooter';
import HatchPattern from '@components/HatchPattern';
import LoadingScreen from '@components/LoadingScreen';
import RotationDiv from '@components/RotationDiv';
import PopularVenue from '@components/PopularVenue';
import { useMsg, useMsgGet, useMsgLang } from '@contexts/MsgContext';
import MessageFlag from '@components/MessageFlag';
import SketchBtn from '@components/SketchBtn';


import { useAuth } from '@contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

import ApiClient from '@utils/ApiClient';

// 칵테일 아이콘 컴포넌트
const CocktailIcon = () => (
  <svg 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="#333" 
    strokeWidth="1.5"
    style={{ transform: 'rotate(-1deg)' }}
  >
    <path 
      d="M6.2 4.8 L17.8 4.2 L12.1 12.5 Z" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
    />
    <line 
      x1="12" 
      y1="12.5" 
      x2="11.9" 
      y2="18.5" 
      strokeLinecap="round" 
    />
    <line 
      x1="9.2" 
      y1="18.8" 
      x2="14.8" 
      y2="18.2" 
      strokeLinecap="round" 
    />
    <path 
      d="M16.5 6.2 C17.8 5.8, 18.5 7.2, 17.2 8.1 C15.8 9.2, 17.1 10.8, 18.2 9.5"
      strokeLinecap="round" 
      fill="none" 
    />
  </svg>
);



export default function LoginView() {

  const { messages, error, get, currentLang, setLanguage, availableLanguages, refresh } = useMsg();
  const [venues, setVenues] = useState([]);
  const [selectedVenue, setSelectedVenue] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState("all");
  const [loading, setLoading] = useState(false);

    // 업종 필터 적용
  const filteredVenues = venues.filter((venue) => {
    if (selectedIndustry === "all") return true;

    let tmp_cat_id = venue.cat_id;
    // 2,3 동일치 취급
    if(tmp_cat_id == 3) tmp_cat_id = 2;

    return String(tmp_cat_id) === selectedIndustry;
  });

  

  const navigate = useNavigate();
  const { login_v2 } = useAuth();

  useEffect(() => {
    if (messages && Object.keys(messages).length > 0) {
      console.log('✅ Messages loaded23:', messages);
      // setLanguage('en'); // 기본 언어 설정
      console.log('Current language set to:', currentLang);
      window.scrollTo(0, 0);
    }
  }, [messages, currentLang]);

  useEffect(() => {
    setSelectedVenue("");  // 업종 바뀌면 매장 선택 초기화
  }, [selectedIndustry]);

  // 매장 리스트 가져오기
  useEffect(() => {
    const fetchVenues = async () => {
      setLoading(true);
      try {

        const response = await ApiClient.get('/api/admin/getManagerList');
        const venueList = response.data || [];

        setVenues(venueList);
        console.log('매장 리스트 로드 완료:', venueList);
      } catch (error) {
        console.error('매장 리스트 가져오기 실패:', error);
        setVenues([]);
      } finally {
        setLoading(false);
      }
    };

    fetchVenues();
  }, []);

  // 로그인 버튼 클릭 핸들러
  const handleLogin = async () => {
    if (!selectedVenue) {
      alert('매장을 선택해주세요.');
      return;
    }

    const selectedVenueData = venues.find(venue => venue.venue_id === parseInt(selectedVenue));
    if (selectedVenueData) {
      console.log('선택된 매장:', selectedVenueData);



      const response = await ApiClient.postForm('/api/admin/managerLogin', {
        owner_id: selectedVenueData.manager_id
      });

      const { error = false, manager = false } = response;

      if(error || !manager) {
        console.log('로그인 실패:', manager);

      } else {

        login_v2({
          login_type: 'email',
          account_type: 'manager',
          user:manager,
        }).then((result) => {
          console.log('로그인 성공');
          navigate('/manager');
        });

      }
    }
  };

  const popularVenues = [
    {
      venueName: "KLUB ONE",
      description: "Premium entertainment with elite hostesses and vibrant atmosphere",
      rating: "4.9",
      location: "District 1, Ho Chi Minh City",
      image:'/cdn/content/mang.png'
    },
    {
      venueName: "Elite Hostess Club",
      description: "Experience top-notch services with our elite hostesses",
      rating: "4.8",
      location: "District 3, Ho Chi Minh City",
      image:'/cdn/content/qui.png'
    },
    {
      venueName: "Vibrant Lounge Bar",
      description: "Join us for a night full of fun and great vibes",
      rating: "4.7",
      location: "District 7, Ho Chi Minh City",
      image:'/cdn/content/skybar.png'
    }
  ];


  return (
    <div className="login-container">
      <div className="login-wrapper">

        {/* Header */}
        <header className="login-header" style={{display: 'none'}}>
          <div className="logo-container">
            <CocktailIcon />
            <h1 className="sketch-title sketch-title--large">LeTanTon Sheriff</h1>
            <span style={{ fontSize: '20px',  marginLeft: '-8px' }}><ImagePlaceholder src="/cdn/age.png" style={{lineHeight: '0.5', marginLeft: '5px', width:'26px'}}/></span>
          </div>
          <div style={{ textAlign: 'center', fontSize: '0.875rem', color: '#6b7280', marginTop: '10px' }}>
            <span>{get('manager.login.description.1')}</span>
          </div>
        </header>

          {/* 상단 회전 영역 */}
          <div className="rotation-section">
            <RotationDiv 
              interval={4000} 
              showIndicators={true}
              pauseOnHover={true}
              autoLoop={true}  // 이 옵션 추가 (기본값: true)
              className="venue-rotation"
            >
              {popularVenues.map((venue, index) => (
                <PopularVenue
                  key={index}
                  venueName={venue.venueName}
                  description={venue.description}
                  rating={venue.rating}
                  location={venue.location}
                  image={venue.image}
                />
              ))}
            </RotationDiv>
          </div>

                {/* 브랜드 섹션 */}
      <div className="brand-section" 
        style={{
          paddingBottom: '1.0rem',    
          marginTop: '-4rem',
        }}>
        <div className="brand-content">
              <div className="brand-header">
               <div className="logo-container">
                <CocktailIcon />
                <h1 className="sketch-title sketch-title--large">LeTanTon Sheriff</h1>
                <span style={{ fontSize: '20px',  marginLeft: '-8px' }}><ImagePlaceholder src="/cdn/age.png" style={{lineHeight: '0.5', marginLeft: '5px', width:'26px'}}/></span>
              </div>
              </div>
              <div style={{ textAlign: 'center', fontSize: '0.875rem', color: '#6b7280', marginTop: '10px' }}>
                <span>{get('manager.login.description.1')}</span>
              </div>
              
              {/* <h2 className="brand-subtitle">All Girlsbars Here</h2> */}
              
              <p className="brand-description" style={{marginTop: '0.875rem'}}>
                {get('BRAND_DESCRIPTION_WELCOME')}
              </p>
            </div>
      </div>

      {/* Login Form */}
      <div
        style={{
          paddingLeft: '1.0rem',
          paddingRight: '1.0rem',
        }}
      >
        {/* 첫 번째 영역 */}
        <SketchDiv 
          className="selection-area"
          style={{
            marginBottom: '1rem',
            padding: '1rem'
          }}
        >

    {/* 업종 필터 */}
    <div style={{ display: "flex", alignItems: "center", marginBottom: "1rem" }}>
      <span style={{ marginRight: "0.5rem", fontSize: "0.875rem", fontWeight: "500" }}>업종 :</span>
      <select
        value={selectedIndustry}
        onChange={(e) => setSelectedIndustry(e.target.value)}
        style={{
          flex: 1, // 남는 공간 다 차지
          padding: "0.75rem",
          border: "1px solid #d1d5db",
          borderRadius: "8px",
          backgroundColor: "#f9fafb",
          fontSize: "0.875rem",
        }}
        disabled={loading}
      >
        <option value="all">전체</option>
        <option value="1">BAR</option>
        <option value="2">이발소/스파</option>
      </select>
    </div>




          <select 
            value={selectedVenue}
            onChange={(e) => setSelectedVenue(e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              backgroundColor: '#f9fafb',
              fontSize: '0.875rem',
              marginBottom: '1rem'
            }}
            disabled={loading}
          >
            <option value="">매장을 선택해주세요</option>
            {filteredVenues.map((venue) => (
              <option key={venue.manager_id} value={venue.venue_id}>
                {venue.venue_name}
              </option>
            ))}
          </select>
          
          <SketchBtn 
            variant="primary"
            size="medium"
            onClick={handleLogin}
            disabled={!selectedVenue || loading}
            style={{ width: '100%' }}
          >
            {loading ? '로딩 중...' : '관리하기'}
          </SketchBtn>
        </SketchDiv>
      </div>
      

        {/* Footer */}
          
       


      </div>
    </div>
  );
}