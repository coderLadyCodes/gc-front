import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import React, { createContext, useContext } from 'react'

const ProductCategoryContext = createContext()
export const useProductCategory = () => useContext(ProductCategoryContext)

const ProductCategoryProvider = ({ children }) => {

    const getCategories = async () => {
        const response = await axios.get(`/api/categories`, {
            withCredentials: true,
        })
        return response.data
      }
    
    const {data:categories = [], isLoading, isError, error} = useQuery({
      queryKey: ['categories'],
      queryFn: getCategories,
      cacheTime: 5 * 60 * 1000,
      staleTime: 2 * 60 * 1000,
    })
    
  return (
    <ProductCategoryContext.Provider value={{categories, getCategories, isLoading, isError, error}}>
        {children}
    </ProductCategoryContext.Provider>
  )
}

export default ProductCategoryProvider