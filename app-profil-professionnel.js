/**
 * Gestion du profil professionnel
 * Permet de visualiser, modifier, ajouter et supprimer les informations du professionnel
 */

const STORAGE_KEY = "mama_professional_profile";
const profileMessage = document.getElementById("profile-message");
const profileDisplay = document.getElementById("profile-display");
const profileEditForm = document.getElementById("profile-edit-form");
const editForm = document.getElementById("edit-profile-form");

// Charger le profil
function loadProfile() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
        try {
            return JSON.parse(saved);
        } catch (e) {
            console.error("Erreur lors du chargement du profil:", e);
            return null;
        }
    }
    return null;
}

// Sauvegarder le profil
function saveProfile(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// Fonction pour échapper le HTML (sécurité)
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Afficher le profil
function displayProfile() {
    const profile = loadProfile();
    const profileContent = document.getElementById("profile-content");
    
    if (!profile) {
        // Si aucun profil n'existe, afficher le formulaire de création
        enableEditMode();
        showMessage("Aucun profil trouvé. Veuillez créer votre profil.", "error");
        return;
    }
    
    // S'assurer que le formulaire est masqué et l'affichage est visible
    profileEditForm.classList.add("hidden");
    profileDisplay.classList.remove("hidden");
    
    profileContent.innerHTML = `
        <div class="info-section">
            <h3>Informations personnelles</h3>
            <div class="info-row">
                <span class="info-label">Prénom</span>
                <span class="info-value">${profile.prenom ? escapeHtml(profile.prenom) : '<span class="empty">Non renseigné</span>'}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Nom</span>
                <span class="info-value">${profile.nom ? escapeHtml(profile.nom) : '<span class="empty">Non renseigné</span>'}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Téléphone</span>
                <span class="info-value">${profile.telephone ? escapeHtml(profile.telephone) : '<span class="empty">Non renseigné</span>'}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Email</span>
                <span class="info-value">${profile.email ? escapeHtml(profile.email) : '<span class="empty">Non renseigné</span>'}</span>
            </div>
        </div>

        <div class="info-section">
            <h3>Informations professionnelles</h3>
            <div class="info-row">
                <span class="info-label">Profession</span>
                <span class="info-value">${profile.profession ? escapeHtml(formatProfession(profile.profession)) : '<span class="empty">Non renseigné</span>'}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Centre de santé</span>
                <span class="info-value">${profile.centre ? escapeHtml(profile.centre) : '<span class="empty">Non renseigné</span>'}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Adresse du centre</span>
                <span class="info-value">${profile.adresse_centre ? escapeHtml(profile.adresse_centre) : '<span class="empty">Non renseigné</span>'}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Ville</span>
                <span class="info-value">${profile.ville ? escapeHtml(profile.ville) : '<span class="empty">Non renseigné</span>'}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Pays</span>
                <span class="info-value">${profile.pays ? escapeHtml(profile.pays) : '<span class="empty">Non renseigné</span>'}</span>
            </div>
        </div>

        ${profile.specialite || profile.numero_ordre || profile.notes ? `
        <div class="info-section">
            <h3>Informations supplémentaires</h3>
            ${profile.specialite ? `
            <div class="info-row">
                <span class="info-label">Spécialité</span>
                <span class="info-value">${escapeHtml(profile.specialite)}</span>
            </div>
            ` : ''}
            ${profile.numero_ordre ? `
            <div class="info-row">
                <span class="info-label">Numéro d'ordre / Licence</span>
                <span class="info-value">${escapeHtml(profile.numero_ordre)}</span>
            </div>
            ` : ''}
            ${profile.notes ? `
            <div class="info-row">
                <span class="info-label">Notes personnelles</span>
                <span class="info-value">${escapeHtml(profile.notes)}</span>
            </div>
            ` : ''}
        </div>
        ` : ''}
    `;
}

// Formater la profession
function formatProfession(profession) {
    const professions = {
        "sage_femme": "Sage-femme",
        "medecin": "Médecin",
        "superviseur": "Superviseur",
        "infirmier": "Infirmier/Infirmière"
    };
    return professions[profession] || profession;
}

// Activer le mode édition
function enableEditMode() {
    const profile = loadProfile() || {};
    
    // Remplir le formulaire avec les données existantes
    document.getElementById("edit-prenom").value = profile.prenom || "";
    document.getElementById("edit-nom").value = profile.nom || "";
    document.getElementById("edit-telephone").value = profile.telephone || "";
    document.getElementById("edit-email").value = profile.email || "";
    document.getElementById("edit-profession").value = profile.profession || "";
    document.getElementById("edit-centre").value = profile.centre || "";
    document.getElementById("edit-adresse-centre").value = profile.adresse_centre || "";
    document.getElementById("edit-ville").value = profile.ville || "";
    document.getElementById("edit-pays").value = profile.pays || "";
    document.getElementById("edit-specialite").value = profile.specialite || "";
    document.getElementById("edit-numero-ordre").value = profile.numero_ordre || "";
    document.getElementById("edit-notes").value = profile.notes || "";
    
    // Afficher le formulaire et masquer l'affichage
    profileDisplay.classList.add("hidden");
    profileEditForm.classList.remove("hidden");
}

// Annuler l'édition
function cancelEdit() {
    profileEditForm.classList.add("hidden");
    profileDisplay.classList.remove("hidden");
    editForm.reset();
}

// Afficher un message
function showMessage(message, type = "success") {
    profileMessage.textContent = message;
    profileMessage.className = `message ${type}`;
    profileMessage.classList.remove("hidden");
    
    setTimeout(() => {
        profileMessage.classList.add("hidden");
    }, 5000);
}

// Gérer la soumission du formulaire
editForm.addEventListener("submit", function(event) {
    event.preventDefault();
    
    const formData = {
        prenom: document.getElementById("edit-prenom").value.trim(),
        nom: document.getElementById("edit-nom").value.trim(),
        telephone: document.getElementById("edit-telephone").value.trim(),
        email: document.getElementById("edit-email").value.trim(),
        profession: document.getElementById("edit-profession").value,
        centre: document.getElementById("edit-centre").value.trim(),
        adresse_centre: document.getElementById("edit-adresse-centre").value.trim(),
        ville: document.getElementById("edit-ville").value.trim(),
        pays: document.getElementById("edit-pays").value,
        specialite: document.getElementById("edit-specialite").value.trim(),
        numero_ordre: document.getElementById("edit-numero-ordre").value.trim(),
        notes: document.getElementById("edit-notes").value.trim(),
        updated_at: new Date().toISOString()
    };
    
    // Validation
    if (!formData.prenom || !formData.nom || !formData.telephone || !formData.profession || !formData.centre) {
        showMessage("Veuillez remplir tous les champs obligatoires.", "error");
        return;
    }
    
    // Validation du téléphone (format basique)
    const phoneRegex = /^\+?[0-9]{8,15}$/;
    if (!phoneRegex.test(formData.telephone.replace(/\s/g, ""))) {
        showMessage("Le numéro de téléphone n'est pas valide.", "error");
        return;
    }
    
    // Validation de l'email si fourni
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        showMessage("L'adresse email n'est pas valide.", "error");
        return;
    }
    
    // Charger le profil existant pour préserver la date de création
    const existingProfile = loadProfile();
    if (existingProfile && existingProfile.created_at) {
        formData.created_at = existingProfile.created_at;
    } else {
        formData.created_at = new Date().toISOString();
    }
    
    // Sauvegarder
    saveProfile(formData);
    
    // Masquer le formulaire d'abord
    profileEditForm.classList.add("hidden");
    profileDisplay.classList.remove("hidden");
    
    // Rafraîchir l'affichage avec les nouvelles données
    displayProfile();
    
    // Afficher le message de succès
    showMessage("Profil mis à jour avec succès !", "success");
    
    // Réinitialiser le formulaire
    editForm.reset();
    
    // Mettre à jour les filtres globaux si nécessaire
    if (window.setGlobalFilter) {
        if (formData.ville) {
            window.setGlobalFilter('ville', formData.ville);
        }
        if (formData.centre) {
            window.setGlobalFilter('centre', formData.centre);
        }
        if (formData.pays) {
            window.setGlobalFilter('pays', formData.pays);
        }
    }
});

// Supprimer le profil
function deleteProfile() {
    const profile = loadProfile();
    if (!profile) {
        showMessage("Aucun profil à supprimer.", "error");
        return;
    }
    
    const confirmed = confirm(
        `Êtes-vous sûr de vouloir supprimer votre profil professionnel ?\n\n` +
        `Cette action est irréversible. Vous devrez recréer votre profil pour continuer à utiliser l'application.`
    );
    
    if (confirmed) {
        localStorage.removeItem(STORAGE_KEY);
        showMessage("Profil supprimé avec succès.", "success");
        
        // Rediriger vers la page d'accueil après 2 secondes
        setTimeout(() => {
            window.location.href = "index-professionnel.html";
        }, 2000);
    }
}

// Initialisation au chargement de la page
document.addEventListener("DOMContentLoaded", function() {
    displayProfile();
});

// Exposer les fonctions globalement pour les boutons onclick
window.enableEditMode = enableEditMode;
window.cancelEdit = cancelEdit;
window.deleteProfile = deleteProfile;

