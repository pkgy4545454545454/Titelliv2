"""
Routers package for Titelli API.

This package contains modular routers for different API sections:
- auth: Authentication (login, register, profile)
- payments: Stripe payments and subscriptions
- websocket: Real-time notifications and presence
- client: Client-specific endpoints
- enterprise: Enterprise-specific endpoints
- trainings: Training courses endpoints
"""

from .auth import router as auth_router
from .payments import router as payments_router
from .websocket import router as websocket_router, ws_manager, get_ws_manager
from .shared import (
    db, 
    get_current_user, 
    get_user_cashback_rate,
    get_user_plan,
    TITELLI_FEES,
    PREMIUM_PLANS,
    hash_password,
    verify_password,
    create_token
)

__all__ = [
    'auth_router',
    'payments_router', 
    'websocket_router',
    'ws_manager',
    'get_ws_manager',
    'db',
    'get_current_user',
    'get_user_cashback_rate',
    'get_user_plan',
    'TITELLI_FEES',
    'PREMIUM_PLANS',
    'hash_password',
    'verify_password',
    'create_token'
]
