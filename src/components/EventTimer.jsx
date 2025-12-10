import React, { useState, useEffect } from 'react';

const EventTimer = ({ targetDate }) => {


    const targetTimestamp = new Date(targetDate).getTime();

  const calculateTimeLeft = () => {
    const difference = targetTimestamp - new Date().getTime();
    
    if (difference > 0) {
      return {
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    }
    return null; 
  };


  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
    
    // [중요] targetDate 객체 대신, 변하지 않는 숫자값(targetTimestamp)을 의존성으로 넣음
  }, [targetTimestamp]);

  if (!timeLeft) return <span>오픈 준비중</span>;

  // 숫자가 한 자리일 때 0 붙이기 (예: 9 -> 09)
  const pad = (num) => String(num).padStart(2, '0');

  return (
    <>
      {pad(timeLeft.hours)}:{pad(timeLeft.minutes)}:{pad(timeLeft.seconds)}
    </>
  );
};

export default EventTimer;