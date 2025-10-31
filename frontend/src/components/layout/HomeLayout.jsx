import React from 'react';
import { Outlet } from 'react-router-dom';
import TopNavbar from '../TopNavbar';
import HomeNavbar from '../HomeNavbar';
import HomeFooter from '../HomeFooter';
import useAuthRedirect from '../../hooks/useAuthRedirect';
import { Loader2 } from 'lucide-react';

const HomeLayout = () => {
    const authLoading = useAuthRedirect();


    if (authLoading) {
        return (
            <div className="flex items-center justify-center h-screen bg-white">
                <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <>
            <TopNavbar />
            <HomeNavbar />
            <Outlet />
            <HomeFooter />
        </>
    );
};

export default HomeLayout;