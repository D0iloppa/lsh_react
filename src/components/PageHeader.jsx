import React from 'react';
import SketchSearch from '@components/SketchSearch';
import HatchPattern from '@components/HatchPattern';
import { ArrowLeft } from 'lucide-react';
import { useMsg } from '@contexts/MsgContext';

const PageHeader = ({ 
  title, 
  searchQuery, 
  setSearchQuery, 
  category = 'default', // 카테고리 기반 테마
  showSearch = true,
  showBackButton = false,
  onBackClick,
  handleSearch,
  customStyles = {} 
}) => {
  const { get } = useMsg();

  // 카테고리별 테마 색상 정의
  const themes = {
    default: {
      backgroundColor: 'white',
      borderColor: '#333',
      titleColor: '#374151'
    },
    BAR: {
      backgroundColor: '#fff7ed', // 오렌지 배경
      borderColor: '#f97316',
      titleColor: '#ea580c'
    },
    MASSAGE: {
      backgroundColor: '#f3e8ff', // 보라색 배경
      borderColor: '#8b5cf6',
      titleColor: '#7c3aed'
    },
    ALL: {
      backgroundColor: 'white',
      borderColor: '#333',
      titleColor: '#374151'
    }
  };

  const currentTheme = themes[category] || themes.default;

  return (
    <>
      <style jsx>{`
       
        .back-button {
          position: absolute;
          top: 1rem;
          left: 1rem;
          background: none;
          border: none;
          cursor: pointer;
          padding: 8px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background-color 0.2s;
        }
        .back-button:hover {
          background-color: rgba(0, 0, 0, 0.1);
        }
      `}</style>
      
      <section className="hero-section">
        <HatchPattern opacity={0.3} />
        {showBackButton && (
          <button 
            className="back-button" 
            onClick={onBackClick}
            aria-label="뒤로가기"
          >
            <ArrowLeft size={24} color={currentTheme.titleColor} />
          </button>
        )}
        <h1 className="hero-title">{title}</h1>
        {showSearch && (
          <SketchSearch
            placeholder={get('Search1.1')}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            handleSearch={handleSearch}
          />
        )}
      </section>
    </>
  );
};

export default PageHeader;