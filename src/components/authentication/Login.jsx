import React, { useState } from 'react'
import { useAuth } from './AuthProvider'
import './Login.css'
import Spinner from '../common/Spinner'


const Login = (e) => {
    const {login, loginLoading} = useAuth()
    const [authenticationDTO, setAuthenticationDTO] = useState({
      username: '',
      password: '',
    })

    const [showPassword, setShowPassword] = useState(false)

    const handleInputChange = (e) => {
      const { name, value } = e.target
      setAuthenticationDTO((prevState) => ({
        ...prevState,
        [name]: value,
      }))
    }

  const handleLoginSubmit = (e) => {
    e.preventDefault() 
    if (login) {
      login(authenticationDTO)
    } else {
      console.error('Login mutation is not available')
    }
  }
  const togglePasswordVisibility = () => {
    setShowPassword((prevState) => !prevState);
  }

  return (
    <div className="connexion-container">
    <h2 className="connexion-title">Connexion</h2>
    <form onSubmit={handleLoginSubmit} method="post" className="connexion-form">
      <div className="connexion-input">
        <label htmlFor="username" className="connexion-label">Email</label>
        <input
          placeholder="Email"
          type="email"
          name="username"
          onChange={handleInputChange}
          value={authenticationDTO.username}
          required
          className="connexion-text-input"
        />
      </div>

      <div className="connexion-input">
        <label htmlFor="password" className="connexion-label">Mot de Passe</label>
        <div className="password-container">
    <input
      placeholder="mot de passe"
      type={showPassword ? 'text' : 'password'} 
      name="password"
      onChange={handleInputChange}
      value={authenticationDTO.password}
      required
      className="connexion-text-input"
    />
    <i
      className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'} toggle-password-icon`}
      onClick={togglePasswordVisibility}
      title={showPassword ? 'Cacher le mot de passe' : 'Afficher le mot de passe'}
    ></i>
   </div>{/*
       <p className="forgot-password-link">
          <Link to="/change-password">Mot de passe oublié? Réinitialiser le mot de passe</Link>
        </p>
        */}
      </div>

      <div className="connexion-submit-container">
        {loginLoading ? (
          <Spinner />
        ) : (
          <button type="submit" className="connexion-submit-btn">Connecter</button>
        )}
      </div>
    </form>
  </div>
  )
}

export default Login