import React, { useEffect, useState, useCallback } from 'react';
import SketchHeader from '@components/SketchHeader';
import SketchBtn from '@components/SketchBtn';
import SketchDiv from '@components/SketchDiv';
import SketchInput from '@components/SketchInput';
import HatchPattern from '@components/HatchPattern';
import '@components/SketchComponents.css';
import { User } from 'lucide-react';

import { useAuth } from '@contexts/AuthContext';
import { useMsg, useMsgGet, useMsgLang } from '@contexts/MsgContext';
import ApiClient from '@utils/ApiClient';
import Swal from 'sweetalert2';
import ImageUploader from '@components/ImageUploader';
import PhotoGallery from '@components/PhotoGallery_staff';

const EditProfile = ({ navigateToPageWithData, PAGES, goBack, pageData, ...otherProps }) => {

  const { user, isLoggedIn } = useAuth();
  const { messages, isLoading, error, get, currentLang, setLanguage, availableLanguages, refresh } = useMsg();

  const renderCount = React.useRef(0);
  renderCount.current += 1;
  console.log('🔄 EditProfile 렌더링 #', renderCount.current);

  const [staffInfo, setStaffInfo] = useState({});
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [galleryImages, setGalleryImages] = useState([]);
  const [galleryImagesContentId, setGalleryImagesContentId] = useState([]);
  const [galleryImagesMap, setGalleryImagesMap] = useState([]);
  const [galleryData, setGalleryData] = useState([]);
  const [lazyGalleryData, setLazyGalleryData] = useState([]);
  const [dbGalleryImages, setDbGalleryImages] = useState([]); // DB 이미지 URL 배열
  const [dbGalleryContentIds, setDbGalleryContentIds] = useState([]); // DB 이미지 contentId 배열

  const [form, setForm] = useState({
    nickname: '',
    birth_year: '',
    languages: '',
    intro: '',
    profile_content_id:'',
  });

  useEffect(() => {
    if (messages && Object.keys(messages).length > 0) {
      console.log('✅ Messages loaded:', messages);
      console.log('Current language set to:', currentLang);
      window.scrollTo(0, 0);
    }
  }, []);

  useEffect(() => {
    const fetchStaffData = async () => {
      try {
        setIsLoadingData(true);
        const response = await ApiClient.get('/api/getVenueStaff', {
          params: { staff_id: user?.staff_id || user?.id }
        });
        console.log('Staff data:', response);
        if (response) {
          setStaffInfo(response);
          setForm({
            nickname: response.nickname || response.name || '',
            birth_year: response.birth_year || '',
            nationality: response.nationality || '',
            languages: response.languages || '',
            intro: response.description || response.intro || '',
            profile_content_id: response.profile_content_id || '',
          });

          if (response.profile_image) {
            setUploadedImages([{
              contentId: response.profile_content_id,
              previewUrl: response.profile_image_url || `/api/getImage?content_id=${response.profile_image}`,
              name: 'profile_image.jpg',
              size: 0,
              isExisting: true
            }]);
          }
        }
      } catch (error) {
        console.error('Failed to fetch staff data:', error);
        if (user) {
          setForm({
            nickname: user.nickname || user.name || '',
            birth_year: user.birth_year || '',
            languages: user.languages || '',
            intro: user.description || user.intro || '',
          });
        }
      } finally {
        setIsLoadingData(false);
      }
    };

    if (user && (user.staff_id || user.id)) {
      fetchStaffData();
    }
  }, []);

  const allContentIdsRef = React.useRef([]);

  const staffGalleryDataRef = React.useRef([]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);

      const allContentIds = [];

        const imageContentId = uploadedImages.length > 0 
          ? parseInt(uploadedImages[0].contentId, 10) 
          : 0;


          
      if ( imageContentId === 0 && staffInfo.profile_content_id == 0  ) {

        Swal.fire({
          title: get('PROFILE_IMAGE_TITLE'),
          text: get('NOT_PHOTO_MAIN'),
          icon: 'error'
        });

        return;
      } 

      console.log('갤러리 전체 데이터:', staffGalleryDataRef.current);




        // 1. 메인 이미지 content_id 추가
        if (imageContentId !== 0) {
          allContentIds.push(imageContentId);
        } else if (staffInfo.profile_content_id) {
          allContentIds.push(staffInfo.profile_content_id);
        }

        // ✅ 중간 로그 출력 + 값 갱신
        console.log('갤러리 전체 데이터:', staffGalleryDataRef.current);

        // 필요 시 중간에 갤러리 content_id를 따로 추출해 갱신
        const galleryIdsFromRef = (staffGalleryDataRef.current || [])
          .map(item => item.content_id)
          .filter(id => id !== undefined && id !== null);

        // 기존 배열과 중복되지 않도록 추가
       // let galleryImagesContentId = [...new Set([...galleryImagesContentId, ...galleryIdsFromRef])];


        
        // 2. 갤러리 이미지 content_id 추가
        if (galleryIdsFromRef.length > 0) {
          allContentIds.push(...galleryIdsFromRef);
        }

        console.log("✅ 전체 content_id 목록 (메인 -> 갤러리):", allContentIds);


        const contentIdString = allContentIds.join(',');
      


      const profileContentIdToUse = imageContentId !== 0 
          ? imageContentId 
          : staffInfo.profile_content_id;

        const payload = {
          staff_id: user?.staff_id || user?.id,
          nickname: form.nickname,
          birth_year: form.birth_year,
          languages: form.languages,
          description: form.intro,
          profile_content_id: profileContentIdToUse,
          contentIdString:contentIdString,
        };

      const response = await ApiClient.postForm('/api/updateStaffV2', payload);

      if (response.success) {
       /* if (galleryImagesContentId.length > 0) {
          for (const contentId of galleryImagesContentId) {
            try {
              await ApiClient.postForm('/api/uploadStaffProfile', {
                staff_id: user?.staff_id || user?.id,
                content_id: contentId
              });
            } catch (error) {
              console.error('Gallery image upload failed:', error);
            }
          }
        }
        */

        setGalleryImages([]);
        setGalleryImagesContentId([]);

        Swal.fire({
          title: get('PROFILE_UPDATE_SUCCESS_TITLE'),
          text: get('PROFILE_UPDATE_SUCCESS_MESSAGE'),
          icon: 'success',
          timer: 1500
        });

        setStaffInfo(prev => ({
          ...prev,
          ...form,
          profile_content_id: imageContentId
        }));
      } else {
        Swal.fire({
          title: get('PROFILE_UPDATE_ERROR_TITLE'),
          text: response.message || get('PROFILE_UPDATE_ERROR_MESSAGE'),
          icon: 'error'
        });
      }
    } catch (error) {
      console.error('Profile update error:', error);
      Swal.fire({
        title: get('PROFILE_UPDATE_ERROR_TITLE'),
        text: get('PROFILE_UPDATE_ERROR_MESSAGE'),
        icon: 'error'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const fetchStaffGallery = useCallback(async () => {
  const response = await ApiClient.postForm('/api/getStaffGallery', {
    staff_id: user?.staff_id || user?.id
  });

  const { data = [] } = response;
  console.log('📥 /api/getStaffGallery 응답:', data);

  // 👉 전역처럼 사용하기 위해 useRef에 저장
  staffGalleryDataRef.current = data;

  // DB 이미지와 contentId 분리 저장
  const images = data.map(item => item.url);
  const contentIds = data.map(item => item.content_id || item.id);

  setDbGalleryImages(images);
  setDbGalleryContentIds(contentIds);

  console.log('📌 staffGalleryDataRef:', staffGalleryDataRef.current);

  return images;
}, [user]);
  if (isLoadingData) {
    return (
      <div className="editprofile-container">
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <div>{get('LOADING_PROFILE_DATA')}</div>
        </div>
      </div>
    );
  }

  return (
    <>
     <style jsx="true">{`
        .editprofile-container {
          margin-top: 1rem;
          padding: 1rem;
          max-width: 28rem;
          margin: 0 auto;
          background: #fff;
          min-height: 100vh;
        }
        .profile-row {
          display: flex;
          gap: 1.2rem;
          margin-bottom: 1.2rem;
        }
        .profile-photo {
          flex: 1.2;
          background: #f3f4f6;
          border-radius: 6px;
          height: 140px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2.2rem;
          color: #bbb;
          flex-direction: column;
        }
        .gallery-col {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .gallery-title {
          font-size: 1rem;
          font-weight: 500;
          margin-bottom: 0.3rem;
        }
        .gallery-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.3rem;
        }
        .gallery-img {
          background: #f3f4f6;
          border-radius: 6px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.2rem;
          color: #bbb;
        }
        .gallery-delete {
          margin-top: 0.3rem;
          width: 100%;
        }
        .input-row {
          margin-bottom: 0.7rem;
        }
        .save-btn-row {
          margin: 1.2rem 0 0.7rem 0;
        }
        .image-upload-section {
          margin-bottom: 1.2rem;
        }
        .image-upload-title {
          font-size: 1rem;
          font-weight: 500;
          margin-bottom: 0.5rem;
        }
      `}</style>

      <SketchHeader
        title={<><User size={20} style={{marginRight:'7px',marginBottom:'-3px'}}/>{get('EDIT_PROFILE_TITLE')}</>}
        showBack={true}
        onBack={goBack}
      />
      <div className="editprofile-container">
        <div className="image-upload-section">
          <div className="image-upload-title">{get('PROFILE_IMAGE_TITLE')}</div>
          <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-around'}}>
            <ImageUploader
              apiClient={ApiClient}
              usingCameraModule={false}
              containerAsUploader={true}
              uploadedImages={uploadedImages}
              onImagesChange={setUploadedImages}
              maxImages={1}
              imageHolderStyle={{ width: '125px', height: '125px' }}
              showRemoveButton={true}
              showPreview={false}
              initialImageUrl={staffInfo?.image_url || staffInfo?.profile_image}
            />
            <div style={{}}>
              <PhotoGallery
                photoGalleryMode={{
                  fetchList: fetchStaffGallery,
                  onUpload: async (file) => {
                    const response = await ApiClient.uploadImage(file);
                    const { content_id = false, accessUrl } = response;
                    if (content_id) {
                      setGalleryImages(prev => [...prev, accessUrl]);
                      setGalleryImagesContentId(prev => [...prev, content_id]);
                      setGalleryImagesMap(prev => [...prev, { url: accessUrl, contentId: content_id }]);
                    }
                  }
                }}
                appendedImages={galleryImages}
                onAppendedImagesChange={setGalleryImages}
                onDeleted={(deletedImageUrl) => {
                  console.log('삭제 요청:', deletedImageUrl);
                  
                  // DB 이미지인지 확인
                  const dbImageIndex = dbGalleryImages.indexOf(deletedImageUrl);
                  const isDbImage = dbImageIndex !== -1;
                  
                  if (isDbImage) {
                    // DB 이미지인 경우
                    const contentId = dbGalleryContentIds[dbImageIndex];
                    console.log('DB 이미지 삭제:', { deletedImageUrl, contentId });
                    
                    if (contentId) {
                      ApiClient.postForm('/api/contentDelete', {
                        staff_id: user?.staff_id || user?.id,
                        target:'staff',
                        content_id: contentId
                      }).then(response => {
                        console.log('DB 삭제 성공:', response);
                        // DB에서 삭제 성공 후 로컬 상태 업데이트
                        setDbGalleryImages(prev => prev.filter((_, idx) => idx !== dbImageIndex));
                        setDbGalleryContentIds(prev => prev.filter((_, idx) => idx !== dbImageIndex));
                      }).catch(error => {
                        console.error('DB 삭제 실패:', error);
                      });
                    }
                  } else {
                    // 새로 업로드된 이미지인 경우
                    console.log('새 이미지 삭제:', deletedImageUrl);
                    const imageInfo = galleryImagesMap.find(item => item.url === deletedImageUrl);
                    if (imageInfo) {
                      // galleryImagesContentId에서도 제거
                      setGalleryImagesContentId(prev => prev.filter(id => id !== imageInfo.contentId));
                    }
                  }
                  
                  // 로컬 상태에서 제거
                  setGalleryImages(prev => prev.filter(img => img !== deletedImageUrl));
                  setGalleryImagesMap(prev => prev.filter(item => item.url !== deletedImageUrl));
                }}
              />
            </div>
          </div>
          <div style={{padding:'10px'}}>{get('PHOTO_GAL_DESCRIPTION_1')}</div>
        </div>

        <div className="input-row">
          <div style={{marginBottom: '0.3rem'}}>{get('NICKNAME_LABEL')}</div>
          <SketchInput
            name="nickname"
            value={form.nickname}
            onChange={handleChange}
            placeholder={get('NICKNAME_PLACEHOLDER')}
          />
        </div>
        <div className="input-row">
          <div style={{marginBottom: '0.3rem'}}>{get('BIRTH_YEAR_LABEL')}</div>
          <SketchInput
            name="birth_year"
            value={form.birth_year}
            onChange={handleChange}
            placeholder={get('BIRTH_YEAR_PLACEHOLDER')}
            type="number"
          />
        </div>
        <div className="input-row">
          <div style={{marginBottom: '0.3rem'}}>{get('LANGUAGES_LABEL')}</div>
          <SketchInput
            name="languages"
            value={form.languages}
            onChange={handleChange}
            placeholder={get('LANGUAGES_PLACEHOLDER')}
          />
        </div>
        <div className="input-row">
          <div style={{marginBottom: '0.3rem'}}>{get('SELF_INTRODUCTION_LABEL')}</div>
          <SketchInput
            name="intro"
            value={form.intro}
            onChange={handleChange}
            placeholder={get('SELF_INTRO_PLACEHOLDER')}
            as="textarea"
            rows={8}
          />
        </div>
        <div className="save-btn-row">
          <SketchBtn 
            variant="event" 
            size="medium" 
            style={{ width: '100%' }}
            onClick={handleSave}
            disabled={isSaving}
          >
            <HatchPattern opacity={0.6} />
            {isSaving ? get('SAVING_BUTTON') : get('SAVE_CHANGES_BUTTON')}
          </SketchBtn>
        </div>
      </div>
    </>
  );
};

export default EditProfile;
