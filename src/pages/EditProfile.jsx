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

const EditProfile = ({ navigateToPageWithData, PAGES, goBack, pageData, ...otherProps }) => {

  const { user, isLoggedIn } = useAuth();
  const { messages, isLoading, error, get, currentLang, setLanguage, availableLanguages, refresh } = useMsg();

  const [staffInfo, setStaffInfo] = useState({});
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadedImages, setUploadedImages] = useState([]);

  const [form, setForm] = useState({
    nickname: '',
    birth_year: '',
    languages: '',
    intro: '',
  });

  useEffect(() => {
    window.scrollTo(0, 0);
    if (messages && Object.keys(messages).length > 0) {
      window.scrollTo(0, 0);
    }

    fetchStaffData();
  }, [messages, currentLang]);

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
        Swal.fire({
          title: 'Success',
          text: 'Profile updated successfully',
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
          title: 'Error',
          text: response.message || 'Failed to update profile',
          icon: 'error'
        });
      }
    } catch (error) {
      console.error('Profile update error:', error);
      Swal.fire({
        title: 'Error',
        text: 'Failed to update profile',
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
          <div>Loading profile data...</div>
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
          title={<><User size={20} style={{marginRight:'7px',marginBottom:'-3px'}}/>Edit Profile</>}
          showBack={true}
          onBack={goBack}
        />
      <div className="editprofile-container">
        <div className="image-upload-section">
          <div className="image-upload-title">Profile Image</div>
          <ImageUploader
            apiClient={ApiClient}
            containerAsUploader={true}
            uploadedImages={uploadedImages}
            onImagesChange={setUploadedImages}
            maxImages={1}
            imageHolderStyle={{ width: '120px', height: '120px' }}
            showRemoveButton={true}
            showPreview={false}
            initialImageUrl={staffInfo?.image_url || staffInfo?.profile_image}
          />
        </div>

        <div className="input-row">
          <div style={{marginBottom: '0.3rem'}}>Nickname</div>
          <SketchInput
            name="nickname"
            value={form.nickname}
            onChange={handleChange}
            placeholder="Enter your nickname"
          />
        </div>
        <div className="input-row">
          <div style={{marginBottom: '0.3rem'}}>BirthYear</div>
          <SketchInput
            name="birth_year"
            value={form.birth_year}
            onChange={handleChange}
            placeholder="Enter your birth year"
            type="number"
          />
        </div>
        <div className="input-row">
          <div style={{marginBottom: '0.3rem'}}>Languages</div>
          <SketchInput
            name="languages"
            value={form.languages}
            onChange={handleChange}
            placeholder="Enter languages you speak"
          />
        </div>
        <div className="input-row">
          <div style={{marginBottom: '0.3rem'}}>Self-Introduction</div>
          <SketchInput
            name="intro"
            value={form.intro}
            onChange={handleChange}
            placeholder="Write something about yourself"
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
          ><HatchPattern opacity={0.6} />
            {isSaving ? 'Saving...' : 'Save Changes'}
          </SketchBtn>
        </div>
      </div>
    </>
  );
};

export default EditProfile; 