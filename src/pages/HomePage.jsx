import React, { useState } from 'react';
import { ArrowRight, MapPin, Star, Heart } from 'lucide-react';
import SketchDiv from '@components/SketchDiv';
import ImagePlaceholder from '@components/ImagePlaceholder';
import HatchPattern from '@components/HatchPattern';
import '@components/SketchComponents.css';



const HomePage = ({ navigateToMap, navigateToSearch, navigateToPageWithData, PAGES, ...otherProps }) => {

  const [searchQuery, setSearchQuery] = useState('');



  // 장소 데이터 (샘플)
  const hotspots = [
    {
      id: 1,
      name: 'Sky Lounge',
      rating: 4.8,
      image: null,
      isFavorite: false
    },
    {
      id: 2, 
      name: 'Elite Club',
      rating: 4.6,
      image: null,
      isFavorite: true
    },
    {
        id: 3, 
        name: 'Rooftop Bar',
        rating: 4.5,
        image: null,
        isFavorite: true
    }
  ];

  const handleSearch = () => {
    console.log('검색:', searchQuery);

    navigateToMap({
        searchQuery: searchQuery,
        searchFrom: 'home'
      });


  };

  const handleLocationClick = () => {

    navigateToMap({
        searchQuery: searchQuery,
        searchFrom: 'home'
      });
  };

  const handleDiscover = () => {
    console.log('Discover 클릭', PAGES);

    navigateToPageWithData(PAGES.DISCOVER, {});
  };

  const toggleFavorite = (id) => {
    console.log('즐겨찾기 토글:', id);
  };

  return (
    <>
      <style jsx>{`
        .homepage-container {
          min-height: 100vh;
          background-color: #f9fafb;
        }
        
        .hero-section {
          position: relative;
          padding: 2rem 1.5rem;
          background-color: white;
        }
        
        .hero-title {
          font-size: 1.5rem;
          font-weight: bold;
          color: #374151;
          line-height: 1.3;
          margin-bottom: 2rem;
          transform: rotate(-0.5deg);
        }
        
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
          width: 100%;
          padding: 0.75rem 1rem;
          border: 2px solid #374151;
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
          width: 48px;
          height: 48px;
          border: 2px solid #374151;
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
        
        .content-section {
          padding: 0 1.5rem;
        }
        
        .section-title {
          font-size: 1.25rem;
          font-weight: bold;
          color: #374151;
          margin-bottom: 1rem;
          transform: rotate(0.3deg);
        }
        
        .hotspot-card {
          position: relative;
          margin-bottom: 1rem;
        }
        
        .card-content {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
          position: relative;
          z-index: 10;
        }
        
        .venue-image {
          width: 80px;
          height: 80px;
          flex-shrink: 0;
        }
        
        .venue-info {
          flex: 1;
          padding-right: 2rem;
        }
        
        .venue-name {
          font-size: 1.1rem;
          font-weight: bold;
          color: #374151;
          margin-bottom: 0.5rem;
          transform: rotate(-0.3deg);
        }
        
        .venue-rating {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          color: #6b7280;
          font-size: 0.9rem;
          transform: rotate(0.2deg);
        }
        
        .favorite-button {
          position: absolute;
          top: 1rem;
          right: 1rem;
          background: none;
          border: none;
          cursor: pointer;
          color: #6b7280;
          z-index: 20;
          transform: rotate(12deg);
        }
        
        .favorite-button.active {
          color: #ef4444;
          transform: rotate(-8deg);
        }
        
        .discover-section {
          padding: 2rem 1.5rem;
          text-align: center;
        }
        
        .discover-button {
          position: relative;
          padding: 0.75rem 2rem;
          background-color: #e5e7eb;
          color: #374151;
          border: 2px solid #374151;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          cursor: pointer;
          font-size: 1rem;
          border-radius: 10px 6px 12px 8px;
          transform: rotate(-0.5deg);
        }
        
        .discover-button:hover {
          background-color: #d1d5db;
          transform: rotate(0.3deg);
        }
      `}</style>
      
      <div className="homepage-container">
        {/* Hero Section */}
        <section className="hero-section">
          <HatchPattern opacity={0.3} />
          
          <div style={{ position: 'relative', zIndex: 10 }}>
            <h1 className="hero-title">
              Explore LeTanTon bars and beautiful grils
            </h1>
            
            <div className="search-container">
              <div className="search-input-wrapper">
                <input
                  type="text"
                  placeholder="Enter venue or location"
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
          </div>
        </section>

        {/* Hotspots Section */}
        <section className="content-section">
          <h2 className="section-title">Hotspots near you</h2>
          
          {hotspots.map((spot) => (
            <div key={spot.id} className="hotspot-card">
              <SketchDiv variant="card">
                <HatchPattern opacity={0.2} />
                
                <div className="card-content">
                  <ImagePlaceholder 
                    src={spot.image}
                    className="venue-image"
                  />
                  
                  <div className="venue-info">
                    <h3 className="venue-name">{spot.name}</h3>
                    <div className="venue-rating">
                      <Star size={16} fill="currentColor" />
                      <span>{spot.rating}</span>
                    </div>
                  </div>
                </div>
                
                <button 
                  className={`favorite-button ${spot.isFavorite ? 'active' : ''}`}
                  onClick={() => toggleFavorite(spot.id)}
                >
                  <Heart 
                    size={20} 
                    fill={spot.isFavorite ? 'currentColor' : 'none'} 
                  />
                </button>
              </SketchDiv>
            </div>
          ))}
        </section>

        {/* Discover Section */}
        <section className="discover-section">
          <div className="relative">
            <button className="discover-button" onClick={handleDiscover}>
              Discover
            </button>
            <HatchPattern opacity={0.4} />
          </div>
        </section>
      </div>
    </>
  );
};

export default HomePage;