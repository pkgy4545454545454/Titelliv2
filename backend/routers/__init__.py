# Titelli Backend - Routers
# This module exports all the routers for the main app

from .trainings import router as trainings_router
from .online_status import router as online_status_router

__all__ = ['trainings_router', 'online_status_router']
