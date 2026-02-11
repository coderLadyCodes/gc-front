import React, { useState, useRef } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import Spinner from '../common/Spinner'
import './AddCare.css'
import { useAuth } from '../authentication/AuthProvider'
import {useProductsContext} from '../product/ProductProvider'
import Modal from '../common/Modal'
import logo from '../../assets/images/logo.png'


const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value)
  React.useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(handler)
  }, [value, delay])
  return debouncedValue
}

const AddCare = ({program, onClose, onCaresUpdated }) => {
  const location = useLocation()
  const { clientName } = location.state || {}
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
      durationWeeks: care.durationWeeks || 0,  // Default value for duration
            timeSlot: care.timeSlot || [],  // Default value for timeSlot
            daysOfWeek: care.daysOfWeek || [],
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
          care === newCare ? { ...care, id: data.id,
               durationWeeks: care.durationWeeks, // Ensure duration is retained
               daysOfWeek: care.daysOfWeek, // Ensure days is retained
               timeSlot: care.timeSlot,
              } : care
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
       durationWeeks: 0, // Default value for duration
       timeSlot: [], // Default value for timeSlot
       daysOfWeek: [], // Default value for days

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
            durationWeeks: care.durationWeeks,
            timeSlot: care.timeSlot,
            created: care.created,
          })
          savedCares.push(response.data)
        } else {
          // If care already has an id, you can update it
        //const updatedCare = { ...care, quantity:  Number(care.quantity), carePrice: care.carePrice, programId: program?.id || null}
         const updatedCare = {
                          ...care,
                          quantity: Number(care.quantity),
                          carePrice: care.carePrice,
                          programId: program?.id || null,
                          durationWeeks: care.durationWeeks,
                          timeSlot: care.timeSlot,
                          daysOfWeek: care.daysOfWeek
                        }

        const response = await axios.put(`/api/care/${care.id}`, updatedCare, {
          withCredentials: true,
        })
          savedCares.push(response.data)
        }
      }

      const programData = {
          id: program?.id || null, // <-- maybe
        cares: savedCares.map((care) => ({
             id: care?.id || null,
          clientId: care.clientId,
          userId: care.userId,
          productDTO: care.productDTO,
          carePrice: care.carePrice,
          quantity: care.quantity,
          programId: care.programId,
          durationWeeks: care.durationWeeks,
          timeSlot: care.timeSlot,
          daysOfWeek: care.daysOfWeek,
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



  //logo
const getBase64Image = (imgUrl, callback) => {
    const img = new Image()
    img.crossOrigin = 'Anonymous'
    img.src = imgUrl
    img.onload = () => {
        const canvas = document.createElement('canvas')
        canvas.width = img.width
        canvas.height = img.height
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0)
        const dataURL = canvas.toDataURL('image/png')
        callback(dataURL)
    }
    img.onerror = (error) => {
        console.error("Image failed to load:", error);
        callback(null); // Provide null if image loading fails
    };
}
//   //PRINT Program
// const handlePrint = () => {
//     getBase64Image(logo, (base64Logo) => { // `logoUrl` should be the path to the logo image
//             if (!base64Logo) {
//                 console.error("Logo image not available for printing");
//                 return;
//             }
//   const printContent = tableRef.current;
//
//   if (!printContent) {
//     alert("Le contenu de l'impression est introuvable.");
//     return;
//   }
//
//   // Clone the table to manipulate it for print
//   const clonedTable = printContent.cloneNode(true);
//
// // ⭐ Add or rebuild category color bubble for print
// clonedTable.querySelectorAll("td[data-category-id]").forEach(td => {
//   const categoryId = td.getAttribute("data-category-id");
//   if (!categoryId) return;
//
//   const color = getCategoryColor(categoryId);
//
//   const bubble = document.createElement("span");
//   bubble.style.cssText = `
//     display:inline-block;
//     width:12px;
//     height:12px;
//     border-radius:50%;
//     background:${color};
//     margin-left:8px;
//     vertical-align:middle;
//   `;
//
//   td.appendChild(bubble);
// });
//
//
//
//   // Find the "Actions" column index
//   const headers = clonedTable.querySelectorAll("th");
//   const actionIndex = Array.from(headers).findIndex(header => header.textContent.trim().toLowerCase() === "actions");
//
//   if (actionIndex !== -1) {
//     // Remove "Actions" header
//     headers[actionIndex].remove();
//
//     // Remove "Actions" column data from each row
//     clonedTable.querySelectorAll("tr").forEach(row => {
//       const cells = row.querySelectorAll("td");
//       if (cells.length > actionIndex) {
//         cells[actionIndex].remove(); // Remove the corresponding data cell in each row
//       }
//     });
//   }
//    // Modify the Total Row style to remove the border
//     const totalRow = clonedTable.querySelector(".total-row");
//     if (totalRow) {
//       totalRow.querySelectorAll("td").forEach(td => {
//         td.style.border = "none"; // Remove the border around the total row
//         td.style.backgroundColor = "transparent"; // Optional: make the background transparent
//       });
//     }
//
//   // Modify the "Quantité" column input width directly with JS if needed
//   const tds = clonedTable.querySelectorAll('td:nth-child(6), th:nth-child(6)');
//
//   tds.forEach(td => {
//     // Find the input inside the 'Quantité' column and adjust its width
//     const input = td.querySelector('input');
//     if (input) {
//       input.style.width = '80%';  // Adjust this value as needed to fit inside the cell
//     }
//     td.style.width = '5%';  // Ensure the 'Quantité' column is also resized
//   });
//     // Get the local date formatted in a readable format
//          const currentDate = new Date();
//          const formattedDate = currentDate.toLocaleDateString('fr-FR', {
//              day: '2-digit',
//              month: '2-digit',
//              year: 'numeric'
//          });
//
//
//   // Open print window
//   const printWindow = window.open('', '_blank');
//
//   if (!printWindow) {
//     alert("Impossible d'ouvrir la fenêtre d'impression.");
//     return;
//   }
//
//   printWindow.document.open();
//   printWindow.document.write(`
//        <html>
//                     <head>
//                         <title>Impression Programme</title>
//                         <style>
//                             body {
//                                 font-family: Arial, sans-serif;
//                                 font-size: 14px;
//                                 line-height: 1.5;
//                                 padding: 20px;
//                                 text-align: center;
//                             }
//
//
//                             .print-header {
//                                 display: flex;
//                                 justify-content: space-between;
//                                 align-items: center;
//                                 margin-bottom: 20px;
//                             }
//
//                             .print-logo {
//                                 max-width: 150px;
//                                 height: auto;
//                             }
//
//                             .header-info {
//                                 text-align: left;
//                                 margin-top: 10px;
//                             }
//
//                             .client-name {
//                                 text-align: right;
//                             }
//
//                             .program-details {
//                                 text-align: left;
//                                 margin-top: 10px;
//                             }
//
//                             table {
//                                 width: 100%;
//                                 border-collapse: collapse;
//                                 margin-top: 20px;
//                             }
//
//                             th, td {
//                                 border: 1px solid black;
//                                 padding: 6px;
//                                 text-align: center;
//                             }
//
//                             th {
//                                 background-color: #f2f2f2;
//                             }
//
//                             tr:nth-child(even) {
//                                 background-color: #f9f9f9;
//                             }
//
//                             /* Hide UI elements like buttons for print */
//                             .addcare-buttons, .modal-closes {
//                                 display: none;
//                             }
//
//                             /* Adjust "Quantité" column width for print */
//                             td:nth-child(6), th:nth-child(6) {
//                                 width: 8%;
//                                 font-size: 12px; /* Smaller font for "Quantité" column */
//                             }
//
//                             @media print {
//                                 body {
//                                     font-size: 12px;
//                                     padding: 10mm;
//                                 }
//
//                                 table {
//                                     font-size: 12px;
//                                 }
//
//                                 td, th {
//                                     padding: 4px; /* Adjust padding for print */
//                                 }
//                             }
//                         </style>
//                     </head>
//                     <body>
//                         <div class="print-header">
//                             <img src="${base64Logo}" class="print-logo" alt="Logo" />
//                             <div class="client-name">
//                             <p>Le: ${formattedDate}</p>
//                             <p>pour: ${clientName || "Client Name"}</p>
//                             </div>
//                         </div>
//
//                         <div class="header-info">
//                             <p><strong>LA THERAPIE DU CHEVEU</strong></p>
//                             <p>300 avenue de Saint André de Codols</p>
//                             <p>30900 NIMES</p>
//                             <p>tel: ${user?.phone || 'N/A'}</p>
//
//                         </div>
//
//                         <div class="program-details">
//                             <p><strong>${program?.id ? `Programme: ${program.programReference}` : "Programme de Soins"}</strong></p>
//                         </div>
//
//                         <div class="print-table">
//                             ${clonedTable.outerHTML}
//                         </div>
//                     </body>
//                 </html>
//   `);
//   printWindow.document.close();
//   printWindow.focus();
//   setTimeout(() => {
//     printWindow.print();
//     printWindow.close();
//   }, 500);
//   })
// };

// PRINT Program — replace your current handlePrint with this
const handlePrint = () => {
  getBase64Image(logo, (base64Logo) => {
    if (!base64Logo) {
      console.error("Logo image not available for printing");
      return;
    }

    const printContent = tableRef.current;
    if (!printContent) {
      alert("Le contenu de l'impression est introuvable.");
      return;
    }

    // Clone the table to manipulate it for print
    const clonedTable = printContent.cloneNode(true);

    // Helper to create an inline SVG circle (prints reliably)
    const createColorDotSVG = (color, size = 12) => {
      const svgNS = "http://www.w3.org/2000/svg";
      const svg = document.createElementNS(svgNS, "svg");
      svg.setAttribute("width", String(size));
      svg.setAttribute("height", String(size));
      svg.setAttribute("viewBox", `0 0 ${size} ${size}`);
      svg.setAttribute("style", "display:inline-block; vertical-align:middle; margin-left:8px;");
      const circle = document.createElementNS(svgNS, "circle");
      const r = Math.floor(size / 2);
      circle.setAttribute("cx", String(r));
      circle.setAttribute("cy", String(r));
      circle.setAttribute("r", String(r));
      circle.setAttribute("fill", color);
      svg.appendChild(circle);
      return svg;
    };

    // Re-apply color dots for any element that has data-category-id (td or span)
    // Try both td[data-category-id] and spans inside cells (robust)
    const selector = '[data-category-id]';
    // ❌ Remove existing UI bubbles to avoid duplicates
    clonedTable.querySelectorAll(".ui-category-bubble").forEach(el => el.remove());

    const targets = clonedTable.querySelectorAll(selector);
    targets.forEach(target => {
      const categoryId = target.getAttribute('data-category-id');
      if (!categoryId) return;
      // Use same helper getCategoryColor function (from your component)
      //const color = getCategoryColor(categoryId) || '#999999';
      //const svg = createColorDotSVG(color, 12);
      // append the SVG node into the cloned DOM next to the text
      target.appendChild(svg);
    });

    // Remove "Actions" column (same logic as before)
    const headers = clonedTable.querySelectorAll("th");
    const actionIndex = Array.from(headers).findIndex(h => h.textContent.trim().toLowerCase() === "actions");
    if (actionIndex !== -1) {
      headers[actionIndex].remove();
      clonedTable.querySelectorAll("tr").forEach(row => {
        const cells = row.querySelectorAll("td");
        if (cells.length > actionIndex) {
          cells[actionIndex].remove();
        }
      });
    }

    // Tweak total-row style (optional)
    const totalRow = clonedTable.querySelector(".total-row");
    if (totalRow) {
      totalRow.querySelectorAll("td").forEach(td => {
        td.style.border = "none";
        td.style.backgroundColor = "transparent";
      });
    }

    // Adjust quantity column inputs in cloned table
    const tds = clonedTable.querySelectorAll('td:nth-child(6), th:nth-child(6)');
    tds.forEach(td => {
      const input = td.querySelector('input');
      if (input) input.style.width = '80%';
      td.style.width = '5%';
    });

    // Format date
    const currentDate = new Date();
    const formattedDate = currentDate.toLocaleDateString('fr-FR', {
      day: '2-digit', month: '2-digit', year: 'numeric'
    });

    // Open print window and write HTML (including -webkit-print-color-adjust)
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert("Impossible d'ouvrir la fenêtre d'impression.");
      return;
    }

    const printCss = `
      <style>
        body { font-family: Arial, sans-serif; font-size: 14px; line-height: 1.5; padding: 20px; text-align: center; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        .print-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; }
        .print-logo { max-width:150px; height:auto; }
        table { width:100%; border-collapse:collapse; margin-top:20px; }
        th, td { border:1px solid black; padding:6px; text-align:center; }
        th { background-color:#f2f2f2; }
        tr:nth-child(even) { background-color:#f9f9f9; }
        /* hide UI elements */
        .addcare-buttons, .modal-closes, .print-button { display:none; }
        td svg { /* ensure svg circles are visible and not scaled weird */ vertical-align: middle; }
        @media print {
          @page { size: A4 portrait; margin: 10mm; }
          body { font-size: 12px; padding: 10mm; }
        }
      </style>
    `;

    printWindow.document.open();
    printWindow.document.write(`
      <html>
        <head>
          <title>Impression Programme</title>
          ${printCss}
        </head>
        <body>
          <div class="print-header">
            <img src="${base64Logo}" class="print-logo" alt="Logo" />
            <div class="client-name">
              <p>Le: ${formattedDate}</p>
              <p>pour: ${clientName || 'Client Name'}</p>
            </div>
          </div>

          <div class="header-info">
            <p><strong>LA THERAPIE DU CHEVEU</strong></p>
            <p>300 avenue de Saint André de Codols</p>
            <p>30900 NIMES</p>
            <p>tel: ${user?.phone || 'N/A'}</p>
          </div>

          <div class="program-details">
            <p><strong>${program?.id ? `Programme: ${program.programReference}` : 'Programme de Soins'}</strong></p>
          </div>

          <div class="print-table">
            ${clonedTable.outerHTML}
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();

    // Allow some time for resources to render, then print
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  });
};


// 🌈 color in localStorage with category ID
// const getCategoryColor = (categoryId) => {
//   return localStorage.getItem(`category-color-${categoryId}`) || "#999999";
// }


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
{/*               <td>{care.productDTO?.name || 'Produit inconnu'} */}
{/*                   {care.productDTO?.categoryDTO?.id && ( */}
{/*                       <span */}
{/*                       //data-category-id={care.productDTO.categoryDTO.id} */}
{/*                         style={{ */}
{/*                           display: 'inline-block', */}
{/*                           width: '12px', */}
{/*                           height: '12px', */}
{/*                           borderRadius: '50%', */}
{/*                           backgroundColor: getCategoryColor(care.productDTO.categoryDTO.id), */}
{/*                           marginLeft: '8px', */}
{/*                           verticalAlign: 'middle', */}
{/*                         }} */}
{/*                       ></span> */}
{/*                     )}</td> */}
{/*                 <td data-category-id={care.productDTO?.categoryDTO?.id || ""}> */}
{/*                   {care.productDTO?.name || 'Produit inconnu'} */}

{/*                   {care.productDTO?.categoryDTO?.id && ( */}
{/*                     <span className="ui-category-bubble" */}
{/* //                       style={{ */}
{/* //                         display: 'inline-block', */}
{/* //                         width: '12px', */}
{/* //                         height: '12px', */}
{/* //                         borderRadius: '50%', */}
{/* //                         backgroundColor: getCategoryColor(care.productDTO.categoryDTO.id), */}
{/* //                         marginLeft: '8px', */}
{/* //                         verticalAlign: 'middle', */}
{/* //                       }} */}
{/*                     ></span> */}
{/*                   )} */}
{/*                 </td> */}
<td>
  <span
    style={{
      color: localStorage.getItem(
        `product-color-${care.productDTO?.id}`
      ) || "#000"
    }}
  >
    {care.productDTO?.name || 'Produit inconnu'}
  </span>
</td>


              <td>{care.productDTO?.type || 'Type inconnu'}</td>
              <td>{care.productDTO?.refProduct || 'Référence inconnue'}</td>
              <td>{care.productDTO?.categoryDTO?.name || 'Sans Catégorie'} {care.productDTO?.categoryDTO?.tva ? `(${care.productDTO.categoryDTO.tva})` : ''}
                    {/* 🌈 Category color tag */}
                    {care.productDTO?.categoryDTO?.id && (
                      <span
//                         style={{
//                           display: 'inline-block',
//                           width: '12px',
//                           height: '12px',
//                           borderRadius: '50%',
//                           backgroundColor: getCategoryColor(care.productDTO.categoryDTO.id),
//                           marginLeft: '8px',
//                           verticalAlign: 'middle'
//                         }}
                      ></span>
                    )}</td>
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
                              {products[0]?.categoryDTO?.tva && ` (TVA: ${products[0].categoryDTO.tva})`}
                                {/*                                 <span> (TVA: {products[0].categoryDTO.tva})</span> */}
                                {/*                               )} */}
                                {/* 🌈 Category color tag */}
                                  {products[0]?.categoryDTO?.id && (
                                    <span
//                                       style={{
//                                         display: 'inline-block',
//                                         width: '12px',
//                                         height: '12px',
//                                         borderRadius: '50%',
//                                         backgroundColor: getCategoryColor(products[0].categoryDTO.id),
//                                         marginLeft: '8px',
//                                         verticalAlign: 'middle'
//                                       }}
                                    ></span>
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
{/*                             <td>{product.name} */}
{/*                                  {product.categoryDTO?.id && ( */}
{/*                                     <span */}
{/*                                       style={{ */}
{/*                                         display: 'inline-block', */}
{/*                                         width: '10px', */}
{/*                                         height: '10px', */}
{/*                                         borderRadius: '50%', */}
{/*                                         backgroundColor: getCategoryColor(product.categoryDTO.id), */}
{/*                                         marginLeft: '5px', */}
{/*                                         verticalAlign: 'middle' */}
{/*                                       }} */}
{/*                                     ></span> */}
{/*                                   )}</td> */}
<td>
  <span
    style={{
      color: localStorage.getItem(`product-color-${product.id}`) || "#000"
    }}
  >
    {product.name}
  </span>
</td>

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