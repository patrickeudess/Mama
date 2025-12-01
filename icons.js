/**
 * Système d'icônes SVG pour MAMA+
 * Remplace les emojis par des icônes SVG modernes et cohérentes
 */

class IconSystem {
  constructor() {
    this.icons = {
      // Actions
      'phone': this.phoneIcon(),
      'edit': this.editIcon(),
      'view': this.viewIcon(),
      'delete': this.deleteIcon(),
      'add': this.addIcon(),
      'search': this.searchIcon(),
      'close': this.closeIcon(),
      'check': this.checkIcon(),
      'cancel': this.cancelIcon(),
      
      // Navigation
      'home': this.homeIcon(),
      'back': this.backIcon(),
      'next': this.nextIcon(),
      'menu': this.menuIcon(),
      
      // Professionnel
      'doctor': this.doctorIcon(),
      'consultation': this.consultationIcon(),
      'patient': this.pregnantWomanIcon(), // Utilise l'icône de femme enceinte par défaut
      'users': this.usersIcon(),
      
      // Statistiques et données
      'stats': this.statsIcon(),
      'chart': this.chartIcon(),
      'calendar': this.calendarIcon(),
      'alert': this.alertIcon(),
      'warning': this.warningIcon(),
      'info': this.infoIcon(),
      'success': this.successIcon(),
      'error': this.errorIcon(),
      
      // Risques
      'risk-high': this.riskHighIcon(),
      'risk-medium': this.riskMediumIcon(),
      'risk-low': this.riskLowIcon(),
      
      // Autres
      'location': this.locationIcon(),
      'distance': this.distanceIcon(),
      'chatbot': this.chatbotIcon(),
      'dossier': this.dossierIcon(),
      'conseils': this.conseilsIcon(),
      'urgence': this.urgenceIcon(),
      'export': this.exportIcon(),
      'filter': this.filterIcon(),
      'sort': this.sortIcon(),
      'loading': this.loadingIcon(),
      
      // Authentification
      'lock': this.lockIcon(),
      'login': this.lockIcon(),
      'register': this.userPlusIcon(),
      'user-plus': this.userPlusIcon(),
      
      // Patiente enceinte (spécifique MAMA+)
      'pregnant-woman': this.pregnantWomanIcon(),
      'woman-pregnant': this.womanPregnantIcon(),
    };
  }

  // Générer une icône SVG
  getIcon(name, size = 24, color = 'currentColor', className = '') {
    const iconSvg = this.icons[name];
    if (!iconSvg) {
      console.warn(`Icon "${name}" not found`);
      return '';
    }
    
    return `<svg class="icon ${className}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="color: ${color};">
      ${iconSvg}
    </svg>`;
  }

  // Rendre une icône dans un élément
  renderIcon(element, name, size = 24, color = 'currentColor', className = '') {
    if (typeof element === 'string') {
      element = document.querySelector(element);
    }
    if (element) {
      element.innerHTML = this.getIcon(name, size, color, className);
    }
  }

  // Icônes SVG (paths)
  phoneIcon() {
    return `<path d="M3 5C3 3.89543 3.89543 3 5 3H8.27924C8.70967 3 9.09181 3.27543 9.22792 3.68377L10.7257 8.17721C10.8831 8.64932 10.6694 9.16531 10.2243 9.38787L7.96701 10.5165C9.06925 12.9612 11.0388 14.9308 13.4835 16.033L14.6121 13.7757C14.8347 13.3306 15.3507 13.1169 15.8228 13.2743L20.3162 14.7721C20.7246 14.9082 21 15.2903 21 15.7208V19C21 20.1046 20.1046 21 19 21H18C9.71573 21 3 14.2843 3 6V5Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`;
  }

  editIcon() {
    return `<path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M18.5 2.50023C18.8978 2.10243 19.4374 1.87891 20 1.87891C20.5626 1.87891 21.1022 2.10243 21.5 2.50023C21.8978 2.89804 22.1213 3.43762 22.1213 4.00023C22.1213 4.56284 21.8978 5.10243 21.5 5.50023L12 15.0002L8 16.0002L9 12.0002L18.5 2.50023Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`;
  }

  viewIcon() {
    return `<path d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`;
  }

  deleteIcon() {
    return `<path d="M3 6H5H21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M10 11V17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M14 11V17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`;
  }

  addIcon() {
    return `<path d="M12 5V19M5 12H19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`;
  }

  searchIcon() {
    return `<circle cx="11" cy="11" r="8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M21 21L16.65 16.65" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`;
  }

  closeIcon() {
    return `<path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`;
  }

  checkIcon() {
    return `<path d="M20 6L9 17L4 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`;
  }

  cancelIcon() {
    return `<circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M15 9L9 15M9 9L15 15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`;
  }

  homeIcon() {
    return `<path d="M3 12L5 10M5 10L12 3L19 10M5 10V20C5 20.5304 5.21071 21.0391 5.58579 21.4142C5.96086 21.7893 6.46957 22 7 22H9M19 10L21 12M19 10V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H15M9 22C9.53043 22 10.0391 21.7893 10.4142 21.4142C10.7893 21.0391 11 20.5304 11 20V16C11 15.4696 11.2107 14.9609 11.5858 14.5858C11.9609 14.2107 12.4696 14 13 14H15C15.5304 14 16.0391 14.2107 16.4142 14.5858C16.7893 14.9609 17 15.4696 17 16V20C17 20.5304 17.2107 21.0391 17.5858 21.4142C17.9609 21.7893 18.4696 22 19 22H21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`;
  }

  backIcon() {
    return `<path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`;
  }

  nextIcon() {
    return `<path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`;
  }

  menuIcon() {
    return `<path d="M3 12H21M3 6H21M3 18H21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`;
  }

  doctorIcon() {
    return `<path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <circle cx="12" cy="7" r="4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M12 11V7M12 7L10 5M12 7L14 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`;
  }

  consultationIcon() {
    // Icône de stéthoscope pour les consultations médicales
    return `<path d="M9 12C9 13.6569 10.3431 15 12 15C13.6569 15 15 13.6569 15 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M9 12C9 10.3431 7.65685 9 6 9C4.34315 9 3 10.3431 3 12C3 13.6569 4.34315 15 6 15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M15 12C15 10.3431 16.3431 9 18 9C19.6569 9 21 10.3431 21 12C21 13.6569 19.6569 15 18 15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M9 12H15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <circle cx="12" cy="8" r="1.5" fill="currentColor"/>`;
  }

  patientIcon() {
    // Icône de patiente (personne standard)
    return `<path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <circle cx="12" cy="7" r="4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`;
  }

  pregnantWomanIcon() {
    // Icône de femme enceinte - silhouette avec ventre proéminent et bas évasé ondulé
    return `<circle cx="12" cy="3.5" r="2.5" stroke="currentColor" stroke-width="2.5" fill="currentColor"/>
            <path d="M12 6L12 7.5" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
            <ellipse cx="12" cy="11.5" rx="6.5" ry="8" stroke="currentColor" stroke-width="4" fill="currentColor"/>
            <path d="M5.5 19.5C5.5 19.2 6 18.8 7 18.5C8 18.2 9 18.2 10 18.4C11 18.6 13 18.6 14 18.4C15 18.2 16 18.2 17 18.5C18 18.8 18.5 19.2 18.5 19.5C18.5 20.2 18.2 20.8 17.5 21.2C16.8 21.6 15.8 21.8 14.5 21.9C13.5 22 12.5 22 11.5 22C10.5 22 9.5 22 8.5 21.9C7.2 21.8 6.2 21.6 5.5 21.2C4.8 20.8 4.5 20.2 4.5 19.5C4.5 19.2 5 18.8 6 18.5C7 18.2 8 18.2 9 18.4C10 18.6 11 18.6 12 18.4C13 18.2 14 18.2 15 18.5C16 18.8 16.5 19.2 16.5 19.5" stroke="currentColor" stroke-width="2.5" fill="currentColor"/>`;
  }

  womanPregnantIcon() {
    // Alternative : icône de femme enceinte avec design encore plus simple
    // Version ultra-simplifiée mais très reconnaissable
    return `<circle cx="12" cy="3.5" r="2.5" stroke="currentColor" stroke-width="2.5" fill="currentColor" opacity="0.3"/>
            <path d="M12 6L12 7.5" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
            <ellipse cx="12" cy="11.5" rx="6.5" ry="8" stroke="currentColor" stroke-width="4" fill="currentColor" opacity="0.6"/>
            <path d="M5.5 20.5L5.5 22.5M18.5 20.5L18.5 22.5" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
            <path d="M5.5 20.5C5.5 18.8431 6.17157 17.3431 7.25736 16.2574C8.34315 15.1716 9.84315 14.5 11.5 14.5H14.5C16.1569 14.5 17.6569 15.1716 18.7426 16.2574C19.8284 17.3431 20.5 18.8431 20.5 20.5V22.5" stroke="currentColor" stroke-width="2.5" fill="none"/>
            <circle cx="12" cy="11.5" r="5" stroke="currentColor" stroke-width="2.5" fill="none" opacity="0.8"/>`;
  }

  usersIcon() {
    return `<path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <circle cx="9" cy="7" r="4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89318 18.7122 8.75608 18.1676 9.45769C17.623 10.1593 16.8604 10.6597 16 10.88" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`;
  }

  statsIcon() {
    return `<path d="M3 3V21H21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M7 16L12 11L16 15L21 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M21 10H16V15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`;
  }

  chartIcon() {
    return `<path d="M3 3V21H21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M18 17V11M12 17V7M6 17V15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`;
  }

  calendarIcon() {
    return `<rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M16 2V6M8 2V6M3 10H21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`;
  }

  alertIcon() {
    return `<path d="M10.29 3.86L1.82 18C1.64538 18.3024 1.55299 18.6453 1.55299 18.9945C1.55299 19.3437 1.64538 19.6866 1.82 19.989C1.99463 20.2914 2.24426 20.5423 2.54454 20.7148C2.84482 20.8873 3.18452 20.9749 3.53 20.97H20.47C20.8155 20.9749 21.1552 20.8873 21.4555 20.7148C21.7558 20.5423 22.0054 20.2914 22.18 19.989C22.3546 19.6866 22.447 19.3437 22.447 18.9945C22.447 18.6453 22.3546 18.3024 22.18 18L13.71 3.86C13.5354 3.55766 13.2858 3.30672 12.9855 3.13423C12.6852 2.96174 12.3455 2.87419 12 2.87419C11.6545 2.87419 11.3148 2.96174 11.0145 3.13423C10.7142 3.30672 10.4646 3.55766 10.29 3.86Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M12 9V13M12 17H12.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`;
  }

  warningIcon() {
    return this.alertIcon();
  }

  infoIcon() {
    return `<circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M12 16V12M12 8H12.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`;
  }

  successIcon() {
    return `<path d="M22 11.08V12C21.9988 14.1564 21.3005 16.2547 20.0093 17.9818C18.7182 19.7088 16.9033 20.9725 14.8354 21.5839C12.7674 22.1953 10.5573 22.1219 8.53447 21.3746C6.51168 20.6273 4.78465 19.2461 3.61096 17.4371C2.43727 15.628 1.87979 13.4881 2.02168 11.3363C2.16356 9.18455 2.99721 7.13631 4.39828 5.49706C5.79935 3.85781 7.69279 2.71537 9.79619 2.24013C11.8996 1.7649 14.1003 1.98232 16.07 2.85999" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M22 4L12 14.01L9 11.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`;
  }

  errorIcon() {
    return `<circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M15 9L9 15M9 9L15 15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`;
  }

  riskHighIcon() {
    return `<circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="currentColor" opacity="0.2"/>
            <path d="M12 8V12M12 16H12.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`;
  }

  riskMediumIcon() {
    return `<path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`;
  }

  riskLowIcon() {
    return `<path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="currentColor" opacity="0.3"/>`;
  }

  locationIcon() {
    return `<path d="M21 10C21 17 12 23 12 23C12 23 3 17 3 10C3 7.61305 3.94821 5.32387 5.63604 3.63604C7.32387 1.94821 9.61305 1 12 1C14.3869 1 16.6761 1.94821 18.364 3.63604C20.0518 5.32387 21 7.61305 21 10Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <circle cx="12" cy="10" r="3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`;
  }

  distanceIcon() {
    return `<path d="M5 12H19M5 12L2 9M5 12L2 15M19 12L22 9M19 12L22 15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <circle cx="12" cy="12" r="2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`;
  }

  chatbotIcon() {
    return `<path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <circle cx="9" cy="10" r="1" fill="currentColor"/>
            <circle cx="15" cy="10" r="1" fill="currentColor"/>
            <path d="M9 14C9 14 10.5 15 12 15C13.5 15 15 14 15 14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`;
  }

  dossierIcon() {
    return `<path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M14 2V8H20" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M16 13H8M16 17H8M10 9H8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`;
  }

  conseilsIcon() {
    return `<path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="currentColor" opacity="0.2"/>`;
  }

  urgenceIcon() {
    return `<path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="currentColor"/>
            <path d="M12 8V12M12 16H12.01" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`;
  }

  exportIcon() {
    return `<path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M7 10L12 15L17 10M12 15V3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`;
  }

  filterIcon() {
    return `<path d="M22 3H2L10 12.46V19L14 21V12.46L22 3Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`;
  }

  sortIcon() {
    return `<path d="M3 6H21M6 12H18M10 18H14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`;
  }

  loadingIcon() {
    return `<circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-dasharray="31.416" stroke-dashoffset="31.416" fill="none" opacity="0.3">
              <animate attributeName="stroke-dasharray" dur="2s" values="0 31.416;15.708 15.708;0 31.416;0 31.416" repeatCount="indefinite"/>
              <animate attributeName="stroke-dashoffset" dur="2s" values="0;-15.708;-31.416;-31.416" repeatCount="indefinite"/>
            </circle>`;
  }

  lockIcon() {
    return `<rect x="3" y="11" width="18" height="11" rx="2" ry="2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M7 11V7C7 5.67392 7.52678 4.40215 8.46447 3.46447C9.40215 2.52678 10.6739 2 12 2C13.3261 2 14.5979 2.52678 15.5355 3.46447C16.4732 4.40215 17 5.67392 17 7V11" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`;
  }

  userPlusIcon() {
    return `<path d="M16 21V19C16 17.9391 15.5786 16.9217 14.8284 16.1716C14.0783 15.4214 13.0609 15 12 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <circle cx="8.5" cy="7" r="4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M20 8V14M23 11H17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`;
  }
}

// Instance globale
const iconSystem = new IconSystem();

// Fonctions helper pour utilisation facile
window.getIcon = (name, size = 24, color = 'currentColor', className = '') => {
  return iconSystem.getIcon(name, size, color, className);
};

window.renderIcon = (element, name, size = 24, color = 'currentColor', className = '') => {
  return iconSystem.renderIcon(element, name, size, color, className);
};

// Export pour modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { IconSystem, iconSystem };
}

