import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import LoginView from './views/LoginView';

function App() {
  const isLoggedIn = false; // 임시 값. 실제론 전역 상태로 대체

  return (
    <Router basename="/lsh"> {/* ← /lsh 하위에서 돌아가게 함 */}
      <Routes>
        <Route path="/" element={
          isLoggedIn ? <Navigate to="/main" /> : <LoginView />
        } />
        <Route path="*" element={<div>404 Not Found</div>} />
      </Routes>
    </Router>
  );
}

export default App;
