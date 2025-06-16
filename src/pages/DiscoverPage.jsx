import React, { useState } from 'react';
import RotationDiv from '@components/RotationDiv';

import ImagePlaceholder from '@components/ImagePlaceholder';




const DiscoverPage = ({ navigateToPageWithData, PAGES, ...otherProps }) => {
    const topGirls = [
        {
            name: "Casy Linh",
            id: "10",
            image: "/placeholder-girl1.jpg"
        },
        {
            name: "Anna Belle",
            id: "15",
            image: "/placeholder-girl2.jpg"
        },
        {
            name: "Sofia Kim",
            id: "8",
            image: "/placeholder-girl3.jpg"
        },
        {
            name: "Luna Park",
            id: "12",
            image: "/placeholder-girl4.jpg"
        }
    ];

    const handleDetail = (girl) => {
        navigateToPageWithData(PAGES.STAFFDETAIL, girl)
    }

    return (
        <>
            <style jsx>{`
        .discover-container {
          max-width: 28rem;
          margin: 0 auto;
          background-color: white;
          min-height: 100vh;
          border: 4px solid #1f2937;
        }

        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          border-bottom: 3px solid #1f2937;
          background-color: #f9fafb;
        }

        .logo {
          font-family: 'Comic Sans MS', cursive, sans-serif;
          font-weight: bold;
          color: #1f2937;
        }

        .explore-btn {
          padding: 0.5rem 1rem;
          border: 2px solid #1f2937;
          background-color: white;
          font-family: 'Comic Sans MS', cursive, sans-serif;
          cursor: pointer;
        }

        .featured-section {
          padding: 1rem;
          text-align: center;
          border-bottom: 3px solid #1f2937;
        }

        .featured-label {
          font-family: 'Comic Sans MS', cursive, sans-serif;
          font-size: 0.9rem;
          color: #6b7280;
          margin-bottom: 0.5rem;
        }

        .club-image-area {
          width: 100%;
          height: 200px;
          border: 3px solid #1f2937;
          background-color: #f3f4f6;
          margin-bottom: 1rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }

        .club-name {
          font-family: 'Comic Sans MS', cursive, sans-serif;
          font-size: 1.5rem;
          font-weight: bold;
          margin: 0.5rem 0;
        }

        .club-location {
          font-size: 0.9rem;
          color: #6b7280;
        }

        .top-venues-text {
          font-size: 1.2rem;
          font-weight: bold;
        }

        .description {
          font-size: 0.9rem;
          color: #4b5563;
          line-height: 1.4;
          margin-bottom: 1rem;
        }

        .action-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .make-text {
          font-weight: bold;
        }

        .reserve-btn{
            border : 0;
        }

        .stars {
          color: #fbbf24;
          font-size: 1.2rem;
        }


        .book-section {
          text-align: left;
          margin-bottom: 1rem;
        }

        .book-btn {
          padding: 0.5rem 1rem;
          border: 2px solid #1f2937;
          background-color: white;
          cursor: pointer;
        }

        .upcoming-events {
          padding: 1rem;
          border-bottom: 3px solid #1f2937;
        }

        .section-title {
          font-size: 1.1rem;
          font-weight: bold;
          margin-bottom: 1rem;
        }

        .events-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        .event-card {
          width: 100%;
          height: 120px;
          border: 3px solid #1f2937;
          background-color: #f3f4f6;
        }

        .top-girls-section {
          padding: 1rem;
          border-bottom: 3px solid #1f2937;
        }

        .girls-rotation {
          width: 100%;
        }

        .girl-slide {
          text-align: center;
        }

        .girl-card {
          width: 100%;
          height: 250px;
          border: 3px solid #1f2937;
          background-color: #f3f4f6;
          margin-bottom: 1rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .girl-placeholder {
          font-family: 'Comic Sans MS', cursive, sans-serif;
          color: #6b7280;
          font-size: 1.1rem;
        }

        .girl-name {
          font-family: 'Comic Sans MS', cursive, sans-serif;
          text-align: center;
          margin-bottom: 0.5rem;
        }

        .girl-detail-btn {
          display: block;
          margin: 0 auto;
          padding: 0.5rem 1rem;
          border: 2px solid #1f2937;
          background-color: white;
          font-family: 'Comic Sans MS', cursive, sans-serif;
          cursor: pointer;
        }


        @media (max-width: 480px) {
          .discover-container {
            max-width: 100%;
            border-left: none;
            border-right: none;
          }
        }
      `}</style>

            <div className="discover-container">
                {/* Header */}
                <div className="header">
                    <div className="logo">LeTanTon Sheriff</div>
                    <button className="explore-btn">Explore</button>
                </div>

                {/* Featured Section */}
                <div className="featured-section">
                    <div className="featured-label">Featured</div>
                    <div className="club-image-area">
                        <div className="club-name">Club One</div>
                        <div className="club-location">in Vietnam</div>
                        <div className="top-venues-text">Top Venues</div>
                    </div>

                    <div className="description">
                        Discover the best nightlife spots in Vietnam, from vibrant bars to chic lounges, all available for easy booking.
                    </div>

                    <div className="action-row">
                        <span className="make-text">Make a</span>
                        <button className="reserve-btn"
                            onClick={() => {
                                navigateToPageWithData(PAGES.RESERVATION, {
                                    target: 'venue',
                                    id:123
                                });
                            }}
                        >  📅</button>
                        <span className="stars">⭐⭐⭐⭐⭐</span>
                    </div>

                    <div className="map-section">
                        map section
                    </div>

                </div>

                {/* Upcoming Events */}
                <div className="upcoming-events">
                    <div className="section-title">Upcoming Events</div>
                    <div className="events-grid">
                        <div className="event-card"></div>
                        <div className="event-card"></div>
                    </div>
                </div>

                {/* Top Girls */}
                <div className="top-girls-section">
                    <div className="section-title">Top Girls</div>
                    <RotationDiv
                        interval={3000}
                        showIndicators={true}
                        pauseOnHover={true}
                        className="girls-rotation"
                    >
                        {topGirls.map((girl, index) => (
                            <div key={index} className="girl-slide">
                                <ImagePlaceholder className="" />
                                <div className="girl-name">{girl.name} {girl.id}</div>
                                <button className="girl-detail-btn" onClick={() => handleDetail(girl)}> Girl Detail</button>
                            </div>
                        ))}
                    </RotationDiv>
                </div>

            </div>
        </>
    );
};

export default DiscoverPage;