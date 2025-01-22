import React, { useEffect, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import './ProductCategory.css'
import axios from 'axios'
import Spinner from '../common/Spinner'
import { useProductsContext } from './ProductProvider'


const ProductCategory = () => {
  
  const useDebounce = (value, delay) => {
    const [debouncedValue, setDebouncedValue] = useState(value)   
    useEffect(() => {
      const handler = setTimeout(() => setDebouncedValue(value), delay)
      return () => clearTimeout(handler)
    }, [value, delay])
    return debouncedValue
  }

  const navigate = useNavigate()
  const [page, setPage] = useState(0) 
  const [size, setSize] = useState(20)
  const [search, setSearch] = useState('')

  const debouncedSearch = useDebounce(search, 1000)

  const { useProducts, deleteProduct } = useProductsContext()

  const { data: productsData, isLoading, isError, error } = useProducts({
    page, size, search: debouncedSearch,staleTime: 5000, keepPreviousData: true,
  })


  const handleDelete = (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
      deleteProduct.mutate(id)
    }
  }

   // Group products by category name
   const groupedProducts = productsData?.content?.reduce((groups, product) => {
    const category = product.categoryDTO?.name || "Sans catégorie" 
    if (!groups[category]) {
      groups[category] = []
    }
    groups[category].push(product)
    return groups
  }, {}) || {}

  if (isLoading) return <Spinner />
  if (isError) return <p className='error-message'>{error.message || 'Une erreur est survenue.'}</p>

  return (
  <div className='productcategory-wrapper'>
  <div className='productcategory-container'>
  <h1 className='productcategory-title'>Produits et catégories</h1>
  <div className='productcategory-nav-links'>
    <NavLink to='/dashboard/add-product' className='productcategory-navlink'>Ajouter un produit</NavLink>
    <NavLink to='/dashboard/categories' className='productcategory-navlink'>Catégories</NavLink>
  </div>

  <h2 className='productcategory-subtitle'>Liste des produits</h2>

  <div className='productcategory-search'>
    <input
      type='text'
      placeholder='Chercher un produit'
      value={search}
      onChange={(e) => {
        setSearch(e.target.value)
         setPage(0)}} 
         autoFocus={true}
      className='productcategory-search-input'
    />
  </div>

  {Object.keys(groupedProducts).length === 0 ? (
    <p className='productcategory-no-results'>Aucun produit trouvé.</p>
  ) : (
    Object.entries(groupedProducts).map(([categoryName, products]) => (
      <div key={categoryName} className='productcategory-category-group'>
        <h3 className='productcategory-category-name'>{categoryName}</h3>
        <div className='productcategory-table-wrapper'>
        <table className='productcategory-table'>
          <thead className='productcategory-table-head'>
            <tr className='productcategory-table-row'>
              <th className='productcategory-table-header'>Nom</th>
              <th className='productcategory-table-header'>Type</th>
              <th className='productcategory-table-header'>Référence</th>
              <th className='productcategory-table-header'>Prix</th>
            </tr>
          </thead>
          <tbody className='productcategory-table-body'>
            {products.map((product) => (
              <tr key={product.id} className='productcategory-product-row'>
                <td className='productcategory-product-cell'>{product.name}</td>
                <td className='productcategory-product-cell'>{product.type}</td>
                <td className='productcategory-product-cell'>{product.refProduct}</td>
                <td className='productcategory-product-cell'>{product.productPrice ? parseFloat(product.productPrice).toFixed(2) : '0.00'} €</td>
                <td className='productcategory-action-buttons'>
                  <button
                    onClick={() => navigate(`/dashboard/product-detail/${product.id}`)}
                    className='productcategory-view-button'>
                    Détails
                  </button>
                  <button
                    onClick={() => handleDelete(product.id)}
                    className='productcategory-delete-button'>
                    Supprimer
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>
    ))
  )}

  {productsData?.totalPages && productsData.totalPages > 1 && (
    <div className='productcategory-pagination'>
      <button
        onClick={() => setPage((prev) => Math.max(prev - 1, 0))}
        disabled={page === 0}
        className='productcategory-pagination-button'
      >
        Précédent
      </button>
      <span className='productcategory-pagination-info'>Page {page + 1} sur {productsData.totalPages}</span>
      <button
        onClick={() => setPage((prev) => (productsData.totalPages - 1 > prev ? prev + 1 : prev))}
        disabled={page >= productsData.totalPages - 1}
        className='productcategory-pagination-button'
      >
        Suivant
      </button>
    </div>
  )}
  </div>
</div>
  )
}

export default ProductCategory