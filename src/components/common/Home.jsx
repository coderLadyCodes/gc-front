import React from 'react'
import { Link } from 'react-router-dom'
import './Home.css'

const Home = () => {
  return (
    <div className='home-container'>
    <h1 className='home-title'>Sites pour soins capillaires</h1>
    
    <section className='home-section'>

        <Link to='/login' className='home-signup-link'>Connexion</Link>

    </section>
  </div>
  )
}

export default Home