// src/context/AuthContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    // user will now consistently store the core User object
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // Helper function to extract the core user object from the API response
    const extractCoreUser = (apiResponseData) => {
        // If the response is a direct User object (e.g., for admin user)
        if (apiResponseData && apiResponseData.user_type) {
            return apiResponseData;
        }
        // If the response is a profile object with a nested 'user' key (e.g., PatientProfile, DoctorProfile)
        if (apiResponseData && apiResponseData.user && apiResponseData.user.user_type) {
            return apiResponseData.user;
        }
        return null; // Unexpected structure
    };

    useEffect(() => {
        const loadUser = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const response = await api.get('users/me/', {
                        headers: {
                            Authorization: `Token ${token}`
                        }
                    });
                    const coreUser = extractCoreUser(response.data);

                    if (coreUser) {
                        setUser(coreUser);
                        setIsAuthenticated(true);
                    } else {
                        // If user data couldn't be extracted, consider token invalid
                        localStorage.removeItem('token');
                        setIsAuthenticated(false);
                    }
                } catch (error) {
                    console.error('Failed to load user from token:', error);
                    localStorage.removeItem('token'); // Clear invalid token
                    setUser(null);
                    setIsAuthenticated(false);
                }
            }
            setLoading(false);
        };
        loadUser();
    }, []); // Run only once on mount

    const login = async (email, password) => {
        try {
            const response = await api.post('token-auth/', { username: email, password });
            const { token } = response.data;
            localStorage.setItem('token', token);

            // Immediately fetch user details with the new token
            const userResponse = await api.get('users/me/', {
                headers: {
                    Authorization: `Token ${token}`
                }
            });

            const loggedInUser = extractCoreUser(userResponse.data);

            if (!loggedInUser) {
                throw new Error("Unexpected user data structure after login from /users/me/");
            }

            setUser(loggedInUser);
            setIsAuthenticated(true);
            return loggedInUser.user_type; // Return the correct user type for redirection
        } catch (error) {
            console.error('Login failed:', error);
            setIsAuthenticated(false);
            throw error; // Re-throw to be handled by the component
        }
    };

    const register = async (userData, userType) => {
        try {
            const endpoint = userType === 'patient' ? 'users/register-patient/' : 'users/register-doctor/';
            const response = await api.post(endpoint, userData);
            return response.data;
        } catch (error) {
            console.error('Registration failed:', error);
            throw error;
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
        setIsAuthenticated(false);
        navigate('/login'); // Redirect to login page after logout
    };

    return (
        <AuthContext.Provider value={{ user, isAuthenticated, loading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);