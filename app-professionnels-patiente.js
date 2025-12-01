/**
 * Gestion des professionnels pour les patientes
 */

// Charger et afficher les professionnels
function loadProfessionnels() {
  const container = document.getElementById('professionnels-list-container');
  if (!container) return;
  
  if (!window.getPatienteProfessionnels) {
    container.innerHTML = '<p style="text-align: center; padding: 2rem; color: #6b7280;">Système non disponible</p>';
    return;
  }
  
  const professionnels = window.getPatienteProfessionnels();
  const currentId = window.getCurrentPatienteProfessionnelId ? window.getCurrentPatienteProfessionnelId() : null;
  
  if (professionnels.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 3rem; color: #6b7280;">
        <div style="font-size: 3rem; margin-bottom: 1rem;">👨‍⚕️</div>
        <p style="font-size: 1.1rem; margin-bottom: 0.5rem;">Aucun professionnel</p>
        <p style="font-size: 0.9rem;">Ajoutez votre premier professionnel ci-dessus</p>
      </div>
    `;
    return;
  }
  
  // Afficher la liste
  const professionnelsHTML = professionnels.map(prof => {
    const isActive = prof.professionnelId === currentId;
    const borderColor = isActive ? '#059669' : '#e5e7eb';
    const bgColor = isActive ? '#f0fdf4' : 'white';
    const profName = `${prof.prenom || ''} ${prof.nom || ''}`.trim() || 'Professionnel';
    
    return `
      <div style="background: ${bgColor}; padding: 1rem; border-radius: 0.5rem; margin-bottom: 1rem; border: 2px solid ${borderColor};">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.75rem;">
          <div style="flex: 1;">
            <h3 style="margin: 0 0 0.5rem 0; color: #1f2937; font-size: 1.1rem; display: flex; align-items: center; gap: 0.5rem;">
              ${profName}
              ${isActive ? '<span style="background: #059669; color: white; padding: 0.25rem 0.75rem; border-radius: 0.25rem; font-size: 0.75rem; font-weight: 600;">ACTIF</span>' : ''}
            </h3>
            <div style="font-size: 0.875rem; color: #6b7280; margin-bottom: 0.25rem;">
              <strong>Profession :</strong> ${prof.profession || 'Non spécifié'}
            </div>
            ${prof.telephone ? `
              <div style="font-size: 0.875rem; color: #6b7280; margin-bottom: 0.25rem;">
                <strong>Téléphone :</strong> ${prof.telephone}
              </div>
            ` : ''}
            ${prof.etablissementNom ? `
              <div style="font-size: 0.875rem; color: #6b7280; margin-bottom: 0.25rem;">
                <strong>Établissement :</strong> ${prof.etablissementNom}
              </div>
            ` : ''}
            ${prof.addedAt ? `
              <div style="font-size: 0.75rem; color: #9ca3af; margin-top: 0.5rem;">
                Ajouté le ${new Date(prof.addedAt).toLocaleDateString('fr-FR')}
              </div>
            ` : ''}
          </div>
          <div style="display: flex; flex-direction: column; gap: 0.5rem;">
            ${!isActive ? `
              <button onclick="setActiveProfessionnel('${prof.professionnelId}')" class="btn-primary" style="padding: 0.5rem 1rem; font-size: 0.875rem; white-space: nowrap;">
                ✓ Définir comme actif
              </button>
            ` : ''}
            <button onclick="removeProfessionnel('${prof.professionnelId}')" class="btn-secondary" style="padding: 0.5rem 1rem; font-size: 0.875rem; background: #ef4444; color: white; border: none; white-space: nowrap;">
              🗑️ Supprimer
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');
  
  container.innerHTML = professionnelsHTML;
}

// Ajouter un professionnel
function addProfessionnel() {
  const input = document.getElementById('add-professionnel-input');
  const validationDiv = document.getElementById('add-professionnel-validation');
  
  if (!input) return;
  
  const codeOrPhone = input.value.trim();
  
  if (!codeOrPhone) {
    validationDiv.innerHTML = '<span style="color: #dc2626;">Veuillez entrer un code ou un numéro de téléphone</span>';
    return;
  }
  
  // Vérifier si c'est un code de synchronisation ou un téléphone
  const isSyncCode = /^MAMA-[A-Z0-9]{4}-[A-Z0-9]{4}$/i.test(codeOrPhone.toUpperCase());
  const isPhone = /^\+?[0-9]{8,15}$/.test(codeOrPhone.replace(/\s+/g, ''));
  
  if (!isSyncCode && !isPhone) {
    validationDiv.innerHTML = '<span style="color: #dc2626;">Format invalide. Utilisez un code MAMA-XXXX-XXXX ou un numéro de téléphone</span>';
    return;
  }
  
  // Chercher le professionnel
  let professionnelInfo = null;
  
  if (isPhone) {
    // Chercher par téléphone dans les professionnels
    const professionnels = JSON.parse(localStorage.getItem('mama_establishment_professionnels') || '[]');
    const found = professionnels.find(p => {
      const phone = p.telephone || '';
      return phone.replace(/\s+/g, '') === codeOrPhone.replace(/\s+/g, '') ||
             phone.replace(/\s+/g, '') === '+' + codeOrPhone.replace(/\s+/g, '') ||
             phone.replace(/\s+/g, '').replace(/^\+/, '') === codeOrPhone.replace(/\s+/g, '').replace(/^\+/, '');
    });
    
    if (found) {
      professionnelInfo = {
        professionnelId: found.id,
        prenom: found.prenom || '',
        nom: found.nom || '',
        telephone: found.telephone || codeOrPhone,
        profession: found.profession || 'Professionnel',
        etablissementId: found.etablissementId || null,
        etablissementNom: found.etablissementNom || null
      };
    } else {
      // Créer un professionnel temporaire
      professionnelInfo = {
        professionnelId: `temp_${Date.now()}`,
        telephone: codeOrPhone,
        nom: 'Professionnel (à valider)',
        profession: 'unknown'
      };
    }
  } else if (isSyncCode) {
    // Pour les codes de synchronisation, créer un professionnel temporaire
    professionnelInfo = {
      professionnelId: `temp_${Date.now()}`,
      syncCode: codeOrPhone.toUpperCase(),
      nom: 'Professionnel (à valider)',
      profession: 'unknown'
    };
  }
  
  if (!professionnelInfo) {
    validationDiv.innerHTML = '<span style="color: #dc2626;">Impossible de trouver le professionnel</span>';
    return;
  }
  
  // Ajouter le professionnel
  if (window.addPatienteProfessionnel) {
    const result = window.addPatienteProfessionnel(professionnelInfo);
    
    if (result.success) {
      input.value = '';
      validationDiv.innerHTML = '<span style="color: #059669;">✅ Professionnel ajouté avec succès !</span>';
      setTimeout(() => {
        validationDiv.innerHTML = '';
      }, 2000);
      loadProfessionnels();
    } else {
      validationDiv.innerHTML = `<span style="color: #dc2626;">${result.message}</span>`;
    }
  }
}

// Supprimer un professionnel
window.removeProfessionnel = function(professionnelId) {
  if (confirm('Êtes-vous sûr de vouloir supprimer ce professionnel ?\n\nVous ne pourrez plus échanger avec lui.')) {
    if (window.removePatienteProfessionnel) {
      window.removePatienteProfessionnel(professionnelId);
      loadProfessionnels();
    }
  }
};

// Définir le professionnel actif
window.setActiveProfessionnel = function(professionnelId) {
  if (window.setCurrentPatienteProfessionnel) {
    window.setCurrentPatienteProfessionnel(professionnelId);
    loadProfessionnels();
    // Afficher un message de confirmation
    const container = document.getElementById('professionnels-list-container');
    if (container) {
      const message = document.createElement('div');
      message.style.cssText = 'background: #d1fae5; color: #059669; padding: 0.75rem; border-radius: 0.5rem; margin-bottom: 1rem; border: 1px solid #a7f3d0;';
      message.textContent = '✅ Professionnel actif mis à jour !';
      container.insertBefore(message, container.firstChild);
      setTimeout(() => {
        message.remove();
      }, 3000);
    }
  }
};

// Initialisation
document.addEventListener('DOMContentLoaded', function() {
  loadProfessionnels();
  
  // Gestion de l'ajout
  const addBtn = document.getElementById('add-professionnel-btn');
  const input = document.getElementById('add-professionnel-input');
  
  if (addBtn) {
    addBtn.addEventListener('click', addProfessionnel);
  }
  
  if (input) {
    // Validation en temps réel
    input.addEventListener('input', function() {
      const codeOrPhone = this.value.trim();
      const validationDiv = document.getElementById('add-professionnel-validation');
      
      if (codeOrPhone.length === 0) {
        validationDiv.innerHTML = '';
        this.style.borderColor = '#0ea5e9';
        return;
      }
      
      const isSyncCode = /^MAMA-[A-Z0-9]{4}-[A-Z0-9]{4}$/i.test(codeOrPhone.toUpperCase());
      const isPhone = /^\+?[0-9]{8,15}$/.test(codeOrPhone.replace(/\s+/g, ''));
      
      if (!isSyncCode && !isPhone) {
        validationDiv.innerHTML = '<span style="color: #dc2626;">❌ Format invalide</span>';
        this.style.borderColor = '#dc2626';
        return;
      }
      
      // Vérifier si déjà ajouté
      const professionnels = window.getPatienteProfessionnels();
      const exists = professionnels.find(p => 
        (p.telephone && codeOrPhone.replace(/\s+/g, '') === p.telephone.replace(/\s+/g, '')) ||
        (p.syncCode && codeOrPhone.toUpperCase() === p.syncCode.toUpperCase())
      );
      
      if (exists) {
        validationDiv.innerHTML = '<span style="color: #f59e0b;">⚠️ Déjà ajouté</span>';
        this.style.borderColor = '#f59e0b';
        return;
      }
      
      validationDiv.innerHTML = '<span style="color: #0ea5e9;">✓ Format correct</span>';
      this.style.borderColor = '#0ea5e9';
    });
    
    // Permettre l'ajout avec Enter
    input.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        addProfessionnel();
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











