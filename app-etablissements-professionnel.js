/**
 * Gestion des établissements pour les professionnels
 */

// Charger et afficher les établissements
function loadEstablishments() {
  const container = document.getElementById('establishments-list-container');
  if (!container) return;
  
  if (!window.getProfessionalEstablishments) {
    container.innerHTML = '<p style="text-align: center; padding: 2rem; color: #6b7280;">Système non disponible</p>';
    return;
  }
  
  const establishments = window.getProfessionalEstablishments();
  const currentId = window.getCurrentEstablishmentId ? window.getCurrentEstablishmentId() : null;
  
  if (establishments.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 3rem; color: #6b7280;">
        <div style="font-size: 3rem; margin-bottom: 1rem;">🏥</div>
        <p style="font-size: 1.1rem; margin-bottom: 0.5rem;">Aucun établissement</p>
        <p style="font-size: 0.9rem;">Ajoutez votre premier établissement ci-dessus</p>
      </div>
    `;
    return;
  }
  
  // Afficher la liste
  const establishmentsHTML = establishments.map(est => {
    const isActive = est.etablissementId === currentId;
    const borderColor = isActive ? '#059669' : '#e5e7eb';
    const bgColor = isActive ? '#f0fdf4' : 'white';
    
    return `
      <div style="background: ${bgColor}; padding: 1rem; border-radius: 0.5rem; margin-bottom: 1rem; border: 2px solid ${borderColor};">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.75rem;">
          <div style="flex: 1;">
            <h3 style="margin: 0 0 0.5rem 0; color: #1f2937; font-size: 1.1rem; display: flex; align-items: center; gap: 0.5rem;">
              ${est.nom || 'Établissement'}
              ${isActive ? '<span style="background: #059669; color: white; padding: 0.25rem 0.75rem; border-radius: 0.25rem; font-size: 0.75rem; font-weight: 600;">ACTIF</span>' : ''}
            </h3>
            <div style="font-size: 0.875rem; color: #6b7280; margin-bottom: 0.25rem;">
              <strong>Type :</strong> ${est.type || 'Non spécifié'}
            </div>
            <div style="font-size: 0.875rem; color: #6b7280; font-family: monospace;">
              <strong>Code :</strong> ${est.syncCode || 'Non disponible'}
            </div>
            ${est.addedAt ? `
              <div style="font-size: 0.75rem; color: #9ca3af; margin-top: 0.5rem;">
                Ajouté le ${new Date(est.addedAt).toLocaleDateString('fr-FR')}
              </div>
            ` : ''}
          </div>
          <div style="display: flex; flex-direction: column; gap: 0.5rem;">
            ${!isActive ? `
              <button onclick="setActiveEstablishment('${est.etablissementId}')" class="btn-primary" style="padding: 0.5rem 1rem; font-size: 0.875rem; white-space: nowrap;">
                ✓ Définir comme actif
              </button>
            ` : ''}
            <button onclick="removeEstablishment('${est.etablissementId}')" class="btn-secondary" style="padding: 0.5rem 1rem; font-size: 0.875rem; background: #ef4444; color: white; border: none; white-space: nowrap;">
              🗑️ Supprimer
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');
  
  container.innerHTML = establishmentsHTML;
}

// Ajouter un établissement
function addEstablishment() {
  const input = document.getElementById('add-sync-code-input');
  const validationDiv = document.getElementById('add-sync-code-validation');
  
  if (!input) return;
  
  const code = input.value.trim().toUpperCase();
  
  if (!code) {
    validationDiv.innerHTML = '<span style="color: #dc2626;">Veuillez entrer un code</span>';
    return;
  }
  
  // Vérifier le format
  if (!/^ETAB-[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(code)) {
    validationDiv.innerHTML = '<span style="color: #dc2626;">Format invalide. Utilisez ETAB-XXXX-XXXX</span>';
    return;
  }
  
  // Vérifier si déjà ajouté
  const establishments = window.getProfessionalEstablishments();
  const exists = establishments.find(e => e.syncCode === code);
  if (exists) {
    validationDiv.innerHTML = '<span style="color: #dc2626;">Cet établissement est déjà ajouté</span>';
    return;
  }
  
  // Afficher un message de chargement
  validationDiv.innerHTML = '<span style="color: #0ea5e9;">⏳ Validation en cours...</span>';
  const addBtn = document.getElementById('add-establishment-btn');
  if (addBtn) addBtn.disabled = true;
  
  // Utiliser la nouvelle fonction de validation avec API si disponible
  if (window.addEstablishmentWithValidation) {
    // Fonction asynchrone pour gérer l'ajout
    (async () => {
      try {
        const result = await window.addEstablishmentWithValidation(code);
        
        if (result.success) {
          input.value = '';
          validationDiv.innerHTML = '<span style="color: #059669;">✅ Établissement ajouté avec succès !</span>';
          setTimeout(() => {
            validationDiv.innerHTML = '';
          }, 2000);
          loadEstablishments();
        } else {
          validationDiv.innerHTML = `<span style="color: #dc2626;">❌ ${result.message}</span>`;
        }
      } catch (error) {
        console.error('Erreur lors de l\'ajout:', error);
        validationDiv.innerHTML = '<span style="color: #dc2626;">❌ Erreur lors de l\'ajout. Veuillez réessayer.</span>';
      } finally {
        if (addBtn) addBtn.disabled = false;
      }
    })();
  } else {
    // Fallback : méthode ancienne
    // Valider le code
    let establishmentInfo = null;
    if (window.validateEstablishmentSyncCodeForProfessional) {
      establishmentInfo = window.validateEstablishmentSyncCodeForProfessional(code);
    }
    
    // Si pas trouvé, créer un établissement temporaire
    if (!establishmentInfo || !establishmentInfo.etablissementId) {
      establishmentInfo = {
        etablissementId: `etab_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        nom: `Établissement ${code}`,
        type: 'centre_sante',
        syncCode: code
      };
    }
    
    // Ajouter l'établissement
    if (window.addProfessionalEstablishment) {
      const result = window.addProfessionalEstablishment({
        ...establishmentInfo,
        syncCode: code
      });
      
      if (result.success) {
        input.value = '';
        validationDiv.innerHTML = '<span style="color: #059669;">✅ Établissement ajouté avec succès !</span>';
        setTimeout(() => {
          validationDiv.innerHTML = '';
        }, 2000);
        loadEstablishments();
      } else {
        validationDiv.innerHTML = `<span style="color: #dc2626;">${result.message}</span>`;
      }
    }
    if (addBtn) addBtn.disabled = false;
  }
}

// Supprimer un établissement
window.removeEstablishment = function(etablissementId) {
  if (confirm('Êtes-vous sûr de vouloir supprimer cet établissement ?\n\nLes données liées à cet établissement ne seront plus accessibles.')) {
    if (window.removeProfessionalEstablishment) {
      window.removeProfessionalEstablishment(etablissementId);
      loadEstablishments();
    }
  }
};

// Définir l'établissement actif
window.setActiveEstablishment = function(etablissementId) {
  if (window.setCurrentEstablishment) {
    window.setCurrentEstablishment(etablissementId);
    loadEstablishments();
    // Afficher un message de confirmation
    const container = document.getElementById('establishments-list-container');
    if (container) {
      const message = document.createElement('div');
      message.style.cssText = 'background: #d1fae5; color: #059669; padding: 0.75rem; border-radius: 0.5rem; margin-bottom: 1rem; border: 1px solid #a7f3d0;';
      message.textContent = '✅ Établissement actif mis à jour !';
      container.insertBefore(message, container.firstChild);
      setTimeout(() => {
        message.remove();
      }, 3000);
    }
  }
};

// Initialisation
document.addEventListener('DOMContentLoaded', function() {
  loadEstablishments();
  
  // Gestion de l'ajout
  const addBtn = document.getElementById('add-establishment-btn');
  const input = document.getElementById('add-sync-code-input');
  
  if (addBtn) {
    addBtn.addEventListener('click', addEstablishment);
  }
  
  if (input) {
    // Validation en temps réel
    input.addEventListener('input', function() {
      const code = this.value.trim().toUpperCase();
      const validationDiv = document.getElementById('add-sync-code-validation');
      
      if (code.length === 0) {
        validationDiv.innerHTML = '';
        this.style.borderColor = '#0ea5e9';
        return;
      }
      
      const formatValid = /^ETAB-[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(code);
      
      if (!formatValid) {
        validationDiv.innerHTML = '<span style="color: #dc2626;">❌ Format invalide</span>';
        this.style.borderColor = '#dc2626';
        return;
      }
      
      // Vérifier si déjà ajouté
      const establishments = window.getProfessionalEstablishments();
      const exists = establishments.find(e => e.syncCode === code);
      if (exists) {
        validationDiv.innerHTML = '<span style="color: #f59e0b;">⚠️ Déjà ajouté</span>';
        this.style.borderColor = '#f59e0b';
        return;
      }
      
      // Vérifier si valide
      if (window.validateEstablishmentSyncCodeForProfessional) {
        const establishmentInfo = window.validateEstablishmentSyncCodeForProfessional(code);
        if (establishmentInfo && establishmentInfo.nom) {
          validationDiv.innerHTML = `<span style="color: #059669;">✅ Code valide - ${establishmentInfo.nom}</span>`;
          this.style.borderColor = '#059669';
        } else if (establishmentInfo && establishmentInfo.isValidFormat) {
          validationDiv.innerHTML = '<span style="color: #0ea5e9;">✓ Format correct (sera validé lors de l\'ajout)</span>';
          this.style.borderColor = '#0ea5e9';
        } else {
          validationDiv.innerHTML = '<span style="color: #0ea5e9;">✓ Format correct</span>';
          this.style.borderColor = '#0ea5e9';
        }
      } else {
        validationDiv.innerHTML = '<span style="color: #0ea5e9;">✓ Format correct</span>';
        this.style.borderColor = '#0ea5e9';
      }
    });
    
    // Permettre l'ajout avec Enter
    input.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        addEstablishment();
      }
    });
  }
  
  // Gestion de la déconnexion
  const logoutButton = document.getElementById('logout-button');
  if (logoutButton) {
    logoutButton.addEventListener('click', function() {
      if (window.auth && window.auth.logout) {
        window.auth.logout();
      }
      window.location.href = 'index.html';
    });
  }
});







