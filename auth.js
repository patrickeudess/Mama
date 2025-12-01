/**
 * Système d'authentification simple
 * Stocke les utilisateurs dans localStorage et permet l'export/import CSV
 */

class AuthSystem {
  constructor() {
    this.storageKey = 'mama_users';
    this.currentUserKey = 'mama_current_user';
    this.init();
  }

  init() {
    // Créer la structure si elle n'existe pas
    if (!localStorage.getItem(this.storageKey)) {
      localStorage.setItem(this.storageKey, JSON.stringify([]));
    }
  }

  /**
   * Obtenir tous les utilisateurs
   */
  getUsers() {
    try {
      const data = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Erreur lors de la lecture des utilisateurs:', error);
      return [];
    }
  }

  /**
   * Sauvegarder les utilisateurs
   */
  saveUsers(users) {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(users));
      // Exporter aussi en CSV pour sauvegarde
      this.exportToCSV(users);
      return true;
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des utilisateurs:', error);
      return false;
    }
  }

  /**
   * Trouver un utilisateur par téléphone
   */
  findUserByPhone(phone) {
    const users = this.getUsers();
    return users.find(u => u.phone === phone);
  }

  /**
   * Inscription d'un nouvel utilisateur
   */
  async register(type, phone, password, name) {
    // Vérifier si l'utilisateur existe déjà
    if (this.findUserByPhone(phone)) {
      return false;
    }

    // Créer le nouvel utilisateur
    const newUser = {
      id: Date.now().toString(),
      type: type, // 'patiente' ou 'professionnel'
      phone: phone,
      password: password, // En production, il faudrait hasher le mot de passe
      name: name,
      createdAt: new Date().toISOString(),
      lastLogin: null
    };

    // Ajouter à la liste
    const users = this.getUsers();
    users.push(newUser);
    
    // Sauvegarder
    if (this.saveUsers(users)) {
      // Connecter automatiquement
      this.setCurrentUser(newUser);
      return true;
    }

    return false;
  }

  /**
   * Connexion d'un utilisateur
   */
  async login(phone, password, type) {
    const user = this.findUserByPhone(phone);

    if (!user) {
      return false;
    }

    // Vérifier le mot de passe et le type
    if (user.password !== password || user.type !== type) {
      return false;
    }

    // Mettre à jour la dernière connexion
    user.lastLogin = new Date().toISOString();
    const users = this.getUsers();
    const index = users.findIndex(u => u.id === user.id);
    if (index !== -1) {
      users[index] = user;
      this.saveUsers(users);
    }

    // Définir l'utilisateur actuel
    this.setCurrentUser(user);
    return true;
  }

  /**
   * Déconnexion
   */
  logout() {
    localStorage.removeItem(this.currentUserKey);
    window.location.href = 'login.html';
  }

  /**
   * Obtenir l'utilisateur actuel
   */
  getCurrentUser() {
    try {
      const data = localStorage.getItem(this.currentUserKey);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Erreur lors de la lecture de l\'utilisateur actuel:', error);
      return null;
    }
  }

  /**
   * Définir l'utilisateur actuel
   */
  setCurrentUser(user) {
    // Ne pas stocker le mot de passe dans la session
    const { password, ...userWithoutPassword } = user;
    localStorage.setItem(this.currentUserKey, JSON.stringify(userWithoutPassword));
  }

  /**
   * Vérifier si l'utilisateur est connecté
   */
  isAuthenticated() {
    return this.getCurrentUser() !== null;
  }

  /**
   * Vérifier si l'utilisateur est du bon type
   */
  isType(type) {
    const user = this.getCurrentUser();
    return user && user.type === type;
  }

  /**
   * Exporter les utilisateurs en CSV
   */
  exportToCSV(users = null) {
    const data = users || this.getUsers();
    
    if (data.length === 0) {
      return;
    }

    // Créer les en-têtes CSV
    const headers = ['ID', 'Type', 'Téléphone', 'Nom', 'Date de création', 'Dernière connexion'];
    
    // Créer les lignes
    const rows = data.map(user => [
      user.id,
      user.type,
      user.phone,
      user.name,
      user.createdAt,
      user.lastLogin || ''
    ]);

    // Convertir en CSV
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    // Stocker dans localStorage comme sauvegarde (optionnel)
    try {
      localStorage.setItem('mama_users_csv_backup', csvContent);
    } catch (e) {
      // Si localStorage est plein, on ignore
      console.warn('Impossible de sauvegarder le CSV dans localStorage');
    }

    return csvContent;
  }

  /**
   * Télécharger le CSV des utilisateurs
   */
  downloadCSV() {
    const csv = this.exportToCSV();
    if (!csv) {
      alert('Aucune donnée à exporter');
      return;
    }

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `mama_users_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  /**
   * Importer des utilisateurs depuis un CSV
   */
  importFromCSV(csvText) {
    try {
      const lines = csvText.split('\n').filter(line => line.trim());
      if (lines.length < 2) {
        throw new Error('Fichier CSV invalide');
      }

      const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
      const users = [];

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.replace(/"/g, '').trim());
        
        if (values.length >= 4) {
          users.push({
            id: values[0] || Date.now().toString() + i,
            type: values[1] || 'patiente',
            phone: values[2],
            name: values[3],
            password: 'changeme', // Mot de passe par défaut
            createdAt: values[4] || new Date().toISOString(),
            lastLogin: values[5] || null
          });
        }
      }

      // Fusionner avec les utilisateurs existants (éviter les doublons)
      const existingUsers = this.getUsers();
      const existingPhones = new Set(existingUsers.map(u => u.phone));
      
      const newUsers = users.filter(u => !existingPhones.has(u.phone));
      const allUsers = [...existingUsers, ...newUsers];

      this.saveUsers(allUsers);
      return { success: true, imported: newUsers.length };
    } catch (error) {
      console.error('Erreur lors de l\'import CSV:', error);
      return { success: false, error: error.message };
    }
  }
}

// Initialiser le système d'authentification
window.auth = new AuthSystem();

// Fonction de protection des pages
window.protectPage = function(requiredType = null) {
  if (!window.auth.isAuthenticated()) {
    window.location.href = 'login.html';
    return false;
  }

  if (requiredType && !window.auth.isType(requiredType)) {
    // Rediriger vers la bonne page selon le type
    const user = window.auth.getCurrentUser();
    if (user.type === 'patiente') {
      window.location.href = 'index-patriente.html';
    } else if (user.type === 'professionnel') {
      window.location.href = 'index-professionnel.html';
    } else if (user.type === 'etablissement') {
      window.location.href = 'index-etablissement.html';
    } else {
      window.location.href = 'index-professionnel.html';
    }
    return false;
  }

  return true;
};

