const API_BASE = "http://localhost:8000/api";

let authToken = localStorage.getItem("mama_token") || "";
let patienteData = null;

const userInfo = document.querySelector("#user-info");
const userName = document.querySelector("#user-name");
const logoutButton = document.querySelector("#logout-button");
const profileName = document.querySelector("#profile-name");
const profileAge = document.querySelector("#profile-age");
const profileDossier = document.querySelector("#profile-dossier");
const profileWeek = document.querySelector("#profile-week");
const dossierContent = document.querySelector("#dossier-content");

const defaultHeaders = () => {
  const headers = { "Content-Type": "application/json" };
  if (authToken) {
    headers["Authorization"] = `Bearer ${authToken}`;
  }
  return headers;
};

async function fetchJSON(path, options = {}) {
  const USE_MOCK = window.USE_MOCK_DATA !== false;
  
  try {
    const response = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers: { ...defaultHeaders(), ...(options.headers || {}) },
      mode: "cors",
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    if (response.status === 204) {
      return null;
    }
    
    return await response.json();
  } catch (error) {
    if (USE_MOCK && (error instanceof TypeError || error.message.includes("fetch") || error.message.includes("HTTP"))) {
      console.log(`[Mode démonstration] Utilisation de données mockées pour ${path}`);
      return await getMockData(path, options);
    }
    
    console.error(`Erreur API ${path}:`, error);
    throw error;
  }
}

async function getMockData(path, options = {}) {
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const mockPatiente = {
    id: 1,
    prenom: "Awa",
    nom: "Koffi",
    age: 28,
    date_dernieres_regles: "2024-01-15",
    date_accouchement_prevue: "2024-10-22"
  };
  
  const mockDossier = {
    patiente: {
      ...mockPatiente,
      user: { telephone: "+22370000001" }
    },
    consultations: [
      {
        id: 1,
        date_consultation: "2024-02-15T09:00:00",
        poids: 65.5,
        tension_arterielle_systolique: 120,
        tension_arterielle_diastolique: 80,
        notes: "Consultation normale, tout va bien."
      },
      {
        id: 2,
        date_consultation: "2024-03-15T09:00:00",
        poids: 67.2,
        tension_arterielle_systolique: 118,
        tension_arterielle_diastolique: 78,
        notes: "Poids normal, tension stable."
      }
    ],
    vaccinations: [
      {
        id: 1,
        type_vaccin: "Tétanos",
        date_vaccination: "2024-02-15",
        site_injection: "Bras gauche"
      }
    ],
    cpn: [
      {
        id: 1,
        numero_cpn: 1,
        date_rdv: "2024-02-15T09:00:00",
        statut: "complete"
      },
      {
        id: 2,
        numero_cpn: 2,
        date_rdv: "2024-03-15T09:00:00",
        statut: "complete"
      },
      {
        id: 3,
        numero_cpn: 3,
        date_rdv: "2024-04-20T10:00:00",
        statut: "planifie"
      }
    ],
    prediction_risk: {
      available: true,
      risk_score: 0.68,
      risk_level: "moyen",
      confidence: 0.85,
      recommendations: [
        "Hydratez-vous davantage et reposez-vous.",
        "Si vous ressentez des maux de tête fréquents, consultez sans attendre."
      ]
    }
  };
  
  if (path.startsWith("/patientes/") && path.endsWith("/dossier")) {
    return mockDossier;
  }
  
  if (path === "/patientes/") {
    return [mockPatiente];
  }
  
  return null;
}

function calculatePregnancyWeek(dateDernieresRegles, dateAccouchementPrevue) {
  if (dateAccouchementPrevue) {
    const today = new Date();
    const dueDate = new Date(dateAccouchementPrevue);
    const diffTime = dueDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const weeks = Math.floor((280 - diffDays) / 7);
    return Math.max(0, Math.min(42, weeks));
  } else if (dateDernieresRegles) {
    const today = new Date();
    const lastPeriod = new Date(dateDernieresRegles);
    const diffTime = today - lastPeriod;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const weeks = Math.floor(diffDays / 7);
    return Math.max(0, Math.min(42, weeks));
  }
  return null;
}

function renderProfile(patiente) {
  if (!patiente) return;
  
  // Utiliser "mama+" comme nom pour la démonstration
  const nom = "mama+";
  const age = patiente.age ? `${patiente.age} ans` : "";
  const dossier = patiente.id ? `Dossier #${patiente.id}` : "";
  
  const semaine = calculatePregnancyWeek(
    patiente.date_dernieres_regles,
    patiente.date_accouchement_prevue
  );
  const semaineText = semaine !== null ? `Semaine ${semaine} de grossesse` : "Semaine non calculée";
  
  // Afficher "mama+" pour la démonstration
  if (profileName) profileName.textContent = nom;
  if (profileAge) profileAge.textContent = age;
  if (profileDossier) profileDossier.textContent = dossier;
  if (profileWeek) profileWeek.textContent = semaineText;
}

// Fonctions d'aide intelligente
function getWeightAdvice(poids, semaineGrossesse) {
  if (!poids || !semaineGrossesse) return null;
  
  // Gain de poids recommandé pendant la grossesse
  const gainNormal = semaineGrossesse * 0.4; // ~0.4 kg par semaine en moyenne
  const poidsInitial = poids - gainNormal;
  
  if (gainNormal < 5) {
    return { type: "info", message: "Votre prise de poids est dans la normale pour cette période de grossesse." };
  } else if (gainNormal > 15) {
    return { type: "warning", message: "Prise de poids importante. Consultez votre médecin pour un suivi nutritionnel." };
  }
  return null;
}

function getBloodPressureAdvice(systolique, diastolique) {
  if (!systolique || !diastolique) return null;
  
  if (systolique >= 140 || diastolique >= 90) {
    return { 
      type: "alert", 
      message: "⚠️ Tension artérielle élevée détectée. Consultez immédiatement votre médecin." 
    };
  } else if (systolique >= 130 || diastolique >= 85) {
    return { 
      type: "warning", 
      message: "Tension artérielle légèrement élevée. Surveillez régulièrement et consultez si cela persiste." 
    };
  } else if (systolique < 90 || diastolique < 60) {
    return { 
      type: "info", 
      message: "Tension artérielle basse. Assurez-vous de bien vous hydrater et de vous lever lentement." 
    };
  }
  return { type: "success", message: "✅ Tension artérielle normale." };
}

function getCPNStatusExplanation(statut) {
  const explanations = {
    "planifie": "Rendez-vous programmé. Pensez à confirmer votre présence 24h avant.",
    "confirme": "Rendez-vous confirmé. Préparez vos questions pour le professionnel de santé.",
    "complete": "Consultation terminée. Suivez les recommandations de votre médecin.",
    "manque": "Rendez-vous manqué. Contactez rapidement votre centre de santé pour reprogrammer."
  };
  return explanations[statut] || "";
}

function getVaccinationInfo(typeVaccin) {
  const infos = {
    "Tétanos": "Le vaccin contre le tétanos est recommandé pendant la grossesse pour protéger la mère et le nouveau-né.",
    "Coqueluche": "Recommandé entre 27 et 36 semaines de grossesse pour protéger le bébé à la naissance.",
    "Grippe": "Recommandé pendant la saison grippale pour protéger la mère et le bébé."
  };
  return infos[typeVaccin] || "Vaccination importante pour votre santé et celle de votre bébé.";
}

function renderDossier(dossier) {
  // Vérifier que l'élément existe
  if (!dossierContent) {
    console.error("Élément dossier-content introuvable");
    return;
  }
  
  if (!dossier) {
    renderEmptyDossier();
    return;
  }
  
  // Calculer la semaine de grossesse pour les conseils
  const semaineGrossesse = calculatePregnancyWeek(
    dossier.patiente?.date_dernieres_regles,
    dossier.patiente?.date_accouchement_prevue
  ) || 0;
  
  // Trier les consultations médicales par date (plus récentes en premier)
  // IMPORTANT: Utiliser uniquement dossier.consultations (pas les CPN)
  const consultationsSorted = dossier.consultations && Array.isArray(dossier.consultations) && dossier.consultations.length > 0
    ? [...dossier.consultations]
        .filter(c => c && c.date_consultation) // Filtrer pour ne garder que les vraies consultations
        .sort((a, b) => new Date(b.date_consultation) - new Date(a.date_consultation))
    : [];
  
  // Rendre uniquement les consultations médicales (pas les CPN)
  // Filtrer et mapper uniquement les consultations avec date_consultation (pas les CPN)
  const consultationsHTML = consultationsSorted.length > 0
    ? consultationsSorted
        .map(
          (c) => {
            // Vérifier que c'est bien une consultation médicale (pas une CPN)
            // Une consultation doit avoir date_consultation et ne doit PAS avoir numero_cpn
            if (!c.date_consultation || c.numero_cpn || c.date_rdv) {
              return null; // Ignorer si c'est une CPN ou si la date de consultation est manquante
            }
            
            const date = new Date(c.date_consultation);
            // Vérifier que la date est valide
            if (isNaN(date.getTime())) {
              return null; // Ignorer les dates invalides
            }
            
            // Formatage robuste de la date
            const dayNames = ['DIM', 'LUN', 'MAR', 'MER', 'JEU', 'VEN', 'SAM'];
            const monthNames = ['JANVIER', 'FÉVRIER', 'MARS', 'AVRIL', 'MAI', 'JUIN',
                               'JUILLET', 'AOÛT', 'SEPTEMBRE', 'OCTOBRE', 'NOVEMBRE', 'DÉCEMBRE'];
            
            return `
            <div class="dossier-item consultation-item">
              <div class="item-icon-large consultation-icon">🩺</div>
              <div class="item-content-enhanced">
                <div class="consultation-header">
                  <div class="consultation-header-left">
                    <strong class="consultation-title">Consultation médicale</strong>
                    <button class="help-icon consultation-help" aria-label="Information sur la consultation" data-help="Consultation de suivi de grossesse avec mesure du poids et de la tension artérielle.">ℹ️</button>
                  </div>
                </div>
                <div class="consultation-date-full">
                  ${date.toLocaleDateString("fr-FR", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric"
                  }).toLowerCase()}
                </div>
                <div class="consultation-metrics">
                  ${c.poids !== null && c.poids !== undefined ? `
                    <div class="consultation-metric-item">
                      <span class="metric-label-small">Poids:</span>
                      <span class="metric-value-small">${c.poids} kg</span>
                      ${getWeightAdvice(c.poids, semaineGrossesse) ? `
                        <div class="metric-advice-small ${getWeightAdvice(c.poids, semaineGrossesse).type}">
                          ${getWeightAdvice(c.poids, semaineGrossesse).message}
                        </div>
                      ` : ""}
                    </div>
                  ` : ""}
                  ${c.tension_arterielle_systolique !== null && c.tension_arterielle_systolique !== undefined ? `
                    <div class="consultation-metric-item">
                      <span class="metric-label-small">Tension artérielle:</span>
                      <span class="metric-value-small">${c.tension_arterielle_systolique}/${c.tension_arterielle_diastolique || "–"}</span>
                      ${getBloodPressureAdvice(c.tension_arterielle_systolique, c.tension_arterielle_diastolique) ? `
                        <div class="metric-advice-small ${getBloodPressureAdvice(c.tension_arterielle_systolique, c.tension_arterielle_diastolique).type}">
                          ${getBloodPressureAdvice(c.tension_arterielle_systolique, c.tension_arterielle_diastolique).message}
                        </div>
                      ` : ""}
                    </div>
                  ` : ""}
                </div>
                ${c.notes ? `
                  <div class="consultation-notes">
                    <p>${c.notes}</p>
                  </div>
                ` : ""}
              </div>
            </div>
          `;
          }
        )
        .filter(html => html !== null) // Supprimer les valeurs null
        .join("")
    : '';
  
  // Afficher le message vide si aucune consultation valide
  const consultations = consultationsHTML || '<div class="empty-state-small"><p>Aucune consultation enregistrée.</p></div>';
  
  // Compter uniquement les consultations valides (pas les CPN)
  const consultationsCount = consultationsSorted.filter(c => 
    c && c.date_consultation && !c.numero_cpn && !c.date_rdv && !isNaN(new Date(c.date_consultation).getTime())
  ).length;

  // Trier les vaccinations par date (plus récentes en premier)
  const vaccinationsSorted = dossier.vaccinations && dossier.vaccinations.length > 0
    ? [...dossier.vaccinations].sort((a, b) => new Date(b.date_vaccination) - new Date(a.date_vaccination))
    : [];
  
  const vaccinations = vaccinationsSorted.length > 0
    ? vaccinationsSorted
    .map(
      (v) => {
        const date = new Date(v.date_vaccination);
        return `
            <div class="dossier-item vaccination-item">
              <div class="item-icon-large vaccination-icon">💉</div>
              <div class="item-content-enhanced">
                <div class="vaccination-header">
                  <div class="vaccination-header-left">
                    <strong class="vaccination-type">${v.type_vaccin}</strong>
                    <button class="help-icon vaccination-help" aria-label="Information sur la vaccination" data-help="${getVaccinationInfo(v.type_vaccin)}">ℹ️</button>
                  </div>
                </div>
                <div class="vaccination-details">
                  <span class="vaccination-date">${date.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" })}</span>
                  ${v.site_injection ? `<span class="vaccination-site">${v.site_injection}</span>` : ""}
                </div>
                <div class="vaccination-info">
                  💡 ${getVaccinationInfo(v.type_vaccin)}
                </div>
              </div>
            </div>
          `;
      }
    )
    .join("")
    : '<div class="empty-state-small"><p>Aucune vaccination enregistrée.</p></div>';

  // Trier les CPN : d'abord par statut (planifiées en premier), puis par date
  const cpnSorted = dossier.cpn && dossier.cpn.length > 0
    ? [...dossier.cpn].sort((a, b) => {
        // Ordre de priorité des statuts
        const statutOrder = { planifie: 0, confirme: 1, complete: 2, manque: 3 };
        const statutA = statutOrder[a.statut] !== undefined ? statutOrder[a.statut] : 99;
        const statutB = statutOrder[b.statut] !== undefined ? statutOrder[b.statut] : 99;
        
        // Si statuts différents, trier par statut
        if (statutA !== statutB) {
          return statutA - statutB;
        }
        
        // Si même statut, trier par date (plus récentes en premier)
        return new Date(b.date_rdv) - new Date(a.date_rdv);
      })
    : [];
  
  const cpnList = cpnSorted.length > 0
    ? cpnSorted
    .map(
          (cpn) => {
            const date = new Date(cpn.date_rdv);
            const statutClass = cpn.statut === "complete" ? "statut-complete" : 
                               cpn.statut === "confirme" ? "statut-confirme" : 
                               cpn.statut === "manque" ? "statut-manque" : "statut-planifie";
            const statutText = cpn.statut === "complete" ? "COMPLÉTÉE" : 
                              cpn.statut === "confirme" ? "CONFIRMÉE" : 
                              cpn.statut === "manque" ? "MANQUÉE" : "PLANIFIÉE";
            return `
              <div class="dossier-item cpn-item">
                <div class="item-icon-large cpn-icon">📅</div>
                <div class="item-content-enhanced">
                  <div class="cpn-header">
                    <div class="cpn-header-left">
                      <strong class="cpn-number">CPN ${cpn.numero_cpn}</strong>
                      <button class="help-icon cpn-help" aria-label="Information sur le statut CPN" data-help="${getCPNStatusExplanation(cpn.statut)}">ℹ️</button>
                    </div>
                    <span class="statut-badge-enhanced ${statutClass}" aria-label="Statut: ${statutText}">${statutText}</span>
                  </div>
                  <div class="cpn-date-full">
                    ${date.toLocaleDateString("fr-FR", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric"
                    }).toLowerCase()}
                  </div>
                  ${getCPNStatusExplanation(cpn.statut) ? `
                    <div class="cpn-advice ${statutClass}">
                      💡 ${getCPNStatusExplanation(cpn.statut)}
                    </div>
                  ` : ""}
                  ${cpn.notes ? `<p class="cpn-notes">${cpn.notes}</p>` : ""}
                </div>
              </div>
            `;
          }
        )
        .join("")
    : '<div class="empty-state-small"><p>Aucun rendez-vous programmé.</p></div>';

  // Structure du dossier : chaque section contient uniquement ses propres données
  // - consultations-section : uniquement les consultations médicales
  // - cpn-section : uniquement les rendez-vous CPN
  // - vaccinations-section : uniquement les vaccinations
  dossierContent.innerHTML = `
    <div class="dossier-grids-enhanced" id="dossier-sections">
      <!-- Section Consultations : uniquement les consultations médicales -->
      <article class="dossier-section-enhanced section-icon-consultation" id="consultations-section" role="tabpanel" aria-labelledby="tab-consultations" aria-hidden="false">
        <div class="section-header-enhanced">
          <div class="section-icon-wrapper section-icon-consultation">
            <span class="section-icon-large">🩺</span>
          </div>
          <div class="section-title-wrapper">
            <h3 class="section-title">Consultations</h3>
            <span class="section-count">${consultationsCount}</span>
          </div>
        </div>
        <div class="dossier-list-enhanced" id="consultations-list">${consultations}</div>
      </article>
      
      <!-- Section CPN : uniquement les rendez-vous CPN -->
      <article class="dossier-section-enhanced section-icon-cpn" id="cpn-section" role="tabpanel" aria-labelledby="tab-cpn" aria-hidden="true">
        <div class="section-header-enhanced">
          <div class="section-icon-wrapper section-icon-cpn">
            <span class="section-icon-large">📅</span>
          </div>
          <div class="section-title-wrapper">
            <h3 class="section-title">Rendez-vous CPN</h3>
            <span class="section-count">${cpnSorted.length}</span>
          </div>
        </div>
        <div class="dossier-list-enhanced">${cpnList}</div>
      </article>
      
      <!-- Section Vaccinations : uniquement les vaccinations -->
      <article class="dossier-section-enhanced section-icon-vaccination" id="vaccinations-section" role="tabpanel" aria-labelledby="tab-vaccinations" aria-hidden="true">
        <div class="section-header-enhanced">
          <div class="section-icon-wrapper section-icon-vaccination">
            <span class="section-icon-large">💉</span>
          </div>
          <div class="section-title-wrapper">
            <h3 class="section-title">Vaccinations</h3>
            <span class="section-count">${vaccinationsSorted.length}</span>
          </div>
        </div>
        <div class="dossier-list-enhanced">${vaccinations}</div>
      </article>
      
      <!-- Section Établissements de santé : hôpitaux et pharmacies à proximité -->
      <article class="dossier-section-enhanced section-icon-facilities" id="facilities-section" role="tabpanel" aria-labelledby="tab-facilities" aria-hidden="true">
        <div class="section-header-enhanced">
          <div class="section-icon-wrapper section-icon-facilities">
            <span class="section-icon-large">🏥</span>
          </div>
          <div class="section-title-wrapper">
            <h3 class="section-title">Établissements de santé</h3>
            <span class="section-count" id="facilities-count">0</span>
          </div>
        </div>
        <div class="dossier-list-enhanced" id="facilities-list">
          <div class="loading-state-small">
            <p>Chargement des établissements...</p>
          </div>
        </div>
      </article>
    </div>
  `;
  
  // Initialiser les onglets après le rendu (l'onglet "Consultations" sera actif par défaut)
  setTimeout(() => {
    initDossierTabs();
    // Afficher la section Consultations par défaut
    const consultationsSection = document.querySelector("#consultations-section");
    if (consultationsSection) {
      consultationsSection.style.display = "";
      consultationsSection.setAttribute("aria-hidden", "false");
    }
  }, 100);
  
  // Charger et afficher les établissements de santé à proximité
  setTimeout(() => {
    renderHealthFacilities(dossier.patiente);
  }, 200);
}

// Afficher les établissements de santé à proximité
function renderHealthFacilities(patiente) {
  if (!patiente || !window.getNearestFacilities) {
    const facilitiesList = document.getElementById('facilities-list') || document.getElementById('facilities-list-empty');
    if (facilitiesList) {
      facilitiesList.innerHTML = '<div class="empty-state-small"><p>Données de localisation non disponibles</p></div>';
    }
    return;
  }
  
  try {
    const { hopitaux, pharmacies } = window.getNearestFacilities(patiente, 5);
    const facilitiesList = document.getElementById('facilities-list') || document.getElementById('facilities-list-empty');
    const facilitiesCount = document.getElementById('facilities-count') || document.getElementById('facilities-count-empty');
    
    if (!facilitiesList) return;
    
    let html = '';
    
    // Section Hôpitaux
    if (hopitaux.length > 0) {
      html += `
        <div class="facilities-category">
          <h4 class="facilities-category-title">
            <span class="facility-icon hospital-icon">🏥</span>
            Hôpitaux à proximité
          </h4>
          <div class="facilities-grid">
            ${hopitaux.map(hopital => `
              <div class="facility-card hospital-card">
                <div class="facility-header">
                  <h5 class="facility-name">${hopital.nom}</h5>
                  <span class="facility-distance">${hopital.distance.toFixed(1)} km</span>
                </div>
                <div class="facility-details">
                  <p class="facility-address">📍 ${hopital.adresse}</p>
                  ${hopital.telephone ? `
                    <p class="facility-phone">
                      <a href="tel:${hopital.telephone}" class="phone-link">
                        📞 ${hopital.telephone}
                      </a>
                    </p>
                  ` : ''}
                  ${hopital.services && hopital.services.length > 0 ? `
                    <div class="facility-services">
                      <strong>Services:</strong>
                      <div class="services-tags">
                        ${hopital.services.map(service => `<span class="service-tag">${service}</span>`).join('')}
                      </div>
                    </div>
                  ` : ''}
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }
    
    // Section Pharmacies
    if (pharmacies.length > 0) {
      html += `
        <div class="facilities-category">
          <h4 class="facilities-category-title">
            <span class="facility-icon pharmacy-icon">💊</span>
            Pharmacies à proximité
          </h4>
          <div class="facilities-grid">
            ${pharmacies.map(pharmacie => `
              <div class="facility-card pharmacy-card">
                <div class="facility-header">
                  <h5 class="facility-name">${pharmacie.nom}</h5>
                  <span class="facility-distance">${pharmacie.distance.toFixed(1)} km</span>
                </div>
                <div class="facility-details">
                  <p class="facility-address">📍 ${pharmacie.adresse}</p>
                  ${pharmacie.telephone ? `
                    <p class="facility-phone">
                      <a href="tel:${pharmacie.telephone}" class="phone-link">
                        📞 ${pharmacie.telephone}
                      </a>
                    </p>
                  ` : ''}
                  ${pharmacie.services && pharmacie.services.length > 0 ? `
                    <div class="facility-services">
                      <strong>Services:</strong>
                      <div class="services-tags">
                        ${pharmacie.services.map(service => `<span class="service-tag">${service}</span>`).join('')}
                      </div>
                    </div>
                  ` : ''}
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }
    
    if (html === '') {
      html = '<div class="empty-state-small"><p>Aucun établissement de santé trouvé dans votre région</p></div>';
    }
    
    facilitiesList.innerHTML = html;
    
    if (facilitiesCount) {
      facilitiesCount.textContent = hopitaux.length + pharmacies.length;
    }
    
  } catch (error) {
    console.error('Erreur lors du chargement des établissements:', error);
    const facilitiesList = document.getElementById('facilities-list');
    if (facilitiesList) {
      facilitiesList.innerHTML = '<div class="empty-state-small"><p>Erreur lors du chargement des établissements</p></div>';
    }
  }
}

function renderEmptyDossier() {
  if (!dossierContent) return;
  
  dossierContent.innerHTML = `
    <div class="dossier-grids-enhanced" id="dossier-sections">
      <article class="dossier-section-enhanced section-icon-consultation" id="consultations-section" role="tabpanel" aria-labelledby="tab-consultations" aria-hidden="false">
        <div class="section-header-enhanced">
          <div class="section-icon-wrapper section-icon-consultation">
            <span class="section-icon-large">🩺</span>
          </div>
          <div class="section-title-wrapper">
            <h3 class="section-title">Consultations</h3>
            <span class="section-count">0</span>
          </div>
        </div>
        <div class="empty-state-small">
          <p>Aucune consultation enregistrée pour le moment.</p>
        </div>
      </article>
      <article class="dossier-section-enhanced section-icon-cpn" id="cpn-section" role="tabpanel" aria-labelledby="tab-cpn" aria-hidden="false">
        <div class="section-header-enhanced">
          <div class="section-icon-wrapper section-icon-cpn">
            <span class="section-icon-large">📅</span>
          </div>
          <div class="section-title-wrapper">
            <h3 class="section-title">Rendez-vous CPN</h3>
            <span class="section-count">0</span>
          </div>
        </div>
        <div class="empty-state-small">
          <p>Aucun rendez-vous programmé pour le moment.</p>
        </div>
      </article>
      <article class="dossier-section-enhanced section-icon-vaccination" id="vaccinations-section" role="tabpanel" aria-labelledby="tab-vaccinations" aria-hidden="false">
        <div class="section-header-enhanced">
          <div class="section-icon-wrapper section-icon-vaccination">
            <span class="section-icon-large">💉</span>
          </div>
          <div class="section-title-wrapper">
            <h3 class="section-title">Vaccinations</h3>
            <span class="section-count">0</span>
          </div>
        </div>
        <div class="empty-state-small">
          <p>Aucune vaccination enregistrée pour le moment.</p>
        </div>
      </article>
      <article class="dossier-section-enhanced section-icon-facilities" id="facilities-section" role="tabpanel" aria-labelledby="tab-facilities" aria-hidden="false">
        <div class="section-header-enhanced">
          <div class="section-icon-wrapper section-icon-facilities">
            <span class="section-icon-large">🏥</span>
          </div>
          <div class="section-title-wrapper">
            <h3 class="section-title">Établissements de santé</h3>
            <span class="section-count" id="facilities-count-empty">0</span>
          </div>
        </div>
        <div class="dossier-list-enhanced" id="facilities-list-empty">
          <div class="loading-state-small">
            <p>Chargement des établissements...</p>
          </div>
        </div>
      </article>
    </div>
  `;
  
  // Initialiser les onglets après le rendu
  setTimeout(initDossierTabs, 100);
  
  // Charger les établissements même si le dossier est vide
  setTimeout(() => {
    if (window.getNearestFacilities) {
      // Essayer de récupérer les données de la patiente depuis localStorage
      const stored = localStorage.getItem('mama_patiente_data');
      if (stored) {
        try {
          const patiente = JSON.parse(stored);
          renderHealthFacilities(patiente);
        } catch (e) {
          console.error('Erreur lors du chargement de la patiente:', e);
        }
      }
    }
  }, 200);
}

// Gestion des onglets du dossier médical
function initDossierTabs() {
  const tabBtns = document.querySelectorAll("#dossier-tabs .tab-btn-enhanced");
  const sections = {
    consultations: document.querySelector("#consultations-section"),
    cpn: document.querySelector("#cpn-section"),
    vaccinations: document.querySelector("#vaccinations-section"),
    facilities: document.querySelector("#facilities-section")
  };
  
  const container = document.querySelector("#dossier-sections");
  
  if (!tabBtns.length) return;
  
  function switchDossierTab(tabName) {
    // Désactiver tous les onglets
    tabBtns.forEach(btn => {
      btn.classList.remove("active");
      btn.setAttribute("aria-selected", "false");
      btn.setAttribute("tabindex", "-1");
    });
    
    // Activer l'onglet sélectionné
    const activeBtn = document.querySelector(`#dossier-tabs .tab-btn-enhanced[data-tab="${tabName}"]`);
    if (activeBtn) {
      activeBtn.classList.add("active");
      activeBtn.setAttribute("aria-selected", "true");
      activeBtn.setAttribute("tabindex", "0");
      activeBtn.focus();
    }
    
    // Masquer toutes les sections
    if (container) {
      container.style.display = "grid";
      container.style.gridTemplateColumns = "1fr";
    }
    Object.values(sections).forEach(section => {
      if (section) {
        section.style.display = "none";
        section.setAttribute("aria-hidden", "true");
      }
    });
    
    // Afficher uniquement la section sélectionnée
    if (sections[tabName]) {
      sections[tabName].style.display = "";
      sections[tabName].setAttribute("aria-hidden", "false");
    }
  }
  
  // Gestion des clics sur les onglets
  tabBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const tabName = btn.getAttribute("data-tab");
      switchDossierTab(tabName);
    });
    
    // Navigation au clavier
    btn.addEventListener("keydown", (e) => {
      const tabs = Array.from(tabBtns);
      const currentIndex = tabs.indexOf(btn);
      
      if (e.key === "ArrowLeft" && currentIndex > 0) {
        e.preventDefault();
        switchDossierTab(tabs[currentIndex - 1].getAttribute("data-tab"));
      } else if (e.key === "ArrowRight" && currentIndex < tabs.length - 1) {
        e.preventDefault();
        switchDossierTab(tabs[currentIndex + 1].getAttribute("data-tab"));
      } else if (e.key === "Home") {
        e.preventDefault();
        switchDossierTab(tabs[0].getAttribute("data-tab"));
      } else if (e.key === "End") {
        e.preventDefault();
        switchDossierTab(tabs[tabs.length - 1].getAttribute("data-tab"));
      } else if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        switchDossierTab(btn.getAttribute("data-tab"));
      }
    });
  });
}

function loadSavedPatienteData() {
  const saved = localStorage.getItem("mama_patiente_data");
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      return null;
    }
  }
  return null;
}

function handleLogout() {
  authToken = "";
  localStorage.removeItem("mama_token");
  window.location.href = "index.html";
}

async function bootstrap() {
  try {
    // Afficher l'état de chargement
    if (dossierContent) {
      dossierContent.innerHTML = `
        <div class="loading-state">
          <div class="spinner"></div>
          <p>Chargement de votre dossier médical...</p>
        </div>
      `;
    }
    
    // Section user-info masquée - Mode développement supprimé
    
    const savedData = loadSavedPatienteData();
    if (savedData) {
      patienteData = savedData;
      renderProfile(patienteData);
    } else {
      try {
        const patientes = await fetchJSON("/patientes/");
        if (patientes && patientes.length > 0) {
          patienteData = patientes[0];
          renderProfile(patienteData);
        }
      } catch (error) {
        console.error("Erreur lors du chargement des patientes:", error);
        // Continuer même en cas d'erreur
      }
    }
    
    const patienteId = patienteData?.id;
    if (patienteId) {
      try {
        const dossier = await fetchJSON(`/patientes/${patienteId}/dossier`);
        if (dossier) {
          renderDossier(dossier);
          // Initialiser les tooltips après le rendu
          setTimeout(initHelpTooltips, 300);
        } else {
          renderEmptyDossier();
          setTimeout(initHelpTooltips, 300);
        }
      } catch (error) {
        console.error("Erreur lors du chargement du dossier:", error);
        if (dossierContent) {
          dossierContent.innerHTML = `
            <div class="error-state">
              <span class="error-icon">⚠️</span>
              <p>Erreur lors du chargement de votre dossier médical.</p>
              <small>${error.message || "Veuillez réessayer plus tard"}</small>
            </div>
          `;
        }
      }
    } else {
      renderEmptyDossier();
      setTimeout(initHelpTooltips, 300);
    }
  } catch (error) {
    console.error("Erreur lors du chargement:", error);
    if (dossierContent) {
      dossierContent.innerHTML = `
        <div class="error-state">
          <span class="error-icon">⚠️</span>
          <p>Une erreur est survenue lors du chargement.</p>
          <small>${error.message || "Veuillez réessayer plus tard"}</small>
        </div>
      `;
    }
  }
}

if (logoutButton) logoutButton.addEventListener("click", handleLogout);

// Initialiser les tooltips d'aide après le chargement
function initHelpTooltips() {
  document.querySelectorAll('.help-icon').forEach(icon => {
    icon.addEventListener('click', function(e) {
      e.stopPropagation();
      const helpText = this.getAttribute('data-help');
      if (helpText) {
        showTooltip(this, helpText);
      }
    });
  });
}

function showTooltip(element, text) {
  // Supprimer les tooltips existants
  document.querySelectorAll('.help-tooltip').forEach(t => t.remove());
  
  const tooltip = document.createElement('div');
  tooltip.className = 'help-tooltip';
  tooltip.textContent = text;
  
  const rect = element.getBoundingClientRect();
  tooltip.style.left = `${rect.left + rect.width / 2}px`;
  tooltip.style.top = `${rect.top - 10}px`;
  tooltip.style.transform = 'translate(-50%, -100%)';
  
  document.body.appendChild(tooltip);
  
  // Fermer au clic ailleurs
  setTimeout(() => {
    const closeTooltip = (e) => {
      if (!tooltip.contains(e.target) && e.target !== element) {
        tooltip.remove();
        document.removeEventListener('click', closeTooltip);
      }
    };
    document.addEventListener('click', closeTooltip);
  }, 100);
}

bootstrap();

