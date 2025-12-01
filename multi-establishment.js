/**
 * Système de gestion multi-établissements pour les professionnels
 * Permet à un professionnel de se connecter à plusieurs établissements
 */

const PROFESSIONAL_ESTABLISHMENTS_KEY = 'mama_professional_establishments';
const CURRENT_ESTABLISHMENT_KEY = 'mama_current_professional_establishment';

/**
 * Récupère tous les établissements liés au professionnel actuel
 */
function getProfessionalEstablishments() {
  try {
    const stored = localStorage.getItem(PROFESSIONAL_ESTABLISHMENTS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Erreur lors du chargement des établissements:', error);
    return [];
  }
}

/**
 * Sauvegarde les établissements du professionnel
 */
function saveProfessionalEstablishments(establishments) {
  try {
    localStorage.setItem(PROFESSIONAL_ESTABLISHMENTS_KEY, JSON.stringify(establishments));
    return true;
  } catch (error) {
    console.error('Erreur lors de la sauvegarde des établissements:', error);
    return false;
  }
}

/**
 * Ajoute un établissement au professionnel
 */
function addProfessionalEstablishment(establishmentInfo) {
  const establishments = getProfessionalEstablishments();
  
  // Vérifier si l'établissement n'existe pas déjà
  const exists = establishments.find(e => e.etablissementId === establishmentInfo.etablissementId);
  if (exists) {
    return { success: false, message: 'Cet établissement est déjà lié à votre compte' };
  }
  
  // Ajouter l'établissement
  const newEstablishment = {
    ...establishmentInfo,
    addedAt: new Date().toISOString(),
    isActive: establishments.length === 0 // Le premier devient actif par défaut
  };
  
  establishments.push(newEstablishment);
  
  // Si c'est le premier établissement, le définir comme actif
  if (establishments.length === 1) {
    setCurrentEstablishment(newEstablishment.etablissementId);
  }
  
  saveProfessionalEstablishments(establishments);
  return { success: true, message: 'Établissement ajouté avec succès' };
}

/**
 * Supprime un établissement du professionnel
 */
function removeProfessionalEstablishment(etablissementId) {
  const establishments = getProfessionalEstablishments();
  const filtered = establishments.filter(e => e.etablissementId !== etablissementId);
  
  // Si on supprime l'établissement actif, définir le premier disponible comme actif
  const currentId = getCurrentEstablishmentId();
  if (currentId === etablissementId && filtered.length > 0) {
    setCurrentEstablishment(filtered[0].etablissementId);
  } else if (filtered.length === 0) {
    // Plus d'établissement, supprimer l'établissement actif
    localStorage.removeItem(CURRENT_ESTABLISHMENT_KEY);
  }
  
  saveProfessionalEstablishments(filtered);
  return { success: true, message: 'Établissement supprimé' };
}

/**
 * Définit l'établissement actif
 */
function setCurrentEstablishment(etablissementId) {
  localStorage.setItem(CURRENT_ESTABLISHMENT_KEY, etablissementId);
  
  // Mettre à jour le flag isActive dans la liste
  const establishments = getProfessionalEstablishments();
  establishments.forEach(e => {
    e.isActive = e.etablissementId === etablissementId;
  });
  saveProfessionalEstablishments(establishments);
}

/**
 * Récupère l'ID de l'établissement actif
 */
function getCurrentEstablishmentId() {
  return localStorage.getItem(CURRENT_ESTABLISHMENT_KEY);
}

/**
 * Récupère les informations de l'établissement actif
 */
function getCurrentEstablishment() {
  const currentId = getCurrentEstablishmentId();
  if (!currentId) return null;
  
  const establishments = getProfessionalEstablishments();
  return establishments.find(e => e.etablissementId === currentId) || null;
}

/**
 * Valide un code de synchronisation (cherche dans tous les établissements)
 */
function validateEstablishmentSyncCodeForProfessional(code) {
  try {
    if (!code || typeof code !== 'string') return null;
    
    // Normaliser le code
    const normalizedCode = code.trim().toUpperCase().replace(/\s+/g, '');
    
    // Vérifier le format
    if (!/^ETAB-[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(normalizedCode)) {
      return null;
    }
    
    // Chercher dans tous les établissements stockés
    // On doit chercher dans localStorage pour tous les profils établissement
    // Pour simplifier, on cherche dans le profil établissement actuel
    // En production, il faudrait une base de données centralisée
    
    // Pour l'instant, on cherche dans le profil établissement local
    const profileStr = localStorage.getItem('mama_establishment_profile');
    if (profileStr) {
      try {
        const profile = JSON.parse(profileStr);
        if (profile.syncCode === normalizedCode) {
          return {
            etablissementId: profile.etablissementId || getCurrentEstablishmentId(),
            nom: profile.nom,
            type: profile.type,
            syncCode: normalizedCode
          };
        }
      } catch (e) {
        console.warn('Erreur lors du parsing du profil établissement:', e);
      }
    }
    
    // Chercher dans les établissements déjà liés au professionnel
    const establishments = getProfessionalEstablishments();
    const existing = establishments.find(e => e.syncCode === normalizedCode);
    if (existing) {
      return {
        etablissementId: existing.etablissementId,
        nom: existing.nom,
        type: existing.type,
        syncCode: normalizedCode
      };
    }
    
    // Si le code est valide mais pas trouvé, on peut quand même l'accepter
    // L'utilisateur pourra l'ajouter et la validation réelle se fera côté serveur
    // On retourne un objet avec le code normalisé pour permettre l'ajout
    return {
      etablissementId: null, // Sera généré côté serveur ou client
      nom: null, // Sera récupéré lors de la validation
      type: null,
      syncCode: normalizedCode,
      isValidFormat: true
    };
  } catch (error) {
    console.error('Erreur lors de la validation du code:', error);
    return null;
  }
}

/**
 * Recherche un établissement par son code de synchronisation via l'API
 */
async function searchEstablishmentBySyncCode(syncCode) {
  try {
    const API_BASE = window.API_BASE || 'http://localhost:8000';
    const token = localStorage.getItem('mama_token');
    
    if (!token) {
      console.warn('Pas de token d\'authentification');
      return null;
    }
    
    const response = await fetch(`${API_BASE}/api/etablissements/search?sync_code=${encodeURIComponent(syncCode)}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      return data;
    } else if (response.status === 404) {
      return null; // Établissement non trouvé
    } else {
      console.error('Erreur lors de la recherche:', response.status);
      return null;
    }
  } catch (error) {
    console.error('Erreur lors de la recherche de l\'établissement:', error);
    return null;
  }
}

/**
 * Ajoute un établissement en validant d'abord le code via l'API si possible
 */
async function addEstablishmentWithValidation(syncCode) {
  try {
    // Normaliser le code
    const normalizedCode = syncCode.trim().toUpperCase().replace(/\s+/g, '');
    
    // Vérifier le format
    if (!/^ETAB-[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(normalizedCode)) {
      return { 
        success: false, 
        message: 'Format de code invalide. Le code doit être au format ETAB-XXXX-XXXX' 
      };
    }
    
    // Vérifier si l'établissement n'est pas déjà ajouté
    const establishments = getProfessionalEstablishments();
    const existing = establishments.find(e => e.syncCode === normalizedCode);
    if (existing) {
      return { 
        success: false, 
        message: 'Cet établissement est déjà lié à votre compte' 
      };
    }
    
    // Essayer de récupérer les informations via l'API
    let establishmentInfo = await searchEstablishmentBySyncCode(normalizedCode);
    
    if (!establishmentInfo) {
      // Si l'API ne retourne rien, créer un établissement avec les infos minimales
      // L'utilisateur devra compléter les informations plus tard
      establishmentInfo = {
        etablissementId: `etab_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        nom: `Établissement ${normalizedCode}`,
        type: 'centre_sante',
        syncCode: normalizedCode
      };
    }
    
    // Ajouter l'établissement
    const result = addProfessionalEstablishment({
      etablissementId: establishmentInfo.etablissementId || establishmentInfo.id,
      nom: establishmentInfo.nom || establishmentInfo.name,
      type: establishmentInfo.type || 'centre_sante',
      syncCode: normalizedCode,
      adresse: establishmentInfo.adresse || establishmentInfo.address,
      ville: establishmentInfo.ville || establishmentInfo.city,
      pays: establishmentInfo.pays || establishmentInfo.country
    });
    
    return result;
  } catch (error) {
    console.error('Erreur lors de l\'ajout de l\'établissement:', error);
    return { 
      success: false, 
      message: 'Erreur lors de l\'ajout de l\'établissement. Veuillez réessayer.' 
    };
  }
}

// Exporter les fonctions
if (typeof window !== 'undefined') {
  window.getProfessionalEstablishments = getProfessionalEstablishments;
  window.saveProfessionalEstablishments = saveProfessionalEstablishments;
  window.addProfessionalEstablishment = addProfessionalEstablishment;
  window.removeProfessionalEstablishment = removeProfessionalEstablishment;
  window.setCurrentEstablishment = setCurrentEstablishment;
  window.getCurrentEstablishmentId = getCurrentEstablishmentId;
  window.getCurrentEstablishment = getCurrentEstablishment;
  window.validateEstablishmentSyncCodeForProfessional = validateEstablishmentSyncCodeForProfessional;
  window.searchEstablishmentBySyncCode = searchEstablishmentBySyncCode;
  window.addEstablishmentWithValidation = addEstablishmentWithValidation;
}







