import React, { useState, useEffect, useRef } from 'react';
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

import { Search, Settings } from 'lucide-react';
import MenuManagement, { useMenuManagement } from '@components/Menu/MenuManagement';

import Swal from 'sweetalert2';
import ImageUploader from '@components/ImageUploader';
import PhotoGallery from '@components/PhotoGallery';
import LoadingScreen from '@components/LoadingScreen';

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
  const { user, updateVenueId } = useAuth();
  const { messages, isLoading, error, get, currentLang, setLanguage, availableLanguages, refresh } = useMsg();
  const [mode, setMode] = useState(otherProps.mode || 'create');
  const [venueId, setVenueId] = useState(otherProps.venue_id || null);
  const [form, setForm] = useState(defaultForm);
  const [imageCount, setImageCount] = useState(0);

  const TMP_VENUE_DATA_KEY = 'TMP_VENUE_DATA';

  // ref로 폼 값 관리
  const formRef = useRef({
    name: '',
    address: '',
    phone: '',
    open_time: '',
    close_time: '',
    description: '',
    // ... 다른 필드들
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);


  const [isSaving, setIsSaving] = useState(false);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [galleryImages, setGalleryImages] = useState([]);
  const [galleryImagesContentId, setGalleryImagesContentId] = useState([]);
  const [galleryImagesMap, setGalleryImagesMap] = useState([]); // {url, contentId} 형태로 관리
  const [showMenuManagement, setShowMenuManagement] = useState(false);
  const [menuVenueId, setMenuVenueId] = useState(null);

  const [lazyGalleryData, setLazyGalleryData] = useState([]); // 포토 갤러리
  const [lazyMenuData, setLazyMenuData] = useState([]); // 메뉴 관리 모달에서 추가된 메뉴 데이터를 저장할 상태
  const [isUploading, setIsUploading] = useState(false);
  const [topImgCount, setTopImgCount] = useState(0);

  // 메뉴 갤러리 전용 상태 관리
  const [menuGalleryImages, setMenuGalleryImages] = useState([]);
  const [menuGalleryImagesContentId, setMenuGalleryImagesContentId] = useState([]);
  const [menuGalleryImagesMap, setMenuGalleryImagesMap] = useState([]); // {url, contentId} 형태로 관리

  // 메뉴 갤러리 API 함수들
  const menuGalleryApi = {
    // 메뉴판 이미지 목록 조회
    getMenuImages: async () => {
      try {
        
        if(!venueId) return [];
        
        const response = await ApiClient.getVenueMenuList(venueId);
        return response.menuList || [];
      } catch (error) {
        console.error('메뉴판 이미지 조회 API 오류:', error);
        throw error;
      }
    },

    // 메뉴판 이미지 업로드
    uploadMenuImage: async (file) => {
      try {
        // 1. 먼저 이미지를 contentUpload API로 업로드
        const uploadResponse = await ApiClient.uploadImage(file);
        
        if (uploadResponse.success && uploadResponse.content_id) {
          // accessUrl을 우선 사용하고, 없으면 기존 필드 사용
          const imageUrl = uploadResponse.accessUrl || uploadResponse.image_url || uploadResponse.url;
          
          // venueId가 있고 유효한 경우에만 메뉴 등록
          if (venueId && venueId > 0) {
            // 2. 업로드된 content_id로 메뉴 등록
            const menuResponse = await ApiClient.insertVenueMenu(venueId, uploadResponse.content_id);
            
            if (menuResponse.success) {
              return {
                success: true,
                content_id: uploadResponse.content_id,
                image_url: imageUrl,
                item_id: menuResponse.item_id,
                message: '메뉴판 이미지가 성공적으로 업로드되었습니다.'
              };
            } else {
              throw new Error('메뉴 등록에 실패했습니다.');
            }
          } else {
            // venueId가 없는 경우 임시 저장
            return {
              success: true,
              content_id: uploadResponse.content_id,
              image_url: imageUrl,
              isTemporary: true,
              message: '메뉴판 이미지가 임시로 저장되었습니다. 매장 등록 후 자동으로 등록됩니다.'
            };
          }
        } else {
          throw new Error('이미지 업로드에 실패했습니다.');
        }
      } catch (error) {
        console.error('메뉴판 이미지 업로드 API 오류:', error);
        throw error;
      }
    },

    // 메뉴판 이미지 삭제
    deleteMenuImage: async (contentId) => {
      try {
        const response = await ApiClient.postForm('/api/contentDelete', {
          target: 'menu',
          content_id: contentId
        });
        return {
          success: response.success || true,
          message: response.message || '메뉴판 이미지가 성공적으로 삭제되었습니다.'
        };
      } catch (error) {
        console.error('메뉴판 이미지 삭제 API 오류:', error);
        throw error;
      }
    }
  };

  const navigate = useNavigate();

  const location = useLocation();
  const fromManagerTuto = location.state?.from === 'managerTuto';

    useEffect(() => {
        if (messages && Object.keys(messages).length > 0) {
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

         

          let updatedForm = {
            ...form,
            ...venueData,
            open_time: formatTimeForInput(venueData.open_time),
            close_time: formatTimeForInput(venueData.close_time),
            // top_img: Array.isArray(venueData.image_url) 
            //   ? venueData.image_url 
            //   : venueData.image_url ? [venueData.image_url] : []
          };


          const tempData = sessionStorage.getItem(TMP_VENUE_DATA_KEY);
          if (tempData) {
            const parsedTempData = JSON.parse(tempData);
            console.log('�� 세션스토리지에서 임시 데이터 발견:', parsedTempData);
            
            // DB데이터에 임시 데이터 오버라이딩
            updatedForm = {
              ...updatedForm,
              ...parsedTempData
            };
            
            // 세션스토리지 클리어
            setTimeout(()=>{
              sessionStorage.removeItem(TMP_VENUE_DATA_KEY);
            },100);
            console.log('��️ 세션스토리지 클리어 완료');
            
          }









          console.log("updatedForm", updatedForm)
          setForm(updatedForm);

          setTopImgCount(venueData.image_url ? 1 : 0);
          
          // formRef도 함께 업데이트
          Object.assign(formRef.current, updatedForm);
        } catch (e) {
          console.error('Venue data fetch error:', e);
        }
      };
      fetchVenue();
    } else {
      // create 모드일 때는 form을 비움
      setForm(defaultForm);
       setTopImgCount(0);
      // formRef도 함께 초기화
      Object.assign(formRef.current, defaultForm);
    }

    // messages, currentLang 등은 별도 처리
  }, [mode, venueId]);




  // form이 변경될 때마다 ref도 업데이트
  // useEffect(() => {
  //   Object.assign(formRef.current, form);
  // }, [form]);



  useEffect(() => {
    const contentId = uploadedImages[0]?.contentId;

    if(contentId){
      setForm(prev => ({ ...prev, newProfile: contentId }));
      
      // formRef도 함께 업데이트
      formRef.current.newProfile = contentId;
    }

  }, [uploadedImages]);


  console.log("uploadedImages",uploadedImages.length)


  // handleInputChange - ref와 form 상태 모두 업데이트
  const handleInputChange = (name, value) => {
    formRef.current[name] = value;

    // 세션스토리지는 유지 (임시저장용)
    const updatedData = { ...formRef.current, [name]: value };
    sessionStorage.setItem(TMP_VENUE_DATA_KEY, JSON.stringify(updatedData));

    /*
    setForm(prev => {
      const updatedForm = { ...prev, [name]: value };
      sessionStorage.setItem(TMP_VENUE_DATA_KEY, JSON.stringify(updatedForm));
      return updatedForm;
    });
    */


  };


  const handleBack = () => {

    //goBack();

    sessionStorage.removeItem(TMP_VENUE_DATA_KEY);

  if (fromManagerTuto) {
    navigate('/manager');
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


    return '';
    
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

    newErrors.name = validateName(formRef.current.name);
    newErrors.address = validateAddress(formRef.current.address);
    newErrors.phone = validatePhone(formRef.current.phone);
    newErrors.open_time = validateOpenTime(formRef.current.open_time);
    newErrors.close_time = validateCloseTime(formRef.current.close_time);
    newErrors.description = validateIntro(formRef.current.description);

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
    // formRef에서 데이터 읽어오기
    const venueData = {
      cat_id: 1,
      name: formRef.current.name.trim(),
      address: formRef.current.address.trim(),
      phone: formRef.current.phone.trim(),
      open_time: formatTimeToSeconds(formRef.current.open_time.trim()),    // HH:MM:SS 형식으로 변환
      close_time: formatTimeToSeconds(formRef.current.close_time.trim()),  // HH:MM:SS 형식으로 변환
      description: formRef.current.description.trim()
    };
    

    // newProfile이 있을 때만 추가
    if (form.newProfile) {
      venueData.newProfile = form.newProfile;
    }
    
    // API 호출
    const response = await ApiClient.postForm('/api/register_venue', venueData);
    

    const {venue_id = false} = response;

    if (venue_id) {
      // venue_id를 받았으면 user의 venue_id 업데이트
      updateVenueId(venue_id);
      
      // lazyGalleryData와 lazyMenuData 확인 및 출력
      console.log('=== Venue ID 발급 후 Lazy Data 확인 ===');
      console.log('발급된 venue_id:', venue_id);
      console.log('lazyGalleryData:', lazyGalleryData);
      console.log('lazyMenuData:', lazyMenuData);
      console.log('lazyGalleryData 길이:', lazyGalleryData?.length || 0);
      console.log('lazyMenuData 길이:', lazyMenuData?.length || 0);
      console.log('=====================================');
      
      // lazyMenuData가 있으면 메뉴 등록
      if (lazyMenuData && lazyMenuData.length > 0) {
        try {
          await Promise.all(
            lazyMenuData.map(async (menu) => {
              await ApiClient.insertVenueMenu(venue_id, menu.content_id);
            })
          );
          console.log(`${lazyMenuData.length}개의 임시 메뉴가 성공적으로 등록되었습니다.`);
          // lazyMenuData 초기화
          setLazyMenuData([]);
        } catch (error) {
          console.error('임시 메뉴 등록 실패:', error);
          // 메뉴 등록 실패해도 venue 등록은 성공으로 처리
        }
      }
    }
    
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
      
      setMode('edit');

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
      params: { keyword: formRef.current.address }
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
    
    // formRef도 함께 업데이트
    //Object.assign(formRef.current, updatedForm);
    
    // venue 수정 데이터 준비 (formRef에서 읽어오기)
    const venueData = {
      cat_id: 1,
      venue_id: user?.venue_id,
      manager_id: user?.manager_id,
      name: formRef.current.name.trim(),
      address: formRef.current.address.trim(),
      phone: formRef.current.phone.trim(),
      profile_content_id:formRef.current.profile_content_id,
      latitude: lat,
      longitude: lng,
      open_time: formatTimeToSeconds(formRef.current.open_time.trim()),
      close_time: formatTimeToSeconds(formRef.current.close_time.trim()),
      description: formRef.current.description.trim()
    };

    if(updatedForm.newProfile){
      venueData.profile_content_id = updatedForm.newProfile;
    }




    
    if(!venueData.profile_content_id){
      // 기존 alert('no profile'); 부분을 다음과 같이 변경
      await Swal.fire({
        title: get('VENUE_PROFILE_REQUIRED_TITLE'),
        text: get('VENUE_PROFILE_REQUIRED_TEXT'),
        icon: 'warning',
        confirmButtonText: get('SWAL_CONFIRM_BUTTON'),
        confirmButtonColor: '#3085d6'
      });
      return;
    }



    console.log('update!!', venueData, formRef.current);

    const updateResponse = await ApiClient.postForm('/api/venueEdit', venueData);


      
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

      const {venue_id = false} = updateResponse;
      if (venue_id) {
        // venue_id를 받았으면 user의 venue_id 업데이트
        updateVenueId(venue_id);
        
        // lazyGalleryData와 lazyMenuData 확인 및 출력
        console.log('=== Venue Update 후 Lazy Data 확인 ===');
        console.log('업데이트된 venue_id:', venue_id);
        console.log('lazyGalleryData:', lazyGalleryData);
        console.log('lazyMenuData:', lazyMenuData);
        console.log('=====================================');

        // lazyMenuData가 있으면 메뉴 등록
        if (lazyMenuData && lazyMenuData.length > 0) {
          try {
            await Promise.all(
              lazyMenuData.map(async (menu) => {
                await ApiClient.insertVenueMenu(venue_id, menu.content_id);
              })
            );
            console.log(`${lazyMenuData.length}개의 임시 메뉴가 성공적으로 등록되었습니다.`);
            // lazyMenuData 초기화
            setLazyMenuData([]);
          } catch (error) {
            console.error('임시 메뉴 등록 실패:', error);
            // 메뉴 등록 실패해도 venue 등록은 성공으로 처리
          }
        }

        // lazyGalleryData가 있으면 갤러리 이미지 등록
        if (lazyGalleryData && lazyGalleryData.length > 0) {
          try {
            await Promise.all(
              lazyGalleryData.map(async (gallery) => {
                await ApiClient.postForm('/api/uploadVenueGallery', {
                  venue_id: venue_id,
                  content_id: gallery.content_id
                });
              })
            );
            console.log(`${lazyGalleryData.length}개의 임시 갤러리 이미지가 성공적으로 등록되었습니다.`);
            // lazyGalleryData 초기화
            setLazyGalleryData([]);
          } catch (error) {
            console.error('임시 갤러리 이미지 등록 실패:', error);
            // 갤러리 등록 실패해도 venue 등록은 성공으로 처리
          }
        }
      }
      
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


  const handleMenu = (venueId) => {
    /*
    if (venueId == null || venueId == -1) {
      Swal.fire({
        title: get('SWAL_VENUE_REG1'),
        text: get('SWAL_VENUE_REG2'),
        icon: 'warning',
        confirmButtonText: get('BUTTON_CONFIRM')
      });
      return;
    }
    */
   
    // 메뉴 관리 모달 열기
    setMenuVenueId(venueId);
    setShowMenuManagement(true);
  };


  const handleDetail = (venueId) => {
    if ( venueId == null ||  venueId == -1) {
      Swal.fire({
        title: get('SWAL_VENUE_REG1'),
        text: get('SWAL_VENUE_REG2'),
        icon: 'warning',
        confirmButtonText: get('BUTTON_CONFIRM')
      });
      
      return;
    }


    const updatedData = { ...formRef.current};
    sessionStorage.setItem(TMP_VENUE_DATA_KEY, JSON.stringify(updatedData));




    if(PAGES) {
      navigateToPageWithData(PAGES.DISCOVERVENUE, {venueId: venueId});
    } else {
      let prefix ='/manager';
      let params ='navigateTo=DISCOVERVENUE&chatRoomType=manager&venueId='+venueId;
      // 쿼리스트링 생성 (navigateTo, chatRoomType 등 불필요한 값은 제외 가능)
   
      // alert(`${prefix}?${params} 페이지로 이동 예정`);
      // 예: /manager?navigateTo=CHATTING&room_sn=48&name=DORIS&chatRoomType=manager
      navigate(`${prefix}?${params}`);
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
        //await insertVenue();
        await updateVenue();
      } else if (mode === 'edit') {
        await updateVenue();
      }

      // 성공하고 나서
      handleBack();


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

// const getImageCount = (topImg) => {
//   if (Array.isArray(topImg)) {
//     return topImg.length;
//   }
//   return topImg ? 1 : 0;
// };

  const handleClickSearchPoi = async () => {
  try {
    const response = await ApiClient.get('/api/getPoi', {
      params: { keyword: formRef.current.address }
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
    
    // formRef도 함께 업데이트
    formRef.current.latitude = lat;
    formRef.current.longitude = lng;

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
      {/* 메뉴 관리 모달 */}
      {showMenuManagement && (
        <MenuManagement 
          venueId={menuVenueId} 
          onMenuUpdate={() => {
            // 메뉴 업데이트 완료
          }}
          onClose={(lazyInsertMenu) => {
            setShowMenuManagement(false);
            setMenuVenueId(null);
            // lazyInsertMenu 리스트를 상태로 저장
            if (lazyInsertMenu && lazyInsertMenu.length > 0) {
              setLazyMenuData(lazyInsertMenu);
            }
          }}
          user={user}
          get={get}
          lazyInsertMenu={lazyMenuData} // 이전 lazyMenuData 전달
        />
      )}

      <style jsx="true">{`
        .venue-container {
          margin-bottom: 2rem;
          max-width: 28rem;
          background: #fff;
          min-height: 100vh;
          font-family: 'BMHanna', 'Comic Sans MS', cursive, sans-serif;
        }
        .section-title {
          padding: 0.5rem 1rem;
          font-size: 1.15rem;
          font-weight: 600;
          margin: 1.2rem 0 0.7rem 0;
        }
        .img-row {
          padding: 0.5rem 1rem;
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
          padding: 0.5rem 1rem;
        }
        .time-input-row {
          padding: 0.5rem 1rem;
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
          padding: 0.5rem 1rem;
          margin: 1.2rem 0 0.7rem 0;
        }
        .info-text {
          font-size: 0.875rem;
          color: #888;
          text-align: center;
          margin-top: 1rem;
          line-height: 1.4;
          padding: 3px;
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
          width: 95%;
          height: 250px;
          margin: 1rem auto;
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
        <div className="section-title" style={{lineHeight: '2', display: 'flex', justifyContent: 'space-between'}}>
           <div>
    {get('VENUE_UPLOAD_IMAGES')} 
    <div style={{
      fontSize: '0.8rem', 
      color: '#666', 
      marginLeft: '0.5rem',
      fontWeight: 'normal'
    }}>
      ({get('PHOTO_INFO6')} : {topImgCount+imageCount}{get('text.cnt.1')})
    </div>
  </div>
          <SketchBtn  onClick={() => handleDetail(venueId)} variant="secondary" size='small' style={{width: '30%', height: '40px'}}>
            <HatchPattern opacity={0.6} /> <Search size={12}/> {get('VIEW_SEARCH')}</SketchBtn></div>
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
              venue_id = {user.venue_id}
              lazyGalleryData={lazyGalleryData}
              photoGalleryMode={{
                fetchList: async () => {
                  const response = await ApiClient.postForm('/api/getVenueGallery', {
                    venue_id: user?.venue_id || -1
                  });

                  const { data = [] } = response;

                  // 기존 DB 이미지
                  const dbImages = (data || []).map(item => item.url);
                  const dbContentId = (data || []).map(item => item.content_id);

                  // lazyGalleryData의 이미지들 추가
                  const lazyImages = lazyGalleryData.map(item => item.image_url);
                  const lazyContentIds = lazyGalleryData.map(item => item.content_id);

                  // DB 이미지 + lazy 이미지 합치기
                  const imgList = [...dbImages, ...lazyImages];
                  const contentIdList = [...dbContentId, ...lazyContentIds];

                  // 이미지 갯수 업데이트
                  setImageCount(imgList.length);
                  
                  return {images: imgList, contentId: contentIdList};
                },
               onUpload: async (file) => {
                    try {
                      setIsUploading(true);

                      const response = await ApiClient.uploadImage(file);
                      const { content_id = false, accessUrl } = response;

                      if (content_id) {
                        if (user?.venue_id) {
                          // DB에 저장 전, 프론트 UI에 임시 표시
                          setGalleryImages(prev => [...prev, accessUrl]);
                          setGalleryImagesContentId(prev => [...prev, content_id]);
                          setGalleryImagesMap(prev => [...prev, { url: accessUrl, contentId: content_id }]);
                          setImageCount(prev => prev + 1);

                          // 백엔드에 저장
                          await ApiClient.postForm('/api/uploadVenueGallery', {
                            venue_id: user?.venue_id,
                            content_id: content_id
                          });
                        } else {
                          // venue_id가 없을 경우 lazy 저장
                          setLazyGalleryData(prev => [...prev, {
                            content_id: content_id,
                            image_url: accessUrl,
                            uploaded_at: new Date().toISOString()
                          }]);

                          setGalleryImages(prev => [...prev, accessUrl]);
                          setImageCount(prev => prev + 1);
                        }
                      }
                    } catch (error) {
                      console.error('Upload failed:', error);
                      // 실패 시 사용자에게 알림 추가해도 좋습니다.
                    } finally {
                      setIsUploading(false);
                    }
                  },
                onDeleted:async ({img_url, content_id}) => {
                  const response = await ApiClient.postForm('/api/contentDelete', {
                    target:'venue',
                    content_id: content_id
                  });

                  const { success = false } = response;

                  console.log('dddd', response);

                  setImageCount(prev => prev - 1);

                  // galleryImages에서 삭제된 이미지 제거
                  setGalleryImages(prev => {
                    const newImages = prev.filter(img => img !== img_url);
                    
                    // 이미지가 없으면 overlay 닫기
                    if (newImages.length === 0) {
                      console.log('모든 이미지 삭제됨, overlay 닫기');
                      // overlay를 닫는 방법이 필요합니다
                      // 현재 overlay 상태를 확인하고 닫기
                      return [];
                    }
                    
                    return newImages;
                  });
                  
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

        <div style={{padding:'10px'}}>
          {get('PHOTO_GAL_DESCRIPTION_1')}
        </div>
        
        <div className="section-title required-field">{get('VENUE_INFORMATION')}</div>
        
        <div className="input-row">
          <div className="time-label">{get('title.text.14')}</div>
          <SketchInput
            name="name"
            defaultValue={form.name} style={{width: '50%'}}
            onChange={(e) => handleInputChange('name', e.target.value)}
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
            defaultValue={form.address} 
            onChange={(e) => handleInputChange('address', e.target.value)}
            onBlur={handleBlur}
            placeholder={get('VENUE_ADDRESS_PLACEHOLDER')}
            error={errors.address}
          />
        </div>
        <div style={{ flex: 2 }}>
          <button className="search-poi-btn"
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
            defaultValue={form.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            onBlur={handleBlur}
            placeholder={get('VENUE_PHONE_PLACEHOLDER')}
            error={errors.phone}
          />
        </div>
        
        <div className="time-input-row">
          <div className="time-input-col">
            <div className="time-label">{get('VENUE_START_TIME')}</div>
            <SketchInput
              name="open_time" style={{width: '80%', height: '40px'}}
              type="time"
              defaultValue={form.open_time}
              onChange={(e) => handleInputChange('open_time', e.target.value)}
              onBlur={handleBlur}
              placeholder="09:00"
              error={errors.open_time}
            />
          </div>
          <div className="time-input-col">
            <div className="time-label">{get('VENUE_END_TIME')}</div>
            <SketchInput
              name="close_time" style={{width: '80%', height: '40px'}}
              type="time"
              defaultValue={form.close_time}
              onChange={(e) => handleInputChange('close_time', e.target.value)}
              onBlur={handleBlur}
              placeholder="22:00"
              error={errors.close_time} 
            />
          </div>
        </div>

        {/* 메뉴 입력 */}
        <div className="input-row">
          <div>
              <div className="time-label">
                  {/*get('MENU')*/}
                  {get('MENU_MANAGEMENT')}
              </div>
             
             {
              /*
              <SketchBtn
                onClick={() => handleMenu(venueId)} 
                variant="secondary" size='small'
              >
                <HatchPattern opacity={0.6} /> 
                <Settings size={12}/> {get('MENU_MANAGEMENT')}
              </SketchBtn>
              */
              }
            




            <PhotoGallery
              venue_id={user.venue_id}
              lazyGalleryData={[]}
              photoGalleryMode={{
                  fetchList: async () => {
                    try {
                      const menuList = await menuGalleryApi.getMenuImages();
                      console.log('🔍 fetchList - menuList:', menuList);

                      if (!Array.isArray(menuList)) {
                        console.error('🔍 menuList is not an array:', menuList);
                        return {images: [], contentId: []};
                      }

                      const imgList = menuList.map(item => item.url);
                      const contentIdList = menuList.map(item => item.content_id);
                      
                      // lazyMenuData에 있는 임시 데이터도 추가
                      if (lazyMenuData && lazyMenuData.length > 0) {
                        console.log('🔍 lazyMenuData 추가:', lazyMenuData);
                        lazyMenuData.forEach(item => {
                          imgList.push(item.image_url);
                          contentIdList.push(item.content_id);
                        });
                      }
                      
                      console.log('🔍 fetchList - imgList:', imgList);
                      console.log('🔍 fetchList - contentIdList:', contentIdList);

                      return {images: imgList, contentId: contentIdList};
                    } catch (error) {
                      console.error('메뉴판 이미지 조회 실패:', error);
                      return {images: [], contentId: []};
                    }
                  },
                onUpload: async (file) => {
                  try {
                    setIsUploading(true);

                    if (user?.venue_id) {
                      const response = await menuGalleryApi.uploadMenuImage(file);
                    
                    
                      if (response.success) {
                        // 업로드 성공 후 갤러리 데이터 새로고침
                        const updatedMenuList = await menuGalleryApi.getMenuImages();
                        
                        // 메뉴 갤러리 전용 상태 업데이트
                        const images = updatedMenuList.map(item => item.url);
                        const contentIds = updatedMenuList.map(item => item.content_id);
                        const imageMap = updatedMenuList.map(item => ({ 
                          url: item.url, 
                          contentId: item.content_id 
                        }));
                        
                        setMenuGalleryImages(images);
                        setMenuGalleryImagesContentId(contentIds);
                        setMenuGalleryImagesMap(imageMap);
                        
                        // 이미지 카운트 업데이트
                        setImageCount(updatedMenuList.length);
                        
                        console.log('메뉴판 이미지 업로드 성공:', response.message);
                      }
                    
                      return response;

                    } else {
                      // venue_id가 없을 경우 lazy 저장
                      const uploadResponse = await ApiClient.uploadImage(file);
                      
                      if (uploadResponse.success && uploadResponse.content_id) {
                        const imageUrl = uploadResponse.accessUrl || uploadResponse.image_url || uploadResponse.url;
                        
                        setLazyMenuData(prev => [...prev, {
                          content_id: uploadResponse.content_id,
                          image_url: imageUrl,
                          uploaded_at: new Date().toISOString()
                        }]);

                        setMenuGalleryImages(prev => [...prev, imageUrl]);
                        setImageCount(prev => prev + 1);
                        
                        return {
                          success: true,
                          content_id: uploadResponse.content_id,
                          image_url: imageUrl,
                          isTemporary: true,
                          message: '메뉴판 이미지가 임시로 저장되었습니다. 매장 등록 후 자동으로 등록됩니다.'
                        };
                      }
                    }
                    
                  } catch (error) {
                    console.error('메뉴판 이미지 업로드 실패:', error);
                    throw error;
                  } finally {
                    setIsUploading(false);
                  }
                },
                onDeleted: async ({img_url, content_id}) => {
                  try {
                    console.log('삭제 요청:', { img_url, content_id });
                    
                    if (user?.venue_id) {
                      // venue_id가 있는 경우 DB에서 삭제
                      if (content_id) {
                        const response = await menuGalleryApi.deleteMenuImage(content_id);
                        
                        if (response.success) {
                          console.log('DB 삭제 성공:', response.message);
                          
                          // 삭제 성공 후 갤러리 데이터 새로고침
                          const updatedMenuList = await menuGalleryApi.getMenuImages();
                          
                          // 메뉴 갤러리 전용 상태 업데이트
                          const images = updatedMenuList.map(item => item.url);
                          const contentIds = updatedMenuList.map(item => item.content_id);
                          const imageMap = updatedMenuList.map(item => ({ 
                            url: item.url, 
                            contentId: item.content_id 
                          }));
                          
                          setMenuGalleryImages(images);
                          setMenuGalleryImagesContentId(contentIds);
                          setMenuGalleryImagesMap(imageMap);
                          
                          // 이미지 카운트 업데이트
                          setImageCount(updatedMenuList.length);
                        }
                      } else {
                        console.error('삭제할 content_id가 없습니다.');
                      }
                    } else {
                      // venue_id가 없는 경우 lazyMenuData에서 제거
                      setLazyMenuData(prev => prev.filter(item => item.image_url !== img_url));
                      setMenuGalleryImages(prev => prev.filter(img => img !== img_url));
                      setImageCount(prev => Math.max(0, prev - 1));
                      
                      console.log('임시 메뉴 삭제 완료:', img_url);
                    }
                  } catch (error) {
                    console.error('메뉴판 이미지 삭제 실패:', error);
                  }
                }
              }}
              appendedImages={menuGalleryImages}
              onAppendedImagesChange={setMenuGalleryImages}
            /> 


          </div>
        </div>



        
        <div className="input-row">
            <div className="time-label">{get('VENUE_INTRO_PLACEHOLDER')}</div>
          <SketchInput
            name="description"
            defaultValue={form.description || ''}
            onChange={(e) => handleInputChange('description', e.target.value)}
            onBlur={handleBlur}
            placeholder={get('VENUE_INTRO_PLACEHOLDER')}
            as="textarea"
            rows={8}
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

            {isUploading && (
            <LoadingScreen
              variant="cocktail"
              isVisible={true}
              subText="Uploading..."
            />
          )}
    </>
  );
};

export default VenueSetup;