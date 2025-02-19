import React, {useEffect, useState } from 'react'
import './Client.css'
import { Link, Outlet, useNavigate, useParams } from 'react-router-dom'
import Spinner from '../common/Spinner'
import { useClient } from './ClientProvider'
import { useProductsContext } from '../product/ProductProvider'
import { useAuth } from '../authentication/AuthProvider'

const Client = () => {
  const { user } = useAuth()
  const userId = user?.userId
  const navigate = useNavigate()
  const {clientId} = useParams()
  const {getClientById, updateClient} =  useClient()
  const [isEditing, setIsEditing] = useState(false)
  const [clientData, setClientData] = useState({})
  const { data: client, error, isLoading } = getClientById(clientId)
  const {products} = useProductsContext()

useEffect(() => {
  if (client) {
    setClientData(client)
  }
}, [client])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setClientData((prevData) => ({...prevData,[name]: value}))
  }

  const handleUpdateClick = () => {
    if (isEditing) {
     updateClient.mutate({ id:clientId, updatedData: clientData })
    }
    setIsEditing((prev) => !prev)
  }

  if (isLoading) return <Spinner />
  if (error) return <p>Error: {error.message || 'Une erreur est survenu.'}</p>

  const shouldShowModifiedDate = clientData.modified && clientData.modified !== clientData.created
  const today = new Date().toISOString().split('T')[0]

  return (
    <div className='client-container'>
    <h2 className='client-title'>
       <span>{clientData?.firstName}</span> <span>{clientData?.lastName}</span>
    </h2>

    <div className='client-buttons'>
    <button className='update-profile-button' onClick={handleUpdateClick}>
      {isEditing ? 'Enregistrer' : 'Modifier Profile'}
    </button>
    <button className='update-profile-button' onClick={() => navigate(-1)}> Retour
    </button>
        </div>
    <div className='client-details'>
      <p className='client-detail'>
        <strong>Nom:</strong>
        {isEditing ? (
          <input type='text' name='lastName' value={clientData.lastName || ''} onChange={handleInputChange} />
        ) : (
          ` ${clientData?.lastName}`
        )}
      </p>
      <p className='client-detail'>
        <strong>Prénom:</strong>
        {isEditing ? (
          <input type='text' name='firstName' value={clientData.firstName || ''} onChange={handleInputChange} />
        ) : (
          ` ${clientData?.firstName}`
        )}
      </p>
      <p className='client-detail'>
        <strong>Email:</strong>
        {isEditing ? (
          <input type='email' name='email' value={clientData.email || ''} onChange={handleInputChange} />
        ) : (
          ` ${clientData?.email}`
        )}
      </p>
      <p className='client-detail'>
        <strong>Mobile:</strong>
        {isEditing ? (
          <input type='text' name='mobilePhone' value={clientData.mobilePhone || ''} onChange={handleInputChange} />
        ) : (
          ` ${clientData?.mobilePhone}`
        )}
      </p>
      <p className='client-detail'>
        <strong>Tél Fix:</strong>
        {isEditing ? (
          <input type='text' name='homePhone' value={clientData.homePhone || ''} onChange={handleInputChange} />
        ) : (
          ` ${clientData?.homePhone}`
        )}
      </p>
      <p className='client-detail'>
        <strong>Date de naissance:</strong>
        {isEditing ? (
          <input type='date' name='birthday' value={clientData.birthday?.split('T')[0] || ''} onChange={handleInputChange} max={today}/>
        ) : (
          ` ${new Date(clientData?.birthday).toLocaleDateString()}`
        )}
      </p>
      <p className='client-detail'>
        <strong>Ville:</strong>
        {isEditing ? (
          <input type='text' name='city' value={clientData.city || ''} onChange={handleInputChange} />
        ) : (
          ` ${clientData?.city}`
        )}
      </p>
      <p className='client-detail'>
        <strong>Adresse:</strong>
        {isEditing ? (
          <input type='text' name='streetName' value={clientData.streetName || ''} onChange={handleInputChange} />
        ) : (
          ` ${clientData?.streetName}`
        )}
      </p>
      <p className='client-detail'>
        <strong>Code Postal:</strong>
        {isEditing ? (
          <input type='text' name='zipCode' value={clientData.zipCode || ''} onChange={handleInputChange} />
        ) : (
          ` ${clientData?.zipCode}`
        )}
      </p>
      <p className='client-detail'>
        <strong>Sexe:</strong>
        {isEditing ? (
          <select name='sex' value={clientData.sex || ''} onChange={handleInputChange}>
            <option value=''>Sélectionnez</option>
            <option value='M'>Masculin</option>
            <option value='F'>Féminin</option>
          </select>
        ) : (
          ` ${clientData?.sex}`
        )}
      </p>
      <p className='client-detail'>
        <strong>Date de création:</strong> {new Date(clientData?.created).toLocaleDateString()}
      </p>
      {shouldShowModifiedDate && (
          <p className='client-detail'>
            <strong>Date de modification:</strong> {new Date(clientData.modified).toLocaleDateString()}
          </p>
        )}

  <p className='client-detail'>
    <strong>Stress:</strong>
    {isEditing ? (
      <input
        type="text"
        name="stress"
        value={clientData.stress || ''}
        onChange={handleInputChange}
      />
    ) : (
      ` ${clientData?.stress}`
    )}
  </p>

  <p className='client-detail'>
    <strong>Stress Psychoaffectif:</strong>
    {isEditing ? (
      <input
        type="text"
        name="stressPsychoaffectif"
        value={clientData.stressPsychoaffectif || ''}
        onChange={handleInputChange}
      />
    ) : (
      ` ${clientData?.stressPsychoaffectif}`
    )}
  </p>

  <p className='client-detail'>
    <strong>Fumez-vous Combien?:</strong>
    {isEditing ? (
      <input
        type="text"
        name="fumezVousCombien"
        value={clientData.fumezVousCombien || ''}
        onChange={handleInputChange}
      />
    ) : (
      ` ${clientData?.fumezVousCombien}`
    )}
  </p>

  <p className='client-detail'>
    <strong>Dereglement Hormonal:</strong>
    {isEditing ? (
      <input
        type="text"
        name="dereglementHormonal"
        value={clientData.dereglementHormonal || ''}
        onChange={handleInputChange}
      />
    ) : (
      ` ${clientData?.dereglementHormonal}`
    )}
  </p>

  <p className='client-detail'>
    <strong>Crises Epilepsie:</strong>
    {isEditing ? (
      <input
        type="text"
        name="crisesEpilepsie"
        value={clientData.crisesEpilepsie || ''}
        onChange={handleInputChange}
      />
    ) : (
      ` ${clientData?.crisesEpilepsie}`
    )}
  </p>

  <p className='client-detail'>
    <strong>Interventions Chirurgicales:</strong>
    {isEditing ? (
      <input
        type="text"
        name="interventionsChirurgicales"
        value={clientData.interventionsChirurgicales || ''}
        onChange={handleInputChange}
      />
    ) : (
      ` ${clientData?.interventionsChirurgicales}`
    )}
  </p>

  <p className='client-detail'>
    <strong>Pacemaker:</strong>
    {isEditing ? (
      <input
        type="text"
        name="pacemaker"
        value={clientData.pacemaker || ''}
        onChange={handleInputChange}
      />
    ) : (
      ` ${clientData?.pacemaker}`
    )}
  </p>

  <p className='client-detail'>
    <strong>Anticoagulants:</strong>
    {isEditing ? (
      <input
        type="text"
        name="anticoagulants"
        value={clientData.anticoagulants || ''}
        onChange={handleInputChange}
      />
    ) : (
      ` ${clientData?.anticoagulants}`
    )}
  </p>

  <p className='client-detail'>
    <strong>Allergies ou Intolerances:</strong>
    {isEditing ? (
      <input
        type="text"
        name="allergiesOuIntolerances"
        value={clientData.allergiesOuIntolerances || ''}
        onChange={handleInputChange}
      />
    ) : (
      ` ${clientData?.allergiesOuIntolerances}`
    )}
  </p>

  <p className='client-detail'>
    <strong>Problemes Thyroïdiens:</strong>
    {isEditing ? (
      <input
        type="text"
        name="problemesThyroidiens"
        value={clientData.problemesThyroidiens || ''}
        onChange={handleInputChange}
      />
    ) : (
      ` ${clientData?.problemesThyroidiens}`
    )}
  </p>

  <p className='client-detail'>
    <strong>Chimiothérapie:</strong>
    {isEditing ? (
      <input
        type="text"
        name="chimiotherapie"
        value={clientData.chimiotherapie || ''}
        onChange={handleInputChange}
      />
    ) : (
      ` ${clientData?.chimiotherapie}`
    )}
  </p>

  <p className='client-detail'>
    <strong>Fatigue Générale:</strong>
    {isEditing ? (
      <input
        type="text"
        name="fatigueGenerale"
        value={clientData.fatigueGenerale || ''}
        onChange={handleInputChange}
      />
    ) : (
      ` ${clientData?.fatigueGenerale}`
    )}
  </p>

  <p className='client-detail'>
    <strong>Régime Alimentaire:</strong>
    {isEditing ? (
      <input
        type="text"
        name="regimeAlimentaire"
        value={clientData.regimeAlimentaire || ''}
        onChange={handleInputChange}
      />
    ) : (
      ` ${clientData?.regimeAlimentaire}`
    )}
  </p>

  <p className='client-detail'>
    <strong>Carences:</strong>
    {isEditing ? (
      <input
        type="text"
        name="carences"
        value={clientData.carences || ''}
        onChange={handleInputChange}
      />
    ) : (
      ` ${clientData?.carences}`
    )}
  </p>

  <p className='client-detail'>
    <strong>Gastroplastie:</strong>
    {isEditing ? (
      <input
        type="text"
        name="gastroplastie"
        value={clientData.gastroplastie || ''}
        onChange={handleInputChange}
      />
    ) : (
      ` ${clientData?.gastroplastie}`
    )}
  </p>

  <p className='client-detail'>
    <strong>Ménopause:</strong>
    {isEditing ? (
      <input
        type="text"
        name="menopause"
        value={clientData.menopause || ''}
        onChange={handleInputChange}
      />
    ) : (
      ` ${clientData?.menopause}`
    )}
  </p>

  <p className='client-detail'>
    <strong>Moyen Contraception:</strong>
    {isEditing ? (
      <input
        type="text"
        name="moyenContraception"
        value={clientData.moyenContraception || ''}
        onChange={handleInputChange}
      />
    ) : (
      ` ${clientData?.moyenContraception}`
    )}
  </p>

  <p className='client-detail'>
    <strong>Règles Abondantes:</strong>
    {isEditing ? (
      <input
        type="text"
        name="reglesAbondantes"
        value={clientData.reglesAbondantes || ''}
        onChange={handleInputChange}
      />
    ) : (
      ` ${clientData?.reglesAbondantes}`
    )}
  </p>

  <p className='client-detail'>
    <strong>Enceinte:</strong>
    {isEditing ? (
      <input
        type="text"
        name="enceinte"
        value={clientData.enceinte || ''}
        onChange={handleInputChange}
      />
    ) : (
      ` ${clientData?.enceinte}`
    )}
  </p>

  <p className='client-detail'>
    <strong>Enfant 2 Dernière Année:</strong>
    {isEditing ? (
      <input
        type="text"
        name="enfant2DerniereAnnee"
        value={clientData.enfant2DerniereAnnee || ''}
        onChange={handleInputChange}
      />
    ) : (
      ` ${clientData?.enfant2DerniereAnnee}`
    )}
  </p>

  <p className='client-detail'>
    <strong>Chute Après Accouchement:</strong>
    {isEditing ? (
      <input
        type="text"
        name="chuteApresAccouchement"
        value={clientData.chuteApresAccouchement || ''}
        onChange={handleInputChange}
      />
    ) : (
      ` ${clientData?.chuteApresAccouchement}`
    )}
  </p>

  <p className='client-detail'>
    <strong>Interruption Allaitement:</strong>
    {isEditing ? (
      <input
        type="text"
        name="interruptionAllaitement"
        value={clientData.interruptionAllaitement || ''}
        onChange={handleInputChange}
      />
    ) : (
      ` ${clientData?.interruptionAllaitement}`
    )}
  </p>

  <p className='client-detail'>
    <strong>Fausse Couche:</strong>
    {isEditing ? (
      <input
        type="text"
        name="fausseCouche"
        value={clientData.fausseCouche || ''}
        onChange={handleInputChange}
      />
    ) : (
      ` ${clientData?.fausseCouche}`
    )}
  </p>

  <p className='client-detail'>
    <strong>Hérédité Chute Cheveux:</strong>
    {isEditing ? (
      <input
        type="text"
        name="herediteChuteCheveux"
        value={clientData.herediteChuteCheveux || ''}
        onChange={handleInputChange}
      />
    ) : (
      ` ${clientData?.herediteChuteCheveux}`
    )}
  </p>

  <p className='client-detail'>
    <strong>Calvitie:</strong>
    {isEditing ? (
      <input
        type="text"
        name="calvitie"
        value={clientData.calvitie || ''}
        onChange={handleInputChange}
      />
    ) : (
      ` ${clientData?.calvitie}`
    )}
  </p>

  <p className='client-detail'>
    <strong>Cheveux Peu Abondants:</strong>
    {isEditing ? (
      <input
        type="text"
        name="cheveuxPeuAbondants"
        value={clientData.cheveuxPeuAbondants || ''}
        onChange={handleInputChange}
      />
    ) : (
      ` ${clientData?.cheveuxPeuAbondants}`
    )}
  </p>

  <p className='client-detail'>
    <strong>Pelade:</strong>
    {isEditing ? (
      <input
        type="text"
        name="pelade"
        value={clientData.pelade || ''}
        onChange={handleInputChange}
      />
    ) : (
      ` ${clientData?.pelade}`
    )}
  </p>

  <p className='client-detail'>
    <strong>Cheveux Gras:</strong>
    {isEditing ? (
      <input
        type="text"
        name="cheveuxGras"
        value={clientData.cheveuxGras || ''}
        onChange={handleInputChange}
      />
    ) : (
      ` ${clientData?.cheveuxGras}`
    )}
  </p>

  <p className='client-detail'>
    <strong>Cheveux Secs:</strong>
    {isEditing ? (
      <input
        type="text"
        name="cheveuxSecs"
        value={clientData.cheveuxSecs || ''}
        onChange={handleInputChange}
      />
    ) : (
      ` ${clientData?.cheveuxSecs}`
    )}
  </p>

  <p className='client-detail'>
    <strong>Chute Cheveux Depuis Quand:</strong>
    {isEditing ? (
      <input
        type="text"
        name="chuteCheveuxDepuisQuand"
        value={clientData.chuteCheveuxDepuisQuand || ''}
        onChange={handleInputChange}
      />
    ) : (
      ` ${clientData?.chuteCheveuxDepuisQuand}`
    )}
  </p>

  <p className='client-detail'>
    <strong>Type Chute:</strong>
    {isEditing ? (
      <input
        type="text"
        name="typeChute"
        value={clientData.typeChute || ''}
        onChange={handleInputChange}
      />
    ) : (
      ` ${clientData?.typeChute}`
    )}
  </p>

  <p className='client-detail'>
    <strong>Trichotillomanie:</strong>
    {isEditing ? (
      <input
        type="text"
        name="trichotillomanie"
        value={clientData.trichotillomanie || ''}
        onChange={handleInputChange}
      />
    ) : (
      ` ${clientData?.trichotillomanie}`
    )}
  </p>

  <p className='client-detail'>
    <strong>Nombre de Shampoings Par Semaine:</strong>
    {isEditing ? (
      <input
        type="text"
        name="nombreShampoingsParSemaine"
        value={clientData.nombreShampoingsParSemaine || ''}
        onChange={handleInputChange}
      />
    ) : (
      ` ${clientData?.nombreShampoingsParSemaine}`
    )}
  </p>

  <p className='client-detail'>
    <strong>Après Shampoing ou Masque:</strong>
    {isEditing ? (
      <input
        type="text"
        name="apresShampoingMasque"
        value={clientData.apresShampoingMasque || ''}
        onChange={handleInputChange}
      />
    ) : (
      ` ${clientData?.apresShampoingMasque}`
    )}
  </p>

  <p className='client-detail'>
    <strong>Méthodes Agressives de Coiffage:</strong>
    {isEditing ? (
      <input
        type="text"
        name="methodesAgressivesCoiffage"
        value={clientData.methodesAgressivesCoiffage || ''}
        onChange={handleInputChange}
      />
    ) : (
      ` ${clientData?.methodesAgressivesCoiffage}`
    )}
  </p>

  <p className='client-detail'>
    <strong>Alimentation:</strong>
    {isEditing ? (
      <input
        type="text"
        name="alimentation"
        value={clientData.alimentation || ''}
        onChange={handleInputChange}
      />
    ) : (
      ` ${clientData?.alimentation}`
    )}
  </p>
<div className='client-comments'>
    <strong>Commentaires:</strong>
    {isEditing ? (
      <textarea
        name='comments'
        value={clientData.comments || ''}
        onChange={handleInputChange}
        rows={6}
      />
    ) : (
      <div className='comment-block'>
        {clientData?.comments || 'Aucun commentaire'}
      </div>
    )}
  </div>

    </div>
    
    <Link to='add-care'>Voir / Ajouter les soins</Link>
    <div className='client-outlet'>
     <Outlet />
    </div>

  </div>
  )
}

export default Client