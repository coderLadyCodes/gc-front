import axios from 'axios'
import { useAuth } from '../authentication/AuthProvider'
import Spinner from '../common/Spinner'
import {useEffect, useState } from 'react'
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query'
import './UserProfile.css'
import dravatar from '../../assets/images/dravatar.png'

const UserProfile = () => {
  const {user, updateUser} = useAuth()
  const userId = user?.userId
  const queryClient = useQueryClient()
  const [isEditing, setIsEditing] = useState(false)
  const [formErrors, setFormErrors] = useState({}) 
const [genericError, setGenericError] = useState('') 

  const [userDetails, setUserDetails] = useState({
    name: '', 
    email: '', 
    phone: '', 
  })

  const { data: userData, isLoading: isUserLoading } = useQuery({
    queryKey: ['user', userId],
    queryFn: async () => {
      const response = await axios.get(`/api/user/${userId}`, { withCredentials: true })
      return response.data
      console.log("response userprofile data:", response)
    },
      enabled: !!userId,
      onSuccess: (data) => {
        console.log('data from userprofile: ', data)
        setUserDetails({
          name: data.name,
          email: data.email,
          phone: data.phone,
        })
      },
      onError: (error) => {
        console.error('Failed to fetch user data:', error)
      }
    })

    useEffect(() => {
      if (userData) {
        setUserDetails({
          name: userData.name,
          email: userData.email,
          phone: userData.phone,
        })
      }
    }, [userData])


  const mutation = useMutation({
    mutationFn:(updatedDetails) => axios.put(`/api/user/${userId}`, updatedDetails,
      {withCredentials: true}),
      onSuccess: (data) => {
        const updatedUser = {
          name: data.data.name,
          email: data.data.email,
          phone: data.data.phone,
        }
        setUserDetails(updatedUser)
        updateUser(updatedUser)
        queryClient.invalidateQueries(['user', userId])
        setIsEditing(false)
    },
    onError: (error) => {
         // Extract backend error response
    if (error.response) {
      // Check if validation errors exist
      if (error.response.status === 400 && error.response.data) {
        const errors = error.response.data // Field errors
        setFormErrors(errors)
      } else if (error.response.data && error.response.data.message) {
        // Generic error
        setGenericError(error.response.data.message)
      }
    } else {
      setGenericError('Something went wrong. Please try again.')
    }
    console.error('Update failed:', error)
    },
  })

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setUserDetails((prevDetails) => ({ ...prevDetails, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    mutation.mutate(userDetails) 
  }

  if (isUserLoading) return <Spinner />
  if (!user) return <Spinner />

  return (
    <section className='user-profile-container'>
    <img src={dravatar} alt="User Avatar" className="user-avatar" />
    <div className='user-profile-info-container'>
      {isEditing ? (
        <form onSubmit={handleSubmit}>
          <div className='user-profile-info'>
            <label htmlFor='name'>Nom et Prénom</label>
            <input
              type='text'
              name='name'
              value={userDetails.name || ''}
              onChange={handleInputChange}
              required
            />
             {formErrors.name && <p style={{ color: 'red' }}>{formErrors.name}</p>}
          </div>
          <div className='user-profile-info'>
            <label htmlFor='email'>Email</label>
            <input
              type='email'
              name='email'
              value={userDetails.email || ''}
              onChange={handleInputChange}
              required
            />
            {formErrors.email && <p style={{ color: 'red' }}>{formErrors.email}</p>}
          </div>
          <div className='user-profile-info'>
            <label htmlFor='phone'>Numéro de téléphone</label>
            <input
              type='number'
              name='phone'
              value={userDetails.phone || ''}
              onChange={handleInputChange}
            />
            {formErrors.phone && <p style={{ color: 'red' }}>{formErrors.phone}</p>}
          </div>
          {genericError && <p style={{ color: 'red' }}>{genericError}</p>}
          <div className='user-profile-actions'>
            <button type='submit' disabled={mutation.isLoading}>
              {mutation.isLoading ? 'Enregistrement...' : 'Sauvegarder'}
            </button>
            <button type='button' onClick={() => setIsEditing(false)}>
              Annuler
            </button>
            {mutation.isError && (
              <p style={{ color: 'red' }}>Erreur: {mutation.error.message}</p>
            )}
          </div>
        </form>
      ) : (
        <>
          <div className='user-profile-info'>
            <h5>Nom et Prénom</h5>
            <p>{userDetails.name || 'Non spécifié'}</p>
          </div>
          <div className='user-profile-info'>
            <h5>Email</h5>
            <p>{userDetails.email || 'Non spécifié'}</p>
          </div>
          <div className='user-profile-info'>
            <h5>Numéro de téléphone</h5>
            <p>{userDetails.phone || 'Non spécifié'}</p>
          </div>
          <div className='user-profile-actions'>
            <button
              onClick={() => setIsEditing(true)}
              className='user-profile-link'
            >
              Modifier profil
            </button>
          </div>
        </>
      )}
    </div>
  </section>
  )
}

export default UserProfile