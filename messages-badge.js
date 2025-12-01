/**
 * Utilitaire pour afficher les badges de messages non lus
 */

/**
 * Récupère le nombre de messages non lus pour l'utilisateur actuel
 */
function getUnreadMessagesCount() {
  try {
    const messages = JSON.parse(localStorage.getItem('mama_messages') || '[]');
    let currentUser = null;
    
    // Essayer d'abord avec le système d'authentification
    if (window.auth && typeof window.auth.getCurrentUser === 'function') {
      try {
        currentUser = window.auth.getCurrentUser();
      } catch (e) {
        // Ignorer les erreurs
      }
    }
    
    // Fallback : récupérer depuis localStorage
    if (!currentUser) {
      const userStr = localStorage.getItem('mama_current_user');
      if (userStr) {
        try {
          currentUser = JSON.parse(userStr);
        } catch (e) {
          // Ignorer les erreurs de parsing
        }
      }
    }
    
    // Si toujours pas d'utilisateur, essayer de détecter depuis l'URL ou le contexte
    if (!currentUser) {
      // Détecter le type d'utilisateur depuis l'URL
      const path = window.location.pathname;
      if (path.includes('patriente') || path.includes('patiente')) {
        // Pour une patiente, on peut quand même compter les messages
        // mais on a besoin de l'ID de la patiente
        return 0; // Retourner 0 si on ne peut pas identifier l'utilisateur
      } else if (path.includes('professionnel')) {
        return 0; // Retourner 0 si on ne peut pas identifier l'utilisateur
      }
      return 0;
    }
    
    if (!currentUser) return 0;
    
    const userType = currentUser.type;
    const currentUserPhone = currentUser.phone || currentUser.telephone;
    
    // Récupérer les patientes pour trouver l'ID
    const patientes = JSON.parse(localStorage.getItem('mama_patientes_data') || '[]');
    const professionnels = JSON.parse(localStorage.getItem('mama_establishment_professionnels') || '[]');
    
    let unreadCount = 0;
    
    if (userType === 'patiente') {
      // Pour une patiente : compter les messages non lus du professionnel
      const currentPatiente = patientes.find(p => p.telephone === currentUserPhone);
      if (!currentPatiente) return 0;
      
      const professionnelId = currentPatiente.professionnelId || currentPatiente.pro_referent;
      if (!professionnelId) return 0;
      
      unreadCount = messages.filter(msg => 
        msg.from === 'professionnel' && 
        msg.fromId === professionnelId && 
        msg.to === 'patiente' &&
        !msg.read
      ).length;
      
    } else if (userType === 'professionnel') {
      // Pour un professionnel : compter les messages non lus de toutes ses patientes
      const currentProfessionnel = professionnels.find(p => p.telephone === currentUserPhone);
      if (!currentProfessionnel) return 0;
      
      const professionnelId = currentProfessionnel.id;
      const assignedPatientes = patientes.filter(p => 
        p.professionnelId == professionnelId || p.pro_referent == professionnelId
      );
      
      assignedPatientes.forEach(patiente => {
        const patienteUnread = messages.filter(msg =>
          msg.from === 'patiente' &&
          msg.fromId === patiente.id &&
          msg.to === 'professionnel' &&
          !msg.read
        ).length;
        unreadCount += patienteUnread;
      });
    }
    
    return unreadCount;
  } catch (error) {
    console.error('Erreur lors du calcul des messages non lus:', error);
    return 0;
  }
}

/**
 * Met à jour le badge de messages non lus sur la carte de messagerie
 */
function updateMessagesBadge() {
  const messagesCard = document.getElementById('tool-messages');
  if (!messagesCard) return;
  
  // Supprimer l'ancien badge s'il existe
  const existingBadge = messagesCard.querySelector('.messages-badge');
  if (existingBadge) {
    existingBadge.remove();
  }
  
  const unreadCount = getUnreadMessagesCount();
  
  if (unreadCount > 0) {
    // Créer le badge
    const badge = document.createElement('span');
    badge.className = 'messages-badge';
    badge.textContent = unreadCount > 99 ? '99+' : unreadCount;
    badge.style.cssText = `
      position: absolute;
      top: 0.5rem;
      right: 0.5rem;
      background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
      color: white;
      border-radius: 50%;
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.75rem;
      font-weight: 600;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
      z-index: 10;
    `;
    
    // Ajouter position relative au parent si nécessaire
    if (getComputedStyle(messagesCard).position === 'static') {
      messagesCard.style.position = 'relative';
    }
    
    messagesCard.appendChild(badge);
  }
}

/**
 * Initialise le système de badges de messages
 */
function initMessagesBadge() {
  // Mettre à jour immédiatement
  updateMessagesBadge();
  
  // Mettre à jour toutes les 30 secondes
  setInterval(updateMessagesBadge, 30000);
  
  // Mettre à jour quand on revient sur la page (visibility change)
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
      updateMessagesBadge();
    }
  });
  
  // Mettre à jour quand on revient sur la page (focus)
  window.addEventListener('focus', updateMessagesBadge);
}

// Exporter les fonctions
if (typeof window !== 'undefined') {
  window.getUnreadMessagesCount = getUnreadMessagesCount;
  window.updateMessagesBadge = updateMessagesBadge;
  window.initMessagesBadge = initMessagesBadge;
}

