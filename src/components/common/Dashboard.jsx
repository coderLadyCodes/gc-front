import React, { useState, useEffect } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../authentication/AuthProvider'
import dravatar from '../../assets/images/dravatar.png'
import logo from '../../assets/images/logo.png'
import './Dashboard.css'
import { useTheme } from './ThemeProvider'

const Dashboard = () => {
  const { user, logout } = useAuth()
  const location = useLocation()
  const { isDark, toggleTheme } = useTheme()
 
  useEffect(() => {
  }, [user])
  

  const handleLogout = async () => {
    try {
      const userChoice = window.confirm('Voulez-vous vous déconnecter ?')
      if (userChoice) {
        logout()
      }
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  return (
    <div className="dashboard-container">
      <aside className="dashboard-sidebar">
        <div className="sidebar-header">
          <NavLink to="/dashboard">
            <img src={logo} alt="logo" className="user-avatar" />
          </NavLink>
        </div>
        <nav>
          <ul>
            <li>
              <NavLink to="/dashboard" className="nav-link">
                <i className="fa fa-home"></i> <span>Home</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="user-profile" className="nav-link">
                <i className="fa fa-user"></i> <span>Profile</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="add-client" className="nav-link">
                <i className="fa fa-user-plus"></i> <span>Ajouter Client</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="clients" className="nav-link">
                <i className="fa fa-users"></i> <span>Clients</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="product-category" className="nav-link">
                <i className="fa fa-boxes"></i> <span>Produits</span>
              </NavLink>
            </li>
            <li>
              <button className="nav-button deconnexion" onClick={handleLogout}>
                <i className="fa fa-sign-out-alt"></i> <span>Déconnexion</span>
              </button>
            </li>
          </ul>
          <div className="theme-toggle">
          <button onClick={toggleTheme}>
            <i className={isDark ? 'fa fa-sun' : 'fa fa-moon'}></i>
          </button>
        </div>
        </nav>
        
      </aside>

      <main className="dashboard-content">
        {location.pathname === '/dashboard' && (
          <>
          <div className="welcome-card">
            <div className="user-info">
              <img src={dravatar} alt="User Avatar" className="user-avatar profile" />
              <div>
                <h2>Bonjour, {user?.name }!</h2>
                <p>Aujourd'hui: {new Date().toLocaleDateString()}</p>
                <p>Prêt à gérer vos clients ?</p>
              </div>
            </div>
          </div>
             <div className="dashboard-description">
             <h3>Plateforme de gestion de clients</h3>
             <p>
               Ici, vous pouvez gérer efficacement vos clients, ajouter de nouveaux profils, 
               consulter vos données et organiser vos produits. Naviguez facilement à l'aide 
               des liens dans la barre latérale.
             </p>
             <p>
               Profitez d'une interface intuitive conçue pour simplifier votre expérience 
               de gestion quotidienne.
             </p>
           </div>
           </>
        )}
        <Outlet />
      </main>
    </div>
  )
}

export default Dashboard
