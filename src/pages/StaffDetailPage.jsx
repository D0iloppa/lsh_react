import React, { useState, useEffect } from 'react';

import RotationDiv from '@components/RotationDiv';
import ImagePlaceholder from '@components/ImagePlaceholder';
import SketchHeader from '@components/SketchHeader';
import HatchPattern from '@components/HatchPattern';
import SketchBtn from '@components/SketchBtn';
import '@components/SketchComponents.css';
import LoadingScreen from '@components/LoadingScreen';
import ApiClient from '@utils/ApiClient';

import { useMsg } from '@contexts/MsgContext';
import { useAuth } from '@contexts/AuthContext';
import { usePopup } from '@contexts/PopupContext';

const StaffDetailPage = ({ navigateToPageWithData, goBack, PAGES, showAdWithCallback, ...otherProps }) => {
  const [date, setDate] = useState('');
  const [partySize, setPartySize] = useState('');
  const [availCnt, setAvailCnt] = useState(0);
  const [isLoadingAvailCnt, setIsLoadingAvailCnt] = useState(false);
  const [loading, setLoading] = useState(false);
  const [girl, setGirl] = useState(otherProps || {});
  const [images, setImages] = useState([]);

  const { get, currentLang, messages } = useMsg();
  const { isActiveUser } = useAuth();
  const { showPopup, closePopup } = usePopup();

  const getAgeFromBirthYear = (birthYear) => {
    const currentYear = new Date().getFullYear();
    return birthYear ? currentYear - parseInt(birthYear, 10) : null;
  };

  const handleBack = () => {
    goBack();
  };

  const handleReserve = async () => {
    return;
  };

  useEffect(() => {
    const fetchStaffData = async () => {
      if (otherProps.fromReview && otherProps.staff_id) {
        setLoading(true);
        try {
          const response = await ApiClient.get('/api/getStaffProfile', {
            params: { staff_id: otherProps.staff_id }
          });

          const apiDataArray = Array.isArray(response)
            ? response
            : Array.isArray(response?.data)
              ? response.data
              : [];

          const basicInfo = apiDataArray.length > 0 ? apiDataArray[0] : {};
          setGirl({
            ...otherProps,
            ...basicInfo,
          });

        } catch (error) {
          console.error('Staff 정보 로딩 실패:', error);
          setGirl(otherProps);
        } finally {
          setLoading(false);
        }
      } else {
        setGirl(otherProps);
      }
    };

    fetchStaffData();
  }, [otherProps.fromReview, otherProps.staff_id]);

  // 이미지 가져오기
  useEffect(() => {
  const fetchStaffPhotos = async () => {
    if (!otherProps.staff_id) return;

    try {
      const res = await ApiClient.get('/api/getStaffPhotos', {
        params: { staff_id: otherProps.staff_id }
      });

      console.log('사진 응답:', res);

      const baseUrl = ''; // ⚠️ 실제 CDN 도메인으로 교체
      const photos = Array.isArray(res?.data) ? res.data : [];

      const urls = photos
        .map(p => p?.url?.startsWith('/') ? baseUrl + p.url : p.url)
        .filter(img => typeof img === 'string' && img.trim() !== '');

      setImages(urls);
    } catch (err) {
      console.error('사진 로딩 실패:', err);
      setImages([]);
    }
  };

  fetchStaffPhotos();
}, [otherProps.staff_id]);


  // availCnt 가져오기
  useEffect(() => {
    const fetchStaffAvailCnt = async () => {
      if (!girl.staff_id) return;
      setIsLoadingAvailCnt(true);

      try {
        const response = await ApiClient.get('/api/staffAvailCnt', {
          params: { staff_id: girl.staff_id }
        });

        if (Array.isArray(response) && response.length > 0) {
          setAvailCnt(response[0]?.availcnt || 0);
        } else {
          setAvailCnt(0);
        }

      } catch (error) {
        console.error('availCnt 로딩 실패:', error);
        setAvailCnt(0);
      } finally {
        setIsLoadingAvailCnt(false);
      }
    };

    fetchStaffAvailCnt();
  }, [girl.staff_id]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [messages, currentLang]);

  return (
    <>
      <style jsx="true">{`
        .staff-detail-container {
          font-family: 'BMHanna', 'Comic Sans MS', cursive, sans-serif;
        }
        .profile-images-section {
          margin-bottom: 1rem;
        }
        .dual-image-container {
          display: flex;
          justify-content: center;
          align-items: center;
        }
        .image-left {
          width: 100%;
          max-width: 300px;
        }
        .profile-image {
          margin-top: 20px;
          width: 100%;
          border-radius: 1rem;
        }
        .staff-info-section {
          text-align: center;
          margin-top: 1rem;
        }
        .staff-name {
          font-size: 1.5rem;
          font-weight: bold;
        }
        .staff-age {
          font-size: 1.1rem;
          margin-top: 0.25rem;
        }
        .staff-specialty {
          font-size: 1rem;
          color: #6b7280;
          margin-top: 0.25rem;
        }
        .staff-description {
          margin-top: 0.75rem;
          font-size: 0.95rem;
          color: #4b5563;
        }
        .booking-form-section {
          margin-top: 2rem;
          padding-bottom: 20px;
        }
      `}</style>

      <div className="staff-detail-container">
        <SketchHeader
          title={
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>{get('Menu1.2')}</span>
            </div>
          }
          showBack={true}
          onBack={handleBack}
          rightButtons={[]}
        />

        <div className="profile-images-section">
          <RotationDiv
            interval={50000000}
            swipeThreshold={50}
            showIndicators={true}
            pauseOnHover={true}
            className="profile-rotation"
          >
            {(() => {
              const validImages = images.filter(img => img && img.trim() !== '');
              const slides = validImages.length > 0 ? validImages : [null];

              return slides.map((imageUrl, index) => (
                <div key={index} className="profile-slide">
                  <div className="dual-image-container">
                    <div className="image-left">
                      <ImagePlaceholder
                        src={imageUrl}
                        placeholder={true}
                        className="profile-image"
                      />
                    </div>
                  </div>
                </div>
              ));
            })()}
          </RotationDiv>
        </div>

        <div className="staff-info-section">
          <div className="staff-name">{girl.name || 'Unknown Staff'}</div>
          <div className="staff-age">
            {girl.birth_year ? `Age ${getAgeFromBirthYear(girl.birth_year)}` : 'Age N/A'}
          </div>
          <div className="staff-description">
            {girl.description || 'No description available.'}
          </div>
        </div>

        <LoadingScreen
          variant="cocktail"
          loadingText="Loading..."
          isVisible={loading}
        />
      </div>
    </>
  );
};

export default StaffDetailPage;
