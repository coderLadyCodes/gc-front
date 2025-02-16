import React, { useState, useRef } from 'react'
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
  const tableRef = useRef();
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
      //carePrice: product.productPrice * 1,
      carePrice: parseFloat(product.productPrice),
      programId: program?.id || null,
    }
    setCareFields((prev) => [...prev, newCare])
    setIsProductModalOpen(false)
    setSearch('')
  }

  const handleRemoveCare = (index) => {
       if (careFields.length <= 1) {
          alert("Veuillez le supprimer dans les programmes des soins.");
          return; // Prevent deletion if only 1 care is left
        }

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
        const updatedCare = { ...care, quantity:  Number(care.quantity), carePrice: care.carePrice, programId: program?.id || null}
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

  //PRINT Program
const handlePrint = () => {
  const printContent = tableRef.current;

  if (!printContent) {
    alert("Le contenu de l'impression est introuvable.");
    return;
  }

  // Clone the table to manipulate it for print
  const clonedTable = printContent.cloneNode(true);

  // Find the "Actions" column index
  const headers = clonedTable.querySelectorAll("th");
  const actionIndex = Array.from(headers).findIndex(header => header.textContent.trim().toLowerCase() === "actions");

  if (actionIndex !== -1) {
    // Remove "Actions" header
    headers[actionIndex].remove();

    // Remove "Actions" column data from each row
    clonedTable.querySelectorAll("tr").forEach(row => {
      const cells = row.querySelectorAll("td");
      if (cells.length > actionIndex) {
        cells[actionIndex].remove(); // Remove the corresponding data cell in each row
      }
    });
  }
   // Modify the Total Row style to remove the border
    const totalRow = clonedTable.querySelector(".total-row");
    if (totalRow) {
      totalRow.querySelectorAll("td").forEach(td => {
        td.style.border = "none"; // Remove the border around the total row
        td.style.backgroundColor = "transparent"; // Optional: make the background transparent
      });
    }

  // Modify the "Quantité" column input width directly with JS if needed
  const tds = clonedTable.querySelectorAll('td:nth-child(6), th:nth-child(6)');

  tds.forEach(td => {
    // Find the input inside the 'Quantité' column and adjust its width
    const input = td.querySelector('input');
    if (input) {
      input.style.width = '80%';  // Adjust this value as needed to fit inside the cell
    }
    td.style.width = '5%';  // Ensure the 'Quantité' column is also resized
  });

  // Open print window
  const printWindow = window.open('', '_blank');

  if (!printWindow) {
    alert("Impossible d'ouvrir la fenêtre d'impression.");
    return;
  }

  printWindow.document.open();
  printWindow.document.write(`
    <html>
      <head>
        <title>Impression Programme</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            font-size: 14px;
            line-height: 1.5;
            padding: 20px;
            text-align: center;
          }

          .print-header {
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 10px;
          }

          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
          }

          th, td {
            border: 1px solid black;
            padding: 6px;
            text-align: center;
          }

          th {
            background-color: #f2f2f2;
          }

          tr:nth-child(even) {
            background-color: #f9f9f9;
          }

          /* Hide UI elements like buttons for print */
          .addcare-buttons, .modal-closes {
            display: none;
          }

          /* Adjust "Quantité" column width for print */
          td:nth-child(6), th:nth-child(6) {
            width: 8%;
            font-size: 12px; /* Smaller font for "Quantité" column */
          }

          @media print {
            body {
              font-size: 12px;
              padding: 10mm;
            }

            table {
              font-size: 12px;
            }

            td, th {
              padding: 4px; /* Adjust padding for print */
            }
          }
        </style>
      </head>
      <body>
        <div class="print-header">
          ${program?.id ? `Programme: ${program.programReference}` : "Programme de Soins"}
        </div>
        ${clonedTable.outerHTML}
      </body>
    </html>
  `);
  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => {
    printWindow.print();
    printWindow.close();
  }, 500);
};


  return (
    <div className="add-care-container">
      <h2>{program?.id ? `Imprimer / Modifier le Programme ${program.programReference}` : "Ajouter des soins"}</h2>
      <table className="care-table" id="care-table" ref={tableRef}>

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
            <th>Prix du soin</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {careFields.map((care, index) => (
            <tr key={index}>
              <td>{care.productDTO?.name || 'Produit inconnu'}</td>
              <td>{care.productDTO?.type || 'Type inconnu'}</td>
              <td>{care.productDTO?.refProduct || 'Référence inconnue'}</td>
              <td>{care.productDTO?.categoryDTO?.name || 'Sans Catégorie'} {care.productDTO?.categoryDTO?.tva ? `(${care.productDTO.categoryDTO.tva})` : ''}</td>
              <td>{care.productDTO?.productPrice.toFixed(2)} €</td>
              <td>
                <input
                  type="number"
                  value={care.quantity}
                  onChange={(e) => {
                    const newQuantity = e.target.value;
                    setCareFields((prev) =>
                      prev.map((item, i) => i === index ? { ...item, quantity: newQuantity,
                           carePrice: item.productDTO.productPrice * newQuantity}: item))

                             // ⬇️ Update the total price when quantity changes
                                  const newTotal = careFields.reduce(
                                    (total, care, i) =>
                                      i === index
                                        ? total + care.productDTO.productPrice * newQuantity
                                        : total + care.carePrice,
                                    0
                                  );

                                  program.totalProgramPrice = newTotal; // Update program price directly

                           }} min="1"/>
              </td>
{/*                <td>{care.carePrice.toFixed(2)} €</td> */}
                 <td>{parseFloat(care.carePrice).toFixed(2)} €</td>

              <td>
                <button className='addcare-supp' onClick={() => handleRemoveCare(index)}>Supprimer</button>
              </td>
            </tr>
          ))}

       {/* Total Row */}
              <tr className="total-row">
                <td colSpan="6" style={{ textAlign: "right", fontWeight: "bold" }}>Prix Total du Programme:</td>
                <td style={{ fontWeight: "bold" }}>{program?.totalProgramPrice?.toFixed(2) || '0.00'} €</td>
                <td></td>
              </tr>
        </tbody>
        </>)}

      </table>
      <div className='addcare-buttons'>
      <button onClick={() => setIsProductModalOpen(true)}>Ajouter un produit</button>
      <button onClick={handleSaveProgram} disabled={careFields.length === 0}>Enregistrer les soins</button>
         {program?.id && (
                        <button onClick={handlePrint} className="print-button">Imprimer</button>
                      )}
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
                    <h4>{categoryName}
                        {/* Display TVA next to the category name if it's available */}
                              {products[0]?.categoryDTO?.tva && (
                                <span> (TVA: {products[0].categoryDTO.tva}%)</span>
                              )}
                          </h4>
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
