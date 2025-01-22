import React, { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import './Categories.css' 
import axios from 'axios'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import Spinner from '../common/Spinner'
import { useProductCategory } from './ProductCategoryProvider'


const Categories = () => {
  const { categories, isLoading, isError, error } = useProductCategory()
  const [editingCategory, setEditingCategory] = useState(null)
  const [editName, setEditName] = useState("")
  const queryClient = useQueryClient()

const editCategory = useMutation({
  mutationFn: async ({id, name}) => {
    await axios.put(`${import.meta.env.VITE_APP_API_URL}/category/${id}`, { name }, { withCredentials: true,})
  }, 
  onSuccess: () => {
    queryClient.invalidateQueries(['categories'])
    setEditingCategory(null)
  }
})

const handleEditClick = (category) => {
  setEditingCategory(category.id)
  setEditName(category.name)
}

const handleSaveClick = (id) => {
  editCategory.mutate({ id, name: editName })
}

const deleteCategory = useMutation({
  mutationFn: async (categoryId) => {
      await axios.delete(`${import.meta.env.VITE_APP_API_URL}/category/${categoryId}`, {
          withCredentials: true,
      })
  },
  onSuccess: () => {
      queryClient.invalidateQueries(['categories'])
  },
})


const handleDeleteCategory = (id) => {
  let userChoice = window.confirm('Voulez-vous supprimer cette catégorie ?')
  if (userChoice) {
    deleteCategory.mutate(id)
  }
}

if (isLoading) return <Spinner/>
if (isError) return <p>Error: {error.message}</p>

const sortedCategories = [...categories].sort((a,b) => b.id - a.id)

  return (
    <div className="categories-container">
    <h1>Categories</h1>
    <div className="categories-links">
      <NavLink to="/dashboard/add-category">Ajouter une Catégorie</NavLink>
      <Link to="/dashboard/product-category">Retour</Link>
    </div>

    <table className="categories-table">
      <thead>
        <tr>
          <th>Catégories de produits</th>
        </tr>
      </thead>
      <tbody>
        {sortedCategories.map((category) => (
          <tr key={category.id}>
            <td>
              {editingCategory === category.id ? (
                // Show input field in edit mode
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  autoFocus
                />
              ) : (
                category.name
              )}
            </td>
            <td className="action-buttons">
              {editingCategory === category.id ? (
                <button
                  className="view-button"
                  onClick={() => handleSaveClick(category.id)}
                >
                  Sauvegarder
                </button>
              ) : (
                <button
                  className="view-button"
                  onClick={() => handleEditClick(category)}
                >
                  Modifier
                </button>
              )}
              <button
                className="delete-button"
                onClick={() => handleDeleteCategory(category.id)}
                disabled={deleteCategory.isLoading}
              >
                {deleteCategory.isLoading ? 'Deleting...' : 'Supprimer'}
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>

    {deleteCategory.isError && (
      <p className="error-message">Error: {deleteCategory.error.message}</p>
    )}
    {editCategory.isError && (
      <p className="error-message">Error: {editCategory.error.message}</p>
    )}
  </div>
  )
}

export default Categories
