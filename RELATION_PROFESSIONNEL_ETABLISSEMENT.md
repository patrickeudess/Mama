# Relation Professionnel de Santé ↔ Établissement de Santé

## 📋 Vue d'ensemble

Le système MAMA+ établit une **relation 1-N (un à plusieurs)** entre les établissements de santé et les professionnels de santé.

```
┌─────────────────────┐
│  Établissement      │
│  de Santé           │
│                     │
│  - ID unique        │◄──────┐
│  - Nom              │       │
│  - Type             │       │
│  - Adresse          │       │
└─────────────────────┘       │
                              │
                              │ (1-N)
                              │
                              │
┌─────────────────────┐       │
│  Professionnel      │       │
│  de Santé           │       │
│                     │       │
│  - ID               │       │
│  - Nom/Prénom       │       │
│  - Profession       │       │
│  - etablissementId  ├───────┘
│    (clé étrangère)  │
└─────────────────────┘
```

## 🔗 Structure de la relation

### 1. **Établissement de Santé** (Table principale)
- **Identifiant unique** : `etablissementId` (généré automatiquement)
- Format : `etab_[nom]_[timestamp]`
- Exemple : `etab_chu_de_cocody_2024-03-15T10:30:00.000Z`

### 2. **Professionnel de Santé** (Table liée)
- **Clé étrangère** : `etablissementId`
- Chaque professionnel contient l'ID de son établissement
- Permet de filtrer et isoler les données par établissement

## 💾 Stockage des données

### LocalStorage Structure

```javascript
// Profil établissement
localStorage.getItem('mama_establishment_profile')
{
  "nom": "CHU de Cocody",
  "type": "hopital",
  "etablissementId": "etab_chu_de_cocody_2024-03-15T10:30:00.000Z", // ← ID unique
  "adresse": "...",
  "ville": "Abidjan",
  ...
}

// Tous les professionnels (tous établissements confondus)
localStorage.getItem('mama_establishment_professionnels')
[
  {
    "id": 1234567890,
    "prenom": "Marie",
    "nom": "Kouassi",
    "profession": "sage_femme",
    "etablissementId": "etab_chu_de_cocody_2024-03-15T10:30:00.000Z", // ← Relation
    "telephone": "+2250700000001",
    "createdAt": "2024-03-20T14:30:00.000Z"
  },
  {
    "id": 1234567891,
    "prenom": "Jean",
    "nom": "Diallo",
    "profession": "medecin",
    "etablissementId": "etab_chu_de_cocody_2024-03-15T10:30:00.000Z", // ← Même établissement
    "telephone": "+2250700000002",
    "createdAt": "2024-03-21T09:15:00.000Z"
  },
  {
    "id": 1234567892,
    "prenom": "Awa",
    "nom": "Traoré",
    "profession": "infirmier",
    "etablissementId": "etab_chu_de_yopougon_2024-03-16T11:00:00.000Z", // ← Autre établissement
    "telephone": "+2250700000003",
    "createdAt": "2024-03-22T08:00:00.000Z"
  }
]
```

## 🔄 Fonctionnement

### 1. **Création d'un professionnel**

```javascript
// Lorsqu'un établissement crée un professionnel :
function addProfessionnel(profData) {
  // 1. Récupérer l'ID de l'établissement actuel
  const etablissementId = getCurrentEstablishmentId();
  
  // 2. Créer le professionnel avec la relation
  const newProf = {
    id: Date.now(),
    ...profData,
    etablissementId: etablissementId, // ← Association automatique
    createdAt: new Date().toISOString()
  };
  
  // 3. Sauvegarder dans la liste globale
  allProfessionnels.push(newProf);
}
```

### 2. **Récupération des professionnels**

```javascript
// Seuls les professionnels de l'établissement actuel sont retournés
function getProfessionnels() {
  const allProfessionnels = getAllProfessionnels(); // Tous les établissements
  const currentEtablissementId = getCurrentEstablishmentId();
  
  // Filtrage par établissement
  return allProfessionnels.filter(
    prof => prof.etablissementId === currentEtablissementId
  );
}
```

### 3. **Isolation des données**

- ✅ Chaque établissement voit uniquement **ses propres professionnels**
- ✅ Les données sont **isolées** entre établissements
- ✅ Un professionnel ne peut appartenir qu'à **un seul établissement**

## 📊 Avantages de cette relation

### 1. **Isolation des données**
- Chaque établissement ne voit que ses propres professionnels
- Pas de mélange entre établissements différents
- Sécurité et confidentialité garanties

### 2. **Scalabilité**
- Un établissement peut avoir un nombre illimité de professionnels
- Facile d'ajouter de nouveaux professionnels
- Structure extensible

### 3. **Gestion centralisée**
- L'établissement gère tous ses professionnels
- Facile de lister, modifier ou supprimer
- Statistiques par établissement

### 4. **Traçabilité**
- Chaque professionnel est lié à son établissement d'origine
- Historique de création conservé
- Audit possible

## 🔍 Exemple concret

### Scénario : CHU de Cocody

1. **Établissement créé** :
   - Nom : "CHU de Cocody"
   - ID généré : `etab_chu_de_cocody_2024-03-15T10:30:00.000Z`

2. **Ajout de professionnels** :
   - Marie Kouassi (Sage-femme) → `etablissementId: "etab_chu_de_cocody_..."`
   - Jean Diallo (Médecin) → `etablissementId: "etab_chu_de_cocody_..."`
   - Fatou Traoré (Infirmière) → `etablissementId: "etab_chu_de_cocody_..."`

3. **Affichage** :
   - Seuls ces 3 professionnels apparaissent dans la liste du CHU de Cocody
   - Les professionnels d'autres établissements sont invisibles

## 🛠️ Fonctions clés

### `getCurrentEstablishmentId()`
- Génère ou récupère l'ID unique de l'établissement actuel
- Crée l'ID s'il n'existe pas encore

### `getProfessionnels()`
- Retourne uniquement les professionnels de l'établissement actuel
- Filtre automatiquement par `etablissementId`

### `addProfessionnel(profData)`
- Associe automatiquement le professionnel à l'établissement
- Ajoute `etablissementId` au nouveau professionnel

### `deleteProfessionnel(id)`
- Supprime un professionnel spécifique
- Maintient l'intégrité de la relation

## 📝 Notes importantes

1. **Un professionnel = Un établissement**
   - Un professionnel ne peut pas appartenir à plusieurs établissements
   - Pour changer d'établissement, il faut supprimer et recréer

2. **Isolation stricte**
   - Les établissements ne peuvent pas voir les professionnels des autres
   - Chaque établissement a sa propre "vue" des données

3. **ID unique**
   - L'ID de l'établissement est généré une seule fois
   - Il reste constant même si le nom change

4. **Stockage global**
   - Tous les professionnels sont stockés dans la même clé localStorage
   - Le filtrage se fait au moment de la récupération

## 🚀 Évolutions possibles

1. **Relation N-N** (Plusieurs établissements pour un professionnel)
   - Ajouter un tableau `etablissementIds` au lieu d'un seul ID
   - Permettre à un professionnel de travailler dans plusieurs établissements

2. **Hiérarchie**
   - Ajouter un champ `superviseurId` pour créer une hiérarchie
   - Permettre la gestion d'équipes

3. **Statistiques par professionnel**
   - Compter les patientes suivies par chaque professionnel
   - Ajouter des métriques de performance


