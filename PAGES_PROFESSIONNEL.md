# 📄 Pages du Tableau de Bord Professionnel - MAMA+

## 🎯 Architecture des Pages

Chaque carte du tableau de bord professionnel correspond maintenant à une **page HTML dédiée** pour une navigation plus simple et intuitive.

---

## 📋 Liste des Pages

### 1. **Tableau de bord principal**
- **Fichier** : `index-professionnel.html`
- **Description** : Page d'accueil avec la grille de 7 cartes
- **Navigation** : Point d'entrée principal

### 2. **Enregistrer une patiente**
- **Fichier** : `enregistrer-patiente.html`
- **Description** : Page pour enregistrer une nouvelle patiente
- **Fonctionnalités** :
  - Bouton pour ouvrir le formulaire d'enregistrement
  - Modal avec formulaire complet
- **Navigation** : Retour vers `index-professionnel.html`

### 3. **Mes patientes**
- **Fichier** : `mes-patientes.html`
- **Description** : Liste complète des patientes suivies
- **Fonctionnalités** :
  - Tableau interactif avec toutes les patientes
  - Filtres avancés (risque, localité, semaine, statut CPN)
  - Bouton "Ajouter une patiente"
  - Bouton "Voir dossier" pour chaque patiente
  - Bouton "Exporter"
- **Navigation** : Retour vers `index-professionnel.html`

### 4. **Estimation des risques**
- **Fichier** : `estimation.html`
- **Description** : Prédictions de risque pour les patientes
- **Fonctionnalités** :
  - Affichage des prédictions de risque
  - Score, niveau, confiance, recommandations
  - Lien vers la liste des patientes
- **Navigation** : Retour vers `index-professionnel.html`

### 5. **Alertes prioritaires**
- **Fichier** : `alertes.html`
- **Description** : Cas prioritaires nécessitant une attention immédiate
- **Fonctionnalités** :
  - Liste des alertes
  - Tri par priorité
  - Informations sur les patientes à risque
- **Navigation** : Retour vers `index-professionnel.html`

### 6. **Statistiques et tendances**
- **Fichier** : `statistiques.html`
- **Description** : Graphiques et statistiques du suivi
- **Fonctionnalités** :
  - Statistiques globales
  - Répartition par catégorie de risque
  - Taux de venue et taux d'alerte
- **Navigation** : Retour vers `index-professionnel.html`

### 7. **Géovisualisation**
- **Fichier** : `geovisualisation.html`
- **Description** : Carte interactive des patientes
- **Fonctionnalités** :
  - Clusters par localité
  - Statistiques par ville
  - Placeholder pour carte interactive future
- **Navigation** : Retour vers `index-professionnel.html`

### 8. **Performance**
- **Fichier** : `performance.html`
- **Description** : Statistiques de performance du professionnel
- **Fonctionnalités** :
  - Statistiques mensuelles
  - Taux de venue par mois
  - Nombre de patientes à risque élevé
  - Boutons d'export PDF/Excel
- **Navigation** : Retour vers `index-professionnel.html`

---

## 🔗 Navigation

### Depuis le tableau de bord (`index-professionnel.html`)
Chaque carte est un lien direct vers sa page dédiée :
- **Enregistrer** → `enregistrer-patiente.html`
- **Mes patientes** → `mes-patientes.html`
- **Estimation** → `estimation.html`
- **Alertes** → `alertes.html`
- **Étude** → `statistiques.html`
- **Géovisualisation** → `geovisualisation.html`
- **Performance** → `performance.html`

### Depuis chaque page
- **Bouton retour (←)** dans le header → Retour vers `index-professionnel.html`

---

## ✅ Avantages de cette Architecture

1. **Navigation simple** : Chaque fonctionnalité a sa propre page
2. **URLs partageables** : Chaque page a sa propre URL
3. **Meilleure UX** : Les utilisateurs comprennent mieux la structure
4. **Maintenance facilitée** : Code séparé par fonctionnalité
5. **Performance** : Chargement uniquement du contenu nécessaire

---

## 📁 Structure des Fichiers

```
frontend/
├── index-professionnel.html      # Tableau de bord principal
├── enregistrer-patiente.html     # Page d'enregistrement
├── mes-patientes.html            # Liste des patientes
├── estimation.html               # Prédictions de risque
├── alertes.html                  # Alertes prioritaires
├── statistiques.html             # Statistiques et graphiques
├── geovisualisation.html         # Carte des patientes
├── performance.html              # Statistiques de performance
└── app-professionnel.js         # Logique JavaScript partagée
```

---

## 🎨 Design Uniforme

Toutes les pages partagent :
- **Header** : Même style avec bouton retour
- **Styles** : Fichier `styles.css` commun
- **JavaScript** : Fichier `app-professionnel.js` partagé
- **Structure** : Layout cohérent sur toutes les pages

---

## 🚀 Utilisation

1. Ouvrir `index-professionnel.html`
2. Cliquer sur une carte
3. Navigation automatique vers la page correspondante
4. Utiliser le bouton retour (←) pour revenir au tableau de bord

Toutes les pages sont maintenant fonctionnelles et accessibles !

