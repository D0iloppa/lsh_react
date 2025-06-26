import React, { useState, useEffect } from 'react';
import SketchHeader from '@components/SketchHeader';
import SketchBtn from '@components/SketchBtn';
import SketchDiv from '@components/SketchDiv';
import SketchInput from '@components/SketchInput';
import '@components/SketchComponents.css';

import { useAuth } from '@contexts/AuthContext';
import ApiClient from '@utils/ApiClient';

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
      toast.error('프로모션 제목을 입력해주세요.');
      return;
    }
    if (!form.desc.trim()) {
      toast.error('프로모션 설명을 입력해주세요.');
      return;
    }
    if (!form.type) {
      toast.error('프로모션 타입을 선택해주세요.');
      return;
    }
    if (!form.startDate) {
      toast.error('시작 날짜를 입력해주세요.');
      return;
    }
    if (!form.endDate) {
      toast.error('종료 날짜를 입력해주세요.');
      return;
    }
    if (!form.discount_value || form.discount_value <= 0 || form.discount_value > 100) {
      toast.error('할인율을 1-100 사이의 값으로 입력해주세요.');
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
        toast.success(isEditMode ? '프로모션이 수정되었습니다.' : '프로모션이 생성되었습니다.');
        
        // 잠시 후 이전 페이지로 이동
        setTimeout(() => {
          goBack();
        }, 1500);
      } else {
        toast.error('프로모션 저장에 실패했습니다.');
      }
    } catch (error) {
      console.error('Failed to submit promotion:', error);
      toast.error('프로모션 저장 중 오류가 발생했습니다.');
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
          padding: 0.5rem;
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
          margin-top: 1rem;
        }
        #discount_value{
          width: 100%;
        }
      `}</style>
      <div className="create-container">
        <SketchHeader
          title={isEditMode ? "프로모션 편집" : "새 프로모션 만들기"}
          showBack={true}
          onBack={goBack}
        />
        <div className="form-field" style={{paddingTop:'1.0rem'}}>
          <div className="form-label">Promotion Title</div>
          <SketchInput
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="Enter title"
          />
        </div>
        <div className="form-field">
          <div className="form-label">Short Description</div>
          <SketchInput
            name="desc"
            value={form.desc}
            onChange={handleChange}
            placeholder="Enter description"
            as="textarea"
            rows={2}
          />
        </div>
        <div className="form-label" style={{marginBottom: '0.3rem'}}>Promotion Type</div>
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
          <div className="form-label">Upload a Cover Image</div>
          <SketchInput
            name="image"
            value={form.image}
            onChange={handleChange}
            placeholder="Image URL or upload"
          />
        </div>
        <div className="form-label">Promotion Dates</div>
        <div className="date-row">
          <div className="date-field">
            <div className="form-label" style={{fontWeight:400}}>Start Date</div>
            <SketchInput
              name="startDate"
              value={form.startDate}
              onChange={handleChange}
              placeholder="YYYY-MM-DD"
              type="date"
            />
          </div>
          <div className="date-field">
            <div className="form-label" style={{fontWeight:400}}>End Date</div>
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
          <div className="form-label">Applicable Days/Times</div>
          <SketchInput
            name="time"
            value={form.time}
            onChange={handleChange}
            placeholder="e.g. weekdays, 6 PM - 9 PM"
          />
        </div>
        <div className="form-field">
          <div className="form-label">Discount</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <select
              name="discount_type"
              value={form.discount_type}
              onChange={handleChange}
              style={{
                padding: '0.5rem',
                border: '1px solid #ccc',
                borderRadius: '4px',
                fontSize: '0.8rem',
                width: '120px'
              }}
            >
              <option value="percent">Percent</option>
            </select>
            <div id="discount_value">
              <SketchInput
                name="discount_value"
                type="number"
                value={form.discount_value}
                onChange={handleChange}
                placeholder="10"
                min="0"
                max="100"
                style={{ flex: 1 , marginTop : '1.0rem'}}
              />
            </div>
            <span style={{ fontSize: '1rem', fontWeight: '500' }}>%</span>
          </div>
        </div>
        <div className="form-actions">
          { /*
          <SketchBtn variant="event" size="medium" style={{ width: '100%' }}>
            {isEditMode ? "미리보기" : "미리보기"}
          </SketchBtn>
          */}
          <SketchBtn 
            variant="primary" 
            size="medium" 
            style={{ width: '100%' }}
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? '처리 중...' : (isEditMode ? "수정 완료" : "저장 및 활성화")}
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