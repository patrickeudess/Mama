// Données de démonstration pour fonctionner sans serveur backend

const MOCK_DATA = {
  // Données patiente
  patiente: {
    id: 1,
    prenom: "Awa",
    nom: "Koffi",
    age: 28,
    ville: "Bamako",
    adresse: "Quartier Hamdallaye",
    distance_centre: 2.3,
    moyen_transport: "moto",
    date_dernieres_regles: "2024-01-15",
    date_accouchement_prevue: "2024-10-22",
    gestite: 2,
    parite: 1,
    niveau_instruction: "secondaire",
    langue: "bambara"
  },

  // Prédiction de risque
  risk: {
    available: true,
    risk_score: 0.68,
    risk_level: "moyen",
    confidence: 0.85,
    recommendations: [
      "Hydratez-vous davantage et reposez-vous.",
      "Si vous ressentez des maux de tête fréquents, consultez sans attendre.",
      "Le centre le plus proche est à 2,3 km."
    ],
    features_used: ["age", "gestite", "parite", "distance_centre"]
  },

  // CPN
  cpn: [
    {
      id: 1,
      numero_cpn: 1,
      date_rdv: "2024-02-15T09:00:00",
      statut: "complete",
      notes: "Consultation normale, tout va bien."
    },
    {
      id: 2,
      numero_cpn: 2,
      date_rdv: "2024-03-15T09:00:00",
      statut: "complete",
      notes: "Poids normal, tension stable."
    },
    {
      id: 3,
      numero_cpn: 3,
      date_rdv: "2024-04-20T10:00:00",
      statut: "planifie",
      notes: "Prochaine consultation prévue."
    }
  ],

  // Prochaine CPN
  nextCpn: {
    id: 3,
    numero_cpn: 3,
    date_rdv: "2024-04-20T10:00:00",
    statut: "planifie",
    lieu: "Centre de santé de Hamdallaye",
    notes: "N'oubliez pas d'apporter vos examens précédents."
  },

  // Notifications
  notifications: [
    {
      type: "cpn_reminder",
      message: "Rappel : Votre CPN #3 est prévue dans 2 jours (20/04/2024 à 10h00)",
      date: "2024-04-18"
    },
    {
      type: "prevention",
      message: "Évitez les efforts intenses et signalez toute douleur inhabituelle.",
      date: "2024-04-17"
    }
  ],

  // Dossier complet
  dossier: {
    patiente: {
      id: 1,
      prenom: "Awa",
      nom: "Koffi",
      age: 28,
      user: {
        telephone: "+22370000001"
      }
    },
    consultations: [
      {
        id: 1,
        date_consultation: "2024-02-15T09:00:00",
        poids: 65.5,
        tension_arterielle_systolique: 120,
        tension_arterielle_diastolique: 80,
        notes: "Consultation normale"
      },
      {
        id: 2,
        date_consultation: "2024-03-15T09:00:00",
        poids: 67.2,
        tension_arterielle_systolique: 118,
        tension_arterielle_diastolique: 78,
        notes: "Poids normal, tension stable"
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
  },

  // Données professionnel - Statistiques
  stats: {
    total_patientes: 15,
    cpn_planifiees: 8,
    cpn_aujourd_hui: 2,
    cpn_manquees: 3,
    consultations_ce_mois: 45
  },

  // Liste des patientes
  patientes: [
    {
      id: 1,
      prenom: "Awa",
      nom: "Koffi",
      age: 28,
      ville: "Bamako",
      distance_centre: 2.3,
      prochaine_cpn: {
        date_rdv: "2024-04-20T10:00:00",
        statut: "planifie"
      }
    },
    {
      id: 2,
      prenom: "Mariam",
      nom: "Kouadio",
      age: 19,
      ville: "Bamako",
      distance_centre: 5.1,
      prochaine_cpn: {
        date_rdv: "2024-04-18T14:00:00",
        statut: "planifie"
      }
    },
    {
      id: 3,
      prenom: "Fatou",
      nom: "Diallo",
      age: 32,
      ville: "Sikasso",
      distance_centre: 1.8,
      prochaine_cpn: {
        date_rdv: "2024-04-19T09:00:00",
        statut: "planifie"
      }
    }
  ],

  // Risques par patiente
  risks: {
    patientes: [
      {
        patiente_id: 1,
        prediction: {
          available: true,
          risk_score: 0.68,
          risk_level: "moyen",
          confidence: 0.85
        }
      },
      {
        patiente_id: 2,
        prediction: {
          available: true,
          risk_score: 0.82,
          risk_level: "élevé",
          confidence: 0.90
        }
      },
      {
        patiente_id: 3,
        prediction: {
          available: true,
          risk_score: 0.35,
          risk_level: "faible",
          confidence: 0.80
        }
      }
    ]
  }
};

// Fonction pour simuler un délai réseau
function delay(ms = 500) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Fonction pour obtenir des données mockées selon le chemin
export async function getMockData(path, options = {}) {
  await delay(300); // Simuler un délai réseau

  // Extraire le chemin de base
  const pathParts = path.split('?')[0].split('/').filter(p => p);
  
  // Route patiente
  if (path === "/patientes/" || path === "/dashboard/patientes") {
    return MOCK_DATA.patientes;
  }
  
  if (path.startsWith("/patientes/") && path.endsWith("/dossier")) {
    return MOCK_DATA.dossier;
  }
  
  if (path.startsWith("/patientes/") && path.includes("/risk")) {
    return MOCK_DATA.risk;
  }
  
  // Route prédiction
  if (path === "/prediction/patientes/risks") {
    return MOCK_DATA.risks;
  }
  
  // Route dashboard
  if (path === "/dashboard/stats") {
    return MOCK_DATA.stats;
  }
  
  // Route CPN
  if (path.startsWith("/cpn")) {
    return MOCK_DATA.cpn;
  }
  
  // Par défaut, retourner null
  return null;
}

// Variable globale pour activer/désactiver le mode mock
window.USE_MOCK_DATA = true;

