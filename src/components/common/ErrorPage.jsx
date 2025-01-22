import React from 'react'
import Home from './Home'
import { Link } from 'react-router-dom'

const ErrorPage = () => {
  return (
    <div> 
      <h1>Oups Une erreur est survenue !</h1>
      <Link to='/'><h2>Retournez à la page d'accueil</h2></Link>
    </div>
    
  )
}

export default ErrorPage