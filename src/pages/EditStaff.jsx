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
    staff_id: 0,
    name: '',
    username: '',
    password: '',
    contact: '',
    description:'',
    role: '',
  });
  const [password, setPassword] = useState({
    confirm: ''
  });

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
    if (otherProps && otherProps.staff) {
      const { staff } = otherProps;
      console.log('EditStaff pageData.staff:', staff);
      
      setForm({
        staff_id: staff.id,
        name: staff.name || '',
        username: staff.login_id,
        password: '', // 비밀번호는 수정 시 빈 값으로
        contact: staff.contact || staff.phone || '',
        description:staff.description
      });
    }
  }, [otherProps?.staff]); // staff 객체만 의존성으로 설정

  const handleAddStaff = async () => {


    const response = await ApiClient.postForm('/api/updateStaff', {
        staff_id: form.staff_id,
        name: form.name || '',
        contact: form.contact || '',
        description:form.description
    });

    if (response.success) {
      Swal.fire({
        title: get('PROFILE_UPDATE_SUCCESS_TITLE'),
        text: get('PROFILE_UPDATE_SUCCESS_MESSAGE'),
        icon: 'success',
        timer: 1500
      });
    }



    /*
    ApiClient.postForm('/api/register', {
      login_type: 'id',
      account_type:'staff',
      venue_id: venue,
      fullnm: form.name,
      login_id: form.username,
      passwd: form.password,
      contact: form.contact,
      created_by: user?.id
    }).then(res=>{
      console.log('res', res);

      const {registerInfo = false} = res;
      if(registerInfo){
        Swal.fire({
          title: 'Staff created',
          text: 'Staff created successfully',
          icon: 'success',
          confirmButtonText: 'OK'
        }).then((result) => {
          if (result.isConfirmed || result.isDismissed) {
            goBack();
          }
        });
      }else{
        Swal.fire({
          title: 'Failed to create staff',
          text: 'Please try again',
          icon: 'error',
          confirmButtonText: 'OK'
        });
      }
    });
    */


    
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