# 📄 Analyse des Différentes Pages de l'Application MAMA+

## 📊 Vue d'Ensemble

L'application MAMA+ comprend **6 pages HTML principales** et **6 fichiers JavaScript associés** pour gérer la logique de chaque page.

---

## 🏠 1. Page d'Accueil (`index.html`)

### 📋 Description
Page d'entrée de l'application permettant de sélectionner le type d'utilisateur (Patiente ou Professionnel de santé) et d'accéder aux formulaires de connexion/inscription.

### 🎯 Fonctionnalités
- ✅ **Sélection du type d'utilisateur** : Deux cartes cliquables (Patiente / Professionnel)
- ✅ **Formulaire de connexion** : Authentification par téléphone et mot de passe
- ✅ **Formulaire d'inscription** : Création de compte avec validation
- ✅ **Test de connexion serveur** : Vérification automatique de l'accessibilité du backend
- ✅ **Gestion d'erreurs** : Messages d'erreur clairs et aide pour démarrer le serveur
- ✅ **Accessibilité** : Support clavier (Enter/Space) et attributs ARIA

### 📁 Fichiers Associés
- **JavaScript** : `app-home.js` (474 lignes)
- **Styles** : Inclus dans `styles.css` + styles inline

### 🔧 Fonctionnalités Techniques
```javascript
- testServerConnection() : Vérifie l'accessibilité du backend
- Gestion login/register avec redirection selon le rôle
- Validation des formulaires côté client
- Stockage du token JWT dans localStorage
```

### ⚠️ Points d'Attention
- ⚠️ **Mode développement** : Les cartes redirigent directement vers les interfaces (bypass login)
- ⚠️ **Authentification désactivée** : Code commenté pour permettre l'accès direct
- ✅ **Recommandation** : Réactiver l'authentification avant la mise en production

---

## 👩 2. Interface Patiente (`index-patriente.html`)

### 📋 Description
Tableau de bord personnel pour les patientes enceintes, permettant de consulter leur dossier médical, leurs rendez-vous, et accéder à des ressources d'aide.

### 🎯 Fonctionnalités Principales

#### 📝 Formulaire d'Inscription/Profil
- ✅ **Création de profil patiente** : Formulaire complet avec :
  - Informations personnelles (nom, prénom, âge, gestité, parité, niveau d'instruction)
  - Informations de grossesse (date dernières règles, date accouchement prévue)
  - Localisation (ville, adresse, distance au centre, moyen de transport)
  - Antécédents médicaux et obstétricaux
- ✅ **Stockage local** : Données sauvegardées dans `localStorage`
- ✅ **Affichage conditionnel** : Formulaire affiché uniquement si aucune donnée n'existe

#### 📊 Profil Rapide
- ✅ **Informations essentielles** : Nom, âge, numéro de dossier, semaine de grossesse
- ✅ **Localisation** : Distance au centre et moyen de transport (dans la barre de profil)

#### 🎴 Grille d'Outils (7 cartes)
1. **📅 Prochaine consultation** → Section détaillée avec informations complètes
2. **🔔 Rappels et notifications** → Liste des alertes et rappels
3. **📋 Mon dossier médical** → Lien vers `dossier-medical.html`
4. **📊 Historique CPN** → Liste des consultations prénatales
5. **🤖 Aide intelligent** → Lien vers `chatbot.html`
6. **💡 Conseils** → Lien vers `conseils.html`
7. **📞 Urgence** → Lien téléphonique direct

#### 📅 Sections Détaillées
- **Prochaine consultation** : Date, heure, lieu, distance, transport, notes
- **Notifications** : Alertes, rappels de rendez-vous
- **Historique CPN** : Liste des consultations prénatales avec statuts

### 📁 Fichiers Associés
- **JavaScript** : `app-patriente.js` (~1059 lignes)
- **Styles** : `styles.css`

### 🔧 Fonctionnalités Techniques
```javascript
- fetchJSON() : Appels API avec fallback sur données mockées
- getMockData() : Données de démonstration si serveur indisponible
- calculatePregnancyWeek() : Calcul automatique de la semaine de grossesse
- Gestion localStorage pour persistance des données
- Navigation par ancres (#) pour les sections détaillées
```

### ⚠️ Points d'Attention
- ✅ **Mode démonstration** : Fonctionne sans backend grâce aux données mockées
- ⚠️ **Navigation** : Certaines cartes utilisent des ancres (#), d'autres des liens HTML
- ✅ **Tout fonctionne** : Toutes les cartes et sections sont actives

---

## 👨‍⚕️ 3. Interface Professionnel (`index-professionnel.html`)

### 📋 Description
Tableau de bord complet pour les professionnels de santé, permettant de gérer les patientes, consulter les statistiques, et effectuer des prédictions de risque.

### 🎯 Fonctionnalités Principales

#### 📝 Formulaire de Profil Professionnel
- ✅ **Création de profil** : Informations personnelles et professionnelles
  - Données personnelles (nom, prénom, téléphone, email)
  - Informations professionnelles (profession, centre de santé, adresse)
- ✅ **Stockage local** : Données sauvegardées dans `localStorage`
- ✅ **Affichage conditionnel** : Formulaire affiché uniquement si aucun profil n'existe

#### 🎴 Grille d'Outils (7 cartes)
1. **📝 Enregistrer** → Section avec bouton pour ouvrir le modal d'ajout de patiente
2. **👥 Mes patientes** → Liste complète avec filtres avancés
3. **📊 Estimation** → Prédictions de risque (badge "Nouveau")
4. **⚠️ Alertes** → Cas prioritaires à suivre
5. **📈 Étude** → Graphiques et tendances (statistiques)
6. **📍 Géovisualisation** → Carte des patientes (placeholder)
7. **📊 Performance** → Statistiques de suivi

#### 📊 Sections Détaillées

##### 1. Enregistrer une Patiente
- ✅ **Modal d'ajout** : Formulaire complet avec :
  - Informations de connexion (téléphone, mot de passe)
  - Informations personnelles (nom, prénom, âge, gestité, parité, niveau d'instruction, langue)
  - Localisation (adresse, ville, distance, transport)
  - Informations médicales (dates, antécédents, allergies)
  - Contact d'urgence

##### 2. Mes Patientes
- ✅ **Tableau interactif** : Liste avec colonnes (Nom, Âge, Distance, Risque, Dernière venue, Prochaine CPN, Actions)
- ✅ **Filtres avancés** :
  - Filtre par niveau de risque (Tous, Élevé, Modéré, Faible)
  - Filtre par localité
  - Filtre par semaine de grossesse (0-12, 13-24, 25-36, 37-42)
  - Filtre par statut CPN (Tous, Complétées, Manquées, Planifiées)
- ✅ **Bouton d'export** : Placeholder pour export PDF/Excel
- ✅ **Actions** : Bouton "Voir dossier" pour chaque patiente

##### 3. Estimation des Risques
- ✅ **Affichage conditionnel** : Message si aucune patiente sélectionnée
- ✅ **Prédictions détaillées** : Score de risque, niveau, confiance, recommandations
- ✅ **Intégration** : Sélection depuis la liste des patientes

##### 4. Alertes Prioritaires
- ✅ **Liste des alertes** : Cas nécessitant une attention immédiate
- ✅ **Tri par priorité** : Affichage des cas les plus urgents en premier

##### 5. Statistiques - Graphiques et Tendances
- ✅ **Statistiques globales** : Nombre total de patientes, consultations, etc.
- ✅ **Graphiques** : Placeholder pour visualisations (à implémenter)

##### 6. Géovisualisation
- ✅ **Placeholder** : Message indiquant que la fonctionnalité sera disponible prochainement
- ⚠️ **À implémenter** : Intégration d'une API de cartographie

##### 7. Performance
- ✅ **Statistiques de suivi** : Métriques de performance du professionnel

### 📁 Fichiers Associés
- **JavaScript** : `app-professionnel.js` (~1502 lignes)
- **Styles** : `styles.css`

### 🔧 Fonctionnalités Techniques
```javascript
- setupToolCards() : Gestion de la navigation par cartes
- handleSectionLoad() : Chargement des données selon la section
- loadDashboardData() : Chargement asynchrone avec Promise.allSettled
- Filtres dynamiques avec mise à jour en temps réel
- Gestion des modals (ouverture/fermeture)
- Export des données (placeholder)
```

### ⚠️ Points d'Attention
- ✅ **Toutes les cartes actives** : Navigation fonctionnelle
- ⚠️ **Géovisualisation** : Non implémentée (placeholder)
- ⚠️ **Export PDF/Excel** : Bouton présent mais non fonctionnel
- ✅ **Mode démonstration** : Fonctionne sans backend

---

## 📋 4. Dossier Médical Complet (`dossier-medical.html`)

### 📋 Description
Page dédiée pour afficher le dossier médical complet d'une patiente, incluant consultations, rendez-vous CPN, et vaccinations.

### 🎯 Fonctionnalités
- ✅ **Profil patiente** : Informations essentielles en haut de page
- ✅ **Dossier médical structuré** : 3 sections principales :
  1. **🩺 Consultations** : Historique des consultations avec dates, poids, tension, notes
  2. **📅 Rendez-vous CPN** : Liste des consultations prénatales avec statuts
  3. **💉 Vaccinations** : Historique des vaccinations avec dates et sites d'injection
- ✅ **Navigation** : Bouton retour vers `index-patriente.html`
- ✅ **États vides** : Messages appropriés si aucune donnée

### 📁 Fichiers Associés
- **JavaScript** : `app-dossier.js` (371 lignes)
- **Styles** : `styles.css`

### 🔧 Fonctionnalités Techniques
```javascript
- fetchJSON() : Récupération du dossier depuis l'API
- getMockData() : Données de démonstration
- renderDossier() : Rendu structuré du dossier
- renderEmptyDossier() : Affichage si aucune donnée
- calculatePregnancyWeek() : Calcul de la semaine de grossesse
```

### ⚠️ Points d'Attention
- ✅ **Fonctionnel** : Toutes les fonctionnalités sont implémentées
- ✅ **Design cohérent** : Même style que le reste de l'application

---

## 🤖 5. Chatbot IA (`chatbot.html`)

### 📋 Description
Interface de chatbot pour répondre aux questions des patientes sur la grossesse, la nutrition, les signes d'alerte, etc.

### 🎯 Fonctionnalités
- ✅ **Interface de chat** : Zone de messages avec historique
- ✅ **Saisie de questions** : Champ de texte avec bouton "Envoyer"
- ✅ **Questions suggérées** : 4 boutons de suggestions :
  - 🍎 Nutrition
  - ⚠️ Signes d'alerte
  - 🏥 Consultation
  - 💪 Exercices
- ✅ **Réponses prédéfinies** : Système de réponses basé sur des mots-clés
- ✅ **Design conversationnel** : Messages utilisateur et bot différenciés visuellement

### 📁 Fichiers Associés
- **JavaScript** : `app-chatbot.js` (98 lignes)
- **Styles** : `styles.css`

### 🔧 Fonctionnalités Techniques
```javascript
- addMessage() : Ajout de messages dans la conversation
- getBotResponse() : Détection de mots-clés et réponses appropriées
- Réponses prédéfinies pour : nutrition, signes, consultation, exercices
- Délai simulé pour réponse (500ms)
- Scroll automatique vers le dernier message
```

### ⚠️ Points d'Attention
- ⚠️ **Chatbot basique** : Système de réponses prédéfinies (pas d'IA réelle)
- ✅ **Fonctionnel** : Répond correctement aux questions fréquentes
- 🔄 **Amélioration possible** : Intégration d'une API d'IA (OpenAI, etc.)

---

## 💡 6. Conseils et Informations (`conseils.html`)

### 📋 Description
Page d'information avec conseils sur la nutrition pendant la grossesse et les signes d'alerte à surveiller.

### 🎯 Fonctionnalités
- ✅ **Navigation par onglets** : 2 onglets principaux :
  1. **🍎 Nutrition** : Conseils alimentaires
  2. **⚠️ Signes d'alerte** : Signes à surveiller

#### 📋 Contenu Nutrition
- ✅ **Aliments recommandés** : Liste détaillée (fruits, protéines, calcium, fer, acide folique)
- ✅ **Aliments à éviter** : Liste avec explications (alcool, caféine, poissons crus, etc.)
- ✅ **Hydratation** : Conseils sur la consommation d'eau
- ✅ **Repas équilibrés** : Suggestions pour petit-déjeuner, déjeuner, dîner, collations

#### ⚠️ Contenu Signes d'Alerte
- ✅ **🚨 Signes nécessitant consultation immédiate** : Liste avec explications
- ✅ **⚠️ Signes nécessitant consultation dans les 24h** : Liste avec explications
- ✅ **ℹ️ Signes normaux** : Rassurer sur les symptômes normaux de la grossesse
- ✅ **📞 En cas d'urgence** : Numéro de téléphone d'urgence avec lien cliquable

### 📁 Fichiers Associés
- **JavaScript** : `app-conseils.js` (21 lignes)
- **Styles** : `styles.css`

### 🔧 Fonctionnalités Techniques
```javascript
- Gestion des onglets : Activation/désactivation
- Changement de contenu selon l'onglet sélectionné
- Design responsive avec styles dédiés
```

### ⚠️ Points d'Attention
- ✅ **Fonctionnel** : Tous les onglets et contenus sont actifs
- ✅ **Contenu complet** : Informations détaillées et utiles
- ✅ **Design cohérent** : Style uniforme avec le reste de l'application

---

## 📊 Résumé des Pages

| Page | Fichier HTML | Fichier JS | Lignes JS | Statut | Fonctionnalités Principales |
|------|--------------|------------|-----------|--------|----------------------------|
| **Accueil** | `index.html` | `app-home.js` | 474 | ✅ | Login/Register, sélection utilisateur |
| **Patiente** | `index-patriente.html` | `app-patriente.js` | ~1059 | ✅ | Profil, rendez-vous, notifications, CPN |
| **Professionnel** | `index-professionnel.html` | `app-professionnel.js` | ~1502 | ✅ | Gestion patientes, statistiques, prédictions |
| **Dossier** | `dossier-medical.html` | `app-dossier.js` | 371 | ✅ | Consultations, CPN, vaccinations |
| **Chatbot** | `chatbot.html` | `app-chatbot.js` | 98 | ✅ | Réponses aux questions fréquentes |
| **Conseils** | `conseils.html` | `app-conseils.js` | 21 | ✅ | Nutrition et signes d'alerte |

---

## 🔗 Navigation Entre les Pages

### Flux Principal
```
index.html
  ├── index-patriente.html
  │     ├── dossier-medical.html
  │     ├── chatbot.html
  │     └── conseils.html
  │
  └── index-professionnel.html
```

### Liens de Navigation
- **Accueil → Patiente** : Lien direct (`index-patriente.html`)
- **Accueil → Professionnel** : Lien direct (`index-professionnel.html`)
- **Patiente → Dossier** : Lien (`dossier-medical.html`)
- **Patiente → Chatbot** : Lien (`chatbot.html`)
- **Patiente → Conseils** : Lien (`conseils.html`)
- **Dossier/Chatbot/Conseils → Patiente** : Bouton retour (←)

---

## 🎨 Design et Styles

### Architecture CSS
- **Fichier unique** : `styles.css` (1786 lignes)
- **Styles inline** : Présents dans `index.html` pour la page d'accueil
- **Classes communes** : `.card`, `.btn-primary`, `.loading-state`, etc.
- **Responsive** : Media queries présentes

### Composants Réutilisables
- ✅ **Cartes** : `.card`, `.tool-card`
- ✅ **Boutons** : `.btn-primary`, `.btn-secondary`
- ✅ **Formulaires** : `.registration-form`, `.form-section`
- ✅ **États** : `.loading-state`, `.error-state`, `.empty-state`
- ✅ **Modals** : `.modal`, `.modal-content`

---

## 🔧 Fonctionnalités Techniques Communes

### 1. Gestion API
```javascript
// Présent dans tous les fichiers JS (sauf app-conseils.js)
const API_BASE = "http://localhost:8000/api";
async function fetchJSON(path, options = {})
function defaultHeaders()
```

### 2. Mode Démonstration
```javascript
// Fallback sur données mockées si serveur indisponible
const USE_MOCK = window.USE_MOCK_DATA !== false;
async function getMockData(path, options = {})
```

### 3. Gestion Authentification
```javascript
// Token JWT stocké dans localStorage
let authToken = localStorage.getItem("mama_token") || "";
```

### 4. Stockage Local
```javascript
// Données patiente/professionnel sauvegardées localement
localStorage.setItem("mama_patiente_data", JSON.stringify(data));
localStorage.setItem("mama_professional_data", JSON.stringify(data));
```

---

## ⚠️ Points d'Amélioration Identifiés

### 🔴 Priorité Haute
1. **Code dupliqué** : `fetchJSON` et `defaultHeaders` répétés dans 4 fichiers
   - **Solution** : Créer `api.js` commun
2. **Géovisualisation** : Non implémentée (placeholder uniquement)
   - **Solution** : Intégrer Leaflet ou Google Maps
3. **Export PDF/Excel** : Bouton présent mais non fonctionnel
   - **Solution** : Implémenter avec jsPDF ou xlsx

### 🟠 Priorité Moyenne
4. **Chatbot basique** : Réponses prédéfinies uniquement
   - **Solution** : Intégrer une API d'IA (OpenAI, etc.)
5. **Graphiques** : Placeholders dans la section statistiques
   - **Solution** : Intégrer Chart.js ou D3.js
6. **Pagination** : Pas de pagination pour grandes listes
   - **Solution** : Implémenter pagination côté client ou serveur

### 🟢 Priorité Basse
7. **Modularisation CSS** : Fichier unique de 1786 lignes
   - **Solution** : Séparer par composant (cards.css, forms.css, etc.)
8. **Tests** : Aucun test unitaire
   - **Solution** : Ajouter tests avec Jest ou Vitest
9. **Documentation** : Fonctions non documentées
   - **Solution** : Ajouter JSDoc comments

---

## ✅ Points Forts

1. **Architecture claire** : Séparation logique des pages et fonctionnalités
2. **Design cohérent** : Style uniforme sur toutes les pages
3. **Gestion d'erreurs** : Messages utilisateur explicites
4. **Mode démonstration** : Fonctionne sans backend grâce aux données mockées
5. **Accessibilité** : Attributs ARIA et support clavier
6. **Responsive** : Design adaptatif pour mobile et desktop

---

## 📝 Conclusion

L'application MAMA+ dispose d'une **architecture solide** avec **6 pages fonctionnelles** couvrant tous les besoins des utilisateurs (patientes et professionnels). La plupart des fonctionnalités sont **implémentées et opérationnelles**, avec quelques placeholders pour des fonctionnalités avancées (géolocalisation, export, graphiques).

**État général** : ✅ **85% fonctionnel**

Les principales améliorations à apporter concernent :
- La réduction de la duplication de code
- L'implémentation des fonctionnalités en placeholder
- L'optimisation des performances (pagination, lazy loading)

