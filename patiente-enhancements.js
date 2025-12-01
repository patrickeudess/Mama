/**
 * Améliorations de l'interface patiente
 * - Mini carte interactive
 */

// Fonction pour initialiser la mini carte interactive
function initMiniMap(patienteData) {
  const mapContainer = document.querySelector("#mini-map");
  if (!mapContainer) return;
  
  // Coordonnées fictives basées sur la ville (si disponible)
  const coordinates = getCityCoordinates(patienteData?.ville || "Bamako");
  
  // Créer une carte SVG simple avec des points fictifs
  const mapHTML = `
    <svg width="100%" height="100%" viewBox="0 0 400 200" style="background: linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%);">
      <!-- Lignes de grille -->
      <defs>
        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#93c5fd" stroke-width="0.5" opacity="0.3"/>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#grid)"/>
      
      <!-- Points de localisation fictifs -->
      <circle cx="100" cy="80" r="8" fill="#3b82f6" opacity="0.8">
        <title>Centre de santé principal</title>
      </circle>
      <circle cx="200" cy="120" r="6" fill="#10b981" opacity="0.7">
        <title>Votre position</title>
      </circle>
      <circle cx="300" cy="60" r="5" fill="#f59e0b" opacity="0.6">
        <title>Autre centre</title>
      </circle>
      <circle cx="150" cy="150" r="5" fill="#8b5cf6" opacity="0.6">
        <title>Centre de santé</title>
      </circle>
      
      <!-- Légende -->
      <g transform="translate(20, 20)">
        <rect x="0" y="0" width="120" height="70" fill="white" opacity="0.9" rx="4"/>
        <text x="10" y="20" font-size="12" font-weight="600" fill="#374151">Légende</text>
        <circle cx="15" cy="35" r="4" fill="#3b82f6"/>
        <text x="25" y="38" font-size="10" fill="#6b7280">Centre principal</text>
        <circle cx="15" cy="50" r="3" fill="#10b981"/>
        <text x="25" y="53" font-size="10" fill="#6b7280">Votre position</text>
        <circle cx="15" cy="65" r="3" fill="#f59e0b"/>
        <text x="25" y="68" font-size="10" fill="#6b7280">Autres centres</text>
      </g>
      
      <!-- Ligne de connexion (distance) -->
      <line x1="200" y1="120" x2="100" y2="80" stroke="#ef4444" stroke-width="2" stroke-dasharray="5,5" opacity="0.6">
        <title>Distance: ${patienteData?.distance_centre || 'N/A'} km</title>
      </line>
    </svg>
  `;
  
  mapContainer.innerHTML = mapHTML;
  
  // Ajouter un effet de zoom au survol
  mapContainer.style.cursor = "pointer";
  mapContainer.addEventListener("click", () => {
    window.location.href = "geovisualisation.html";
  });
  
  mapContainer.addEventListener("mouseenter", () => {
    mapContainer.style.transform = "scale(1.02)";
    mapContainer.style.transition = "transform 0.3s ease";
  });
  
  mapContainer.addEventListener("mouseleave", () => {
    mapContainer.style.transform = "scale(1)";
  });
}

// Fonction pour obtenir des coordonnées fictives basées sur la ville
function getCityCoordinates(ville) {
  // Coordonnées fictives pour différentes villes
  const cityCoords = {
    "Bamako": { lat: 12.6392, lng: -8.0029 },
    "Abidjan": { lat: 5.3600, lng: -4.0083 },
    "Ouagadougou": { lat: 12.3714, lng: -1.5197 },
    "Dakar": { lat: 14.7167, lng: -17.4677 },
    "Conakry": { lat: 9.6412, lng: -13.5784 },
  };
  
  return cityCoords[ville] || cityCoords["Bamako"];
}

// Initialiser les fonctionnalités au chargement
document.addEventListener("DOMContentLoaded", () => {
  // Mini carte (sera initialisée avec les données de la patiente)
  // Cette fonction sera appelée depuis app-patriente.js après le chargement des données
  window.initMiniMap = initMiniMap;
});

