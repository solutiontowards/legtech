import { createContext, useContext, useEffect, useState } from "react";
import api from '../api/axios';
import { jwtDecode } from 'jwt-decode';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const logout = async () => {
        try {
            // Ask the backend to invalidate the token and return its response
            const { data } = await api.post('/auth/logout');
            // After the server confirms logout, clear client-side data.
            localStorage.removeItem('token');
            api.defaults.headers.common['Authorization'] = null;
            setUser(null);
            return data; // e.g., { ok: true, message: '...' }
        } catch (error) {
            console.error('Server logout failed:', error);
            // If server fails, still log out on the client for a consistent UI.
            localStorage.removeItem('token');
            api.defaults.headers.common['Authorization'] = null;
            setUser(null);
            // Return a generic error response.
            return { ok: false, message: error.response?.data?.error || 'Server logout failed, but client is logged out.' };
        }
    };

    async function fetchMe() {
        setLoading(true);
        try {
            const res = await api.get('/auth/me');
            setUser(res.data.user);
            return res.data.user;
        } catch (error) {
            // If fetching user fails (e.g., invalid/expired token), log them out
            await logout();
        } finally { setLoading(false); }
    }

    useEffect(() => {
        const token = localStorage.getItem('token');

        if (token) {
            try {
                const decoded = jwtDecode(token);
                // Check if token is expired on the client side first
                if (decoded.exp * 1000 < Date.now()) {
                    logout(); // This will also clear the expired token
                    setLoading(false);
                } else {
                    fetchMe(); // Token seems valid, verify with backend
                }
            } catch (e) {
                logout(); // Token is malformed
                setLoading(false);
            }
        } else {
            setLoading(false); // No token, not logged in
        }
    }, []);

    return (
        <AuthContext.Provider value={{ user, setUser, loading, refreshUser: fetchMe, logout }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext)
