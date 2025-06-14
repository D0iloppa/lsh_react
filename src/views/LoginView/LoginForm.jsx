import React, { useState } from 'react';
import { handleLogin, handleForgotPassword } from './login';
import SketchInput from '@components/SketchInput';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const onSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});
    setMessage('');

    const result = await handleLogin(email, password);
    
    if (result.success) {
      setMessage(result.message);
      // 로그인 성공 시 리다이렉트 등 추가 로직
    } else {
      setErrors(result.errors);
    }
    
    setIsLoading(false);
  };

  const onForgotPassword = async () => {
    if (!email) {
      setErrors({ email: 'Please enter your email first' });
      return;
    }

    setIsLoading(true);
    const result = await handleForgotPassword(email);
    
    if (result.success) {
      setMessage(result.message);
      setErrors({});
    } else {
      setErrors({ general: result.error });
    }
    
    setIsLoading(false);
  };

  return (
    <>
      <h2 className="sketch-title">Login</h2>
      
      <form onSubmit={onSubmit}>
        {/* General Error/Success Message */}
        {errors.general && (
          <div className="sketch-error-message">{errors.general}</div>
        )}
        {message && (
          <div className="sketch-success-message">{message}</div>
        )}

        {/* Email Input */}
        <SketchInput
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isLoading}
          error={errors.email}
          variant="email"
        />

        {/* Password Input */}
        <SketchInput
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={isLoading}
          error={errors.password}
          variant="password"
        />

        {/* Login Button */}
        <button
          type="submit"
          className="sketch-button"
          disabled={isLoading}
        >
          {isLoading ? 'Logging in...' : 'LOGIN'}
        </button>
      </form>

      {/* Forgot Password */}
      <div style={{ textAlign: 'center', marginTop: '1rem' }}>
        <button
          type="button"
          onClick={onForgotPassword}
          disabled={isLoading}
          className="sketch-button sketch-button--secondary"
        >
          Forgot Password?
        </button>
      </div>

      {/* Sign Up Link */}
      <div style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.875rem', color: '#6b7280' }}>
        Don't have an account?{' '}
        <a href="#" className="sketch-link sketch-link--primary">Sign Up</a>
      </div>
    </>
  );
}