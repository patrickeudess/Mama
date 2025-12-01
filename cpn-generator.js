/**
 * Générateur automatique de CPN (Consultations Prénatales)
 * Calcule automatiquement les dates des prochaines CPN basées sur :
 * - La date de la 1ère CPN
 * - La semaine de grossesse au moment de la 1ère CPN
 * - Le nombre de CPN souhaité (4 ou 8)
 */

/**
 * Calcule les dates des CPN selon le calendrier standard
 * @param {Date|string} datePremiereCPN - Date de la première CPN
 * @param {number} semaineGrossesse - Semaine de grossesse au moment de la CPN1
 * @param {number} nombreCPN - Nombre de CPN à générer (4 ou 8)
 * @returns {Array} Liste des CPN avec leurs dates
 */
function generateCPNCalendar(datePremiereCPN, semaineGrossesse, nombreCPN = 4) {
  if (!datePremiereCPN) {
    return [];
  }

  const premiereCPN = new Date(datePremiereCPN);
  if (isNaN(premiereCPN.getTime())) {
    return [];
  }

  // Calendrier standard des CPN selon les recommandations OMS
  // CPN1: 12 semaines (déjà passée, c'est la date de référence)
  // CPN2: 16 semaines (4 semaines après CPN1)
  // CPN3: 20 semaines (4 semaines après CPN2)
  // CPN4: 24 semaines (4 semaines après CPN3)
  // CPN5: 28 semaines (4 semaines après CPN4)
  // CPN6: 32 semaines (4 semaines après CPN5)
  // CPN7: 36 semaines (4 semaines après CPN6)
  // CPN8: 38 semaines (2 semaines après CPN7)

  const cpnList = [];
  
  // Calculer la date de début de grossesse (basée sur la semaine de grossesse)
  const dateDebutGrossesse = new Date(premiereCPN);
  const joursDepuisDebut = (semaineGrossesse - 1) * 7;
  dateDebutGrossesse.setDate(dateDebutGrossesse.getDate() - joursDepuisDebut);

  // Semaines cibles pour chaque CPN (par rapport au début de grossesse)
  const cpnSchedule = [
    { numero: 1, semaine: 12 },  // CPN1
    { numero: 2, semaine: 16 },  // CPN2
    { numero: 3, semaine: 20 },  // CPN3
    { numero: 4, semaine: 24 },  // CPN4
    { numero: 5, semaine: 28 },  // CPN5
    { numero: 6, semaine: 32 },  // CPN6
    { numero: 7, semaine: 36 },  // CPN7
    { numero: 8, semaine: 38 }   // CPN8
  ];

  // Générer les CPN
  const nombreCPNToGenerate = Math.min(nombreCPN, 8);
  
  for (let i = 0; i < nombreCPNToGenerate; i++) {
    const cpnInfo = cpnSchedule[i];
    if (!cpnInfo) break;

    // Calculer la date cible pour cette CPN
    const dateCPN = new Date(dateDebutGrossesse);
    const joursPourCPN = (cpnInfo.semaine - 1) * 7;
    dateCPN.setDate(dateCPN.getDate() + joursPourCPN);

    // Si c'est la CPN1, utiliser la date fournie
    if (cpnInfo.numero === 1) {
      dateCPN.setTime(premiereCPN.getTime());
    }

    // Ne générer que les CPN futures (ou la CPN1 si c'est aujourd'hui ou dans le passé)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const cpnDate = new Date(dateCPN);
    cpnDate.setHours(0, 0, 0, 0);

    // Inclure la CPN1 même si elle est passée, et toutes les CPN futures
    if (cpnInfo.numero === 1 || cpnDate >= today) {
      cpnList.push({
        numero_cpn: cpnInfo.numero,
        date_rdv: dateCPN.toISOString(),
        semaine_grossesse: cpnInfo.semaine,
        statut: cpnInfo.numero === 1 && cpnDate < today ? "complete" : "planifie"
      });
    }
  }

  return cpnList;
}

/**
 * Formate une liste de CPN pour l'affichage
 * @param {Array} cpnList - Liste des CPN
 * @returns {string} HTML formaté
 */
function formatCPNPreview(cpnList) {
  if (!cpnList || cpnList.length === 0) {
    return '<p style="color: #6b7280; font-style: italic;">Aucune CPN à générer</p>';
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return cpnList.map(cpn => {
    const date = new Date(cpn.date_rdv);
    const dateStr = date.toLocaleDateString("fr-FR", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric"
    });
    
    const isPast = date < today;
    const isToday = date.toDateString() === today.toDateString();
    
    let statusBadge = '';
    if (isPast) {
      statusBadge = '<span style="color: #10b981; font-weight: 600;">✓ Passée</span>';
    } else if (isToday) {
      statusBadge = '<span style="color: #f59e0b; font-weight: 600;">Aujourd\'hui</span>';
    } else {
      const daysUntil = Math.ceil((date - today) / (1000 * 60 * 60 * 24));
      statusBadge = `<span style="color: #3b82f6;">Dans ${daysUntil} jour${daysUntil > 1 ? 's' : ''}</span>`;
    }

    return `
      <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.5rem 0; border-bottom: 1px solid #e5e7eb;">
        <div>
          <strong>CPN ${cpn.numero_cpn}</strong> - Semaine ${cpn.semaine_grossesse}
          <br>
          <small style="color: #6b7280;">${dateStr}</small>
        </div>
        <div style="text-align: right;">
          ${statusBadge}
        </div>
      </div>
    `;
  }).join('');
}

// Exposer les fonctions globalement
window.generateCPNCalendar = generateCPNCalendar;
window.formatCPNPreview = formatCPNPreview;

