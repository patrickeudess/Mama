/**
 * Composants UX pour améliorer l'expérience utilisateur
 * Remplace les alert(), confirm() natifs par des composants modernes
 */

// ==================== SYSTÈME DE TOASTS ====================

class ToastManager {
  constructor() {
    this.container = null;
    this.init();
  }

  init() {
    // Créer le conteneur de toasts s'il n'existe pas
    if (!document.querySelector('.toast-container')) {
      this.container = document.createElement('div');
      this.container.className = 'toast-container';
      document.body.appendChild(this.container);
    } else {
      this.container = document.querySelector('.toast-container');
    }
  }

  show(message, type = 'info', duration = 3000) {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'polite');
    
    // Icône selon le type
    const iconNames = {
      success: 'success',
      error: 'error',
      warning: 'warning',
      info: 'info'
    };
    
    const iconHtml = window.getIcon 
      ? window.getIcon(iconNames[type] || iconNames.info, 20)
      : (type === 'success' ? '✅' : type === 'error' ? '❌' : type === 'warning' ? '⚠️' : 'ℹ️');
    
    toast.innerHTML = `
      <div class="toast-content">
        <span class="toast-icon">${iconHtml}</span>
        <span class="toast-message">${this.escapeHtml(message)}</span>
        <button class="toast-close" aria-label="Fermer" onclick="this.parentElement.parentElement.remove()">×</button>
      </div>
    `;
    
    this.container.appendChild(toast);
    
    // Animation d'entrée
    setTimeout(() => toast.classList.add('toast-show'), 10);
    
    // Auto-fermeture
    if (duration > 0) {
      setTimeout(() => {
        toast.classList.remove('toast-show');
        setTimeout(() => toast.remove(), 300);
      }, duration);
    }
    
    return toast;
  }

  success(message, duration = 3000) {
    return this.show(message, 'success', duration);
  }

  error(message, duration = 4000) {
    return this.show(message, 'error', duration);
  }

  warning(message, duration = 3500) {
    return this.show(message, 'warning', duration);
  }

  info(message, duration = 3000) {
    return this.show(message, 'info', duration);
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

// Instance globale
const toast = new ToastManager();

// ==================== MODAL DE CONFIRMATION ====================

class ConfirmModal {
  show(message, title = 'Confirmation', options = {}) {
    return new Promise((resolve) => {
      const modal = document.createElement('div');
      modal.className = 'confirm-modal-overlay';
      modal.setAttribute('role', 'dialog');
      modal.setAttribute('aria-modal', 'true');
      modal.setAttribute('aria-labelledby', 'confirm-title');
      
      const confirmText = options.confirmText || 'Confirmer';
      const cancelText = options.cancelText || 'Annuler';
      const confirmClass = options.danger ? 'btn-danger' : 'btn-primary';
      
      modal.innerHTML = `
        <div class="confirm-modal">
          <div class="confirm-modal-header">
            <h3 id="confirm-title">${this.escapeHtml(title)}</h3>
            <button class="confirm-modal-close" aria-label="Fermer" onclick="this.closest('.confirm-modal-overlay').remove()">×</button>
          </div>
          <div class="confirm-modal-body">
            <p>${this.escapeHtml(message)}</p>
          </div>
          <div class="confirm-modal-footer">
            <button class="btn btn-secondary confirm-cancel">${cancelText}</button>
            <button class="btn ${confirmClass} confirm-ok">${confirmText}</button>
          </div>
        </div>
      `;
      
      document.body.appendChild(modal);
      
      // Focus sur le bouton d'annulation par défaut
      const cancelBtn = modal.querySelector('.confirm-cancel');
      cancelBtn.focus();
      
      // Gestionnaires d'événements
      const handleConfirm = () => {
        modal.remove();
        resolve(true);
      };
      
      const handleCancel = () => {
        modal.remove();
        resolve(false);
      };
      
      modal.querySelector('.confirm-ok').addEventListener('click', handleConfirm);
      modal.querySelector('.confirm-cancel').addEventListener('click', handleCancel);
      modal.querySelector('.confirm-modal-close').addEventListener('click', handleCancel);
      
      // Fermer avec Escape
      const handleEscape = (e) => {
        if (e.key === 'Escape') {
          handleCancel();
          document.removeEventListener('keydown', handleEscape);
        }
      };
      document.addEventListener('keydown', handleEscape);
      
      // Fermer en cliquant sur l'overlay
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          handleCancel();
        }
      });
    });
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

const confirmModal = new ConfirmModal();

// Fonction helper pour remplacer confirm()
async function confirmAction(message, title = 'Confirmation', options = {}) {
  return await confirmModal.show(message, title, options);
}

// ==================== INDICATEUR DE CHARGEMENT ====================

class LoadingManager {
  show(target = null, message = 'Chargement...') {
    const loader = document.createElement('div');
    loader.className = 'loading-overlay';
    loader.setAttribute('role', 'status');
    loader.setAttribute('aria-live', 'polite');
    loader.setAttribute('aria-label', message);
    
    loader.innerHTML = `
      <div class="loading-spinner">
        <div class="spinner"></div>
        <p class="loading-message">${this.escapeHtml(message)}</p>
      </div>
    `;
    
    if (target) {
      // Position relative pour le conteneur
      const container = typeof target === 'string' ? document.querySelector(target) : target;
      if (container) {
        container.style.position = 'relative';
        container.appendChild(loader);
        return loader;
      }
    }
    
    // Sinon, ajouter au body
    document.body.appendChild(loader);
    return loader;
  }

  hide(loader) {
    if (loader && loader.parentNode) {
      loader.classList.add('loading-fade-out');
      setTimeout(() => loader.remove(), 300);
    }
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

const loading = new LoadingManager();

// ==================== UTILITAIRES ====================

// Debounce function pour optimiser les recherches
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Throttle function
function throttle(func, limit) {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// Export pour utilisation globale
window.toast = toast;
window.confirmAction = confirmAction;
window.loading = loading;
window.debounce = debounce;
window.throttle = throttle;

