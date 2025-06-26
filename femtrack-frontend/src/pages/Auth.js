// src/pages/Auth.js
import React, { useState, useEffect } from 'react'; // Added useEffect import
import { useAuth } from '../context/AuthContext'; // Corrected path to go up one level (..)
import { useNavigate } from 'react-router-dom';

const AuthPage = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState(''); // For registration
    const [password, setPassword] = useState('');
    const [userType, setUserType] = useState('patient'); // 'patient' or 'doctor'
    const [error, setError] = useState('');

    const { login, register, isAuthenticated, user } = useAuth();
    const navigate = useNavigate();

    // Effect to handle navigation after authentication state changes
    useEffect(() => {
        console.log('AuthPage: isAuthenticated changed to', isAuthenticated);
        console.log('AuthPage: User object:', user);
        if (isAuthenticated && user) {
            console.log(`AuthPage: User is authenticated as ${user.user_type}. Attempting redirect from useEffect.`);
            if (user.user_type === 'patient') {
                navigate('/patient-dashboard');
            } else if (user.user_type === 'doctor') {
                navigate('/doctor-dashboard');
            }
        }
    }, [isAuthenticated, user, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        console.log(`Attempting ${isLogin ? 'login' : 'registration'} for email: ${email}, userType: ${userType}`);
        try {
            if (isLogin) {
                console.log('AuthPage: Calling login function...');
                await login(email, password); // login handles state update, useEffect will navigate
                console.log('AuthPage: Login function called.');
            } else {
                const userData = { email, username, password, user_type: userType };
                console.log('AuthPage: Calling register function with data:', userData);
                await register(userData, userType);
                console.log('AuthPage: Registration successful.');
                alert('Registration successful! Please login.');
                setIsLogin(true); // Switch to login form
            }
        } catch (err) {
            console.error('AuthPage: Authentication/Registration failed:', err);
            setError('Authentication failed. Please check your credentials or try again.');
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.authBox}>
                <h2>{isLogin ? 'Login' : 'Register'}</h2>
                {error && <p style={styles.errorText}>{error}</p>}
                <form onSubmit={handleSubmit}>
                    {!isLogin && (
                        <div style={styles.formGroup}>
                            <label htmlFor="username">Username:</label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required={!isLogin}
                                style={styles.input}
                                id="username"
                                name="username"
                            />
                        </div>
                    )}
                    <div style={styles.formGroup}>
                        <label htmlFor="email">Email:</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            style={styles.input}
                            id="email"
                            name="email"
                        />
                    </div>
                    <div style={styles.formGroup}>
                        <label htmlFor="password">Password:</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            style={styles.input}
                            id="password"
                            name="password"
                        />
                    </div>
                    {!isLogin && (
                        <div style={styles.formGroup}>
                            <label htmlFor="userType">Register as:</label>
                            <select
                                value={userType}
                                onChange={(e) => setUserType(e.target.value)}
                                style={styles.select}
                                id="userType"
                                name="userType"
                            >
                                <option value="patient">Patient</option>
                                <option value="doctor">Doctor</option>
                            </select>
                        </div>
                    )}
                    <button type="submit" style={styles.button}>
                        {isLogin ? 'Login' : 'Register'}
                    </button>
                </form>
                <p style={styles.toggleText}>
                    {isLogin ? "Don't have an account? " : "Already have an account? "}
                    <span onClick={() => setIsLogin(!isLogin)} style={styles.toggleLink}>
                        {isLogin ? 'Register here' : 'Login here'}
                    </span>
                </p>
            </div>
        </div>
    );
};

const styles = {
    container: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#f0f2f5',
        fontFamily: 'Arial, sans-serif',
    },
    authBox: {
        backgroundColor: '#fff',
        padding: '30px',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        textAlign: 'center',
        width: '400px',
    },
    formGroup: {
        marginBottom: '15px',
        textAlign: 'left',
    },
    label: {
        display: 'block',
        marginBottom: '5px',
        fontWeight: 'bold',
    },
    input: {
        width: '100%',
        padding: '10px',
        border: '1px solid #ddd',
        borderRadius: '4px',
        boxSizing: 'border-box',
    },
    select: {
        width: '100%',
        padding: '10px',
        border: '1px solid #ddd',
        borderRadius: '4px',
        boxSizing: 'border-box',
        backgroundColor: '#fff',
    },
    button: {
        width: '100%',
        padding: '10px',
        backgroundColor: '#007bff',
        color: '#fff',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '16px',
        marginTop: '10px',
    },
    toggleText: {
        marginTop: '20px',
        fontSize: '14px',
        color: '#555',
    },
    toggleLink: {
        color: '#007bff',
        cursor: 'pointer',
        textDecoration: 'underline',
    },
    errorText: {
        color: 'red',
        marginBottom: '10px',
    }
};

export default AuthPage;