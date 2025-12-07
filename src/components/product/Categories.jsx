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
  const [editTva, setEditTva] = useState('')

  const [editColor, setEditColor] = useState("#ff8c00");

 // 🌈 color
  const queryClient = useQueryClient();

   // 🌈 color in localStorage with category ID
  const getCategoryColor = (categoryId) => {
    return localStorage.getItem(`category-color-${categoryId}`) || "#999999";
  };


const editCategory = useMutation({
  mutationFn: async ({id, name, tva}) => {
    await axios.put(`/api/category/${id}`, { name, tva }, { withCredentials: true,})
  }, 
  onSuccess: () => {
    queryClient.invalidateQueries(['categories'])
    setEditingCategory(null)
  }
})

const handleEditClick = (category) => {
  setEditingCategory(category.id)
  setEditName(category.name)
  setEditTva(category.tva)

  // 🌈 color
   const storedColor = localStorage.getItem(`category-color-${category.id}`)
   setEditColor(storedColor || "#ff8c00")
}

// const handleSaveClick = (id) => {
//   editCategory.mutate({ id, name: editName, tva: editTva })
// }
const handleSaveClick = (id) => {
  // If editTva is an empty string, set it to null to properly handle "Aucune TVA"
  const finalTva = editTva === '' ? null : editTva;  // Check if it's empty string and set to null

  // 🌈 color
  localStorage.setItem(`category-color-${id}`, editColor)

  editCategory.mutate({ id, name: editName, tva: finalTva });
};


const deleteCategory = useMutation({
  mutationFn: async (categoryId) => {
      await axios.delete(`/api/category/${categoryId}`, {
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
          <th>TVA</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {sortedCategories.map((category) => (
          <tr key={category.id}>
            <td style={{
                borderLeft: `10px solid ${getCategoryColor(category.id)}`,
                paddingLeft: "10px"
            }}
        >
              {editingCategory === category.id ? (
                  // 🌈 color
                   <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  autoFocus
                />
                {/* Color Picker */}
                    <input
                      type="color"
                      value={editColor}
                      onChange={(e) => setEditColor(e.target.value)}
                      style={{ width: "40px", height: "30px", border: "none" }}
                    />
                    {/* Preview */}
                        <div
                          style={{
                            width: "25px",
                            height: "25px",
                            borderRadius: "6px",
                            background: editColor
                          }}
                        ></div>

                      </div>
              ) : (
                category.name
              )}
            </td>
            <td>
            {editingCategory === category.id ? (
              <select
              id="tva"
              name='tva'
                value={editTva === null ? '' : editTva} // If editTva is null, show the empty string for "Aucune TVA"
                onChange={(e) => setEditTva(e.target.value === '' ? null : e.target.value)}>
{/*                 <option value=''>Aucune TVA</option> */}
                <option value='TVA5,5%'>TVA 5,5%</option>
                <option value='TVA20%'>TVA 20%</option>
              </select>
            ) : (
              category.tva || 'sans tva'
            )}
          </td>
            <td className="action-buttons">
              {editingCategory === category.id ? (
                <button
                  className="view-button"
                  onClick={() => handleSaveClick(category.id)}>
                  Sauvegarder
                </button>
              ) : (
                <button
                  className="view-button"
                  onClick={() => handleEditClick(category)}>
                  Modifier
                </button>)}
              <button
                className="delete-button"
                onClick={() => handleDeleteCategory(category.id)}
                disabled={deleteCategory.isLoading}>
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
