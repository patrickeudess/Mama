# Tests des Boutons - Page "MAMA+ – Mes patientes"

## ✅ Boutons Testés et Activés

### 1. Bouton "Ajouter une patiente" (+ Ajouter une patiente)
- **Localisation** : En haut à droite de la page
- **Fonction** : `window.openAddPatienteModal()`
- **Action** : Ouvre le modal pour ajouter une nouvelle patiente
- **Statut** : ✅ Activé et testé
- **Test** : Vérifier dans la console que le message "✅ Bouton 'Ajouter une patiente' connecté" apparaît

### 2. Bouton "Exporter" (📊 Exporter)
- **Localisation** : Dans la barre de filtres
- **Fonction** : `window.exportReport("excel")`
- **Action** : Exporte la liste des patientes en CSV
- **Statut** : ✅ Activé et fonctionnel
- **Fonctionnalité** :
  - Récupère toutes les patientes du tableau
  - Crée un fichier CSV avec les colonnes : Nom, Âge, Distance, Risque, Dernière venue, Prochaine CPN
  - Télécharge automatiquement le fichier
- **Test** : Cliquer sur le bouton et vérifier le téléchargement du fichier CSV

### 3. Boutons d'Action dans le Tableau

#### 3.1. Bouton "Appeler" (📞)
- **Fonction** : `window.handleCall(telephone)`
- **Action** : Lance un appel téléphonique vers la patiente
- **Fonctionnalités** :
  - Validation du numéro de téléphone
  - Nettoyage du numéro (suppression des espaces)
  - Vérification du format (8-15 chiffres)
  - Désactivé si pas de numéro disponible
- **Statut** : ✅ Activé et testé
- **Test** : Cliquer sur le bouton 📞 et vérifier que l'appel se lance (sur mobile) ou qu'un message d'erreur s'affiche si le numéro est invalide

#### 3.2. Bouton "Modifier" (✏️)
- **Fonction** : `window.handleEditPatiente(patienteId)`
- **Action** : Ouvre le modal avec le formulaire prérempli pour modifier la patiente
- **Fonctionnalités** :
  - Charge les données de la patiente depuis l'API
  - Prépare le formulaire avec toutes les données
  - Désactive le champ téléphone (non modifiable)
  - Change le titre du modal en "Modifier une patiente"
  - Utilise l'endpoint PUT pour la mise à jour
- **Statut** : ✅ Activé et testé
- **Test** : Cliquer sur ✏️, vérifier que le modal s'ouvre avec les données préremplies, modifier et sauvegarder

#### 3.3. Bouton "Rappel SMS" (✅)
- **Fonction** : `window.handleQuickReminder(patienteId)`
- **Action** : Envoie un rappel SMS pour la prochaine CPN
- **Statut** : ✅ Activé et testé
- **Test** : Cliquer sur ✅ et vérifier l'envoi du rappel

#### 3.4. Bouton "Voir dossier" (👁️)
- **Fonction** : `window.loadDossier(patienteId)`
- **Action** : Charge et affiche le dossier médical complet de la patiente
- **Statut** : ✅ Activé et testé
- **Test** : Cliquer sur 👁️ et vérifier l'affichage du dossier

#### 3.5. Bouton "Supprimer" (🗑️)
- **Fonction** : `window.handleDeletePatiente(patienteId, patienteName)`
- **Action** : Supprime la patiente après confirmation
- **Fonctionnalités** :
  - Demande confirmation avant suppression
  - Supprime la patiente et l'utilisateur associé via l'API DELETE
  - Recharge automatiquement la liste après suppression
- **Statut** : ✅ Activé et testé
- **Test** : Cliquer sur 🗑️, confirmer la suppression, vérifier que la patiente disparaît de la liste

### 4. Filtres

#### 4.1. Filtre "Risque"
- **ID** : `#risk-filter`
- **Action** : Filtre les patientes par niveau de risque (Tous, Élevé, Modéré, Faible)
- **Statut** : ✅ Activé

#### 4.2. Filtre "Localité"
- **ID** : `#location-filter`
- **Action** : Filtre les patientes par ville
- **Statut** : ✅ Activé et mis à jour automatiquement

#### 4.3. Filtre "Semaine grossesse"
- **ID** : `#week-filter`
- **Action** : Filtre les patientes par semaine de grossesse
- **Statut** : ✅ Activé

#### 4.4. Filtre "Statut CPN"
- **ID** : `#cpn-status-filter`
- **Action** : Filtre les patientes par statut CPN (Tous, Complétées, Manquées, Planifiées)
- **Statut** : ✅ Activé

## 🔍 Vérifications Automatiques

Lors du chargement de la page, la console affiche :
- ✅ Bouton 'Ajouter une patiente' connecté
- ✅ Bouton 'Exporter' connecté
- ✅ Fonction handleCall disponible
- ✅ Fonction handleEditPatiente disponible
- ✅ Fonction handleDeletePatiente disponible
- ✅ Fonction handleQuickReminder disponible
- ✅ Fonction loadDossier disponible
- ✅ Fonction openAddPatienteModal disponible
- ✅ Fonction loadDashboardData disponible
- ✅ Initialisation de la page 'Mes patientes' terminée

## 📝 Notes de Test

1. **Test d'ajout** : Ajouter une nouvelle patiente et vérifier qu'elle apparaît en haut de la liste (tri par ID décroissant)

2. **Test de modification** : Modifier une patiente existante et vérifier que les changements sont sauvegardés

3. **Test de suppression** : Supprimer une patiente et vérifier qu'elle disparaît de la liste

4. **Test d'appel** : Vérifier que le bouton d'appel fonctionne (nécessite un appareil mobile ou un simulateur)

5. **Test d'export** : Exporter la liste et vérifier que le fichier CSV contient toutes les données

6. **Test des filtres** : Tester chaque filtre et vérifier que la liste se met à jour correctement

## 🐛 Problèmes Potentiels

- Si un bouton ne fonctionne pas, vérifier la console pour les messages d'erreur
- Vérifier que toutes les fonctions sont bien exposées globalement (`window.functionName`)
- Vérifier que les IDs des éléments HTML correspondent aux sélecteurs dans le JavaScript

