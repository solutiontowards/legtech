import React from 'react'
import { useAuth } from '../../context/AuthContext'

const AdminProtectRoute = ({ children }) => {
    const { user, loading } = useAuth()
    if (loading) return <div className="p-6">Loading...</div>;
    if (!user || user.role !== 'retailer') {
        return <div className="p-6">Access Denied. Admins only.</div>;
    }
    return children;

}

export default AdminProtectRoute