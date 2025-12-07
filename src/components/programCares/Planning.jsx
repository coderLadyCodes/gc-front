import './Planning.css'
import React, { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { Link, useParams } from 'react-router-dom'
import Spinner from '../common/Spinner'
import { useAuth } from '../authentication/AuthProvider'
import ProgramPreviewModal from './ProgramPreviewModal '


const fetchProgramDetails = async ({ queryKey }) => {
  const [_key, programId] = queryKey
  const response = await axios.get(`/api/program/${programId}`, {
    withCredentials: true,
  })
  return response.data
}

// Save updated program with cares
const updateProgram = async ({ programId, cares }) => {
  const response = await axios.put(
    `/api/program/update/${programId}`,
    { cares },
    { withCredentials: true, headers: { 'Content-Type': 'application/json' } }
  )

  return response.data
}

const Planning = () => {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const { programId } = useParams()
  const [careSelections, setCareSelections] = useState({})
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)

  // Fetch program details
  const { data: program, isLoading, isError, error } = useQuery({
    queryKey: ['program', programId],
    queryFn: fetchProgramDetails,
    enabled: !!programId,
    onSuccess: (data) => {

      const savedSelections = {}

      // Process the saved care data (if exists)
      data.cares.forEach((care) => {
        const weeksData = []

        // Map the care's daysOfWeek and timeSlot to the weeksData structure
        if (care.daysOfWeek && care.timeSlot) {
          care.daysOfWeek.forEach((day, index) => {
            const weekIndex = Math.floor(index / 7)
            const slot = care.timeSlot[index]

            if (!weeksData[weekIndex]) weeksData[weekIndex] = {}
            if (!weeksData[weekIndex][day]) weeksData[weekIndex][day] = []
            weeksData[weekIndex][day].push(slot)
          })
        }

        savedSelections[care.id] = {
          weeks: care.durationWeeks || weeksData.length, // Set durationWeeks if available
          days: weeksData, // Set the days data from the fetched data
        }
      })
      setCareSelections(savedSelections) // Set the care selections state with the fetched data
       //  Save immediately to localStorage
       localStorage.setItem('careSelections', JSON.stringify(savedSelections))
    },
  })
  const handlePreview = () => {
    setIsPreviewOpen(true)
  }

  // Store care selections in localStorage when they change
  useEffect(() => {
    if (Object.keys(careSelections).length > 0) {
      localStorage.setItem('careSelections', JSON.stringify(careSelections))
    }
  }, [careSelections])

  // Load care selections from localStorage when component mounts
  useEffect(() => {
    const savedCareSelections = localStorage.getItem('careSelections')
    if (savedCareSelections) {
      //setCareSelections(JSON.parse(savedCareSelections))
      const parsedSelections = JSON.parse(savedCareSelections);
      setCareSelections((prev) => ({ ...prev, ...parsedSelections }));
    }
  }, [])

  // Save care selections to the backend
  const mutation = useMutation({
    mutationFn: updateProgram,
    onSuccess: (updatedData) => {
      alert('Planning sauvegardé avec succés !')
      queryClient.invalidateQueries(['program', programId])
      setTimeout(() => {
            const cachedData = queryClient.getQueryData(['program', programId]);
          }, 1000); // Wait for re-fetch
    },
    onError: (err) => {
      console.error('Failed to save planning:', err)
      alert('Failed to save planning.')
    },
  })

  // Handle adding a week
  const handleAddWeek = (careId) => {
    setCareSelections((prev) => {
      const currentCare = prev[careId] || { weeks: 0, days: [] }
      const newDays = [...currentCare.days, {}] // Add a new empty week
  
      return {
        ...prev,
        [careId]: { ...currentCare, weeks: newDays.length, days: newDays },
      }
    })
  }

  // Handle removing a week
  const handleRemoveWeek = (careId) => {
    setCareSelections((prev) => {
      const currentCare = prev[careId] || { weeks: 0, days: [] }
  
      // Only remove if there's at least one week and the last week is blank
      if (currentCare.weeks > 0) {
        const lastWeek = currentCare.days[currentCare.days.length - 1]
        const isLastWeekBlank = lastWeek && !Object.values(lastWeek).some((slots) => slots.length > 0)
  
        if (isLastWeekBlank) {
          const newDays = currentCare.days.slice(0, -1) // Remove the last week
          return {
            ...prev,
            [careId]: { ...currentCare, weeks: newDays.length, days: newDays },
          }
        }
      }
  
      return prev // If no blank weeks to remove, keep the state unchanged
    })
  }

  // Handle checkbox changes for day and time slot
  const handleDayTimeSlotChange = (careId, weekIndex, day, timeSlot, isChecked) => {
    setCareSelections((prev) => {
      const updatedCare = { ...prev }
      const currentCare = updatedCare[careId] || { weeks: 0, days: [] }
      const currentWeeks = currentCare.days || []
      const currentWeek = currentWeeks[weekIndex] || {}

      const currentSlots = currentWeek[day] || []

      // Update the list of time slots for the given day and week
      const updatedSlots = isChecked
        ? [...new Set([...currentSlots, timeSlot])] // Add new time slot if checked
        : currentSlots.filter((slot) => slot !== timeSlot) // Remove time slot if unchecked

      const updatedWeek = { ...currentWeek, [day]: updatedSlots }
      currentWeeks[weekIndex] = updatedWeek

      updatedCare[careId] = { ...currentCare, days: currentWeeks }

      return updatedCare
    })
  }

  // Handle saving the plan
  const handleSave = () => {
    if (!programId) return alert('Program ID is missing.')

    const cares = program.cares.map((care) => {
      const { days = [] } = careSelections[care.id] || {}

      const daysOfWeek = []
      const timeSlot = []

      days.forEach((week) => {
        Object.entries(week).forEach(([day, slots]) => {
          slots.forEach((slot) => {
            daysOfWeek.push(day)
            timeSlot.push(slot)
          })
        })
      })


      return {
        id: care.id,
        clientId: care.clientId,
        userId: user.userId,
        productDTO: care.productDTO,
        programId,
        carePrice: care.carePrice,
        quantity: care.quantity,
        durationWeeks: days.length,
        timeSlot,
        daysOfWeek,
        created: care.created,
        modified: new Date().toISOString(),
      }
    })

    mutation.mutate({ programId, cares })
  }

  // Mapping of days to their French equivalents
  const dayMapping = {
    MONDAY: 'L',
    TUESDAY: 'Ma',
    WEDNESDAY: 'Me',
    THURSDAY: 'J',
    FRIDAY: 'V',
    SATURDAY: 'S',
    SUNDAY: 'D',
  }

 // 🌈 Get category color from localStorage by category ID
 const getCategoryColor = (categoryId) => {
   return localStorage.getItem(`category-color-${categoryId}`) || "#999999";
 };

  // Loading and error states
  if (isLoading) return <Spinner />
  if (isError) return <p>Error: {error.message}</p>

  return (
    <div className='planning-container'>
      <h2>Planning du  Programme: {program.programReference}</h2>
      <div>
      <button className='impression' onClick={handlePreview}>Aperçu avant Impression</button>
      {isPreviewOpen && (
        <ProgramPreviewModal
          program={program}
          careSelections={careSelections}
          onClose={() => setIsPreviewOpen(false)}
        />
      )}
    </div>

      <button className="save-planning-btn" onClick={handleSave} disabled={mutation.isLoading}>
        {mutation.isLoading ? 'Saving...' : 'Sauvegarder'}
      </button>
      <p>Veuillez sauvegarder toute modification !</p>

      <div className='planningtable-container'>
        <table className='planning-table'>
          <thead>
            <tr>
              
              {[...Array(program.cares[0]?.weeks || 0)].map((_, index) => (
                <th key={index}>Week {index + 1}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {program.cares.map((care) => {
              const careData = careSelections[care.id] || { weeks: 0, days: [] }
              const careWeeks = careData.weeks
              const careDays = careData.days

              return (
                <tr key={care.id}>
                  <td> 
                    <Link to={`/dashboard/product-detail/${care.productDTO.id}`}>
                      {care.productDTO?.name || 'soins inconnu'}</Link>
                      {care.productDTO?.categoryDTO?.id && (
                          <span
                            style={{
                              display: 'inline-block',
                              width: '12px',
                              height: '12px',
                              borderRadius: '50%',
                              backgroundColor: getCategoryColor(care.productDTO.categoryDTO.id),
                              marginLeft: '8px',
                              verticalAlign: 'middle',
                            }}
                          ></span>
                        )}
                  </td>
                  {[...Array(careWeeks)].map((_, weekIndex) => (
                    <td key={weekIndex}>
                      <div className='week-container'>
                        <div className='day-row'>
                          {['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'].map((day) => (
                            <div key={day} className="day-column">
                              <div>{dayMapping[day]}</div>
                              <div>
                                <input
                                  type="checkbox"
                                  checked={careDays[weekIndex]?.[day]?.includes('Matin') || false}
                                  onChange={(e) => handleDayTimeSlotChange(care.id, weekIndex, day, 'Matin', e.target.checked)}
                                />
                              </div>
                              <div>
                                <input
                                  type="checkbox"
                                  checked={careDays[weekIndex]?.[day]?.includes('Soir') || false}
                                  onChange={(e) => handleDayTimeSlotChange(care.id, weekIndex, day, 'Soir', e.target.checked)}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </td>
                  ))}
                  <td>
                    <div className='actions-column'>
                      <button onClick={() => handleAddWeek(care.id)}>+ semaine</button>
                      <button onClick={() => handleRemoveWeek(care.id)}>- semaine</button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Planning
