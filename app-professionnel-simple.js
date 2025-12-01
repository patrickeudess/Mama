/**
 * Version simplifiée - Fonctionne sans serveur backend
 * Utilise localStorage pour stocker les données
 */

// Clé pour le stockage local
const STORAGE_KEY = 'mama_patientes_data';

// Données par défaut (exemples)
const DEFAULT_PATIENTES = [
  {
    id: 1,
    prenom: "Awa",
    nom: "Koffi",
    age: 28,
    pays: "Côte d'Ivoire",
    ville: "Abidjan",
    centre_sante: "CHU de Cocody",
    periode: "month",
    distance_centre: 2.3,
    risque: "moyen",
    derniere_venue: "2024-03-15",
    prochaine_cpn: "2024-04-20",
    telephone: "+2250700000001"
  },
  {
    id: 2,
    prenom: "Mariam",
    nom: "Kouadio",
    age: 19,
    pays: "Côte d'Ivoire",
    ville: "Abidjan",
    centre_sante: "CHU de Yopougon",
    periode: "week",
    distance_centre: 5.1,
    risque: "élevé",
    derniere_venue: "2024-03-10",
    prochaine_cpn: "2024-04-18",
    telephone: "+2250700000002"
  },
  {
    id: 3,
    prenom: "Fatou",
    nom: "Diallo",
    age: 32,
    pays: "Côte d'Ivoire",
    ville: "Bouaké",
    centre_sante: "CHU de Bouaké",
    periode: "month",
    distance_centre: 1.8,
    risque: "faible",
    derniere_venue: "2024-03-20",
    prochaine_cpn: "2024-04-19",
    telephone: "+2250700000003"
  }
];

// Fonctions de stockage
function getPatientes() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    return JSON.parse(stored);
  }
  // Initialiser avec les données par défaut
  savePatientes(DEFAULT_PATIENTES);
  return DEFAULT_PATIENTES;
}

function savePatientes(patientes) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(patientes));
}

function addPatiente(patienteData) {
  const patientes = getPatientes();
  
  // Vérifier que l'ID est fourni
  if (!patienteData.id || patienteData.id <= 0) {
    throw new Error("L'ID du patient est obligatoire et doit être un nombre positif");
  }
  
  // Vérifier que l'ID n'existe pas déjà
  const existingPatiente = patientes.find(p => p.id === patienteData.id);
  if (existingPatiente) {
    throw new Error(`L'ID ${patienteData.id} est déjà utilisé par ${existingPatiente.prenom || ''} ${existingPatiente.nom || ''}`);
  }
  
  // Calculer la prochaine CPN à partir de la liste générée
  let prochaineCPN = null;
  if (patienteData.cpn_list && patienteData.cpn_list.length > 0) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Trouver la première CPN future
    const futureCPN = patienteData.cpn_list
      .filter(cpn => {
        const cpnDate = new Date(cpn.date_rdv);
        cpnDate.setHours(0, 0, 0, 0);
        return cpnDate >= today && cpn.statut === "planifie";
      })
      .sort((a, b) => new Date(a.date_rdv) - new Date(b.date_rdv))[0];
    
    if (futureCPN) {
      prochaineCPN = futureCPN.date_rdv.split('T')[0]; // Format YYYY-MM-DD
    }
  }

  // 🔄 SYNCHRONISATION AUTOMATIQUE : Associer la patiente à l'établissement du professionnel
  const etablissementInfo = getProfessionnelEtablissementInfo();
  
  const newPatiente = {
    id: parseInt(patienteData.id),
    ...patienteData,
    risque: calculateRisk(patienteData),
    derniere_venue: null,
    prochaine_cpn: prochaineCPN,
    // Stocker les CPN générées
    cpn_list: patienteData.cpn_list || [],
    // 🔄 NOUVEAU: Association automatique à l'établissement
    etablissementId: etablissementInfo.etablissementId || null,
    professionnelId: etablissementInfo.professionnelId || null,
    centre_sante: etablissementInfo.centre_sante || patienteData.centre_sante || null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  // Retirer l'ID des données pour éviter la duplication
  delete newPatiente.id;
  newPatiente.id = parseInt(patienteData.id);
  
  patientes.push(newPatiente);
  savePatientes(patientes);
  
  // 🔄 Notifier la synchronisation
  console.log('✅ Patiente synchronisée avec l\'établissement:', etablissementInfo.etablissementId);
  
  return newPatiente;
}

/**
 * 🔄 Récupère les informations de l'établissement du professionnel actuel
 * Cette fonction permet de synchroniser automatiquement les patientes avec l'établissement
 */
function getProfessionnelEtablissementInfo() {
  try {
    // 1. Vérifier si on est connecté en tant que professionnel
    const currentUser = window.auth ? window.auth.getCurrentUser() : null;
    const userType = currentUser ? currentUser.type : localStorage.getItem('mama_user_type');
    
    if (userType !== 'professionnel') {
      // Si ce n'est pas un professionnel, retourner null
      return { etablissementId: null, professionnelId: null, centre_sante: null };
    }
    
    // 2. Utiliser le système multi-établissements si disponible
    if (window.getCurrentEstablishment) {
      const currentEstablishment = window.getCurrentEstablishment();
      if (currentEstablishment) {
        // Récupérer l'ID du professionnel
        const professionnels = JSON.parse(localStorage.getItem('mama_establishment_professionnels') || '[]');
        let professionnelActuel = null;
        if (currentUser && currentUser.phone) {
          professionnelActuel = professionnels.find(p => 
            p.telephone === currentUser.phone && 
            p.etablissementId === currentEstablishment.etablissementId
          );
        }
        
        return {
          etablissementId: currentEstablishment.etablissementId,
          professionnelId: professionnelActuel ? professionnelActuel.id : null,
          centre_sante: currentEstablishment.nom || null
        };
      }
    }
    
    // 3. Fallback : méthode ancienne (pour compatibilité)
    const professionnels = JSON.parse(localStorage.getItem('mama_establishment_professionnels') || '[]');
    
    // Trouver le professionnel actuel (par téléphone ou ID)
    let professionnelActuel = null;
    if (currentUser && currentUser.phone) {
      professionnelActuel = professionnels.find(p => p.telephone === currentUser.phone);
    }
    
    // Si pas trouvé par téléphone, chercher par ID utilisateur
    if (!professionnelActuel && currentUser && currentUser.id) {
      professionnelActuel = professionnels.find(p => p.userId === currentUser.id);
    }
    
    // Si professionnel trouvé, récupérer son établissement
    if (professionnelActuel && professionnelActuel.etablissementId) {
      // Récupérer le nom de l'établissement depuis la liste des établissements du professionnel
      if (window.getProfessionalEstablishments) {
        const establishments = window.getProfessionalEstablishments();
        const est = establishments.find(e => e.etablissementId === professionnelActuel.etablissementId);
        if (est) {
          return {
            etablissementId: est.etablissementId,
            professionnelId: professionnelActuel.id,
            centre_sante: est.nom || null
          };
        }
      }
      
      // Fallback : chercher dans le profil établissement
      const establishmentProfile = JSON.parse(localStorage.getItem('mama_establishment_profile') || 'null');
      const centre_sante = establishmentProfile && establishmentProfile.nom ? establishmentProfile.nom : null;
      
      return {
        etablissementId: professionnelActuel.etablissementId,
        professionnelId: professionnelActuel.id,
        centre_sante: centre_sante || professionnelActuel.etablissementId
      };
    }
    
    return { etablissementId: null, professionnelId: null, centre_sante: null };
  } catch (error) {
    console.error('Erreur lors de la récupération des infos établissement:', error);
    return { etablissementId: null, professionnelId: null, centre_sante: null };
  }
}

function updatePatiente(id, patienteData) {
  const patientes = getPatientes();
  const index = patientes.findIndex(p => p.id === id);
  if (index !== -1) {
    // 🔄 Mettre à jour aussi l'établissement si le professionnel est connecté
    const etablissementInfo = getProfessionnelEtablissementInfo();
    
    patientes[index] = { 
      ...patientes[index], 
      ...patienteData,
      // Mettre à jour les infos d'établissement si disponibles
      ...(etablissementInfo.etablissementId && {
        etablissementId: etablissementInfo.etablissementId,
        centre_sante: etablissementInfo.centre_sante || patientes[index].centre_sante
      }),
      updatedAt: new Date().toISOString()
    };
    savePatientes(patientes);
    
    // 🔄 Notifier la synchronisation
    if (etablissementInfo.etablissementId) {
      console.log('✅ Patiente mise à jour et synchronisée avec l\'établissement');
    }
    
    return patientes[index];
  }
  return null;
}

function deletePatiente(id) {
  const patientes = getPatientes();
  const filtered = patientes.filter(p => p.id !== id);
  savePatientes(filtered);
  return filtered.length < patientes.length;
}

// Calcul simple du risque
function calculateRisk(patiente) {
  let score = 0;
  
  // Âge
  if (patiente.age < 18 || patiente.age > 35) score += 2;
  else if (patiente.age < 20 || patiente.age > 30) score += 1;
  
  // Distance
  if (patiente.distance_centre > 10) score += 2;
  else if (patiente.distance_centre > 5) score += 1;
  
  // Niveau d'instruction
  if (patiente.niveau_instruction === "aucun") score += 1;
  
  if (score >= 4) return "élevé";
  if (score >= 2) return "moyen";
  return "faible";
}

// Fonction pour formater la date
function formatDate(dateString) {
  if (!dateString) return "–";
  const date = new Date(dateString);
  return date.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

// Fonction pour obtenir le badge de risque
function getRiskBadge(risque) {
  const badges = {
    "élevé": '<span class="risk-badge risk-badge-high">🔴 Élevé</span>',
    "moyen": '<span class="risk-badge risk-badge-medium">🟠 Modéré</span>',
    "faible": '<span class="risk-badge risk-badge-low">🟢 Faible</span>'
  };
  return badges[risque] || '<span class="risk-badge">–</span>';
}

// Fonction pour filtrer les patientes
function filterPatientes(patientes, filters) {
  return patientes.filter(p => {
    if (filters.risque !== "all" && p.risque !== filters.risque) return false;
    if (filters.localite !== "all" && p.ville !== filters.localite) return false;
    if (filters.age !== "all") {
      const age = p.age || 0;
      if (filters.age === "41+") {
        if (age < 41) return false;
      } else {
        const [min, max] = filters.age.split("-").map(Number);
        if (age < min || age > max) return false;
      }
    }
    if (filters.distance !== "all") {
      const distance = p.distance_centre || 0;
      if (filters.distance === "10+") {
        if (distance < 10) return false;
      } else {
        const [min, max] = filters.distance.split("-").map(Number);
        if (distance < min || distance >= max) return false;
      }
    }
    return true;
  });
}

// Variables globales pour la recherche et le tri
let currentSearchQuery = '';
let currentSortOption = 'nom-asc';

// Fonction pour afficher les patientes
function renderPatientes(patientes = null) {
  const tableBody = document.querySelector("#patient-table tbody");
  if (!tableBody) return;
  
  // Récupérer les filtres
  const filters = {
    risque: document.querySelector("#risk-filter")?.value || "all",
    localite: document.querySelector("#location-filter")?.value || "all",
    age: document.querySelector("#age-filter")?.value || "all",
    distance: document.querySelector("#distance-filter")?.value || "all"
  };
  
  // Utiliser les patientes fournies ou récupérer depuis le stockage
  let allPatientes = patientes || getPatientes();
  
  // Filtrer par établissement actif si système multi-établissements disponible
  if (window.getCurrentEstablishmentId) {
    const currentEtablissementId = window.getCurrentEstablishmentId();
    if (currentEtablissementId) {
      allPatientes = allPatientes.filter(p => p.etablissementId === currentEtablissementId);
    }
  }
  
  // Appliquer les filtres globaux si disponibles
  if (window.filterPatientesByGlobalFilters) {
    allPatientes = window.filterPatientesByGlobalFilters(allPatientes);
  }
  
  // Appliquer la recherche
  let filteredPatientes = [...allPatientes];
  
  if (currentSearchQuery) {
    const query = currentSearchQuery.toLowerCase();
    filteredPatientes = filteredPatientes.filter(p => {
      const fullName = `${p.prenom || ''} ${p.nom || ''}`.toLowerCase();
      const ville = (p.ville || '').toLowerCase();
      const telephone = (p.telephone || '').toLowerCase();
      return fullName.includes(query) || ville.includes(query) || telephone.includes(query);
    });
  }
  
  // Filtrer avec les filtres existants
  filteredPatientes = filterPatientes(filteredPatientes, filters);
  
  // Appliquer le tri
  filteredPatientes.sort((a, b) => {
    switch (currentSortOption) {
      case 'nom-asc':
        return `${a.prenom || ''} ${a.nom || ''}`.localeCompare(`${b.prenom || ''} ${b.nom || ''}`);
      case 'nom-desc':
        return `${b.prenom || ''} ${b.nom || ''}`.localeCompare(`${a.prenom || ''} ${a.nom || ''}`);
      case 'age-asc':
        return (a.age || 0) - (b.age || 0);
      case 'age-desc':
        return (b.age || 0) - (a.age || 0);
      case 'distance-asc':
        return (a.distance_centre || 0) - (b.distance_centre || 0);
      case 'distance-desc':
        return (b.distance_centre || 0) - (a.distance_centre || 0);
      case 'risque':
        const riskOrder = { 'élevé': 3, 'moyen': 2, 'faible': 1 };
        return (riskOrder[b.risque] || 0) - (riskOrder[a.risque] || 0);
      case 'derniere-venue':
        const dateA = a.derniere_venue ? new Date(a.derniere_venue) : new Date(0);
        const dateB = b.derniere_venue ? new Date(b.derniere_venue) : new Date(0);
        return dateB - dateA;
      default:
        return b.id - a.id; // Par défaut, trier par ID décroissant
    }
  });
  
  // Mettre à jour le compteur de résultats
  const resultsCount = document.querySelector('#search-results-count');
  if (resultsCount) {
    if (currentSearchQuery) {
      resultsCount.textContent = `${filteredPatientes.length} résultat(s) trouvé(s)`;
      resultsCount.style.display = 'block';
    } else {
      resultsCount.style.display = 'none';
    }
  }
  
  // Vider le tableau
  tableBody.innerHTML = "";
  
  if (filteredPatientes.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align: center; padding: 2rem; color: #6b7280;">
          Aucune patiente trouvée avec ces filtres
        </td>
      </tr>
    `;
    return;
  }
  
  // Mettre à jour le filtre de localité
  const locationFilter = document.querySelector("#location-filter");
  if (locationFilter) {
    const villes = [...new Set(allPatientes.map(p => p.ville).filter(Boolean))].sort();
    const currentValue = locationFilter.value;
    locationFilter.innerHTML = '<option value="all">Toutes</option>' + 
      villes.map(v => `<option value="${v}">${v}</option>`).join("");
    if (currentValue && villes.includes(currentValue)) {
      locationFilter.value = currentValue;
    }
  }
  
  // Afficher les patientes
  filteredPatientes.forEach(patiente => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${patiente.prenom || ""} ${patiente.nom || ""}</td>
      <td>${patiente.age || "–"}</td>
      <td>${patiente.distance_centre ? `${patiente.distance_centre.toFixed(1)} km` : "–"}</td>
      <td>${getRiskBadge(patiente.risque)}</td>
      <td>${formatDate(patiente.derniere_venue)}</td>
      <td>${formatDate(patiente.prochaine_cpn)}</td>
      <td>
        <div class="action-buttons">
          <button class="action-btn call-btn" onclick="handleCall('${patiente.telephone || ""}')" title="Appeler" style="background: #3b82f6; color: white;" ${!patiente.telephone ? 'disabled' : ''}>
            ${window.getIcon ? window.getIcon('phone', 20) : '📞'}
          </button>
          <button class="action-btn message-btn" onclick="handleOpenMessages(${patiente.id})" title="Messagerie" style="background: #10b981; color: white; position: relative;">
            ${window.getIcon ? window.getIcon('message', 20) : '💬'}
            ${(() => {
              const unread = getUnreadMessagesCountForPatiente(patiente.id);
              return unread > 0 ? `<span style="position: absolute; top: -5px; right: -5px; background: #ef4444; color: white; border-radius: 50%; width: 18px; height: 18px; display: flex; align-items: center; justify-content: center; font-size: 0.7rem; font-weight: 600; z-index: 10;">${unread > 99 ? '99+' : unread}</span>` : '';
            })()}
          </button>
          <button class="action-btn edit-btn" onclick="handleEditPatiente(${patiente.id})" title="Modifier" style="background: #f59e0b; color: white;">
            ${window.getIcon ? window.getIcon('edit', 20) : '✏️'}
          </button>
          <button class="action-btn view-btn" onclick="handleViewPatiente(${patiente.id})" title="Voir dossier" style="background: #8b5cf6; color: white;">
            ${window.getIcon ? window.getIcon('view', 20) : '👁️'}
          </button>
          <button class="action-btn delete-btn" onclick="handleDeletePatiente(${patiente.id}, '${(patiente.prenom || '') + ' ' + (patiente.nom || '')}')" title="Supprimer" style="background: #ef4444; color: white;">
            ${window.getIcon ? window.getIcon('delete', 20) : '🗑️'}
          </button>
        </div>
      </td>
    `;
    tableBody.appendChild(row);
  });
}

// Fonctions d'action
window.handleCall = function(telephone) {
  if (!telephone || telephone.trim() === "") {
    if (window.toast) {
      window.toast.warning("Numéro de téléphone non disponible pour cette patiente.");
    } else {
      alert("Numéro de téléphone non disponible pour cette patiente.");
    }
    return;
  }
  const cleanPhone = telephone.trim().replace(/\s+/g, "");
  if (!/^\+?[0-9]{8,15}$/.test(cleanPhone)) {
    if (window.toast) {
      window.toast.error(`Numéro de téléphone invalide: ${telephone}`);
    } else {
      alert(`Numéro de téléphone invalide: ${telephone}`);
    }
    return;
  }
  window.location.href = `tel:${cleanPhone}`;
};

window.handleEditPatiente = function(patienteId) {
  const patientes = getPatientes();
  const patiente = patientes.find(p => p.id === patienteId);
  if (!patiente) {
    if (window.toast) {
      window.toast.error("Patiente introuvable");
    } else {
      alert("Patiente introuvable");
    }
    return;
  }
  
  // Ouvrir le modal et préremplir
  if (window.openAddPatienteModal) {
    window.openAddPatienteModal();
    setTimeout(() => {
      const form = document.querySelector("#add-patiente-form");
      if (form) {
      const idInput = document.querySelector("#patiente-id");
      const nomInput = document.querySelector("#patiente-nom");
      const prenomInput = document.querySelector("#patiente-prenom");
      const ageInput = document.querySelector("#patiente-age");
      const paysInput = document.querySelector("#patiente-pays");
      const villeInput = document.querySelector("#patiente-ville");
      const centreSanteInput = document.querySelector("#patiente-centre-sante");
      const periodeInput = document.querySelector("#patiente-periode");
      const distanceInput = document.querySelector("#patiente-distance");
      const telephoneInput = document.querySelector("#patiente-telephone");
      
      if (idInput) {
        idInput.value = patiente.id || "";
        idInput.disabled = true;
        idInput.style.opacity = "0.6";
        idInput.required = false; // Pas obligatoire en modification car déjà existant
      }
      if (nomInput) nomInput.value = patiente.nom || "";
      if (prenomInput) prenomInput.value = patiente.prenom || "";
      if (ageInput) ageInput.value = patiente.age || "";
      if (paysInput && patiente.pays) {
        paysInput.value = patiente.pays;
        // Mettre à jour les villes selon le pays
        if (window.updateCitiesDropdown) {
          updateCitiesDropdown(patiente.pays);
        }
      }
      if (villeInput) {
        villeInput.value = patiente.ville || "";
        // Mettre à jour les centres de santé selon la ville et le pays
        if (window.updateHealthCentersDropdown) {
          const pays = paysInput ? paysInput.value : patiente.pays;
          updateHealthCentersDropdown(patiente.ville, pays);
        }
      }
      if (centreSanteInput) centreSanteInput.value = patiente.centre_sante || "";
      if (periodeInput) periodeInput.value = patiente.periode || "month";
      if (distanceInput) distanceInput.value = patiente.distance_centre || "";
      if (telephoneInput) {
        telephoneInput.value = patiente.telephone || "";
        telephoneInput.disabled = true;
        telephoneInput.style.opacity = "0.6";
      }
        
        const modalTitle = document.querySelector("#add-patiente-modal h2");
        if (modalTitle) modalTitle.textContent = "Modifier une patiente";
        
        form.dataset.editPatienteId = patienteId;
      }
    }, 100);
  }
};

window.handleViewPatiente = function(patienteId) {
  const patientes = getPatientes();
  const patiente = patientes.find(p => p.id === patienteId);
  if (patiente) {
    const info = `Dossier de ${patiente.prenom} ${patiente.nom}\n\nÂge: ${patiente.age} ans\nVille: ${patiente.ville}\nDistance: ${patiente.distance_centre} km\nRisque: ${patiente.risque}`;
    if (window.toast) {
      window.toast.info(info, 5000);
    } else {
      alert(info);
    }
  }
};

// Fonction pour obtenir le nombre de messages non lus pour une patiente spécifique
function getUnreadMessagesCountForPatiente(patienteId) {
  try {
    const messages = JSON.parse(localStorage.getItem('mama_messages') || '[]');
    const currentProfessionnelId = getCurrentProfessionnelId();
    
    if (!currentProfessionnelId) return 0;
    
    return messages.filter(msg =>
      msg.from === 'patiente' &&
      msg.fromId === patienteId &&
      msg.to === 'professionnel' &&
      !msg.read
    ).length;
  } catch (error) {
    return 0;
  }
}

// Fonction pour obtenir l'ID du professionnel actuel
function getCurrentProfessionnelId() {
  try {
    const professionnels = JSON.parse(localStorage.getItem('mama_establishment_professionnels') || '[]');
    const currentUser = window.auth ? window.auth.getCurrentUser() : null;
    const currentUserPhone = currentUser ? (currentUser.phone || currentUser.telephone) : null;
    
    if (!currentUserPhone) {
      const userStr = localStorage.getItem('mama_current_user');
      if (userStr) {
        const user = JSON.parse(userStr);
        const phone = user.phone || user.telephone;
        const professionnel = professionnels.find(p => p.telephone === phone);
        return professionnel ? professionnel.id : null;
      }
      return null;
    }
    
    const professionnel = professionnels.find(p => p.telephone === currentUserPhone);
    return professionnel ? professionnel.id : null;
  } catch (error) {
    return null;
  }
}

// Fonction pour ouvrir la messagerie avec une patiente spécifique
window.handleOpenMessages = function(patienteId) {
  // Sauvegarder l'ID de la patiente dans localStorage pour que la page de messagerie l'utilise
  localStorage.setItem('mama_open_conversation_with', patienteId);
  // Rediriger vers la page de messagerie
  window.location.href = 'messages.html';
};

// Fonction pour ouvrir le modal d'ajout de consultation

window.handleAddConsultation = function(patienteId) {
  const modal = document.querySelector("#add-consultation-modal");
  const form = document.querySelector("#add-consultation-form");
  const patienteIdInput = document.querySelector("#consultation-patiente-id");
  const consultationMessage = document.querySelector("#consultation-message");
  
  if (!modal || !form || !patienteIdInput) return;
  
  const patientes = getPatientes();
  const patiente = patientes.find(p => p.id === patienteId);
  
  if (!patiente) {
    if (window.toast) {
      window.toast.error("Patiente introuvable");
    } else {
      alert("Patiente introuvable");
    }
    return;
  }
  
  // Préremplir le formulaire
  patienteIdInput.value = patienteId;
  form.reset();
  patienteIdInput.value = patienteId; // Réinitialiser après reset
  
  // Définir la date/heure par défaut (maintenant)
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  const dateTimeLocal = now.toISOString().slice(0, 16);
  const dateInput = document.querySelector("#consultation-date");
  if (dateInput) {
    dateInput.value = dateTimeLocal;
  }
  
  // Réinitialiser le message
  if (consultationMessage) {
    consultationMessage.textContent = "";
    consultationMessage.className = "message";
  }
  
  // Afficher le modal
  modal.classList.remove("hidden");
  
  // Mettre à jour le titre avec le nom de la patiente
  const modalTitle = modal.querySelector("h2");
  if (modalTitle) {
    modalTitle.textContent = `Ajouter une consultation / Rendez-vous - ${patiente.prenom || ''} ${patiente.nom || ''}`.trim();
  }
};

// Fonction pour fermer le modal de consultation
window.closeConsultationModal = function() {
  const modal = document.querySelector("#add-consultation-modal");
  if (modal) {
    modal.classList.add("hidden");
    const form = document.querySelector("#add-consultation-form");
    if (form) {
      form.reset();
    }
    const consultationMessage = document.querySelector("#consultation-message");
    if (consultationMessage) {
      consultationMessage.textContent = "";
      consultationMessage.className = "message";
    }
  }
};

// Fonction pour gérer la soumission du formulaire de consultation
window.handleConsultationSubmit = function(event) {
  event.preventDefault();
  
  const form = event.target;
  const consultationMessage = document.querySelector("#consultation-message");
  const patienteIdInput = document.querySelector("#consultation-patiente-id");
  
  if (!patienteIdInput || !patienteIdInput.value) {
    if (consultationMessage) {
      consultationMessage.textContent = "Erreur : ID patiente manquant";
      consultationMessage.className = "message error";
    }
    return;
  }
  
  const patienteId = parseInt(patienteIdInput.value);
  const patientes = getPatientes();
  const patiente = patientes.find(p => p.id === patienteId);
  
  if (!patiente) {
    if (consultationMessage) {
      consultationMessage.textContent = "Patiente introuvable";
      consultationMessage.className = "message error";
    }
    return;
  }
  
  // Récupérer les données du formulaire
  const consultationData = {
    id: Date.now(), // ID unique basé sur le timestamp
    patiente_id: patienteId,
    type: document.querySelector("#consultation-type")?.value || "consultation",
    date_consultation: document.querySelector("#consultation-date")?.value || new Date().toISOString(),
    lieu: document.querySelector("#consultation-lieu")?.value || null,
    poids: parseFloat(document.querySelector("#consultation-poids")?.value) || null,
    temperature: parseFloat(document.querySelector("#consultation-temperature")?.value) || null,
    tension_arterielle_systolique: parseInt(document.querySelector("#consultation-tas")?.value) || null,
    tension_arterielle_diastolique: parseInt(document.querySelector("#consultation-tad")?.value) || null,
    hauteur_uterine: parseFloat(document.querySelector("#consultation-hauteur-uterine")?.value) || null,
    frequence_cardiaque_foetale: parseInt(document.querySelector("#consultation-fcf")?.value) || null,
    examen_urinaire: document.querySelector("#consultation-examen-urinaire")?.value.trim() || null,
    examen_sanguin: document.querySelector("#consultation-examen-sanguin")?.value.trim() || null,
    echographie: document.querySelector("#consultation-echographie")?.value.trim() || null,
    diagnostic: document.querySelector("#consultation-diagnostic")?.value.trim() || null,
    traitement: document.querySelector("#consultation-traitement")?.value.trim() || null,
    recommandations: document.querySelector("#consultation-recommandations")?.value.trim() || null,
    notes: document.querySelector("#consultation-notes")?.value.trim() || null,
    created_at: new Date().toISOString(),
    data_source: "validated_by_professional"
  };
  
  // Validation minimale
  if (!consultationData.date_consultation) {
    if (consultationMessage) {
      consultationMessage.textContent = "La date et l'heure sont obligatoires";
      consultationMessage.className = "message error";
    }
    return;
  }
  
  try {
    // Ajouter la consultation à la liste des consultations de la patiente
    if (!patiente.consultations) {
      patiente.consultations = [];
    }
    patiente.consultations.push(consultationData);
    
    // Mettre à jour la dernière venue
    const consultationDate = new Date(consultationData.date_consultation);
    patiente.derniere_venue = consultationDate.toISOString().split('T')[0];
    
    // Sauvegarder
    updatePatiente(patienteId, patiente);
    
    if (consultationMessage) {
      consultationMessage.textContent = "Consultation enregistrée avec succès !";
      consultationMessage.className = "message success";
    }
    
    if (window.toast) {
      window.toast.success(`Consultation enregistrée pour ${patiente.prenom || ''} ${patiente.nom || ''}`);
    }
    
    // Fermer le modal après 1.5 secondes
    setTimeout(() => {
      window.closeConsultationModal();
      renderPatientes(); // Rafraîchir la liste
    }, 1500);
    
  } catch (error) {
    console.error("Erreur lors de l'enregistrement de la consultation:", error);
    if (consultationMessage) {
      consultationMessage.textContent = "Erreur lors de l'enregistrement : " + error.message;
      consultationMessage.className = "message error";
    }
  }
};

window.handleDeletePatiente = async function(patienteId, patienteName) {
  const confirmed = window.confirmAction 
    ? await window.confirmAction(
        `Êtes-vous sûr de vouloir supprimer ${patienteName} ?\n\nCette action est irréversible.`,
        'Supprimer une patiente',
        { danger: true, confirmText: 'Supprimer', cancelText: 'Annuler' }
      )
    : confirm(`Êtes-vous sûr de vouloir supprimer ${patienteName} ?\n\nCette action est irréversible.`);
  
  if (confirmed) {
    if (deletePatiente(patienteId)) {
      if (window.toast) {
        window.toast.success(`Patiente ${patienteName} supprimée avec succès.`);
      } else {
        alert(`Patiente ${patienteName} supprimée avec succès.`);
      }
      renderPatientes();
    } else {
      if (window.toast) {
        window.toast.error("Erreur lors de la suppression");
      } else {
        alert("Erreur lors de la suppression");
      }
    }
  }
};

// Fonction pour mettre à jour le dropdown des centres de santé selon la ville et le pays
function updateHealthCentersDropdown(ville, pays = null) {
  const centreSanteSelect = document.querySelector("#patiente-centre-sante");
  if (!centreSanteSelect) return;
  
  // Vider les options existantes sauf la première
  centreSanteSelect.innerHTML = '<option value="">Choisir un centre de santé...</option>';
  
  if (!ville || !window.getHealthCentersByCity) {
    return;
  }
  
  // Si le pays n'est pas fourni, essayer de le récupérer depuis le formulaire
  if (!pays) {
    const paysSelect = document.querySelector("#patiente-pays");
    if (paysSelect) {
      pays = paysSelect.value;
    }
  }
  
  const centers = window.getHealthCentersByCity(ville, pays);
  if (centers && centers.length > 0) {
    centers.forEach(centre => {
      const option = document.createElement('option');
      option.value = centre;
      option.textContent = centre;
      centreSanteSelect.appendChild(option);
    });
  } else {
    // Si aucun centre trouvé, permettre la saisie manuelle
    const option = document.createElement('option');
    option.value = "";
    option.textContent = "Aucun centre disponible - Saisir manuellement";
    centreSanteSelect.appendChild(option);
  }
}

// Fonction pour mettre à jour les villes selon le pays sélectionné
function updateCitiesDropdown(pays) {
  const villeSelect = document.querySelector("#patiente-ville");
  if (!villeSelect || !window.getCitiesByCountry) return;
  
  // Vider les options existantes sauf la première
  villeSelect.innerHTML = '<option value="">Choisir une ville...</option>';
  
  if (!pays) {
    return;
  }
  
  const villes = window.getCitiesByCountry(pays);
  if (villes && villes.length > 0) {
    villes.forEach(ville => {
      const option = document.createElement('option');
      option.value = ville;
      option.textContent = ville;
      villeSelect.appendChild(option);
    });
  }
}

// Exposer les fonctions globalement
window.updateHealthCentersDropdown = updateHealthCentersDropdown;
window.updateCitiesDropdown = updateCitiesDropdown;

// Fonction pour gérer l'ajout/modification
window.handleAddPatienteSubmit = function(event) {
  event.preventDefault();
  
  const form = event.target;
  const editId = form.dataset.editPatienteId;
  
  // Récupérer l'ID du patient
  const patienteIdInput = document.querySelector("#patiente-id");
  const patienteId = patienteIdInput ? parseInt(patienteIdInput.value) : null;
  
  // Vérifier que l'ID est fourni (sauf en mode modification)
  if (!editId && (!patienteId || patienteId <= 0)) {
    if (window.toast) {
      window.toast.warning("L'ID du patient est obligatoire. Veuillez saisir un ID valide.");
    } else {
      alert("L'ID du patient est obligatoire. Veuillez saisir un ID valide.");
    }
    if (patienteIdInput) {
      patienteIdInput.focus();
    }
    return;
  }
  
  // Récupérer les données du formulaire
  const datePremiereCPN = document.querySelector("#patiente-premiere-cpn")?.value;
  const semaineGrossesse = parseInt(document.querySelector("#patiente-semaine-grossesse")?.value) || null;
  const nombreCPN = parseInt(document.querySelector("#patiente-nombre-cpn")?.value) || 4;
  const proReferent = document.querySelector("#patiente-pro-referent")?.value || "";

  const formData = {
    id: editId ? parseInt(editId) : patienteId, // Utiliser l'ID existant en modification, nouveau ID en ajout
    prenom: document.querySelector("#patiente-prenom")?.value || "",
    nom: document.querySelector("#patiente-nom")?.value || "",
    age: parseInt(document.querySelector("#patiente-age")?.value) || 0,
    pays: document.querySelector("#patiente-pays")?.value || "",
    ville: document.querySelector("#patiente-ville")?.value || "",
    centre_sante: document.querySelector("#patiente-centre-sante")?.value || "",
    periode: document.querySelector("#patiente-periode")?.value || "month",
    distance_centre: parseFloat(document.querySelector("#patiente-distance")?.value) || 0,
    telephone: document.querySelector("#patiente-telephone")?.value || "",
    niveau_instruction: document.querySelector("#patiente-niveau-instruction")?.value || "",
    moyen_transport: document.querySelector("#patiente-transport")?.value || "",
    pro_referent: proReferent,
    // Données pour génération CPN
    date_premiere_cpn: datePremiereCPN,
    semaine_grossesse: semaineGrossesse,
    nombre_cpn: nombreCPN,
    // Source des données : validées par professionnel
    data_source: "validated_by_professional"
  };
  
  // Générer les CPN si les données sont fournies
  let cpnList = [];
  if (datePremiereCPN && semaineGrossesse && window.generateCPNCalendar) {
    cpnList = window.generateCPNCalendar(datePremiereCPN, semaineGrossesse, nombreCPN);
    formData.cpn_list = cpnList;
    
    // Calculer la prochaine CPN (première CPN future)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const futureCPN = cpnList.find(cpn => {
      const cpnDate = new Date(cpn.date_rdv);
      cpnDate.setHours(0, 0, 0, 0);
      return cpnDate >= today;
    });
    
    if (futureCPN) {
      formData.prochaine_cpn = futureCPN.date_rdv.split('T')[0];
    } else if (cpnList.length > 0) {
      // Si toutes les CPN sont passées, prendre la dernière
      const lastCPN = cpnList[cpnList.length - 1];
      formData.prochaine_cpn = lastCPN.date_rdv.split('T')[0];
    }
  }
  
  try {
    if (editId) {
      // Modification
      updatePatiente(parseInt(editId), formData);
      if (window.toast) {
        window.toast.success("Patiente modifiée avec succès !");
      } else {
        alert("Patiente modifiée avec succès !");
      }
    } else {
      // Ajout
      addPatiente(formData);
      if (window.toast) {
        window.toast.success("Patiente ajoutée avec succès !");
      } else {
        alert("Patiente ajoutée avec succès !");
      }
    }
  } catch (error) {
    if (window.toast) {
      window.toast.error("Erreur : " + error.message);
    } else {
      alert("Erreur : " + error.message);
    }
    return;
  }
  
  // Fermer le modal
  const modal = document.querySelector("#add-patiente-modal");
  if (modal) modal.classList.add("hidden");
  
  // Réinitialiser le formulaire
  form.reset();
  delete form.dataset.editPatienteId;
  
  // Réactiver le champ téléphone si désactivé
  const telephoneInput = document.querySelector("#patiente-telephone");
  if (telephoneInput) {
    telephoneInput.disabled = false;
    telephoneInput.style.opacity = "1";
  }
  
  // Réactiver le champ ID si désactivé
  const idInput = document.querySelector("#patiente-id");
  if (idInput) {
    idInput.disabled = false;
    idInput.style.opacity = "1";
    idInput.required = true;
  }
  
  // Recharger la liste
  renderPatientes();
};

// Fonction pour ouvrir le modal
window.openAddPatienteModal = function() {
  const modal = document.querySelector("#add-patiente-modal");
  if (modal) {
    modal.classList.remove("hidden");
    const form = document.querySelector("#add-patiente-form");
    if (form) {
      form.reset();
      delete form.dataset.editPatienteId;
      const modalTitle = document.querySelector("#add-patiente-modal h2");
      if (modalTitle) modalTitle.textContent = "Ajouter une patiente";
      
      // 🔄 SYNCHRONISATION : Préremplir automatiquement le centre de santé avec l'établissement du professionnel
      const etablissementInfo = getProfessionnelEtablissementInfo();
      if (etablissementInfo.centre_sante) {
        const centreSanteInput = document.querySelector("#patiente-centre-sante");
        if (centreSanteInput) {
          // Si c'est un select, chercher l'option correspondante ou l'ajouter
          if (centreSanteInput.tagName === 'SELECT') {
            // Chercher si l'option existe déjà
            const existingOption = Array.from(centreSanteInput.options).find(
              opt => opt.value.toLowerCase() === etablissementInfo.centre_sante.toLowerCase()
            );
            if (existingOption) {
              centreSanteInput.value = existingOption.value;
            } else {
              // Ajouter l'option si elle n'existe pas
              const option = document.createElement('option');
              option.value = etablissementInfo.centre_sante;
              option.textContent = etablissementInfo.centre_sante;
              option.selected = true;
              centreSanteInput.appendChild(option);
            }
          } else {
            // Si c'est un input text
            centreSanteInput.value = etablissementInfo.centre_sante;
          }
        }
      }
      
      // Réactiver le champ téléphone
      const telephoneInput = document.querySelector("#patiente-telephone");
      if (telephoneInput) {
        telephoneInput.disabled = false;
        telephoneInput.style.opacity = "1";
      }
      
      // Réactiver le champ ID
      const idInput = document.querySelector("#patiente-id");
      if (idInput) {
        idInput.disabled = false;
        idInput.style.opacity = "1";
        idInput.required = true;
      }
    }
  }
};

// Fonction pour fermer le modal
window.closeAddPatienteModal = function() {
  const modal = document.querySelector("#add-patiente-modal");
  if (modal) {
    modal.classList.add("hidden");
    const form = document.querySelector("#add-patiente-form");
    if (form) {
      form.reset();
      delete form.dataset.editPatienteId;
      
      // Réactiver le champ téléphone
      const telephoneInput = document.querySelector("#patiente-telephone");
      if (telephoneInput) {
        telephoneInput.disabled = false;
        telephoneInput.style.opacity = "1";
      }
      
      // Réactiver le champ ID
      const idInput = document.querySelector("#patiente-id");
      if (idInput) {
        idInput.disabled = false;
        idInput.style.opacity = "1";
        idInput.required = true;
      }
    }
  }
};

// Fonction pour calculer et afficher les indicateurs de suivi
function calculateDashboardStats() {
  let patientes = getPatientes();
  
  // Filtrer par établissement actif si système multi-établissements disponible
  if (window.getCurrentEstablishmentId) {
    const currentEtablissementId = window.getCurrentEstablishmentId();
    if (currentEtablissementId) {
      patientes = patientes.filter(p => p.etablissementId === currentEtablissementId);
    }
  }
  
  // Appliquer les filtres globaux si disponibles
  if (window.filterPatientesByGlobalFilters) {
    patientes = window.filterPatientesByGlobalFilters(patientes);
  }
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Statistiques de base
  const totalPatientes = patientes.length;
  
  // Patientes par niveau de risque
  const risqueEleve = patientes.filter(p => p.risque === "élevé").length;
  const risqueMoyen = patientes.filter(p => p.risque === "moyen").length;
  const risqueFaible = patientes.filter(p => p.risque === "faible").length;
  
  // CPN en retard (prochaine_cpn est passée)
  let cpnRetard = 0;
  let cpnAujourdhui = 0;
  let jamaisVenue = 0;
  let consultationsAujourdhui = 0;
  
  patientes.forEach(patiente => {
    // Vérifier CPN
    if (patiente.prochaine_cpn) {
      try {
        const cpnDate = new Date(patiente.prochaine_cpn);
        if (!isNaN(cpnDate.getTime())) {
          cpnDate.setHours(0, 0, 0, 0);
          const daysDiff = Math.floor((today - cpnDate) / (1000 * 60 * 60 * 24));
          if (daysDiff > 0) {
            cpnRetard++;
          } else if (daysDiff === 0) {
            cpnAujourdhui++;
          }
        }
      } catch (e) {
        console.warn("Erreur date CPN:", e);
      }
    }
    
    // Vérifier dernière venue
    if (!patiente.derniere_venue) {
      jamaisVenue++;
    } else {
      try {
        const lastVisit = new Date(patiente.derniere_venue);
        if (!isNaN(lastVisit.getTime())) {
          lastVisit.setHours(0, 0, 0, 0);
          if (lastVisit.getTime() === today.getTime()) {
            consultationsAujourdhui++;
          }
        }
      } catch (e) {
        console.warn("Erreur date dernière venue:", e);
      }
    }
  });
  
  // Taux d'observance (approximation basée sur les CPN)
  const patientesAvecCPN = patientes.filter(p => p.prochaine_cpn || p.derniere_venue).length;
  const tauxObservance = totalPatientes > 0 
    ? Math.round((patientesAvecCPN / totalPatientes) * 100) 
    : 0;
  
  // Nouvelles venues (patientes ajoutées dans les 30 derniers jours)
  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(today.getDate() - 30);
  const nouvellesVenues = patientes.filter(p => {
    if (!p.createdAt) return false;
    try {
      const createdDate = new Date(p.createdAt);
      return createdDate >= thirtyDaysAgo;
    } catch (e) {
      return false;
    }
  }).length;
  
  return {
    totalPatientes,
    risqueEleve,
    risqueMoyen,
    risqueFaible,
    cpnRetard,
    cpnAujourdhui,
    jamaisVenue,
    consultationsAujourdhui,
    tauxObservance,
    nouvellesVenues
  };
}

// Fonction pour afficher les indicateurs
function renderDashboardStats() {
  const statsContent = document.querySelector("#dashboard-stats-content");
  if (!statsContent) return;
  
  // Afficher un état de chargement
  statsContent.innerHTML = `
    <div class="loading-state" style="text-align: center; padding: 2rem; color: #6b7280;">
      <p>Chargement des indicateurs...</p>
    </div>
  `;
  
  try {
    const stats = calculateDashboardStats();
    
    statsContent.innerHTML = `
      <div class="stat-card" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 0.5rem; padding: 0.75rem; box-shadow: 0 2px 4px rgba(0,0,0,0.1); min-width: 0;">
        <div class="stat-icon" style="font-size: 1.25rem; margin-bottom: 0.2rem;">${window.getIcon ? window.getIcon('users', 28, '#3b82f6') : '👥'}</div>
        <div class="stat-value" style="font-size: 1.5rem; font-weight: 700; color: white; margin-bottom: 0.1rem;">${stats.totalPatientes}</div>
        <div class="stat-label" style="color: rgba(255,255,255,0.9); font-size: 0.7rem; font-weight: 500; line-height: 1.2;">Total patientes</div>
      </div>
      
      <div class="stat-card" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; border-radius: 0.5rem; padding: 0.75rem; box-shadow: 0 2px 4px rgba(0,0,0,0.1); min-width: 0; position: relative;">
        <div class="stat-icon" style="font-size: 1.25rem; margin-bottom: 0.2rem;">${window.getIcon ? window.getIcon('risk-high', 28, '#ef4444') : '🔴'}</div>
        <div class="stat-value" style="font-size: 1.5rem; font-weight: 700; color: white; margin-bottom: 0.1rem;">${stats.risqueEleve}</div>
        <div class="stat-label" style="color: rgba(255,255,255,0.9); font-size: 0.7rem; font-weight: 500; line-height: 1.2;">Risque élevé</div>
        ${window.getRiskEvolutionData && window.createSparkline ? `
          <div style="position: absolute; bottom: 0.5rem; right: 0.5rem; opacity: 0.7;">
            ${window.createSparkline(window.getRiskEvolutionData(getPatientes()), 60, 20, 'rgba(255,255,255,0.9)')}
          </div>
        ` : ''}
      </div>
      
      <div class="stat-card" style="background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); color: white; border-radius: 0.5rem; padding: 0.75rem; box-shadow: 0 2px 4px rgba(0,0,0,0.1); min-width: 0; position: relative;">
        <div class="stat-icon" style="font-size: 1.25rem; margin-bottom: 0.2rem;">${window.getIcon ? window.getIcon('warning', 28, '#f59e0b') : '⚠️'}</div>
        <div class="stat-value" style="font-size: 1.5rem; font-weight: 700; color: white; margin-bottom: 0.1rem;">${stats.cpnRetard}</div>
        <div class="stat-label" style="color: rgba(255,255,255,0.9); font-size: 0.7rem; font-weight: 500; line-height: 1.2;">CPN en retard</div>
        ${window.getCPNDelayedByMonth && window.createBarChart ? `
          <div style="position: absolute; bottom: 0.5rem; right: 0.5rem; opacity: 0.7;">
            ${window.createBarChart(window.getCPNDelayedByMonth(getPatientes()), 60, 20, 'rgba(255,255,255,0.9)')}
          </div>
        ` : ''}
      </div>
      
      <div class="stat-card" style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); color: white; border-radius: 0.5rem; padding: 0.75rem; box-shadow: 0 2px 4px rgba(0,0,0,0.1); min-width: 0;">
        <div class="stat-icon" style="font-size: 1.25rem; margin-bottom: 0.2rem;">${window.getIcon ? window.getIcon('calendar', 28, '#3b82f6') : '📅'}</div>
        <div class="stat-value" style="font-size: 1.5rem; font-weight: 700; color: white; margin-bottom: 0.1rem;">${stats.cpnAujourdhui}</div>
        <div class="stat-label" style="color: rgba(255,255,255,0.9); font-size: 0.7rem; font-weight: 500; line-height: 1.2;">CPN aujourd'hui</div>
      </div>
      
      <div class="stat-card" style="background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%); color: white; border-radius: 0.5rem; padding: 0.75rem; box-shadow: 0 2px 4px rgba(0,0,0,0.1); min-width: 0;">
        <div class="stat-icon" style="font-size: 1.25rem; margin-bottom: 0.2rem;">${window.getIcon ? window.getIcon('success', 28, '#10b981') : '✅'}</div>
        <div class="stat-value" style="font-size: 1.5rem; font-weight: 700; color: white; margin-bottom: 0.1rem;">${stats.consultationsAujourdhui}</div>
        <div class="stat-label" style="color: rgba(255,255,255,0.9); font-size: 0.7rem; font-weight: 500; line-height: 1.2;">Consultations aujourd'hui</div>
      </div>
      
      <div class="stat-card" style="background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); color: white; border-radius: 0.5rem; padding: 0.75rem; box-shadow: 0 2px 4px rgba(0,0,0,0.1); min-width: 0;">
        <div class="stat-icon" style="font-size: 1.25rem; margin-bottom: 0.2rem;">${window.getIcon ? window.getIcon('error', 28, '#ef4444') : '🚫'}</div>
        <div class="stat-value" style="font-size: 1.5rem; font-weight: 700; color: white; margin-bottom: 0.1rem;">${stats.jamaisVenue}</div>
        <div class="stat-label" style="color: rgba(255,255,255,0.9); font-size: 0.7rem; font-weight: 500; line-height: 1.2;">Jamais venues</div>
      </div>
      
      <div class="stat-card" style="background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%); color: white; border-radius: 0.5rem; padding: 0.75rem; box-shadow: 0 2px 4px rgba(0,0,0,0.1); min-width: 0;">
        <div class="stat-icon" style="font-size: 1.25rem; margin-bottom: 0.2rem;">${window.getIcon ? window.getIcon('stats', 28, '#3b82f6') : '📊'}</div>
        <div class="stat-value" style="font-size: 1.5rem; font-weight: 700; color: white; margin-bottom: 0.1rem;">${stats.tauxObservance}%</div>
        <div class="stat-label" style="color: rgba(255,255,255,0.9); font-size: 0.7rem; font-weight: 500; line-height: 1.2;">Taux d'observance</div>
      </div>
      
      <div class="stat-card" style="background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%); color: white; border-radius: 0.5rem; padding: 0.75rem; box-shadow: 0 2px 4px rgba(0,0,0,0.1); min-width: 0;">
        <div class="stat-icon" style="font-size: 1.25rem; margin-bottom: 0.2rem;">${window.getIcon ? window.getIcon('risk-medium', 28, '#f59e0b') : '🟠'}</div>
        <div class="stat-value" style="font-size: 1.5rem; font-weight: 700; color: white; margin-bottom: 0.1rem;">${stats.risqueMoyen}</div>
        <div class="stat-label" style="color: rgba(255,255,255,0.9); font-size: 0.7rem; font-weight: 500; line-height: 1.2;">Risque modéré</div>
      </div>
      
      <div class="stat-card" style="background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); color: white; border-radius: 0.5rem; padding: 0.75rem; box-shadow: 0 2px 4px rgba(0,0,0,0.1); min-width: 0;">
        <div class="stat-icon" style="font-size: 1.25rem; margin-bottom: 0.2rem;">${window.getIcon ? window.getIcon('user-plus', 28, '#f59e0b') : '👤'}</div>
        <div class="stat-value" style="font-size: 1.5rem; font-weight: 700; color: white; margin-bottom: 0.1rem;">${stats.nouvellesVenues || 0}</div>
        <div class="stat-label" style="color: rgba(255,255,255,0.9); font-size: 0.7rem; font-weight: 500; line-height: 1.2;">Nouvelle venue</div>
      </div>
    `;
  } catch (error) {
    console.error("Erreur lors du calcul des statistiques:", error);
    statsContent.innerHTML = `
      <div class="error-state" style="padding: 2rem; text-align: center; color: #dc2626;">
        <span class="error-icon" style="font-size: 2rem; display: block; margin-bottom: 0.5rem;">${window.getIcon ? window.getIcon('warning', 32, '#f59e0b') : '⚠️'}</span>
        <p>Erreur lors du chargement des indicateurs</p>
        <small style="color: #6b7280; margin-top: 0.5rem; display: block;">${error.message || 'Erreur inconnue'}</small>
      </div>
    `;
  }
}

// Exporter la fonction globalement
window.renderDashboardStats = renderDashboardStats;

// Fonction pour rendre les statistiques détaillées
window.renderStatsPage = function() {
  const statsContent = document.querySelector("#stats-content");
  if (!statsContent) return;
  
  try {
    let patientes = getPatientes();
    
    // Appliquer les filtres globaux si disponibles
    if (window.filterPatientesByGlobalFilters) {
      patientes = window.filterPatientesByGlobalFilters(patientes);
    }
    const stats = calculateDashboardStats();
    const today = new Date();
    
    // Calculs supplémentaires
    const totalPatientes = patientes.length;
    const patientesParVille = {};
    const patientesParAge = { "18-25": 0, "26-30": 0, "31-35": 0, "36+": 0 };
    const patientesParDistance = { "0-2": 0, "2-5": 0, "5-10": 0, "10+": 0 };
    
    patientes.forEach(p => {
      // Par ville
      const ville = p.ville || "Non renseigné";
      patientesParVille[ville] = (patientesParVille[ville] || 0) + 1;
      
      // Par âge
      if (p.age >= 18 && p.age <= 25) patientesParAge["18-25"]++;
      else if (p.age >= 26 && p.age <= 30) patientesParAge["26-30"]++;
      else if (p.age >= 31 && p.age <= 35) patientesParAge["31-35"]++;
      else if (p.age > 35) patientesParAge["36+"]++;
      
      // Par distance
      const dist = p.distance_centre || 0;
      if (dist < 2) patientesParDistance["0-2"]++;
      else if (dist < 5) patientesParDistance["2-5"]++;
      else if (dist < 10) patientesParDistance["5-10"]++;
      else patientesParDistance["10+"]++;
    });
    
    // Taux de venue CPN
    const patientesAvecCPN = patientes.filter(p => p.prochaine_cpn || p.derniere_venue).length;
    const tauxVenueCPN = totalPatientes > 0 ? Math.round((patientesAvecCPN / totalPatientes) * 100) : 0;
    
    // Taux d'alerte (risque élevé + CPN en retard)
    const tauxAlerte = totalPatientes > 0 
      ? Math.round(((stats.risqueEleve + stats.cpnRetard) / totalPatientes) * 100) 
      : 0;
    
    statsContent.innerHTML = `
      <div class="stats-page-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem;">
        <!-- Statistiques principales -->
        <div class="stat-card-large" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 0.75rem; padding: 1.5rem; grid-column: 1 / -1;">
          <h3 style="margin: 0 0 1rem 0; font-size: 1.25rem;">📊 Vue d'ensemble</h3>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1rem;">
            <div>
              <div style="font-size: 2.5rem; font-weight: 700; margin-bottom: 0.25rem;">${stats.totalPatientes}</div>
              <div style="font-size: 0.9rem; opacity: 0.9;">Total patientes</div>
            </div>
            <div>
              <div style="font-size: 2.5rem; font-weight: 700; margin-bottom: 0.25rem;">${stats.risqueEleve}</div>
              <div style="font-size: 0.9rem; opacity: 0.9;">Risque élevé</div>
            </div>
            <div>
              <div style="font-size: 2.5rem; font-weight: 700; margin-bottom: 0.25rem;">${stats.cpnRetard}</div>
              <div style="font-size: 0.9rem; opacity: 0.9;">CPN en retard</div>
            </div>
            <div>
              <div style="font-size: 2.5rem; font-weight: 700; margin-bottom: 0.25rem;">${tauxVenueCPN}%</div>
              <div style="font-size: 0.9rem; opacity: 0.9;">Taux de venue CPN</div>
            </div>
          </div>
        </div>
        
        <!-- Répartition par risque -->
        <div class="stat-card" style="background: white; border: 1px solid #e5e7eb; border-radius: 0.75rem; padding: 1.5rem; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h3 style="margin: 0 0 1rem 0; font-size: 1.1rem; color: #374151;">🎯 Répartition par niveau de risque</h3>
          <div style="margin-bottom: 1rem;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
              <span style="color: #6b7280; font-size: 0.9rem;">Risque élevé</span>
              <span style="font-weight: 600; color: #dc2626;">${stats.risqueEleve}</span>
            </div>
            <div style="background: #fee2e2; border-radius: 0.5rem; height: 8px; overflow: hidden;">
              <div style="background: #dc2626; height: 100%; width: ${totalPatientes > 0 ? (stats.risqueEleve / totalPatientes * 100) : 0}%; transition: width 0.3s ease;"></div>
            </div>
          </div>
          <div style="margin-bottom: 1rem;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
              <span style="color: #6b7280; font-size: 0.9rem;">Risque modéré</span>
              <span style="font-weight: 600; color: #d97706;">${stats.risqueMoyen}</span>
            </div>
            <div style="background: #fef3c7; border-radius: 0.5rem; height: 8px; overflow: hidden;">
              <div style="background: #d97706; height: 100%; width: ${totalPatientes > 0 ? (stats.risqueMoyen / totalPatientes * 100) : 0}%; transition: width 0.3s ease;"></div>
            </div>
          </div>
          <div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
              <span style="color: #6b7280; font-size: 0.9rem;">Risque faible</span>
              <span style="font-weight: 600; color: #059669;">${stats.risqueFaible}</span>
            </div>
            <div style="background: #d1fae5; border-radius: 0.5rem; height: 8px; overflow: hidden;">
              <div style="background: #059669; height: 100%; width: ${totalPatientes > 0 ? (stats.risqueFaible / totalPatientes * 100) : 0}%; transition: width 0.3s ease;"></div>
            </div>
          </div>
        </div>
        
        <!-- Répartition par âge -->
        <div class="stat-card" style="background: white; border: 1px solid #e5e7eb; border-radius: 0.75rem; padding: 1.5rem; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h3 style="margin: 0 0 1rem 0; font-size: 1.1rem; color: #374151;">👤 Répartition par âge</h3>
          ${Object.entries(patientesParAge).map(([age, count]) => `
            <div style="margin-bottom: 1rem;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                <span style="color: #6b7280; font-size: 0.9rem;">${age} ans</span>
                <span style="font-weight: 600; color: #2563eb;">${count}</span>
              </div>
              <div style="background: #eff6ff; border-radius: 0.5rem; height: 8px; overflow: hidden;">
                <div style="background: #2563eb; height: 100%; width: ${totalPatientes > 0 ? (count / totalPatientes * 100) : 0}%; transition: width 0.3s ease;"></div>
              </div>
            </div>
          `).join('')}
        </div>
        
        <!-- Répartition par distance -->
        <div class="stat-card" style="background: white; border: 1px solid #e5e7eb; border-radius: 0.75rem; padding: 1.5rem; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h3 style="margin: 0 0 1rem 0; font-size: 1.1rem; color: #374151;">📍 Distance au centre</h3>
          ${Object.entries(patientesParDistance).map(([dist, count]) => `
            <div style="margin-bottom: 1rem;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                <span style="color: #6b7280; font-size: 0.9rem;">${dist} km</span>
                <span style="font-weight: 600; color: #7c3aed;">${count}</span>
              </div>
              <div style="background: #f3e8ff; border-radius: 0.5rem; height: 8px; overflow: hidden;">
                <div style="background: #7c3aed; height: 100%; width: ${totalPatientes > 0 ? (count / totalPatientes * 100) : 0}%; transition: width 0.3s ease;"></div>
              </div>
            </div>
          `).join('')}
        </div>
        
        <!-- Indicateurs de performance -->
        <div class="stat-card" style="background: white; border: 1px solid #e5e7eb; border-radius: 0.75rem; padding: 1.5rem; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h3 style="margin: 0 0 1rem 0; font-size: 1.1rem; color: #374151;">📈 Indicateurs clés</h3>
          <div style="margin-bottom: 1rem;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
              <span style="color: #6b7280; font-size: 0.9rem;">Taux d'observance</span>
              <span style="font-weight: 600; color: #059669;">${stats.tauxObservance}%</span>
            </div>
            <div style="background: #d1fae5; border-radius: 0.5rem; height: 12px; overflow: hidden;">
              <div style="background: linear-gradient(90deg, #059669, #10b981); height: 100%; width: ${stats.tauxObservance}%; transition: width 0.3s ease;"></div>
            </div>
          </div>
          <div style="margin-bottom: 1rem;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
              <span style="color: #6b7280; font-size: 0.9rem;">Taux d'alerte</span>
              <span style="font-weight: 600; color: ${tauxAlerte > 30 ? '#dc2626' : tauxAlerte > 15 ? '#d97706' : '#059669'};">${tauxAlerte}%</span>
            </div>
            <div style="background: #fee2e2; border-radius: 0.5rem; height: 12px; overflow: hidden;">
              <div style="background: linear-gradient(90deg, ${tauxAlerte > 30 ? '#dc2626' : tauxAlerte > 15 ? '#d97706' : '#059669'}, ${tauxAlerte > 30 ? '#ef4444' : tauxAlerte > 15 ? '#f59e0b' : '#10b981'}); height: 100%; width: ${tauxAlerte}%; transition: width 0.3s ease;"></div>
            </div>
          </div>
          <div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
              <span style="color: #6b7280; font-size: 0.9rem;">Consultations aujourd'hui</span>
              <span style="font-weight: 600; color: #2563eb;">${stats.consultationsAujourdhui}</span>
            </div>
            <div style="background: #eff6ff; border-radius: 0.5rem; height: 12px; overflow: hidden;">
              <div style="background: linear-gradient(90deg, #2563eb, #3b82f6); height: 100%; width: ${totalPatientes > 0 ? (stats.consultationsAujourdhui / totalPatientes * 100) : 0}%; transition: width 0.3s ease;"></div>
            </div>
          </div>
        </div>
        
        <!-- Répartition par ville -->
        <div class="stat-card" style="background: white; border: 1px solid #e5e7eb; border-radius: 0.75rem; padding: 1.5rem; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h3 style="margin: 0 0 1rem 0; font-size: 1.1rem; color: #374151;">🏙️ Répartition par ville</h3>
          ${Object.entries(patientesParVille).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([ville, count]) => `
            <div style="margin-bottom: 0.75rem;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                <span style="color: #6b7280; font-size: 0.9rem;">${ville}</span>
                <span style="font-weight: 600; color: #6366f1;">${count}</span>
              </div>
              <div style="background: #eef2ff; border-radius: 0.5rem; height: 8px; overflow: hidden;">
                <div style="background: #6366f1; height: 100%; width: ${totalPatientes > 0 ? (count / totalPatientes * 100) : 0}%; transition: width 0.3s ease;"></div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  } catch (error) {
    console.error("Erreur lors du calcul des statistiques:", error);
    statsContent.innerHTML = `
      <div class="error-state" style="padding: 2rem; text-align: center; color: #dc2626;">
        <span class="error-icon" style="font-size: 2rem; display: block; margin-bottom: 0.5rem;">${window.getIcon ? window.getIcon('warning', 32, '#f59e0b') : '⚠️'}</span>
        <p>Erreur lors du chargement des statistiques</p>
      </div>
    `;
  }
};

// Fonction pour rendre la page Performance
window.renderPerformancePage = function() {
  const performanceContent = document.querySelector("#performance-content");
  if (!performanceContent) return;
  
  try {
    let patientes = getPatientes();
    
    // Appliquer les filtres globaux si disponibles
    if (window.filterPatientesByGlobalFilters) {
      patientes = window.filterPatientesByGlobalFilters(patientes);
    }
    const stats = calculateDashboardStats();
    const totalPatientes = patientes.length;
    
    // Calcul du taux de venue
    const patientesAvecCPN = patientes.filter(p => p.prochaine_cpn || p.derniere_venue).length;
    const tauxVenue = totalPatientes > 0 ? Math.round((patientesAvecCPN / totalPatientes) * 100) : 0;
    
    // Évolution (simulation - basée sur les données actuelles)
    const evolutionRisque = {
      actuel: stats.risqueEleve,
      prevision: Math.max(0, stats.risqueEleve - 1) // Simulation
    };
    
    // Taux de suivi
    const patientesSuivies = patientes.filter(p => p.derniere_venue).length;
    const tauxSuivi = totalPatientes > 0 ? Math.round((patientesSuivies / totalPatientes) * 100) : 0;
    
    performanceContent.innerHTML = `
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem;">
        <!-- Taux de venue -->
        <div class="performance-card" style="background: white; border: 1px solid #e5e7eb; border-radius: 0.75rem; padding: 1.5rem; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h3 style="margin: 0 0 1rem 0; font-size: 1.1rem; color: #374151;">📅 Taux de venue par mois</h3>
          <div style="margin-bottom: 1rem;">
            <div style="font-size: 3rem; font-weight: 700; color: #2563eb; margin-bottom: 0.5rem; text-align: center;">${tauxVenue}%</div>
            <div style="background: #eff6ff; border-radius: 0.75rem; height: 24px; overflow: hidden; position: relative;">
              <div style="background: linear-gradient(90deg, #2563eb, #3b82f6); height: 100%; width: ${tauxVenue}%; transition: width 0.5s ease; display: flex; align-items: center; justify-content: flex-end; padding-right: 0.5rem;">
                <span style="color: white; font-size: 0.75rem; font-weight: 600;">${tauxVenue}%</span>
              </div>
            </div>
          </div>
          <small style="color: #6b7280; font-size: 0.85rem;">Basé sur les CPN complétées et planifiées</small>
        </div>
        
        <!-- Évolution du risque -->
        <div class="performance-card" style="background: white; border: 1px solid #e5e7eb; border-radius: 0.75rem; padding: 1.5rem; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h3 style="margin: 0 0 1rem 0; font-size: 1.1rem; color: #374151;">📊 Évolution du nombre de patientes à risque élevé</h3>
          <div style="text-align: center; margin-bottom: 1rem;">
            <div style="font-size: 3rem; font-weight: 700; color: #dc2626; margin-bottom: 0.5rem;">${evolutionRisque.actuel}</div>
            <div style="color: #6b7280; font-size: 0.9rem;">Patientes nécessitant une attention particulière</div>
          </div>
          <div style="background: #f3f4f6; border-radius: 0.5rem; padding: 1rem; margin-top: 1rem;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
              <span style="color: #6b7280; font-size: 0.9rem;">Tendance</span>
              <span style="font-weight: 600; color: ${evolutionRisque.actuel >= evolutionRisque.prevision ? '#dc2626' : '#059669'};">${evolutionRisque.actuel >= evolutionRisque.prevision ? '↗️ En hausse' : '↘️ En baisse'}</span>
            </div>
          </div>
        </div>
        
        <!-- Taux de suivi -->
        <div class="performance-card" style="background: white; border: 1px solid #e5e7eb; border-radius: 0.75rem; padding: 1.5rem; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h3 style="margin: 0 0 1rem 0; font-size: 1.1rem; color: #374151;">✅ Taux de suivi</h3>
          <div style="margin-bottom: 1rem;">
            <div style="font-size: 3rem; font-weight: 700; color: #059669; margin-bottom: 0.5rem; text-align: center;">${tauxSuivi}%</div>
            <div style="background: #d1fae5; border-radius: 0.75rem; height: 24px; overflow: hidden; position: relative;">
              <div style="background: linear-gradient(90deg, #059669, #10b981); height: 100%; width: ${tauxSuivi}%; transition: width 0.5s ease; display: flex; align-items: center; justify-content: flex-end; padding-right: 0.5rem;">
                <span style="color: white; font-size: 0.75rem; font-weight: 600;">${tauxSuivi}%</span>
              </div>
            </div>
          </div>
          <small style="color: #6b7280; font-size: 0.85rem;">Patientes ayant effectué au moins une consultation</small>
        </div>
        
        <!-- Résumé des alertes -->
        <div class="performance-card" style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border: 1px solid #fbbf24; border-radius: 0.75rem; padding: 1.5rem; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h3 style="margin: 0 0 1rem 0; font-size: 1.1rem; color: #92400e;">⚠️ Alertes prioritaires</h3>
          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem;">
            <div>
              <div style="font-size: 2rem; font-weight: 700; color: #dc2626; margin-bottom: 0.25rem;">${stats.cpnRetard}</div>
              <div style="color: #78350f; font-size: 0.85rem;">CPN en retard</div>
            </div>
            <div>
              <div style="font-size: 2rem; font-weight: 700; color: #dc2626; margin-bottom: 0.25rem;">${stats.jamaisVenue}</div>
              <div style="color: #78350f; font-size: 0.85rem;">Jamais venues</div>
            </div>
          </div>
        </div>
        
        <!-- Actions -->
        <div class="performance-card" style="background: white; border: 1px solid #e5e7eb; border-radius: 0.75rem; padding: 1.5rem; box-shadow: 0 2px 4px rgba(0,0,0,0.1); grid-column: 1 / -1;">
          <h3 style="margin: 0 0 1rem 0; font-size: 1.1rem; color: #374151;">📥 Export des données</h3>
          <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
            <button class="btn-secondary" onclick="if(window.exportReport) window.exportReport('csv')" style="padding: 0.75rem 1.5rem; background: #2563eb; color: white; border: none; border-radius: 0.5rem; cursor: pointer; font-weight: 500; transition: background 0.2s;">
              📄 Exporter CSV
            </button>
            <button class="btn-secondary" onclick="alert('Fonctionnalité à venir')" style="padding: 0.75rem 1.5rem; background: #059669; color: white; border: none; border-radius: 0.5rem; cursor: pointer; font-weight: 500; transition: background 0.2s;">
              📊 Exporter Excel
            </button>
            <button class="btn-secondary" onclick="alert('Fonctionnalité à venir')" style="padding: 0.75rem 1.5rem; background: #dc2626; color: white; border: none; border-radius: 0.5rem; cursor: pointer; font-weight: 500; transition: background 0.2s;">
              📑 Exporter PDF
            </button>
          </div>
        </div>
      </div>
    `;
  } catch (error) {
    console.error("Erreur lors du calcul de la performance:", error);
    performanceContent.innerHTML = `
      <div class="error-state" style="padding: 2rem; text-align: center; color: #dc2626;">
        <span class="error-icon" style="font-size: 2rem; display: block; margin-bottom: 0.5rem;">${window.getIcon ? window.getIcon('warning', 32, '#f59e0b') : '⚠️'}</span>
        <p>Erreur lors du chargement des statistiques de performance</p>
      </div>
    `;
  }
};

// Fonction pour réinitialiser les filtres
window.resetAllFilters = function() {
  const riskFilter = document.querySelector("#risk-filter");
  const locationFilter = document.querySelector("#location-filter");
  const ageFilter = document.querySelector("#age-filter");
  const distanceFilter = document.querySelector("#distance-filter");
  
  if (riskFilter) riskFilter.value = "all";
  if (locationFilter) locationFilter.value = "all";
  if (ageFilter) ageFilter.value = "all";
  if (distanceFilter) distanceFilter.value = "all";
  
  renderPatientes();
};

// Fonction pour gérer les changements de filtres
window.handleFilterChange = function() {
  renderPatientes();
};

// Fonction pour exporter
window.exportReport = function(format) {
  const patientes = getPatientes();
  if (patientes.length === 0) {
    if (window.toast) {
      window.toast.warning("Aucune patiente à exporter");
    } else {
      alert("Aucune patiente à exporter");
    }
    return;
  }
  
  let csv = "Nom,Âge,Distance,Risque,Dernière venue,Prochaine CPN\n";
  patientes.forEach(p => {
    csv += `"${p.prenom} ${p.nom}",${p.age},${p.distance_centre || 0} km,"${p.risque}","${formatDate(p.derniere_venue)}","${formatDate(p.prochaine_cpn)}"\n`;
  });
  
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", `patientes_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  if (window.toast) {
    window.toast.success(`Export réussi ! ${patientes.length} patiente(s) exportée(s) en CSV.`);
  } else {
    alert(`Export réussi ! ${patientes.length} patiente(s) exportée(s) en CSV.`);
  }
};

// Initialisation au chargement de la page
document.addEventListener("DOMContentLoaded", () => {
  // Afficher l'alerte critique
  if (window.renderCriticalAlert) {
    window.renderCriticalAlert(getPatientes());
  }
  
  // Initialiser les filtres globaux du tableau de bord
  if (window.initGlobalFilters) {
    window.initGlobalFilters(getPatientes());
  }
  
  // Afficher les indicateurs de suivi (si on est sur le tableau de bord)
  renderDashboardStats();
  
  // Afficher les patientes (si on est sur la page mes-patientes)
  if (document.querySelector("#patient-table")) {
    renderPatientes();
  }
  
  // Initialiser l'icône de recherche
  const searchIconPlaceholder = document.querySelector("#search-icon-placeholder");
  if (searchIconPlaceholder && window.getIcon) {
    searchIconPlaceholder.innerHTML = window.getIcon('search', 20, '#6b7280');
  }
  
  // Initialiser le badge de messages non lus
  if (window.initMessagesBadge) {
    window.initMessagesBadge();
  }
  
  // Gestionnaire de recherche en temps réel
  const searchInput = document.querySelector("#search-input");
  if (searchInput) {
    const debouncedSearch = window.debounce ? window.debounce((e) => {
      currentSearchQuery = e.target.value.trim();
      renderPatientes();
    }, 300) : ((e) => {
      currentSearchQuery = e.target.value.trim();
      renderPatientes();
    });
    searchInput.addEventListener("input", debouncedSearch);
  }
  
  // Gestionnaire de tri
  const sortSelect = document.querySelector("#sort-select");
  if (sortSelect) {
    sortSelect.addEventListener("change", (e) => {
      currentSortOption = e.target.value;
      renderPatientes();
    });
  }
  
  // Configurer les event listeners pour les filtres
  const filters = ["risk-filter", "location-filter", "age-filter", "distance-filter"];
  filters.forEach(filterId => {
    const filter = document.querySelector(`#${filterId}`);
    if (filter) {
      filter.addEventListener("change", handleFilterChange);
    }
  });
  
  // Configurer le bouton d'ajout
  const addBtn = document.querySelector("#add-patiente-btn-section");
  if (addBtn) {
    addBtn.onclick = openAddPatienteModal;
  }
  
  // Configurer le bouton de réinitialisation
  const resetBtn = document.querySelector("#reset-filters-btn");
  if (resetBtn) {
    resetBtn.onclick = resetAllFilters;
  }
  
  // Configurer le bouton d'export
  const exportBtn = document.querySelector("#export-btn");
  if (exportBtn) {
    exportBtn.onclick = () => exportReport("csv");
  }
  
  // Configurer le formulaire
  const form = document.querySelector("#add-patiente-form");
  if (form) {
    form.addEventListener("submit", handleAddPatienteSubmit);
  }
  
  // Gérer le changement de pays pour mettre à jour les villes
  const paysSelect = document.querySelector("#patiente-pays");
  if (paysSelect && window.getCitiesByCountry) {
    // Initialiser les villes si un pays est déjà sélectionné (par défaut)
    if (paysSelect.value) {
      updateCitiesDropdown(paysSelect.value);
    }
    
    paysSelect.addEventListener("change", (e) => {
      const selectedPays = e.target.value;
      updateCitiesDropdown(selectedPays);
      // Réinitialiser le centre de santé
      const centreSanteSelect = document.querySelector("#patiente-centre-sante");
      if (centreSanteSelect) {
        centreSanteSelect.innerHTML = '<option value="">Choisir un centre de santé...</option>';
      }
    });
  }
  
  // Gérer le changement de ville pour mettre à jour les centres de santé
  const villeSelect = document.querySelector("#patiente-ville");
  if (villeSelect && window.getHealthCentersByCity) {
    villeSelect.addEventListener("change", (e) => {
      const selectedVille = e.target.value;
      const selectedPays = paysSelect ? paysSelect.value : null;
      updateHealthCentersDropdown(selectedVille, selectedPays);
    });
  }
  
  // Configurer le bouton de fermeture du modal
  const closeBtn = document.querySelector("#close-modal-btn, #cancel-patiente-btn");
  if (closeBtn) {
    closeBtn.onclick = closeAddPatienteModal;
  }
  
  // Rafraîchir les indicateurs toutes les 30 secondes
  if (document.querySelector("#dashboard-stats-content")) {
    setInterval(() => {
      renderDashboardStats();
    }, 30000);
  }
  
  // Afficher le nom d'utilisateur si disponible
  const userName = document.getElementById("user-name");
  if (userName && window.auth) {
    const currentUser = window.auth.getCurrentUser();
    if (currentUser) {
      userName.textContent = currentUser.name || currentUser.phone;
      const userInfo = document.getElementById("user-info");
      if (userInfo) {
        userInfo.classList.remove("hidden");
      }
    }
  }
  
  // Gestion du bouton de déconnexion
  const logoutBtn = document.getElementById("logout-button");
  if (logoutBtn && window.auth) {
    logoutBtn.addEventListener("click", () => {
      if (window.confirmAction) {
        window.confirmAction(
          "Voulez-vous vraiment vous déconnecter ?",
          () => {
            window.auth.logout();
          }
        );
      } else {
        if (confirm("Voulez-vous vraiment vous déconnecter ?")) {
          window.auth.logout();
        }
      }
    });
  }
  
  // Gestion du bouton de téléchargement
  const downloadBtn = document.getElementById("download-data-btn");
  if (downloadBtn) {
    downloadBtn.addEventListener("click", () => {
      downloadDashboardData();
    });
  }
  
  // Mettre à jour le résumé des filtres
  updateFilterSummary();
  
  // Écouter les changements de filtres
  window.addEventListener('filtersChanged', () => {
    updateFilterSummary();
    renderDashboardStats();
  });
  
  // Mettre à jour le résumé des filtres
  updateFilterSummary();
  
  // Écouter les changements de filtres
  window.addEventListener('filtersChanged', () => {
    updateFilterSummary();
    if (window.renderDashboardStats) {
      window.renderDashboardStats();
    }
  });
  
  console.log("✅ Version simplifiée chargée - Fonctionne sans serveur backend !");
  console.log(`📊 ${getPatientes().length} patiente(s) chargée(s) depuis le stockage local`);
});

// Fonction pour mettre à jour le résumé des filtres
function updateFilterSummary() {
  const filterSummaryText = document.getElementById("filter-summary-text");
  if (!filterSummaryText) return;
  
  const filters = window.getGlobalFilters ? window.getGlobalFilters() : {};
  const parts = [];
  
  if (filters.pays && filters.pays !== "all") {
    parts.push(`Pays: ${filters.pays}`);
  }
  if (filters.ville && filters.ville !== "all") {
    parts.push(`Ville: ${filters.ville}`);
  }
  if (filters.centre && filters.centre !== "all") {
    parts.push(`Centre: ${filters.centre}`);
  }
  if (filters.periode && filters.periode !== "all") {
    const periodeLabels = {
      week: "Cette semaine",
      month: "Ce mois",
      quarter: "Ce trimestre",
      year: "Cette année"
    };
    parts.push(`Période: ${periodeLabels[filters.periode] || filters.periode}`);
  }
  
  if (parts.length === 0) {
    filterSummaryText.textContent = "Aucun filtre actif";
  } else {
    filterSummaryText.textContent = parts.join(" • ");
  }
}

// Fonction pour télécharger les données du tableau de bord
function downloadDashboardData() {
  try {
    let patientes = getPatientes();
    
    // Filtrer par établissement actif si système multi-établissements disponible
    if (window.getCurrentEstablishmentId) {
      const currentEtablissementId = window.getCurrentEstablishmentId();
      if (currentEtablissementId) {
        patientes = patientes.filter(p => p.etablissementId === currentEtablissementId);
      }
    }
    
    // Appliquer les filtres globaux
    if (window.filterPatientesByGlobalFilters) {
      patientes = window.filterPatientesByGlobalFilters(patientes);
    }
    
    // Calculer les statistiques
    const stats = calculateDashboardStats();
    
    // Créer un objet de données à télécharger
    const dataToDownload = {
      dateExport: new Date().toISOString(),
      statistiques: stats,
      nombrePatientes: patientes.length,
      patientes: patientes.map(p => ({
        id: p.id,
        nom: `${p.prenom || ''} ${p.nom || ''}`.trim(),
        age: p.age,
        ville: p.ville,
        centre_sante: p.centre_sante,
        risque: p.risque,
        derniere_venue: p.derniere_venue,
        prochaine_cpn: p.prochaine_cpn
      }))
    };
    
    // Convertir en JSON
    const jsonData = JSON.stringify(dataToDownload, null, 2);
    
    // Créer un blob et télécharger
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mama-dashboard-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    // Afficher un message de confirmation
    if (window.showNotification) {
      window.showNotification('Données téléchargées avec succès', 'success');
    } else {
      alert('Données téléchargées avec succès');
    }
  } catch (error) {
    console.error('Erreur lors du téléchargement:', error);
    alert('Erreur lors du téléchargement des données');
  }
}

