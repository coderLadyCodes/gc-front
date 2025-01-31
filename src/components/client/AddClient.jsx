import React, { useState } from 'react'
import { useAuth } from '../authentication/AuthProvider'
import './AddClient.css'
import { useNavigate } from 'react-router-dom'
import { useClient } from './ClientProvider'

const AddClient = () => {
  const navigate = useNavigate()
  const {user} = useAuth()
  const userId = user?.userId
  const {addClient} = useClient()

  const[clientDTO, setClientDTO] = useState({
    firstName: '',
    lastName: '',
    comments: '',
    email: '',
    mobilePhone: '',
    homePhone: '',
    birthday: '',
    city: '',
    streetName: '',
    zipCode: '',
    sex: '',
    userId:userId
  })

  const [errorMessage, setErrorMessage] = useState('') 

  const handleChange = (e) => {
    const { name, type, value, valueAsNumber } = e.target
  
    setClientDTO((prevData) => ({
      ...prevData,
      [name]: type === 'number' ? valueAsNumber : value,
    }))
  }
  

  const handleSubmit = (e) => {
    e.preventDefault()
    addClient.mutate(clientDTO, {
      onSuccess: () => {
        queryClient.invalidateQueries(['clients']); // NOT SURE JUST ADDED
        setClientDTO({
            firstName: '',
            lastName: '',
            email: '',
            mobilePhone: '',
            homePhone: '',
            birthday: '',
            city: '',
            streetName: '',
            zipCode: '',
            sex: '',
            userId: userId,
    })
    navigate('/dashboard/clients')
    setErrorMessage('')
  },
  onError: (error) => {
    if (error.response) {
      const errorData = error.response.data 
      setErrorMessage(errorData.message) 
      console.error('Error details:', errorData)
  } else if (error.request) {
      console.error('No response received:', error.request)
      setErrorMessage('No response from server.')
  } else {
      console.error('Error:', error.message)
      setErrorMessage('Error: ' + error.message)
  }
  }})}


  const today = new Date().toISOString().split('T')[0]

  return (
    <div className='add-client-container'>
      <h2>Ajouter un Client</h2>
      <form onSubmit={handleSubmit} className='add-client-form'>
        <label>
          Prénom:
          <input
            type='text'
            name='firstName'
            value={clientDTO.firstName}
            onChange={handleChange}
            className='add-client-input'
            required
          />
        </label>
        <label>
          Nom:
          <input
            type='text'
            name='lastName'
            value={clientDTO.lastName}
            onChange={handleChange}
            className='add-client-input'
            required
          />
        </label>
        <label>
          Email:
          <input
            type='email'
            name='email'
            value={clientDTO.email}
            onChange={handleChange}
            className='add-client-input'
          />
        </label>
        <label>
          Téléphone mobile:
          <input
            type='number'
            name='mobilePhone'
            value={clientDTO.mobilePhone}
            onChange={handleChange}
            className='add-client-input'
          />
        </label>
        <label>
          Téléphone domicile:
          <input
            type='number'
            name='homePhone'
            value={clientDTO.homePhone}
            onChange={handleChange}
            className='add-client-input'
          />
        </label>
        <label>
          Date de naissance:
          <input
            type='date'
            name='birthday'
            value={clientDTO.birthday}
            onChange={handleChange}
            className='add-client-input'
            max={today}   
          />
        </label>
        <label>
          Ville:
          <input
            type='text'
            name='city'
            value={clientDTO.city}
            onChange={handleChange}
            className='add-client-input'
            
          />
        </label>
        <label>
          Adresse:
          <input
            type='text'
            name='streetName'
            value={clientDTO.streetName}
            onChange={handleChange}
            className='add-client-input'
           
          />
        </label>
        <label>
          Code postal:
          <input
            type='text'
            name='zipCode'
            value={clientDTO.zipCode}
            onChange={handleChange}
            className='add-client-input'
            
          />
        </label>
        <label>
          Sexe:
          <select name='sex' value={clientDTO.sex} onChange={handleChange} className='add-client-input' required>
            <option value=''>Sélectionnez</option>
            <option value='M'>Masculin</option>
            <option value='F'>Féminin</option>
          </select>
        </label>
        <label>
        Commentaire:
        <textarea
          name='comments'
          value={clientDTO.comments}
          onChange={handleChange}
          className='add-client-input'
        />
      </label>


        <button type='submit' className='add-client-button' disabled={addClient.isLoading}>
          {addClient.isLoading ? 'Enregistrement...' : 'Ajouter Client'}
        </button>
        <button type='button' className='client-cancel-button' onClick={() => navigate(-1)}>
            Annuler
          </button>

        {addClient.isError && <p className='add-client-error'>Erreur: {addClient.error.message}</p>}
        {errorMessage && <p className='add-client-error'>Erreur: {errorMessage}</p>}
        {addClient.isSuccess && <p className='add-client-success'>Client ajouté avec succès!</p>}
      </form>
    </div>
  )
}

export default AddClient