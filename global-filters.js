/**
 * Système de filtres globaux pour le tableau de bord professionnel
 * Filtres : Pays, Ville, Centre de santé, Période
 */

// État global des filtres
let globalFilters = {
  pays: "all",
  ville: "all",
  centre: "all",
  periode: "month"
};

// Charger les filtres sauvegardés
function loadSavedFilters() {
  const saved = localStorage.getItem("mama_professional_filters");
  if (saved) {
    try {
      const filters = JSON.parse(saved);
      globalFilters = { ...globalFilters, ...filters };
    } catch (e) {
      console.warn("Erreur lors du chargement des filtres:", e);
    }
  }
  
  // Charger aussi depuis le profil professionnel
  const profProfile = localStorage.getItem("mama_professional_profile");
  if (profProfile) {
    try {
      const profile = JSON.parse(profProfile);
      if (profile.ville && globalFilters.ville === "all") {
        globalFilters.ville = profile.ville;
      }
      if (profile.centre && globalFilters.centre === "all") {
        globalFilters.centre = profile.centre;
      }
      if (profile.pays && globalFilters.pays === "all") {
        globalFilters.pays = profile.pays;
      }
    } catch (e) {
      console.warn("Erreur lors du chargement du profil:", e);
    }
  }
}

// Sauvegarder les filtres
function saveFilters() {
  localStorage.setItem("mama_professional_filters", JSON.stringify(globalFilters));
}

// Obtenir les filtres actuels
function getGlobalFilters() {
  return { ...globalFilters };
}

// Définir un filtre
function setGlobalFilter(key, value) {
  globalFilters[key] = value;
  saveFilters();
  // Déclencher un événement pour notifier les autres composants
  window.dispatchEvent(new CustomEvent('filtersChanged', { detail: globalFilters }));
}

// Réinitialiser tous les filtres
function resetGlobalFilters() {
  globalFilters = {
    pays: "all",
    ville: "all",
    centre: "all",
    periode: "month"
  };
  saveFilters();
  window.dispatchEvent(new CustomEvent('filtersChanged', { detail: globalFilters }));
}

// Filtrer les patientes selon les critères globaux
function filterPatientesByGlobalFilters(patientes) {
  let filtered = [...patientes];
  
  // Filtre par pays
  if (globalFilters.pays !== "all") {
    filtered = filtered.filter(p => {
      // Si la patiente a un champ pays, l'utiliser, sinon déduire de la ville
      const patientePays = p.pays || getCountryFromCity(p.ville);
      return patientePays === globalFilters.pays;
    });
  }
  
  // Filtre par ville
  if (globalFilters.ville !== "all") {
    filtered = filtered.filter(p => p.ville === globalFilters.ville);
  }
  
  // Filtre par centre de santé
  if (globalFilters.centre !== "all") {
    filtered = filtered.filter(p => {
      // Le centre doit être dans le champ centre_sante
      const patienteCentre = p.centre_sante;
      return patienteCentre === globalFilters.centre;
    });
  }
  
  // Filtre par période (pour les dates de consultation/CPN et la période de suivi)
  if (globalFilters.periode !== "all") {
    // D'abord filtrer par la période de suivi de la patiente si elle existe
    filtered = filtered.filter(p => {
      // Si la patiente a une période définie, l'utiliser
      if (p.periode) {
        return p.periode === globalFilters.periode;
      }
      // Sinon, filtrer selon les dates de consultation/CPN
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      let startDate = new Date();
      
      switch (globalFilters.periode) {
        case "week":
          startDate.setDate(today.getDate() - 7);
          break;
        case "month":
          startDate.setMonth(today.getMonth() - 1);
          break;
        case "quarter":
          startDate.setMonth(today.getMonth() - 3);
          break;
        case "year":
          startDate.setFullYear(today.getFullYear() - 1);
          break;
        default:
          return true; // Inclure toutes les patientes si période non reconnue
      }
      
      // Filtrer selon la dernière venue ou la prochaine CPN
      if (p.derniere_venue) {
        const lastVisit = new Date(p.derniere_venue);
        return lastVisit >= startDate;
      }
      if (p.prochaine_cpn) {
        const nextCpn = new Date(p.prochaine_cpn);
        return nextCpn >= startDate;
      }
      // Si pas de date, inclure quand même (pour les nouvelles patientes)
      return true;
    });
  }
  
  return filtered;
}

// Fonction pour déduire le pays depuis la ville (mapping simple)
function getCountryFromCity(ville) {
  if (!ville) return null;
  
  // Mapping des villes vers les pays (Afrique de l'Ouest)
  const cityToCountry = {
    "Bamako": "Mali",
    "Abidjan": "Côte d'Ivoire",
    "Ouagadougou": "Burkina Faso",
    "Dakar": "Sénégal",
    "Conakry": "Guinée",
    "Niamey": "Niger",
    "Cotonou": "Bénin",
    "Lomé": "Togo",
    "Accra": "Ghana",
    "Monrovia": "Liberia",
    "Freetown": "Sierra Leone",
    "Banjul": "Gambie",
    "Bissau": "Guinée-Bissau",
    "Nouakchott": "Mauritanie"
  };
  
  return cityToCountry[ville] || null;
}

// Extraire les valeurs uniques pour les filtres
function extractFilterValues(patientes) {
  const pays = new Set();
  const villes = new Set();
  const centres = new Set();
  
  // Ajouter TOUS les pays disponibles depuis la base de données
  if (window.getAllCountries) {
    const allCountries = window.getAllCountries();
    allCountries.forEach(p => pays.add(p));
  }
  
  // Ajouter TOUTES les villes disponibles depuis la base de données
  if (window.getCitiesWithHealthCenters) {
    const allCities = window.getCitiesWithHealthCenters();
    allCities.forEach(v => villes.add(v));
  }
  
  // Ajouter aussi les pays et villes des patientes existantes
  patientes.forEach(p => {
    // Pays
    const patientePays = p.pays || getCountryFromCity(p.ville);
    if (patientePays) pays.add(patientePays);
    
    // Ville
    if (p.ville) villes.add(p.ville);
    
    // Centre de santé
    const patienteCentre = p.centre_sante;
    if (patienteCentre) centres.add(patienteCentre);
  });
  
  // Ajouter TOUS les centres de santé depuis la liste prédéfinie
  if (window.getAllHealthCenters) {
    const allCenters = window.getAllHealthCenters();
    allCenters.forEach(centre => centres.add(centre));
  }
  
  return {
    pays: Array.from(pays).sort(),
    villes: Array.from(villes).sort(),
    centres: Array.from(centres).sort()
  };
}

// Exposer les fonctions globalement
window.getGlobalFilters = getGlobalFilters;
window.setGlobalFilter = setGlobalFilter;
window.resetGlobalFilters = resetGlobalFilters;
window.filterPatientesByGlobalFilters = filterPatientesByGlobalFilters;
window.extractFilterValues = extractFilterValues;
window.loadSavedFilters = loadSavedFilters;

// Charger les filtres au démarrage
loadSavedFilters();

