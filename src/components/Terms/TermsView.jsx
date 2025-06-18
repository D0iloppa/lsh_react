import React from 'react';
import { useNavigate } from 'react-router-dom';

import SketchDiv from '@components/SketchDiv';
import SketchBtn from '@components/SketchBtn';
import HatchPattern from '@components/HatchPattern';
import SketchHeader from '@components/SketchHeader';

import Terms_kr from './Terms_kr';
import Terms_en from './Terms_en';

import './TermsView.css'

export default function TermsView() {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1); // 이전 페이지로 이동
  };

  const lang = 'en';

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* 헤더 */}
      <SketchHeader 
        title="Terms & Conditions"
        onBack={handleBack}
      />

      {/* 메인 컨텐츠 */}
      <div className="flex-1 px-6 py-8 flex flex-col">
        {/* 제목 */}
        <div className="text-center mb-8">
          <h1 className="text-xl font-medium text-gray-800 leading-relaxed">
            Please Review to the
          </h1>
          <h2 className="text-xl font-medium text-gray-800 leading-relaxed">
            LeTanTon Sheriff Terms & Conditions
          </h2>
        </div>

        {/* 약관 내용 박스 */}
        <SketchDiv className="terms flex-1 mb-8 relative">
          <HatchPattern />
          {(() => {
            switch(lang) {
              case 'kr':
                return <Terms_kr />;
              case 'en':
                  return <Terms_en />;
              default:
                return <Terms_kr />;
            }
          })()}
        </SketchDiv>

        {/* 버튼 영역 */}
        <div className="space-y-3">
          <SketchBtn
            onClick={handleBack}
            variant="outline"
            className="w-full border-2 border-gray-800 text-gray-800 bg-white hover:bg-gray-50"
          >
            Back
          </SketchBtn>
        </div>
      </div>
    </div>
  );
}