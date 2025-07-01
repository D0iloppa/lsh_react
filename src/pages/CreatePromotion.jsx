import React, { useState, useEffect } from 'react';
import SketchHeader from '@components/SketchHeader';
import SketchBtn from '@components/SketchBtn';
import SketchDiv from '@components/SketchDiv';
import SketchInput from '@components/SketchInput';
import '@components/SketchComponents.css';
import HatchPattern from '@components/HatchPattern';
import { useMsg, useMsgGet, useMsgLang } from '@contexts/MsgContext';
import { useAuth } from '@contexts/AuthContext';
import ApiClient from '@utils/ApiClient';

import ImageUploader from '@components/ImageUploader';

import Swal from 'sweetalert2';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const typeOptions = [
  { value: 'discount', label: 'Discount' },
  { value: 'event', label: 'Event' },
  { value: 'special', label: 'Special Offer' },
];

const CreatePromotion = ({ navigateToPageWithData, PAGES, goBack, pageData, ...otherProps }) => {
  const [form, setForm] = useState({
    title: '',
    desc: '',
    type: '',
    image: '',
    startDate: '',
    endDate: '',
    time: '',
    details: '',
    discount_type: 'percent',
    discount_value: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();

  const { mode, venue_id, promotionData = false } = otherProps;
  const isEditMode = mode === 'edit';
    const { messages, isLoading, error, get, currentLang, setLanguage, availableLanguages, refresh } = useMsg();
  
  
    useEffect(() => {
        if (messages && Object.keys(messages).length > 0) {
          console.log('✅ Messages loaded:', messages);
          // setLanguage('en'); // 기본 언어 설정
          console.log('Current language set to:', currentLang);
          window.scrollTo(0, 0);
        }
      }, [messages, currentLang]);

  // 페이지 진입 시 모드 디버그
  useEffect(() => {
    const { mode, venue_id, promotionData = false } = otherProps;

    console.log('CreatePromotion pageData:', otherProps);
    console.log('Mode:', otherProps?.mode || 'create');
    console.log('Venue ID:', otherProps?.venue_id);
    
    if (mode === 'edit' && promotionData) {
      console.log('Edit mode - Promotion data:', promotionData);
      
      // 기존 프로모션 데이터로 폼 채우기
      setForm({
        title: promotionData.title || '',
        desc: promotionData.description || '',
        type: promotionData.promotion_type || '',
        // image: promotionData.image_url || '',
        startDate: promotionData.start_date || '',
        endDate: promotionData.end_date || '',
        time: '', // API에 해당 필드가 없으므로 빈 값
        details: '', // API에 해당 필드가 없으므로 빈 값
        discount_type: promotionData.discount_type || 'percent',
        discount_value: promotionData.discount_value || '',
      });
    }
  }, [otherProps?.mode, otherProps?.venue_id, otherProps?.promotionData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  // 폼 제출 처리
  const handleSubmit = async () => {
  // 필수 필드 검증
  if (!form.title.trim()) {
    toast.error(get('PROMOTION_TITLE_REQUIRED'));
    return;
  }
  if (!form.desc.trim()) {
    toast.error(get('PROMOTION_DESC_REQUIRED'));
    return;
  }
  if (!form.type) {
    toast.error(get('PROMOTION_TYPE_REQUIRED'));
    return;
  }
  if (!form.startDate) {
    toast.error(get('PROMOTION_START_DATE_REQUIRED'));
    return;
  }
  if (!form.endDate) {
    toast.error(get('PROMOTION_END_DATE_REQUIRED'));
    return;
  }
  if (!form.discount_value || form.discount_value <= 0 || form.discount_value > 100) {
    toast.error(get('PROMOTION_DISCOUNT_INVALID'));
    return;
  }

    setIsSubmitting(true);
    try {
      const requestData = {
        mode: mode,
        title: form.title.trim(),
        target_type:'venue',
        description: form.desc.trim(),
        venue_id: venue_id,
        promotion_type: form.type,
        start_date: form.startDate,
        end_date: form.endDate,
        status: 'active',
        discount_type: form.discount_type,
        discount_value: form.discount_value,
      };

      // Edit 모드일 경우 promotion_id 추가
      if (isEditMode && promotionData) {
        requestData.promotion_id = promotionData.promotion_id;
      }

      console.log('Submitting promotion data:', requestData);

      const response = await ApiClient.postForm('/api/promotionManage', requestData);

      console.log('✅ Promotion response:', response);

      if (response.success) {
        toast.success(isEditMode 
          ? get('PROMOTION_UPDATE_SUCCESS') 
          : get('PROMOTION_CREATE_SUCCESS')
        );
        
        // 잠시 후 이전 페이지로 이동
        setTimeout(() => {
          goBack();
        }, 1500);
      } else {
        toast.error(get('PROMOTION_SAVE_FAILED'));
      }
      } catch (error) {
      console.error('Failed to submit promotion:', error);
      toast.error(get('PROMOTION_SAVE_ERROR'));
      } finally {
      setIsSubmitting(false);
      }
  };

  return (
    <>
      <style jsx="true">{`
        .create-container {
          max-width: 28rem;
          margin: 0 auto;
          background: #fff;
          min-height: 100vh;
          font-family: 'BMHanna', 'Comic Sans MS', cursive, sans-serif;
        }
        .form-label {
          font-size: 1rem;
          margin-bottom: 0.2rem;
          font-weight: 500;
        }
        .form-field {
          margin-bottom: 0.7rem;
        }
        .type-row {
          display: flex;
          gap: 1.2rem;
          margin: 0.5rem 0 0.8rem 0;
        }
        .type-radio {
          margin-right: 0.3rem;
        }
        .date-row {
          display: flex;
          gap: 0.7rem;
          margin-bottom: 0.7rem;
        }
        .date-field {
          flex: 1;
        }
        .form-actions {
          display: flex;
          flex-direction: column;
          gap: 0.7rem;
          margin-bottom: 1rem;
        }
        #discount_value{
          width: 100%;
        }
      `}</style>
        <div className="create-container">
        <SketchHeader
          title={isEditMode ? get('PROMOTION_EDIT_TITLE') : get('PROMOTION_CREATE_TITLE')}
          showBack={true}
          onBack={goBack}
        />
        <div className="form-field" style={{paddingTop:'1.0rem'}}>
          <div className="form-label">{get('PROMOTION_TITLE_LABEL')}</div>
          <SketchInput
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder={get('PROMOTION_TITLE_PLACEHOLDER')}
          />
        </div>
        <div className="form-field">
          <div className="form-label">{get('PROMOTION_DESC_LABEL')}</div>
          <SketchInput
            name="desc"
            value={form.desc}
            onChange={handleChange}
            placeholder={get('PROMOTION_DESC_PLACEHOLDER')}
            as="textarea"
            rows={2}
          />
        </div>
        <div className="form-label" style={{marginBottom: '0.3rem'}}>
          {get('PROMOTION_TYPE_LABEL')}
        </div>
        <div className="type-row">
          {typeOptions.map(opt => (
            <label key={opt.value}>
              <input
                type="radio"
                name="type"
                value={opt.value}
                checked={form.type === opt.value}
                onChange={handleChange}
                className="type-radio"
              />
              {opt.label}
            </label>
          ))}
        </div>
        <div className="form-field">
          <div className="form-label">{get('PROMOTION_UPLOAD_IMAGE_LABEL')}</div>
          <div style={{display: 'flex', alignItems: 'center'}}>
            <ImageUploader
              name="image"
              apiClient={ApiClient}
              value={form.image}
              showPreview = {true}
              onUploadComplete={(contentId) => {
                setForm(prev => ({ ...prev, image: contentId }));
                console.log('image uploaded, content_id:', contentId);
              }}
              placeholder={get('PROMOTION_IMAGE_PLACEHOLDER')}
            />
            <SketchInput
              name="image"
              value={form.image}
              onChange={handleChange}
              placeholder={get('PROMOTION_IMAGE_PLACEHOLDER')}
            />
          </div>
        </div>
        <div className="form-label">{get('PROMOTION_DATES_LABEL')}</div>
        <div className="date-row">
          <div className="date-field">
            <div className="form-label" style={{fontSize: '0.3rem'}}>
              {get('PROMOTION_START_DATE_LABEL')}
            </div>
            <SketchInput
              name="startDate"
              value={form.startDate}
              onChange={handleChange}
              placeholder="YYYY-MM-DD"
              type="date"
            />
          </div>
          <div className="date-field">
            <div className="form-label" style={{fontSize: '0.3rem'}}>
              {get('PROMOTION_END_DATE_LABEL')}
            </div>
            <SketchInput
              name="endDate"
              value={form.endDate}
              onChange={handleChange}
              placeholder="YYYY-MM-DD"
              type="date"
            />
          </div>
        </div>
        <div className="form-field">
          <div className="form-label">{get('PROMOTION_APPLICABLE_TIMES_LABEL')}</div>
          <SketchInput
            name="time"
            value={form.time}
            onChange={handleChange}
            placeholder={get('PROMOTION_TIME_PLACEHOLDER')}
          />
        </div>
        <div className="form-field">
          <div className="form-label" style={{marginBottom:'-13px'}}>
            {get('PROMOTION_DISCOUNT_LABEL')}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <select
              name="discount_type"
              value={form.discount_type}
              onChange={handleChange}
              style={{
                  padding: '0.6rem',
                  border: '1px solid #666',
                  borderTopLeftRadius: '6px 8px',
                  borderTopRightRadius: '10px 5px',
                  borderBottomRightRadius: '8px 12px',
                  borderBottomLeftRadius: '12px 6px',
                  transform: 'rotate(0.2deg)',
                  fontSize: '0.8rem',
                  width: '120px',
                  fontFamily: "'BMHanna', 'Comic Sans MS', cursive, sans-serif"
                }}
            >
              <option value="percent">{get('PROMOTION_DISCOUNT_PERCENT')}</option>
            </select>
            <div id="discount_value">
              <SketchInput
                name="discount_value"
                type="number"
                value={form.discount_value}
                onChange={handleChange}
                placeholder={get('PROMOTION_DISCOUNT_PLACEHOLDER')}
                min="0"
                max="100"
                style={{ flex: 1 , marginTop : '1.0rem'}}
              />
            </div>
            <span style={{ fontSize: '1rem', fontWeight: '500' }}>%</span>
          </div>
        </div>
        <div className="form-actions">
          <SketchBtn 
            variant="event" 
            size="medium" 
            style={{ width: '100%' }}
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            <HatchPattern opacity={0.8} />
            {isSubmitting 
              ? get('PROMOTION_PROCESSING') 
              : (isEditMode 
                  ? get('PROMOTION_UPDATE_COMPLETE') 
                  : get('PROMOTION_SAVE_ACTIVATE')
                )
            }
          </SketchBtn>
        </div>

        <ToastContainer
          position="bottom-center"
          autoClose={3000}
          hideProgressBar={true}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
          style={{
            borderRadius: '25px',
            fontSize: '14px',
            padding: '12px 20px'
          }}
        />
      </div>
    </>
  );
};

export default CreatePromotion; 