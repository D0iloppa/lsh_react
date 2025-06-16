// src/components/Welcome/index.jsx
import React, { useState } from 'react';


import './Tutorial.css';


import Tutorial1 from './Tutorial1';
import Tutorial2 from './Tutorial2';
import Tutorial3 from './Tutorial3';
import Welcome from './Welcome';

const WelcomeTutorial = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);

  // 튜토리얼 컴포넌트들 배열
  const tutorialSteps = [
    Tutorial1,   // 1: 첫 번째 튜토리얼  
    Tutorial2,   // 2: 두 번째 튜토리얼
    Tutorial3,   // 3: 세 번째 튜토리얼
    Welcome,     // 4: WELCOME
  ];

  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // 튜토리얼 완료 시 부모 컴포넌트에 알림
      onComplete?.();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // 현재 단계의 컴포넌트 렌더링
  const CurrentComponent = tutorialSteps[currentStep];

  return (
    <CurrentComponent 
      onNextScreen={handleNext}
      onPrev={handlePrev}
      currentStep={currentStep}
      totalSteps={tutorialSteps.length}
      isFirst={currentStep === 0}
      isLast={currentStep === tutorialSteps.length - 1}
    />
  );
};

export default WelcomeTutorial;