/**
 * Base de données des établissements de santé en Côte d'Ivoire
 * Hôpitaux et pharmacies par ville
 */

// Coordonnées des villes de Côte d'Ivoire (lat, lng)
const VILLE_COORDS = {
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

// Base de données des établissements de santé en Côte d'Ivoire
const HEALTH_FACILITIES = {
  "Abidjan": [
    {
      type: "hopital",
      nom: "Centre Hospitalier Universitaire (CHU) de Cocody",
      adresse: "Abidjan, Cocody, Boulevard de la Paix",
      telephone: "+225 27 22 44 44 44",
      services: ["Urgences", "Maternité", "Pédiatrie", "Chirurgie"],
      coordonnees: [5.3500, -4.0000],
      distance: null
    },
    {
      type: "hopital",
      nom: "CHU de Yopougon",
      adresse: "Abidjan, Yopougon, Route de Dabou",
      telephone: "+225 27 22 45 55 55",
      services: ["Urgences", "Maternité", "Pédiatrie"],
      coordonnees: [5.3200, -4.0800],
      distance: null
    },
    {
      type: "hopital",
      nom: "Hôpital Mère-Enfant de Bingerville",
      adresse: "Abidjan, Bingerville",
      telephone: "+225 27 22 46 66 66",
      services: ["Maternité", "Pédiatrie", "Gynécologie"],
      coordonnees: [5.3550, -3.9000],
      distance: null
    },
    {
      type: "hopital",
      nom: "Institut de Cardiologie d'Abidjan",
      adresse: "Abidjan, Cocody, Angré 7ème Tranche",
      telephone: "+225 27 22 47 77 77",
      services: ["Cardiologie", "Urgences"],
      coordonnees: [5.3600, -3.9800],
      distance: null
    },
    {
      type: "pharmacie",
      nom: "Pharmacie Centrale d'Abidjan",
      adresse: "Abidjan, Plateau, Avenue Franchet d'Esperey",
      telephone: "+225 27 20 30 12 34",
      services: ["Médicaments", "Urgences 24/7"],
      coordonnees: [5.3200, -4.0300],
      distance: null
    },
    {
      type: "pharmacie",
      nom: "Pharmacie du Plateau",
      adresse: "Abidjan, Plateau, Boulevard de la République",
      telephone: "+225 27 20 30 23 45",
      services: ["Médicaments"],
      coordonnees: [5.3180, -4.0250],
      distance: null
    },
    {
      type: "pharmacie",
      nom: "Pharmacie Santé Plus Cocody",
      adresse: "Abidjan, Cocody, Angré",
      telephone: "+225 27 22 48 88 88",
      services: ["Médicaments", "Urgences"],
      coordonnees: [5.3650, -3.9900],
      distance: null
    },
    {
      type: "pharmacie",
      nom: "Pharmacie de Marcory",
      adresse: "Abidjan, Marcory, Boulevard de la Paix",
      telephone: "+225 27 20 30 34 56",
      services: ["Médicaments"],
      coordonnees: [5.3000, -4.0100],
      distance: null
    }
  ],
  "Bouaké": [
    {
      type: "hopital",
      nom: "Centre Hospitalier Universitaire (CHU) de Bouaké",
      adresse: "Bouaké, Centre-ville",
      telephone: "+225 31 63 22 11",
      services: ["Urgences", "Maternité", "Pédiatrie", "Chirurgie"],
      coordonnees: [7.6950, -5.0300],
      distance: null
    },
    {
      type: "hopital",
      nom: "Hôpital Général de Bouaké",
      adresse: "Bouaké, Quartier Commerce",
      telephone: "+225 31 63 33 22",
      services: ["Urgences", "Maternité"],
      coordonnees: [7.6900, -5.0250],
      distance: null
    },
    {
      type: "pharmacie",
      nom: "Pharmacie Centrale de Bouaké",
      adresse: "Bouaké, Centre-ville",
      telephone: "+225 31 63 44 33",
      services: ["Médicaments"],
      coordonnees: [7.7000, -5.0350],
      distance: null
    },
    {
      type: "pharmacie",
      nom: "Pharmacie du Marché",
      adresse: "Bouaké, Quartier Commerce",
      telephone: "+225 31 63 55 44",
      services: ["Médicaments", "Urgences"],
      coordonnees: [7.6850, -5.0200],
      distance: null
    }
  ],
  "Daloa": [
    {
      type: "hopital",
      nom: "Hôpital Général de Daloa",
      adresse: "Daloa, Centre-ville",
      telephone: "+225 32 75 22 11",
      services: ["Urgences", "Maternité"],
      coordonnees: [6.8800, -6.4500],
      distance: null
    },
    {
      type: "pharmacie",
      nom: "Pharmacie de Daloa",
      adresse: "Daloa, Centre-ville",
      telephone: "+225 32 75 33 22",
      services: ["Médicaments"],
      coordonnees: [6.8750, -6.4450],
      distance: null
    }
  ],
  "Korhogo": [
    {
      type: "hopital",
      nom: "Hôpital Régional de Korhogo",
      adresse: "Korhogo, Centre-ville",
      telephone: "+225 36 86 22 11",
      services: ["Urgences", "Maternité"],
      coordonnees: [9.4600, -5.6300],
      distance: null
    },
    {
      type: "pharmacie",
      nom: "Pharmacie de Korhogo",
      adresse: "Korhogo, Centre-ville",
      telephone: "+225 36 86 33 22",
      services: ["Médicaments"],
      coordonnees: [9.4550, -5.6250],
      distance: null
    }
  ],
  "San-Pédro": [
    {
      type: "hopital",
      nom: "Hôpital Général de San-Pédro",
      adresse: "San-Pédro, Centre-ville",
      telephone: "+225 34 71 22 11",
      services: ["Urgences", "Maternité"],
      coordonnees: [4.7500, -6.6400],
      distance: null
    },
    {
      type: "pharmacie",
      nom: "Pharmacie de San-Pédro",
      adresse: "San-Pédro, Centre-ville",
      telephone: "+225 34 71 33 22",
      services: ["Médicaments"],
      coordonnees: [4.7450, -6.6350],
      distance: null
    }
  ],
  "Yamoussoukro": [
    {
      type: "hopital",
      nom: "Hôpital Général de Yamoussoukro",
      adresse: "Yamoussoukro, Centre-ville",
      telephone: "+225 30 64 22 11",
      services: ["Urgences", "Maternité", "Pédiatrie"],
      coordonnees: [6.8300, -5.2900],
      distance: null
    },
    {
      type: "hopital",
      nom: "Institut National de Santé Publique",
      adresse: "Yamoussoukro, Route de l'Aéroport",
      telephone: "+225 30 64 33 22",
      services: ["Santé publique", "Prévention"],
      coordonnees: [6.8400, -5.2800],
      distance: null
    },
    {
      type: "pharmacie",
      nom: "Pharmacie de Yamoussoukro",
      adresse: "Yamoussoukro, Centre-ville",
      telephone: "+225 30 64 44 33",
      services: ["Médicaments"],
      coordonnees: [6.8250, -5.2850],
      distance: null
    }
  ],
  "Man": [
    {
      type: "hopital",
      nom: "Hôpital Général de Man",
      adresse: "Man, Centre-ville",
      telephone: "+225 33 72 22 11",
      services: ["Urgences", "Maternité"],
      coordonnees: [7.4050, -7.5550],
      distance: null
    },
    {
      type: "pharmacie",
      nom: "Pharmacie de Man",
      adresse: "Man, Centre-ville",
      telephone: "+225 33 72 33 22",
      services: ["Médicaments"],
      coordonnees: [7.4000, -7.5500],
      distance: null
    }
  ],
  "Gagnoa": [
    {
      type: "hopital",
      nom: "Hôpital Général de Gagnoa",
      adresse: "Gagnoa, Centre-ville",
      telephone: "+225 32 77 22 11",
      services: ["Urgences", "Maternité"],
      coordonnees: [6.1300, -5.9500],
      distance: null
    },
    {
      type: "pharmacie",
      nom: "Pharmacie de Gagnoa",
      adresse: "Gagnoa, Centre-ville",
      telephone: "+225 32 77 33 22",
      services: ["Médicaments"],
      coordonnees: [6.1250, -5.9450],
      distance: null
    }
  ],
  "Abengourou": [
    {
      type: "hopital",
      nom: "Hôpital Général d'Abengourou",
      adresse: "Abengourou, Centre-ville",
      telephone: "+225 33 78 22 11",
      services: ["Urgences", "Maternité"],
      coordonnees: [6.7300, -3.4950],
      distance: null
    },
    {
      type: "pharmacie",
      nom: "Pharmacie d'Abengourou",
      adresse: "Abengourou, Centre-ville",
      telephone: "+225 33 78 33 22",
      services: ["Médicaments"],
      coordonnees: [6.7250, -3.4900],
      distance: null
    }
  ],
  "Divo": [
    {
      type: "hopital",
      nom: "Hôpital Général de Divo",
      adresse: "Divo, Centre-ville",
      telephone: "+225 32 79 22 11",
      services: ["Urgences", "Maternité"],
      coordonnees: [5.8400, -5.3600],
      distance: null
    },
    {
      type: "pharmacie",
      nom: "Pharmacie de Divo",
      adresse: "Divo, Centre-ville",
      telephone: "+225 32 79 33 22",
      services: ["Médicaments"],
      coordonnees: [5.8350, -5.3550],
      distance: null
    }
  ]
};

/**
 * Calculer la distance entre deux points (formule de Haversine)
 * @param {number[]} coord1 - [lat, lng]
 * @param {number[]} coord2 - [lat, lng]
 * @returns {number} Distance en kilomètres
 */
function calculateDistance(coord1, coord2) {
  const R = 6371; // Rayon de la Terre en km
  const [lat1, lon1] = coord1;
  const [lat2, lon2] = coord2;
  
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return distance;
}

/**
 * Obtenir les établissements de santé les plus proches d'une patiente
 * @param {Object} patiente - Objet patiente avec ville et/ou coordonnées
 * @param {number} limit - Nombre maximum d'établissements à retourner (par type)
 * @returns {Object} { hopitaux: [], pharmacies: [] }
 */
function getNearestFacilities(patiente, limit = 5) {
  const ville = patiente.ville || "Abidjan";
  const patienteCoords = patiente.coordonnees || VILLE_COORDS[ville] || VILLE_COORDS["Abidjan"];
  
  // Récupérer tous les établissements de la ville
  let facilities = HEALTH_FACILITIES[ville] || [];
  
  // Si pas d'établissements dans la ville, chercher dans les villes proches
  if (facilities.length === 0) {
    // Chercher dans toutes les villes
    Object.keys(HEALTH_FACILITIES).forEach(v => {
      facilities = facilities.concat(HEALTH_FACILITIES[v]);
    });
  }
  
  // Calculer les distances
  facilities.forEach(facility => {
    facility.distance = calculateDistance(patienteCoords, facility.coordonnees);
  });
  
  // Trier par distance
  facilities.sort((a, b) => a.distance - b.distance);
  
  // Séparer par type
  const hopitaux = facilities
    .filter(f => f.type === "hopital")
    .slice(0, limit);
  
  const pharmacies = facilities
    .filter(f => f.type === "pharmacie")
    .slice(0, limit);
  
  return { hopitaux, pharmacies };
}

/**
 * Obtenir tous les établissements d'une ville
 * @param {string} ville - Nom de la ville
 * @returns {Array} Liste des établissements
 */
function getFacilitiesByCity(ville) {
  return HEALTH_FACILITIES[ville] || [];
}

// Exposer les fonctions globalement
window.getNearestFacilities = getNearestFacilities;
window.getFacilitiesByCity = getFacilitiesByCity;
window.HEALTH_FACILITIES = HEALTH_FACILITIES;
window.VILLE_COORDS = VILLE_COORDS;

