import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@contexts/AuthContext';
import SketchInput from '@components/SketchInput';
import SketchBtn from '@components/SketchBtn';
import Header from '@components/Header';
import HatchPattern from '@components/HatchPattern';
import InitFooter2 from '@components/InitFooter2';


import SketchHeader from '@components/SketchHeader'

export default function RegisterView() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const { register } = useAuth(); // AuthContext 사용
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    return newErrors;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});
    setMessage('');

    const newErrors = validateForm();
    
    if (Object.keys(newErrors).length === 0) {
      const result = await register(formData);
      
      if (result.success) {
        setMessage(result.message);
        // 회원가입 성공 시 로그인 페이지로 이동
        setTimeout(() => {
          navigate('/login');
        }, 2000); // 2초 후 이동 (성공 메시지 표시용)
      } else {
        setErrors(result.errors);
      }
    } else {
      setErrors(newErrors);
    }
    
    setIsLoading(false);
  };

  const handleSocialLogin = (provider) => {
    // 소셜 로그인 처리
    console.log(`${provider} 로그인 시도`);
    // 실제 구현 시 OAuth 처리
  };

  const goBack = () => {
    navigate(-1);
  };

  return (
    <div className="register-container max-w-md mx-auto bg-white border-gray-800 p-6">
      {/* 헤더
      <Header 
          className="custom-header"
          hatchOpacity={0.4}
        />

      <h2
        className=""
        style={{
          fontFamily: "'Kalam', 'Comic Sans MS', cursive, sans-serif", fontSize: '1.5rem', marginBottom: '5px'
        }}
      >
        Register Member
      </h2>
      */
      }

      <SketchHeader 
              title="Register Member"
              showBack={false}
              onBack={() => console.log("뒤로가기")}
              rightButtons={[]}
            />
      <h2
        className=""
        style={{
          fontFamily: "'Kalam', 'Comic Sans MS', cursive, sans-serif", fontSize: '1.5rem', marginBottom: '5px'
        }}
      >
        Register Member
      </h2>
      
      <p style={{ 
        fontSize: '0.875rem', 
        color: '#6b7280', 
        textAlign: 'start', 
        marginBottom: '1rem',
        marginTop: '0',
        lineHeight: '1.4',
        fontFamily: "'Kalam', 'Comic Sans MS', cursive, sans-serif"
      }}>
        Join us to explore the vibrant nightlife of Vietnam. <br></br>
        Sign up now to receive exclusive updates on events and reservations.
      </p>

      <form onSubmit={onSubmit}>
        {/* General Error/Success Message */}
        {errors.general && (
          <div className="sketch-error-message">{errors.general}</div>
        )}
        {message && (
          <div className="sketch-success-message">{message}</div>
        )}

        {/* Full Name Input */}
          <p style={{ margin:'0', fontFamily: "'Kalam', 'Comic Sans MS', cursive, sans-serif"}}>Full Name</p>
        <SketchInput
          type="text"
          name="fullName"
          value={formData.fullName}
          onChange={handleInputChange}
          disabled={isLoading}
          error={errors.fullName}
          variant="text" style={{ marginBottom: '-8px' }} 
        />

        {/* Email Input */}
        <p style={{ margin:'0',fontFamily: "'Kalam', 'Comic Sans MS', cursive, sans-serif"}}>email</p>
        <SketchInput
          type="email"
          name="email"
          value={formData.email}
          onChange={handleInputChange}
          disabled={isLoading}
          error={errors.email}
          variant="email" style={{ marginBottom: '-8px' }} 
        />

        {/* Password Input */}
        <p style={{ margin:'0',fontFamily: "'Kalam', 'Comic Sans MS', cursive, sans-serif"}}>Password</p>
        <SketchInput
          type="password"
          name="password"
          value={formData.password}
          onChange={handleInputChange}
          disabled={isLoading}
          error={errors.password}
          variant="password"
        />

        {/* Sign Up Button */}
        {/* <button
          type="submit"
          className="sketch-button"
          disabled={isLoading}
        >
          {isLoading ? 'Signing up...' : 'SIGN UP'}
        </button> */}
        <SketchBtn
          type="submit"
          className="sketch-button"
          disabled={isLoading}
        >
          <HatchPattern opacity={0.3} />
          {isLoading ? 'Signing up...' : 'SIGN UP'}
        </SketchBtn>
      </form>

      {/* 소셜 로그인 */}
      <div style={{ textAlign: 'center', marginTop: '1rem' }}>
        <p style={{marginBottom: '0', fontSize: '0.875rem', color: '#6b7280' }}>
          or sign up with
        </p>
        
        <div style={{ display: 'flex', justifyContent: 'center'}}>
          <button 
            className="sketch-button sketch-button--secondary"
            onClick={() => handleSocialLogin('facebook')}
            style={{ width: '3rem', height: '3rem', borderRadius: '50%', padding: '0' }}
            aria-label="Sign up with Facebook"
          >
            f
          </button>
          
          <button 
            className="sketch-button sketch-button--secondary"
            onClick={() => handleSocialLogin('google')}
            style={{ width: '3rem', height: '3rem', borderRadius: '50%', padding: '0' }}
            aria-label="Sign up with Google"
          >
            G
          </button>
          
          <button 
            className="sketch-button sketch-button--secondary"
            onClick={() => handleSocialLogin('twitter')}
            style={{ width: '3rem', height: '3rem', borderRadius: '50%', padding: '0' }}
            aria-label="Sign up with Twitter"
          >
            🐦
          </button>
        </div>
      </div>

      {/* Login Link */}
      <div style={{ textAlign: 'center', marginTop: '5px', fontSize: '0.875rem', color: '#6b7280' }}>
        Already have an account?{' '}
        <a 
          href="#" 
          className="sketch-link sketch-link--primary"
          onClick={(e) => {
            e.preventDefault();
            navigate('/login');
          }}
        >
          Login
        </a>
      </div>

      {/* 푸터 */}
      {/* <div style={{ 
        textAlign: 'center', 
        marginTop: '3rem', 
        padding: '1rem 0', 
        borderTop: '2px solid #374151',
        fontSize: '0.75rem',
        color: '#6b7280'
      }}>
        © 2025. LeTanTon Sheriff All rights reserved.
      </div> */}
      <InitFooter2 />
      
                
                <InitFooter2 />
    </div>
  );
}