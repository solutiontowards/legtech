import React from 'react'
import { Outlet } from 'react-router-dom'
import TopNavbar from '../TopNavbar'
import HomeNavbar from '../HomeNavbar'
import HomeFooter  from '../HomeFooter'

const HomeLayout = () => {
    return (
        <>
            <TopNavbar />
            <HomeNavbar />
            <Outlet />

            <HomeFooter />

        </>
    )
}

export default HomeLayout