import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../authentication/AuthProvider'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { useProductCategory } from './ProductCategoryProvider'
import './AddProduct.css'
import ReactQuill from "react-quill-new"
import 'react-quill-new/dist/quill.snow.css'


const AddProduct = () => {
  const navigate = useNavigate()
  const {user} = useAuth()
  const userId = user?.userId
  const queryClient = useQueryClient()
  const {categories, isLoading, isError, error} = useProductCategory()

  const [productDTO, setProductDTO] = useState({
    userId:userId,
    name: '',
    type: '',
    refProduct: '',
    productPrice:'',
    description: '',
    categoryDTO: null,
  })

  const [backendError, setBackendError] = useState(null)

//       Frontend-only color
      const [color, setColor] = useState('#ff8c00')

  const addProduct = useMutation({
    mutationFn: async (newProduct) => {
            const response = await axios.post(`/api/product`, newProduct, {  withCredentials: true,})
   return response.data
    },
    onSuccess: (savedProduct) => {
         // 🎨 save product color
          localStorage.setItem(`product-color-${savedProduct.id}`, color)

      queryClient.invalidateQueries({ queryKey: ['products'] })
      navigate('/dashboard/product-category')
    },
    onError: (error) => {
      if (error.response && error.response.data && error.response.data.message) {
        setBackendError(error.response.data.message) 
      } else {
        setBackendError("Une erreur est survenue.")
      }
    },
  })
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'productPrice') {
      const formattedValue = value.replace(',', '.')
      if (/^\d*\.?\d*$/.test(formattedValue)) {
      setProductDTO((prevData) => ({
        ...prevData,
        productPrice: formattedValue,
      }))
    }
    } else if (name === 'categoryDTO') {
      const selectedCategory = categories.find((cat) => cat.name === value)
      setProductDTO((prevData) => ({
        ...prevData,
        categoryDTO: selectedCategory ? { id: selectedCategory.id, name: value, tva: selectedCategory.tva } : null,
      }))
    } else {
      setProductDTO((prevData) => ({
        ...prevData,
        [name]: value,
      }))
    }
  }

  const handleDescriptionChange = (content) => {
    setProductDTO((prevData) => ({
      ...prevData,
      description: content,
    }));
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setBackendError(null)
    const formattedProductDTO = {
      ...productDTO,
      productPrice: parseFloat(productDTO.productPrice) || 0,
       // Make sure you include the category with its tva
          categoryDTO: productDTO.categoryDTO ? {
            id: productDTO.categoryDTO.id,
            name: productDTO.categoryDTO.name,
            tva: productDTO.categoryDTO.tva,
          } : null,
    }
    addProduct.mutate(formattedProductDTO)
  }

  return (
    <div className='add-product-container'>
      <h1>Ajouter un produit</h1>
  
      {isLoading && <p className='add-product-loading'>Chargement de categories...</p>}
      {isError && <p className='add-product-categories-error'>Erreur de chargement des categories: {error.message}</p>}
      {backendError && <p className='add-product-error'>{backendError}</p>}
  
      <form className='add-product-form' onSubmit={handleSubmit}>
        <div className='add-product-field'>
          <label>Nom du produit</label>
          <small className='input-helper-text-addproduct'>Limite de 50 caractères</small>
          <input
            type='text'
            name='name'
            value={productDTO.name}
            onChange={handleChange}
            maxLength={50}
            required
          />
        </div>
  
        <div className='add-product-field'>
          <label>Type</label>
          <input
            type='text'
            name='type'
            value={productDTO.type}
            onChange={handleChange}
            required
          />
        </div>
        <div className='add-product-field'>
          <label>Référence</label>
          <input
            type='text'
            name='refProduct'
            value={productDTO.refProduct}
            onChange={handleChange}
            required
          />
        </div>
  
        <div className='add-product-field'>
        <label>Description</label>
        <ReactQuill
          value={productDTO.description || ''}
          onChange={handleDescriptionChange}
          theme="snow" 
          modules={{
            toolbar: [
              [{ header: [1, 2, 3, false] }],
              ['bold', 'italic', 'underline', 'strike'],
              [{ color: [] }, { background: [] }], 
              [{ list: 'ordered' }, { list: 'bullet' }],
              ['link'],
              ['clean'],
            ],
          }}
          className="custom-quill-editor"
          style={{ height: '200px', marginBottom: '30px'}}
        />
      </div>
  
        <div className='add-product-field prix'>
          <label>Prix</label>
          <input
            type='text'
            name='productPrice'
            value={productDTO.productPrice}
            onChange={handleChange}
            required
          />
        </div>
  
        <div className='add-product-field'>
          <label>Categorie de produit</label>
          <select
            name='categoryDTO'
            value={productDTO.categoryDTO?.name || ''}
            onChange={handleChange}
          >
            <option value=''>Selectionnez une catégorie</option>
            {categories.map((category) => (
              <option key={category.id} value={category.name}>
                {category.name} ({category.tva})
              </option>
            ))}
          </select>
        </div>

        <div className='add-product-field'>
          <label>Couleur du produit</label>

          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            style={{ width: '60px', height: '40px', border: 'none' }}
          />

          {/* Preview */}
          <div
            style={{
              marginTop: "8px",
              display: "inline-block",
              padding: "6px 12px",
              borderRadius: "8px",
              background: color,
              color: "white",
              fontWeight: "bold"
            }}
          >
            Aperçu
          </div>
        </div>

  
        <div className="add-product-buttons-container">
        <button type="submit">Sauvegarder</button>
        </div>
      </form>
  
      <button onClick={() => navigate(-1)}>Annuler</button>
    </div>
  )
  
}

export default AddProduct