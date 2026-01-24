"""
Stripe Helper - Native Stripe implementation to replace emergentintegrations
"""
import stripe
import os
from dataclasses import dataclass
from typing import List, Optional, Dict, Any

@dataclass
class CheckoutSessionRequest:
    line_items: List[Dict[str, Any]]
    mode: str
    success_url: str
    cancel_url: str
    metadata: Optional[Dict[str, str]] = None
    customer_email: Optional[str] = None

@dataclass
class CheckoutSessionResponse:
    id: str
    url: str
    status: str
    payment_status: str

@dataclass
class CheckoutStatusResponse:
    id: str
    status: str
    payment_status: str
    amount_total: int
    currency: str

class StripeCheckout:
    def __init__(self, api_key: str, webhook_url: str = ""):
        self.api_key = api_key
        self.webhook_url = webhook_url
        stripe.api_key = api_key
    
    async def create_session(self, request: CheckoutSessionRequest) -> CheckoutSessionResponse:
        """Create a Stripe checkout session."""
        try:
            session_params = {
                "line_items": request.line_items,
                "mode": request.mode,
                "success_url": request.success_url,
                "cancel_url": request.cancel_url,
            }
            
            if request.metadata:
                session_params["metadata"] = request.metadata
            
            if request.customer_email:
                session_params["customer_email"] = request.customer_email
            
            session = stripe.checkout.Session.create(**session_params)
            
            return CheckoutSessionResponse(
                id=session.id,
                url=session.url,
                status=session.status,
                payment_status=session.payment_status or "unpaid"
            )
        except Exception as e:
            raise Exception(f"Stripe session creation failed: {str(e)}")
    
    async def get_session_status(self, session_id: str) -> CheckoutStatusResponse:
        """Get the status of a checkout session."""
        try:
            session = stripe.checkout.Session.retrieve(session_id)
            
            return CheckoutStatusResponse(
                id=session.id,
                status=session.status,
                payment_status=session.payment_status or "unknown",
                amount_total=session.amount_total or 0,
                currency=session.currency or "chf"
            )
        except Exception as e:
            raise Exception(f"Failed to get session status: {str(e)}")
    
    def create_session_sync(self, request: CheckoutSessionRequest) -> CheckoutSessionResponse:
        """Synchronous version of create_session."""
        try:
            session_params = {
                "line_items": request.line_items,
                "mode": request.mode,
                "success_url": request.success_url,
                "cancel_url": request.cancel_url,
            }
            
            if request.metadata:
                session_params["metadata"] = request.metadata
            
            if request.customer_email:
                session_params["customer_email"] = request.customer_email
            
            session = stripe.checkout.Session.create(**session_params)
            
            return CheckoutSessionResponse(
                id=session.id,
                url=session.url,
                status=session.status,
                payment_status=session.payment_status or "unpaid"
            )
        except Exception as e:
            raise Exception(f"Stripe session creation failed: {str(e)}")
