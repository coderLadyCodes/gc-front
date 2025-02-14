import React, {useEffect, useState } from 'react'
import './Client.css'
import { Link, Outlet, useNavigate, useParams } from 'react-router-dom'
import Spinner from '../common/Spinner'
import { useClient } from './ClientProvider'
import { useProductsContext } from '../product/ProductProvider'
import { useAuth } from '../authentication/AuthProvider'

const Client = () => {
  const { user } = useAuth()
  const userId = user?.userId
  const navigate = useNavigate()
  const {clientId} = useParams()
  const {getClientById, updateClient} =  useClient()
  const [isEditing, setIsEditing] = useState(false)
  const [clientData, setClientData] = useState({})
  const { data: client, error, isLoading } = getClientById(clientId)
  const {products} = useProductsContext()

useEffect(() => {
  if (client) {
    setClientData(client)
  }
}, [client])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setClientData((prevData) => ({...prevData,[name]: value}))
  }

  const handleUpdateClick = () => {
    if (isEditing) {
     updateClient.mutate({ id:clientId, updatedData: clientData })
    }
    setIsEditing((prev) => !prev)
  }

  if (isLoading) return <Spinner />
  if (error) return <p>Error: {error.message || 'Une erreur est survenu.'}</p>

  const shouldShowModifiedDate = clientData.modified && clientData.modified !== clientData.created
  const today = new Date().toISOString().split('T')[0]

  return (
    <div className='client-container'>
    <h2 className='client-title'>
       <span>{clientData?.firstName}</span> <span>{clientData?.lastName}</span>
    </h2>

    <div className='client-buttons'>
    <button className='update-profile-button' onClick={handleUpdateClick}>
      {isEditing ? 'Enregistrer' : 'Modifier Profile'}
    </button>
    <button className='update-profile-button' onClick={() => navigate(-1)}> Retour
    </button>
        </div>
    <div className='client-details'>
      <p className='client-detail'>
        <strong>Nom:</strong>
        {isEditing ? (
          <input type='text' name='lastName' value={clientData.lastName || ''} onChange={handleInputChange} />
        ) : (
          ` ${clientData?.lastName}`
        )}
      </p>
      <p className='client-detail'>
        <strong>Prénom:</strong>
        {isEditing ? (
          <input type='text' name='firstName' value={clientData.firstName || ''} onChange={handleInputChange} />
        ) : (
          ` ${clientData?.firstName}`
        )}
      </p>
      <p className='client-detail'>
        <strong>Email:</strong>
        {isEditing ? (
          <input type='email' name='email' value={clientData.email || ''} onChange={handleInputChange} />
        ) : (
          ` ${clientData?.email}`
        )}
      </p>
      <p className='client-detail'>
        <strong>Mobile:</strong>
        {isEditing ? (
          <input type='text' name='mobilePhone' value={clientData.mobilePhone || ''} onChange={handleInputChange} />
        ) : (
          ` ${clientData?.mobilePhone}`
        )}
      </p>
      <p className='client-detail'>
        <strong>Tél Fix:</strong>
        {isEditing ? (
          <input type='text' name='homePhone' value={clientData.homePhone || ''} onChange={handleInputChange} />
        ) : (
          ` ${clientData?.homePhone}`
        )}
      </p>
      <p className='client-detail'>
        <strong>Date de naissance:</strong>
        {isEditing ? (
          <input type='date' name='birthday' value={clientData.birthday?.split('T')[0] || ''} onChange={handleInputChange} max={today}/>
        ) : (
          ` ${new Date(clientData?.birthday).toLocaleDateString()}`
        )}
      </p>
      <p className='client-detail'>
        <strong>Ville:</strong>
        {isEditing ? (
          <input type='text' name='city' value={clientData.city || ''} onChange={handleInputChange} />
        ) : (
          ` ${clientData?.city}`
        )}
      </p>
      <p className='client-detail'>
        <strong>Adresse:</strong>
        {isEditing ? (
          <input type='text' name='streetName' value={clientData.streetName || ''} onChange={handleInputChange} />
        ) : (
          ` ${clientData?.streetName}`
        )}
      </p>
      <p className='client-detail'>
        <strong>Code Postal:</strong>
        {isEditing ? (
          <input type='text' name='zipCode' value={clientData.zipCode || ''} onChange={handleInputChange} />
        ) : (
          ` ${clientData?.zipCode}`
        )}
      </p>
      <p className='client-detail'>
        <strong>Sexe:</strong>
        {isEditing ? (
          <select name='sex' value={clientData.sex || ''} onChange={handleInputChange}>
            <option value=''>Sélectionnez</option>
            <option value='M'>Masculin</option>
            <option value='F'>Féminin</option>
          </select>
        ) : (
          ` ${clientData?.sex}`
        )}
      </p>
      <p className='client-detail'>
        <strong>Date de création:</strong> {new Date(clientData?.created).toLocaleDateString()}
      </p>
      {shouldShowModifiedDate && (
          <p className='client-detail'>
            <strong>Date de modification:</strong> {new Date(clientData.modified).toLocaleDateString()}
          </p>
        )}

<div className='client-comments'>
    <strong>Commentaires:</strong>
    {isEditing ? (
      <textarea
        name='comments'
        value={clientData.comments || ''}
        onChange={handleInputChange}
        rows={6}
      />
    ) : (
      <div className='comment-block'>
        {clientData?.comments || 'Aucun commentaire'}
      </div>
    )}
  </div>

    </div>
    
    <Link to='add-care'>Voir / Ajouter les soins</Link>
    <div className='client-outlet'>
     <Outlet />
    </div>

  </div>
  )
}

export default Client