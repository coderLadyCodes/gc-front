import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import React, { createContext, useContext, useEffect} from 'react'
import { useAuth } from '../authentication/AuthProvider'

const ClientContext = createContext()
const ClientProvider = ({children}) => {
    const {user}  = useAuth()
    const queryClient = useQueryClient()

     useEffect(() => {
        if (!user) {
          return
        }
    
      }, [user])

  // Add a new client
  const addClient = useMutation({
    mutationFn: async (newClient) => {
        const response = await axios.post(`${import.meta.env.VITE_APP_API_URL}/client`, newClient, {
            withCredentials: true,
        })
        return response.data
    },
    onSuccess: () => {
        
        queryClient.invalidateQueries(['clients'])
    },
    onError: (error) => {
        console.error('Error adding client:', error)
    },
})

   // Get client by ID
    const getClientById = (id) => {
        return useQuery({
            queryKey: ['client', id],
            queryFn: async () => {
                const response = await axios.get(`${import.meta.env.VITE_APP_API_URL}/client/${id}`, {
                    withCredentials: true,  
        }) 
        return response.data  
    },
    enabled: !!id, 
    onError: (error) => {
    console.error('Error fetching client:', error)
     },
    })
    }

    const updateClient = useMutation({
        mutationFn: async ({ id, updatedData }) => {
            if (!id) {
                throw new Error('Client ID is required to update client.')
            }
            const response = await axios.put(`${import.meta.env.VITE_APP_API_URL}/client/${id}`, updatedData, {
                withCredentials: true,   
        })
        return response.data
    },
    onSuccess: (data, {id}) => {
        queryClient.setQueryData(['client', id], data)
        queryClient.invalidateQueries(['clients'])
    },
    onError: (error) => {
        console.error('Error updating client:', error)  
    },
})
    

  return (
    <ClientContext.Provider value={{ addClient, getClientById, updateClient}}>
      {children}
    </ClientContext.Provider>
  )
}
export const useClient = () => useContext(ClientContext)

export default ClientProvider