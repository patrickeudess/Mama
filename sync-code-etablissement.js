/**
 * Système de code de synchronisation pour lier les professionnels à l'établissement
 * Format du code: ETAB-XXXX-XXXX (ex: ETAB-A1B2-C3D4)
 */

const ESTABLISHMENT_PROFILE_KEY = 'mama_establishment_profile';

/**
 * Génère un code de synchronisation unique pour l'établissement
 */
function generateEstablishmentSyncCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Éviter les caractères ambigus
  let code = 'ETAB-';
  
  // Générer 4 caractères
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  code += '-';
  
  // Générer 4 autres caractères
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return code;
}

/**
 * Récupère ou génère le code de synchronisation de l'établissement
 */
function getEstablishmentSyncCode() {
  try {
    const profileStr = localStorage.getItem(ESTABLISHMENT_PROFILE_KEY);
    if (!profileStr) return null;
    
    const profile = JSON.parse(profileStr);
    
    // Si le code n'existe pas, le générer
    if (!profile.syncCode) {
      profile.syncCode = generateEstablishmentSyncCode();
      profile.syncCodeCreatedAt = new Date().toISOString();
      localStorage.setItem(ESTABLISHMENT_PROFILE_KEY, JSON.stringify(profile));
    }
    
    return profile.syncCode;
  } catch (error) {
    console.error('Erreur lors de la récupération du code de synchronisation:', error);
    return null;
  }
}

/**
 * Régénère le code de synchronisation de l'établissement
 */
function regenerateEstablishmentSyncCode() {
  try {
    const profileStr = localStorage.getItem(ESTABLISHMENT_PROFILE_KEY);
    if (!profileStr) return null;
    
    const profile = JSON.parse(profileStr);
    profile.syncCode = generateEstablishmentSyncCode();
    profile.syncCodeCreatedAt = new Date().toISOString();
    profile.syncCodeRegeneratedAt = new Date().toISOString();
    
    localStorage.setItem(ESTABLISHMENT_PROFILE_KEY, JSON.stringify(profile));
    
    return profile.syncCode;
  } catch (error) {
    console.error('Erreur lors de la régénération du code:', error);
    return null;
  }
}

/**
 * Valide un code de synchronisation et retourne l'ID de l'établissement associé
 * Cherche dans tous les établissements disponibles
 */
function validateEstablishmentSyncCode(code) {
  try {
    if (!code || typeof code !== 'string') return null;
    
    // Normaliser le code (enlever les espaces, mettre en majuscules)
    const normalizedCode = code.trim().toUpperCase().replace(/\s+/g, '');
    
    // Vérifier le format
    if (!/^ETAB-[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(normalizedCode)) {
      return null;
    }
    
    // 1. Chercher dans le profil établissement actuel (si on est connecté en tant qu'établissement)
    const profileStr = localStorage.getItem(ESTABLISHMENT_PROFILE_KEY);
    if (profileStr) {
      const profile = JSON.parse(profileStr);
      if (profile.syncCode === normalizedCode) {
        return {
          etablissementId: profile.etablissementId || getCurrentEstablishmentId(),
          nom: profile.nom,
          type: profile.type,
          syncCode: normalizedCode
        };
      }
    }
    
    // 2. Chercher dans les établissements déjà liés au professionnel (si système multi-établissements disponible)
    if (window.getProfessionalEstablishments) {
      const establishments = window.getProfessionalEstablishments();
      const found = establishments.find(e => e.syncCode === normalizedCode);
      if (found) {
        return {
          etablissementId: found.etablissementId,
          nom: found.nom,
          type: found.type,
          syncCode: normalizedCode
        };
      }
    }
    
    // 3. Note: En production, il faudrait une API pour valider le code contre une base de données centralisée
    // Pour l'instant, on accepte le format et on laisse l'utilisateur l'ajouter
    // La validation réelle se fera lors de la synchronisation des données
    
    // Retourner null si pas trouvé (l'utilisateur pourra quand même l'ajouter mais avec un avertissement)
    return null;
  } catch (error) {
    console.error('Erreur lors de la validation du code:', error);
    return null;
  }
}

/**
 * Récupère l'ID de l'établissement actuel
 */
function getCurrentEstablishmentId() {
  try {
    const profileStr = localStorage.getItem(ESTABLISHMENT_PROFILE_KEY);
    if (!profileStr) return null;
    
    const profile = JSON.parse(profileStr);
    
    if (!profile.etablissementId) {
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

// Exporter les fonctions
if (typeof window !== 'undefined') {
  window.generateEstablishmentSyncCode = generateEstablishmentSyncCode;
  window.getEstablishmentSyncCode = getEstablishmentSyncCode;
  window.regenerateEstablishmentSyncCode = regenerateEstablishmentSyncCode;
  window.validateEstablishmentSyncCode = validateEstablishmentSyncCode;
  window.getCurrentEstablishmentId = getCurrentEstablishmentId;
}

