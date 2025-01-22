import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import React, { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Spinner from '../common/Spinner'
import { useProductCategory } from './ProductCategoryProvider'
import './ProductDetail.css'
import DOMPurify from 'dompurify'
import ReactQuill from "react-quill-new"
import 'react-quill-new/dist/quill.snow.css'

const ProductDetail = () => {
    const { id } =  useParams()
    const navigate = useNavigate()
    const queryClient = useQueryClient()
    const [isEditing, setIsEditing] = useState(false)
    const [productData, setProductData] = useState(null)
    const { categories } = useProductCategory()
    

    const {data: product, isLoading, isError, error} = useQuery({
        queryKey: ['product', id],
        queryFn: async () => {
            const response = await axios.get(`/api/product/${id}`, {withCredentials: true,})
            return response.data
        },
        onSuccess: (data) => {
          if (!productData) {
            setProductData(data)
        }
        },
        cacheTime: 5 * 60 * 1000,
        keepPreviousData: true,
    })

    const updateProduct = useMutation({
      mutationFn: async (updatedProduct) => {
        await axios.put(`/api/product/${id}`, updatedProduct, { withCredentials: true })
      },
      onSuccess: (data) => {
        if (!productData) {
          setProductData(data)
        }
        queryClient.invalidateQueries(['product', id])
        setIsEditing(false)
      },
      onError: (error) => {
        console.error("Error updating product:", error.response?.data?.message || error.message)
      }
    })

    const handleChange = (e) => {
      const { name, value } = e.target
  
      setProductData((prevData) => {
          // Handle specific logic for "productPrice"
          if (name === "productPrice") {
              const formattedValue = value.replace(',', '.') 
              if (/^\d*\.?\d*$/.test(formattedValue)) { 
                  return {
                      ...prevData,
                      productPrice: formattedValue,
                  }
              }
              return prevData
          }
  
          return {
              ...prevData,
              [name]: value,
          }
      })
  }
  

  const handleQuillChange = (value) => {
    setProductData((prevData) => ({
        ...prevData,
        description: value,
    }))
}

  const handleSave = () => {
    if (productData) {
      const updatedData = {
        ...productData,
        productPrice: parseFloat(productData.productPrice) || 0, 
      }
      updateProduct.mutate(updatedData)
    }
  }

    if (isLoading) return <Spinner />
    if (isError) return <p className='error-message'>{error.message || 'Une erreur est survenue.'}</p>

  return (
    <div className="productdetail-wrapper">
    <div className="productdetail-container">
        <h2 className="productdetail-title">Détails du produit</h2>
        <div className="productdetail-buttons">
            <button 
              className="productdetail-button" 
              onClick={() => {
                setProductData(product)
                setIsEditing(true)
              }}>
              Modifier
            </button>
            <button 
              className="productdetail-button" 
              onClick={() => navigate(-1)}>
              Retour
            </button>
        </div>
        
        {isEditing ? (
            <div className="productdetail-content">
                <p><strong>Nom:</strong> <input type="text" name="name" value={productData?.name || ''} onChange={handleChange} maxLength={50}/>
                <small className="input-helper-text-productdetail">Limite de 50 caractères</small></p>
                <p><strong>Type:</strong> <input type="text" name="type" value={productData?.type || ''} onChange={handleChange} /></p>
                <p><strong>Référence:</strong> <input type="text" name="refProduct" value={productData?.refProduct || ''} onChange={handleChange} /></p>
                <p><strong>Prix:</strong> <input type="text" name="productPrice" value={productData?.productPrice || ''} onChange={handleChange} /></p>
                <div className='add-product-field'>
        <label>Description</label>
        <ReactQuill
          value={productData.description || ''}
          onChange={handleQuillChange}
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
                <p><strong>Catégorie:</strong>
                    <select
                        name="category"
                        value={productData?.categoryDTO?.id || ''}
                        onChange={(e) => {
                          const selectedCategoryId = e.target.value
                          setProductData((prevData) => ({
                            ...prevData,
                            categoryDTO: selectedCategoryId
                              ? { id: selectedCategoryId, name: categories.find((cat) => cat.id === selectedCategoryId)?.name || '' }
                              : null,
                          }))
                        }}>
                        <option value="">-- Choisir une catégorie --</option>
                        {categories.map((category) => (
                            <option key={category.id} value={category.id}>
                                {category.name}
                            </option>
                        ))}
                    </select>
                </p>
                <button className="productdetail-button" onClick={handleSave}>Enregistrer</button>
            </div>
        ) : (
            <div className="productdetail-content">
                <p><strong>Nom:</strong> {product.name}</p>
                <p><strong>Type:</strong> {product.type}</p>
                <p><strong>Référence:</strong> {product.refProduct}</p>
                <p><strong>Prix:</strong> {product.productPrice.toFixed(2)} €</p>
                <p><strong>Catégorie:</strong> {product.categoryDTO?.name || 'Sans Catégorie'}</p>
                <p><strong>Description:</strong></p>
                <div 
                  className="productdetail-description-card" 
                  dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(product.description) }}
                ></div>
            </div>
        )}
    </div>
</div>
  )
}

export default ProductDetail