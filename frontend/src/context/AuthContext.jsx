import { createContext, useContext, useEffect, useState } from "react";
import api from '../api/axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);


    async function fetchMe() {
        try {
            const res = await api.get('/auth/me');
            setUser(res.data.user);

        } catch (error) {
            setUser(null);
        } finally { setLoading(false); }
    }

    async function logout() {
        try {
            await api.post('/auth/logout');
            setUser(null);
            return { success: true, message: 'Logged out successfully.' };
        } catch (error) {
            console.error('Logout failed:', error);
            // Even if server logout fails, clear user from client-side
            setUser(null); 
            return { success: false, message: 'Logout failed. Please try again.' };
        }
    }


    useEffect(() => {
        fetchMe();
    }, [])


    return (
        <AuthContext.Provider value={{ user, setUser, loading, refreshUser: fetchMe, logout }}>
            {children}
        </AuthContext.Provider>
    )

}


export const useAuth = () => useContext(AuthContext)
