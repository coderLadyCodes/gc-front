import React from 'react'
import { useAuth } from './AuthProvider'

const Logout = () => {
    const {logout} = useAuth()

    const handleLogout = () => {
        logout()  
      }
  return (
    <div>
      <button onClick={handleLogout}>Deconnecter</button>
    </div>
  )
}

export default Logout