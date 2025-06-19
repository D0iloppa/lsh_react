import React, { useState, useEffect } from 'react';  // ⬅ useEffect 추가
import { ArrowRight, MapPin } from 'lucide-react';

import { useMsg, useMsgGet, useMsgLang } from '@contexts/MsgContext';

const SketchSearch = ({
  
  searchQuery,
  setSearchQuery,
  handleSearch,
  handleLocationClick,
  placeholder = "Enter venue or location",
  className = ""
}) => {

  const { messages, isLoading, error, get, currentLang, setLanguage, availableLanguages, refresh } = useMsg();
  
    useEffect(() => {
      if (messages && Object.keys(messages).length > 0) {
        console.log('✅ Messages loaded:', messages);
        // setLanguage('en'); // 기본 언어 설정
        console.log('Current language set to:', currentLang);
        window.scrollTo(0, 0);
      }
    }, [messages, currentLang]);
    
  return (
    <div className={`search-container ${className}`}>
      <style jsx>{`
        .search-container {
          display: flex;
          gap: 0.75rem;
          margin-bottom: 2rem;
        }
        
        .search-input-wrapper {
          flex: 1;
          position: relative;
         
        }
        
        .search-input {
           font-family: 'BMHanna', 'Comic Sans MS', cursive, sans-serif;

          width: 90%;
          padding: 0.75rem 1rem;
          border: 1px solid #374151;
          background-color: white;
          font-size: 1rem;
          color: #6b7280;
          border-radius: 8px 12px 6px 10px;
          transform: rotate(0.3deg);
          outline: none;
        }
        
        .search-input:focus {
          border-color: #1f2937;
          transform: rotate(-0.2deg);
        }
        
        .search-arrow {
          position: absolute;
          right: 1rem;
          top: 50%;
          transform: translateY(-50%);
          color: #6b7280;
        }
        
        .location-button {
              width: 50px;
              height: 43px;
              border: 1px solid #374151;
              background-color: white;
              display: flex;
              align-items: center;
              justify-content: center;
              cursor: pointer;
              border-radius: 6px 10px 8px 6px;
              transform: rotate(-0.8deg);
        }
        
        .location-button:hover {
          background-color: #f9fafb;
          transform: rotate(0.5deg);
        }
      `}</style>

      <div className="search-input-wrapper">
        <input
          type="text"
          placeholder={get('Search1.1')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
        />
        <ArrowRight className="search-arrow" size={20} />
      </div>

      <button className="location-button" onClick={handleLocationClick}>
        <MapPin size={20} />
      </button>
    </div>
  );
};

export default SketchSearch;
