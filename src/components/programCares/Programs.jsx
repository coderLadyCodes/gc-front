import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import Spinner from '../common/Spinner';
import { useNavigate, useParams } from 'react-router-dom'
import './Programs.css'
import AddCare from './AddCare'
import { useAuth } from '../authentication/AuthProvider';


const fetchProgramsByClientId = async ({ queryKey }) => {
  const [_key, clientId] = queryKey

  if (!clientId) {
    throw new Error("Client ID is required to fetch programs.");
  }

  const { data } = await axios.get(`/api/programs/${clientId}`, {
    withCredentials: true,
  });
  return data;
};

const Programs = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const userId = user?.userId
  const queryClient = useQueryClient()
  const {clientId} =useParams()
  const [expandedProgramId, setExpandedProgramId] = useState(null)
  const [editingProgramId, setEditingProgramId] = useState(null)
  const [editingProgramData, setEditingProgramData] = useState(null)

  const { data: programs = [], isLoading, error } = useQuery({
    queryKey: ['programs', clientId],
    queryFn: fetchProgramsByClientId,
    staleTime: 5 * 60 * 1000, 
    enabled: !!clientId,
  })

  const deleteProgram = useMutation({
    mutationFn: async (programId) => {
        await axios.delete(`/api/program/${programId}`, {
            withCredentials: true,
        })
    },
    onSuccess: () => {
        queryClient.invalidateQueries(['programs'])
    },
    onError: (err) => {
      alert(`Error deleting program: ${err.message}`)
    },
  })

  const handleDelete = (programId) => {
    let userChoice = window.confirm('Voulez-vous supprimer ce programme ?')
  if (userChoice) {
    deleteProgram.mutate(programId)
  }}

  const handleEditProgram = (programId) => {
    const programToEdit = programs.find((program) => program.id === programId)
    if (programToEdit) {
      setEditingProgramId(programId)
      setEditingProgramData(programToEdit) 
    } else {
      console.error('Program not found')
    }
  }
  

  const handleCaresUpdated = () => {
    queryClient.invalidateQueries(['programs', clientId])
    setEditingProgramId(null)
  }

  if (isLoading) return <Spinner />

  if (error) return <p>Error: {error.message}</p>

  if (programs.length === 0) {
    return <p>Aucun soins pour ce client.</p>
  }

  return (
    <div className="programs-container">
      <h2>Les Programmes des Soins</h2>
      <table className="programs-table">
        <thead>
          <tr>
            <th>Référence du Programe</th>
            <th>Date de Création</th>
            <th>prix total</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {programs.map((program) => (
            <React.Fragment key={program.id}>
              <tr>
                <td>{program.programReference}</td>
                <td>{new Date(program.createdDate).toLocaleDateString()}</td>
                 <td>{parseFloat(program.totalProgramPrice).toFixed(2)} €</td>
                <td>
                  <button onClick={() => navigate(`/dashboard/client/${clientId}/planning/${program.id}`)}>Planifier</button>
                  <button onClick={() => handleEditProgram(program.id)}>Modifier</button>
                  <button onClick={() => handleDelete(program.id)}>Supprimer</button>
                </td>
              </tr>
              {expandedProgramId === program.id && (  //! I AM NOT USING THIS: FROM HERE
                <tr>
                  <td colSpan="3">
                    <table className="cares-table">
                      <thead>
                        <tr>
                          <th>Produit</th>
                          <th>Type</th>
                          <th>Référence</th>
                          <th>Prix Total</th>
                          <th>Quantité</th>
                          <th>Date de création</th>
                        </tr>
                      </thead>
                      <tbody>
                        {program.cares.map((care, index) => (
                          <tr key={index}>
                            <td>{care.productDTO?.name || 'produit inconnu'}</td>
                            <td>{care.productDTO?.type || 'type inconnu'}</td>
                            <td>{care.productDTO?.refProduct || 'reference inconnu'}</td>
                            <td>{parseFloat(care.carePrice).toFixed(2) || 'Prix inconnu'}</td>
                            <td>{care.quantity || 'quantitée inconnue'}</td>
                            <td>{new Date(care.created).toLocaleDateString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </td>
                </tr>
              )}                             
            </React.Fragment>
          ))}
        </tbody>
      </table>
      {editingProgramId && (        
  <AddCare
    programId={editingProgramId}
    clientId={clientId}
    program={editingProgramData} 
    onClose={() => setEditingProgramId(null)}
    onCaresUpdated={handleCaresUpdated}
   />
 )}

    </div>
  )
}

export default Programs
