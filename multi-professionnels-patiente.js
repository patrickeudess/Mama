/**
 * Système de gestion multi-professionnels pour les patientes
 * Permet à une patiente de se connecter à plusieurs professionnels de santé
 */

const PATIENTE_PROFESSIONNELS_KEY = 'mama_patiente_professionnels';
const CURRENT_PROFESSIONNEL_KEY = 'mama_current_patiente_professionnel';

/**
 * Récupère tous les professionnels liés à la patiente actuelle
 */
function getPatienteProfessionnels() {
  try {
    const stored = localStorage.getItem(PATIENTE_PROFESSIONNELS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Erreur lors du chargement des professionnels:', error);
    return [];
  }
}

/**
 * Sauvegarde les professionnels de la patiente
 */
function savePatienteProfessionnels(professionnels) {
  try {
    localStorage.setItem(PATIENTE_PROFESSIONNELS_KEY, JSON.stringify(professionnels));
    return true;
  } catch (error) {
    console.error('Erreur lors de la sauvegarde des professionnels:', error);
    return false;
  }
}

/**
 * Ajoute un professionnel à la patiente
 */
function addPatienteProfessionnel(professionnelInfo) {
  const professionnels = getPatienteProfessionnels();
  
  // Vérifier si le professionnel n'existe pas déjà
  const exists = professionnels.find(p => 
    p.professionnelId === professionnelInfo.professionnelId ||
    (p.telephone && professionnelInfo.telephone && p.telephone === professionnelInfo.telephone)
  );
  
  if (exists) {
    return { success: false, message: 'Ce professionnel est déjà lié à votre compte' };
  }
  
  // Ajouter le professionnel
  const newProfessionnel = {
    ...professionnelInfo,
    addedAt: new Date().toISOString(),
    isActive: professionnels.length === 0 // Le premier devient actif par défaut
  };
  
  professionnels.push(newProfessionnel);
  
  // Si c'est le premier professionnel, le définir comme actif
  if (professionnels.length === 1) {
    setCurrentPatienteProfessionnel(newProfessionnel.professionnelId);
  }
  
  savePatienteProfessionnels(professionnels);
  return { success: true, message: 'Professionnel ajouté avec succès' };
}

/**
 * Supprime un professionnel de la patiente
 */
function removePatienteProfessionnel(professionnelId) {
  const professionnels = getPatienteProfessionnels();
  const filtered = professionnels.filter(p => p.professionnelId !== professionnelId);
  
  // Si on supprime le professionnel actif, définir le premier disponible comme actif
  const currentId = getCurrentPatienteProfessionnelId();
  if (currentId === professionnelId && filtered.length > 0) {
    setCurrentPatienteProfessionnel(filtered[0].professionnelId);
  } else if (filtered.length === 0) {
    // Plus de professionnel, supprimer le professionnel actif
    localStorage.removeItem(CURRENT_PROFESSIONNEL_KEY);
  }
  
  savePatienteProfessionnels(filtered);
  return { success: true, message: 'Professionnel supprimé' };
}

/**
 * Définit le professionnel actif
 */
function setCurrentPatienteProfessionnel(professionnelId) {
  localStorage.setItem(CURRENT_PROFESSIONNEL_KEY, professionnelId);
  
  // Mettre à jour le flag isActive dans la liste
  const professionnels = getPatienteProfessionnels();
  professionnels.forEach(p => {
    p.isActive = p.professionnelId === professionnelId;
  });
  savePatienteProfessionnels(professionnels);
}

/**
 * Récupère l'ID du professionnel actif
 */
function getCurrentPatienteProfessionnelId() {
  return localStorage.getItem(CURRENT_PROFESSIONNEL_KEY);
}

/**
 * Récupère les informations du professionnel actif
 */
function getCurrentPatienteProfessionnel() {
  const currentId = getCurrentPatienteProfessionnelId();
  if (!currentId) return null;
  
  const professionnels = getPatienteProfessionnels();
  return professionnels.find(p => p.professionnelId === currentId) || null;
}

/**
 * Recherche un professionnel par code de synchronisation ou téléphone
 */
function findProfessionnelByCode(code) {
  // Chercher dans les professionnels enregistrés
  const professionnels = JSON.parse(localStorage.getItem('mama_establishment_professionnels') || '[]');
  
  // Pour l'instant, on peut chercher par téléphone ou nom
  // En production, il faudrait une API pour valider le code
  return null; // À implémenter selon les besoins
}

// Exporter les fonctions
if (typeof window !== 'undefined') {
  window.getPatienteProfessionnels = getPatienteProfessionnels;
  window.savePatienteProfessionnels = savePatienteProfessionnels;
  window.addPatienteProfessionnel = addPatienteProfessionnel;
  window.removePatienteProfessionnel = removePatienteProfessionnel;
  window.setCurrentPatienteProfessionnel = setCurrentPatienteProfessionnel;
  window.getCurrentPatienteProfessionnelId = getCurrentPatienteProfessionnelId;
  window.getCurrentPatienteProfessionnel = getCurrentPatienteProfessionnel;
}











