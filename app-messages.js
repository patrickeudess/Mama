/**
 * Système de messagerie pour MAMA+
 * Permet l'échange de messages entre patientes et professionnels
 */

// Clés de stockage
const MESSAGES_STORAGE_KEY = 'mama_messages';
const CONVERSATIONS_STORAGE_KEY = 'mama_conversations';

// Éléments DOM
let messagesList, messageInput, sendButton, conversationsList;
let currentConversationId = null;
let currentUser = null;
let userType = null;

// Initialisation
document.addEventListener('DOMContentLoaded', function() {
  initializeElements();
  checkAuth();
  setupEventListeners();
  loadConversations();
});

function initializeElements() {
  messagesList = document.getElementById('messages-list');
  messageInput = document.getElementById('message-input');
  sendButton = document.getElementById('send-button');
  conversationsList = document.getElementById('conversations-list');
  
  // Gestion du retour
  const backLink = document.getElementById('back-link');
  if (backLink) {
    backLink.addEventListener('click', (e) => {
      e.preventDefault();
      goBack();
    });
  }
  
  // Déconnexion
  const logoutButton = document.getElementById('logout-button');
  if (logoutButton) {
    logoutButton.addEventListener('click', handleLogout);
  }
}

function checkAuth() {
  if (window.auth) {
    currentUser = window.auth.getCurrentUser();
    if (!currentUser) {
      window.location.href = 'login.html';
      return;
    }
    userType = currentUser.type;
    
    // Afficher le nom d'utilisateur
    const userName = document.getElementById('user-name');
    if (userName && currentUser.name) {
      userName.textContent = currentUser.name;
    }
    
    // Configurer l'interface selon le type d'utilisateur
    setupInterfaceForUserType();
  } else {
    // Fallback : récupérer depuis localStorage
    const userStr = localStorage.getItem('mama_current_user');
    if (userStr) {
      currentUser = JSON.parse(userStr);
      userType = currentUser.type;
      setupInterfaceForUserType();
    } else {
      window.location.href = 'login.html';
    }
  }
}

function setupInterfaceForUserType() {
  const conversationSelectorCard = document.getElementById('conversation-selector-card');
  const chatTitle = document.getElementById('chat-title');
  const chatParticipantInfo = document.getElementById('chat-participant-info');
  
  // Vérifier si on doit ouvrir une conversation spécifique (depuis les actions)
  const openConversationWith = localStorage.getItem('mama_open_conversation_with');
  if (openConversationWith) {
    // Ouvrir directement la conversation avec cette patiente
    localStorage.removeItem('mama_open_conversation_with'); // Nettoyer après utilisation
    const patienteId = parseInt(openConversationWith) || openConversationWith;
    setTimeout(() => {
      openConversation(patienteId, false);
      // S'assurer que currentConversationId est bien défini
      currentConversationId = patienteId;
    }, 100);
    return;
  }
  
  if (userType === 'professionnel') {
    // Professionnel : afficher la liste des conversations
    if (conversationSelectorCard) {
      conversationSelectorCard.style.display = 'block';
    }
    if (chatTitle) {
      chatTitle.textContent = 'Sélectionnez une conversation';
    }
    loadConversations();
  } else if (userType === 'patiente') {
    // Patiente : afficher la liste des professionnels si plusieurs, sinon conversation directe
    const professionnels = window.getPatienteProfessionnels ? window.getPatienteProfessionnels() : [];
    
    if (professionnels.length > 1) {
      // Plusieurs professionnels : afficher la liste
      if (conversationSelectorCard) {
        conversationSelectorCard.style.display = 'block';
      }
      if (chatTitle) {
        chatTitle.textContent = 'Sélectionnez un professionnel';
      }
      loadConversations();
    } else if (professionnels.length === 1) {
      // Un seul professionnel : conversation directe
      if (conversationSelectorCard) {
        conversationSelectorCard.style.display = 'none';
      }
      if (chatTitle) {
        chatTitle.textContent = 'Messagerie';
      }
      loadPatienteConversation();
    } else {
      // Aucun professionnel
      if (conversationSelectorCard) {
        conversationSelectorCard.style.display = 'none';
      }
      if (chatTitle) {
        chatTitle.textContent = 'Messagerie';
      }
      if (messagesList) {
        messagesList.innerHTML = `
          <div class="empty-state" style="text-align: center; padding: 3rem; color: #6b7280;">
            <div style="font-size: 3rem; margin-bottom: 1rem;">👨‍⚕️</div>
            <p style="font-size: 1.1rem; margin-bottom: 0.5rem;">Aucun professionnel ajouté</p>
            <p style="font-size: 0.9rem;">Ajoutez un professionnel depuis votre profil pour commencer à échanger</p>
          </div>
        `;
      }
      if (messageInput) {
        messageInput.disabled = true;
        messageInput.placeholder = 'Aucun professionnel ajouté';
      }
      if (sendButton) {
        sendButton.disabled = true;
      }
    }
  }
}

function setupEventListeners() {
  // Envoi de message
  if (sendButton) {
    sendButton.addEventListener('click', handleSendMessage);
  }
  
  // Envoi avec Enter (Shift+Enter pour nouvelle ligne)
  if (messageInput) {
    messageInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSendMessage();
      }
    });
  }
}

function goBack() {
  const userType = currentUser ? currentUser.type : localStorage.getItem('mama_user_type');
  if (userType === 'patiente') {
    window.location.href = 'index-patriente.html';
  } else if (userType === 'professionnel') {
    window.location.href = 'index-professionnel.html';
  } else if (userType === 'etablissement') {
    window.location.href = 'index-etablissement.html';
  } else {
    window.location.href = 'index.html';
  }
}

function handleLogout() {
  if (window.auth && window.auth.logout) {
    window.auth.logout();
  }
  window.location.href = 'index.html';
}

/**
 * Charge les conversations pour un professionnel
 */
function loadConversations() {
  if (userType === 'professionnel') {
    loadProfessionnelConversations();
  } else if (userType === 'patiente') {
    loadPatienteConversationsList();
  }
}

function loadProfessionnelConversations() {
  const messages = getMessages();
  const patientes = getPatientes();
  const currentProfessionnelId = getCurrentProfessionnelId();
  
  if (!conversationsList) return;
  
  // Récupérer toutes les patientes assignées à ce professionnel
  const assignedPatientes = patientes.filter(p => 
    p.professionnelId == currentProfessionnelId || 
    p.pro_referent == currentProfessionnelId
  );
  
  if (assignedPatientes.length === 0) {
    conversationsList.innerHTML = `
      <div style="text-align: center; padding: 2rem; color: #6b7280;">
        <p>Aucune patiente assignée</p>
        <p style="font-size: 0.875rem; margin-top: 0.5rem;">Les patientes que vous suivez apparaîtront ici</p>
      </div>
    `;
    return;
  }
  
  // Grouper les messages par patiente
  const conversationsByPatiente = {};
  messages.forEach(msg => {
    let patienteId = null;
    if (msg.from === 'patiente' && msg.to === 'professionnel') {
      patienteId = msg.fromId;
    } else if (msg.from === 'professionnel' && msg.to === 'patiente') {
      patienteId = msg.toId;
    }
    
    if (patienteId) {
      if (!conversationsByPatiente[patienteId]) {
        conversationsByPatiente[patienteId] = [];
      }
      conversationsByPatiente[patienteId].push(msg);
    }
  });
  
  // Afficher les conversations (y compris les patientes sans messages)
  const conversationsHTML = assignedPatientes.map(patiente => {
    const patienteId = patiente.id;
    const patienteMessages = conversationsByPatiente[patienteId] || [];
    const patienteName = `${patiente.prenom || ''} ${patiente.nom || ''}`.trim() || `Patiente #${patienteId}`;
    
    // Dernier message
    const lastMessage = patienteMessages.length > 0 
      ? patienteMessages.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0]
      : null;
    
    const unreadCount = patienteMessages.filter(m => !m.read && m.from === 'patiente').length;
    
    return `
      <div class="conversation-item ${unreadCount > 0 ? 'has-unread' : ''}" data-patiente-id="${patienteId}" onclick="openConversation(${patienteId})">
        <div class="conversation-header">
          <span class="conversation-name">${patienteName}</span>
          ${unreadCount > 0 ? `<span class="conversation-unread">${unreadCount}</span>` : ''}
          ${lastMessage ? `<span class="conversation-time">${formatMessageTime(lastMessage.timestamp)}</span>` : ''}
        </div>
        <div class="conversation-preview">
          ${lastMessage 
            ? `${lastMessage.content.substring(0, 50)}${lastMessage.content.length > 50 ? '...' : ''}`
            : 'Aucun message'}
        </div>
      </div>
    `;
  }).join('');
  
  conversationsList.innerHTML = conversationsHTML;
}

function loadPatienteConversationsList() {
  if (!conversationsList) return;
  
  // Récupérer les professionnels de la patiente
  const professionnels = window.getPatienteProfessionnels ? window.getPatienteProfessionnels() : [];
  
  if (professionnels.length === 0) {
    conversationsList.innerHTML = `
      <div style="text-align: center; padding: 2rem; color: #6b7280;">
        <p>Aucun professionnel ajouté</p>
        <p style="font-size: 0.875rem; margin-top: 0.5rem;">Ajoutez un professionnel depuis votre profil</p>
      </div>
    `;
    return;
  }
  
  const messages = getMessages();
  const currentPatienteId = getCurrentPatienteId();
  
  // Grouper les messages par professionnel
  const conversationsByProfessionnel = {};
  messages.forEach(msg => {
    let professionnelId = null;
    if (msg.from === 'patiente' && msg.to === 'professionnel') {
      professionnelId = msg.toId;
    } else if (msg.from === 'professionnel' && msg.to === 'patiente' && msg.fromId) {
      professionnelId = msg.fromId;
    }
    
    if (professionnelId) {
      if (!conversationsByProfessionnel[professionnelId]) {
        conversationsByProfessionnel[professionnelId] = [];
      }
      conversationsByProfessionnel[professionnelId].push(msg);
    }
  });
  
  // Afficher les conversations
  const conversationsHTML = professionnels.map(prof => {
    const professionnelId = prof.professionnelId;
    const professionnelMessages = conversationsByProfessionnel[professionnelId] || [];
    const professionnelName = `${prof.prenom || ''} ${prof.nom || ''}`.trim() || `Professionnel #${professionnelId}`;
    
    // Dernier message
    const lastMessage = professionnelMessages.length > 0 
      ? professionnelMessages.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0]
      : null;
    
    const unreadCount = professionnelMessages.filter(m => !m.read && m.from === 'professionnel').length;
    
    return `
      <div class="conversation-item ${unreadCount > 0 ? 'has-unread' : ''}" data-professionnel-id="${professionnelId}" onclick="openConversation(${professionnelId}, true)">
        <div class="conversation-header">
          <span class="conversation-name">${professionnelName}</span>
          ${unreadCount > 0 ? `<span class="conversation-unread">${unreadCount}</span>` : ''}
          ${lastMessage ? `<span class="conversation-time">${formatMessageTime(lastMessage.timestamp)}</span>` : ''}
        </div>
        <div class="conversation-preview">
          ${lastMessage 
            ? `${lastMessage.content.substring(0, 50)}${lastMessage.content.length > 50 ? '...' : ''}`
            : 'Aucun message'}
        </div>
      </div>
    `;
  }).join('');
  
  conversationsList.innerHTML = conversationsHTML;
}

/**
 * Charge la conversation pour une patiente
 */
function loadPatienteConversation(professionnelId = null) {
  if (userType !== 'patiente') return;
  
  // Pour une patiente, on charge la conversation avec son professionnel actif ou celui spécifié
  let targetProfessionnelId = professionnelId;
  
  if (!targetProfessionnelId) {
    // Utiliser le professionnel actif
    const currentProfessionnel = window.getCurrentPatienteProfessionnel ? window.getCurrentPatienteProfessionnel() : null;
    if (currentProfessionnel) {
      targetProfessionnelId = currentProfessionnel.professionnelId;
    } else {
      // Fallback : chercher dans les professionnels assignés
      const professionnels = window.getPatienteProfessionnels ? window.getPatienteProfessionnels() : [];
      if (professionnels.length > 0) {
        targetProfessionnelId = professionnels[0].professionnelId;
      }
    }
  }
  
  if (!targetProfessionnelId) {
    // Aucun professionnel trouvé
    if (messagesList) {
      messagesList.innerHTML = `
        <div class="empty-state" style="text-align: center; padding: 3rem; color: #6b7280;">
          <div style="font-size: 3rem; margin-bottom: 1rem;">👨‍⚕️</div>
          <p style="font-size: 1.1rem; margin-bottom: 0.5rem;">Aucun professionnel assigné</p>
          <p style="font-size: 0.9rem;">Ajoutez un professionnel depuis votre profil</p>
        </div>
      `;
    }
    if (messageInput) {
      messageInput.disabled = true;
      messageInput.placeholder = 'Aucun professionnel assigné';
    }
    if (sendButton) {
      sendButton.disabled = true;
    }
    return;
  }
  
  // Charger la conversation avec le professionnel
  openConversation(targetProfessionnelId, true);
}

/**
 * Ouvre une conversation
 */
window.openConversation = function(participantId, isPatienteView = false) {
  // Convertir en nombre si nécessaire
  participantId = parseInt(participantId) || participantId;
  currentConversationId = participantId;
  
  console.log('Ouverture conversation:', { participantId, isPatienteView, currentConversationId });
  
  // Marquer comme active dans la liste
  if (conversationsList) {
    document.querySelectorAll('.conversation-item').forEach(item => {
      item.classList.remove('active');
      if (item.dataset.patienteId == participantId) {
        item.classList.add('active');
      }
    });
  }
  
  // Charger les messages
  loadMessages(participantId, isPatienteView);
  
  // Mettre à jour le titre
  const chatTitle = document.getElementById('chat-title');
  const chatParticipantInfo = document.getElementById('chat-participant-info');
  
  if (isPatienteView) {
    // Vue patiente : afficher le nom du professionnel
    // Chercher d'abord dans les professionnels de la patiente
    let professionnel = null;
    if (window.getPatienteProfessionnels) {
      const patienteProfessionnels = window.getPatienteProfessionnels();
      professionnel = patienteProfessionnels.find(p => 
        p.professionnelId == participantId || 
        p.professionnelId === participantId ||
        p.professionnelId === String(participantId)
      );
    }
    
    // Si pas trouvé, chercher dans la liste globale
    if (!professionnel) {
      const professionnels = JSON.parse(localStorage.getItem('mama_establishment_professionnels') || '[]');
      professionnel = professionnels.find(p => p.id == participantId || p.id === participantId);
    }
    
    if (professionnel && chatParticipantInfo) {
      const profName = `${professionnel.prenom || ''} ${professionnel.nom || ''}`.trim() || 'Professionnel';
      chatParticipantInfo.textContent = profName;
    }
    if (chatTitle) {
      chatTitle.textContent = 'Conversation';
    }
  } else {
    // Vue professionnel : afficher le nom de la patiente
    const patientes = getPatientes();
    const patiente = patientes.find(p => p.id == participantId || p.id === participantId);
    if (patiente && chatParticipantInfo) {
      chatParticipantInfo.textContent = `${patiente.prenom || ''} ${patiente.nom || ''}`.trim();
    }
    if (chatTitle) {
      chatTitle.textContent = 'Conversation';
    }
  }
  
  // Activer la zone de saisie
  if (messageInput) {
    messageInput.disabled = false;
    messageInput.placeholder = 'Tapez votre message...';
  }
  if (sendButton) {
    sendButton.disabled = false;
  }
};

/**
 * Charge les messages d'une conversation
 */
function loadMessages(participantId, isPatienteView = false) {
  const messages = getMessages();
  const conversationMessages = messages.filter(msg => {
    if (isPatienteView) {
      // Vue patiente : messages avec ce professionnel
      return (msg.from === 'patiente' && msg.toId === participantId) ||
             (msg.from === 'professionnel' && msg.fromId === participantId && msg.to === 'patiente');
    } else {
      // Vue professionnel : messages avec cette patiente
      return (msg.from === 'professionnel' && msg.toId === participantId) ||
             (msg.from === 'patiente' && msg.fromId === participantId && msg.to === 'professionnel');
    }
  }).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  
  if (!messagesList) return;
  
  if (conversationMessages.length === 0) {
    messagesList.innerHTML = `
      <div class="empty-state" style="text-align: center; padding: 3rem; color: #6b7280;">
        <div style="font-size: 3rem; margin-bottom: 1rem;">💬</div>
        <p style="font-size: 1.1rem; margin-bottom: 0.5rem;">Aucun message</p>
        <p style="font-size: 0.9rem;">Commencez la conversation en envoyant un message</p>
      </div>
    `;
    return;
  }
  
  // Afficher les messages
  const messagesHTML = conversationMessages.map(msg => {
    const isSent = (userType === 'patiente' && msg.from === 'patiente') ||
                   (userType === 'professionnel' && msg.from === 'professionnel');
    
    return `
      <div class="message ${isSent ? 'sent' : 'received'}">
        <div class="message-bubble">${escapeHtml(msg.content)}</div>
        <div class="message-info">
          <span class="message-time">${formatMessageTime(msg.timestamp)}</span>
          ${isSent ? `<span class="message-status ${msg.status || 'sent'}">${msg.status === 'pending' ? '⏳' : '✓'}</span>` : ''}
        </div>
      </div>
    `;
  }).join('');
  
  messagesList.innerHTML = messagesHTML;
  
  // Scroll vers le bas
  const messagesContainer = document.getElementById('messages-container');
  if (messagesContainer) {
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }
  
  // Marquer les messages comme lus
  markMessagesAsRead(participantId, isPatienteView);
}

/**
 * Envoie un message
 */
function handleSendMessage() {
  if (!messageInput || !messageInput.value.trim()) return;
  if (!currentConversationId && userType === 'professionnel') {
    alert('Veuillez sélectionner une conversation');
    return;
  }
  
  const content = messageInput.value.trim();
  if (content.length === 0) return;
  
  // Déterminer les IDs
  let fromId = userType === 'patiente' ? getCurrentPatienteId() : getCurrentProfessionnelId();
  let toId = currentConversationId || getCurrentPatienteProfessionnelId();
  
  // Debug : afficher les valeurs pour diagnostiquer
  console.log('Debug messagerie:', {
    userType,
    fromId,
    toId,
    currentConversationId,
    currentUser: currentUser ? { phone: currentUser.phone || currentUser.telephone, type: currentUser.type } : null
  });
  
  if (!fromId || !toId) {
    // Message d'erreur plus détaillé
    let errorMsg = 'Impossible d\'envoyer le message : informations manquantes.\n\n';
    if (!fromId) {
      errorMsg += `- ID expéditeur manquant (${userType})\n`;
    }
    if (!toId) {
      errorMsg += `- ID destinataire manquant\n`;
      if (userType === 'patiente') {
        errorMsg += '  → Vérifiez que vous avez un professionnel assigné\n';
      } else {
        errorMsg += '  → Veuillez sélectionner une conversation\n';
      }
    }
    alert(errorMsg);
    return;
  }
  
  // Créer le message
  const message = {
    id: Date.now(),
    content: content,
    from: userType === 'patiente' ? 'patiente' : 'professionnel',
    fromId: fromId,
    to: userType === 'patiente' ? 'professionnel' : 'patiente',
    toId: toId,
    timestamp: new Date().toISOString(),
    status: 'sent',
    read: false
  };
  
  // Sauvegarder le message
  saveMessage(message);
  
  // Afficher le message immédiatement
  if (messagesList) {
    const messageHTML = `
      <div class="message sent">
        <div class="message-bubble">${escapeHtml(content)}</div>
        <div class="message-info">
          <span class="message-time">${formatMessageTime(message.timestamp)}</span>
          <span class="message-status sent">✓</span>
        </div>
      </div>
    `;
    
    // Supprimer l'état vide si présent
    const emptyState = messagesList.querySelector('.empty-state');
    if (emptyState) {
      emptyState.remove();
    }
    
    messagesList.insertAdjacentHTML('beforeend', messageHTML);
    
    // Scroll vers le bas
    const messagesContainer = document.getElementById('messages-container');
    if (messagesContainer) {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
  }
  
  // Vider le champ de saisie
  messageInput.value = '';
  messageInput.style.height = 'auto';
  
  // Rafraîchir la liste des conversations (pour professionnel)
  if (userType === 'professionnel') {
    loadConversations();
  }
}

/**
 * Sauvegarde un message
 */
function saveMessage(message) {
  const messages = getMessages();
  messages.push(message);
  localStorage.setItem(MESSAGES_STORAGE_KEY, JSON.stringify(messages));
}

/**
 * Récupère tous les messages
 */
function getMessages() {
  try {
    const stored = localStorage.getItem(MESSAGES_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Erreur lors du chargement des messages:', error);
    return [];
  }
}

/**
 * Récupère les conversations
 */
function getConversations() {
  const messages = getMessages();
  // Retourner tous les messages comme conversations
  return messages;
}

/**
 * Marque les messages comme lus
 */
function markMessagesAsRead(participantId, isPatienteView) {
  const messages = getMessages();
  let updated = false;
  
  const updatedMessages = messages.map(msg => {
    if (isPatienteView) {
      // Vue patiente : marquer les messages du professionnel comme lus
      if (msg.from === 'professionnel' && msg.fromId === participantId && !msg.read) {
        updated = true;
        return { ...msg, read: true };
      }
    } else {
      // Vue professionnel : marquer les messages de la patiente comme lus
      if (msg.from === 'patiente' && msg.fromId === participantId && !msg.read) {
        updated = true;
        return { ...msg, read: true };
      }
    }
    return msg;
  });
  
  if (updated) {
    localStorage.setItem(MESSAGES_STORAGE_KEY, JSON.stringify(updatedMessages));
    // Rafraîchir la liste des conversations si on est professionnel
    if (userType === 'professionnel') {
      loadConversations();
    }
  }
}

/**
 * Récupère l'ID de la patiente actuelle
 */
function getCurrentPatienteId() {
  try {
    const patientes = getPatientes();
    if (!currentUser) {
      // Essayer de récupérer depuis localStorage
      const userStr = localStorage.getItem('mama_current_user');
      if (!userStr) return null;
      currentUser = JSON.parse(userStr);
    }
    
    const currentUserPhone = currentUser ? (currentUser.phone || currentUser.telephone) : null;
    if (!currentUserPhone) return null;
    
    const patiente = patientes.find(p => 
      p.telephone === currentUserPhone || 
      p.telephone === `+${currentUserPhone}` ||
      p.telephone === currentUserPhone.replace(/^\+/, '')
    );
    
    return patiente ? patiente.id : null;
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'ID patiente:', error);
    return null;
  }
}

/**
 * Récupère l'ID du professionnel actuel
 */
function getCurrentProfessionnelId() {
  try {
    const professionnels = JSON.parse(localStorage.getItem('mama_establishment_professionnels') || '[]');
    
    if (!currentUser) {
      // Essayer de récupérer depuis localStorage
      const userStr = localStorage.getItem('mama_current_user');
      if (!userStr) return null;
      currentUser = JSON.parse(userStr);
    }
    
    const currentUserPhone = currentUser ? (currentUser.phone || currentUser.telephone) : null;
    if (!currentUserPhone) return null;
    
    const professionnel = professionnels.find(p => 
      p.telephone === currentUserPhone || 
      p.telephone === `+${currentUserPhone}` ||
      p.telephone === currentUserPhone.replace(/^\+/, '')
    );
    
    return professionnel ? professionnel.id : null;
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'ID professionnel:', error);
    return null;
  }
}

/**
 * Récupère l'ID du professionnel assigné à la patiente
 */
function getCurrentPatienteProfessionnelId() {
  try {
    const patientes = getPatientes();
    
    if (!currentUser) {
      // Essayer de récupérer depuis localStorage
      const userStr = localStorage.getItem('mama_current_user');
      if (!userStr) return null;
      currentUser = JSON.parse(userStr);
    }
    
    const currentUserPhone = currentUser ? (currentUser.phone || currentUser.telephone) : null;
    if (!currentUserPhone) return null;
    
    const patiente = patientes.find(p => 
      p.telephone === currentUserPhone || 
      p.telephone === `+${currentUserPhone}` ||
      p.telephone === currentUserPhone.replace(/^\+/, '')
    );
    
    if (!patiente) return null;
    
    // Retourner professionnelId ou pro_referent (peut être un ID numérique ou un nom)
    return patiente.professionnelId || patiente.pro_referent || null;
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'ID professionnel assigné:', error);
    return null;
  }
}

/**
 * Récupère les patientes
 */
function getPatientes() {
  try {
    const stored = localStorage.getItem('mama_patientes_data');
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    return [];
  }
}

/**
 * Formate l'heure d'un message
 */
function formatMessageTime(timestamp) {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now - date;
  
  if (diff < 60000) { // Moins d'une minute
    return 'À l\'instant';
  } else if (diff < 3600000) { // Moins d'une heure
    const minutes = Math.floor(diff / 60000);
    return `Il y a ${minutes} min`;
  } else if (diff < 86400000) { // Moins d'un jour
    const hours = Math.floor(diff / 3600000);
    return `Il y a ${hours}h`;
  } else if (date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  } else {
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }) + ' ' +
           date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  }
}

/**
 * Échappe le HTML pour éviter les injections
 */
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Initialiser les icônes
document.addEventListener('DOMContentLoaded', function() {
  if (window.getIcon) {
    const headerIcon = document.querySelector('#header-icon');
    if (headerIcon) {
      headerIcon.innerHTML = window.getIcon('message', 28, 'white') || '💬';
    }
    
    const backLink = document.querySelector('#back-link');
    if (backLink) {
      backLink.innerHTML = window.getIcon('arrow-left', 24, 'white') || '←';
    }
  }
  
  // Mettre à jour le badge de messages quand on quitte la page
  window.addEventListener('beforeunload', () => {
    if (window.updateMessagesBadge) {
      window.updateMessagesBadge();
    }
  });
});

