# 📊 Association des Pages Statistiques et Performance

## 🎯 Objectif

Les pages "Étude" (Statistiques) et "Performance" ont été associées en une seule page unifiée avec un système d'onglets pour faciliter la navigation.

## ✅ Modifications Apportées

### 1. Page Statistiques Unifiée (`statistiques.html`)

**Nouvelle structure** :
- **Onglets** : Deux onglets pour basculer entre "Statistiques" et "Performance"
- **Section Statistiques** : Affiche les statistiques générales (renderStats)
- **Section Performance** : Affiche les statistiques de performance (renderPerformance)

**Fonctionnalités** :
- Navigation par onglets avec JavaScript
- Détection automatique du hash `#performance` dans l'URL pour afficher directement l'onglet Performance
- Les deux sections se chargent automatiquement avec `loadDashboardData()`

### 2. Page Performance (`performance.html`)

**Redirection automatique** :
- Redirige vers `statistiques.html#performance`
- Permet de conserver les anciens liens fonctionnels

### 3. Mise à Jour des Liens

**Dans `index-professionnel.html`** :
- Carte "Étude" → `statistiques.html` (affiche l'onglet Statistiques)
- Carte "Performance" → `statistiques.html#performance` (affiche directement l'onglet Performance)

## 📋 Contenu des Onglets

### Onglet Statistiques 📈
- Nombre total de patientes suivies
- CPN planifiées
- CPN du jour
- Taux de venue CPN
- Taux d'alerte
- Consultations ce mois
- Répartition par catégorie de risque (élevé, modéré, faible)

### Onglet Performance 📊
- Taux de venue par mois (barre de progression)
- Évolution du nombre de patientes à risque élevé
- Boutons d'export (PDF, Excel)

## 🎨 Interface Utilisateur

### Onglets
- Design moderne avec bordure inférieure pour l'onglet actif
- Couleur bleue (#2563eb) pour l'onglet actif
- Transition fluide entre les onglets
- Responsive pour mobile

### Navigation
- Clic sur l'onglet pour basculer
- URL avec hash pour partager un onglet spécifique
- Scroll automatique vers la section active

## 🔧 Fonctionnement Technique

### JavaScript
```javascript
function switchTab(tabName) {
  // Désactive tous les onglets
  // Active l'onglet sélectionné
  // Affiche la section correspondante
}
```

### CSS
- `.tab-content` : Masqué par défaut (`display: none`)
- `.tab-content.active` : Affiché (`display: block`)
- `.tab-btn.active` : Style actif avec bordure bleue

## 📱 Responsive

Les onglets s'adaptent aux petits écrans :
- Sur mobile, les onglets peuvent passer en colonne
- Le contenu reste lisible sur tous les formats

## 🚀 Utilisation

1. **Depuis le tableau de bord** :
   - Cliquer sur "Étude" → Affiche l'onglet Statistiques
   - Cliquer sur "Performance" → Affiche directement l'onglet Performance

2. **Sur la page** :
   - Cliquer sur l'onglet "📈 Statistiques" pour voir les statistiques générales
   - Cliquer sur l'onglet "📊 Performance" pour voir les statistiques de performance

3. **Partage d'URL** :
   - `statistiques.html` → Affiche Statistiques par défaut
   - `statistiques.html#performance` → Affiche Performance directement

## ✅ Avantages

1. **Navigation simplifiée** : Tout est sur une seule page
2. **Cohérence** : Les deux types de statistiques sont regroupés
3. **Performance** : Les données sont chargées une seule fois
4. **UX améliorée** : Navigation fluide entre les sections
5. **URLs partageables** : Possibilité de partager un onglet spécifique

---

**Date** : $(date)
**Statut** : ✅ Pages associées avec succès

