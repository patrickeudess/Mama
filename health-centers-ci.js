/**
 * Liste des centres de santé d'Afrique de l'Ouest
 * Organisés par pays et ville
 */

const HEALTH_CENTERS = {
  "Côte d'Ivoire": {
    "Abidjan": [
      "CHU de Cocody",
      "CHU de Treichville",
      "CHU de Yopougon",
      "Centre Hospitalier Universitaire (CHU) Angré",
      "Centre de Santé Urbain (CSU) Abobo",
      "Centre de Santé Urbain (CSU) Adjamé",
      "Centre de Santé Urbain (CSU) Attécoubé",
      "Centre de Santé Urbain (CSU) Cocody",
      "Centre de Santé Urbain (CSU) Marcory",
      "Centre de Santé Urbain (CSU) Port-Bouët",
      "Centre de Santé Urbain (CSU) Yopougon",
      "Centre de Santé Urbain (CSU) Koumassi",
      "Centre de Santé Urbain (CSU) Anyama",
      "Centre de Santé Urbain (CSU) Bingerville",
      "Centre de Santé Urbain (CSU) Songon"
    ],
    "Bouaké": [
      "CHU de Bouaké",
      "Centre Hospitalier Régional (CHR) de Bouaké",
      "Centre de Santé Urbain (CSU) Bouaké Centre",
      "Centre de Santé Urbain (CSU) Bouaké Nord",
      "Centre de Santé Urbain (CSU) Bouaké Sud"
    ],
    "Daloa": [
      "CHR de Daloa",
      "Centre de Santé Urbain (CSU) Daloa",
      "Centre de Santé Urbain (CSU) Daloa Ouest"
    ],
    "Korhogo": [
      "CHR de Korhogo",
      "Centre de Santé Urbain (CSU) Korhogo",
      "Centre de Santé Urbain (CSU) Korhogo Nord"
    ],
    "San-Pédro": [
      "CHR de San-Pédro",
      "Centre de Santé Urbain (CSU) San-Pédro",
      "Centre de Santé Urbain (CSU) San-Pédro Port"
    ],
    "Yamoussoukro": [
      "CHU de Yamoussoukro",
      "Centre Hospitalier Régional (CHR) de Yamoussoukro",
      "Centre de Santé Urbain (CSU) Yamoussoukro",
      "Centre de Santé Urbain (CSU) Yamoussoukro Centre"
    ],
    "Man": [
      "CHR de Man",
      "Centre de Santé Urbain (CSU) Man",
      "Centre de Santé Urbain (CSU) Man Ouest"
    ],
    "Gagnoa": [
      "CHR de Gagnoa",
      "Centre de Santé Urbain (CSU) Gagnoa",
      "Centre de Santé Urbain (CSU) Gagnoa Centre"
    ],
    "Abengourou": [
      "CHR d'Abengourou",
      "Centre de Santé Urbain (CSU) Abengourou",
      "Centre de Santé Urbain (CSU) Abengourou Centre"
    ],
    "Divo": [
      "CHR de Divo",
      "Centre de Santé Urbain (CSU) Divo",
      "Centre de Santé Urbain (CSU) Divo Centre"
    ],
    "Odienné": [
      "CHR d'Odienné",
      "Centre de Santé Urbain (CSU) Odienné",
      "Centre de Santé Urbain (CSU) Odienné Centre"
    ],
    "Bondoukou": [
      "CHR de Bondoukou",
      "Centre de Santé Urbain (CSU) Bondoukou",
      "Centre de Santé Urbain (CSU) Bondoukou Centre"
    ],
    "Dabou": [
      "CHR de Dabou",
      "Centre de Santé Urbain (CSU) Dabou",
      "Centre de Santé Urbain (CSU) Dabou Centre"
    ],
    "Katiola": [
      "CHR de Katiola",
      "Centre de Santé Urbain (CSU) Katiola",
      "Centre de Santé Urbain (CSU) Katiola Centre"
    ],
    "Anyama": [
      "Centre de Santé Urbain (CSU) Anyama",
      "Centre de Santé Urbain (CSU) Anyama Centre"
    ]
  },
  "Mali": {
    "Bamako": [
      "CHU du Point G",
      "CHU Gabriel Touré",
      "CHU de Kati",
      "Centre Hospitalier Mère-Enfant",
      "Centre de Santé de Référence (CSREF) Commune I",
      "Centre de Santé de Référence (CSREF) Commune II",
      "Centre de Santé de Référence (CSREF) Commune III",
      "Centre de Santé de Référence (CSREF) Commune IV",
      "Centre de Santé de Référence (CSREF) Commune V",
      "Centre de Santé de Référence (CSREF) Commune VI"
    ],
    "Sikasso": [
      "CHR de Sikasso",
      "Centre de Santé de Référence (CSREF) Sikasso",
      "Centre de Santé Urbain (CSU) Sikasso",
      "Centre de Santé Urbain (CSU) Sikasso Centre"
    ],
    "Kayes": [
      "CHR de Kayes",
      "Centre de Santé de Référence (CSREF) Kayes",
      "Centre de Santé Urbain (CSU) Kayes"
    ],
    "Mopti": [
      "CHR de Mopti",
      "Centre de Santé de Référence (CSREF) Mopti",
      "Centre de Santé Urbain (CSU) Mopti"
    ],
    "Ségou": [
      "CHR de Ségou",
      "Centre de Santé de Référence (CSREF) Ségou",
      "Centre de Santé Urbain (CSU) Ségou"
    ],
    "Koulikoro": [
      "CHR de Koulikoro",
      "Centre de Santé de Référence (CSREF) Koulikoro",
      "Centre de Santé Urbain (CSU) Koulikoro"
    ],
    "Gao": [
      "CHR de Gao",
      "Centre de Santé de Référence (CSREF) Gao",
      "Centre de Santé Urbain (CSU) Gao"
    ],
    "Tombouctou": [
      "CHR de Tombouctou",
      "Centre de Santé de Référence (CSREF) Tombouctou",
      "Centre de Santé Urbain (CSU) Tombouctou"
    ]
  },
  "Burkina Faso": {
    "Ouagadougou": [
      "CHU Yalgado Ouédraogo",
      "CHU Pédiatrique Charles de Gaulle",
      "CHU Bogodogo",
      "Centre Hospitalier Universitaire Souro Sanou",
      "Centre Médical avec Antenne Chirurgicale (CMA) Ouagadougou",
      "Centre de Santé et de Promotion Sociale (CSPS) Ouagadougou Centre",
      "Centre de Santé et de Promotion Sociale (CSPS) Ouagadougou Nord",
      "Centre de Santé et de Promotion Sociale (CSPS) Ouagadougou Sud"
    ],
    "Bobo-Dioulasso": [
      "CHU Souro Sanou",
      "CHR de Bobo-Dioulasso",
      "Centre Médical avec Antenne Chirurgicale (CMA) Bobo-Dioulasso",
      "Centre de Santé et de Promotion Sociale (CSPS) Bobo-Dioulasso"
    ],
    "Koudougou": [
      "CHR de Koudougou",
      "Centre Médical avec Antenne Chirurgicale (CMA) Koudougou",
      "Centre de Santé et de Promotion Sociale (CSPS) Koudougou"
    ],
    "Ouahigouya": [
      "CHR de Ouahigouya",
      "Centre Médical avec Antenne Chirurgicale (CMA) Ouahigouya",
      "Centre de Santé et de Promotion Sociale (CSPS) Ouahigouya"
    ],
    "Banfora": [
      "CHR de Banfora",
      "Centre Médical avec Antenne Chirurgicale (CMA) Banfora",
      "Centre de Santé et de Promotion Sociale (CSPS) Banfora"
    ],
    "Dédougou": [
      "CHR de Dédougou",
      "Centre Médical avec Antenne Chirurgicale (CMA) Dédougou",
      "Centre de Santé et de Promotion Sociale (CSPS) Dédougou"
    ],
    "Fada N'gourma": [
      "CHR de Fada N'gourma",
      "Centre Médical avec Antenne Chirurgicale (CMA) Fada N'gourma",
      "Centre de Santé et de Promotion Sociale (CSPS) Fada N'gourma"
    ]
  },
  "Sénégal": {
    "Dakar": [
      "CHU Aristide Le Dantec",
      "CHU de Fann",
      "CHU Abass Ndao",
      "Hôpital Principal de Dakar",
      "Centre Hospitalier National d'Enfants Albert Royer",
      "Centre de Santé de Référence (CSREF) Dakar Plateau",
      "Centre de Santé de Référence (CSREF) Dakar Médina",
      "Centre de Santé de Référence (CSREF) Dakar Ouakam",
      "Centre de Santé de Référence (CSREF) Dakar Yoff"
    ],
    "Thiès": [
      "CHR de Thiès",
      "Centre Hospitalier Régional de Thiès",
      "Centre de Santé de Référence (CSREF) Thiès",
      "Centre de Santé Urbain (CSU) Thiès"
    ],
    "Saint-Louis": [
      "CHR de Saint-Louis",
      "Centre Hospitalier Régional de Saint-Louis",
      "Centre de Santé de Référence (CSREF) Saint-Louis",
      "Centre de Santé Urbain (CSU) Saint-Louis"
    ],
    "Kaolack": [
      "CHR de Kaolack",
      "Centre Hospitalier Régional de Kaolack",
      "Centre de Santé de Référence (CSREF) Kaolack",
      "Centre de Santé Urbain (CSU) Kaolack"
    ],
    "Ziguinchor": [
      "CHR de Ziguinchor",
      "Centre Hospitalier Régional de Ziguinchor",
      "Centre de Santé de Référence (CSREF) Ziguinchor",
      "Centre de Santé Urbain (CSU) Ziguinchor"
    ],
    "Tambacounda": [
      "CHR de Tambacounda",
      "Centre Hospitalier Régional de Tambacounda",
      "Centre de Santé de Référence (CSREF) Tambacounda",
      "Centre de Santé Urbain (CSU) Tambacounda"
    ],
    "Louga": [
      "CHR de Louga",
      "Centre Hospitalier Régional de Louga",
      "Centre de Santé de Référence (CSREF) Louga",
      "Centre de Santé Urbain (CSU) Louga"
    ]
  },
  "Guinée": {
    "Conakry": [
      "CHU Donka",
      "CHU Ignace Deen",
      "Hôpital National Ignace Deen",
      "Centre Hospitalier Universitaire de Conakry",
      "Centre de Santé de Référence (CSREF) Conakry Centre",
      "Centre de Santé de Référence (CSREF) Conakry Kaloum",
      "Centre de Santé de Référence (CSREF) Conakry Ratoma"
    ],
    "Kindia": [
      "CHR de Kindia",
      "Centre Hospitalier Régional de Kindia",
      "Centre de Santé de Référence (CSREF) Kindia",
      "Centre de Santé Urbain (CSU) Kindia"
    ],
    "Kankan": [
      "CHR de Kankan",
      "Centre Hospitalier Régional de Kankan",
      "Centre de Santé de Référence (CSREF) Kankan",
      "Centre de Santé Urbain (CSU) Kankan"
    ],
    "Labé": [
      "CHR de Labé",
      "Centre Hospitalier Régional de Labé",
      "Centre de Santé de Référence (CSREF) Labé",
      "Centre de Santé Urbain (CSU) Labé"
    ],
    "Nzérékoré": [
      "CHR de Nzérékoré",
      "Centre Hospitalier Régional de Nzérékoré",
      "Centre de Santé de Référence (CSREF) Nzérékoré",
      "Centre de Santé Urbain (CSU) Nzérékoré"
    ]
  },
  "Niger": {
    "Niamey": [
      "CHU de Niamey",
      "Hôpital National de Niamey",
      "Centre Hospitalier Universitaire de Niamey",
      "Centre de Santé Intégré (CSI) Niamey Centre",
      "Centre de Santé Intégré (CSI) Niamey Ouest",
      "Centre de Santé Intégré (CSI) Niamey Est"
    ],
    "Zinder": [
      "CHR de Zinder",
      "Centre Hospitalier Régional de Zinder",
      "Centre de Santé Intégré (CSI) Zinder",
      "Centre de Santé Urbain (CSU) Zinder"
    ],
    "Maradi": [
      "CHR de Maradi",
      "Centre Hospitalier Régional de Maradi",
      "Centre de Santé Intégré (CSI) Maradi",
      "Centre de Santé Urbain (CSU) Maradi"
    ],
    "Tahoua": [
      "CHR de Tahoua",
      "Centre Hospitalier Régional de Tahoua",
      "Centre de Santé Intégré (CSI) Tahoua",
      "Centre de Santé Urbain (CSU) Tahoua"
    ],
    "Agadez": [
      "CHR d'Agadez",
      "Centre Hospitalier Régional d'Agadez",
      "Centre de Santé Intégré (CSI) Agadez",
      "Centre de Santé Urbain (CSU) Agadez"
    ],
    "Dosso": [
      "CHR de Dosso",
      "Centre Hospitalier Régional de Dosso",
      "Centre de Santé Intégré (CSI) Dosso",
      "Centre de Santé Urbain (CSU) Dosso"
    ]
  },
  "Bénin": {
    "Cotonou": [
      "CHU de Cotonou",
      "CHU Hubert Koutoukou Maga",
      "Centre National Hospitalier et Universitaire (CNHU)",
      "Centre de Santé de Zone (CSZ) Cotonou Centre",
      "Centre de Santé de Zone (CSZ) Cotonou Ouest",
      "Centre de Santé de Zone (CSZ) Cotonou Est"
    ],
    "Porto-Novo": [
      "CHU de Porto-Novo",
      "Centre Hospitalier Départemental de l'Ouémé",
      "Centre de Santé de Zone (CSZ) Porto-Novo",
      "Centre de Santé Urbain (CSU) Porto-Novo"
    ],
    "Parakou": [
      "CHU de Parakou",
      "Centre Hospitalier Départemental du Borgou",
      "Centre de Santé de Zone (CSZ) Parakou",
      "Centre de Santé Urbain (CSU) Parakou"
    ],
    "Abomey-Calavi": [
      "CHR d'Abomey-Calavi",
      "Centre Hospitalier Régional d'Abomey-Calavi",
      "Centre de Santé de Zone (CSZ) Abomey-Calavi",
      "Centre de Santé Urbain (CSU) Abomey-Calavi"
    ],
    "Djougou": [
      "CHR de Djougou",
      "Centre Hospitalier Régional de Djougou",
      "Centre de Santé de Zone (CSZ) Djougou",
      "Centre de Santé Urbain (CSU) Djougou"
    ]
  },
  "Togo": {
    "Lomé": [
      "CHU Sylvanus Olympio",
      "CHU Campus",
      "Centre Hospitalier Universitaire de Lomé",
      "Centre Hospitalier Régional de Lomé",
      "Centre de Santé de Zone (CSZ) Lomé Centre",
      "Centre de Santé de Zone (CSZ) Lomé Ouest",
      "Centre de Santé de Zone (CSZ) Lomé Est"
    ],
    "Kara": [
      "CHR de Kara",
      "Centre Hospitalier Régional de Kara",
      "Centre de Santé de Zone (CSZ) Kara",
      "Centre de Santé Urbain (CSU) Kara"
    ],
    "Sokodé": [
      "CHR de Sokodé",
      "Centre Hospitalier Régional de Sokodé",
      "Centre de Santé de Zone (CSZ) Sokodé",
      "Centre de Santé Urbain (CSU) Sokodé"
    ],
    "Atakpamé": [
      "CHR d'Atakpamé",
      "Centre Hospitalier Régional d'Atakpamé",
      "Centre de Santé de Zone (CSZ) Atakpamé",
      "Centre de Santé Urbain (CSU) Atakpamé"
    ],
    "Dapaong": [
      "CHR de Dapaong",
      "Centre Hospitalier Régional de Dapaong",
      "Centre de Santé de Zone (CSZ) Dapaong",
      "Centre de Santé Urbain (CSU) Dapaong"
    ]
  },
  "Ghana": {
    "Accra": [
      "Korle Bu Teaching Hospital",
      "37 Military Hospital",
      "Ridge Hospital",
      "La General Hospital",
      "Polyclinic Accra Central",
      "Polyclinic Accra North",
      "Polyclinic Accra South"
    ],
    "Kumasi": [
      "Komfo Anokye Teaching Hospital",
      "Kumasi South Hospital",
      "Suntreso Government Hospital",
      "Polyclinic Kumasi Central",
      "Polyclinic Kumasi North"
    ],
    "Tamale": [
      "Tamale Teaching Hospital",
      "Tamale Central Hospital",
      "Tamale West Hospital",
      "Polyclinic Tamale"
    ],
    "Takoradi": [
      "Effia Nkwanta Regional Hospital",
      "Takoradi Government Hospital",
      "Polyclinic Takoradi"
    ],
    "Cape Coast": [
      "Cape Coast Teaching Hospital",
      "Cape Coast Regional Hospital",
      "Polyclinic Cape Coast"
    ],
    "Sunyani": [
      "Sunyani Regional Hospital",
      "Sunyani Municipal Hospital",
      "Polyclinic Sunyani"
    ],
    "Ho": [
      "Ho Teaching Hospital",
      "Ho Municipal Hospital",
      "Polyclinic Ho"
    ]
  }
};

// Ancienne structure pour compatibilité (Côte d'Ivoire uniquement)
const HEALTH_CENTERS_CI = HEALTH_CENTERS["Côte d'Ivoire"] || {};

// Obtenir tous les centres de santé
function getAllHealthCenters() {
  const allCenters = [];
  Object.values(HEALTH_CENTERS).forEach(paysCenters => {
    Object.values(paysCenters).forEach(centers => {
      allCenters.push(...centers);
    });
  });
  return [...new Set(allCenters)].sort();
}

// Obtenir les centres de santé par ville et pays
function getHealthCentersByCity(ville, pays = null) {
  // Si un pays est spécifié, chercher dans ce pays
  if (pays && HEALTH_CENTERS[pays] && HEALTH_CENTERS[pays][ville]) {
    return HEALTH_CENTERS[pays][ville];
  }
  
  // Sinon, chercher dans tous les pays
  for (const paysName in HEALTH_CENTERS) {
    if (HEALTH_CENTERS[paysName][ville]) {
      return HEALTH_CENTERS[paysName][ville];
    }
  }
  
  return [];
}

// Obtenir toutes les villes avec centres de santé
function getCitiesWithHealthCenters(pays = null) {
  const villes = new Set();
  
  if (pays && HEALTH_CENTERS[pays]) {
    Object.keys(HEALTH_CENTERS[pays]).forEach(ville => villes.add(ville));
  } else {
    Object.values(HEALTH_CENTERS).forEach(paysCenters => {
      Object.keys(paysCenters).forEach(ville => villes.add(ville));
    });
  }
  
  return Array.from(villes).sort();
}

// Obtenir tous les pays disponibles
function getAllCountries() {
  return Object.keys(HEALTH_CENTERS).sort();
}

// Obtenir les villes d'un pays
function getCitiesByCountry(pays) {
  if (HEALTH_CENTERS[pays]) {
    return Object.keys(HEALTH_CENTERS[pays]).sort();
  }
  return [];
}

// Exposer les fonctions globalement
window.HEALTH_CENTERS = HEALTH_CENTERS;
window.HEALTH_CENTERS_CI = HEALTH_CENTERS_CI;
window.getAllHealthCenters = getAllHealthCenters;
window.getHealthCentersByCity = getHealthCentersByCity;
window.getCitiesWithHealthCenters = getCitiesWithHealthCenters;
window.getAllCountries = getAllCountries;
window.getCitiesByCountry = getCitiesByCountry;
