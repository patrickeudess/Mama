"""
Version simplifiée de l'API MAMA+ utilisant CSV pour le stockage
Plus facile à mettre en place - pas besoin de base de données !
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="MAMA+ API (CSV Storage)",
    description="API pour le suivi des consultations prénatales - Version simplifiée avec stockage CSV",
    version="2.0.0"
)

# Configuration CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Importer les routers CSV
from app.api import patientes_csv, dashboard_csv

app.include_router(patientes_csv.router, prefix="/api/patientes", tags=["Patientes"])
app.include_router(dashboard_csv.router, prefix="/api/dashboard", tags=["Tableau de bord"])


@app.get("/")
async def root():
    return {
        "message": "Bienvenue sur l'API MAMA+ (Version CSV)",
        "version": "2.0.0",
        "storage": "CSV",
        "docs": "/docs",
        "note": "Cette version utilise CSV pour le stockage - plus simple à mettre en place !"
    }


@app.get("/health")
async def health_check():
    return {"status": "healthy", "storage": "CSV"}

