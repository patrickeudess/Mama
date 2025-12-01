# 📄 Pages de l'Interface Patiente - MAMA+

## 🎯 Architecture des Pages

Chaque carte de l'interface patiente correspond maintenant à une **page HTML dédiée** pour une navigation plus simple et intuitive.

---

## 📋 Liste des Pages

### 1. **Tableau de bord principal**
- **Fichier** : `index-patriente.html`
- **Description** : Page d'accueil avec la grille de 7 cartes
- **Navigation** : Point d'entrée principal

### 2. **Prochaine consultation**
- **Fichier** : `prochaine-consultation.html`
- **Description** : Détails du prochain rendez-vous
- **Fonctionnalités** :
  - Date et heure du rendez-vous
  - Lieu et adresse
  - Distance et moyen de transport
  - Notes et instructions
- **Navigation** : Retour vers `index-patriente.html`

### 3. **Rappels et notifications**
- **Fichier** : `notifications.html`
- **Description** : Alertes et rappels personnalisés
- **Fonctionnalités** :
  - Liste des notifications
  - Rappels de rendez-vous
  - Alertes importantes
- **Navigation** : Retour vers `index-patriente.html`

### 4. **Mon dossier médical**
- **Fichier** : `dossier-medical.html` (déjà existant)
- **Description** : Dossier médical complet
- **Fonctionnalités** :
  - Consultations
  - Rendez-vous CPN
  - Vaccinations
- **Navigation** : Retour vers `index-patriente.html`

### 5. **Historique CPN**
- **Fichier** : `historique-cpn.html`
- **Description** : Historique des consultations prénatales
- **Fonctionnalités** :
  - Liste des CPN
  - Statuts (complétées, planifiées, manquées)
  - Dates et détails
- **Navigation** : Retour vers `index-patriente.html`

### 6. **Aide intelligent (Chatbot)**
- **Fichier** : `chatbot.html` (déjà existant)
- **Description** : Assistant virtuel pour répondre aux questions
- **Fonctionnalités** :
  - Chat interactif
  - Questions suggérées
  - Réponses personnalisées
- **Navigation** : Retour vers `index-patriente.html`

### 7. **Conseils**
- **Fichier** : `conseils.html` (déjà existant)
- **Description** : Conseils nutrition et signes d'alerte
- **Fonctionnalités** :
  - Onglets Nutrition / Signes d'alerte
  - Informations détaillées
  - Numéro d'urgence
- **Navigation** : Retour vers `index-patriente.html`

### 8. **Urgence**
- **Fichier** : Lien téléphonique direct (`tel:+22370000000`)
- **Description** : Appel d'urgence immédiat
- **Fonctionnalités** : Ouvre l'application téléphone

---

## 🔗 Navigation

### Depuis le tableau de bord (`index-patriente.html`)
Chaque carte est un lien direct vers sa page dédiée :
- **Prochaine consultation** → `prochaine-consultation.html`
- **Rappels et notifications** → `notifications.html`
- **Mon dossier médical** → `dossier-medical.html`
- **Historique CPN** → `historique-cpn.html`
- **Aide intelligent** → `chatbot.html`
- **Conseils** → `conseils.html`
- **Urgence** → `tel:+22370000000` (appel direct)

### Depuis chaque page
- **Bouton retour (←)** dans le header → Retour vers `index-patriente.html`

---

## ✅ Avantages de cette Architecture

1. **Navigation simple** : Chaque fonctionnalité a sa propre page
2. **URLs partageables** : Chaque page a sa propre URL
3. **Meilleure UX** : Les utilisateurs comprennent mieux la structure
4. **Maintenance facilitée** : Code séparé par fonctionnalité
5. **Performance** : Chargement uniquement du contenu nécessaire
6. **Pas de problèmes d'affichage** : Chaque page est indépendante

---

## 📁 Structure des Fichiers

```
frontend/
├── index-patriente.html          # Tableau de bord principal
├── prochaine-consultation.html   # Prochain rendez-vous
├── notifications.html            # Rappels et notifications
├── dossier-medical.html          # Dossier médical complet (existant)
├── historique-cpn.html          # Historique CPN
├── chatbot.html                  # Chatbot IA (existant)
├── conseils.html                 # Conseils (existant)
└── app-patriente.js             # Logique JavaScript partagée
```

---

## 🎨 Design Uniforme

Toutes les pages partagent :
- **Header** : Même style avec bouton retour
- **Profil rapide** : Affiché en haut de chaque page (sauf certaines)
- **Styles** : Fichier `styles.css` commun
- **JavaScript** : Fichier `app-patriente.js` partagé
- **Structure** : Layout cohérent sur toutes les pages

---

## 🚀 Utilisation

1. Ouvrir `index-patriente.html`
2. Cliquer sur une carte
3. Navigation automatique vers la page correspondante
4. Utiliser le bouton retour (←) pour revenir au tableau de bord

Toutes les pages sont maintenant fonctionnelles et accessibles !

