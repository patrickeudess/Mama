/**
 * Script pour la page établissement de santé
 * Gère le tableau de bord, les statistiques et les fonctionnalités spécifiques aux établissements
 */

// Clé pour le stockage local
const STORAGE_KEY = 'mama_patientes_data';
const ESTABLISHMENT_PROFILE_KEY = 'mama_establishment_profile';

// Éléments DOM
let userInfo, userName, logoutButton;
let establishmentProfileFormCard;
let dashboardStatsContent;
let criticalAlertSection;

// Initialisation au chargement
document.addEventListener('DOMContentLoaded', function() {
  initializeElements();
  setupEventListeners();
  checkAndLoadProfile();
  loadDashboardData();
  
  // 🔄 SYNCHRONISATION AUTOMATIQUE : Rafraîchir les données toutes les 30 secondes
  setInterval(() => {
    loadDashboardData();
  }, 30000); // 30 secondes
});

function initializeElements() {
  userInfo = document.getElementById('user-info');
  userName = document.getElementById('user-name');
  logoutButton = document.getElementById('logout-button');
  dashboardStatsContent = document.getElementById('dashboard-stats-content');
  criticalAlertSection = document.getElementById('critical-alert-section');
}

function setupEventListeners() {
  // Gestion de la déconnexion
  if (logoutButton) {
    logoutButton.addEventListener('click', handleLogout);
  }

  // Gestion de l'alerte critique
  const dismissAlertBtn = document.getElementById('dismiss-alert');
  if (dismissAlertBtn) {
    dismissAlertBtn.addEventListener('click', () => {
      if (criticalAlertSection) {
        criticalAlertSection.classList.add('hidden');
      }
    });
  }

  const criticalAlertAction = document.getElementById('critical-alert-action');
  if (criticalAlertAction) {
    criticalAlertAction.addEventListener('click', () => {
      window.location.href = 'mes-patientes.html?filter=risque-eleve';
    });
  }
}

function handleLogout() {
  if (window.auth && window.auth.logout) {
    window.auth.logout();
  }
  window.location.href = 'index.html';
}

function checkAndLoadProfile() {
  const profile = loadEstablishmentProfile();
  
  if (!profile) {
    // Rediriger vers la page de création de profil
    window.location.href = 'creer-profil-etablissement.html';
    return;
  }
  
  // Afficher le tableau de bord
  const dashboardSection = document.getElementById('dashboard-section');
  const toolsSection = document.getElementById('tools-section');
  
  if (dashboardSection) {
    dashboardSection.classList.remove('hidden');
  }
  if (toolsSection) {
    toolsSection.classList.remove('hidden');
  }
  
  if (userName && profile.nom) {
    userName.textContent = profile.nom;
  }
  
  if (userInfo) {
    userInfo.classList.remove('hidden');
  }
}

function loadEstablishmentProfile() {
  try {
    const stored = localStorage.getItem(ESTABLISHMENT_PROFILE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error('Erreur lors du chargement du profil établissement:', error);
    return null;
  }
}

function saveEstablishmentProfile(profile) {
  try {
    localStorage.setItem(ESTABLISHMENT_PROFILE_KEY, JSON.stringify(profile));
    return true;
  } catch (error) {
    console.error('Erreur lors de la sauvegarde du profil établissement:', error);
    return false;
  }
}


function getPatientes() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Erreur lors du chargement des patientes:', error);
    return [];
  }
}

async function loadDashboardData() {
  try {
    const patientes = getPatientes();
    const profile = loadEstablishmentProfile();
    
    // Si pas de profil, ne pas charger les données
    if (!profile) {
      return;
    }

    // 🔄 SYNCHRONISATION AUTOMATIQUE : Actualiser les données depuis les professionnels
    synchronizeEstablishmentData(patientes, profile);

    // Calculer les statistiques (avec données synchronisées)
    const stats = calculateEstablishmentStats(patientes, profile);
    
    // Afficher les statistiques synthétiques
    renderDashboardStats(stats);
    
    // Vérifier les alertes critiques
    checkCriticalAlerts(stats.patientes || patientes);
    
  } catch (error) {
    console.error('Erreur lors du chargement des données:', error);
    if (dashboardStatsContent) {
      dashboardStatsContent.innerHTML = `
        <div class="error-state" style="text-align: center; padding: 2rem; color: #dc2626;">
          <p>Erreur lors du chargement des données</p>
          <small>${error.message}</small>
        </div>
      `;
    }
  }
}

/**
 * 🔄 Synchronise automatiquement les données des professionnels avec l'établissement
 * Cette fonction met à jour les patientes pour qu'elles soient associées à l'établissement
 */
function synchronizeEstablishmentData(patientes, profile) {
  try {
    const etabId = profile.etablissementId || getCurrentEstablishmentId();
    if (!etabId) {
      console.warn('⚠️ Pas d\'ID établissement trouvé pour la synchronisation');
      return;
    }
    
    // Récupérer tous les professionnels de cet établissement
    const professionnels = JSON.parse(localStorage.getItem('mama_establishment_professionnels') || '[]');
    const professionnelsEtablissement = professionnels.filter(p => p.etablissementId === etabId);
    
    if (professionnelsEtablissement.length === 0) {
      console.log('ℹ️ Aucun professionnel trouvé pour cet établissement');
      return;
    }
    
    let updated = false;
    const updatedPatientes = patientes.map(patiente => {
      // Si la patiente n'a pas d'établissement mais a un centre_sante qui correspond
      if (!patiente.etablissementId) {
        // Vérifier si le centre_sante correspond au nom de l'établissement
        if (patiente.centre_sante && profile.nom && 
            patiente.centre_sante.toLowerCase().includes(profile.nom.toLowerCase())) {
          updated = true;
          return {
            ...patiente,
            etablissementId: etabId,
            updatedAt: new Date().toISOString()
          };
        }
      }
      return patiente;
    });
    
    // Sauvegarder si des mises à jour ont été faites
    if (updated) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedPatientes));
      console.log('✅ Données synchronisées avec l\'établissement');
    }
  } catch (error) {
    console.error('Erreur lors de la synchronisation:', error);
  }
}

function calculateEstablishmentStats(patientes, profile) {
  const total = patientes.length;
  
  // 🔄 SYNCHRONISATION AUTOMATIQUE : Filtrer par ID d'établissement (plus fiable que le nom)
  let filteredPatientes = patientes;
  const etablissementId = profile.etablissementId || getCurrentEstablishmentId();
  
  if (etablissementId) {
    // Filtrer par ID d'établissement (méthode principale)
    filteredPatientes = patientes.filter(p => 
      p.etablissementId === etablissementId
    );
    
    // Si aucune patiente trouvée par ID, essayer par nom (rétrocompatibilité)
    if (filteredPatientes.length === 0 && profile.nom) {
      filteredPatientes = patientes.filter(p => 
        p.centre_sante && p.centre_sante.toLowerCase().includes(profile.nom.toLowerCase())
      );
    }
  } else if (profile.nom) {
    // Fallback : filtrer par nom si pas d'ID
    filteredPatientes = patientes.filter(p => 
      p.centre_sante && p.centre_sante.toLowerCase().includes(profile.nom.toLowerCase())
    );
  }
  
  const totalFiltered = filteredPatientes.length;
  const today = new Date();
  
  // Calculer les risques
  const risques = {
    eleve: filteredPatientes.filter(p => p.risque === 'élevé' || p.risque === 'eleve').length,
    moyen: filteredPatientes.filter(p => p.risque === 'moyen' || p.risque === 'modéré').length,
    faible: filteredPatientes.filter(p => p.risque === 'faible').length
  };
  
  // CPN planifiées cette semaine
  const weekFromNow = new Date(today);
  weekFromNow.setDate(today.getDate() + 7);
  
  const cpnThisWeek = filteredPatientes.filter(p => {
    if (!p.prochaine_cpn) return false;
    const cpnDate = new Date(p.prochaine_cpn);
    return cpnDate >= today && cpnDate <= weekFromNow;
  }).length;
  
  // CPN manquées (passées sans être complétées)
  const cpnMissed = filteredPatientes.filter(p => {
    if (!p.prochaine_cpn) return false;
    const cpnDate = new Date(p.prochaine_cpn);
    return cpnDate < today && (p.statut_cpn !== 'complete' && p.statut_cpn !== 'complétée');
  }).length;
  
  // Consultations aujourd'hui
  const consultationsToday = filteredPatientes.filter(p => {
    if (!p.derniere_venue) return false;
    const visitDate = new Date(p.derniere_venue);
    return visitDate.toDateString() === today.toDateString();
  }).length;
  
  // Taux d'observance (CPN complétées / CPN planifiées)
  const cpnCompletes = filteredPatientes.filter(p => 
    p.statut_cpn === 'complete' || p.statut_cpn === 'complétée'
  ).length;
  const cpnTotal = filteredPatientes.filter(p => p.prochaine_cpn || p.statut_cpn).length;
  const tauxObservance = cpnTotal > 0 ? Math.round((cpnCompletes / cpnTotal) * 100) : 0;
  
  // Professionnels actifs (depuis localStorage)
  const professionnels = JSON.parse(localStorage.getItem('mama_establishment_professionnels') || '[]');
  // Utiliser la variable etablissementId déjà déclarée plus haut
  const professionnelsActifs = professionnels.filter(p => p.etablissementId === etablissementId).length;
  
  // Répartition par ville (top 3)
  const villes = {};
  filteredPatientes.forEach(p => {
    if (p.ville) {
      villes[p.ville] = (villes[p.ville] || 0) + 1;
    }
  });
  const topVilles = Object.entries(villes)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([ville, count]) => ({ ville, count }));
  
  // Alertes prioritaires
  const alertes = {
    risqueEleve: risques.eleve,
    cpnManquees: cpnMissed,
    besoinSuivi: filteredPatientes.filter(p => {
      const lastVisit = p.derniere_venue ? new Date(p.derniere_venue) : null;
      if (!lastVisit) return true;
      const daysSinceVisit = Math.floor((today - lastVisit) / (1000 * 60 * 60 * 24));
      return daysSinceVisit > 30; // Pas de visite depuis plus de 30 jours
    }).length
  };
  
  return {
    total: totalFiltered,
    totalGlobal: total,
    risques,
    cpnThisWeek,
    cpnMissed,
    consultationsToday,
    tauxObservance,
    professionnelsActifs,
    villes: topVilles,
    alertes,
    patientes: filteredPatientes
  };
}

function renderDashboardStats(stats) {
  if (!dashboardStatsContent) return;
  
  // Déterminer le statut de performance
  const performanceStatus = stats.tauxObservance >= 80 ? 'excellent' : 
                           stats.tauxObservance >= 60 ? 'bon' : 'attention';
  
  // KPIs synthétiques - seulement l'essentiel
  const statsHTML = `
    <!-- KPI Principal: Patientes suivies -->
    <div class="stat-card kpi-main" style="grid-column: span 2;">
      <div class="stat-value-large" style="color: #3b82f6; font-size: 2.5rem; font-weight: 700;">${stats.total}</div>
      <div class="stat-label" style="font-size: 1rem; font-weight: 600;">Patientes suivies</div>
      <div class="stat-subtitle" style="color: #6b7280; font-size: 0.875rem; margin-top: 0.25rem;">
        ${stats.professionnelsActifs} professionnel${stats.professionnelsActifs > 1 ? 's' : ''} actif${stats.professionnelsActifs > 1 ? 's' : ''}
      </div>
    </div>
    
    <!-- KPI: Taux d'observance -->
    <div class="stat-card kpi-performance" style="background: linear-gradient(135deg, ${performanceStatus === 'excellent' ? '#d1fae5' : performanceStatus === 'bon' ? '#fef3c7' : '#fee2e2'} 0%, ${performanceStatus === 'excellent' ? '#a7f3d0' : performanceStatus === 'bon' ? '#fde68a' : '#fecaca'} 100%);">
      <div class="stat-value" style="color: ${performanceStatus === 'excellent' ? '#059669' : performanceStatus === 'bon' ? '#d97706' : '#dc2626'}; font-size: 2rem; font-weight: 700;">
        ${stats.tauxObservance}%
      </div>
      <div class="stat-label">Observance CPN</div>
      <div class="stat-indicator" style="margin-top: 0.5rem; font-size: 0.75rem; color: #6b7280;">
        ${performanceStatus === 'excellent' ? '✅ Excellent' : performanceStatus === 'bon' ? '⚠️ À améliorer' : '🔴 Critique'}
      </div>
    </div>
    
    <!-- KPI: Risque élevé -->
    <div class="stat-card risk-high-stat" style="border-left: 4px solid #dc2626;">
      <div class="stat-value" style="color: #dc2626; font-size: 1.75rem; font-weight: 700;">${stats.risques.eleve}</div>
      <div class="stat-label">Risque élevé</div>
    </div>
    
    <!-- KPI: CPN cette semaine -->
    <div class="stat-card">
      <div class="stat-value" style="color: #8b5cf6; font-size: 1.75rem; font-weight: 700;">${stats.cpnThisWeek}</div>
      <div class="stat-label">CPN cette semaine</div>
      ${stats.cpnMissed > 0 ? `
        <div class="stat-alert" style="margin-top: 0.5rem; padding: 0.25rem 0.5rem; background: #fee2e2; color: #991b1b; border-radius: 0.25rem; font-size: 0.75rem;">
          ⚠️ ${stats.cpnMissed} manquée${stats.cpnMissed > 1 ? 's' : ''}
        </div>
      ` : ''}
    </div>
    
    <!-- KPI: Nombre de professionnels -->
    <div class="stat-card" style="background: linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%);">
      <div class="stat-value" style="color: #6366f1; font-size: 1.75rem; font-weight: 700;">${stats.professionnelsActifs}</div>
      <div class="stat-label">Professionnels</div>
      <div class="stat-indicator" style="margin-top: 0.5rem; font-size: 0.75rem; color: #6b7280;">
        ${stats.professionnelsActifs > 0 ? '✅ Actifs' : '⚠️ Aucun'}
      </div>
    </div>
  `;
  
  dashboardStatsContent.innerHTML = statsHTML;
  
  // Rendre les actions prioritaires (sans doublons)
  renderPriorityActions(stats);
  
  // Masquer l'alerte critique si déjà dans les actions prioritaires
  if (stats.alertes.risqueEleve > 0 && criticalAlertSection) {
    // L'alerte critique reste visible en haut pour visibilité maximale
  }
}

function renderPriorityActions(stats) {
  const priorityActionsContent = document.getElementById('priority-actions-content');
  if (!priorityActionsContent) return;
  
  const actions = [];
  
  // Action 1: Risque élevé (seulement si > 0, pas de doublon avec alerte critique)
  if (stats.alertes.risqueEleve > 0) {
    actions.push({
      priority: 'high',
      icon: '🔴',
      title: `${stats.alertes.risqueEleve} patiente${stats.alertes.risqueEleve > 1 ? 's' : ''} à risque élevé`,
      description: 'Suivi immédiat requis',
      action: 'Voir',
      link: 'mes-patientes.html?filter=risque-eleve',
      color: '#dc2626'
    });
  }
  
  // Action 2: CPN manquées
  if (stats.cpnMissed > 0) {
    actions.push({
      priority: 'high',
      icon: '⚠️',
      title: `${stats.cpnMissed} CPN manquée${stats.cpnMissed > 1 ? 's' : ''}`,
      description: 'Reprogrammation nécessaire',
      action: 'Gérer',
      link: 'mes-patientes.html?filter=cpn-manquee',
      color: '#d97706'
    });
  }
  
  // Action 3: Besoin de suivi
  if (stats.alertes.besoinSuivi > 0) {
    actions.push({
      priority: 'medium',
      icon: '📞',
      title: `${stats.alertes.besoinSuivi} patiente${stats.alertes.besoinSuivi > 1 ? 's' : ''} à contacter`,
      description: 'Pas de visite depuis 30+ jours',
      action: 'Voir',
      link: 'mes-patientes.html?filter=suivi-requis',
      color: '#3b82f6'
    });
  }
  
  if (actions.length === 0) {
    priorityActionsContent.innerHTML = `
      <div style="text-align: center; padding: 1.5rem; color: #059669;">
        <div style="font-size: 1.5rem; margin-bottom: 0.5rem;">✅</div>
        <p style="font-weight: 600; color: #059669; font-size: 0.95rem;">Aucune action prioritaire</p>
        <p style="color: #6b7280; font-size: 0.85rem; margin-top: 0.25rem;">Tout fonctionne correctement</p>
      </div>
    `;
    return;
  }
  
  // Actions compactes et synthétiques
  const actionsHTML = actions.map(action => `
    <div class="priority-action-card" style="
      padding: 1rem;
      border-left: 4px solid ${action.color};
      background: ${action.priority === 'high' ? '#fef2f2' : '#f0f9ff'};
      border-radius: 0.5rem;
      transition: transform 0.2s, box-shadow 0.2s;
    ">
      <div style="display: flex; align-items: center; gap: 0.75rem;">
        <div style="font-size: 1.5rem;">${action.icon}</div>
        <div style="flex: 1;">
          <h3 style="margin: 0 0 0.25rem 0; font-size: 0.95rem; font-weight: 700; color: #1f2937;">
            ${action.title}
          </h3>
          <p style="margin: 0; color: #6b7280; font-size: 0.8rem;">
            ${action.description}
          </p>
        </div>
        <a href="${action.link}" style="
          padding: 0.5rem 1rem;
          background: ${action.color};
          color: white;
          text-decoration: none;
          border-radius: 0.375rem;
          font-size: 0.85rem;
          font-weight: 600;
          white-space: nowrap;
        ">${action.action} →</a>
      </div>
    </div>
  `).join('');
  
  priorityActionsContent.innerHTML = actionsHTML;
}


// Fonction helper pour obtenir l'ID établissement
function getCurrentEstablishmentId() {
  try {
    const profileStr = localStorage.getItem(ESTABLISHMENT_PROFILE_KEY);
    if (!profileStr) return null;
    const profile = JSON.parse(profileStr);
    if (!profile.etablissementId) {
      const id = `etab_${profile.nom.replace(/\s+/g, '_').toLowerCase()}_${profile.createdAt || Date.now()}`;
      profile.etablissementId = id;
      localStorage.setItem(ESTABLISHMENT_PROFILE_KEY, JSON.stringify(profile));
      return id;
    }
    return profile.etablissementId;
  } catch (error) {
    return null;
  }
}

function checkCriticalAlerts(patientes) {
  if (!criticalAlertSection) return;
  
  const highRisk = patientes.filter(p => p.risque === 'élevé' || p.risque === 'eleve');
  
  if (highRisk.length > 0) {
    const alertText = document.getElementById('critical-alert-text');
    if (alertText) {
      alertText.textContent = `${highRisk.length} patiente${highRisk.length > 1 ? 's' : ''} à risque élevé nécessitent une attention immédiate`;
    }
    criticalAlertSection.classList.remove('hidden');
  } else {
    criticalAlertSection.classList.add('hidden');
  }
}

// Exposer les fonctions globalement
window.loadDashboardData = loadDashboardData;

