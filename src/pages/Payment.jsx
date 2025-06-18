import React, { useState, useEffect } from 'react';
import axios from 'axios';

import HatchPattern from '@components/HatchPattern';
import SketchBtn from '@components/SketchBtn';
import SketchMenuBtn from '@components/SketchMenuBtn';
import SketchDiv from '@components/SketchDiv';
import '@components/SketchComponents.css';

import SketchHeader from '@components/SketchHeader';


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

  useEffect(() => {
    window.scrollTo(0, 0);

    const fetchUserInfo = async () => {
      try {
        const response = await axios.get('/api/api/getUserInfo', {
          params: { user_id: user?.user_id || 1 }
        });
        setUserInfo(response.data || {});
      } catch (error) {
        console.error('유저 정보 불러오기 실패:', error);
      }
    };

    const fetchUserReviews = async () => {
    try {
        const response = await axios.get('/api/api/getMyReviewList', {
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
      <style jsx>{`
       

       

      `}</style>

      <div className="account-container">
        <SketchHeader
          title="Payment"
          showBack={true}
          onBack={handleBack}
          rightButtons={[]}
        />
      </div>
    </>
  );
};

export default Payment;
