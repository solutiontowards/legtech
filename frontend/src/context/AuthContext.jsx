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


    useEffect(() => {
        fetchMe();
    }, [])


    return (
        <AuthContext.Provider value={{ user, setUser, loading, refresh: fetchMe }}>
            {children}
        </AuthContext.Provider>
    )

}


export const useAuth = () => useContext(AuthContext)
