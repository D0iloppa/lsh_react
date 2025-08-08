import React, { useEffect, useState, useCallback, useRef } from 'react';
import { User, Search } from 'lucide-react';
import SketchHeader from '@components/SketchHeader';
import SketchBtn from '@components/SketchBtn';
import HatchPattern from '@components/HatchPattern'
import SketchDiv from '@components/SketchDiv';
import SketchInput from '@components/SketchInput';
import { useMsg, useMsgGet, useMsgLang } from '@contexts/MsgContext';
import '@components/SketchComponents.css';
import LoadingScreen from '@components/LoadingScreen';

import Swal from 'sweetalert2';

import { useAuth } from '@contexts/AuthContext';
import ApiClient from '@utils/ApiClient';

import ImageUploader from '@components/ImageUploader';
import PhotoGallery from '@components/PhotoGallery_staff';

const roleOptions = [
  { value: 'hostess', label: 'Hostess' },
  { value: 'manager', label: 'Manager' },
  { value: 'other', label: 'Other' },
];

const CreateStaff = ({ navigateToPage, navigateToPageWithData, PAGES, goBack, pageData, ...otherProps }) => {

  const { user } = useAuth();
  const [errors, setErrors] = useState({});
  const { messages, isLoading, error, get, currentLang, setLanguage, availableLanguages, refresh } = useMsg();
  const [venue, setVenue] = useState(-1);
  
  // otherProps에서 staffInfo 추출
  const [staffInfo, setStaffInfo] = useState(otherProps?.staff || otherProps?.staffInfo || {});
  
  // 갤러리 데이터를 전역처럼 사용하기 위한 ref
  const staffGalleryDataRef = useRef([]);
  
  const [form, setForm] = useState({
    staff_id: staffInfo?.id || staffInfo?.staff_id || 0,
    name: '',
    username: '',
    password: '',
    contact: '',
    description:'',
    languages:'',
    role: '',
  });
  const [password, setPassword] = useState({
    confirm: ''
  });

  
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [galleryImages, setGalleryImages] = useState([]);
  const [galleryImagesContentId, setGalleryImagesContentId] = useState([]);
  const [galleryImagesMap, setGalleryImagesMap] = useState([]);
  const [galleryData, setGalleryData] = useState([]);
  const [lazyGalleryData, setLazyGalleryData] = useState([]);
  const [dbGalleryImages, setDbGalleryImages] = useState([]); // DB 이미지 URL 배열
  const [dbGalleryContentIds, setDbGalleryContentIds] = useState([]); // DB 이미지 contentId 배열


  const fetchStaffGallery = useCallback(async () => {
    try {
      const response = await ApiClient.postForm('/api/getStaffGallery', {
        staff_id: form?.staff_id || user?.staff_id || user?.id
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
    } catch (error) {
      console.error('갤러리 불러오기 실패:', error);
      return [];
    }
  }, []); // 의존성 배열 비우기


  const handlePasswordReset = async() => {
     if (!password.confirm.trim()) {
        setErrors(prev => ({ 
          ...prev, 
          confirm: get('VALIDATION_PASSWORD_REQUIRED')
        }));
        return;
      }
      if (password.confirm.length < 6) {
        setErrors(prev => ({ 
          ...prev, 
          confirm: get('VALIDATION_PASSWORD_MIN_LENGTH')
        }));
        return;
      }

      setErrors(prev => ({ ...prev, confirm: '' }));
      
    try {
      const response = await ApiClient.postForm('/api/UpdatePassword', {
        login_type: 'id',
        account_type: 'staff',
        login_id: form.username,
        passwd: password.confirm,
        rePasswd: password.confirm,
      });
  
      if (response.success) {
        Swal.fire({
          title: get('SWAL_SUCCESS_TITLE'),
          text: get('PASSWORD_UPDATE_SUCCESS'),
          icon: 'success'
        });
        
        // 폼 초기화
        setPassword({ current: '', new: '', confirm: '' });
      } else {
        Swal.fire({
          title: get('SWAL_ERROR_TITLE'),
          text: response.message || get('PASSWORD_UPDATE_FAILED'),
          icon: 'error'
        });
      }
    } catch (error) {
      console.error('Password update error:', error);
      Swal.fire({
        title: get('SWAL_ERROR_TITLE'),
        text: get('PASSWORD_UPDATE_FAILED'),
        icon: 'error'
      });
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPassword(prev => ({ ...prev, [name]: value }));

      if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }

  };

  // pageData에서 스태프 정보 불러오기
  useEffect(() => {
    if (staffInfo && Object.keys(staffInfo).length > 0) {
      console.log('EditStaff staffInfo:', staffInfo);
      
      setForm(prev => ({
        ...prev,
        staff_id: staffInfo.id || staffInfo.staff_id,
        name: staffInfo.name || '',
        username: staffInfo.login_id || '',
        password: '', // 비밀번호는 수정 시 빈 값으로
        contact: staffInfo.contact || staffInfo.phone || '',
        description: staffInfo.description || '',
        languages:staffInfo.languages
      }));
    }
  }, [staffInfo]); // staffInfo 객체만 의존성으로 설정

  // otherProps에서 초기 staffInfo 설정
  useEffect(() => {
    if (otherProps?.staff || otherProps?.staffInfo) {
      setStaffInfo(otherProps?.staff || otherProps?.staffInfo);
    }
  }, [otherProps?.staff, otherProps?.staffInfo]);

  // 컴포넌트 마운트 시 갤러리 데이터 불러오기
  useEffect(() => {
    if (form.staff_id && form.staff_id > 0) {
      setIsLoadingData(true);
      fetchStaffGallery().finally(() => {
        setIsLoadingData(false);
      });
    }
  }, [form.staff_id]); // fetchStaffGallery 제거

  const handleAddStaff = async () => {
    try {
      setIsSaving(true);

      const allContentIds = [];

      // 1. 프로필 이미지 content_id 처리
      const imageContentId = uploadedImages.length > 0 
        ? parseInt(uploadedImages[0].contentId, 10) 
        : 0;

      // 프로필 이미지가 없고 기존 프로필 이미지도 없는 경우 경고
      if (imageContentId === 0 && staffInfo.profile_content_id == 0) {
        Swal.fire({
          title: get('PROFILE_IMAGE_TITLE'),
          text: get('NOT_PHOTO_MAIN'),
          icon: 'error'
        });
        return;
      }

      console.log('갤러리 전체 데이터:', staffGalleryDataRef.current);


      // 2. 메인 이미지 content_id 추가
      if (imageContentId !== 0) {
        allContentIds.push(imageContentId);
      } 
      /*
      if (imageContentId !== 0) {
        allContentIds.push(imageContentId);
      } else if (staffInfo.profile_content_id) {
        allContentIds.push(staffInfo.profile_content_id);
      }
      */

      // 3. 갤러리 이미지 content_id 추가 (DB에서 가져온 데이터)
      const galleryIdsFromRef = (staffGalleryDataRef.current || [])
        .map(item => item.content_id)
        .filter(id => id !== undefined && id !== null);

      if (galleryIdsFromRef.length > 0) {
        allContentIds.push(...galleryIdsFromRef);
      }

      // 4. 새로 업로드된 갤러리 이미지 content_id 추가
      if (galleryImagesContentId.length > 0) {
        allContentIds.push(...galleryImagesContentId);
      }

      console.log("✅ 전체 content_id 목록 (메인 -> 갤러리):", allContentIds);

      const contentIdString = allContentIds.join(',');

      // 프로필 이미지 content_id 결정
      /*
      const profileContentIdToUse = imageContentId !== 0 
        ? imageContentId 
        : staffInfo.profile_content_id;

      const payload = {
        staff_id: form.staff_id,
        name: form.name || '',
        contact: form.contact || '',
        description: form.description,
        profile_content_id: profileContentIdToUse,
        contentIdString: contentIdString,
      };
      */
       // 프로필 이미지 content_id 결정
       const profileContentIdToUse = imageContentId !== 0 
       ? imageContentId 
       : null;


     const payload = {
       staff_id: form.staff_id,
       name: form.name || '',
       contact: form.contact || '',
       description: form.description,
       contentIdString: contentIdString,
       languages:form.languages
     };

     // profile_content_id가 null이 아닐 때만 payload에 추가
     if (profileContentIdToUse !== null) {
       payload.profile_content_id = profileContentIdToUse;
     }

      console.log('저장 payload:', payload);

      const response = await ApiClient.postForm('/api/updateStaffV2', payload);

      if (response.success) {
        // 갤러리 상태 초기화
        setGalleryImages([]);
        setGalleryImagesContentId([]);
        setGalleryImagesMap([]);

        Swal.fire({
          title: get('PROFILE_UPDATE_SUCCESS_TITLE'),
          text: get('PROFILE_UPDATE_SUCCESS_MESSAGE'),
          icon: 'success',
          timer: 1500
        });

        // staffInfo 업데이트
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
      console.error('Staff update error:', error);
      Swal.fire({
        title: get('PROFILE_UPDATE_ERROR_TITLE'),
        text: get('PROFILE_UPDATE_ERROR_MESSAGE'),
        icon: 'error'
      });
    } finally {
      setIsSaving(false);
    }
  };

    useEffect(() => {
        if (messages && Object.keys(messages).length > 0) {
          console.log('✅ Messages loaded:', messages);
          // setLanguage('en'); // 기본 언어 설정
          console.log('Current language set to:', currentLang);
          window.scrollTo(0, 0);
        }
      }, [messages, currentLang]);

  useEffect(() => {
    setVenue(user?.venue_id);
    console.log('loginUser', user, venue);
  }, [venue]); // venue_id가 변경될 때만 실행


  return (
    <>
      <style jsx="true">{`
        .create-container {
          max-width: 28rem;
          margin: 0 auto;
          background: #fff;
          min-height: 95vh;
          font-family: 'BMHanna', 'Comic Sans MS', cursive, sans-serif;
        }
        .form-title {
          position:relative;
          font-size: 1.3rem;
          font-weight: 600;
          padding: 0.3rem;
          margin: 1.2rem 0 0.2rem 0;
          text-align: left;
        }
        .form-box {
          padding: 1.1rem 1.2rem 1.2rem 1.2rem;
        }
        .form-label {
          font-size: 1rem;
          margin-bottom: 0.2rem;
          font-weight: 500;
        }
        .form-field {
          margin-bottom: 0.7rem;
        }
        .role-row {
          display: flex;
          gap: 1.2rem;
          margin: 0.7rem 0 1.1rem 0;
        }
        .role-radio {
          margin-right: 0.3rem;
        }
        .form-actions {
          display: flex;
          gap: 0.7rem;
          justify-content: flex-end;
          margin-top: 1.1rem;
        }
          .error-message {
          color: #dc2626;
          font-size: 0.875rem;
          margin-top: 0.25rem;
          margin-bottom: 0.5rem;
        }

        .image-upload-section {
          margin-bottom: 1.2rem;
        }
        .image-upload-title {
          font-size: 1rem;
          font-weight: 500;
          margin-bottom: 0.5rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          width: 100%;
          gap: 1rem;
        }
        .image-upload-title > div:first-child {
          flex: 1;
          font-weight: 600;
        }
        .image-upload-title > div:last-child {
          flex-shrink: 0;
          min-width: 80px;
        }
        .image-upload-content {
          display: flex;
          align-items: center;
          justify-content: space-around;
          gap: 1rem;
          margin: 1rem 0;
        }

          .language-checkbox-wrapper {
          display: grid;
          grid-template-columns: repeat(3, 1fr); /* 1줄에 3개 */
          gap: 0.5rem 1rem;
        }

        .language-checkbox-wrapper label.language-checkbox-item {
          display: flex;
          align-items: center;
          font-size: 0.85rem;
          gap: 0.4rem;
          cursor: pointer;
          padding: 0.3rem 0.5rem;
          border-radius: 4px;
          transition: background-color 0.2s ease;
        }

        .language-checkbox-wrapper label.language-checkbox-item:hover {
          background-color: #f0f0f0;
        }

        .language-checkbox-wrapper input[type="checkbox"] {
          width: 16px;
          height: 16px;
        }
      `}</style>
          <div className="create-container">
          <SketchHeader
            title={get('STAFF_EDIT_HEADER_TITLE')}
            showBack={true}
            onBack={goBack}
          />

          <div className="form-title">{get('STAFF_EDIT_HEADER_TITLE')}</div>

          <SketchDiv className="form-box">
            <HatchPattern opacity={0.4} />

            <div className="form-field">


          <div className="image-upload-section">
            <div className="image-upload-title">
              <div>
                {get('PROFILE_IMAGE_TITLE')}
              </div>
              <div>
                {/*
                <SketchBtn  onClick={() => handleDetail()} variant="secondary" size='small' style={{width: '100px', height: '40px', fontSize: '0.9rem', whiteSpace: 'nowrap'}}>
                <HatchPattern opacity={0.6} /> <Search size={12}/> {get('VIEW_SEARCH')}</SketchBtn> 
                */}
              </div>
            </div>
            <div className="image-upload-content">
              <ImageUploader
                apiClient={ApiClient}
                usingCameraModule={false}
                containerAsUploader={true}
                uploadedImages={uploadedImages}
                onImagesChange={(images) => {
                  console.log('ImageUploader onImagesChange:', images);
                  setUploadedImages(images);
                }}
                maxImages={1}
                imageHolderStyle={{ width: '125px', height: '125px' }}
                showRemoveButton={true}
                showPreview={false}
                initialImageUrl={staffInfo?.image_url || staffInfo?.img || form?.image_url || form?.profile_image}
                onUploadSuccess={(response) => {
                  console.log('ImageUploader 업로드 성공:', response);
                }}
                onUploadError={(error) => {
                  console.error('ImageUploader 업로드 실패:', error);
                }}
              />
              <div style={{}}>
                <PhotoGallery
                  photoGalleryMode={{
                    fetchList: fetchStaffGallery,
                    onUpload: async (file) => {
                      console.log('이미지 업로드 시작:', file);
                      setIsLoadingData(true);

                      try {
                        const response = await ApiClient.uploadImage(file);
                        console.log('업로드 응답:', response);
                        const { content_id = false, accessUrl } = response;
                        
                        if (content_id) {
                          setGalleryImages(prev => [...prev, accessUrl]);
                          setGalleryImagesContentId(prev => [...prev, content_id]);
                          setGalleryImagesMap(prev => [...prev, { url: accessUrl, contentId: content_id }]);
                        }

                        const payload = {
                          staff_id: form?.staff_id || user?.staff_id || user?.id,
                          content_id: content_id,
                        };

                        console.log('upsertStaffContent payload:', payload);
                        const res = await ApiClient.postForm('/api/upsertStaffContent', payload);
                        console.log('upsertStaffContent 응답:', res);
                        
                        if (res.success) {
                          // 업로드 성공 후 갤러리 데이터 새로고침
                          await fetchStaffGallery();
                          
                          // 로컬 state 초기화
                          setGalleryImages([]);
                          setGalleryImagesContentId([]);
                          setGalleryImagesMap([]);
                        }

                      } catch (error) {
                        console.error('이미지 업로드 실패:', error);
                      } finally {
                        setIsLoadingData(false);
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
                          staff_id: form?.staff_id || user?.staff_id || user?.id,
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










              <div className="form-label">{get('STAFF_USERNAME_LABEL') || '로그인 아이디'}</div>
              <SketchInput
                name="username"
                value={form.username}
                onChange={handleChange}
                placeholder={get('STAFF_LOGIN_ID_PLACEHOLDER') || '로그인 아이디를 입력하세요'}
                readOnly
                style={{ 
                  backgroundColor: '#f9fafb', 
                  color: '#6b7280',
                  cursor: 'not-allowed'
                }}
              />
            </div>

            <div className="form-field">
              <div className="form-label">{get('STAFF_NAME_LABEL')}</div>
              <SketchInput
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder={get('STAFF_NAME_PLACEHOLDER')}
              />
            </div>
                
             <div className="input-row" style={{marginBottom: '0.3rem'}}>
                      <div className="input-row" style={{ display: 'none' }}>
                        <SketchInput
                          name="languages"
                          value={form.languages}
                          onChange={handleChange}
                          placeholder={get('LANGUAGES_PLACEHOLDER')}
                        />
                      </div>
                      {/* 언어 선택 체크박스 */}
                    <div className="input-row" style={{ marginBottom: '1rem' }}>
              <div style={{ marginBottom: '0.5rem', fontWeight: '500' }}>{get('LANGUAGES_LABEL')}</div>
              <div className="language-checkbox-wrapper">
                {[
                  { code: 'kr', label: get('language.name.korean') },
                  { code: 'en', label: get('language.name.english') },
                  { code: 'vi', label: get('language.name.vietnamese') },
                  { code: 'ja', label: get('language.name.japanese') },
                  { code: 'cn', label: get('LANGUAGE_CHINESE') },
                ].map(lang => {
                  const isChecked = form.languages.split(',').includes(lang.code);
                  return (
                    <label key={lang.code} className="language-checkbox-item">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => {
                          const selected = form.languages ? form.languages.split(',') : [];
                          let updated;
                          if (e.target.checked) {
                            updated = [...new Set([...selected, lang.code])];
                          } else {
                            updated = selected.filter(code => code !== lang.code);
                          }
                          const langStr = updated.join(',');
                          setForm(prev => {
                            const updatedForm = { ...prev, languages: langStr };
                            return updatedForm;
                          });
                        }}
                      />
                      {lang.label}
                    </label>
                  );
                })}
              </div>
            </div>
             </div>













            
            <div className="form-field"  style={{marginBottom: '0.3rem', display: 'none'}}>
              <div className="form-label">{get('STAFF_CONTACT_LABEL')}</div>
              <SketchInput
                name="contact"
                value={form.contact}
                onChange={handleChange}
                placeholder={get('STAFF_CONTACT_PLACEHOLDER')}
              />
            </div>
            
            {/* 암호변경 버튼 */}
            <div className="form-field" style={{marginTop:'25px'}}>
              <div className="form-label">{get('STAFF_PASSWORD_LABEL')}</div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <div style={{ marginTop: '16px', flex: 1 }}>
                  <SketchInput
                    name="confirm"
                    value={password.confirm}
                    onChange={handlePasswordChange}
                    placeholder={get('SETTINGS_NEW_PASSWORD_PLACEHOLDER')}
                    type="password" 
                    style={{height:'40px', fontFamily: 'none'}}
                    error={errors.confirm}
                  />
                </div>
                <div>
                  <SketchBtn 
                    variant="secondary" 
                    size="small" 
                    onClick={handlePasswordReset}
                    style={{ height: '40px', padding: '8px 16px', fontSize: '12px', whiteSpace: 'nowrap' }}
                  >
                    {get('SETTINGS_SAVE_BUTTON')}
                  </SketchBtn>
                </div>
              </div>
            </div>

             <div className="input-row">
                      <div style={{marginBottom: '0.3rem'}}>{get('STAFF_INTRODUCE_LABEL')}</div>
                      <SketchInput
                        name="description"
                        value={form.description}
                        onChange={handleChange}
                        placeholder={get('STAFF_INTRODUCE_LABEL')}
                        as="textarea"
                        rows={8}
                      />
                    </div>

            <div className="form-actions">
              <SketchBtn 
                variant="event" 
                size="small" 
                onClick={handleAddStaff}
                disabled={isSaving}
              >
                {isSaving ? '저장 중...' : get('STAFF_SAVE_BUTTON')}
              </SketchBtn>
              <SketchBtn variant="danger" size="small" onClick={goBack}>
                {get('STAFF_CANCEL_BUTTON')}
              </SketchBtn>
            </div>
          </SketchDiv>
        </div>
         <LoadingScreen
            variant="cocktail"
            subText="Loading..."
            isVisible={isLoading || isLoadingData}
          />
    </>
  );
};

export default CreateStaff; 