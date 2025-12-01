/**
 * Gestion du profil patiente
 * Permet de visualiser, modifier, ajouter et supprimer les informations de la patiente
 */

const STORAGE_KEY = "mama_patiente_data";
const STORAGE_KEY_PATIENTES = "mama_patientes"; // Pour les patientes créées par le pro
const profileMessage = document.getElementById("profile-message");
const profileDisplay = document.getElementById("profile-display");
const profileEditForm = document.getElementById("profile-edit-form");
const editForm = document.getElementById("edit-profile-form");

// Charger le profil
function loadProfile() {
    // Priorité 1: Données spécifiques de la patiente
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
        try {
            const data = JSON.parse(saved);
            if (data && data.id) {
                return data;
            }
        } catch (e) {
            console.error("Erreur lors du chargement du profil:", e);
        }
    }
    
    // Priorité 2: Chercher dans la liste des patientes créées par le professionnel
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has("id")) {
        const patienteId = parseInt(urlParams.get("id"));
        const storedPatientes = localStorage.getItem(STORAGE_KEY_PATIENTES);
        if (storedPatientes) {
            try {
                const allPatientes = JSON.parse(storedPatientes);
                const foundPatiente = allPatientes.find(p => p.id === patienteId);
                if (foundPatiente) {
                    return foundPatiente;
                }
            } catch (e) {
                console.error("Erreur lors du chargement depuis la liste des patientes:", e);
            }
        }
    }
    
    return null;
}

// Sauvegarder le profil
function saveProfile(data) {
    // Sauvegarder dans les deux emplacements pour cohérence
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    
    // Si la patiente a un ID et existe dans la liste des patientes, la mettre à jour
    if (data.id) {
        const storedPatientes = localStorage.getItem(STORAGE_KEY_PATIENTES);
        if (storedPatientes) {
            try {
                const allPatientes = JSON.parse(storedPatientes);
                const index = allPatientes.findIndex(p => p.id === data.id);
                if (index !== -1) {
                    allPatientes[index] = { ...allPatientes[index], ...data };
                    localStorage.setItem(STORAGE_KEY_PATIENTES, JSON.stringify(allPatientes));
                }
            } catch (e) {
                console.error("Erreur lors de la mise à jour de la liste des patientes:", e);
            }
        }
    }
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
                <span class="info-label">Âge</span>
                <span class="info-value">${profile.age ? `${profile.age} ans` : '<span class="empty">Non renseigné</span>'}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Nombre de grossesses</span>
                <span class="info-value">${profile.gestite || '<span class="empty">Non renseigné</span>'}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Nombre d'enfants nés</span>
                <span class="info-value">${profile.parite !== undefined ? profile.parite : '<span class="empty">Non renseigné</span>'}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Niveau d'études</span>
                <span class="info-value">${profile.niveau_instruction ? escapeHtml(formatNiveauInstruction(profile.niveau_instruction)) : '<span class="empty">Non renseigné</span>'}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Langue préférée</span>
                <span class="info-value">${profile.langue_preferee ? escapeHtml(formatLangue(profile.langue_preferee)) : '<span class="empty">Non renseigné</span>'}</span>
            </div>
        </div>

        <div class="info-section">
            <h3>Votre grossesse</h3>
            <div class="info-row">
                <span class="info-label">Date des dernières règles</span>
                <span class="info-value">${profile.date_dernieres_regles ? formatDate(profile.date_dernieres_regles) : '<span class="empty">Non renseigné</span>'}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Date prévue d'accouchement</span>
                <span class="info-value">${profile.date_accouchement_prevue ? formatDate(profile.date_accouchement_prevue) : '<span class="empty">Non renseigné</span>'}</span>
            </div>
        </div>

        <div class="info-section">
            <h3>Localisation</h3>
            <div class="info-row">
                <span class="info-label">Pays</span>
                <span class="info-value">${profile.pays ? escapeHtml(profile.pays) : '<span class="empty">Non renseigné</span>'}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Ville</span>
                <span class="info-value">${profile.ville ? escapeHtml(profile.ville) : '<span class="empty">Non renseigné</span>'}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Adresse</span>
                <span class="info-value">${profile.adresse ? escapeHtml(profile.adresse) : '<span class="empty">Non renseigné</span>'}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Distance au centre (km)</span>
                <span class="info-value">${profile.distance_centre ? `${profile.distance_centre} km` : '<span class="empty">Non renseigné</span>'}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Moyen de transport</span>
                <span class="info-value">${profile.moyen_transport ? escapeHtml(formatMoyenTransport(profile.moyen_transport)) : '<span class="empty">Non renseigné</span>'}</span>
            </div>
        </div>

        <div class="info-section">
            <h3>Contact et urgence</h3>
            <div class="info-row">
                <span class="info-label">Téléphone</span>
                <span class="info-value">${profile.telephone ? escapeHtml(profile.telephone) : '<span class="empty">Non renseigné</span>'}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Contact d'urgence</span>
                <span class="info-value">${profile.nom_contact_urgence ? escapeHtml(profile.nom_contact_urgence) : '<span class="empty">Non renseigné</span>'}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Téléphone d'urgence</span>
                <span class="info-value">${profile.telephone_urgence ? escapeHtml(profile.telephone_urgence) : '<span class="empty">Non renseigné</span>'}</span>
            </div>
        </div>

        ${profile.antecedents_medicaux || profile.antecedents_obstetricaux || profile.allergies ? `
        <div class="info-section">
            <h3>Antécédents médicaux</h3>
            ${profile.antecedents_medicaux ? `
            <div class="info-row">
                <span class="info-label">Antécédents médicaux</span>
                <span class="info-value">${escapeHtml(profile.antecedents_medicaux)}</span>
            </div>
            ` : ''}
            ${profile.antecedents_obstetricaux ? `
            <div class="info-row">
                <span class="info-label">Antécédents obstétricaux</span>
                <span class="info-value">${escapeHtml(profile.antecedents_obstetricaux)}</span>
            </div>
            ` : ''}
            ${profile.allergies ? `
            <div class="info-row">
                <span class="info-label">Allergies</span>
                <span class="info-value">${escapeHtml(profile.allergies)}</span>
            </div>
            ` : ''}
        </div>
        ` : ''}
    `;
}

// Formater les valeurs
function formatNiveauInstruction(niveau) {
    const niveaux = {
        "aucun": "Pas d'école",
        "primaire": "École primaire",
        "secondaire": "École secondaire",
        "superieur": "Études supérieures"
    };
    return niveaux[niveau] || niveau;
}

function formatLangue(langue) {
    const langues = {
        "fr": "Français",
        "bambara": "Bambara",
        "wolof": "Wolof",
        "dioula": "Dioula",
        "autre": "Autre"
    };
    return langues[langue] || langue;
}

function formatMoyenTransport(transport) {
    const transports = {
        "pieds": "À pied",
        "velo": "À vélo",
        "moto": "En moto",
        "voiture": "En voiture",
        "transport_public": "Transport public"
    };
    return transports[transport] || transport;
}

function formatDate(dateString) {
    if (!dateString) return "";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString("fr-FR", { year: "numeric", month: "long", day: "numeric" });
}

// Activer le mode édition
function enableEditMode() {
    const profile = loadProfile() || {};
    
    // Remplir le formulaire avec les données existantes
    document.getElementById("edit-prenom").value = profile.prenom || "";
    document.getElementById("edit-nom").value = profile.nom || "";
    document.getElementById("edit-age").value = profile.age || "";
    document.getElementById("edit-gestite").value = profile.gestite || 1;
    document.getElementById("edit-parite").value = profile.parite !== undefined ? profile.parite : 0;
    document.getElementById("edit-niveau-instruction").value = profile.niveau_instruction || "";
    document.getElementById("edit-langue-preferee").value = profile.langue_preferee || "fr";
    document.getElementById("edit-dernieres-regles").value = profile.date_dernieres_regles ? formatDateForInput(profile.date_dernieres_regles) : "";
    document.getElementById("edit-accouchement-prevue").value = profile.date_accouchement_prevue ? formatDateForInput(profile.date_accouchement_prevue) : "";
    document.getElementById("edit-pays").value = profile.pays || "";
    document.getElementById("edit-ville").value = profile.ville || "";
    document.getElementById("edit-adresse").value = profile.adresse || "";
    document.getElementById("edit-distance-centre").value = profile.distance_centre || "";
    document.getElementById("edit-moyen-transport").value = profile.moyen_transport || "";
    document.getElementById("edit-telephone").value = profile.telephone || "";
    document.getElementById("edit-nom-contact-urgence").value = profile.nom_contact_urgence || "";
    document.getElementById("edit-telephone-urgence").value = profile.telephone_urgence || "";
    document.getElementById("edit-antecedents-medicaux").value = profile.antecedents_medicaux || "";
    document.getElementById("edit-antecedents-obstetricaux").value = profile.antecedents_obstetricaux || "";
    document.getElementById("edit-allergies").value = profile.allergies || "";
    
    // Afficher le formulaire et masquer l'affichage
    profileDisplay.classList.add("hidden");
    profileEditForm.classList.remove("hidden");
}

// Formater la date pour l'input date (YYYY-MM-DD)
function formatDateForInput(dateString) {
    if (!dateString) return "";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
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
    
    const profile = loadProfile() || {};
    
    const formData = {
        // Préserver l'ID si existant
        id: profile.id || Date.now(),
        
        // Informations personnelles
        prenom: document.getElementById("edit-prenom").value.trim(),
        nom: document.getElementById("edit-nom").value.trim(),
        age: parseInt(document.getElementById("edit-age").value) || null,
        gestite: parseInt(document.getElementById("edit-gestite").value) || 1,
        parite: parseInt(document.getElementById("edit-parite").value) || 0,
        niveau_instruction: document.getElementById("edit-niveau-instruction").value,
        langue_preferee: document.getElementById("edit-langue-preferee").value || "fr",
        
        // Grossesse
        date_dernieres_regles: document.getElementById("edit-dernieres-regles").value || null,
        date_accouchement_prevue: document.getElementById("edit-accouchement-prevue").value || null,
        
        // Localisation
        pays: document.getElementById("edit-pays").value,
        ville: document.getElementById("edit-ville").value.trim(),
        adresse: document.getElementById("edit-adresse").value.trim(),
        distance_centre: parseFloat(document.getElementById("edit-distance-centre").value) || null,
        moyen_transport: document.getElementById("edit-moyen-transport").value || null,
        
        // Contact
        telephone: document.getElementById("edit-telephone").value.trim(),
        nom_contact_urgence: document.getElementById("edit-nom-contact-urgence").value.trim(),
        telephone_urgence: document.getElementById("edit-telephone-urgence").value.trim(),
        
        // Antécédents
        antecedents_medicaux: document.getElementById("edit-antecedents-medicaux").value.trim(),
        antecedents_obstetricaux: document.getElementById("edit-antecedents-obstetricaux").value.trim(),
        allergies: document.getElementById("edit-allergies").value.trim(),
        
        // Métadonnées
        updated_at: new Date().toISOString()
    };
    
    // Validation
    if (!formData.prenom || !formData.nom || !formData.age) {
        showMessage("Veuillez remplir tous les champs obligatoires (Prénom, Nom, Âge).", "error");
        return;
    }
    
    // Validation de l'âge
    if (formData.age < 15 || formData.age > 50) {
        showMessage("L'âge doit être entre 15 et 50 ans.", "error");
        return;
    }
    
    // Validation du téléphone si fourni
    if (formData.telephone) {
        const phoneRegex = /^\+?[0-9]{8,15}$/;
        if (!phoneRegex.test(formData.telephone.replace(/\s/g, ""))) {
            showMessage("Le numéro de téléphone n'est pas valide.", "error");
            return;
        }
    }
    
    // Préserver les données existantes importantes
    if (profile.cpn_list) {
        formData.cpn_list = profile.cpn_list;
    }
    if (profile.consultations) {
        formData.consultations = profile.consultations;
    }
    if (profile.centre_sante) {
        formData.centre_sante = profile.centre_sante;
    }
    if (profile.pro_referent) {
        formData.pro_referent = profile.pro_referent;
    }
    if (profile.data_source) {
        formData.data_source = profile.data_source;
    }
    
    // Date de création
    if (profile.created_at) {
        formData.created_at = profile.created_at;
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
});

// Supprimer le profil
function deleteProfile() {
    const profile = loadProfile();
    if (!profile) {
        showMessage("Aucun profil à supprimer.", "error");
        return;
    }
    
    const confirmed = confirm(
        `Êtes-vous sûr de vouloir supprimer votre profil ?\n\n` +
        `Cette action est irréversible. Vous devrez recréer votre profil pour continuer à utiliser l'application.`
    );
    
    if (confirmed) {
        // Supprimer les données
        localStorage.removeItem(STORAGE_KEY);
        
        // Si la patiente existe dans la liste des patientes, la supprimer aussi
        if (profile.id) {
            const storedPatientes = localStorage.getItem(STORAGE_KEY_PATIENTES);
            if (storedPatientes) {
                try {
                    const allPatientes = JSON.parse(storedPatientes);
                    const filtered = allPatientes.filter(p => p.id !== profile.id);
                    localStorage.setItem(STORAGE_KEY_PATIENTES, JSON.stringify(filtered));
                } catch (e) {
                    console.error("Erreur lors de la suppression de la liste des patientes:", e);
                }
            }
        }
        
        showMessage("Profil supprimé avec succès.", "success");
        
        // Rediriger vers la page d'accueil après 2 secondes
        setTimeout(() => {
            window.location.href = "index-patriente.html";
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

