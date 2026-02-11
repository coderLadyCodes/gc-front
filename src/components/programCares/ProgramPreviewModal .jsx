import React from 'react'
import Modal from '../common/Modal'
import { useAuth } from '../authentication/AuthProvider'
import { useClient } from '../client/ClientProvider'
import './ProgramPreviewModal.css'
import logo from '../../assets/images/logo.png'

const ProgramPreviewModal  = ({onClose, program, careSelections}) => {
    const {user} = useAuth()
    const {getClientById} = useClient()
    const { data: clientData, isLoading: isClientLoading } = getClientById(program?.clientId)

    const dayMapping = {
        MONDAY: 'L',
        TUESDAY: 'Ma',
        WEDNESDAY: 'Me',
        THURSDAY: 'J',
        FRIDAY: 'V',
        SATURDAY: 'S',
        SUNDAY: 'D',
      }

       const formatDate = (date) =>
        date.toLocaleDateString('fr-FR', { year: 'numeric', month: '2-digit', day: '2-digit' })

    const calculateWeekDates = (start, weekIndex) => {
        const startDate = new Date(start)
        startDate.setDate(startDate.getDate() + weekIndex * 7)
        const endDate = new Date(startDate)
        endDate.setDate(startDate.getDate() + 6)
        return `${formatDate(startDate)} au ${formatDate(endDate)}`
    }

    const groupedCaresByWeek = {}
    program.cares.forEach((care) => {
    const careDetail = careSelections[care.id]
    if (!careDetail) return

    careDetail.days.forEach((week, weekIndex) => {
        const hasSelectedDaysOrTimeslots = Object.values(week).some(
        (daySlots) => daySlots && daySlots.length > 0
        )

        if (hasSelectedDaysOrTimeslots) {
        if (!groupedCaresByWeek[weekIndex]) {
            groupedCaresByWeek[weekIndex] = []
        }
        groupedCaresByWeek[weekIndex].push({ care, week })
        }
    })
    })
 
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
    // If the image fails to load, you could add an error handler
        img.onerror = (error) => {
            console.error("Image failed to load:", error);
            callback(null); // Provide null if image loading fails
        };
      }
      
      const handlePrint = () => {
        getBase64Image(logo, (base64Logo) => {
            if (!base64Logo) {
                       console.error("Logo image not available for printing");
                       return; // Don't proceed if logo is not available
                   }
            const modalContent = document.querySelector('.programpreviewmodal-container') // Fetch content
            
            // Clone the modal content to avoid modifying the original DOM
            const clonedContent = modalContent.cloneNode(true);
    
            // Remove the header from the cloned content
            const header = clonedContent.querySelector('.programpreviewmodal-header');
            if (header) {
                clonedContent.removeChild(header);
            }
    
            const iframe = document.createElement('iframe');
            iframe.style.position = 'absolute';
            iframe.style.width = '0px';
            iframe.style.height = '0px';
            iframe.style.border = 'none';
            document.body.appendChild(iframe);
    
            const iframeDoc = iframe.contentWindow.document;
            iframeDoc.open();
            iframeDoc.write(`
                <html>
                  <head>
                    <title>Programme Preview</title>
                    <style>
                      @media print {
                        body {
                          -webkit-print-color-adjust: exact;
                          print-color-adjust: exact;
                          font-size: 12px;
                        }

                        .programpreviewmodal-container {
                          width: 100%;
                        }
                        .programpreviewmodal-header {
                          display: flex;
                          justify-content: space-between;
                          align-items: center;
                          margin-bottom: 10px;
                          padding: 2px;
                        }
                        .programpreviewmodal-user-details img {
                          width: 100px;
                          height: 60px;
                        }
                        .planning-table {
                          width: 100%;
                          border-collapse: collapse;
                        }
                        .planning-table th,
                        .planning-table td {
                          border: 1px solid #000;
                          padding: 5px;
                          text-align: center;
                        }
                        .programpreviewmodal-print-btn,
                        .modal-closes {
                          display: none;
                        }
                        @page {
                          size: A4 landscape;
                          margin: 10mm;
                        }
                      }
                    </style>
                  </head>
                  <body>
                    <!-- Single Header -->
                    <div class="programpreviewmodal-header">
                        <div class="programpreviewmodal-user-details">
                            <img src="${base64Logo}" alt="Logo" class="user-logo" />
                            <p><strong>LA THERAPIE DU CHEVEU</strong></p>
                            <p>300 avenue de Saint André de Codols</p>
                            <p>30900 NIMES</p>
                            <p>tel: ${user?.phone || 'N/A'}</p>
                        </div>
                        <div class="programpreviewmodal-title">Planning</div>
                        <div class="programpreviewmodal-client-details">
                            <p>Le: ${formatDate(new Date())}</p>
                            <p>Pour: ${clientData?.firstName} ${clientData?.lastName}</p>
                        </div>
                    </div>
                    
                    <!-- Rest of the content -->
                    ${clonedContent.innerHTML}
                  </body>
                </html>
            `);
            iframeDoc.close();
    
            iframe.contentWindow.focus();
            //iframe.contentWindow.print();
              setTimeout(() => {
                iframe.contentWindow.print();
                iframeDoc.print();
                iframe.contentWindow.close();
                iframeDoc.close();
              }, 500);
        });
    };


    if (!program || !Array.isArray(program.cares)) {
        return <div>Aucun programme disponnible.</div>
      }

      if (isClientLoading) {
        return <div>Loading client details...</div>
      }
  // 🌈 color in localStorage with category ID
//   const getCategoryColor = (categoryId) => {
//     return localStorage.getItem(`category-color-${categoryId}`) || "#999999";
//   }

const getProductColor = (productId) => {
  return localStorage.getItem(`product-color-${productId}`) || "#000000";
};


  return (
    <Modal isOpen={!!program} onClose={onClose}>
            <div className="programpreviewmodal-container">
                {/* Header */}
                <div className="programpreviewmodal-header">
                    <div className="programpreviewmodal-user-details">
                        <img src={logo} alt="User Logo" className="user-logo" />
                        <p><strong>LA THERAPIE DU CHEVEU</strong></p>
                        <p>300 avenue de Saint André de Codols</p>
                        <p>30900 NIMES</p>
                        <p>tel: {user?.phone || 'N/A'}</p>
                    </div>
                    <div className="programpreviewmodal-title">Planning</div>
                    <div className="programpreviewmodal-client-details">
                        <p>Le: {formatDate(new Date())}</p>
                        <p>Pour: {clientData?.firstName} {clientData?.lastName}</p>
                    </div>
                </div>

                {Object.entries(groupedCaresByWeek).map(([weekIndex, cares]) => {
                    const weekDates = calculateWeekDates(new Date(), weekIndex);

                    return (
                        <div key={weekIndex} className="programpreviewmodal-week">
                            <h4 className="week-dates">Du {weekDates}</h4>
                            <table className="planning-table">
                                <thead>
                                    <tr>
                                        <th></th>
                                        {Object.keys(dayMapping).map((day) => (
                                            <th key={day}>{dayMapping[day]}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {['Matin', 'Soir'].map((timeSlot) => (
                                        <tr key={timeSlot}>
                                            <td>{timeSlot}</td>
                                            {Object.keys(dayMapping).map((day) => (
                                                <td key={day}>
                                                    {cares.map(({ care, week }) =>
                                                        week[day]?.includes(timeSlot) ? (
                                                            <div key={care.id}>
                                                              {/*  {care.productDTO?.name || 'Unknown Care'}*/}
                                                              <span
                                                                style={{
                                                                  color: getProductColor(care.productDTO?.id),
                                                                  fontWeight: 500
                                                                }}
                                                              >
                                                                {care.productDTO?.name || 'Unknown Care'}
                                                              </span>

                                                                {care.productDTO?.categoryDTO?.id && (
                                                                          <span
                                                                            style={{
                                                                              display: 'inline-block',
                                                                              width: '12px',
                                                                              height: '12px',
                                                                              borderRadius: '50%',
                                                                              //backgroundColor: getCategoryColor(care.productDTO.categoryDTO.id),
                                                                              marginLeft: '5px',
                                                                              verticalAlign: 'middle',
                                                                            }}
                                                                          ></span>
                                                                        )}
                                                            </div>
                                                        ) : null
                                                    )}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    );
                })}

                <button className="programpreviewmodal-print-btn" onClick={handlePrint}>
                    Imprimer
                </button>
                <button className="modal-closes" onClick={onClose}>
            X
          </button>
            </div>
        </Modal>
  )
}

export default ProgramPreviewModal 