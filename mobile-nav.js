/**
 * Navigation mobile pour Android
 * Gère le menu hamburger et la barre de navigation en bas
 */

class MobileNavigation {
  constructor() {
    this.menuToggle = null;
    this.menu = null;
    this.menuContent = null;
    this.menuClose = null;
    this.init();
  }

  init() {
    // Créer le menu hamburger si on est sur mobile
    if (window.innerWidth <= 768) {
      this.createMobileMenu();
      this.createBottomNav();
      this.attachEventListeners();
    }

    // Réagir aux changements de taille d'écran
    window.addEventListener('resize', () => {
      if (window.innerWidth <= 768 && !this.menuToggle) {
        this.createMobileMenu();
        this.createBottomNav();
        this.attachEventListeners();
      } else if (window.innerWidth > 768) {
        this.removeMobileMenu();
        this.removeBottomNav();
      }
    });
  }

  createMobileMenu() {
    const header = document.querySelector('header');
    if (!header || document.querySelector('.mobile-menu-toggle')) return;

    // Créer le bouton hamburger
    const menuToggle = document.createElement('button');
    menuToggle.className = 'mobile-menu-toggle';
    menuToggle.setAttribute('aria-label', 'Ouvrir le menu');
    menuToggle.innerHTML = '☰';
    
    const headerLeft = header.querySelector('.header-left');
    if (headerLeft) {
      headerLeft.insertBefore(menuToggle, headerLeft.firstChild);
    }

    // Créer le menu
    const menu = document.createElement('div');
    menu.className = 'mobile-menu';
    menu.innerHTML = `
      <div class="mobile-menu-content">
        <div class="mobile-menu-header">
          <h3>Menu</h3>
          <button class="mobile-menu-close" aria-label="Fermer le menu">✕</button>
        </div>
        <ul class="mobile-menu-items">
          ${this.getMenuItems()}
        </ul>
      </div>
    `;
    document.body.appendChild(menu);

    this.menuToggle = menuToggle;
    this.menu = menu;
    this.menuContent = menu.querySelector('.mobile-menu-content');
    this.menuClose = menu.querySelector('.mobile-menu-close');
  }

  getMenuItems() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const pages = this.getPagesForCurrentContext();
    
    return pages.map(page => {
      const isActive = currentPage === page.path || 
                      (currentPage === '' && page.path === 'index.html');
      const icon = page.icon || 'home';
      const iconSvg = window.getIcon ? window.getIcon(icon, 20, isActive ? '#2563eb' : '#6b7280') : '';
      
      return `
        <li class="mobile-menu-item ${isActive ? 'active' : ''}">
          <a href="${page.path}">
            ${iconSvg}
            <span>${page.label}</span>
          </a>
        </li>
      `;
    }).join('');
  }

  getPagesForCurrentContext() {
    const currentPath = window.location.pathname;
    
    // Pages professionnel
    if (currentPath.includes('professionnel') || 
        currentPath.includes('mes-patientes') ||
        currentPath.includes('alertes') ||
        currentPath.includes('statistiques')) {
      return [
        { path: 'index-professionnel.html', label: 'Tableau de bord', icon: 'home' },
        { path: 'mes-patientes.html', label: 'Mes patientes', icon: 'users' },
        { path: 'alertes.html', label: 'Alertes', icon: 'warning' },
        { path: 'statistiques.html', label: 'Statistiques', icon: 'stats' },
        { path: 'index.html', label: 'Accueil', icon: 'home' }
      ];
    }
    
    // Pages patiente
    if (currentPath.includes('patiente') || 
        currentPath.includes('dossier') ||
        currentPath.includes('chatbot') ||
        currentPath.includes('conseils')) {
      return [
        { path: 'index-patriente.html', label: 'Accueil', icon: 'home' },
        { path: 'dossier-medical.html', label: 'Dossier médical', icon: 'dossier' },
        { path: 'chatbot.html', label: 'Chatbot', icon: 'chatbot' },
        { path: 'conseils.html', label: 'Conseils', icon: 'conseils' },
        { path: 'index.html', label: 'Retour', icon: 'back' }
      ];
    }
    
    // Page d'accueil
    return [
      { path: 'index-patriente.html', label: 'Patiente', icon: 'patient' },
      { path: 'index-professionnel.html', label: 'Professionnel', icon: 'doctor' }
    ];
  }

  createBottomNav() {
    if (document.querySelector('.mobile-nav-bar')) return;

    const currentPath = window.location.pathname;
    const isProfessional = currentPath.includes('professionnel') || 
                          currentPath.includes('mes-patientes') ||
                          currentPath.includes('alertes') ||
                          currentPath.includes('statistiques');
    const isPatiente = currentPath.includes('patiente') || 
                      currentPath.includes('dossier') ||
                      currentPath.includes('chatbot') ||
                      currentPath.includes('conseils');

    if (!isProfessional && !isPatiente) return;

    const navItems = isProfessional ? [
      { path: 'index-professionnel.html', label: 'Accueil', icon: 'home' },
      { path: 'mes-patientes.html', label: 'Patientes', icon: 'users' },
      { path: 'alertes.html', label: 'Alertes', icon: 'warning' },
      { path: 'statistiques.html', label: 'Stats', icon: 'stats' }
    ] : [
      { path: 'index-patriente.html', label: 'Accueil', icon: 'home' },
      { path: 'dossier-medical.html', label: 'Dossier', icon: 'dossier' },
      { path: 'chatbot.html', label: 'Chat', icon: 'chatbot' },
      { path: 'conseils.html', label: 'Conseils', icon: 'conseils' }
    ];

    const navBar = document.createElement('nav');
    navBar.className = 'mobile-nav-bar';
    navBar.setAttribute('role', 'navigation');
    navBar.setAttribute('aria-label', 'Navigation principale');
    navBar.innerHTML = `
      <div class="mobile-nav-items">
        ${navItems.map(item => {
          const currentPage = window.location.pathname.split('/').pop() || 'index.html';
          const isActive = currentPage === item.path;
          const iconSvg = window.getIcon ? window.getIcon(item.icon, 24, isActive ? '#2563eb' : '#6b7280') : '';
          
          return `
            <a href="${item.path}" class="mobile-nav-item ${isActive ? 'active' : ''}" aria-label="${item.label}">
              ${iconSvg}
              <span>${item.label}</span>
            </a>
          `;
        }).join('')}
      </div>
    `;
    document.body.appendChild(navBar);
  }

  attachEventListeners() {
    if (this.menuToggle) {
      this.menuToggle.addEventListener('click', () => this.openMenu());
    }
    if (this.menuClose) {
      this.menuClose.addEventListener('click', () => this.closeMenu());
    }
    if (this.menu) {
      this.menu.addEventListener('click', (e) => {
        if (e.target === this.menu) {
          this.closeMenu();
        }
      });
    }

    // Fermer le menu avec la touche Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.menu && this.menu.classList.contains('active')) {
        this.closeMenu();
      }
    });
  }

  openMenu() {
    if (this.menu) {
      this.menu.classList.add('active');
      document.body.style.overflow = 'hidden';
      if (this.menuToggle) {
        this.menuToggle.setAttribute('aria-expanded', 'true');
      }
    }
  }

  closeMenu() {
    if (this.menu) {
      this.menu.classList.remove('active');
      document.body.style.overflow = '';
      if (this.menuToggle) {
        this.menuToggle.setAttribute('aria-expanded', 'false');
      }
    }
  }

  removeMobileMenu() {
    if (this.menuToggle) {
      this.menuToggle.remove();
      this.menuToggle = null;
    }
    if (this.menu) {
      this.menu.remove();
      this.menu = null;
    }
  }

  removeBottomNav() {
    const navBar = document.querySelector('.mobile-nav-bar');
    if (navBar) {
      navBar.remove();
    }
  }
}

// Initialiser la navigation mobile au chargement
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.mobileNav = new MobileNavigation();
  });
} else {
  window.mobileNav = new MobileNavigation();
}

