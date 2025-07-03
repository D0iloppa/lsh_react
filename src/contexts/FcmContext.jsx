// src/contexts/FcmContext.js
import React, { createContext, useContext, useState } from 'react';

const FcmContext = createContext();

export const FcmProvider = ({ children }) => {
  const [fcmToken, setFcmToken] = useState(null);

  return (
    <FcmContext.Provider value={{ fcmToken, setFcmToken }}>
      {children}
    </FcmContext.Provider>
  );
};

export const useFcm = () => useContext(FcmContext);
