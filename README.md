# Frontend MAMA+

Ce dossier contient tous les fichiers frontend de l'application MAMA+.

## 📁 Structure

```
frontend/
├── index.html                    # Page d'accueil
├── index-professionnel.html      # Tableau de bord professionnel
├── index-patriente.html          # Interface patiente
├── index-etablissement.html      # Interface établissement
├── mes-patientes.html            # Liste des patientes
├── messages.html                 # Messagerie
├── estimation.html               # Prédiction de risques
├── statistiques.html             # Statistiques
├── performance.html              # Performance
├── alertes.html                  # Alertes prioritaires
├── geovisualisation.html         # Carte des patientes
├── chatbot.html                  # Chatbot éducatif
├── conseils.html                 # Conseils et sensibilisation
├── dossier-medical.html          # Dossier médical patiente
├── profil-*.html                 # Pages de profil
├── professionnels-*.html         # Gestion multi-professionnels
├── etablissements-*.html         # Gestion multi-établissements
├── styles.css                    # Styles principaux
├── styles-*.css                  # Styles additionnels
├── app-*.js                      # Scripts principaux
└── utils/                        # Utilitaires JavaScript
    ├── auth.js                   # Authentification
    ├── icons.js                  # Système d'icônes
    ├── messages-badge.js         # Badges de messages
    ├── multi-establishment.js    # Multi-établissements
    ├── multi-professionnels-patiente.js # Multi-professionnels
    ├── sync-code-etablissement.js # Codes de synchronisation
    └── ...
```

## 🚀 Utilisation

### Mode local (développement)

```bash
# Depuis le dossier frontend
python -m http.server 3000
# Puis ouvrez http://localhost:3000
```

### Mode GitHub Pages

Les fichiers sont automatiquement servis par GitHub Pages depuis ce dossier.

## 📝 Notes importantes

- **Version simplifiée** : Utilise `app-professionnel-simple.js` qui fonctionne avec `localStorage`
- **Version complète** : Utilise `app-professionnel.js` qui nécessite un backend API
- **Chemins relatifs** : Tous les chemins sont relatifs pour fonctionner sur GitHub Pages

## 🔧 Configuration

Pour utiliser la version avec backend, modifiez les URLs dans les fichiers JavaScript :

```javascript
// Avant (localStorage)
const API_BASE_URL = null;

// Après (avec backend)
const API_BASE_URL = 'https://votre-api.herokuapp.com';
```











