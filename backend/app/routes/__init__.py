from .auth    import router as auth
from .games   import router as games
from .players import router as players
from .estatisticas import router as estatisticas

__all__ = ['auth', 'games', 'players', 'estatisticas']

