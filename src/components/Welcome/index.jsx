// src/components/Welcome/index.jsx
import React, { useState } from 'react';
import './Tutorial.css';

import Intro from './Intro';
import Tutorial1 from './Tutorial1';
import Tutorial2 from './Tutorial2';
import Tutorial3 from './Tutorial3';
import Welcome from './Welcome';

const WelcomeTutorial = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isTutorial, setIsTutorial] = useState(false); // Intro는 튜토리얼이 아님

  // 모든 단계 컴포넌트들
  const allSteps = [
    Welcome,     // 0: Welcome 페이지 (독립)
    Tutorial1,   // 1: 첫 번째 튜토리얼  
    Tutorial2,   // 2: 두 번째 튜토리얼
    Tutorial3   // 3: 세 번째 튜토리얼
  ];

  // 튜토리얼 단계만 (Tutorial1 ~ Tutorial3)
  const tutorialSteps = allSteps.slice(1, 4); // Tutorial1 ~ Tutorial3

  const handleNext = () => {
    if (currentStep === 0) {
      // Intro에서 Tutorial1으로
      setCurrentStep(1);
      setIsTutorial(true);
    } else if (isTutorial) {
      // 튜토리얼 단계에서
      if (currentStep < 3) { // Tutorial3까지
        setCurrentStep(currentStep + 1);
      } else {
        // Tutorial3 완료 후 Welcome으로
        setIsTutorial(false);
        setCurrentStep(4); // Welcome 인덱스
      }
    } else {
      // Welcome 페이지에서 완료
      onComplete?.();
    }
  };

  const handlePrev = () => {
    if (isTutorial && currentStep > 1) {
      // Tutorial1~3에서 이전으로
      setCurrentStep(currentStep - 1);
    } else if (isTutorial && currentStep === 1) {
      // Tutorial1에서 Intro로
      setCurrentStep(0);
      setIsTutorial(false);
    }
  };

  // Welcome 페이지의 독립적인 네비게이션
  const handleWelcomeAction = (action) => {
    if (action === 'explore') {
      onComplete?.();
    } else if (action === 'register') {
      // 회원가입 페이지로 이동 로직
      console.log('Navigate to registration page');
    }
  };

  const CurrentComponent = allSteps[currentStep];

  // 현재 컴포넌트에 전달할 props
  const getComponentProps = () => {
    if (currentStep === 0) {
      // Intro 페이지
      return {
        onNextScreen: handleNext,
        isTutorial: false
      };
    } else if (isTutorial) {
      // Tutorial 단계 (Tutorial1~3)
      const tutorialIndex = currentStep - 1; // Tutorial1=0, Tutorial2=1, Tutorial3=2
      return {
        onNextScreen: handleNext,
        onPrev: handlePrev,
        currentStep: tutorialIndex,
        totalSteps: tutorialSteps.length, // 3
        isFirst: currentStep === 1, // Tutorial1
        isLast: currentStep === 3,  // Tutorial3
        isTutorial: true
      };
    } else {
      // Welcome 페이지
      return {
        onAction: handleWelcomeAction,
        isTutorial: false
      };
    }
  };

  return <CurrentComponent {...getComponentProps()} />;
};

export default WelcomeTutorial;