"""
Routes package for the application.
This package contains all FastAPI route handlers.
"""

from .auth    import router as auth
from .games   import router as games
from .players import router as players
from .estatisticas import router as estatisticas
from .leads import router as leads

__all__ = ['auth', 'games', 'players', 'estatisticas', 'leads']

