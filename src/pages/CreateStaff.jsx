import React, { useEffect, useState, useCallback, useRef } from 'react';
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
  
  // 이미지 관련 상태들 (staff_id 없이 임시 관리)
  const [uploadedImages, setUploadedImages] = useState([]);
  const [galleryImages, setGalleryImages] = useState([]);
  const [galleryImagesContentId, setGalleryImagesContentId] = useState([]);
  const [galleryImagesMap, setGalleryImagesMap] = useState([]);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [form, setForm] = useState({
    name: '',
    username: '',
    password: '',
    contact: '',
    description:'',
    languages:'',
    role: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));

      // 입력 시 해당 필드의 에러 메시지 제거
      if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // 폼 검증 함수
  const validateForm = () => {
    const newErrors = {};

    // 강제생성
    let {name} = form;

    const now = new Date();
    const yyyy = now.getFullYear();
    const MM = String(now.getMonth() + 1).padStart(2, "0");
    const dd = String(now.getDate()).padStart(2, "0");
    const HH = String(now.getHours()).padStart(2, "0");
    const mm = String(now.getMinutes()).padStart(2, "0");
    const ss = String(now.getSeconds()).padStart(2, "0");

    const timestamp = `${yyyy}${MM}${dd}${HH}${mm}${ss}`;

    // userName 생성
    const userName = `${name}_${timestamp}`;

    setForm(prev => ({
      ...prev,
      username: userName,
      password: userName
    }));


    console.log('valid', form);

    // 사용자명 검증
    if (!form.username || !form.username.trim()) {
      newErrors.username = get('STAFF_USERNAME_PLACEHOLDER');
    }

    // 비밀번호 검증
    if (!form.password.trim()) {
      newErrors.password = get('VALIDATION_PASSWORD_REQUIRED');
    } else if (form.password.length < 6) {
      newErrors.password = get('VALIDATION_PASSWORD_MIN_LENGTH');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // staff_id 등록 후 이미지 연결 함수
  const connectImagesToStaff = async (staff_id) => {
    try {
      console.log('🔄 이미지 연결 시작 - staff_id:', staff_id);

      const allContentIds = [];

      // 1. 프로필 이미지 content_id 처리
      const imageContentId = uploadedImages.length > 0 
        ? parseInt(uploadedImages[0].contentId, 10) 
        : 0;

      // 2. 메인 이미지 content_id 추가
      if (imageContentId !== 0) {
        allContentIds.push(imageContentId);
      }

      // 3. 갤러리 이미지 content_id 추가
      if (galleryImagesContentId.length > 0) {
        allContentIds.push(...galleryImagesContentId);
      }

      console.log("✅ 전체 content_id 목록 (메인 -> 갤러리):", allContentIds);

      const contentIdString = allContentIds.join(',');

      // 프로필 이미지 content_id 결정
      const profileContentIdToUse = imageContentId !== 0 
        ? imageContentId 
        : 0;

      // 4. 스태프 정보 업데이트 (이미지 포함)
      const payload = {
        staff_id: staff_id,
        name: form.name || '',
        contact: form.contact || '',
        description: form.description,
        profile_content_id: profileContentIdToUse,
        contentIdString: contentIdString,
       languages:form.languages

      };

      console.log('이미지 연결 payload:', payload);

      const response = await ApiClient.postForm('/api/updateStaffV2', payload);

      if (response.success) {
        console.log('🎉 모든 이미지 연결 완료');
        return true;
      } else {
        console.error('❌ 이미지 연결 실패:', response.message);
        return false;
      }

    } catch (error) {
      console.error('❌ 이미지 연결 중 오류:', error);
      return false;
    }
  };

  const handleAddStaff = async () => {

    // 폼 검증
    if (!validateForm()) {
      return; // 검증 실패 시 등록 중단
    }

    try {
      setIsSaving(true);

      // 1. 스태프 등록 API 호출 (이미지 없이)
      const registerResponse = await ApiClient.postForm('/api/register', {
        login_type: 'id',
        account_type: 'staff',
        venue_id: venue,
        fullnm: form.name,
        login_id: form.username,
        passwd: form.password,
        contact: form.contact,
        created_by: user?.id,
        description: form.description,
      });

      console.log('register response:', registerResponse);

      const { registerInfo = false, error = false, isDuplicate = false } = registerResponse;

      if (error || isDuplicate) {
        Swal.fire({
          title: get('REGISTER_ERROR_DUPLICATE') || '이미 사용 중인 이메일입니다',
          icon: 'error',
          confirmButtonText: get('SWAL_CONFIRM_BUTTON')
        });
        return;
      }

      if (registerInfo && registerInfo.owner_id) {
        const staff_id = registerInfo.owner_id; // account_id를 staff_id로 사용
        
        // 2. 이미지 연결 (별도 함수 호출)
        const imageConnectionSuccess = await connectImagesToStaff(staff_id);

        // 3. 성공 메시지 및 상태 초기화
        setUploadedImages([]);
        setGalleryImages([]);
        setGalleryImagesContentId([]);
        setGalleryImagesMap([]);

        Swal.fire({
          title: get('SWAL_STAFF_REG'),
          text: get('SWAL_STAFF_REG_SUCESS'),
          icon: 'success',
          confirmButtonText: get('btn.back.1')
        }).then((result) => {
          if (result.isConfirmed || result.isDismissed) {
            goBack();
          }
        });
      } else {
        Swal.fire({
          title: get('SWAL_STAFF_REG_ERROR'),
          text: get('SCHEDULE_SAVE_ERROR_MESSAGE'),
          icon: 'error',
          confirmButtonText: get('btn.back.1')
        });
      }

    } catch (error) {
      console.error('Staff registration error:', error);
      Swal.fire({
        title: get('SWAL_STAFF_REG_ERROR'),
        text: get('SCHEDULE_SAVE_ERROR_MESSAGE'),
        icon: 'error',
        confirmButtonText: get('btn.back.1')
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
          padding: 1rem;
        }
        .form-title {
          position:relative;
          font-size: 1.3rem;
          font-weight: 600;
          padding: 0.3rem;          
          text-align: left;
        }
        .form-box {
          padding: 1.1rem 1.2rem 1.2rem 1.2rem;
          margin-bottom: 1rem;
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
            title={get('STAFF_CREATE_HEADER_TITLE')}
            showBack={true}
            onBack={goBack}
          />
          <div className="form-title">{get('STAFF_CREATE_FORM_TITLE')}</div>
          <SketchDiv className="form-box">
            <HatchPattern opacity={0.4} />

            {/* 이미지 업로드 섹션 */}
            <div className="image-upload-section">
              <div className="image-upload-title">
                <div>
                  {get('PROFILE_IMAGE_TITLE')}
                </div>
                <div>
                  {/* 추가 버튼이 필요한 경우 여기에 */}
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
                      fetchList: () => Promise.resolve([]), // 등록 시에는 빈 배열 반환
                      onUpload: async (file) => {
                        console.log('갤러리 이미지 업로드 시작:', file);
                        setIsLoadingData(true);

                        try {
                          const response = await ApiClient.uploadImage(file);
                          console.log('갤러리 업로드 응답:', response);
                          const { content_id = false, accessUrl } = response;
                          
                          if (content_id) {
                            setGalleryImages(prev => [...prev, accessUrl]);
                            setGalleryImagesContentId(prev => [...prev, content_id]);
                            setGalleryImagesMap(prev => [...prev, { url: accessUrl, contentId: content_id }]);
                          }

                        } catch (error) {
                          console.error('갤러리 이미지 업로드 실패:', error);
                        } finally {
                          setIsLoadingData(false);
                        }
                      }
                    }}
                    appendedImages={galleryImages}
                    onAppendedImagesChange={setGalleryImages}
                    onDeleted={(deletedImageUrl) => {
                      console.log('갤러리 이미지 삭제 요청:', deletedImageUrl);
                      
                      // 로컬 상태에서 제거
                      setGalleryImages(prev => prev.filter(img => img !== deletedImageUrl));
                      
                      // content_id도 제거
                      const imageInfo = galleryImagesMap.find(item => item.url === deletedImageUrl);
                      if (imageInfo) {
                        setGalleryImagesContentId(prev => prev.filter(id => id !== imageInfo.contentId));
                        setGalleryImagesMap(prev => prev.filter(item => item.url !== deletedImageUrl));
                      }
                    }}
                  />
                </div>
              </div>
              <div style={{padding:'10px'}}>{get('PHOTO_GAL_DESCRIPTION_1')}</div>
            </div>
            
            <div className="form-field" style={{"display":'none'}}>
              <div className="form-label">{get('STAFF_USERNAME_LABEL')}</div>
              <SketchInput
                name="username"
                value={form.username}
                onChange={handleChange}
                placeholder={get('STAFF_USERNAME_PLACEHOLDER')}
                error={errors.username}
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













            <div className="form-field" style={{display:"none"}}>
              <div className="form-label">{get('STAFF_PASSWORD_LABEL')}</div>
              <SketchInput
                name="password" style={{fontFamily: 'none'}}
                value={form.password}
                onChange={handleChange}
                placeholder={get('STAFF_PASSWORD_PLACEHOLDER')}
                type="password"
                error={errors.password}
              />
            </div>
            <div className="form-field" style={{marginBottom: '0.3rem', display: 'none'}}>
              <div className="form-label">{get('STAFF_CONTACT_LABEL')}</div>
              <SketchInput
                name="contact"
                value={form.contact}
                onChange={handleChange}
                placeholder={get('STAFF_CONTACT_PLACEHOLDER')}
              />
            </div>
            <div className="form-label" style={{marginBottom: '0.3rem', display: 'none'}}>
              {get('STAFF_ROLE_LABEL')}
            </div>
            <div className="role-row">
              {
              /*
                roleOptions.map(opt => (
                  <label key={opt.value}>
                    <input
                      type="radio"
                      name="role"
                      value={opt.value}
                      checked={form.role === opt.value}
                      onChange={handleChange}
                      className="role-radio"
                    />
                    {opt.label}
                  </label>
                ))
                */
              }
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