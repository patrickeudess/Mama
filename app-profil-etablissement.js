/**
 * Script pour la gestion du profil établissement
 */

const ESTABLISHMENT_PROFILE_KEY = 'mama_establishment_profile';

function loadProfile() {
  try {
    const stored = localStorage.getItem(ESTABLISHMENT_PROFILE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error('Erreur lors du chargement du profil:', error);
    return null;
  }
}

function saveProfile(profile) {
  try {
    localStorage.setItem(ESTABLISHMENT_PROFILE_KEY, JSON.stringify(profile));
    return true;
  } catch (error) {
    console.error('Erreur lors de la sauvegarde:', error);
    return false;
  }
}

function displayProfile(profile) {
  if (!profile) {
    // Rediriger vers la page d'accueil si pas de profil
    window.location.href = 'index-etablissement.html';
    return;
  }

  // Afficher les informations
  document.getElementById('view-nom').textContent = profile.nom || '-';
  document.getElementById('view-type').textContent = getTypeLabel(profile.type) || '-';
  document.getElementById('view-adresse').textContent = profile.adresse || '-';
  document.getElementById('view-ville').textContent = profile.ville || '-';
  document.getElementById('view-pays').textContent = profile.pays || '-';
  document.getElementById('view-telephone').textContent = profile.telephone || '-';
  document.getElementById('view-email').textContent = profile.email || '-';
  
  if (profile.responsable) {
    document.getElementById('view-resp-prenom').textContent = profile.responsable.prenom || '-';
    document.getElementById('view-resp-nom').textContent = profile.responsable.nom || '-';
    document.getElementById('view-resp-fonction').textContent = profile.responsable.fonction || '-';
  }
  
  // Afficher le code de synchronisation (générer s'il n'existe pas)
  if (window.getEstablishmentSyncCode) {
    const syncCode = window.getEstablishmentSyncCode();
    const syncCodeElement = document.getElementById('view-sync-code');
    if (syncCodeElement) {
      syncCodeElement.textContent = syncCode || 'Non généré';
    }
  } else {
    // Si le script n'est pas chargé, générer le code directement
    if (!profile.syncCode) {
      const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
      let code = 'ETAB-';
      for (let i = 0; i < 4; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      code += '-';
      for (let i = 0; i < 4; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      profile.syncCode = code;
      profile.syncCodeCreatedAt = new Date().toISOString();
      saveProfile(profile);
    }
    const syncCodeElement = document.getElementById('view-sync-code');
    if (syncCodeElement) {
      syncCodeElement.textContent = profile.syncCode || 'Non généré';
    }
  }
}

function getTypeLabel(type) {
  const types = {
    'hopital': 'Hôpital',
    'centre_sante': 'Centre de santé',
    'clinique': 'Clinique',
    'dispensaire': 'Dispensaire',
    'csref': 'Centre de santé de référence (CSREF)',
    'csu': 'Centre de santé urbain (CSU)'
  };
  return types[type] || type;
}

function fillEditForm(profile) {
  document.getElementById('edit-nom').value = profile.nom || '';
  document.getElementById('edit-type').value = profile.type || '';
  document.getElementById('edit-adresse').value = profile.adresse || '';
  document.getElementById('edit-ville').value = profile.ville || '';
  document.getElementById('edit-pays').value = profile.pays || '';
  document.getElementById('edit-telephone').value = profile.telephone || '';
  document.getElementById('edit-email').value = profile.email || '';
  
  if (profile.responsable) {
    document.getElementById('edit-resp-prenom').value = profile.responsable.prenom || '';
    document.getElementById('edit-resp-nom').value = profile.responsable.nom || '';
    document.getElementById('edit-resp-fonction').value = profile.responsable.fonction || '';
  }
}

document.addEventListener('DOMContentLoaded', function() {
  const profile = loadProfile();
  
  if (!profile) {
    // Rediriger vers la page de création de profil
    window.location.href = 'creer-profil-etablissement.html';
    return;
  }

  displayProfile(profile);

  // Gestion du bouton modifier
  const editBtn = document.getElementById('edit-btn');
  const profileView = document.getElementById('profile-view');
  const profileEdit = document.getElementById('profile-edit');
  const cancelBtn = document.getElementById('cancel-btn');
  const editForm = document.getElementById('edit-profile-form');

  editBtn.addEventListener('click', () => {
    fillEditForm(profile);
    profileView.classList.add('hidden');
    profileEdit.classList.remove('hidden');
  });

  cancelBtn.addEventListener('click', () => {
    profileView.classList.remove('hidden');
    profileEdit.classList.add('hidden');
  });

  editForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const updatedProfile = {
      ...profile,
      nom: document.getElementById('edit-nom').value.trim(),
      type: document.getElementById('edit-type').value,
      adresse: document.getElementById('edit-adresse').value.trim(),
      ville: document.getElementById('edit-ville').value.trim(),
      pays: document.getElementById('edit-pays').value,
      telephone: document.getElementById('edit-telephone').value.trim(),
      email: document.getElementById('edit-email').value.trim(),
      responsable: {
        prenom: document.getElementById('edit-resp-prenom').value.trim(),
        nom: document.getElementById('edit-resp-nom').value.trim(),
        fonction: document.getElementById('edit-resp-fonction').value.trim()
      },
      updatedAt: new Date().toISOString()
    };

    // S'assurer que l'ID établissement existe
    if (!updatedProfile.etablissementId) {
      updatedProfile.etablissementId = `etab_${updatedProfile.nom.replace(/\s+/g, '_').toLowerCase()}_${updatedProfile.createdAt || Date.now()}`;
    }

    // S'assurer que le code de synchronisation existe (générer s'il n'existe pas)
    if (!updatedProfile.syncCode) {
      if (window.generateEstablishmentSyncCode) {
        updatedProfile.syncCode = window.generateEstablishmentSyncCode();
        updatedProfile.syncCodeCreatedAt = new Date().toISOString();
      } else {
        // Fallback
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        let code = 'ETAB-';
        for (let i = 0; i < 4; i++) {
          code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        code += '-';
        for (let i = 0; i < 4; i++) {
          code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        updatedProfile.syncCode = code;
        updatedProfile.syncCodeCreatedAt = new Date().toISOString();
      }
    }

    if (saveProfile(updatedProfile)) {
      const messageDiv = document.getElementById('profile-message');
      messageDiv.className = 'message success';
      messageDiv.textContent = 'Profil mis à jour avec succès !';
      
      setTimeout(() => {
        displayProfile(updatedProfile);
        profileView.classList.remove('hidden');
        profileEdit.classList.add('hidden');
        messageDiv.textContent = '';
        messageDiv.className = '';
      }, 1500);
    } else {
      const messageDiv = document.getElementById('profile-message');
      messageDiv.className = 'message error';
      messageDiv.textContent = 'Erreur lors de la sauvegarde';
    }
  });

  // Gestion de la déconnexion
  const logoutButton = document.getElementById('logout-button');
  if (logoutButton) {
    logoutButton.addEventListener('click', () => {
      if (window.auth && window.auth.logout) {
        window.auth.logout();
      }
      window.location.href = 'index.html';
    });
  }

  // Gestion du code de synchronisation
  const copySyncCodeBtn = document.getElementById('copy-sync-code-btn');
  const regenerateSyncCodeBtn = document.getElementById('regenerate-sync-code-btn');
  const syncCodeMessage = document.getElementById('sync-code-message');

  if (copySyncCodeBtn) {
    copySyncCodeBtn.addEventListener('click', () => {
      const syncCode = window.getEstablishmentSyncCode();
      if (syncCode) {
        navigator.clipboard.writeText(syncCode).then(() => {
          syncCodeMessage.className = 'message success';
          syncCodeMessage.textContent = 'Code copié dans le presse-papiers !';
          setTimeout(() => {
            syncCodeMessage.textContent = '';
            syncCodeMessage.className = '';
          }, 2000);
        }).catch(() => {
          // Fallback pour les navigateurs qui ne supportent pas clipboard API
          const textArea = document.createElement('textarea');
          textArea.value = syncCode;
          document.body.appendChild(textArea);
          textArea.select();
          document.execCommand('copy');
          document.body.removeChild(textArea);
          syncCodeMessage.className = 'message success';
          syncCodeMessage.textContent = 'Code copié dans le presse-papiers !';
          setTimeout(() => {
            syncCodeMessage.textContent = '';
            syncCodeMessage.className = '';
          }, 2000);
        });
      }
    });
  }

  if (regenerateSyncCodeBtn) {
    regenerateSyncCodeBtn.addEventListener('click', () => {
      if (confirm('Êtes-vous sûr de vouloir régénérer le code de synchronisation ?\n\nLes professionnels devront utiliser le nouveau code pour se connecter.')) {
        const newCode = window.regenerateEstablishmentSyncCode();
        if (newCode) {
          const syncCodeElement = document.getElementById('view-sync-code');
          if (syncCodeElement) {
            syncCodeElement.textContent = newCode;
          }
          syncCodeMessage.className = 'message success';
          syncCodeMessage.textContent = 'Code régénéré avec succès !';
          setTimeout(() => {
            syncCodeMessage.textContent = '';
            syncCodeMessage.className = '';
          }, 3000);
        }
      }
    });
  }
});

