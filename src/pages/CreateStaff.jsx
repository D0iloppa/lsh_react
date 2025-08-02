import React, { useEffect, useState } from 'react';
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
  const [form, setForm] = useState({
    name: '',
    username: '',
    password: '',
    contact: '',
    description:'',
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

    // 비밀번호 검증
    if (!form.password.trim()) {
      newErrors.password = get('VALIDATION_PASSWORD_REQUIRED');
    } else if (form.password.length < 6) {
      newErrors.password = get('VALIDATION_PASSWORD_MIN_LENGTH');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddStaff = async () => {

    // 폼 검증
    if (!validateForm()) {
      return; // 검증 실패 시 등록 중단
    }

    ApiClient.postForm('/api/register', {
      login_type: 'id',
      account_type:'staff',
      venue_id: venue,
      fullnm: form.name,
      login_id: form.username,
      passwd: form.password,
      contact: form.description,
      created_by: user?.id,
      description:form.description
    }).then(res=>{
      console.log('res', res);

      const {registerInfo = false, error = false} = res;

      if (error) {

        Swal.fire({
          title: get('REGISTER_ERROR_DUPLICATE') || '이미 사용 중인 이메일입니다',
          icon: 'error',
          confirmButtonText: get('SWAL_CONFIRM_BUTTON')
        });
        
        return; // 현재 자리에 머무름

      }





      if(registerInfo){
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
      }else{
        Swal.fire({
          title: get('SWAL_STAFF_REG_ERROR'),
          text: get('SCHEDULE_SAVE_ERROR_MESSAGE'),
          icon: 'error',
          confirmButtonText: get('btn.back.1')
        });
      }

      


    });
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
            
            <div className="form-field">
              <div className="form-label">{get('STAFF_USERNAME_LABEL')}</div>
              <SketchInput
                name="username"
                value={form.username}
                onChange={handleChange}
                placeholder={get('STAFF_USERNAME_PLACEHOLDER')}
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
            <div className="form-field">
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
                                  <div style={{marginBottom: '0.3rem'}}>{get('SELF_INTRODUCTION_LABEL')}</div>
                                  <SketchInput
                                    name="description"
                                    value={form.description}
                                    onChange={handleChange}
                                    placeholder={get('SELF_INTRO_PLACEHOLDER')}
                                    as="textarea"
                                    rows={8}
                                  />
                                </div>
            

            <div className="form-actions">
              <SketchBtn variant="event" size="small" onClick={handleAddStaff}>
                {get('STAFF_SAVE_BUTTON')}
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
            isVisible={isLoading}
          />
    </>
  );
};

export default CreateStaff; 