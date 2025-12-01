/**
 * Script pour la gestion des professionnels de santé dans un établissement
 * 
 * RELATION PROFESSIONNEL-ÉTABLISSEMENT:
 * - Chaque professionnel est associé à un établissement via un identifiant unique (etablissementId)
 * - Un établissement peut avoir plusieurs professionnels (relation 1-N)
 * - Chaque professionnel appartient à un seul établissement
 * - Les professionnels sont filtrés par établissement pour garantir l'isolation des données
 */

const PROFESSIONNELS_STORAGE_KEY = 'mama_establishment_professionnels';
const ESTABLISHMENT_PROFILE_KEY = 'mama_establishment_profile';

/**
 * Génère un identifiant unique pour l'établissement actuel
 * Basé sur le nom de l'établissement et la date de création
 */
function getCurrentEstablishmentId() {
  try {
    const profileStr = localStorage.getItem(ESTABLISHMENT_PROFILE_KEY);
    if (!profileStr) return null;
    
    const profile = JSON.parse(profileStr);
    // Créer un ID unique basé sur le nom et la date de création
    if (!profile.etablissementId) {
      // Générer un ID unique si pas encore créé
      const id = `etab_${profile.nom.replace(/\s+/g, '_').toLowerCase()}_${profile.createdAt || Date.now()}`;
      profile.etablissementId = id;
      localStorage.setItem(ESTABLISHMENT_PROFILE_KEY, JSON.stringify(profile));
      return id;
    }
    return profile.etablissementId;
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'ID établissement:', error);
    return null;
  }
}

/**
 * Récupère tous les professionnels, filtrés par établissement actuel
 */
function getProfessionnels() {
  try {
    const stored = localStorage.getItem(PROFESSIONNELS_STORAGE_KEY);
    const allProfessionnels = stored ? JSON.parse(stored) : [];
    
    // Filtrer par établissement actuel
    const currentEtablissementId = getCurrentEstablishmentId();
    if (!currentEtablissementId) {
      console.warn('Aucun établissement trouvé, retour d\'un tableau vide');
      return [];
    }
    
    // Retourner uniquement les professionnels de cet établissement
    return allProfessionnels.filter(prof => prof.etablissementId === currentEtablissementId);
  } catch (error) {
    console.error('Erreur lors du chargement des professionnels:', error);
    return [];
  }
}

/**
 * Récupère le nom de l'établissement actuel pour l'affichage
 */
function getCurrentEstablishmentName() {
  try {
    const profileStr = localStorage.getItem(ESTABLISHMENT_PROFILE_KEY);
    if (!profileStr) return 'Établissement';
    const profile = JSON.parse(profileStr);
    return profile.nom || 'Établissement';
  } catch (error) {
    return 'Établissement';
  }
}

function getPatientesCount(professionnelId) {
  // Compter les patientes associées à ce professionnel
  try {
    const patientes = JSON.parse(localStorage.getItem('mama_patientes_data') || '[]');
    // Pour l'instant, on retourne 0 car il n'y a pas de lien direct
    // À améliorer avec un système de liaison professionnel-patiente
    return 0;
  } catch (error) {
    return 0;
  }
}

function renderProfessionnels(professionnels = null) {
  const tbody = document.querySelector('#professionnels-table tbody');
  if (!tbody) return;

  const data = professionnels || getProfessionnels();

  if (data.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="5" style="text-align: center; padding: 2rem; color: #6b7280;">
          Aucun professionnel enregistré pour le moment
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = data.map(prof => {
    const patientesCount = getPatientesCount(prof.id);
    const professionLabel = {
      'sage_femme': 'Sage-femme',
      'medecin': 'Médecin',
      'infirmier': 'Infirmier/Infirmière',
      'superviseur': 'Superviseur'
    }[prof.profession] || prof.profession;

    return `
      <tr>
        <td>${prof.prenom} ${prof.nom}</td>
        <td>${professionLabel}</td>
        <td>${prof.telephone || '-'}</td>
        <td>${patientesCount}</td>
        <td>
          <div class="action-buttons">
            <button class="action-btn view-btn" onclick="viewProfessionnel(${prof.id})" title="Voir">👁️</button>
            <button class="action-btn edit-btn" onclick="editProfessionnel(${prof.id})" title="Modifier">✏️</button>
            <button class="action-btn delete-btn" onclick="deleteProfessionnel(${prof.id})" title="Supprimer">🗑️</button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

function openAddModal() {
  const modal = document.getElementById('add-professionnel-modal');
  if (modal) {
    modal.classList.remove('hidden');
  }
}

function closeAddModal() {
  const modal = document.getElementById('add-professionnel-modal');
  if (modal) {
    modal.classList.add('hidden');
    const form = document.getElementById('add-professionnel-form');
    if (form) form.reset();
  }
}

/**
 * Ajoute un nouveau professionnel à l'établissement actuel
 * Le professionnel est automatiquement associé à l'établissement via etablissementId
 * 🔄 SYNCHRONISATION : Le professionnel est automatiquement lié à l'établissement
 */
function addProfessionnel(profData) {
  const currentEtablissementId = getCurrentEstablishmentId();
  if (!currentEtablissementId) {
    throw new Error('Aucun établissement trouvé. Veuillez créer un profil établissement d\'abord.');
  }
  
  // Récupérer tous les professionnels (tous établissements confondus)
  let allProfessionnels = [];
  try {
    const stored = localStorage.getItem(PROFESSIONNELS_STORAGE_KEY);
    allProfessionnels = stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Erreur lors du chargement:', error);
    allProfessionnels = [];
  }
  
  // Récupérer le nom de l'établissement pour référence
  const establishmentProfile = JSON.parse(localStorage.getItem(ESTABLISHMENT_PROFILE_KEY) || 'null');
  const establishmentName = establishmentProfile ? establishmentProfile.nom : null;
  
  // Créer le nouveau professionnel avec l'ID de l'établissement
  const newProf = {
    id: Date.now(),
    ...profData,
    etablissementId: currentEtablissementId, // RELATION: Associer le professionnel à l'établissement
    etablissementNom: establishmentName, // Nom de l'établissement pour référence
    createdAt: new Date().toISOString()
  };
  
  // Ajouter à la liste globale
  allProfessionnels.push(newProf);
  
  // Sauvegarder tous les professionnels
  try {
    localStorage.setItem(PROFESSIONNELS_STORAGE_KEY, JSON.stringify(allProfessionnels));
    console.log('✅ Professionnel synchronisé avec l\'établissement:', currentEtablissementId);
  } catch (error) {
    console.error('Erreur lors de la sauvegarde:', error);
    throw new Error('Erreur lors de la sauvegarde du professionnel');
  }
  
  // Afficher uniquement les professionnels de l'établissement actuel
  const filteredProfessionnels = getProfessionnels();
  renderProfessionnels(filteredProfessionnels);
}

/**
 * Supprime un professionnel de l'établissement actuel
 */
function deleteProfessionnel(id) {
  if (!confirm('Êtes-vous sûr de vouloir supprimer ce professionnel ?')) {
    return;
  }
  
  // Récupérer tous les professionnels
  let allProfessionnels = [];
  try {
    const stored = localStorage.getItem(PROFESSIONNELS_STORAGE_KEY);
    allProfessionnels = stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Erreur lors du chargement:', error);
    return;
  }
  
  // Filtrer pour supprimer le professionnel spécifique
  const filtered = allProfessionnels.filter(p => p.id !== id);
  
  // Sauvegarder
  try {
    localStorage.setItem(PROFESSIONNELS_STORAGE_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Erreur lors de la sauvegarde:', error);
    alert('Erreur lors de la suppression');
    return;
  }
  
  // Afficher les professionnels de l'établissement actuel
  const currentProfessionnels = getProfessionnels();
  renderProfessionnels(currentProfessionnels);
}

function viewProfessionnel(id) {
  const professionnels = getProfessionnels();
  const prof = professionnels.find(p => p.id === id);
  if (prof) {
    alert(`Professionnel: ${prof.prenom} ${prof.nom}\nProfession: ${prof.profession}\nTéléphone: ${prof.telephone || 'N/A'}`);
  }
}

function editProfessionnel(id) {
  // Pour l'instant, on affiche juste une alerte
  // À améliorer avec un modal d'édition
  alert('Fonctionnalité d\'édition à venir');
}

/**
 * Recherche parmi les professionnels de l'établissement actuel
 */
function setupSearch() {
  const searchInput = document.getElementById('search-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase();
      const professionnels = getProfessionnels(); // Déjà filtrés par établissement
      const filtered = professionnels.filter(prof => {
        const fullName = `${prof.prenom} ${prof.nom}`.toLowerCase();
        const profession = prof.profession.toLowerCase();
        return fullName.includes(query) || profession.includes(query);
      });
      renderProfessionnels(filtered);
    });
  }
}

document.addEventListener('DOMContentLoaded', function() {
  // Vérifier que le profil établissement existe
  const ESTABLISHMENT_PROFILE_KEY = 'mama_establishment_profile';
  const profile = localStorage.getItem(ESTABLISHMENT_PROFILE_KEY);
  if (!profile) {
    // Rediriger vers la page de création de profil
    window.location.href = 'creer-profil-etablissement.html';
    return;
  }

  // Afficher le nom de l'établissement
  const establishmentNameDisplay = document.getElementById('establishment-name-display');
  if (establishmentNameDisplay) {
    const establishmentName = getCurrentEstablishmentName();
    establishmentNameDisplay.textContent = `Établissement: ${establishmentName}`;
  }

  renderProfessionnels();
  setupSearch();

  // Bouton ajouter
  const addBtn = document.getElementById('add-professionnel-btn');
  if (addBtn) {
    addBtn.addEventListener('click', openAddModal);
  }

  // Modal
  const closeBtn = document.getElementById('close-modal-btn');
  const cancelBtn = document.getElementById('cancel-prof-btn');
  if (closeBtn) closeBtn.addEventListener('click', closeAddModal);
  if (cancelBtn) cancelBtn.addEventListener('click', closeAddModal);

  // Formulaire
  const form = document.getElementById('add-professionnel-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const profData = {
        prenom: document.getElementById('prof-prenom').value.trim(),
        nom: document.getElementById('prof-nom').value.trim(),
        profession: document.getElementById('prof-profession').value,
        telephone: document.getElementById('prof-telephone').value.trim(),
        email: document.getElementById('prof-email').value.trim()
      };

      try {
        addProfessionnel(profData);
        closeAddModal();
        const messageDiv = document.getElementById('prof-message');
        if (messageDiv) {
          messageDiv.className = 'message success';
          messageDiv.textContent = 'Professionnel ajouté avec succès !';
          setTimeout(() => {
            messageDiv.textContent = '';
            messageDiv.className = '';
          }, 2000);
        }
      } catch (error) {
        const messageDiv = document.getElementById('prof-message');
        if (messageDiv) {
          messageDiv.className = 'message error';
          messageDiv.textContent = error.message || 'Erreur lors de l\'ajout';
        }
      }
    });
  }

  // Fermer modal en cliquant en dehors
  const modal = document.getElementById('add-professionnel-modal');
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeAddModal();
      }
    });
  }

  // Déconnexion
  const logoutButton = document.getElementById('logout-button');
  if (logoutButton) {
    logoutButton.addEventListener('click', () => {
      if (window.auth && window.auth.logout) {
        window.auth.logout();
      }
      window.location.href = 'index.html';
    });
  }
});

// Exposer les fonctions globalement
window.viewProfessionnel = viewProfessionnel;
window.editProfessionnel = editProfessionnel;
window.deleteProfessionnel = deleteProfessionnel;

