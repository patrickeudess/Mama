/**
 * Application de géovisualisation pour MAMA+
 * Affiche les patientes sur une carte interactive avec clustering
 */

// Coordonnées par défaut (Abidjan, Côte d'Ivoire)
const DEFAULT_CENTER = [5.3600, -4.0083];
const DEFAULT_ZOOM = 7;

let map = null;
let markers = [];
let markerCluster = null;
let currentPatientes = [];
let currentRisksMap = {};

// Coordonnées approximatives des villes de Côte d'Ivoire (pour la démo)
const VILLE_COORDINATES = {
  "Abidjan": [5.3600, -4.0083],
  "Bouaké": [7.6944, -5.0303],
  "Daloa": [6.8778, -6.4500],
  "Korhogo": [9.4581, -5.6294],
  "San-Pédro": [4.7472, -6.6364],
  "Yamoussoukro": [6.8276, -5.2893],
  "Man": [7.4053, -7.5531],
  "Gagnoa": [6.1289, -5.9506],
  "Abengourou": [6.7297, -3.4964],
  "Divo": [5.8389, -5.3600],
  "Odienné": [9.5050, -7.5642],
  "Bondoukou": [8.0400, -2.8000],
  "Dabou": [5.3256, -4.3767],
  "Katiola": [8.1333, -5.1000],
  "Anyama": [5.4944, -4.0517]
};

// Fonction pour obtenir les coordonnées d'une ville
function getVilleCoordinates(ville) {
  return VILLE_COORDINATES[ville] || DEFAULT_CENTER;
}

// Initialiser la carte
function initMap() {
  if (map) return;
  
  map = L.map('map').setView(DEFAULT_CENTER, DEFAULT_ZOOM);
  
  // Ajouter la couche de tuiles OpenStreetMap
  L.tileLayer('https://{s}.tile.openstreetmap.org/{s}/{z}/{x}/{y}.png', {
    attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19
  }).addTo(map);
}

// Créer un marqueur pour une patiente
function createPatienteMarker(patiente, risk) {
  const coords = getVilleCoordinates(patiente.ville || "Abidjan");
  const riskLevel = risk?.risk_level || patiente.risque || "faible";
  
  // Couleur du marqueur selon le risque
  let markerColor = '#10b981'; // Vert pour faible
  if (riskLevel === "élevé") markerColor = '#ef4444'; // Rouge
  else if (riskLevel === "moyen") markerColor = '#f59e0b'; // Orange
  
  // Créer une icône personnalisée
  const icon = L.divIcon({
    className: 'custom-marker',
    html: `<div style="background-color: ${markerColor}; width: 24px; height: 24px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  });
  
  const marker = L.marker(coords, { icon });
  
  // Popup avec informations de la patiente
  const popupContent = `
    <div class="cluster-popup">
      <h4>${patiente.prenom || ''} ${patiente.nom || ''}</h4>
      <p style="margin: 0.5rem 0; font-size: 0.875rem; color: #6b7280;">
        <strong>Ville:</strong> ${patiente.ville || 'Non spécifiée'}<br>
        <strong>Âge:</strong> ${patiente.age || 'N/A'} ans<br>
        <strong>Distance:</strong> ${patiente.distance_centre || 'N/A'} km<br>
        <strong>Risque:</strong> <span style="color: ${markerColor}; font-weight: 600;">${riskLevel}</span>
      </p>
      ${patiente.telephone ? `<p style="margin: 0.5rem 0 0 0;"><a href="tel:${patiente.telephone}" style="color: #2563eb; text-decoration: none;">📞 ${patiente.telephone}</a></p>` : ''}
    </div>
  `;
  
  marker.bindPopup(popupContent);
  marker.patienteData = patiente;
  
  return marker;
}

// Grouper les patientes par ville
function groupPatientesByVille(patientes) {
  const groups = {};
  patientes.forEach(patiente => {
    const ville = patiente.ville || "Non spécifiée";
    if (!groups[ville]) {
      groups[ville] = [];
    }
    groups[ville].push(patiente);
  });
  return groups;
}

// Afficher les patientes sur la carte
function renderMap(patientes, risksMap = {}) {
  if (!map) initMap();
  
  // Nettoyer les marqueurs existants
  markers.forEach(marker => map.removeLayer(marker));
  markers = [];
  
  if (markerCluster) {
    map.removeLayer(markerCluster);
    markerCluster = null;
  }
  
  if (!patientes || patientes.length === 0) {
    // Afficher un message si aucune patiente
    const emptyMessage = L.popup()
      .setLatLng(DEFAULT_CENTER)
      .setContent('<p>Aucune patiente à afficher</p>')
      .openOn(map);
    return;
  }
  
  // Créer les marqueurs
  patientes.forEach(patiente => {
    const risk = risksMap[patiente.id] || {};
    const marker = createPatienteMarker(patiente, risk);
    markers.push(marker);
  });
  
  // Grouper les marqueurs par ville pour le clustering
  const villeGroups = groupPatientesByVille(patientes);
  const villeMarkers = [];
  
  Object.entries(villeGroups).forEach(([ville, villePatientes]) => {
    const coords = getVilleCoordinates(ville);
    
    // Calculer les statistiques pour cette ville
    let total = villePatientes.length;
    let highRisk = 0;
    let mediumRisk = 0;
    let lowRisk = 0;
    
    villePatientes.forEach(p => {
      const r = risksMap[p.id] || {};
      const riskLevel = r.risk_level || p.risque || "faible";
      if (riskLevel === "élevé") highRisk++;
      else if (riskLevel === "moyen") mediumRisk++;
      else lowRisk++;
    });
    
    // Créer un marqueur de cluster pour la ville
    const clusterIcon = L.divIcon({
      className: 'cluster-marker',
      html: `
        <div style="
          background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
          color: white;
          width: 50px;
          height: 50px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 1rem;
          border: 3px solid white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        ">
          ${total}
        </div>
      `,
      iconSize: [50, 50],
      iconAnchor: [25, 25]
    });
    
    const clusterMarker = L.marker(coords, { icon: clusterIcon });
    
    // Popup du cluster avec statistiques
    const clusterPopup = `
      <div class="cluster-popup">
        <h4>${ville}</h4>
        <div class="cluster-popup-stats">
          <span><strong>Total:</strong> ${total}</span>
          <span class="risk-high"><strong>Élevé:</strong> ${highRisk}</span>
          <span class="risk-medium"><strong>Moyen:</strong> ${mediumRisk}</span>
          <span class="risk-low"><strong>Faible:</strong> ${lowRisk}</span>
        </div>
      </div>
    `;
    
    clusterMarker.bindPopup(clusterPopup);
    villeMarkers.push(clusterMarker);
    
    // Ajouter aussi les marqueurs individuels pour cette ville
    villePatientes.forEach(patiente => {
      const risk = risksMap[patiente.id] || {};
      const marker = createPatienteMarker(patiente, risk);
      villeMarkers.push(marker);
    });
  });
  
  // Ajouter tous les marqueurs à la carte
  villeMarkers.forEach(marker => {
    marker.addTo(map);
    markers.push(marker);
  });
  
  // Ajouter les établissements de santé sur la carte
  if (window.HEALTH_FACILITIES && window.VILLE_COORDS) {
    addHealthFacilitiesToMap(patientes);
  }
  
  // Ajuster la vue pour afficher tous les marqueurs
  if (markers.length > 0) {
    const group = new L.featureGroup(markers);
    map.fitBounds(group.getBounds().pad(0.1));
  }
  
  // Mettre à jour les statistiques
  updateStats(patientes, risksMap);
}

// Ajouter les établissements de santé sur la carte
function addHealthFacilitiesToMap(patientes) {
  if (!map || !window.HEALTH_FACILITIES) return;
  
  // Récupérer toutes les villes des patientes
  const villes = [...new Set(patientes.map(p => p.ville).filter(Boolean))];
  
  villes.forEach(ville => {
    const facilities = window.HEALTH_FACILITIES[ville] || [];
    
    facilities.forEach(facility => {
      const icon = facility.type === "hopital" 
        ? L.divIcon({
            className: 'health-facility-marker',
            html: `<div style="
              background: #ef4444;
              width: 32px;
              height: 32px;
              border-radius: 50%;
              border: 3px solid white;
              box-shadow: 0 2px 6px rgba(0,0,0,0.3);
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 18px;
            ">🏥</div>`,
            iconSize: [32, 32],
            iconAnchor: [16, 16]
          })
        : L.divIcon({
            className: 'health-facility-marker',
            html: `<div style="
              background: #10b981;
              width: 28px;
              height: 28px;
              border-radius: 50%;
              border: 3px solid white;
              box-shadow: 0 2px 6px rgba(0,0,0,0.3);
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 16px;
            ">💊</div>`,
            iconSize: [28, 28],
            iconAnchor: [14, 14]
          });
      
      const marker = L.marker(facility.coordonnees, { icon });
      
      const popupContent = `
        <div style="min-width: 200px;">
          <h4 style="margin: 0 0 0.5rem 0; font-size: 1rem; color: #1f2933;">
            ${facility.nom}
          </h4>
          <p style="margin: 0.25rem 0; font-size: 0.875rem; color: #4b5563;">
            📍 ${facility.adresse}
          </p>
          ${facility.telephone ? `
            <p style="margin: 0.25rem 0;">
              <a href="tel:${facility.telephone}" style="color: #2563eb; text-decoration: none; font-size: 0.875rem;">
                📞 ${facility.telephone}
              </a>
            </p>
          ` : ''}
          ${facility.services && facility.services.length > 0 ? `
            <div style="margin-top: 0.5rem;">
              <strong style="font-size: 0.8125rem; color: #6b7280;">Services:</strong>
              <div style="display: flex; flex-wrap: wrap; gap: 0.25rem; margin-top: 0.25rem;">
                ${facility.services.map(service => `
                  <span style="
                    padding: 0.125rem 0.5rem;
                    background: #eff6ff;
                    color: #1e40af;
                    border-radius: 0.25rem;
                    font-size: 0.75rem;
                  ">${service}</span>
                `).join('')}
              </div>
            </div>
          ` : ''}
        </div>
      `;
      
      marker.bindPopup(popupContent);
      marker.addTo(map);
      markers.push(marker);
    });
  });
}

// Mettre à jour les statistiques
function updateStats(patientes, risksMap) {
  let total = patientes.length;
  let highRisk = 0;
  let mediumRisk = 0;
  let lowRisk = 0;
  
  patientes.forEach(p => {
    const risk = risksMap[p.id] || {};
    const riskLevel = risk.risk_level || p.risque || "faible";
    if (riskLevel === "élevé") highRisk++;
    else if (riskLevel === "moyen") mediumRisk++;
    else lowRisk++;
  });
  
  document.getElementById('stat-total').textContent = total;
  document.getElementById('stat-high').textContent = highRisk;
  document.getElementById('stat-medium').textContent = mediumRisk;
  document.getElementById('stat-low').textContent = lowRisk;
}

// Filtrer les patientes
function filterPatientes() {
  const villeFilter = document.getElementById('filter-ville').value;
  const risqueFilter = document.getElementById('filter-risque').value;
  
  let filtered = [...currentPatientes];
  
  // Filtrer par ville
  if (villeFilter !== 'all') {
    filtered = filtered.filter(p => (p.ville || "Non spécifiée") === villeFilter);
  }
  
  // Filtrer par risque
  if (risqueFilter !== 'all') {
    filtered = filtered.filter(p => {
      const risk = currentRisksMap[p.id] || {};
      const riskLevel = risk.risk_level || p.risque || "faible";
      return riskLevel === risqueFilter;
    });
  }
  
  renderMap(filtered, currentRisksMap);
}

// Réinitialiser les filtres
function resetFilters() {
  document.getElementById('filter-ville').value = 'all';
  document.getElementById('filter-risque').value = 'all';
  renderMap(currentPatientes, currentRisksMap);
}

// Charger les données
async function loadGeoData() {
  try {
    // Utiliser la version simplifiée qui fonctionne avec localStorage
    const STORAGE_KEY = 'mama_patientes_data';
    const stored = localStorage.getItem(STORAGE_KEY);
    let patientes = [];
    
    if (stored) {
      patientes = JSON.parse(stored);
    } else {
      // Données par défaut si aucune donnée n'est disponible
      patientes = [
        {
          id: 1,
          prenom: "Awa",
          nom: "Koffi",
          age: 28,
          ville: "Abidjan",
          distance_centre: 2.3,
          risque: "moyen",
          telephone: "+2250700000001"
        },
        {
          id: 2,
          prenom: "Mariam",
          nom: "Kouadio",
          age: 19,
          ville: "Abidjan",
          distance_centre: 5.1,
          risque: "élevé",
          telephone: "+2250700000002"
        },
        {
          id: 3,
          prenom: "Fatou",
          nom: "Diallo",
          age: 32,
          ville: "Bouaké",
          distance_centre: 1.8,
          risque: "faible",
          telephone: "+2250700000003"
        },
        {
          id: 4,
          prenom: "Aminata",
          nom: "Traoré",
          age: 25,
          ville: "Daloa",
          distance_centre: 3.5,
          risque: "moyen",
          telephone: "+2250700000004"
        },
        {
          id: 5,
          prenom: "Kadiatou",
          nom: "Sangaré",
          age: 22,
          ville: "Yamoussoukro",
          distance_centre: 4.2,
          risque: "élevé",
          telephone: "+2250700000005"
        }
      ];
    }
    
    // Sauvegarder toutes les patientes pour les filtres
    const allPatientes = [...patientes];
    
    // Appliquer les filtres globaux si disponibles
    if (window.filterPatientesByGlobalFilters) {
      patientes = window.filterPatientesByGlobalFilters(patientes);
    }
    
    currentPatientes = patientes;
    currentRisksMap = {};
    
    // Créer un map de risques basé sur le champ risque
    patientes.forEach(p => {
      if (p.risque) {
        currentRisksMap[p.id] = {
          risk_level: p.risque,
          available: true
        };
      }
    });
    
    // Remplir le filtre de villes avec toutes les patientes (pas seulement les filtrées)
    const villes = [...new Set(allPatientes.map(p => p.ville).filter(Boolean))].sort();
    const villeSelect = document.getElementById('filter-ville');
    if (villeSelect) {
      villeSelect.innerHTML = '<option value="all">Toutes les villes</option>';
      villes.forEach(ville => {
        const option = document.createElement('option');
        option.value = ville;
        option.textContent = ville;
        villeSelect.appendChild(option);
      });
    }
    
    // Initialiser la carte et afficher les données
    initMap();
    renderMap(patientes, currentRisksMap);
    
  } catch (error) {
    console.error('Erreur lors du chargement des données:', error);
    if (window.toast) {
      window.toast.error('Erreur lors du chargement des données de géovisualisation');
    }
  }
}

// Initialisation au chargement de la page
document.addEventListener('DOMContentLoaded', () => {
  // Charger les filtres sauvegardés
  if (window.loadSavedFilters) {
    window.loadSavedFilters();
  }
  
  // Fonction pour obtenir toutes les patientes (pour initialiser les filtres)
  function getAllPatientes() {
    const STORAGE_KEY = 'mama_patientes_data';
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        return [];
      }
    }
    return [];
  }
  
  // Initialiser les filtres globaux
  if (window.initGlobalFilters) {
    const allPatientes = getAllPatientes();
    window.initGlobalFilters(allPatientes);
  }
  
  // Écouter les changements de filtres globaux
  window.addEventListener('filtersChanged', () => {
    loadGeoData();
  });
  
  // Attendre que Leaflet soit chargé
  if (typeof L === 'undefined') {
    setTimeout(() => {
      loadGeoData();
    }, 500);
  } else {
    loadGeoData();
  }
  
  // Écouter les changements de filtres locaux
  const villeFilter = document.getElementById('filter-ville');
  const risqueFilter = document.getElementById('filter-risque');
  const resetBtn = document.getElementById('reset-map');
  
  if (villeFilter) {
    villeFilter.addEventListener('change', filterPatientes);
  }
  if (risqueFilter) {
    risqueFilter.addEventListener('change', filterPatientes);
  }
  if (resetBtn) {
    resetBtn.addEventListener('click', resetFilters);
  }
});

// Exposer les fonctions globalement
window.renderMap = renderMap;
window.loadGeoData = loadGeoData;

