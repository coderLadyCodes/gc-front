import React, { createContext, useContext, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { useAuth } from '../authentication/AuthProvider'

const ProductContext = createContext()


export const ProductProvider = ({ children }) => {
  const {user} = useAuth()
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!user) {
      return
    }

  }, [user])


  const fetchProducts = async ({ page = 0, size = 20, search = '' }) => {
    const response = await axios.get(`/api/products`, {
      params: { page, size, search},
      withCredentials: true,
    })
    return response.data
  }

  const useProducts = ({ page = 0, size = 20, search = '' } = {}) => {
    return useQuery({
      queryKey: ['products', page, size, search],
      queryFn: () => fetchProducts({ page, size, search }),
      keepPreviousData: true, 
      staleTime: 5 * 60 * 1000,
    })
  }


  const deleteProduct = useMutation({
    mutationFn: async (id) => {
      await axios.delete(`/api/product/${id}`, {
        withCredentials: true,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['products'])
    },
    onError: (error) => {
        console.error('Erreur lors de la suppression du produit:', error.response?.data?.message || error.message)
      },
  })

  return (
    <ProductContext.Provider value={{ useProducts, deleteProduct }}>
      {children}
    </ProductContext.Provider>
  )
}

export const useProductsContext = () => useContext(ProductContext)
