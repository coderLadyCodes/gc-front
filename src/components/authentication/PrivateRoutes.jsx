import React from 'react'
import { useAuth } from './AuthProvider'
import { Navigate, Outlet } from 'react-router-dom'

const PrivateRoutes = ({ allowedRoles }) => {
    const {user} = useAuth()
    if(!user){
        return <Navigate to="/Login" replace />
    }

    if (!allowedRoles.includes(user.role)) {
        console.log('user role :', user.role)
        return <Navigate to="/unauthorized" />
      }
  return  <Outlet />
}

export default PrivateRoutes