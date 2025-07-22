// src/hooks/useLoginOverlay.jsx
import { useCallback } from 'react';
import { useAuth } from '@contexts/AuthContext';
import { overlay } from 'overlay-kit';
import { BrowserRouter } from 'react-router-dom';
import { MsgProvider } from '@contexts/MsgContext';
import { AuthProvider } from '@contexts/AuthContext';
import LoginComp from '@components/Login/LoginView';
import { useMsg } from '@contexts/MsgContext';

export const useLoginOverlay = (navigationProps, onLoginSuccess = null) => {
    const { updateLoginState } = useAuth();
    const { currentLang } = useMsg();
    const { navigateToPage, navigateToPageWithData, PAGES } = navigationProps;

    const openLoginOverlay = useCallback((targetPage = null, targetData = null) => {
        console.log('openLoginOverlay 호출됨');
        
        // 목표 페이지 정보를 전역에 저장
        window.loginTargetPage = targetPage;
        window.loginTargetData = targetData;

        overlay.open(({ isOpen, close, unmount }) => {
            // 전역 함수 등록
            window.overlayUnmount = unmount;

            window.overlayRegisterHandler = () => {
                console.log('Register 버튼 클릭 - 오버레이 닫고 Register 페이지로');
                if (window.overlayUnmount) {
                    window.overlayUnmount();
                }
                navigateToPage(PAGES.REGISTER);
                
                // 정리
                delete window.overlayUnmount;
                delete window.overlayRegisterHandler;
            };

            window.overlayLoginSuccessHandler = async (userData) => {
                console.log('Login success:', userData);
                
                try {
                    // 이미 로그인이 완료된 상태이므로 AuthContext 상태만 업데이트
                    updateLoginState(userData);
                    console.log('로그인 상태 업데이트 완료:', userData);
                    
                    // 추가적인 재렌더링 콜백 실행
                    if (onLoginSuccess) {
                        onLoginSuccess(userData);
                    }
                    
                    // 오버레이 닫기
                    unmount();
                    
                    // 전역 변수 정리
                    delete window.overlayUnmount;
                    delete window.overlayRegisterHandler;
                    delete window.overlayLoginSuccessHandler;
                    
                    // 목표 페이지가 있으면 그 페이지로, 없으면 새로고침
                    if (window.loginTargetPage) {
                        console.log('로그인 성공 - 목표 페이지로 이동:', window.loginTargetPage);
                        
                        if (window.loginTargetData) {
                            navigateToPageWithData(window.loginTargetPage, window.loginTargetData);
                        } else {
                            navigateToPage(window.loginTargetPage);
                        }
                        
                        // 정리
                        delete window.loginTargetPage;
                        delete window.loginTargetData;
                    } else {
                        // setTimeout(() => {
                        //     window.location.reload();
                        // }, 100);
                    }
                } catch (error) {
                    console.error('로그인 상태 업데이트 중 오류:', error);
                }
            };
            
            return (
                <BrowserRouter>
                    <MsgProvider initialLanguage={currentLang}>
                        <AuthProvider>
                            <style>{`
                                .go-home-button {
                                    display: none !important;
                                }
                                .login-container{min-height: 60vh;}
                            `}</style>
                            <div 
                                style={{
                                    position: 'fixed',
                                    top: 0,
                                    left: 0,
                                    width: '100vw',
                                    height: '100vh',
                                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    zIndex: 9998,
                                    padding: '20px',
                                    boxSizing: 'border-box'
                                }}
                                onClick={(e) => {
                                    if (e.target === e.currentTarget) {
                                        unmount();
                                        // 정리
                                        delete window.overlayUnmount;
                                        delete window.overlayRegisterHandler;
                                    }
                                }}
                            >
                                <div style={{
                                    maxWidth: '400px',
                                    width: '100%',
                                    maxHeight: '90vh',
                                    overflow: 'auto',
                                    backgroundColor: 'white',
                                    borderRadius: '8px',
                                    position: 'relative'
                                }}>
                                    <button
                                        onClick={() => {
                                            unmount();
                                            // 정리
                                            delete window.overlayUnmount;
                                            delete window.overlayRegisterHandler;
                                        }}
                                        style={{
                                            position: 'absolute',
                                            top: '10px',
                                            right: '10px',
                                            background: 'none',
                                            border: 'none',
                                            fontSize: '24px',
                                            cursor: 'pointer',
                                            zIndex: 10,
                                            color: '#666'
                                        }}
                                    >
                                        ×
                                    </button>
                                    
                                    <LoginComp
                                        onClose={() => {
                                            console.log('Login overlay closing...');
                                            unmount();
                                            // 정리
                                            delete window.overlayUnmount;
                                            delete window.overlayRegisterHandler;
                                        }}
                                    
                                        redirectUrl="/profile"
                                        showSocialLogin={true}
                                        isOverlay={true}
                                    />
                                </div>
                            </div>
                        </AuthProvider>
                    </MsgProvider>
                </BrowserRouter>
            );
        });
    }, [updateLoginState, navigateToPage, navigateToPageWithData, PAGES.REGISTER, onLoginSuccess, currentLang]);

    return { openLoginOverlay };
}; 