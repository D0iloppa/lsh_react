// views/LoginView/login.js


// 이메일 유효성 검사
export const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
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

export const loginPost = async (email, password) => {
    
    const demo_user = {
        name : '테스트',
        email : email
    }

    return {
        success: true,
        message: 'Login successful!',
        user : demo_user
    };

    /*
        // 임시 로직 (실제로는 API 응답 처리)
        if (email === 'test@example.com' && password === 'password') {
            return {
                success: true,
                message: 'Login successful!'
            };
        } else {
            return {
                success: false,
                errors: { general: 'Invalid email or password' }
            };
        }
    */
};

// 로그인 핸들러
export const handleLogin = async (email, password) => {
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



        return await loginPost(email, password);

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