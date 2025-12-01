# Structure du projet MAMA+

## 📁 Organisation des fichiers

```
mama+
├── .github/
│   └── workflows/          # CI/CD GitHub Actions
├── backend/                # Backend FastAPI
│   ├── app/
│   │   ├── api/           # Routes API REST
│   │   │   ├── auth.py
│   │   │   ├── patientes.py
│   │   │   ├── patientes_csv.py
│   │   │   ├── cpn.py
│   │   │   ├── consultations.py
│   │   │   ├── vaccinations.py
│   │   │   ├── dashboard.py
│   │   │   ├── dashboard_csv.py
│   │   │   ├── prediction.py
│   │   │   └── chatbot.py
│   │   ├── services/      # Services métier
│   │   │   ├── notifications.py
│   │   │   ├── chatbot.py
│   │   │   └── prediction.py
│   │   ├── models.py      # Modèles SQLAlchemy
│   │   ├── schemas.py     # Schémas Pydantic
│   │   ├── auth.py        # Authentification JWT
│   │   ├── database.py    # Configuration DB
│   │   └── storage_csv.py # Stockage CSV
│   ├── main.py           # Point d'entrée (PostgreSQL)
│   ├── main_csv.py       # Point d'entrée (CSV)
│   └── requirements.txt
├── frontend/              # Interface web
│   ├── *.html            # Pages HTML
│   ├── app-*.js          # Scripts JavaScript
│   └── styles.css        # Styles CSS
├── docs/                  # Documentation
├── .gitignore
├── LICENSE
├── CONTRIBUTING.md
└── README.md
```

## 🔑 Fichiers clés

### Backend

- **main.py** : Application FastAPI principale (PostgreSQL)
- **main_csv.py** : Application FastAPI simplifiée (CSV)
- **app/api/** : Toutes les routes API
- **app/services/** : Logique métier
- **app/models.py** : Modèles de données
- **app/schemas.py** : Validation des données

### Frontend

- **index.html** : Page d'accueil
- **index-professionnel.html** : Tableau de bord professionnel
- **index-patriente.html** : Interface patiente
- **app-professionnel-simple.js** : Version simplifiée (localStorage)
- **app-professionnel.js** : Version complète (API)

## 📝 Conventions de nommage

- **Python** : snake_case pour variables et fonctions, PascalCase pour classes
- **JavaScript** : camelCase pour variables et fonctions
- **Fichiers** : kebab-case pour HTML/CSS, snake_case pour Python

## 🔄 Flux de données

1. **Frontend** → Appelle l'API via `fetch()`
2. **API** → Valide avec Pydantic schemas
3. **Services** → Logique métier
4. **Database/Storage** → Persistance des données
5. **Response** → Retour au frontend

## 🎯 Points d'entrée

- **Développement local** : `uvicorn main_csv:app --reload`
- **Production** : `uvicorn main:app --host 0.0.0.0 --port 8000`
- **Frontend** : Ouvrir `frontend/index.html` ou servir avec un serveur HTTP

