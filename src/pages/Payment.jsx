import React, { useState, useEffect } from 'react';
import axios from 'axios';

import HatchPattern from '@components/HatchPattern';
import SketchBtn from '@components/SketchBtn';
import SketchMenuBtn from '@components/SketchMenuBtn';
import SketchDiv from '@components/SketchDiv';
import '@components/SketchComponents.css';

import SketchHeader from '@components/SketchHeader';
import { useMsg, useMsgGet, useMsgLang } from '@contexts/MsgContext';

import { useAuth } from '../contexts/AuthContext';

const Payment = ({
  navigateToPageWithData,
  PAGES,
  goBack,
  ...otherProps
}) => {
  const { user, isLoggedIn } = useAuth();
  const [userInfo, setUserInfo] = useState({});
  const [userReviews, setUserReviews] = useState([]);
  const API_HOST = import.meta.env.VITE_API_HOST; // ex: https://doil.chickenkiller.com/api
  const { messages, isLoading, error, get, currentLang, setLanguage, availableLanguages, refresh } = useMsg();

  useEffect(() => {
    if (messages && Object.keys(messages).length > 0) {
      console.log('✅ Messages loaded:', messages);
      // setLanguage('en'); // 기본 언어 설정
      console.log('Current language set to:', currentLang);
      window.scrollTo(0, 0);
    }
  }, [messages, currentLang]);

  useEffect(() => {
    window.scrollTo(0, 0);

    const fetchUserInfo = async () => {
      try {
        const response = await axios.get(`${API_HOST}/api/getUserInfo`, {
          params: { user_id: user?.user_id || 1 }
        });
        setUserInfo(response.data || {});
      } catch (error) {
        console.error('유저 정보 불러오기 실패:', error);
      }
    };

    const fetchUserReviews = async () => {
    try {
        const response = await axios.get(`${API_HOST}/api/getMyReviewList`, {
          params: { user_id: user?.user_id || 1 }
        });
        setUserReviews(response.data || []);
      } catch (error) {
        console.error('리뷰 목록 불러오기 실패:', error);
      }
    };

    fetchUserInfo();
    fetchUserReviews();

  }, [user]);

  const handleBack = () => {
    navigateToPageWithData && navigateToPageWithData(PAGES.ACCOUNT);
  };

  return (
    <>
      <style jsx="true">{`
       

       

      `}</style>

      <div className="account-container">
        <SketchHeader
          title={get('Menu1.7')}
          showBack={true}
          onBack={handleBack}
          rightButtons={[]}
        />
      </div>
    </>
  );
};

export default Payment;
