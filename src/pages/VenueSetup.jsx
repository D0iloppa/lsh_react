import React, { useState, useEffect } from 'react';
import SketchHeader from '@components/SketchHeader';
import GoogleMapComponent from '@components/GoogleMapComponent';
import SketchBtn from '@components/SketchBtn';
import SketchDiv from '@components/SketchDiv';
import SketchInput from '@components/SketchInput';
import HatchPattern from '@components/HatchPattern';
import '@components/SketchComponents.css';
import { useMsg, useMsgGet, useMsgLang } from '@contexts/MsgContext';
import { useAuth } from '@contexts/AuthContext';
import ApiClient from '@utils/ApiClient';
import { useNavigate, useLocation } from 'react-router-dom';

import Swal from 'sweetalert2';
import ImageUploader from '@components/ImageUploader';
import PhotoGallery from '@components/PhotoGallery';

const defaultForm = {
  name: '',
  description: '',
  address: '',
  latitude: '',
  longitude: '',
  phone: '',
  open_time: '',
  close_time: '',
  logo: '',
  cover: '',
  status: '',
  profile_content_id: '',
  url: '',
  rating: '',
  image_url: '',
  staff_cnt: '',
  cat_nm: '',
  price: '',
  is_reservation: false,
  staff_languages: '',
  imgList: [],
  menuList: [],
  item_id: '',
  cat_id: ''
};

const VenueSetup = ({ navigateToPageWithData, PAGES, goBack, pageData, ...otherProps }) => {
  const { user } = useAuth();
  const { messages, isLoading, error, get, currentLang, setLanguage, availableLanguages, refresh } = useMsg();
  const [mode, setMode] = useState(otherProps.mode || 'create');
  const [venueId, setVenueId] = useState(otherProps.venue_id || null);
  const [form, setForm] = useState(defaultForm);

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);


  const [isSaving, setIsSaving] = useState(false);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [galleryImages, setGalleryImages] = useState([]);
  const [galleryImagesContentId, setGalleryImagesContentId] = useState([]);
  const [galleryImagesMap, setGalleryImagesMap] = useState([]); // {url, contentId} 형태로 관리

  const navigate = useNavigate();

  const location = useLocation();
  const fromManagerTuto = location.state?.from === 'managerTuto';

    useEffect(() => {
        if (messages && Object.keys(messages).length > 0) {
          console.log('✅ Messages loaded:', messages);
           //setLanguage('vi'); // 기본 언어 설정
          console.log('Current language set to:', currentLang);
          window.scrollTo(0, 0);
        }
      }, [messages, currentLang]);

  useEffect(() => {
    if (mode === 'edit' && venueId) {
      // edit 모드일 때만 데이터 fetch
      const fetchVenue = async () => {
        try {
          const venueData = await ApiClient.get('/api/getVenue', {
            params: { venue_id: venueId }
          });
          
          setForm(prev => ({
            ...prev,
            ...venueData,
            open_time: formatTimeForInput(venueData.open_time),
            close_time: formatTimeForInput(venueData.close_time)
          }));
        } catch (e) {
          console.error('Venue data fetch error:', e);
        }
      };
      fetchVenue();
    } else {
      // create 모드일 때는 form을 비움
      setForm(defaultForm);
    }

    // messages, currentLang 등은 별도 처리
  }, [mode, venueId]);


  useEffect(() => {
    console.log('galleryImages', galleryImages);
  }, [galleryImages]);



  useEffect(() => {
    console.log('uploadedImages Changed', uploadedImages);

    const contentId = uploadedImages[0]?.contentId;

    if(contentId){
      setForm(prev => ({ ...prev, newProfile: contentId }));
    }

  }, [uploadedImages]);



  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    
    // 입력 시 해당 필드의 에러 제거
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };


  const handleBack = () => {
  if (fromManagerTuto) {
    navigate('/managerTuto');
  } else {
    goBack();
  }
};

  // 검증 함수들
  const validateName = (name) => {
    if (!name.trim()) {
      return get('VENUE_ERROR_NAME_REQUIRED');
    }
    if (name.trim().length < 2) {
      return get('VENUE_ERROR_NAME_MIN_LENGTH');
    }
    if (name.trim().length > 50) {
      return get('VENUE_ERROR_NAME_MAX_LENGTH');
    }
    return '';
  };

  const validateAddress = (address) => {
    if (!address.trim()) {
      return get('VENUE_ERROR_ADDRESS_REQUIRED');
    }
    if (address.trim().length < 5) {
      return get('VENUE_ERROR_ADDRESS_MIN_LENGTH');
    }
    if (address.trim().length > 200) {
      return get('VENUE_ERROR_ADDRESS_MAX_LENGTH');
    }
    return '';
  };

  const validatePhone = (phone) => {
  if (!phone.trim()) {
    return get('VENUE_ERROR_PHONE_REQUIRED');
  }
  const phoneRegex = /^[\d\s\-\(\)\+]+$/;
  if (!phoneRegex.test(phone)) {
    return get('VENUE_ERROR_PHONE_FORMAT');
  }
  const numbersOnly = phone.replace(/\D/g, '');
  if (numbersOnly.length < 8 || numbersOnly.length > 15) {
    return get('VENUE_ERROR_PHONE_LENGTH');
  }
  return '';
};

  const validateOpenTime = (time) => {
  if (!time.trim()) {
    return get('VENUE_ERROR_OPEN_TIME_REQUIRED');
  }
  const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
  if (!timeRegex.test(time)) {
    return get('VENUE_ERROR_TIME_FORMAT');
  }
  return '';
};

  const validateCloseTime = (time) => {
  if (!time.trim()) {
    return get('VENUE_ERROR_CLOSE_TIME_REQUIRED');
  }
  const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
  if (!timeRegex.test(time)) {
    return get('VENUE_ERROR_TIME_FORMAT');
  }
  // if (form.open_time && time) {
  //   // ... 시간 비교 로직 ...
  //   if (closeTotalMinutes <= openTotalMinutes) {
  //     return get('VENUE_ERROR_CLOSE_TIME_AFTER_OPEN');
  //   }
  // }
  
    if (form.open_time && time) {
      const openHour = parseInt(form.open_time.split(':')[0]);
      const openMinute = parseInt(form.open_time.split(':')[1]);
      const closeHour = parseInt(time.split(':')[0]);
      const closeMinute = parseInt(time.split(':')[1]);
      
      const openTotalMinutes = openHour * 60 + openMinute;
      const closeTotalMinutes = closeHour * 60 + closeMinute;
      
      if (closeTotalMinutes <= openTotalMinutes) {
        return get('VENUE_ERROR_CLOSE_TIME_AFTER_OPEN');
      }
    }
  return '';
};

  // 시간을 HH:MM:SS 형식으로 변환하는 함수
  const formatTimeToSeconds = (timeString) => {
    if (!timeString) return '';
    return timeString + ':00'; // HH:MM -> HH:MM:SS
  };

  // "09:00:00" → "09:00"
  const formatTimeForInput = (timeStr) => {
    if (!timeStr) return '';
    // 이미 HH:MM이면 그대로 반환
    if (/^\d{2}:\d{2}$/.test(timeStr)) return timeStr;
    // HH:MM:SS → HH:MM
    if (/^\d{2}:\d{2}:\d{2}$/.test(timeStr)) return timeStr.slice(0, 5);
    return '';
  };

  const validateIntro = (intro) => {
  if (!intro.trim()) {
    return get('VENUE_ERROR_INTRO_REQUIRED');
  }
  if (intro.trim().length < 10) {
    return get('VENUE_ERROR_INTRO_MIN_LENGTH');
  }
  if (intro.trim().length > 500) {
    return get('VENUE_ERROR_INTRO_MAX_LENGTH');
  }
  return '';
};

  // 전체 폼 검증
  const validateForm = () => {
    const newErrors = {};

    newErrors.name = validateName(form.name);
    newErrors.address = validateAddress(form.address);
    newErrors.phone = validatePhone(form.phone);
    newErrors.open_time = validateOpenTime(form.open_time);
    newErrors.close_time = validateCloseTime(form.close_time);
    newErrors.description = validateIntro(form.description);

    // 빈 에러 메시지 제거
    Object.keys(newErrors).forEach(key => {
      if (!newErrors[key]) {
        delete newErrors[key];
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 실시간 검증 (blur 이벤트)
  const handleBlur = (e) => {
    const { name, value } = e.target;
    let errorMessage = '';

    switch (name) {
      case 'name':
        errorMessage = validateName(value);
        break;
      case 'address':
        errorMessage = validateAddress(value);
        break;
      case 'phone':
        errorMessage = validatePhone(value);
        break;
      case 'open_time':
        errorMessage = validateOpenTime(value);
        break;
      case 'close_time':
        errorMessage = validateCloseTime(value);
        break;
      case 'description':
        errorMessage = validateIntro(value);
        break;
      default:
        break;
    }

    setErrors(prev => ({ ...prev, [name]: errorMessage }));
  };

  const insertVenue = async () => {
    // form 데이터에서 logo, cover 제외하고 전송 (이미지는 별도 처리)
    const venueData = {
      cat_id: 1,
      name: form.name.trim(),
      address: form.address.trim(),
      phone: form.phone.trim(),
      open_time: formatTimeToSeconds(form.open_time.trim()),    // HH:MM:SS 형식으로 변환
      close_time: formatTimeToSeconds(form.close_time.trim()),  // HH:MM:SS 형식으로 변환
      description: form.description.trim()
    };

    // newProfile이 있을 때만 추가
    if (form.newProfile) {
      venueData.newProfile = form.newProfile;
    }
    
    console.log('Saving venue data:', venueData);
    
    // API 호출
    const response = await ApiClient.postForm('/api/register_venue', venueData);
    
    console.log('API response:', response);
    
    // 성공 응답 체크 (API 응답 구조에 따라 조정)
    if (response && (response.success || response.data || response.venue_id)) {
      // 성공 후 갤러리 이미지들 DB에 저장
      const venueId = response.venue_id || response.data?.venue_id;
      if (venueId && galleryImagesContentId.length > 0) {
        for (const contentId of galleryImagesContentId) {
          try {
            await ApiClient.postForm('/api/uploadVenueGallery', {
              venue_id: venueId,
              content_id: contentId
            });
          } catch (error) {
            console.error('Gallery image upload failed:', error);
          }
        }
      }
      
      // galleryImages 초기화
      setGalleryImages([]);
      setGalleryImagesContentId([]);
      
      // SweetAlert로 성공 메시지 표시
      await Swal.fire({
        title: get('SWAL_SUCCESS_TITLE'),
        text: get('SETTINGS_SAVE_SUCCESS'),
        icon: 'success',
        confirmButtonText: get('SWAL_CONFIRM_BUTTON')
      });
      // /manager 페이지로 이동
      navigate('/manager');
    } else {
      throw new Error('Invalid response from server');
    }
  };

  const updateVenue = async () => {
  try {
    // 먼저 주소 → 위도/경도 변환 수행
    const response = await ApiClient.get('/api/getPoi', {
      params: { keyword: form.address }
    });

    const result = response;

    if (!result || !result.includes(',')) {
      throw new Error('좌표 형식이 올바르지 않습니다.');
    }

    const [lat, lng] = result.split(',').map(s => s.trim());

    // 위도/경도 갱신
    const updatedForm = {
      ...form,
      latitude: lat,
      longitude: lng
    };

    setForm(updatedForm); // 폼 상태도 업데이트 (필요 시)
    
    // venue 수정 데이터 준비
    const venueData = {
      cat_id: 1,
      venue_id: user?.venue_id,
      manager_id: user?.manager_id,
      name: updatedForm.name.trim(),
      address: updatedForm.address.trim(),
      phone: updatedForm.phone.trim(),
      latitude: updatedForm.latitude.trim(),
      longitude: updatedForm.longitude.trim(),
      open_time: formatTimeToSeconds(updatedForm.open_time.trim()),
      close_time: formatTimeToSeconds(updatedForm.close_time.trim()),
      description: updatedForm.description.trim()
    };

    if(updatedForm.newProfile){
      venueData.profile_content_id = updatedForm.newProfile;
    }

    console.log('venueData', venueData, galleryImages);

    const updateResponse = await ApiClient.postForm('/api/venueEdit', venueData);
    
    console.log('API response:', updateResponse);

      
    if (updateResponse && (updateResponse.success || updateResponse.data)) {
      // 성공 후 갤러리 이미지들 DB에 저장
      /*
      if (galleryImagesContentId.length > 0) {
        for (const contentId of galleryImagesContentId) {
          try {
            await ApiClient.postForm('/api/uploadVenueGallery', {
              venue_id: user?.venue_id,
              content_id: contentId
            });
          } catch (error) {
            console.error('Gallery image upload failed:', error);
          }
        }
      }
        */
      
      // galleryImages 초기화
      setGalleryImages([]);
      setGalleryImagesContentId([]);
      
      await Swal.fire({
        title: get('SWAL_SUCCESS_TITLE'),
        text: get('SETTINGS_SAVE_SUCCESS'),
        icon: 'success',
        confirmButtonText: get('SWAL_CONFIRM_BUTTON')
      });
    } else {
      throw new Error('Invalid response from server');
    }
  } catch (error) {
    console.error('Venue update failed:', error);
    Swal.fire({
      title: get('SWAL_ERROR_TITLE'),
      text: get('VENUE_ERROR_SAVE_FAILED'),
      icon: 'error',
      confirmButtonText: get('SWAL_CONFIRM_BUTTON')
    });
  }
};

  const handleSave = async () => {
    if (!validateForm()) {
      // 첫 번째 에러 필드로 스크롤
      const firstErrorField = Object.keys(errors)[0];
      const element = document.querySelector(`[name="${firstErrorField}"]`);
      if (element) {
        element.focus();
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    setIsSubmitting(true);

    try {
      if (mode === 'create') {
        await insertVenue();
      } else if (mode === 'edit') {
        await updateVenue();
      }
    } catch (error) {
      console.error('Venue setup failed:', error);
      let errorMessage = get('VENUE_ERROR_SAVE_FAILED');
      if (error.response) {
        const status = error.response.status;
        const errorData = error.response.data;
        if (status === 400) {
          errorMessage = errorData.message || get('VENUE_ERROR_INVALID_INFO');
        } else if (status === 401) {
          errorMessage = get('VENUE_ERROR_LOGIN_AGAIN');
        } else if (status === 403) {
          errorMessage = get('VENUE_ERROR_NO_PERMISSION');
        } else if (status === 409) {
          errorMessage = get('VENUE_ERROR_ALREADY_EXISTS');
        } else if (status >= 500) {
          errorMessage = get('VENUE_ERROR_SERVER');
        }
        console.error('API error details:', errorData);
      } else if (error.request) {
        errorMessage = get('VENUE_ERROR_NETWORK');
      }
      
      // SweetAlert로 에러 메시지 표시
      Swal.fire({
        title: get('SWAL_ERROR_TITLE'),
        text: errorMessage,
        icon: 'error',
        confirmButtonText: get('SWAL_CONFIRM_BUTTON')
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClickSearchPoi = async () => {
  try {
    const response = await ApiClient.get('/api/getPoi', {
      params: { keyword: form.address }
    });

    const result = response;

    if (!result || !result.includes(',')) {
      throw new Error('좌표 형식이 올바르지 않습니다.');
    }

    const [lat, lng] = result.split(',').map(s => s.trim());

    setForm(prev => ({
      ...prev,
      latitude: lat,
      longitude: lng
    }));

  } catch (err) {
    //alert('위치 검색 실패'); 

    Swal.fire({
      title: get('VENUE_EDIT_MAP_ERROR'),
      icon: 'error',
      confirmButtonText: get('SWAL_CONFIRM_BUTTON')
    });
  }
};

  return (
    <>
      <style jsx="true">{`
        .venue-container {
          margin-bottom: 1rem;
          max-width: 28rem;
          background: #fff;
          min-height: 100vh;
          font-family: 'BMHanna', 'Comic Sans MS', cursive, sans-serif;
        }
        .section-title {
          font-size: 1.15rem;
          font-weight: 600;
          margin: 1.2rem 0 0.7rem 0;
        }
        .img-row {
          display: flex;
          gap: 1.2rem;
          margin-bottom: 1.2rem;
        }
          .img-badge {
            position: absolute;
            top: 6px;
            right: 6px;
            background-color: #dc2626; /* Tailwind red-600 */
            color: white;
            font-size: 0.7rem;
            font-weight: bold;
            width: 20px;
            height: 20px;
            border-radius: 9999px;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 0 0 2px white; /* 배경 대비용 */
          }
        .img-upload {
          flex: 1;
          position: relative;
          background: #f3f4f6;
          border-radius: 6px;
          height: 120px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2.2rem;
          color: #bbb;
          flex-direction: column;
          cursor: pointer;
          border: 2px dashed #d1d5db;
          transition: all 0.2s ease;
        }
        .img-upload:hover {
          background: #e5e7eb;
          border-color: #9ca3af;
        }
        .img-label {
          font-size: 0.97rem;
          color: #222;
          margin-top: 0.3rem;
        }
        .input-row {
          margin-bottom: 0.7rem;
        }
        .time-input-row {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 0.7rem;
        }
        .time-input-col {
          flex: 1;
        }
        .time-label {
          font-size: 0.875rem;
          color: #374151;
          margin-bottom: 0.25rem;
          font-weight: 500;
        }
        .save-btn-row {
          margin: 1.2rem 0 0.7rem 0;
        }
        .info-text {
          font-size: 0.875rem;
          color: #888;
          text-align: center;
          margin-top: 1rem;
          line-height: 1.4;
        }
        .required-field {
          position: relative;
        }
        .required-field::after {
          content: '*';
          color: #dc2626;
          margin-left: 4px;
        }
        .save-btn-row button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .map-section {
          width: 99%;
          height: 250px;
          margin-top: 1rem;
          margin-bottom:1rem;
          border: 1px solid #666;
        }   
        
        .close_time{margin-bottom: 1px}
      `}</style>
      <div className="venue-container">
        <SketchHeader
          title={get('VENUE_SETUP_TITLE')}
          showBack={true}
          onBack={handleBack}
        />
        
        {/* 이미지 업로드 */}
        <div className="section-title">{get('VENUE_UPLOAD_IMAGES')}</div>
        <div className="img-row">
          {/* 
          // 예전 이미지 업로드
         <div
            className="img-upload"
            style={
              form.image_url
                ? {
                    backgroundImage: `url(${form.image_url})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    color: 'transparent' // + 기호 숨기기용
                  }
                : {}
            }
          >
            +
            <div className="img-label">{get('VENUE_LOGO')}</div>
          </div>

          <div
            className="img-upload"
            style={
              form.imgList && form.imgList.length > 0
                ? {
                    backgroundImage: `url(${form.imgList[0]})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    color: 'transparent'
                  }
                : {}
            }
          >
            +
            <div className="img-label">{get('VENUE_COVER_PHOTO')}</div>

            {// 빨간 동그라미 뱃지}
            {form.imgList && form.imgList.length > 0 && (
              <div className="img-badge">
                {form.imgList.length}
              </div>
            )}

            
          </div>
          */}
          <ImageUploader
              apiClient={ApiClient}
              containerAsUploader={true}
              uploadedImages={uploadedImages}
              onImagesChange={setUploadedImages}
              maxImages={1}
              imageHolderStyle={{ width: '125px', height: '125px' }}
              showRemoveButton={true}
              showPreview={false}
              initialImageUrl={form.image_url}
            />

            <div style={{}}>
            <PhotoGallery
              photoGalleryMode={{
                fetchList: async () => {
                  const response = await ApiClient.postForm('/api/getVenueGallery', {
                    venue_id: user?.venue_id || -1
                  });

                  const { data = [] } = response;

                  console.log('data fetch', data);

                  // 기존 DB 이미지 + 새로 추가된 이미지들 합치기
                  const dbImages = (data || []).map(item => item.url);
                  const dbContentId = (data || []).map(item => item.content_id);

                  const imgList = [...dbImages];
                  
                  return {images: imgList, contentId: dbContentId};
                },
                onUpload: async (file) => {
                  const response = await ApiClient.uploadImage(file);
                  const { content_id = false, accessUrl } = response;

                  if (content_id) {
                    // 임시로 galleryImages에 추가 (DB 저장 전까지)
                    setGalleryImages(prev => [...prev, accessUrl]);
                    setGalleryImagesContentId(prev => [...prev, content_id]);
                    setGalleryImagesMap(prev => [...prev, { url: accessUrl, contentId: content_id }]);


                     // venue 수정 데이터 준비
                     await ApiClient.postForm('/api/uploadVenueGallery', {
                      venue_id: user?.venue_id,
                      content_id: content_id
                    });

                  }


                },
                onDeleted:async ({img_url, content_id}) => {

                  console.log('deletedImageUrl', img_url, content_id);


                  const response = await ApiClient.postForm('/api/contentDelete', {
                    target:'venue',
                    content_id: content_id
                  });


                  const { success = false } = response;

                  console.log('response', response);





                  // galleryImages에서 삭제된 이미지 제거
                  setGalleryImages(prev => prev.filter(img => img !== img_url));
                  
                  // galleryImagesMap에서 해당 항목 제거하고 contentId 배열 업데이트
                  setGalleryImagesMap(prev => {
                    const filtered = prev.filter(item => item.url !== img_url);
                    setGalleryImagesContentId(filtered.map(item => item.content_id));
                    return filtered;
                  });

                }
              }}
              appendedImages={galleryImages}
              onAppendedImagesChange={setGalleryImages}
              onDeleted={({img_url, content_id}) => {

                console.log('deletedImageUrl', img_url, content_id, galleryImages);
                // galleryImages에서 삭제된 이미지 제거
                setGalleryImages(prev => prev.filter(img => img !== deletedImageUrl));
                
                // galleryImagesMap에서 해당 항목 제거하고 contentId 배열 업데이트
                setGalleryImagesMap(prev => {
                  const filtered = prev.filter(item => item.url !== deletedImageUrl);
                  setGalleryImagesContentId(filtered.map(item => item.contentId));
                  return filtered;
                });
              }}
            />  
            </div>






        </div>
        
        <div className="section-title required-field">{get('VENUE_INFORMATION')}</div>
        
        <div className="input-row">
          <div className="time-label">{get('title.text.14')}</div>
          <SketchInput
            name="name"
            value={form.name} style={{width: '50%'}}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder={get('VENUE_NAME_PLACEHOLDER')}
            error={errors.name}
          />
        </div>
        
        <div className="input-row" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom:'-15px' }}>
        <div style={{ flex: 8 }}>
          <div className="time-label">{get('DiscoverPage1.6')}</div>
          <SketchInput
            name="address" 
            value={form.address} 
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder={get('VENUE_ADDRESS_PLACEHOLDER')}
            error={errors.address}
          />
        </div>
        <div style={{ flex: 2 }}>
          <button
            onClick={handleClickSearchPoi}
            style={{
             padding: '4px 10px',
                fontSize: '0.75rem',
                backgroundColor: '#e5e7eb',
                border: '1px solid #ccc',
                borderRadius: '4px',
                cursor: 'pointer',
                height: '35px',
                width: '78px',
                marginTop: '3px'
            }}
          >
            {get('VENUE_EDIT_POI_BTN')}
          </button>
        </div>
      </div>

      

          <div className="map-section">
            <GoogleMapComponent
              places={form ? [form] : []}
              disableInteraction={true}
            />
          </div>

        <div className="input-row">
          <div className="time-label">{get('VENUE_PHONE_PLACEHOLDER')}</div>
          <SketchInput
            name="phone"
            value={form.phone}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder={get('VENUE_PHONE_PLACEHOLDER')}
            error={errors.phone}
          />
        </div>
        
        <div className="time-input-row">
          <div className="time-input-col">
            <div className="time-label">{get('VENUE_START_TIME')}</div>
            <SketchInput
              name="open_time" style={{width: '80%'}}
              type="time"
              value={form.open_time}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="09:00"
              error={errors.open_time}
            />
          </div>
          <div className="time-input-col">
            <div className="time-label">{get('VENUE_END_TIME')}</div>
            <SketchInput
              name="close_time" style={{width: '80%'}}
              type="time"
              value={form.close_time}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="22:00"
              error={errors.close_time} 
            />
          </div>
        </div>
        
        <div className="input-row">
            <div className="time-label">{get('VENUE_INTRO_PLACEHOLDER')}</div>
          <SketchInput
            name="description" 
            value={form.description || ''}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder={get('VENUE_INTRO_PLACEHOLDER')}
            as="textarea"
            rows={2}
            error={errors.description}
          />
        </div>
        
        <div className="save-btn-row">
          <SketchBtn 
            variant="event" 
            size="medium" 
            style={{ width: '100%' }}
            onClick={handleSave}
            disabled={isSubmitting}
          >
            <HatchPattern opacity={0.8} />
            {isSubmitting ? get('VENUE_SAVING') : get('VENUE_SAVE_ACTIVATE')}
          </SketchBtn>
        </div>
        
        <div className="info-text">
          * {get('VENUE_EDIT_ANYTIME')}
        </div>
      </div>
    </>
  );
};

export default VenueSetup;