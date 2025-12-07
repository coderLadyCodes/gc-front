import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../authentication/AuthProvider'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import './AddCategory.css'

const AddCategory = () => {
    const navigate = useNavigate()
    const { user } = useAuth()
    const userId = user?.userId
    const queryClient = useQueryClient()

    // Backend fields
    const [categoryDTO, setCategoryDTO] = useState({
        userId: userId,
        name: '',
        tva: '',
    })

    // Frontend-only color
    const [color, setColor] = useState('#ff8c00')

    const addCategory = useMutation({
        mutationFn: async (newCategory) => {
            const response = await axios.post(`/api/category`, newCategory, {
                withCredentials: true,
            })
            return response.data
        },
        onSuccess: (savedCategory) => {

            // 🌈 Save color in localStorage with category ID
            localStorage.setItem(
                `category-color-${savedCategory.id}`,
                color
            )

            queryClient.invalidateQueries(['categories'])

        },
        onError: (error) => {
            console.error('Error adding client:', error)
        },
    })

    const handleChange = (e) => {
        const { name, value } = e.target
        setCategoryDTO(prev => ({ ...prev, [name]: value }))
    }

    const handleSubmit = (e) => {
        e.preventDefault()

        const finalCategoryDTO = {
            ...categoryDTO,
            tva: categoryDTO.tva === '' ? null : categoryDTO.tva,
        }

        addCategory.mutate(finalCategoryDTO)
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

                {/* 🌈 Color Picker */}
                <label>
                    Choisir une couleur:
                    <input
                        type='color'
                        value={color}
                        onChange={(e) => setColor(e.target.value)}
                        style={{ width: '60px', height: '50px', border: 'none' }}
                    />
                </label>

                {/* Preview */}
                <div
                    style={{
                        background: color,
                        padding: '6px 14px',
                        borderRadius: '8px',
                        color: 'white',
                        fontWeight: 'bold',
                        marginTop: '10px',
                        display: 'inline-block'
                    }}
                >
                    Aperçu de la couleur
                </div>

                <div className='add-category-actions'>
                    <button type='submit' disabled={addCategory.isLoading}>
                        {addCategory.isLoading ? 'Enregistrement...' : 'Ajouter'}
                    </button>

                    <button
                        className='add-category-cancel-link'
                        onClick={() => navigate(-1)}
                    >
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
