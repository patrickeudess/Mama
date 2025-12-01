/**
 * Système de lecture audio pour l'accessibilité
 * Utilise l'API Web Speech Synthesis pour lire les textes à voix haute
 */

class AudioHelper {
  constructor() {
    this.synth = window.speechSynthesis;
    this.isEnabled = false;
    this.currentUtterance = null;
    this.voice = null;
    this.rate = 0.9; // Vitesse de lecture (légèrement ralenti pour la compréhension)
    this.pitch = 1.0;
    this.volume = 1.0;
    
    // Initialiser la voix
    this.initVoice();
    
    // Bouton toggle pour activer/désactiver
    this.createToggleButton();
  }
  
  initVoice() {
    // Attendre que les voix soient chargées
    if (this.synth.onvoiceschanged !== undefined) {
      this.synth.onvoiceschanged = () => {
        this.loadVoices();
      };
    }
    this.loadVoices();
  }
  
  loadVoices() {
    const voices = this.synth.getVoices();
    // Préférer une voix française si disponible
    const frenchVoice = voices.find(voice => 
      voice.lang.startsWith('fr') || 
      voice.name.toLowerCase().includes('french') ||
      voice.name.toLowerCase().includes('français')
    );
    
    if (frenchVoice) {
      this.voice = frenchVoice;
    } else if (voices.length > 0) {
      this.voice = voices[0];
    }
  }
  
  createToggleButton() {
    // Créer un bouton flottant pour activer/désactiver l'audio
    const button = document.createElement('button');
    button.id = 'audio-toggle-btn';
    button.className = 'audio-toggle-btn';
    button.setAttribute('aria-label', 'Activer ou désactiver la lecture audio');
    button.innerHTML = '🔊';
    button.title = 'Activer la lecture audio';
    
    button.addEventListener('click', () => {
      this.toggle();
    });
    
    document.body.appendChild(button);
  }
  
  toggle() {
    this.isEnabled = !this.isEnabled;
    const button = document.getElementById('audio-toggle-btn');
    
    if (this.isEnabled) {
      button.innerHTML = '🔊';
      button.classList.add('active');
      button.title = 'Lecture audio activée - Cliquez pour désactiver';
      this.speak('Lecture audio activée. Les instructions seront lues à voix haute.', { force: true });
    } else {
      button.innerHTML = '🔇';
      button.classList.remove('active');
      button.title = 'Lecture audio désactivée - Cliquez pour activer';
      this.stop();
      this.speak('Lecture audio désactivée.', { force: true });
    }
  }
  
  speak(text, options = {}) {
    if (!this.isEnabled && !options.force) {
      return;
    }
    
    // Arrêter toute lecture en cours
    this.stop();
    
    if (!text || text.trim() === '') {
      return;
    }
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = this.voice;
    utterance.rate = options.rate || this.rate;
    utterance.pitch = options.pitch || this.pitch;
    utterance.volume = options.volume || this.volume;
    utterance.lang = 'fr-FR';
    
    utterance.onend = () => {
      this.currentUtterance = null;
    };
    
    utterance.onerror = (error) => {
      console.error('Erreur de synthèse vocale:', error);
      this.currentUtterance = null;
    };
    
    this.currentUtterance = utterance;
    this.synth.speak(utterance);
  }
  
  stop() {
    if (this.synth.speaking) {
      this.synth.cancel();
    }
    this.currentUtterance = null;
  }
  
  // Lire le label d'un champ au focus
  readFieldLabel(element) {
    if (!this.isEnabled) return;
    
    const label = element.closest('label');
    if (label) {
      // Récupérer le texte du label (sans les astérisques et petits textes)
      let labelText = '';
      const labelSpan = label.querySelector('span:first-child');
      if (labelSpan) {
        labelText = labelSpan.textContent;
      } else {
        // Prendre le texte avant le premier input/select/textarea
        const labelClone = label.cloneNode(true);
        const inputs = labelClone.querySelectorAll('input, select, textarea, small');
        inputs.forEach(el => el.remove());
        labelText = labelClone.textContent;
      }
      
      // Nettoyer le texte
      labelText = labelText.replace(/\*/g, '').replace(/\s+/g, ' ').trim();
      
      if (labelText) {
        this.speak(labelText, { rate: 0.9 });
      }
    }
    
    // Lire aussi le placeholder si présent
    const placeholder = element.getAttribute('placeholder');
    if (placeholder && this.isEnabled) {
      setTimeout(() => {
        this.speak(placeholder, { rate: 0.85 });
      }, 1500);
    }
    
    // Lire le texte d'aide (small) si présent
    const helpText = label?.querySelector('small')?.textContent;
    if (helpText && this.isEnabled) {
      setTimeout(() => {
        this.speak(helpText, { rate: 0.8 });
      }, 2500);
    }
  }
  
  // Lire une section de formulaire
  readFormSection(sectionElement) {
    if (!this.isEnabled) return;
    
    const sectionTitle = sectionElement.querySelector('h3')?.textContent;
    if (sectionTitle) {
      this.speak(`Section: ${sectionTitle}`, { rate: 0.85 });
    }
  }
  
  // Lire une instruction
  readInstruction(text) {
    if (this.isEnabled) {
      this.speak(text);
    }
  }
  
  // Lire un message d'aide
  readHelp(text) {
    if (this.isEnabled) {
      this.speak(`Aide: ${text}`, { rate: 0.8 });
    }
  }
}

// Initialiser le système audio au chargement
let audioHelper = null;

document.addEventListener('DOMContentLoaded', () => {
  audioHelper = new AudioHelper();
  window.audioHelper = audioHelper;
  
  // Ajouter les styles pour le bouton
  const style = document.createElement('style');
  style.textContent = `
    .audio-toggle-btn {
      position: fixed;
      bottom: 80px;
      right: 20px;
      width: 56px;
      height: 56px;
      border-radius: 50%;
      background: #2563eb;
      color: white;
      border: none;
      font-size: 24px;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      z-index: 1000;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s ease;
      min-width: 56px;
      min-height: 56px;
    }
    
    .audio-toggle-btn:hover {
      background: #1d4ed8;
      transform: scale(1.1);
      box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
    }
    
    .audio-toggle-btn.active {
      background: #10b981;
      animation: pulse 2s infinite;
    }
    
    @keyframes pulse {
      0%, 100% {
        box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
      }
      50% {
        box-shadow: 0 4px 20px rgba(16, 185, 129, 0.6);
      }
    }
    
    @media (max-width: 768px) {
      .audio-toggle-btn {
        bottom: 100px;
        right: 15px;
        width: 48px;
        height: 48px;
        font-size: 20px;
        min-width: 48px;
        min-height: 48px;
      }
    }
  `;
  document.head.appendChild(style);
  
  // Attacher la lecture audio aux champs de formulaire
  document.addEventListener('focusin', (e) => {
    if (e.target.matches('input, select, textarea')) {
      audioHelper.readFieldLabel(e.target);
    }
  });
  
  // Lire les instructions quand un formulaire s'ouvre
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === 1) { // Element node
          // Détecter l'ouverture d'un modal de formulaire
          if (node.id === 'add-patiente-modal' || node.id === 'registration-form-card') {
            if (!node.classList.contains('hidden')) {
              setTimeout(() => {
                if (audioHelper.isEnabled) {
                  audioHelper.speak('Formulaire ouvert. Remplissez les champs un par un. Quand vous cliquez sur un champ, vous entendrez son nom.', { rate: 0.85 });
                }
              }, 500);
            }
          }
          
          // Détecter les sections de formulaire
          const sections = node.querySelectorAll?.('.form-section');
          if (sections && sections.length > 0) {
            sections.forEach((section, index) => {
              const h3 = section.querySelector('h3');
              if (h3) {
                h3.setAttribute('role', 'button');
                h3.setAttribute('tabindex', '0');
                h3.style.cursor = 'pointer';
                h3.addEventListener('click', () => {
                  if (audioHelper.isEnabled) {
                    audioHelper.readFormSection(section);
                  }
                });
              }
            });
          }
        }
      });
    });
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
  
  // Ajouter des instructions audio pour les boutons de formulaire
  document.addEventListener('click', (e) => {
    if (!audioHelper.isEnabled) return;
    
    // Instructions pour le bouton d'ajout de patiente
    if (e.target.id === 'add-patiente-btn-section' || e.target.closest('#add-patiente-btn-section')) {
      setTimeout(() => {
        audioHelper.speak('Cliquez sur les champs pour remplir les informations. Les champs avec une étoile sont obligatoires.', { rate: 0.85 });
      }, 300);
    }
    
    // Instructions pour le bouton de soumission
    if (e.target.type === 'submit' && e.target.closest('form')) {
      const form = e.target.closest('form');
      const requiredFields = form.querySelectorAll('[required]');
      const emptyRequired = Array.from(requiredFields).filter(field => !field.value);
      
      if (emptyRequired.length > 0) {
        setTimeout(() => {
          audioHelper.speak(`Attention: ${emptyRequired.length} champ${emptyRequired.length > 1 ? 's' : ''} obligatoire${emptyRequired.length > 1 ? 's' : ''} non rempli${emptyRequired.length > 1 ? 's' : ''}. Remplissez-les avant de continuer.`, { rate: 0.8 });
        }, 500);
      }
    }
  });
  
  // Ajouter des instructions pour les sections existantes au chargement
  setTimeout(() => {
    document.querySelectorAll('.form-section').forEach((section) => {
      const h3 = section.querySelector('h3');
      if (h3 && !h3.hasAttribute('data-audio-attached')) {
        h3.setAttribute('data-audio-attached', 'true');
        h3.setAttribute('role', 'button');
        h3.setAttribute('tabindex', '0');
        h3.style.cursor = 'pointer';
        h3.addEventListener('click', () => {
          if (audioHelper.isEnabled) {
            audioHelper.readFormSection(section);
          }
        });
      }
    });
  }, 1000);
});

