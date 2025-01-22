import React, { useEffect, useState } from 'react'
import './ClientsList.css'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import Spinner from '../common/Spinner'
import axios from 'axios'

const ClientsList = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState(search)
  const [page, setPage] = useState(0) 
  const [size, setSize] = useState(20)

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(search), 800)
    return () => clearTimeout(handler)
  }, [search])

  const getClients = async (page, size, search) => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_APP_API_URL}/clients`,{
        params: { page, size, search},
        withCredentials: true })
      return response.data
    } catch (error) {

      throw new Error('liste de clients non chargée.')
    }
  }

  const {data, error, isLoading } = useQuery({
    queryKey: ['clients', page, size, debouncedSearch],
    queryFn: () => getClients(page, size, debouncedSearch),
    keepPreviousData: true,
    cacheTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true, // Ensure refetch on window focus
  })

  const deleteClient = async (id) => {
    await axios.delete(`${import.meta.env.VITE_APP_API_URL}/client/${id}`, { withCredentials: true })
  }

  const deleteMutation = useMutation({
    mutationFn: deleteClient, 
    onSuccess: () => {
      queryClient.invalidateQueries(['clients'])
    },
    onError: (error) => {
      console.error("Erreur lors de la suppression du client:", error)
    }
  })

  const handleDeleteClient = (id) => {
    let userChoice = window.confirm('Voulez-vous supprimer ce client ? si ce client posséde des programmes de soins, supprimez les en premier !')
    if (userChoice) {
      deleteMutation.mutate(id)
    }
  }

  if (isLoading) return <Spinner />
  if (error) return <p className='error-message'>{error.message}</p>

  const clients = data?.content || []
  const totalPages = data?.totalPages || 0

  return (
    <div className='clients-list-container'>
    <h2 className='clients-list-title'>Liste des Clients</h2>

    <div className="clients-list-search">
      <input
        type="text"
        placeholder="Rechercher un client..."
        value={search}
        onChange={(e) => {
          setSearch(e.target.value)
          setPage(0) 
        }}
        autoFocus={true}
        className="clients-list-search-input"/>
         <button
    className="add-client-button-list"
    onClick={() => navigate('/dashboard/add-client')}>
    Ajouter un client
  </button>
    </div>

    {clients.length === 0 ? (
      <p className='clients-list-no-clients'>Aucun client trouvé.</p>
    ) : (
      <table className='clients-list-table'>
        <thead>
          <tr className='clients-list-header'>
            <th>Nom</th>
            <th>Prénom</th>
            <th>Code Postal</th>
            <th>Sexe</th>
          </tr>
        </thead>
        <tbody>
          {clients.map(client => (
            <tr key={client.id} className='clients-list-row'>
              <td className='clients-list-cell'>{client.lastName}</td>
              <td className='clients-list-cell'>{client.firstName}</td>
              <td className='clients-list-cell'>{client.zipCode}</td>
              <td className='clients-list-cell'>{client.sex}</td>
              <td className='clients-list-cell'>
                <button
                  className='clients-list-button'
                  onClick={() => navigate(`/dashboard/client/${client.id}`)}
                >
                  Profil
                </button>
                <button className='delete-profile-button' onClick={() => handleDeleteClient(client.id)}>
          Supprimer
        </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    )}

    <div className='pagination-controls'>
      <button
        className='pagination-button'
        onClick={() => setPage((prev) => Math.max(prev - 1, 0))}
        disabled={page === 0} >
        Précédent
      </button>
      <span>Page {page + 1} sur {totalPages}</span>
      <button
        className='pagination-button'
        onClick={() => setPage((prev) => Math.min(prev + 1, totalPages - 1))}
        disabled={page + 1 >= totalPages} >
        Suivant
      </button>
    </div>
  </div>
   
  )
}

export default ClientsList