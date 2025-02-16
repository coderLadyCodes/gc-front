import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../authentication/AuthProvider'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import './AddCategory.css' 

const AddCategory = () => {
    const navigate = useNavigate()
    const {user} = useAuth()
    const userId = user?.userId
    const queryClient = useQueryClient();

    const [categoryDTO, setCategoryDTO] = useState({
        userId:userId,
        name: '',
        tva: '',
    })

    const addCategory = useMutation({
        mutationFn: async (newCategory) => {
            const response = await axios.post(`/api/category`, newCategory, {
            withCredentials: true,
        })
        return response.data

        },
        onSuccess: () => {
            queryClient.invalidateQueries(['categories'])
        },
        onError: (error) => {
            console.error('Error adding client:', error)
            },
    })

    const handleChange = (e) => {
        const {name, value} = e.target
        setCategoryDTO((prevData) => ({...prevData, [name]: value}))
    }

    const handleSubmit = (e) => {
        e.preventDefault()
      // If TVA is empty, set it to null before submitting
        const finalCategoryDTO = {
            ...categoryDTO,
            tva: categoryDTO.tva === '' ? null : categoryDTO.tva, // Convert empty string to null
        }

        addCategory.mutate(finalCategoryDTO)  // Submit the modified category
        //addCategory.mutate(categoryDTO)
        navigate('/dashboard/categories') 
    }

  return (
    <div className='add-category-container'>
            <h2>Ajouter une catégorie pour vos produits</h2>
            <form className='add-category-form' onSubmit={handleSubmit}>
                <label>
                    Nom de la catégorie:
                    <input
                        type='text'
                        name='name'
                        value={categoryDTO.name}
                        onChange={handleChange}
                        required
                    />
                </label>
                {/* Add the TVA dropdown */}
                <label>
                    TVA:
                    <select
                        name='tva'
                        value={categoryDTO.tva}
                        onChange={handleChange}
                    >
                        <option value=''>SANS TVA</option>
                        <option value='TVA5,5%'>TVA 5,5%</option>
                        <option value='TVA20%'>TVA 20%</option>
                    </select>
                </label>
                <div className="add-category-actions">
                <button type='submit' disabled={addCategory.isLoading}>
                    {addCategory.isLoading ? 'Enregistrement...' : 'Ajouter'}
                </button>
                <button className='add-category-cancel-link' onClick={() => navigate(-1)}>
                Annuler
            </button>
            </div>
            </form>

            {addCategory.isError && (
                <p className='error-message'>
                    Erreur: {addCategory.error?.response?.data?.message || addCategory.error?.message}
                </p>
            )}
        </div>
  )
}

export default AddCategory