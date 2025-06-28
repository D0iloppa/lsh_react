// views/LoginView/login.js


// 이메일 유효성 검사
export const validateEmail = (email) => {
    /*
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
    */
    return true;
};  

// 비밀번호 유효성 검사
export const validatePassword = (password) => {
    return password.length >= 6;
};

// 폼 유효성 검사
export const validateForm = (email, password) => {
    const errors = {};

    if (!email) {
        errors.email = 'Email is required';
    } else if (!validateEmail(email)) {
        errors.email = 'Please enter a valid email';
    }

    if (!password) {
        errors.password = 'Password is required';
    } else if (!validatePassword(password)) {
        errors.password = 'Password must be at least 6 characters';
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
};

import axios from 'axios';
import qs from 'qs';

const API_HOST = import.meta.env.VITE_API_HOST; // ex: https://doil.chickenkiller.com/api

export const loginPost = async ({login_id, passwd, login_type ='email'}) => {

    const data =  qs.stringify({
        login_type: login_type,
        email: login_id,
        login_id: login_id,
        passwd: passwd
      });

    try {
        const response = await axios.post(
          `${API_HOST}/api/login`, 
          data,
          {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            }
          }
        );
    

        let { error=false, errMsg=false, user=false, staff=false, manager=false } = response.data;

        // type decoration
        user = user && { type: 'user', 
                        'login_type': login_type, 
                        login_id: login_id, ...user };

        staff = staff && { type: 'staff', 
                        'login_type': login_type, 
                        login_id: login_id, ...staff };

        manager = manager && { type: 'manager', 
                        'login_type': login_type, 
                        login_id: login_id, ...manager };

        if(error){
            return {
                success: false,
                errors: {
                  general: errMsg || 'Invalid login'
                }
              };
        }
        // 서버에서 success와 user를 넘긴다고 가정
        return {
          success: true,
          message: 'Login successful!',
          user: user || manager || staff
        };
    
      } catch (error) {
        console.error('❌ Login failed:', error);
    
        return {
          success: false,
          errors: {
            general: error.response?.data?.message || 'Invalid login'
          }
        };
      }
    

    /*
    const demo_user = {
        "user_id": 1,
        "nickname": "user1",
        "gender": "M",
        "birth_year": 1988,
        "birth_date": "1988-08-18",
        "email": "user1@naver.com",
        "phone": "010-1234-5678",
        "profile_content_id": 8,
        "created_at": "2025-06-17T16:10:51.416",
        "updated_at": "2025-06-17T16:10:51.416"
      }
      

    return {
        success: true,
        message: 'Login successful!',
        user : demo_user
    };
    */

};

// 로그인 핸들러
export const handleLogin = async (email, password, login_type = 'email') => {
    try {
        // 폼 유효성 검사
        const validation = validateForm(email, password);
        if (!validation.isValid) {
            return {
                success: false,
                errors: validation.errors
            };
        }

        // 로그인 API 호출 (여기서 실제 API 연동)
        // console.log('Login attempt:', { email, password });



        return await loginPost(email, password, login_type);

    } catch (error) {
        console.error('Login error:', error);
        return {
            success: false,
            errors: { general: 'Something went wrong. Please try again.' }
        };
    }
};

// 비밀번호 찾기 핸들러
export const handleForgotPassword = async (email) => {
    try {
        if (!validateEmail(email)) {
            return {
                success: false,
                error: 'Please enter a valid email'
            };
        }

        // 비밀번호 재설정 이메일 발송 API
        console.log('Password reset requested for:', email);

        return {
            success: true,
            message: 'Password reset email sent!'
        };

    } catch (error) {
        console.error('Forgot password error:', error);
        return {
            success: false,
            error: 'Failed to send reset email. Please try again.'
        };
    }
};