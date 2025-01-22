import React, { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import Spinner from '../common/Spinner'
import './AddCare.css'
import { useAuth } from '../authentication/AuthProvider'
import {useProductsContext} from '../product/ProductProvider'
import Modal from '../common/Modal'


const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value)
  React.useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(handler)
  }, [value, delay])
  return debouncedValue
}

const AddCare = ({program, onClose, onCaresUpdated }) => {
  const navigate = useNavigate()
  const { clientId } = useParams()
  const { user } = useAuth()
  const userId = user?.userId
  const [isProductModalOpen, setIsProductModalOpen] = useState(false)
  const [page, setPage] = useState(0)
  const [size, setSize] = useState(20)
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 500)
  const queryClient = useQueryClient()
  const [careFields, setCareFields] = useState(
    program?.cares.map((care) => ({
      ...care,
      productDTO: care.productDTO || {},
      programId: care.programId || program?.id || null, 
    })) || []
  )

   // Use the product context for fetching products
  const {useProducts} = useProductsContext()
  const { data: productsData, isLoading, error } = useProducts({ page, size, search: debouncedSearch })

  const saveCareMutation = useMutation({
    mutationFn: async (newCare) => {
      const response = await axios.post(`/api/care`, newCare, {
        withCredentials: true,
      })
      return { data: response.data, newCare }
    },
    onSuccess: ({ data, newCare }) => { 
      setCareFields((prev) =>
        prev.map((care) =>
          care === newCare ? { ...care, id: data.id } : care
        ))  
      queryClient.invalidateQueries(['programs', clientId])
    },
    onError: (error) => {
      console.error('Error saving care:', error)
      alert("Une erreur est survenue lors de l'ajout du soin.")
    },
  })
 

  const handleAddProductToCare = async (product) => {
  const productExists = careFields.some(care => care.productDTO.id === product.id)

  if (productExists) {
    alert('Ce produit a déjà été ajouté.')
    return
  }
    const newCare = {
      productDTO: product,
      created: new Date().toISOString().split('T')[0],
      clientId: clientId,
      userId: userId,
      quantity: 1,
      carePrice: product.productPrice * 1,
      programId: program?.id || null,
    }
    setCareFields((prev) => [...prev, newCare])
    setIsProductModalOpen(false)
    setSearch('')
  }

  const handleRemoveCare = (index) => {
    const confirmDelete = window.confirm('Voulez-vous vraiment supprimer ce soin ?')
    if (confirmDelete) {
      setCareFields((prev) => prev.filter((_, i) => i !== index))
    }
  }

  const handleSaveProgram = async () => {
    if (!clientId) {
      alert("Le client n'est pas défini pour ce programme.")
      return
    }

    if (careFields.length === 0) {
      alert("Veuillez ajouter au moins un soin avant d'enregistrer le programme.")
      return
    }

    // Calculate total price of the program
    const programPrice = careFields.reduce((total, care) => total + parseFloat(care.carePrice || 0), 0)

    try {
      const savedCares = []
      for (const care of careFields) {
        if (!care.id) {
          const response = await saveCareMutation.mutateAsync({
            clientId: care.clientId,
            userId: care.userId,
            productDTO: care.productDTO,
            carePrice: care.carePrice,
            quantity: care.quantity,
            programId: program?.id || null,
            created: care.created,
          })
          savedCares.push(response.data)
        } else {
          // If care already has an id, you can update it
        const updatedCare = { ...care, quantity:  Number(care.quantity), carePrice: care.carePrice, programId: program?.id || null,}
        const response = await axios.put(`/api/care/${care.id}`, updatedCare, {
          withCredentials: true,
        })
          savedCares.push(response.data)
        }
      }

      const programData = {
        cares: savedCares.map((care) => ({
          clientId: care.clientId,
          userId: care.userId,
          productDTO: care.productDTO,
          carePrice: care.carePrice,
          quantity: care.quantity,
          programId: care.programId,
        })),
        userId: userId,
        clientId: clientId,
        createdDate: program?.createdDate || new Date().toISOString().split('T')[0],
        programReference: program?.programReference || "New Program",
        totalProgramPrice: programPrice,
      }

      if (program?.id) {
         await axios.put(`/api/program/update/${program.id}`, programData, {
          withCredentials: true,
        })
        alert('Programme mis à jour avec succès!')
      } else {

      await axios.post(`/api/program`, programData, {
        withCredentials: true,
      })
      alert('Programme créé avec succès!')
      }

      queryClient.invalidateQueries(['programs', clientId])
      setCareFields([])

      if (typeof onCaresUpdated === 'function') {
        onCaresUpdated()
      }
      navigate(`/dashboard/client/${clientId}/add-care`)

    } catch (error) {
      console.error("Erreur lors de l'enregistrement du programme:", error);
      alert("Une erreur est survenue lors de l'enregistrement du programme.");
    }
  }

  const groupedProducts =
    productsData?.content?.reduce((groups, product) => {
      const category = product.categoryDTO?.name || 'Sans Catégorie'
      if (!groups[category]) {
        groups[category] = []
      }
      groups[category].push(product)
      return groups
    }, {}) || {}

  if (isLoading) return <Spinner />;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <div className="add-care-container">
      <h2>{program?.id ? `Modifier le Programme ${program.programReference}` : "Ajouter des soins"}</h2>
      <table className="care-table">
      {careFields.length > 0 && (
    <>
        <thead>
          <tr>
            <th>Produit</th>
            <th>Type</th>
            <th>Référence</th>
            <th>Catégorie</th>
            <th>Prix du Produit</th>
            <th>Quantité</th>
            <th>Prix Total</th>
          </tr>
        </thead>
        <tbody>
          {careFields.map((care, index) => (
            <tr key={index}>
              <td>{care.productDTO?.name || 'Produit inconnu'}</td>
              <td>{care.productDTO?.type || 'Type inconnu'}</td>
              <td>{care.productDTO?.refProduct || 'Référence inconnue'}</td>
              <td>{care.productDTO?.categoryDTO?.name || 'Sans Catégorie'}</td>
              <td>{care.productDTO?.productPrice.toFixed(2)} €</td>
              <td>
                <input
                  type="number"
                  value={care.quantity}
                  onChange={(e) => {
                    const newQuantity = e.target.value;
                    setCareFields((prev) =>
                      prev.map((item, i) => i === index ? { ...item, quantity: newQuantity,
                          carePrice: item.productDTO.productPrice * newQuantity, } : item))}}min="1"/>
              </td>
              <td>{care.carePrice.toFixed(2)} €</td>
              <td>
                <button className='addcare-supp' onClick={() => handleRemoveCare(index)}>Supprimer</button>
              </td>
            </tr>
          ))}
        </tbody>
        </>)}
      </table>
      <div className='addcare-buttons'>
      <button onClick={() => setIsProductModalOpen(true)}>Ajouter un produit</button>
      <button onClick={handleSaveProgram} disabled={careFields.length === 0}>Enregistrer les soins</button>
     </div>

      <Modal isOpen={isProductModalOpen} onClose={() => setIsProductModalOpen(false)}>
        <div className="modal-overlay">
          <div className="modal">
            <h3>Sélectionner un produit</h3>
            <input
              type="text"
              placeholder="Chercher un produit"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(0);
              }}
              className="product-search-input"
            />

            <div className="modal-products-container">
              {Object.keys(groupedProducts).length === 0 ? (
                <p>Aucun produit trouvé.</p>
              ) : (
                Object.entries(groupedProducts).map(([categoryName, products]) => (
                  <div key={categoryName} className="product-category-group">
                    <h4>{categoryName}</h4>
                    <table className="product-table">
                      <thead>
                        <tr>
                          <th>Nom</th>
                          <th>Type</th>
                          <th>Référence</th>
                          <th>Prix</th>
                        </tr>
                      </thead>
                      <tbody>
                        {products.map((product) => (
                          <tr key={product.id}>
                            <td>{product.name}</td>
                            <td>{product.type}</td>
                            <td>{product.refProduct}</td>
                            <td>{parseFloat(product.productPrice).toFixed(2)} €</td>
                            <td>
                              <button onClick={() => handleAddProductToCare(product)} className="addcare-productmodal">
                                Ajouter
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ))
              )}
            </div>

            {productsData?.totalPages > 1 && (
              <div className="modal-pagination">
                <button
                  onClick={() => setPage((prev) => Math.max(prev - 1, 0))}
                  disabled={page === 0}
                >
                  Précédent
                </button>
                <span className="pagination-info">
                  Page {page + 1} sur {productsData.totalPages}
                </span>
                <button
                  onClick={() => setPage((prev) => Math.min(prev + 1, productsData.totalPages - 1))}
                  disabled={page === productsData.totalPages - 1}
                >
                  Suivant
                </button>
              </div>
            )}
            <button className="modal-closes" onClick={() => setIsProductModalOpen(false)}>
            X
          </button>
          </div>
        </div>
        </Modal>
    </div>
  )
}

export default AddCare
