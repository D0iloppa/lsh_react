import React, { useEffect, useState } from 'react';
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
import PhotoGallery from '@components/PhotoGallery';

const EditProfile = ({ navigateToPageWithData, PAGES, goBack, pageData, ...otherProps }) => {

  const { user, isLoggedIn } = useAuth();
  const { messages, isLoading, error, get, currentLang, setLanguage, availableLanguages, refresh } = useMsg();

  const [staffInfo, setStaffInfo] = useState({});
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [galleryImages, setGalleryImages] = useState([]);
  const [galleryImagesContentId, setGalleryImagesContentId] = useState([]);
  const [galleryImagesMap, setGalleryImagesMap] = useState([]); // {url, contentId} 형태로 관리
  

  const [form, setForm] = useState({
    nickname: '',
    birth_year: '',
    languages: '',
    intro: '',
  });

  useEffect(() => {
    if (messages && Object.keys(messages).length > 0) {
      console.log('✅ Messages loaded:', messages);
      console.log('Current language set to:', currentLang);
      window.scrollTo(0, 0);
    }
  }, [messages, currentLang]);

  useEffect(() => {
    fetchStaffData();
  }, []);

  const fetchStaffData = async () => {
    try {
      setIsLoadingData(true);
      
      // 스태프 정보 가져오기
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
        });

        // 기존 이미지가 있다면 uploadedImages에 추가
        if (response.profile_image) {
          setUploadedImages([{
            contentId: response.profile_image,
            previewUrl: response.profile_image_url || `/api/getImage?content_id=${response.profile_image}`,
            name: 'profile_image.jpg',
            size: 0,
            isExisting: true // 기존 이미지 표시
          }]);
        }
      }
    } catch (error) {
      console.error('Failed to fetch staff data:', error);
      // 에러 시 user 객체에서 기본값 설정
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
  try {
    setIsSaving(true);
    
    const imageContentId = uploadedImages.length > 0 
      ? parseInt(uploadedImages[0].contentId, 10) 
      : 0;

      const payload = {
        staff_id: user?.staff_id || user?.id,
        nickname: form.nickname,
        birth_year: form.birth_year,
        languages: form.languages,
        description: form.intro,
        profile_content_id: imageContentId, // 단일 long 값 (0 또는 실제 ID)
      };

      console.log('payload', payload);

    const response = await ApiClient.postForm('/api/updateStaff', payload);

    if (response.success) {
      // 성공 후 갤러리 이미지들 DB에 저장
      if (galleryImagesContentId.length > 0) {
        for (const contentId of galleryImagesContentId) {
          try {
            await ApiClient.postForm('/api/uploadStaffGallery', {
              staff_id: user?.staff_id || user?.id,
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
      
      Swal.fire({
        title: get('PROFILE_UPDATE_SUCCESS_TITLE'),
        text: get('PROFILE_UPDATE_SUCCESS_MESSAGE'),
        icon: 'success',
        timer: 1500
      });
      
      // 업데이트된 데이터로 staffInfo 갱신
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
        title={
          <>
            <User size={20} style={{marginRight:'7px',marginBottom:'-3px'}}/>
            {get('EDIT_PROFILE_TITLE')}
          </>
        }
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
                fetchList: async () => {
                  const response = await ApiClient.postForm('/api/getStaffGallery', {
                    staff_id: user?.staff_id || user?.id
                  });

                  const { data = [] } = response;

                  console.log('data', data);

                  // 기존 DB 이미지 + 새로 추가된 이미지들 합치기
                  const dbImages = (data || []).map(item => item.url);
                  return [...galleryImages, ...dbImages];
                },
                onUpload: async (file) => {
                  const response = await ApiClient.uploadImage(file);
                  const { content_id = false, accessUrl } = response;

                  if (content_id) {
                    // 임시로 galleryImages에 추가 (DB 저장 전까지)
                    setGalleryImages(prev => [...prev, accessUrl]);
                    setGalleryImagesContentId(prev => [...prev, content_id]);
                    setGalleryImagesMap(prev => [...prev, { url: accessUrl, contentId: content_id }]);
                  }
                }
              }}
              appendedImages={galleryImages}
              onAppendedImagesChange={setGalleryImages}
              onDeleted={(deletedImageUrl) => {
                console.log('deletedImageUrl', deletedImageUrl, galleryImages);
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
            rows={4}
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