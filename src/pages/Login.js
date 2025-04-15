import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { handleError, handleSuccess } from '../utils';
import './Login.css';

function Login() {
    const [loginInfo, setLoginInfo] = useState({
        email: '',
        password: ''
    });

    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        console.log(name, value);
        const copyLoginInfo = { ...loginInfo };
        copyLoginInfo[name] = value;
        setLoginInfo(copyLoginInfo);
    }

    const handleLogin = async (e) => {
        e.preventDefault();
        const { email, password } = loginInfo;
        if (!email || !password) {
            return handleError('Email and password are required');
        }

        try {
            const url = `https://xpense-xpert-api-ldwv.onrender.com/auth/login`;
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(loginInfo)
            });

            const result = await response.json();
            const { success, message, jwtToken, name, error } = result;

            if (success) {
                handleSuccess(message);
                localStorage.setItem('token', jwtToken);
                localStorage.setItem('loggedInUser', name);
                setTimeout(() => {
                    navigate('/home')
                }, 1000)
            } else if (error) {
                const details = error?.details[0].message;
                handleError(details);
            } else if (!success) {
                handleError(message);
            }
            console.log(result);
        } catch (err) {
            handleError(err);
        }
    }

    return (
        <div className="login-container">
            {/* Left half - Login Form */}
            <div className="login-form-container">
                <div className="login-form-wrapper">
                    <h1 className="login-title">Login</h1>

                    <form onSubmit={handleLogin} className="login-form">
                        <div className="form-group">
                            <label htmlFor="email" className="form-label">
                                Email
                            </label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={loginInfo.email}
                                onChange={handleChange}
                                className="form-input"
                                placeholder="Enter your email"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="password" className="form-label">
                                Password
                            </label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                value={loginInfo.password}
                                onChange={handleChange}
                                className="form-input"
                                placeholder="Enter your password"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            className="login-button"
                        >
                            Login
                        </button>

                        <div className="signup-link-container">
                            <p className="signup-text">
                                Don't have an account?{" "}
                                <Link to="/signup" className="signup-link">
                                    Signup
                                </Link>
                            </p>
                        </div>
                    </form>
                </div>
            </div>

            {/* Right half - Image */}
            <div className="login-image-container">
                <div className="image-content">
                    <img
                        src="https://img.freepik.com/premium-vector/cartoon-man-hold-hand-money-vector-illustration_851674-46338.jpg"
                        alt="Login"
                        className="login-image"
                    />
                    <h2 className="welcome-title">Welcome Back!</h2>
                    <p className="welcome-text">
                        Log in to access your dashboard and continue your journey with us.
                    </p>
                </div>
            </div>

            <ToastContainer />
        </div>
    );
}

export default Login;