/**
 * Améliorations du tableau de bord professionnel
 * - Alerte critique
 * - Filtres
 * - Micro-graphiques
 */

// Fonction pour calculer l'évolution des risques (données simulées pour les 7 derniers jours)
function getRiskEvolutionData(patientes) {
  // Simuler des données historiques basées sur les données actuelles
  const currentHighRisk = patientes.filter(p => p.risque === "élevé").length;
  const data = [];
  for (let i = 6; i >= 0; i--) {
    // Variation aléatoire autour de la valeur actuelle
    const variation = Math.floor(Math.random() * 3) - 1; // -1, 0, ou 1
    data.push(Math.max(0, currentHighRisk + variation));
  }
  return data;
}

// Fonction pour calculer les CPN en retard par mois (données simulées)
function getCPNDelayedByMonth(patientes) {
  const today = new Date();
  const data = [];
  for (let i = 5; i >= 0; i--) {
    const monthDate = new Date(today.getFullYear(), today.getMonth() - i, 1);
    // Simuler des données basées sur les CPN en retard actuelles
    const baseCount = patientes.filter(p => {
      if (!p.prochaine_cpn) return false;
      try {
        const cpnDate = new Date(p.prochaine_cpn);
        return cpnDate < today && cpnDate >= monthDate;
      } catch {
        return false;
      }
    }).length;
    data.push(Math.max(0, baseCount + Math.floor(Math.random() * 3)));
  }
  return data;
}

// Fonction pour afficher l'alerte critique
function renderCriticalAlert(patientes) {
  const alertSection = document.querySelector("#critical-alert-section");
  if (!alertSection) return;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
  // Trouver les patientes à haut risque non venues depuis > 7 jours
  const criticalPatientes = patientes.filter(p => {
    if (p.risque !== "élevé") return false;
    if (!p.derniere_venue) return true; // Jamais venue
    try {
      const lastVisit = new Date(p.derniere_venue);
      lastVisit.setHours(0, 0, 0, 0);
      return lastVisit < sevenDaysAgo;
    } catch {
      return false;
    }
  });
  
  if (criticalPatientes.length === 0) {
    alertSection.classList.add("hidden");
    return;
  }
  
  const alertText = document.querySelector("#critical-alert-text");
  const alertAction = document.querySelector("#critical-alert-action");
  const dismissBtn = document.querySelector("#dismiss-alert");
  
  if (alertText) {
    alertText.textContent = `${criticalPatientes.length} patiente${criticalPatientes.length > 1 ? 's' : ''} à haut risque non venue${criticalPatientes.length > 1 ? 's' : ''} depuis > 7 jours – cliquer pour intervenir`;
  }
  
  if (alertAction) {
    alertAction.onclick = () => {
      // Rediriger vers la page des alertes avec filtre
      window.location.href = `alertes.html?filter=high-risk-missing`;
    };
  }
  
  if (dismissBtn) {
    dismissBtn.onclick = () => {
      alertSection.classList.add("hidden");
      localStorage.setItem("dismissed_critical_alert", new Date().toISOString());
    };
  }
  
  // Vérifier si l'alerte a été masquée récemment (masquée pendant 1 heure)
  const dismissed = localStorage.getItem("dismissed_critical_alert");
  if (dismissed) {
    const dismissedTime = new Date(dismissed);
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    if (dismissedTime > oneHourAgo) {
      alertSection.classList.add("hidden");
      return;
    }
  }
  
  alertSection.classList.remove("hidden");
}

// Fonction pour initialiser les filtres globaux du tableau de bord
function initGlobalFilters(patientes) {
  if (!window.extractFilterValues || !window.getGlobalFilters || !window.setGlobalFilter) {
    console.warn("Système de filtres globaux non disponible");
    return;
  }
  
  const filterValues = window.extractFilterValues(patientes);
  const currentFilters = window.getGlobalFilters();
  
  // Récupérer les références aux filtres
  const paysFilter = document.querySelector("#global-filter-pays");
  const villeFilter = document.querySelector("#global-filter-ville");
  const centreFilter = document.querySelector("#global-filter-centre");
  const periodeFilter = document.querySelector("#global-filter-periode");
  
  // Fonction pour mettre à jour les villes selon le pays sélectionné
  function updateGlobalVillesFilter(pays) {
    if (!villeFilter) return;
    
    // Vider les options existantes sauf "Toutes les villes"
    villeFilter.innerHTML = '<option value="all">Toutes les villes</option>';
    
    if (pays === "all") {
      // Si "Tous les pays", afficher toutes les villes
      let allVilles = filterValues.villes;
      if (window.getCitiesWithHealthCenters) {
        const dbVilles = window.getCitiesWithHealthCenters();
        allVilles = [...new Set([...allVilles, ...dbVilles])].sort();
      }
      allVilles.forEach(ville => {
        const option = document.createElement("option");
        option.value = ville;
        option.textContent = ville;
        villeFilter.appendChild(option);
      });
    } else {
      // Afficher seulement les villes du pays sélectionné
      if (window.getCitiesByCountry) {
        const villes = window.getCitiesByCountry(pays);
        villes.forEach(ville => {
          const option = document.createElement("option");
          option.value = ville;
          option.textContent = ville;
          villeFilter.appendChild(option);
        });
      }
    }
    
    // Réinitialiser la sélection
    villeFilter.value = "all";
    window.setGlobalFilter("ville", "all");
    
    // Réinitialiser aussi les centres
    if (centreFilter) {
      centreFilter.innerHTML = '<option value="all">Tous les centres</option>';
      window.setGlobalFilter("centre", "all");
    }
  }
  
  // Fonction pour mettre à jour les centres selon la ville sélectionnée
  function updateGlobalCentresFilter(ville, pays) {
    if (!centreFilter) return;
    
    // Vider les options existantes sauf "Tous les centres"
    centreFilter.innerHTML = '<option value="all">Tous les centres</option>';
    
    if (ville === "all") {
      // Si "Toutes les villes", afficher tous les centres
      filterValues.centres.forEach(centre => {
        const option = document.createElement("option");
        option.value = centre;
        option.textContent = centre;
        centreFilter.appendChild(option);
      });
    } else {
      // Afficher seulement les centres de la ville sélectionnée
      if (window.getHealthCentersByCity) {
        const centres = window.getHealthCentersByCity(ville, pays !== "all" ? pays : null);
        centres.forEach(centre => {
          const option = document.createElement("option");
          option.value = centre;
          option.textContent = centre;
          centreFilter.appendChild(option);
        });
      }
    }
    
    // Réinitialiser la sélection
    centreFilter.value = "all";
    window.setGlobalFilter("centre", "all");
  }
  
  // Remplir le filtre pays avec TOUS les pays disponibles
  if (paysFilter) {
    // Utiliser tous les pays de la base de données, pas seulement ceux des patientes
    let allPays = filterValues.pays;
    if (window.getAllCountries) {
      const dbPays = window.getAllCountries();
      allPays = [...new Set([...allPays, ...dbPays])].sort();
    }
    
    allPays.forEach(pays => {
      const option = document.createElement("option");
      option.value = pays;
      option.textContent = pays;
      paysFilter.appendChild(option);
    });
    paysFilter.value = currentFilters.pays || "all";
    paysFilter.addEventListener("change", (e) => {
      const selectedPays = e.target.value;
      window.setGlobalFilter("pays", selectedPays);
      
      // Mettre à jour les villes selon le pays sélectionné
      updateGlobalVillesFilter(selectedPays);
      
      updateFilterSummary();
      refreshAllData();
    });
  }
  
  // Remplir le filtre ville avec TOUTES les villes disponibles
  if (villeFilter) {
    // Utiliser toutes les villes de la base de données, pas seulement celles des patientes
    let allVilles = filterValues.villes;
    if (window.getCitiesWithHealthCenters) {
      const dbVilles = window.getCitiesWithHealthCenters();
      allVilles = [...new Set([...allVilles, ...dbVilles])].sort();
    }
    
    allVilles.forEach(ville => {
      const option = document.createElement("option");
      option.value = ville;
      option.textContent = ville;
      villeFilter.appendChild(option);
    });
    villeFilter.value = currentFilters.ville || "all";
    villeFilter.addEventListener("change", (e) => {
      const selectedVille = e.target.value;
      window.setGlobalFilter("ville", selectedVille);
      
      // Mettre à jour les centres selon la ville sélectionnée
      const selectedPays = paysFilter ? paysFilter.value : "all";
      updateGlobalCentresFilter(selectedVille, selectedPays);
      
      updateFilterSummary();
      refreshAllData();
    });
  }
  
  // Remplir le filtre centre
  if (centreFilter) {
    filterValues.centres.forEach(centre => {
      const option = document.createElement("option");
      option.value = centre;
      option.textContent = centre;
      centreFilter.appendChild(option);
    });
    centreFilter.value = currentFilters.centre || "all";
    centreFilter.addEventListener("change", (e) => {
      window.setGlobalFilter("centre", e.target.value);
      updateFilterSummary();
      refreshAllData();
    });
  }
  
  // Remplir le filtre période
  if (periodeFilter) {
    periodeFilter.value = currentFilters.periode || "month";
    periodeFilter.addEventListener("change", (e) => {
      window.setGlobalFilter("periode", e.target.value);
      updateFilterSummary();
      refreshAllData();
    });
  }
  
  // Bouton de réinitialisation
  const resetBtn = document.querySelector("#reset-global-filters");
  if (resetBtn) {
    resetBtn.onclick = () => {
      window.resetGlobalFilters();
      if (paysFilter) paysFilter.value = "all";
      if (villeFilter) villeFilter.value = "all";
      if (centreFilter) centreFilter.value = "all";
      if (periodeFilter) periodeFilter.value = "month";
      updateFilterSummary();
      refreshAllData();
    };
  }
  
  // Mettre à jour le résumé des filtres
  updateFilterSummary();
  
  // Écouter les changements de filtres depuis d'autres pages
  window.addEventListener('filtersChanged', () => {
    const filters = window.getGlobalFilters();
    if (paysFilter) paysFilter.value = filters.pays;
    if (villeFilter) villeFilter.value = filters.ville;
    if (centreFilter) centreFilter.value = filters.centre;
    if (periodeFilter) periodeFilter.value = filters.periode;
    updateFilterSummary();
  });
}

// Mettre à jour le résumé des filtres actifs
function updateFilterSummary() {
  const summaryText = document.querySelector("#filter-summary-text");
  if (!summaryText) return;
  
  const filters = window.getGlobalFilters();
  const activeFilters = [];
  
  if (filters.pays !== "all") activeFilters.push(`Pays: ${filters.pays}`);
  if (filters.ville !== "all") activeFilters.push(`Ville: ${filters.ville}`);
  if (filters.centre !== "all") activeFilters.push(`Centre: ${filters.centre}`);
  if (filters.periode !== "all") {
    const periodeLabels = {
      "week": "Cette semaine",
      "month": "Ce mois",
      "quarter": "Ce trimestre",
      "year": "Cette année"
    };
    activeFilters.push(`Période: ${periodeLabels[filters.periode] || filters.periode}`);
  }
  
  if (activeFilters.length === 0) {
    summaryText.textContent = "Aucun filtre actif";
  } else {
    summaryText.textContent = activeFilters.join(" • ");
  }
}

// Rafraîchir toutes les données selon les filtres
function refreshAllData() {
  // Rafraîchir le tableau de bord
  if (typeof renderDashboardStats === 'function') {
    renderDashboardStats();
  }
  
  // Rafraîchir l'alerte critique
  if (window.renderCriticalAlert) {
    const allPatientes = getPatientes ? getPatientes() : [];
    const filtered = window.filterPatientesByGlobalFilters ? window.filterPatientesByGlobalFilters(allPatientes) : allPatientes;
    window.renderCriticalAlert(filtered);
  }
  
  // Rafraîchir les alertes si on est sur la page alertes
  if (typeof renderPriorityAlerts === 'function') {
    renderPriorityAlerts();
  }
  
  // Rafraîchir la géovisualisation si on est sur la page géovisualisation
  if (typeof loadGeoData === 'function') {
    loadGeoData();
  }
  
  // Rafraîchir les statistiques si on est sur la page statistiques
  if (window.renderStatsPage) {
    window.renderStatsPage();
  }
  
  // Rafraîchir la performance si on est sur la page performance
  if (window.renderPerformancePage) {
    window.renderPerformancePage();
  }
  
  // Rafraîchir la liste des patientes si on est sur la page mes-patientes
  if (typeof renderPatientes === 'function') {
    renderPatientes();
  }
}

// Fonction pour obtenir les patientes (doit être définie globalement)
function getPatientes() {
  // Cette fonction sera remplacée par celle de app-professionnel-simple.js
  return [];
}

// Exposer les fonctions globalement
window.getRiskEvolutionData = getRiskEvolutionData;
window.getCPNDelayedByMonth = getCPNDelayedByMonth;
window.renderCriticalAlert = renderCriticalAlert;
window.initDashboardFilters = initGlobalFilters; // Alias pour compatibilité
window.initGlobalFilters = initGlobalFilters;
window.updateFilterSummary = updateFilterSummary;
window.refreshAllData = refreshAllData;

