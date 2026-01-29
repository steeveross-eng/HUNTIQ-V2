"""
BIONIC Territory Service - Module Init

Point d'entrée du service BIONIC Territory
"""

from .routes.territory_routes import router as territory_router

__all__ = ['territory_router']
