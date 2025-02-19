import React, { useState } from 'react'
import { useAuth } from '../authentication/AuthProvider'
import './AddClient.css'
import { useNavigate } from 'react-router-dom'
import { useClient } from './ClientProvider'

const AddClient = () => {
  const navigate = useNavigate()
  const {user} = useAuth()
  const userId = user?.userId
  const {addClient} = useClient()

  const[clientDTO, setClientDTO] = useState({
    firstName: '',
    lastName: '',
    comments: '',
    email: '',
    mobilePhone: '',
    homePhone: '',
    birthday: '',
    city: '',
    streetName: '',
    zipCode: '',
    sex: '',
    userId:userId,
    stress: '',
    stressPsychoaffectif: '',
    fumezVousCombien: '',
    dereglementHormonal: '',
    crisesEpilepsie: '',
    interventionsChirurgicales: '',
    pacemaker: '',
    anticoagulants: '',
    allergiesOuIntolerances: '',
    problemesThyroidiens: '',
    chimiotherapie: '',
    fatigueGenerale: '',
    regimeAlimentaire: '',
    carences: '',
    gastroplastie: '',
    menopause: '',
    moyenContraception: '',
    reglesAbondantes: '',
    enceinte: '',
    enfant2DerniereAnnee: '',
    chuteApresAccouchement: '',
    interruptionAllaitement: '',
    fausseCouche: '',
    herediteChuteCheveux: '',
    calvitie: '',
    cheveuxPeuAbondants: '',
    pelade: '',
    cheveuxGras: '',
    cheveuxSecs: '',
    chuteCheveuxDepuisQuand: '',
    typeChute: '',
    trichotillomanie: '',
    nombreShampoingsParSemaine: '',
    apresShampoingMasque: '',
    methodesAgressivesCoiffage: '',
    alimentation: ''
  })

  const [errorMessage, setErrorMessage] = useState('') 

  const handleChange = (e) => {
    const { name, type, value, valueAsNumber } = e.target
  
    setClientDTO((prevData) => ({
      ...prevData,
      [name]: type === 'number' ? valueAsNumber : value,
    }))
  }
  

  const handleSubmit = (e) => {
    e.preventDefault()
    addClient.mutate(clientDTO, {
      onSuccess: () => {
        //queryClient.invalidateQueries(['clients']);  NOT SURE JUST ADDED

        setClientDTO({
            firstName: '',
            lastName: '',
            email: '',
            mobilePhone: '',
            homePhone: '',
            birthday: '',
            city: '',
            streetName: '',
            zipCode: '',
            sex: '',
            userId: userId,
              stress: '',
              stressPsychoaffectif: '',
              fumezVousCombien: '',
              dereglementHormonal: '',
              crisesEpilepsie: '',
              interventionsChirurgicales: '',
              pacemaker: '',
              anticoagulants: '',
              allergiesOuIntolerances: '',
              problemesThyroidiens: '',
              chimiotherapie: '',
              fatigueGenerale: '',
              regimeAlimentaire: '',
              carences: '',
              gastroplastie: '',
              menopause: '',
              moyenContraception: '',
              reglesAbondantes: '',
              enceinte: '',
              enfant2DerniereAnnee: '',
              chuteApresAccouchement: '',
              interruptionAllaitement: '',
              fausseCouche: '',
              herediteChuteCheveux: '',
              calvitie: '',
              cheveuxPeuAbondants: '',
              pelade: '',
              cheveuxGras: '',
              cheveuxSecs: '',
              chuteCheveuxDepuisQuand: '',
              typeChute: '',
              trichotillomanie: '',
              nombreShampoingsParSemaine: '',
              apresShampoingMasque: '',
              methodesAgressivesCoiffage: '',
              alimentation: ''
    })
    navigate('/dashboard/clients')
    setErrorMessage('')
  },
  onError: (error) => {
    if (error.response) {
      const errorData = error.response.data 
      setErrorMessage(errorData.message) 
      console.error('Error details:', errorData)
  } else if (error.request) {
      console.error('No response received:', error.request)
      setErrorMessage('No response from server.')
  } else {
      console.error('Error:', error.message)
      setErrorMessage('Error: ' + error.message)
  }
  }})}


  const today = new Date().toISOString().split('T')[0]

  return (
    <div className='add-client-container'>
      <h2>Ajouter un Client</h2>
      <form onSubmit={handleSubmit} className='add-client-form'>
        <label>
          Prénom:
          <input
            type='text'
            name='firstName'
            value={clientDTO.firstName}
            onChange={handleChange}
            className='add-client-input'
            required
          />
        </label>
        <label>
          Nom:
          <input
            type='text'
            name='lastName'
            value={clientDTO.lastName}
            onChange={handleChange}
            className='add-client-input'
            required
          />
        </label>
        <label>
          Email:
          <input
            type='email'
            name='email'
            value={clientDTO.email}
            onChange={handleChange}
            className='add-client-input'
          />
        </label>
        <label>
          Téléphone mobile:
          <input
            type='number'
            name='mobilePhone'
            value={clientDTO.mobilePhone}
            onChange={handleChange}
            className='add-client-input'
          />
        </label>
        <label>
          Téléphone domicile:
          <input
            type='number'
            name='homePhone'
            value={clientDTO.homePhone}
            onChange={handleChange}
            className='add-client-input'
          />
        </label>
        <label>
          Date de naissance:
          <input
            type='date'
            name='birthday'
            value={clientDTO.birthday}
            onChange={handleChange}
            className='add-client-input'
            max={today}   
          />
        </label>
        <label>
          Ville:
          <input
            type='text'
            name='city'
            value={clientDTO.city}
            onChange={handleChange}
            className='add-client-input'
            
          />
        </label>
        <label>
          Adresse:
          <input
            type='text'
            name='streetName'
            value={clientDTO.streetName}
            onChange={handleChange}
            className='add-client-input'
           
          />
        </label>
        <label>
          Code postal:
          <input
            type='text'
            name='zipCode'
            value={clientDTO.zipCode}
            onChange={handleChange}
            className='add-client-input'
            
          />
        </label>
        <label>
          Sexe:
          <select name='sex' value={clientDTO.sex} onChange={handleChange} className='add-client-input' required>
            <option value=''>Sélectionnez</option>
            <option value='M'>Masculin</option>
            <option value='F'>Féminin</option>
          </select>
        </label>
        <label>
        Commentaire:
        <textarea
          name='comments'
          value={clientDTO.comments}
          onChange={handleChange}
          className='add-client-input'
        />
      </label>
      <label>
        Stress:
        <input
          type="text"
          name="stress"
          value={clientDTO.stress}
          onChange={handleChange}
          className="add-client-input"
        />
      </label>

      <label>
        Stress Psychoaffectif:
        <input
          type="text"
          name="stressPsychoaffectif"
          value={clientDTO.stressPsychoaffectif}
          onChange={handleChange}
          className="add-client-input"
        />
      </label>

      <label>
        Fumez-vous Combien?:
        <input
          type="text"
          name="fumezVousCombien"
          value={clientDTO.fumezVousCombien}
          onChange={handleChange}
          className="add-client-input"
        />
      </label>

      <label>
        Dereglement Hormonal:
        <input
          type="text"
          name="dereglementHormonal"
          value={clientDTO.dereglementHormonal}
          onChange={handleChange}
          className="add-client-input"
        />
      </label>

      <label>
        Crises Epilepsie:
        <input
          type="text"
          name="crisesEpilepsie"
          value={clientDTO.crisesEpilepsie}
          onChange={handleChange}
          className="add-client-input"
        />
      </label>

      <label>
        Interventions Chirurgicales:
        <input
          type="text"
          name="interventionsChirurgicales"
          value={clientDTO.interventionsChirurgicales}
          onChange={handleChange}
          className="add-client-input"
        />
      </label>

      <label>
        Pacemaker:
        <input
          type="text"
          name="pacemaker"
          value={clientDTO.pacemaker}
          onChange={handleChange}
          className="add-client-input"
        />
      </label>

      <label>
        Anticoagulants:
        <input
          type="text"
          name="anticoagulants"
          value={clientDTO.anticoagulants}
          onChange={handleChange}
          className="add-client-input"
        />
      </label>

      <label>
        Allergies ou Intolerances:
        <input
          type="text"
          name="allergiesOuIntolerances"
          value={clientDTO.allergiesOuIntolerances}
          onChange={handleChange}
          className="add-client-input"
        />
      </label>

      <label>
        Problemes Thyroïdiens:
        <input
          type="text"
          name="problemesThyroidiens"
          value={clientDTO.problemesThyroidiens}
          onChange={handleChange}
          className="add-client-input"
        />
      </label>

      <label>
        Chimiothérapie:
        <input
          type="text"
          name="chimiotherapie"
          value={clientDTO.chimiotherapie}
          onChange={handleChange}
          className="add-client-input"
        />
      </label>

      <label>
        Fatigue Générale:
        <input
          type="text"
          name="fatigueGenerale"
          value={clientDTO.fatigueGenerale}
          onChange={handleChange}
          className="add-client-input"
        />
      </label>

      <label>
        Régime Alimentaire:
        <input
          type="text"
          name="regimeAlimentaire"
          value={clientDTO.regimeAlimentaire}
          onChange={handleChange}
          className="add-client-input"
        />
      </label>

      <label>
        Carences:
        <input
          type="text"
          name="carences"
          value={clientDTO.carences}
          onChange={handleChange}
          className="add-client-input"
        />
      </label>

      <label>
        Gastroplastie:
        <input
          type="text"
          name="gastroplastie"
          value={clientDTO.gastroplastie}
          onChange={handleChange}
          className="add-client-input"
        />
      </label>

      <label>
        Ménopause:
        <input
          type="text"
          name="menopause"
          value={clientDTO.menopause}
          onChange={handleChange}
          className="add-client-input"
        />
      </label>

      <label>
        Moyen Contraception:
        <input
          type="text"
          name="moyenContraception"
          value={clientDTO.moyenContraception}
          onChange={handleChange}
          className="add-client-input"
        />
      </label>

      <label>
        Règles Abondantes:
        <input
          type="text"
          name="reglesAbondantes"
          value={clientDTO.reglesAbondantes}
          onChange={handleChange}
          className="add-client-input"
        />
      </label>

      <label>
        Enceinte:
        <input
          type="text"
          name="enceinte"
          value={clientDTO.enceinte}
          onChange={handleChange}
          className="add-client-input"
        />
      </label>

      <label>
        Enfant 2 Dernière Année:
        <input
          type="text"
          name="enfant2DerniereAnnee"
          value={clientDTO.enfant2DerniereAnnee}
          onChange={handleChange}
          className="add-client-input"
        />
      </label>

      <label>
        Chute Après Accouchement:
        <input
          type="text"
          name="chuteApresAccouchement"
          value={clientDTO.chuteApresAccouchement}
          onChange={handleChange}
          className="add-client-input"
        />
      </label>

      <label>
        Interruption Allaitement:
        <input
          type="text"
          name="interruptionAllaitement"
          value={clientDTO.interruptionAllaitement}
          onChange={handleChange}
          className="add-client-input"
        />
      </label>

      <label>
        Fausse Couche:
        <input
          type="text"
          name="fausseCouche"
          value={clientDTO.fausseCouche}
          onChange={handleChange}
          className="add-client-input"
        />
      </label>

      <label>
        Hérédité Chute Cheveux:
        <input
          type="text"
          name="herediteChuteCheveux"
          value={clientDTO.herediteChuteCheveux}
          onChange={handleChange}
          className="add-client-input"
        />
      </label>

      <label>
        Calvitie:
        <input
          type="text"
          name="calvitie"
          value={clientDTO.calvitie}
          onChange={handleChange}
          className="add-client-input"
        />
      </label>

      <label>
        Cheveux Peu Abondants:
        <input
          type="text"
          name="cheveuxPeuAbondants"
          value={clientDTO.cheveuxPeuAbondants}
          onChange={handleChange}
          className="add-client-input"
        />
      </label>

      <label>
        Pelade:
        <input
          type="text"
          name="pelade"
          value={clientDTO.pelade}
          onChange={handleChange}
          className="add-client-input"
        />
      </label>

      <label>
        Cheveux Gras:
        <input
          type="text"
          name="cheveuxGras"
          value={clientDTO.cheveuxGras}
          onChange={handleChange}
          className="add-client-input"
        />
      </label>

      <label>
        Cheveux Secs:
        <input
          type="text"
          name="cheveuxSecs"
          value={clientDTO.cheveuxSecs}
          onChange={handleChange}
          className="add-client-input"
        />
      </label>

      <label>
        Chute Cheveux Depuis Quand:
        <input
          type="text"
          name="chuteCheveuxDepuisQuand"
          value={clientDTO.chuteCheveuxDepuisQuand}
          onChange={handleChange}
          className="add-client-input"
        />
      </label>

      <label>
        Type Chute:
        <input
          type="text"
          name="typeChute"
          value={clientDTO.typeChute}
          onChange={handleChange}
          className="add-client-input"
        />
      </label>

      <label>
        Trichotillomanie:
        <input
          type="text"
          name="trichotillomanie"
          value={clientDTO.trichotillomanie}
          onChange={handleChange}
          className="add-client-input"
        />
      </label>

      <label>
        Nombre de Shampoings Par Semaine:
        <input
          type="text"
          name="nombreShampoingsParSemaine"
          value={clientDTO.nombreShampoingsParSemaine}
          onChange={handleChange}
          className="add-client-input"
        />
      </label>

      <label>
        Après Shampoing ou Masque:
        <input
          type="text"
          name="apresShampoingMasque"
          value={clientDTO.apresShampoingMasque}
          onChange={handleChange}
          className="add-client-input"
        />
      </label>

      <label>
        Méthodes Agressives de Coiffage:
        <input
          type="text"
          name="methodesAgressivesCoiffage"
          value={clientDTO.methodesAgressivesCoiffage}
          onChange={handleChange}
          className="add-client-input"
        />
      </label>

      <label>
        Alimentation:
        <input
          type="text"
          name="alimentation"
          value={clientDTO.alimentation}
          onChange={handleChange}
          className="add-client-input"
        />
      </label>


        <button type='submit' className='add-client-button' disabled={addClient.isLoading}>
          {addClient.isLoading ? 'Enregistrement...' : 'Ajouter Client'}
        </button>
        <button type='button' className='client-cancel-button' onClick={() => navigate(-1)}>
            Annuler
          </button>

        {addClient.isError && <p className='add-client-error'>Erreur: {addClient.error.message}</p>}
        {errorMessage && <p className='add-client-error'>Erreur: {errorMessage}</p>}
        {addClient.isSuccess && <p className='add-client-success'>Client ajouté avec succès!</p>}
      </form>
    </div>
  )
}

export default AddClient