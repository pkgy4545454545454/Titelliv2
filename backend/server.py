from fastapi import FastAPI, APIRouter, HTTPException, Depends, Request, Header, UploadFile, File
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import random
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone, timedelta
import bcrypt
import jwt
import shutil
import base64
from emergentintegrations.payments.stripe.checkout import StripeCheckout, CheckoutSessionResponse, CheckoutStatusResponse, CheckoutSessionRequest

ROOT_DIR = Path(__file__).parent
UPLOADS_DIR = ROOT_DIR / "uploads"
UPLOADS_DIR.mkdir(exist_ok=True)

load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT Config
JWT_SECRET = os.environ.get('JWT_SECRET', 'titelli_jwt_secret_key_2024')
JWT_ALGORITHM = "HS256"

# Stripe Config
STRIPE_API_KEY = os.environ.get('STRIPE_API_KEY')

# Create the main app
app = FastAPI(title="Titelli API", version="1.0.0")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# ============ MODELS ============

# User Models
class UserBase(BaseModel):
    email: EmailStr
    first_name: str
    last_name: str
    phone: Optional[str] = None
    user_type: str = Field(..., description="'client' or 'entreprise'")

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class User(UserBase):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    cashback_balance: float = 0.0
    is_premium: bool = False
    is_verified: bool = False
    is_certified: bool = False
    is_labeled: bool = False
    profile_image: Optional[str] = None
    address: Optional[str] = None
    city: str = "Lausanne"

class UserResponse(BaseModel):
    id: str
    email: str
    first_name: str
    last_name: str
    phone: Optional[str]
    user_type: str
    cashback_balance: float
    is_premium: bool
    is_verified: bool
    is_certified: bool
    is_labeled: bool
    profile_image: Optional[str]
    city: str

# Enterprise Profile Models
class EnterpriseProfile(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    business_name: str
    slogan: Optional[str] = None
    description: str
    category: str
    subcategory: Optional[str] = None
    address: str
    city: str = "Lausanne"
    phone: str
    email: EmailStr
    website: Optional[str] = None
    logo: Optional[str] = None
    cover_image: Optional[str] = None
    photos: List[str] = []
    videos: List[str] = []
    opening_hours: Optional[Dict[str, str]] = None
    is_certified: bool = False
    is_labeled: bool = False
    is_premium: bool = False
    rating: float = 0.0
    review_count: int = 0
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class EnterpriseCreate(BaseModel):
    business_name: str
    slogan: Optional[str] = None
    description: str
    category: str
    subcategory: Optional[str] = None
    address: str
    phone: str
    email: EmailStr
    website: Optional[str] = None

# Service/Product Models
class ServiceProduct(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    enterprise_id: str
    name: str
    description: str
    price: float
    currency: str = "CHF"
    category: str
    type: str = Field(..., description="'service' or 'product'")
    images: List[str] = []
    is_available: bool = True
    is_premium: bool = False
    is_delivery: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ServiceProductCreate(BaseModel):
    name: str
    description: str
    price: float
    category: str
    type: str
    images: List[str] = []
    is_delivery: bool = False

# Review Models
class Review(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    enterprise_id: str
    user_id: str
    user_name: str
    rating: int = Field(..., ge=1, le=5)
    comment: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ReviewCreate(BaseModel):
    enterprise_id: str
    rating: int = Field(..., ge=1, le=5)
    comment: str

# IA Marketing Models
class IACampaign(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    enterprise_id: str
    name: str
    age_range: str = "25-45"
    gender: str = "all"
    interests: List[str] = []
    behavior: List[str] = []
    location: str = "lausanne"
    budget: str = "medium"
    status: str = "active"
    reach: int = 0
    engagement: int = 0
    conversions: int = 0
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class IACampaignCreate(BaseModel):
    name: str
    age_range: str = "25-45"
    gender: str = "all"
    interests: List[str] = []
    behavior: List[str] = []
    location: str = "lausanne"
    budget: str = "medium"

class Influencer(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    image: str
    category: str
    followers: int
    engagement_rate: float
    price: float
    bio: Optional[str] = None
    instagram: Optional[str] = None
    is_available: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class InfluencerCollaboration(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    enterprise_id: str
    influencer_id: str
    status: str = "pending"  # pending, active, completed, cancelled
    message: Optional[str] = None
    budget: float = 0
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ClientInvitation(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    enterprise_id: str
    type: str = "question"  # question, invitation, survey, reminder
    title: str
    message: str
    target_audience: str = "all"
    incentive: Optional[str] = None
    sent_count: int = 0
    opened_count: int = 0
    response_count: int = 0
    status: str = "active"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ClientInvitationCreate(BaseModel):
    type: str = "question"
    title: str
    message: str
    target_audience: str = "all"
    incentive: Optional[str] = None

class CommercialGesture(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    enterprise_id: str
    offer_type: str  # percentage, fixed_amount, free_service, free_product
    value: float
    conditions: Optional[str] = None
    is_active: bool = True
    uses_count: int = 0
    max_uses: Optional[int] = None
    valid_until: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class CommercialGestureCreate(BaseModel):
    offer_type: str
    value: float
    conditions: Optional[str] = None
    max_uses: Optional[int] = None
    valid_until: Optional[str] = None

# Order Models
class OrderItem(BaseModel):
    service_product_id: str
    name: str
    price: float
    quantity: int

class Order(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    enterprise_id: str
    items: List[OrderItem]
    total: float
    status: str = "pending"
    payment_status: str = "pending"
    stripe_session_id: Optional[str] = None
    delivery_address: Optional[str] = None
    notes: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class OrderCreate(BaseModel):
    enterprise_id: str
    items: List[OrderItem]
    delivery_address: Optional[str] = None
    notes: Optional[str] = None

# Subscription Plans - Forfaits principaux
SUBSCRIPTION_PLANS = {
    "standard": {
        "name": "Standard",
        "price": 200.0,
        "duration_months": 1,
        "features": [
            "Exposition standard",
            "Une publication mensuelle",
            "Système de Cash-Back",
            "Système de gestion des stocks"
        ],
        "tier": "basic"
    },
    "guest": {
        "name": "Guest",
        "price": 250.0,
        "duration_months": 1,
        "features": [
            "Profil prestataire professionnel",
            "Référencement préférentiel",
            "Publication d'offres illimitées",
            "Système de Cash-Back",
            "Système de gestion des stocks"
        ],
        "tier": "basic"
    },
    "premium": {
        "name": "Premium",
        "price": 500.0,
        "duration_months": 1,
        "features": [
            "Profil prestataire professionnel",
            "4 Publicités par mois",
            "Accessible aux investisseurs",
            "Accessible aux livraisons 24/24",
            "Référencement préférentiel",
            "Publication d'offres illimitées",
            "Système de Cash-Back",
            "Système de gestion des stocks",
            "Système gestion du personnel"
        ],
        "tier": "premium"
    },
    "premium_mvp": {
        "name": "Premium MVP",
        "price": 1000.0,
        "duration_months": 1,
        "features": [
            "Profil prestataire professionnel",
            "5 Publicités média par mois",
            "1 Publicité vidéo par mois",
            "Accessible aux investisseurs",
            "Accessible aux livraisons 24/24",
            "Accès aux fournisseurs",
            "Accès au local 24/24",
            "Référencement préférentiel",
            "Publication d'offres illimitées",
            "Système de Cash-Back",
            "Système de gestion des stocks",
            "Système gestion du personnel"
        ],
        "tier": "premium"
    },
    "opti_starter_2k": {
        "name": "Optimisation d'entreprise Starter",
        "price": 2000.0,
        "duration_months": 1,
        "features": [
            "Profil prestataire professionnel",
            "8 Publicités média par mois",
            "1 Publicité vidéo par mois",
            "Accessible aux investisseurs",
            "Accessible aux livraisons 24/24",
            "Accès aux fournisseurs",
            "Accès au local 24/24",
            "Accès aux formations premium",
            "Accès aux recrutements",
            "Accès à l'espace immobilier",
            "Un expert offre des conseils d'optimisation d'entreprise",
            "Un expert vous labellise",
            "Référencement préférentiel",
            "Publication d'offres illimitées",
            "Système de Cash-Back",
            "Système de gestion des stocks",
            "Système gestion du personnel"
        ],
        "tier": "optimisation"
    },
    "opti_starter_3k": {
        "name": "Optimisation d'entreprise Starter+",
        "price": 3000.0,
        "duration_months": 1,
        "features": [
            "Profil prestataire professionnel",
            "15 Publicités à choix par mois",
            "2 Publicités vidéos par mois",
            "Accessible aux investisseurs",
            "Accessible aux livraisons 24/24",
            "Accès aux fournisseurs",
            "Accès au local 24/24",
            "Accès aux formations premium",
            "Accès aux recrutements",
            "Accès à l'espace immobilier",
            "Un expert offre des conseils d'optimisation d'entreprise",
            "Un expert vous labellise",
            "Référencement préférentiel",
            "5h Prestation service entreprise OU 2 déjeuners d'équipe (10 pers.)",
            "Publication d'offres illimitées",
            "Système de Cash-Back",
            "Système de gestion des stocks",
            "Système gestion du personnel"
        ],
        "tier": "optimisation"
    },
    "opti_5k": {
        "name": "Optimisation d'entreprise 5K",
        "price": 5000.0,
        "duration_months": 1,
        "features": [
            "Profil prestataire professionnel",
            "15 Publicités à choix par mois",
            "2 Publicités vidéos par mois",
            "Accessible aux investisseurs",
            "Accessible aux livraisons 24/24",
            "Accès aux fournisseurs",
            "Accès au local 24/24",
            "Accès aux formations premium",
            "Accès aux recrutements",
            "Accès à l'espace immobilier",
            "Un expert offre des conseils d'optimisation d'entreprise",
            "Un expert vous labellise",
            "Référencement préférentiel",
            "10h Prestation service entreprise OU 5 déjeuners d'équipe (10 pers.)",
            "3'000 CHF de prestations liquidées par nos équipes",
            "Publication d'offres illimitées",
            "Système de Cash-Back",
            "Système de gestion des stocks",
            "Système gestion du personnel"
        ],
        "tier": "optimisation"
    },
    "opti_10k": {
        "name": "Optimisation d'entreprise 10K",
        "price": 10000.0,
        "duration_months": 1,
        "features": [
            "Profil prestataire professionnel",
            "15 Publicités à choix par mois",
            "2 Publicités vidéos par mois",
            "Accessible aux investisseurs",
            "Accessible aux livraisons 24/24",
            "Accès aux fournisseurs",
            "Accès au local 24/24",
            "Accès aux formations premium",
            "Accès aux recrutements",
            "Accès à l'espace immobilier",
            "Un expert offre des conseils d'optimisation d'entreprise",
            "Un expert vous labellise",
            "Référencement préférentiel",
            "20h Prestation service entreprise OU 8 déjeuners d'équipe (10 pers.)",
            "7'000 CHF de prestations liquidées par nos équipes",
            "Fiscaliste inclus",
            "Publication d'offres illimitées",
            "Système de Cash-Back",
            "Système de gestion des stocks",
            "Système gestion du personnel"
        ],
        "tier": "optimisation"
    },
    "opti_20k": {
        "name": "Optimisation d'entreprise 20K",
        "price": 20000.0,
        "duration_months": 1,
        "features": [
            "Profil prestataire professionnel",
            "25 Publicités à choix par mois",
            "4 Publicités vidéos par mois",
            "Accessible aux investisseurs",
            "Accessible aux livraisons 24/24",
            "Accès au local 24/24",
            "Accès aux formations premium",
            "Accès aux recrutements",
            "Accès à l'espace immobilier",
            "Un expert offre des conseils d'optimisation d'entreprise",
            "Un expert vous labellise",
            "Référencement préférentiel",
            "40h Prestation service entreprise OU 20 déjeuners d'équipe (10 pers.)",
            "15'000 CHF de prestations liquidées par nos équipes",
            "Fiscaliste inclus",
            "Publication d'offres illimitées",
            "Système de Cash-Back",
            "Système de gestion des stocks",
            "Système gestion du personnel"
        ],
        "tier": "optimisation"
    },
    "opti_50k": {
        "name": "Optimisation d'entreprise 50K",
        "price": 50000.0,
        "duration_months": 1,
        "features": [
            "Profil prestataire professionnel",
            "25 Publicités à choix par mois",
            "4 Publicités vidéos par mois",
            "Accessible aux investisseurs",
            "Accessible aux livraisons 24/24",
            "Accès au local 24/24",
            "Accès aux formations premium",
            "Accès aux recrutements",
            "Accès à l'espace immobilier",
            "Un expert offre des conseils d'optimisation d'entreprise",
            "Un expert vous labellise",
            "Référencement préférentiel",
            "80h Prestation service entreprise OU 40 déjeuners d'équipe (10 pers.)",
            "40'000 CHF de prestations liquidées par nos équipes",
            "Fiscaliste inclus",
            "Publication d'offres illimitées",
            "Système de Cash-Back",
            "Système de gestion des stocks",
            "Système gestion du personnel"
        ],
        "tier": "optimisation"
    }
}

# Options à la carte (add-ons)
ADDON_OPTIONS = {
    "pub_extra": {
        "name": "2 Publicités + 1 vidéo",
        "price": 200.0,
        "type": "monthly"
    },
    "expert_label": {
        "name": "Expert labellisation",
        "price": 400.0,
        "type": "one_time"
    },
    "investors_access": {
        "name": "Accessible aux investisseurs",
        "price": 300.0,
        "type": "monthly"
    },
    "delivery_24": {
        "name": "Livraison 24/24",
        "price": 300.0,
        "type": "monthly"
    },
    "local_access": {
        "name": "Accès au local 24/24",
        "price": 300.0,
        "type": "monthly"
    },
    "suppliers_access": {
        "name": "Accès aux fournisseurs",
        "price": 500.0,
        "type": "monthly"
    },
    "premium_trainings": {
        "name": "Formations premium",
        "price": 200.0,
        "type": "monthly"
    },
    "instant_recruitment": {
        "name": "Recrutement instantané",
        "price": 200.0,
        "type": "monthly"
    },
    "real_estate_access": {
        "name": "Accès espace immobilier",
        "price": 200.0,
        "type": "monthly"
    },
    "expert_conseil": {
        "name": "Expert conseil optimisation",
        "price": 1000.0,
        "type": "monthly"
    },
    "fiscaliste": {
        "name": "Fiscaliste",
        "price": 4000.0,
        "type": "monthly"
    },
    "prestation_20h": {
        "name": "20h Prestation service entreprise",
        "price": 1000.0,
        "type": "one_time"
    },
    "dejeuner_equipe": {
        "name": "20 déjeuners d'équipe (10 pers.)",
        "price": 2000.0,
        "type": "one_time"
    },
    "prestation_liquidee": {
        "name": "800 CHF de prestations liquidées",
        "price": 1000.0,
        "type": "monthly"
    }
}

# Features incluses dans tous les forfaits
BASE_FEATURES = [
    "Fiches exigences clients",
    "Calendrier client",
    "Agenda interne",
    "Espace de formation",
    "Espace documents",
    "Espace finance",
    "Accès aux publicités spontanées en tout temps",
    "Accès à l'espace messagerie",
    "Accès au fil d'actualités clients",
    "Accès au feed des entreprises régionales",
    "Accès à ses contacts"
]

# Advertising Plans
AD_PLANS = {
    "pub_flash_offres": {"name": "Pub Flash - Offres du moment", "min_price": 10.0, "max_price": 1000.0},
    "pub_flash_certifies": {"name": "Pub Flash - Certifiés", "min_price": 20.0, "max_price": 1000.0},
    "pub_flash_labellises": {"name": "Pub Flash - Labellisés", "min_price": 30.0, "max_price": 2000.0},
    "pub_flash_domaine": {"name": "Pub Flash - Son domaine", "min_price": 10.0, "max_price": 1000.0},
    "pub_flash_guests": {"name": "Pub Flash - Guests", "min_price": 10.0, "max_price": 1000.0},
    "pub_flash_tendances": {"name": "Pub Flash - Tendances actuelles", "min_price": 20.0, "max_price": 1000.0},
    "pub_expert_standard": {"name": "Pub Expert Standard", "price": 300.0, "duration": "annual"},
    "pub_expert_premium": {"name": "Pub Expert Premium", "price": 1000.0, "duration": "annual"},
    "pub_referencement": {"name": "Pub Référencement", "min_price": 10.0, "max_price": 1000.0},
}

# Categories
PRODUCT_CATEGORIES = [
    {"id": "courses_alimentaires", "name": "Courses alimentaires", "icon": "shopping-cart"},
    {"id": "vetements_mode", "name": "Vêtements et accessoires de mode", "icon": "shirt"},
    {"id": "enfant", "name": "Tout pour mon enfant", "icon": "baby"},
    {"id": "soins", "name": "Matériel de soins", "icon": "heart"},
    {"id": "maquillage_beaute", "name": "Maquillage et beauté", "icon": "sparkles"},
    {"id": "sport", "name": "Matériel de sport", "icon": "dumbbell"},
    {"id": "loisirs", "name": "Matériel de loisirs", "icon": "gamepad-2"},
    {"id": "voyages", "name": "Nécessaire voyages", "icon": "plane"},
    {"id": "electronique", "name": "Appareils électroniques", "icon": "smartphone"},
    {"id": "bureautique", "name": "Matériel de bureautique", "icon": "printer"},
    {"id": "electromenager", "name": "Appareils électroménager", "icon": "refrigerator"},
    {"id": "ameublement_deco", "name": "Ameublement et décoration d'intérieur", "icon": "sofa"},
    {"id": "artisanal", "name": "Matériel artisanal", "icon": "hammer"},
    {"id": "bricolage_jardinage", "name": "Matériel de bricolage et jardinage", "icon": "wrench"},
    {"id": "immobilier", "name": "Acheter un bien immobilier", "icon": "home"},
    {"id": "automobiles", "name": "Automobiles", "icon": "car"},
    {"id": "securite", "name": "Matériel de sécurité", "icon": "shield"},
    {"id": "animaux", "name": "Matériel animaux", "icon": "paw-print"},
    {"id": "professionnel", "name": "Matériel professionnel", "icon": "briefcase"},
    {"id": "metaux_precieux", "name": "Métaux précieux et matières premières", "icon": "gem"},
    {"id": "haute_joaillerie", "name": "Haute joaillerie", "icon": "crown"},
    {"id": "montres", "name": "Montres", "icon": "watch"},
]

SERVICE_CATEGORIES = [
    {"id": "restauration", "name": "Restauration", "icon": "utensils"},
    {"id": "soins_esthetiques", "name": "Soins esthétiques", "icon": "sparkles"},
    {"id": "coiffure_barber", "name": "Visagiste, coiffeur ou barber", "icon": "scissors"},
    {"id": "cours_sport", "name": "Cours de sport", "icon": "dumbbell"},
    {"id": "activites_loisirs", "name": "Activités, Loisirs et Évènements", "icon": "calendar"},
    {"id": "nettoyage", "name": "Personnel de nettoyage", "icon": "spray-can"},
    {"id": "multiservices", "name": "Agent multiservices", "icon": "wrench"},
    {"id": "petits_travaux", "name": "Spécialiste petits travaux", "icon": "hammer"},
    {"id": "garagiste", "name": "Garagiste", "icon": "car"},
    {"id": "plombier", "name": "Plombier", "icon": "droplet"},
    {"id": "serrurier", "name": "Serrurier", "icon": "key"},
    {"id": "electricien", "name": "Électricien", "icon": "zap"},
    {"id": "formation", "name": "Formation maintenant", "icon": "graduation-cap"},
    {"id": "emploi", "name": "Emploi maintenant", "icon": "briefcase"},
    {"id": "sante", "name": "Professionnel de la santé", "icon": "stethoscope"},
    {"id": "voyages", "name": "Les meilleurs voyages", "icon": "plane"},
    {"id": "agent_immobilier", "name": "Agent immobilier", "icon": "home"},
    {"id": "expert_tech", "name": "Expert en technologie", "icon": "laptop"},
    {"id": "agent_securite", "name": "Agent de sécurité", "icon": "shield"},
    {"id": "expert_fiscal", "name": "Expert fiscal", "icon": "calculator"},
    {"id": "expert_juridique", "name": "Expert juridique", "icon": "scale"},
    {"id": "gestion_admin", "name": "Professionnel en gestion administrative", "icon": "file-text"},
    {"id": "construction", "name": "Professionnel de la construction", "icon": "building"},
    {"id": "autres_maison", "name": "Professionnels autres de maison", "icon": "home"},
    {"id": "veterinaire", "name": "Vétérinaire", "icon": "paw-print"},
]

# ============ HELPER FUNCTIONS ============

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_token(user_id: str, user_type: str) -> str:
    payload = {
        "user_id": user_id,
        "user_type": user_type,
        "exp": datetime.now(timezone.utc).timestamp() + 86400 * 7  # 7 days
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def decode_token(token: str) -> dict:
    try:
        return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expiré")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Token invalide")

# Helper function to create order notifications
async def create_order_notification(enterprise_id: str, order_id: str, client_name: str, total: float):
    enterprise = await db.enterprises.find_one({"id": enterprise_id})
    if enterprise:
        notification_doc = {
            "id": str(uuid.uuid4()),
            "user_id": enterprise['user_id'],
            "sender_id": "system",
            "title": "Nouvelle commande !",
            "message": f"Vous avez reçu une nouvelle commande de {client_name} pour {total:.2f} CHF",
            "notification_type": "order",
            "link": f"/enterprise-dashboard?tab=orders&order={order_id}",
            "data": {"order_id": order_id, "total": total},
            "is_read": False,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.notifications.insert_one(notification_doc)


async def get_current_user(authorization: Optional[str] = Header(None)) -> dict:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Non authentifié")
    token = authorization.split(" ")[1]
    payload = decode_token(token)
    user = await db.users.find_one({"id": payload["user_id"]}, {"_id": 0, "password": 0})
    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")
    return user

# ============ AUTH ROUTES ============

@api_router.post("/auth/register")
async def register(user_data: UserCreate):
    existing = await db.users.find_one({"email": user_data.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email déjà utilisé")
    
    user = User(
        email=user_data.email,
        first_name=user_data.first_name,
        last_name=user_data.last_name,
        phone=user_data.phone,
        user_type=user_data.user_type
    )
    user_dict = user.model_dump()
    user_dict['password'] = hash_password(user_data.password)
    user_dict['created_at'] = user_dict['created_at'].isoformat()
    
    await db.users.insert_one(user_dict)
    
    token = create_token(user.id, user.user_type)
    return {"token": token, "user": UserResponse(**user_dict)}

@api_router.post("/auth/login")
async def login(credentials: UserLogin):
    user = await db.users.find_one({"email": credentials.email}, {"_id": 0})
    if not user or not verify_password(credentials.password, user['password']):
        raise HTTPException(status_code=401, detail="Email ou mot de passe incorrect")
    
    token = create_token(user['id'], user['user_type'])
    user_response = {k: v for k, v in user.items() if k != 'password'}
    return {"token": token, "user": user_response}

@api_router.get("/auth/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    return current_user

# ============ ENTERPRISE ROUTES ============

@api_router.post("/enterprises")
async def create_enterprise(data: EnterpriseCreate, current_user: dict = Depends(get_current_user)):
    if current_user['user_type'] != 'entreprise':
        raise HTTPException(status_code=403, detail="Seules les entreprises peuvent créer un profil")
    
    existing = await db.enterprises.find_one({"user_id": current_user['id']})
    if existing:
        raise HTTPException(status_code=400, detail="Profil entreprise déjà existant")
    
    enterprise = EnterpriseProfile(
        user_id=current_user['id'],
        **data.model_dump()
    )
    enterprise_dict = enterprise.model_dump()
    enterprise_dict['created_at'] = enterprise_dict['created_at'].isoformat()
    
    # Insert and return without _id
    insert_doc = enterprise_dict.copy()
    await db.enterprises.insert_one(insert_doc)
    return enterprise_dict

@api_router.get("/enterprises")
async def list_enterprises(
    category: Optional[str] = None,
    is_certified: Optional[bool] = None,
    is_labeled: Optional[bool] = None,
    is_premium: Optional[bool] = None,
    search: Optional[str] = None,
    limit: int = 50,
    skip: int = 0
):
    query = {}
    if category:
        query["category"] = category
    if is_certified is not None:
        query["is_certified"] = is_certified
    if is_labeled is not None:
        query["is_labeled"] = is_labeled
    if is_premium is not None:
        query["is_premium"] = is_premium
    if search:
        query["$or"] = [
            {"business_name": {"$regex": search, "$options": "i"}},
            {"description": {"$regex": search, "$options": "i"}}
        ]
    
    enterprises = await db.enterprises.find(query, {"_id": 0}).skip(skip).limit(limit).to_list(limit)
    total = await db.enterprises.count_documents(query)
    return {"enterprises": enterprises, "total": total}

@api_router.get("/enterprises/{enterprise_id}")
async def get_enterprise(enterprise_id: str):
    enterprise = await db.enterprises.find_one({"id": enterprise_id}, {"_id": 0})
    if not enterprise:
        raise HTTPException(status_code=404, detail="Entreprise non trouvée")
    
    # Get services/products
    services = await db.services_products.find({"enterprise_id": enterprise_id}, {"_id": 0}).to_list(100)
    
    # Get reviews
    reviews = await db.reviews.find({"enterprise_id": enterprise_id}, {"_id": 0}).sort("created_at", -1).to_list(50)
    
    return {**enterprise, "services": services, "reviews": reviews}

@api_router.put("/enterprises/{enterprise_id}")
async def update_enterprise(enterprise_id: str, data: dict, current_user: dict = Depends(get_current_user)):
    enterprise = await db.enterprises.find_one({"id": enterprise_id})
    if not enterprise:
        raise HTTPException(status_code=404, detail="Entreprise non trouvée")
    if enterprise['user_id'] != current_user['id']:
        raise HTTPException(status_code=403, detail="Non autorisé")
    
    data.pop('id', None)
    data.pop('user_id', None)
    data.pop('created_at', None)
    
    await db.enterprises.update_one({"id": enterprise_id}, {"$set": data})
    return {"message": "Profil mis à jour"}

# ============ SERVICES/PRODUCTS ROUTES ============

@api_router.post("/services-products")
async def create_service_product(data: ServiceProductCreate, current_user: dict = Depends(get_current_user)):
    enterprise = await db.enterprises.find_one({"user_id": current_user['id']})
    if not enterprise:
        raise HTTPException(status_code=404, detail="Créez d'abord un profil entreprise")
    
    item = ServiceProduct(
        enterprise_id=enterprise['id'],
        **data.model_dump()
    )
    item_dict = item.model_dump()
    item_dict['created_at'] = item_dict['created_at'].isoformat()
    
    insert_doc = item_dict.copy()
    await db.services_products.insert_one(insert_doc)
    return item_dict

@api_router.get("/services-products")
async def list_services_products(
    type: Optional[str] = None,
    category: Optional[str] = None,
    enterprise_id: Optional[str] = None,
    is_premium: Optional[bool] = None,
    limit: int = 50,
    skip: int = 0
):
    query = {"is_available": True}
    if type:
        query["type"] = type
    if category:
        query["category"] = category
    if enterprise_id:
        query["enterprise_id"] = enterprise_id
    if is_premium is not None:
        query["is_premium"] = is_premium
    
    items = await db.services_products.find(query, {"_id": 0}).skip(skip).limit(limit).to_list(limit)
    total = await db.services_products.count_documents(query)
    return {"items": items, "total": total}

@api_router.get("/services-products/{item_id}")
async def get_service_product(item_id: str):
    item = await db.services_products.find_one({"id": item_id}, {"_id": 0})
    if not item:
        raise HTTPException(status_code=404, detail="Service/Produit non trouvé")
    return item

@api_router.put("/services-products/{item_id}")
async def update_service_product(item_id: str, data: dict, current_user: dict = Depends(get_current_user)):
    item = await db.services_products.find_one({"id": item_id})
    if not item:
        raise HTTPException(status_code=404, detail="Service/Produit non trouvé")
    
    enterprise = await db.enterprises.find_one({"id": item['enterprise_id']})
    if enterprise['user_id'] != current_user['id']:
        raise HTTPException(status_code=403, detail="Non autorisé")
    
    data.pop('id', None)
    data.pop('enterprise_id', None)
    data.pop('created_at', None)
    
    await db.services_products.update_one({"id": item_id}, {"$set": data})
    return {"message": "Mis à jour avec succès"}

@api_router.delete("/services-products/{item_id}")
async def delete_service_product(item_id: str, current_user: dict = Depends(get_current_user)):
    item = await db.services_products.find_one({"id": item_id})
    if not item:
        raise HTTPException(status_code=404, detail="Service/Produit non trouvé")
    
    enterprise = await db.enterprises.find_one({"id": item['enterprise_id']})
    if enterprise['user_id'] != current_user['id']:
        raise HTTPException(status_code=403, detail="Non autorisé")
    
    await db.services_products.delete_one({"id": item_id})
    return {"message": "Supprimé avec succès"}

# ============ REVIEWS ROUTES ============

@api_router.post("/reviews")
async def create_review(data: ReviewCreate, current_user: dict = Depends(get_current_user)):
    enterprise = await db.enterprises.find_one({"id": data.enterprise_id})
    if not enterprise:
        raise HTTPException(status_code=404, detail="Entreprise non trouvée")
    
    review = Review(
        enterprise_id=data.enterprise_id,
        user_id=current_user['id'],
        user_name=f"{current_user['first_name']} {current_user['last_name']}",
        rating=data.rating,
        comment=data.comment
    )
    review_dict = review.model_dump()
    review_dict['created_at'] = review_dict['created_at'].isoformat()
    
    insert_doc = review_dict.copy()
    await db.reviews.insert_one(insert_doc)
    
    # Update enterprise rating
    all_reviews = await db.reviews.find({"enterprise_id": data.enterprise_id}).to_list(1000)
    avg_rating = sum(r['rating'] for r in all_reviews) / len(all_reviews)
    await db.enterprises.update_one(
        {"id": data.enterprise_id},
        {"$set": {"rating": round(avg_rating, 1), "review_count": len(all_reviews)}}
    )
    
    return review_dict

@api_router.get("/reviews/{enterprise_id}")
async def get_reviews(enterprise_id: str, limit: int = 50, skip: int = 0):
    reviews = await db.reviews.find(
        {"enterprise_id": enterprise_id}, {"_id": 0}
    ).sort("created_at", -1).skip(skip).limit(limit).to_list(limit)
    return reviews

# ============ ORDERS ROUTES ============

@api_router.post("/orders")
async def create_order(data: OrderCreate, current_user: dict = Depends(get_current_user)):
    total = sum(item.price * item.quantity for item in data.items)
    
    order = Order(
        user_id=current_user['id'],
        enterprise_id=data.enterprise_id,
        items=[item.model_dump() for item in data.items],
        total=total,
        delivery_address=data.delivery_address,
        notes=data.notes
    )
    order_dict = order.model_dump()
    order_dict['created_at'] = order_dict['created_at'].isoformat()
    
    insert_doc = order_dict.copy()
    await db.orders.insert_one(insert_doc)
    
    # Create notification for the enterprise
    client_name = f"{current_user['first_name']} {current_user['last_name']}"
    await create_order_notification(data.enterprise_id, order_dict['id'], client_name, total)
    
    return order_dict

@api_router.get("/orders")
async def get_orders(current_user: dict = Depends(get_current_user)):
    if current_user['user_type'] == 'entreprise':
        enterprise = await db.enterprises.find_one({"user_id": current_user['id']})
        if enterprise:
            orders = await db.orders.find({"enterprise_id": enterprise['id']}, {"_id": 0}).sort("created_at", -1).to_list(100)
        else:
            orders = []
    else:
        orders = await db.orders.find({"user_id": current_user['id']}, {"_id": 0}).sort("created_at", -1).to_list(100)
    return orders

@api_router.put("/orders/{order_id}/status")
async def update_order_status(order_id: str, status: str, current_user: dict = Depends(get_current_user)):
    order = await db.orders.find_one({"id": order_id})
    if not order:
        raise HTTPException(status_code=404, detail="Commande non trouvée")
    
    await db.orders.update_one({"id": order_id}, {"$set": {"status": status}})
    return {"message": "Statut mis à jour"}

# ============ PAYMENT ROUTES ============

@api_router.post("/payments/checkout")
async def create_checkout(
    request: Request,
    package_type: str,
    amount: Optional[float] = None,
    current_user: dict = Depends(get_current_user)
):
    host_url = str(request.base_url).rstrip('/')
    webhook_url = f"{host_url}/api/webhook/stripe"
    
    stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url=webhook_url)
    
    # Determine amount based on package
    if package_type in SUBSCRIPTION_PLANS:
        final_amount = SUBSCRIPTION_PLANS[package_type]['price']
        metadata = {"type": "subscription", "plan": package_type, "user_id": current_user['id']}
    elif package_type in AD_PLANS:
        if amount is None:
            raise HTTPException(status_code=400, detail="Montant requis pour ce type de publicité")
        plan = AD_PLANS[package_type]
        if 'price' in plan:
            final_amount = plan['price']
        else:
            if amount < plan['min_price'] or amount > plan['max_price']:
                raise HTTPException(status_code=400, detail=f"Montant doit être entre {plan['min_price']} et {plan['max_price']} CHF")
            final_amount = amount
        metadata = {"type": "advertising", "plan": package_type, "user_id": current_user['id']}
    elif package_type == "order":
        if amount is None:
            raise HTTPException(status_code=400, detail="Montant requis")
        final_amount = amount
        metadata = {"type": "order", "user_id": current_user['id']}
    else:
        raise HTTPException(status_code=400, detail="Type de package invalide")
    
    # Get frontend origin from referer or use base_url
    origin = request.headers.get('origin', host_url.replace('/api', ''))
    success_url = f"{origin}/payment/success?session_id={{CHECKOUT_SESSION_ID}}"
    cancel_url = f"{origin}/payment/cancel"
    
    checkout_request = CheckoutSessionRequest(
        amount=float(final_amount),
        currency="chf",
        success_url=success_url,
        cancel_url=cancel_url,
        metadata=metadata
    )
    
    session = await stripe_checkout.create_checkout_session(checkout_request)
    
    # Store transaction
    transaction = {
        "id": str(uuid.uuid4()),
        "session_id": session.session_id,
        "user_id": current_user['id'],
        "amount": final_amount,
        "currency": "CHF",
        "type": package_type,
        "metadata": metadata,
        "payment_status": "pending",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.payment_transactions.insert_one(transaction)
    
    return {"url": session.url, "session_id": session.session_id}

@api_router.get("/payments/status/{session_id}")
async def get_payment_status(session_id: str, request: Request):
    host_url = str(request.base_url).rstrip('/')
    webhook_url = f"{host_url}/api/webhook/stripe"
    
    stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url=webhook_url)
    status = await stripe_checkout.get_checkout_status(session_id)
    
    # Update transaction status
    transaction = await db.payment_transactions.find_one({"session_id": session_id})
    if transaction and transaction['payment_status'] != status.payment_status:
        await db.payment_transactions.update_one(
            {"session_id": session_id},
            {"$set": {"payment_status": status.payment_status, "status": status.status}}
        )
        
        # If payment successful, apply benefits
        if status.payment_status == "paid" and transaction['payment_status'] != "paid":
            metadata = transaction.get('metadata', {})
            user_id = metadata.get('user_id')
            
            if metadata.get('type') == 'subscription':
                plan = metadata.get('plan')
                is_premium = 'premium' in plan
                await db.users.update_one(
                    {"id": user_id},
                    {"$set": {"is_premium": is_premium, "is_verified": True}}
                )
    
    return {
        "status": status.status,
        "payment_status": status.payment_status,
        "amount_total": status.amount_total,
        "currency": status.currency
    }

@api_router.post("/webhook/stripe")
async def stripe_webhook(request: Request):
    body = await request.body()
    signature = request.headers.get("Stripe-Signature")
    
    host_url = str(request.base_url).rstrip('/')
    webhook_url = f"{host_url}/api/webhook/stripe"
    
    stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url=webhook_url)
    
    try:
        webhook_response = await stripe_checkout.handle_webhook(body, signature)
        logger.info(f"Webhook received: {webhook_response.event_type}")
        
        if webhook_response.payment_status == "paid":
            await db.payment_transactions.update_one(
                {"session_id": webhook_response.session_id},
                {"$set": {"payment_status": "paid", "status": "complete"}}
            )
        
        return {"received": True}
    except Exception as e:
        logger.error(f"Webhook error: {str(e)}")
        return {"received": True}

# ============ CATEGORIES ROUTES ============

@api_router.get("/categories/products")
async def get_product_categories():
    return PRODUCT_CATEGORIES

@api_router.get("/categories/services")
async def get_service_categories():
    return SERVICE_CATEGORIES

# ============ SUBSCRIPTION ROUTES ============

@api_router.get("/subscriptions/plans")
async def get_subscription_plans():
    """Get all subscription plans with their features"""
    return {
        "plans": SUBSCRIPTION_PLANS,
        "addons": ADDON_OPTIONS,
        "base_features": BASE_FEATURES
    }

@api_router.get("/subscriptions/current")
async def get_current_subscription(current_user: dict = Depends(get_current_user)):
    """Get the current user's subscription"""
    subscription = await db.subscriptions.find_one(
        {"user_id": current_user['id'], "is_active": True},
        {"_id": 0}
    )
    return subscription or {"plan": None, "is_active": False}

@api_router.post("/subscriptions/checkout")
async def create_subscription_checkout(
    plan_id: str,
    addons: Optional[List[str]] = None,
    current_user: dict = Depends(get_current_user)
):
    """Create a Stripe checkout session for subscription"""
    if plan_id not in SUBSCRIPTION_PLANS:
        raise HTTPException(status_code=400, detail="Plan invalide")
    
    plan = SUBSCRIPTION_PLANS[plan_id]
    total_amount = plan['price']
    
    # Calculate addons
    addon_details = []
    if addons:
        for addon_id in addons:
            if addon_id in ADDON_OPTIONS:
                addon = ADDON_OPTIONS[addon_id]
                total_amount += addon['price']
                addon_details.append(addon_id)
    
    try:
        stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY)
        
        base_url = os.environ.get('FRONTEND_URL', 'http://localhost:3000')
        checkout_request = CheckoutSessionRequest(
            currency="chf",
            amount=total_amount,
            success_url=f"{base_url}/dashboard/entreprise?subscription=success&plan={plan_id}",
            cancel_url=f"{base_url}/dashboard/entreprise?subscription=cancelled",
            metadata={
                "type": "subscription",
                "plan_id": plan_id,
                "addons": ",".join(addon_details) if addon_details else "",
                "user_id": current_user['id']
            }
        )
        
        response = await stripe_checkout.create_checkout_session(checkout_request)
        
        return {"url": response.url, "session_id": response.id}
    except Exception as e:
        logger.error(f"Stripe checkout error: {e}")
        raise HTTPException(status_code=500, detail="Erreur lors de la création du paiement")

@api_router.post("/subscriptions/activate")
async def activate_subscription(
    session_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Activate subscription after successful payment"""
    try:
        stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY)
        status = await stripe_checkout.get_checkout_status(session_id)
        
        if status.status != "complete":
            raise HTTPException(status_code=400, detail="Paiement non complété")
        
        metadata = status.metadata or {}
        plan_id = metadata.get('plan_id')
        addons = metadata.get('addons', '').split(',') if metadata.get('addons') else []
        
        if not plan_id or plan_id not in SUBSCRIPTION_PLANS:
            raise HTTPException(status_code=400, detail="Plan invalide")
        
        plan = SUBSCRIPTION_PLANS[plan_id]
        
        # Deactivate old subscription
        await db.subscriptions.update_many(
            {"user_id": current_user['id'], "is_active": True},
            {"$set": {"is_active": False, "ended_at": datetime.now(timezone.utc)}}
        )
        
        # Create new subscription
        subscription = {
            "id": str(uuid.uuid4()),
            "user_id": current_user['id'],
            "plan_id": plan_id,
            "plan_name": plan['name'],
            "price": plan['price'],
            "features": plan['features'],
            "addons": addons,
            "tier": plan.get('tier', 'basic'),
            "is_active": True,
            "stripe_session_id": session_id,
            "started_at": datetime.now(timezone.utc),
            "next_billing_date": datetime.now(timezone.utc),
            "created_at": datetime.now(timezone.utc)
        }
        
        await db.subscriptions.insert_one(subscription)
        
        # Update enterprise profile based on tier
        enterprise = await db.enterprises.find_one({"user_id": current_user['id']})
        if enterprise:
            updates = {}
            if plan.get('tier') in ['premium', 'optimisation']:
                updates['is_premium'] = True
            if plan_id.startswith('opti_'):
                updates['is_labeled'] = True
            if updates:
                await db.enterprises.update_one(
                    {"user_id": current_user['id']},
                    {"$set": updates}
                )
        
        return {"success": True, "subscription": {k: v for k, v in subscription.items() if k != '_id'}}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Subscription activation error: {e}")
        raise HTTPException(status_code=500, detail="Erreur lors de l'activation")

@api_router.post("/subscriptions/addon/checkout")
async def create_addon_checkout(
    addon_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Create checkout for a single addon"""
    if addon_id not in ADDON_OPTIONS:
        raise HTTPException(status_code=400, detail="Option invalide")
    
    addon = ADDON_OPTIONS[addon_id]
    
    try:
        stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY)
        
        base_url = os.environ.get('FRONTEND_URL', 'http://localhost:3000')
        checkout_request = CheckoutSessionRequest(
            currency="chf",
            amount=addon['price'],
            success_url=f"{base_url}/dashboard/entreprise?addon=success&addon_id={addon_id}",
            cancel_url=f"{base_url}/dashboard/entreprise?addon=cancelled",
            metadata={
                "type": "addon",
                "addon_id": addon_id,
                "user_id": current_user['id']
            }
        )
        
        response = await stripe_checkout.create_checkout_session(checkout_request)
        
        return {"url": response.url, "session_id": response.id}
    except Exception as e:
        logger.error(f"Stripe addon checkout error: {e}")
        raise HTTPException(status_code=500, detail="Erreur lors de la création du paiement")

# ============ ADMIN ROUTES ============

@api_router.get("/admin/stats")
async def get_admin_stats(current_user: dict = Depends(get_current_user)):
    # Simple admin check (in production, use proper role system)
    if current_user.get('email') != 'admin@titelli.com':
        raise HTTPException(status_code=403, detail="Admin uniquement")
    
    total_users = await db.users.count_documents({})
    total_enterprises = await db.enterprises.count_documents({})
    total_orders = await db.orders.count_documents({})
    total_reviews = await db.reviews.count_documents({})
    
    recent_users = await db.users.find({}, {"_id": 0, "password": 0}).sort("created_at", -1).limit(10).to_list(10)
    recent_orders = await db.orders.find({}, {"_id": 0}).sort("created_at", -1).limit(10).to_list(10)
    
    return {
        "stats": {
            "total_users": total_users,
            "total_enterprises": total_enterprises,
            "total_orders": total_orders,
            "total_reviews": total_reviews
        },
        "recent_users": recent_users,
        "recent_orders": recent_orders
    }

@api_router.get("/admin/users")
async def get_all_users(current_user: dict = Depends(get_current_user), limit: int = 100, skip: int = 0):
    if current_user.get('email') != 'admin@titelli.com':
        raise HTTPException(status_code=403, detail="Admin uniquement")
    
    users = await db.users.find({}, {"_id": 0, "password": 0}).skip(skip).limit(limit).to_list(limit)
    total = await db.users.count_documents({})
    return {"users": users, "total": total}

@api_router.put("/admin/users/{user_id}/verify")
async def verify_user(user_id: str, is_certified: bool = False, is_labeled: bool = False, current_user: dict = Depends(get_current_user)):
    if current_user.get('email') != 'admin@titelli.com':
        raise HTTPException(status_code=403, detail="Admin uniquement")
    
    update_data = {"is_verified": True}
    if is_certified:
        update_data["is_certified"] = True
    if is_labeled:
        update_data["is_labeled"] = True
    
    await db.users.update_one({"id": user_id}, {"$set": update_data})
    
    # Also update enterprise if exists
    await db.enterprises.update_one(
        {"user_id": user_id},
        {"$set": {"is_certified": is_certified, "is_labeled": is_labeled}}
    )
    
    return {"message": "Utilisateur vérifié"}

# ============ CASHBACK ROUTES ============

@api_router.get("/cashback/balance")
async def get_cashback_balance(current_user: dict = Depends(get_current_user)):
    return {"balance": current_user.get('cashback_balance', 0.0)}

@api_router.post("/cashback/add")
async def add_cashback(user_id: str, amount: float, current_user: dict = Depends(get_current_user)):
    # Only admin or system can add cashback
    if current_user.get('email') != 'admin@titelli.com':
        raise HTTPException(status_code=403, detail="Non autorisé")
    
    await db.users.update_one(
        {"id": user_id},
        {"$inc": {"cashback_balance": amount}}
    )
    return {"message": f"Cashback de {amount} CHF ajouté"}

# ============ FEATURED/TRENDING ROUTES ============

@api_router.get("/featured/tendances")
async def get_tendances():
    enterprises = await db.enterprises.find(
        {"is_labeled": True}, {"_id": 0}
    ).sort("rating", -1).limit(6).to_list(6)
    return enterprises

@api_router.get("/featured/guests")
async def get_guests():
    enterprises = await db.enterprises.find(
        {"is_certified": True}, {"_id": 0}
    ).sort("rating", -1).limit(6).to_list(6)
    return enterprises

@api_router.get("/featured/offres")
async def get_offres():
    items = await db.services_products.find(
        {"is_available": True}, {"_id": 0}
    ).sort("created_at", -1).limit(6).to_list(6)
    return items

@api_router.get("/featured/premium")
async def get_premium():
    enterprises = await db.enterprises.find(
        {"is_premium": True}, {"_id": 0}
    ).sort("rating", -1).limit(6).to_list(6)
    return enterprises

# ============ BOOSTED ADVERTISING - PUBLIC ENDPOINT ============

@api_router.get("/advertising/public")
async def get_public_advertising(
    placement: Optional[str] = None,
    category: Optional[str] = None,
    limit: int = 10
):
    """
    Get public advertising with boost algorithm.
    Paid ads appear first, sorted by budget (higher budget = more visibility).
    Non-paid/inactive ads are filtered out.
    """
    now = datetime.now(timezone.utc).isoformat()
    
    # Base query: only active and paid ads
    query = {
        "is_active": True,
        "is_paid": True
    }
    
    # Filter by placement if specified
    if placement:
        query["placement"] = placement
    
    # Filter by date range (start_date <= now <= end_date)
    query["$or"] = [
        {"start_date": {"$lte": now}, "end_date": {"$gte": now}},
        {"start_date": {"$exists": False}},
        {"end_date": {"$exists": False}}
    ]
    
    # Fetch ads with boost algorithm:
    # 1. First sort by budget (descending) - higher paying = more visibility
    # 2. Then by created_at (recent first)
    ads = await db.advertising.find(query, {"_id": 0}).sort([
        ("budget", -1),  # Higher budget first
        ("created_at", -1)  # Then by most recent
    ]).limit(limit).to_list(limit)
    
    # Increment impressions for returned ads
    for ad in ads:
        await db.advertising.update_one(
            {"id": ad['id']},
            {"$inc": {"impressions": 1}}
        )
    
    return {"ads": ads, "total": len(ads)}

@api_router.post("/advertising/{ad_id}/click")
async def track_ad_click(ad_id: str):
    """Track a click on an advertisement"""
    result = await db.advertising.update_one(
        {"id": ad_id, "is_active": True},
        {"$inc": {"clicks": 1}}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Publicité non trouvée")
    return {"message": "Click enregistré"}

# ============ ENTERPRISE JOB APPLICATIONS VIEW ============

@api_router.get("/enterprise/applications")
async def get_all_enterprise_applications(current_user: dict = Depends(get_current_user)):
    """Get all job applications for an enterprise's jobs"""
    enterprise = await db.enterprises.find_one({"user_id": current_user['id']})
    if not enterprise:
        return {"applications": [], "jobs": []}
    
    # Get all jobs for this enterprise
    jobs = await db.jobs.find({"enterprise_id": enterprise['id']}, {"_id": 0}).to_list(100)
    job_ids = [job['id'] for job in jobs]
    
    if not job_ids:
        return {"applications": [], "jobs": jobs}
    
    # Get all applications for these jobs
    applications = await db.job_applications.find(
        {"job_id": {"$in": job_ids}}, {"_id": 0}
    ).sort("created_at", -1).to_list(500)
    
    # Enrich applications with user and job info
    for app in applications:
        user = await db.users.find_one({"id": app['user_id']}, {"_id": 0, "password": 0})
        job = next((j for j in jobs if j['id'] == app['job_id']), None)
        app['applicant'] = user
        app['job'] = job
        
        # Get applicant's documents if available
        documents = await db.client_documents.find(
            {"user_id": app['user_id']}, {"_id": 0}
        ).to_list(20)
        app['documents'] = documents
    
    # Stats
    stats = {
        "total": len(applications),
        "pending": len([a for a in applications if a.get('status') == 'pending']),
        "reviewed": len([a for a in applications if a.get('status') == 'reviewed']),
        "accepted": len([a for a in applications if a.get('status') == 'accepted']),
        "rejected": len([a for a in applications if a.get('status') == 'rejected'])
    }
    
    return {"applications": applications, "jobs": jobs, "stats": stats}

@api_router.put("/enterprise/applications/{application_id}/status")
async def update_application_status(
    application_id: str,
    status: str,
    current_user: dict = Depends(get_current_user)
):
    """Update the status of a job application"""
    enterprise = await db.enterprises.find_one({"user_id": current_user['id']})
    if not enterprise:
        raise HTTPException(status_code=404, detail="Entreprise non trouvée")
    
    # Find the application
    application = await db.job_applications.find_one({"id": application_id})
    if not application:
        raise HTTPException(status_code=404, detail="Candidature non trouvée")
    
    # Verify the job belongs to this enterprise
    job = await db.jobs.find_one({"id": application['job_id'], "enterprise_id": enterprise['id']})
    if not job:
        raise HTTPException(status_code=403, detail="Non autorisé")
    
    # Update status
    valid_statuses = ['pending', 'reviewed', 'accepted', 'rejected']
    if status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Statut invalide. Utilisez: {valid_statuses}")
    
    await db.job_applications.update_one(
        {"id": application_id},
        {"$set": {"status": status, "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    
    # Notify the applicant
    applicant = await db.users.find_one({"id": application['user_id']})
    if applicant:
        status_messages = {
            'reviewed': "Votre candidature est en cours d'examen",
            'accepted': "Félicitations ! Votre candidature a été acceptée",
            'rejected': "Votre candidature n'a pas été retenue"
        }
        if status in status_messages:
            notification = {
                "id": str(uuid.uuid4()),
                "user_id": application['user_id'],
                "title": f"Mise à jour candidature - {job['title']}",
                "message": status_messages[status],
                "notification_type": "job_application_status",
                "data": {"job_id": job['id'], "application_id": application_id, "status": status},
                "is_read": False,
                "created_at": datetime.now(timezone.utc).isoformat()
            }
            await db.notifications.insert_one(notification)
    
    return {"message": "Statut mis à jour", "status": status}

# ============ OFFERS/PROMOTIONS ROUTES ============

class OfferCreate(BaseModel):
    title: str
    description: str
    discount_type: str = "percentage"  # percentage or fixed
    discount_value: float
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    applicable_to: List[str] = []  # service/product IDs
    min_purchase: float = 0
    max_uses: Optional[int] = None
    code: Optional[str] = None

@api_router.get("/enterprise/offers")
async def get_enterprise_offers(current_user: dict = Depends(get_current_user)):
    enterprise = await db.enterprises.find_one({"user_id": current_user['id']})
    if not enterprise:
        return []
    offers = await db.offers.find({"enterprise_id": enterprise['id']}, {"_id": 0}).to_list(100)
    return offers

@api_router.post("/enterprise/offers")
async def create_offer(offer: OfferCreate, current_user: dict = Depends(get_current_user)):
    enterprise = await db.enterprises.find_one({"user_id": current_user['id']})
    if not enterprise:
        raise HTTPException(status_code=404, detail="Entreprise non trouvée")
    
    offer_doc = {
        "id": str(uuid.uuid4()),
        "enterprise_id": enterprise['id'],
        **offer.model_dump(),
        "is_active": True,
        "uses_count": 0,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.offers.insert_one(offer_doc)
    del offer_doc['_id']
    return offer_doc

@api_router.put("/enterprise/offers/{offer_id}")
async def update_offer(offer_id: str, offer: OfferCreate, current_user: dict = Depends(get_current_user)):
    enterprise = await db.enterprises.find_one({"user_id": current_user['id']})
    if not enterprise:
        raise HTTPException(status_code=404, detail="Entreprise non trouvée")
    
    await db.offers.update_one(
        {"id": offer_id, "enterprise_id": enterprise['id']},
        {"$set": offer.model_dump()}
    )
    return {"message": "Offre mise à jour"}

@api_router.delete("/enterprise/offers/{offer_id}")
async def delete_offer(offer_id: str, current_user: dict = Depends(get_current_user)):
    enterprise = await db.enterprises.find_one({"user_id": current_user['id']})
    if not enterprise:
        raise HTTPException(status_code=404, detail="Entreprise non trouvée")
    
    await db.offers.delete_one({"id": offer_id, "enterprise_id": enterprise['id']})
    return {"message": "Offre supprimée"}

# ============ TRAININGS/FORMATIONS ROUTES ============

class TrainingCreate(BaseModel):
    title: str
    description: str
    duration: str  # e.g., "2 heures", "1 jour"
    price: float
    max_participants: Optional[int] = None
    location: Optional[str] = None
    is_online: bool = False
    schedule: Optional[str] = None
    prerequisites: Optional[str] = None
    certificate: bool = False

@api_router.get("/enterprise/trainings")
async def get_enterprise_trainings(current_user: dict = Depends(get_current_user)):
    enterprise = await db.enterprises.find_one({"user_id": current_user['id']})
    if not enterprise:
        return []
    trainings = await db.trainings.find({"enterprise_id": enterprise['id']}, {"_id": 0}).to_list(100)
    return trainings

@api_router.post("/enterprise/trainings")
async def create_training(training: TrainingCreate, current_user: dict = Depends(get_current_user)):
    enterprise = await db.enterprises.find_one({"user_id": current_user['id']})
    if not enterprise:
        raise HTTPException(status_code=404, detail="Entreprise non trouvée")
    
    training_doc = {
        "id": str(uuid.uuid4()),
        "enterprise_id": enterprise['id'],
        "enterprise_name": enterprise['business_name'],
        **training.model_dump(),
        "is_active": True,
        "enrollments": 0,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.trainings.insert_one(training_doc)
    del training_doc['_id']
    return training_doc

@api_router.delete("/enterprise/trainings/{training_id}")
async def delete_training(training_id: str, current_user: dict = Depends(get_current_user)):
    enterprise = await db.enterprises.find_one({"user_id": current_user['id']})
    if not enterprise:
        raise HTTPException(status_code=404, detail="Entreprise non trouvée")
    
    await db.trainings.delete_one({"id": training_id, "enterprise_id": enterprise['id']})
    return {"message": "Formation supprimée"}

@api_router.get("/trainings")
async def get_all_trainings(category: Optional[str] = None, limit: int = 50):
    query = {"is_active": True}
    trainings = await db.trainings.find(query, {"_id": 0}).sort("created_at", -1).limit(limit).to_list(limit)
    return trainings

# ============ JOBS/EMPLOIS ROUTES ============

class JobCreate(BaseModel):
    title: str
    description: str
    job_type: str = "full_time"  # full_time, part_time, freelance, internship
    salary_min: Optional[float] = None
    salary_max: Optional[float] = None
    salary_type: str = "monthly"  # hourly, monthly, yearly
    location: str
    remote: bool = False
    requirements: Optional[str] = None
    benefits: Optional[str] = None
    contact_email: Optional[str] = None
    deadline: Optional[str] = None

class JobApplication(BaseModel):
    cover_letter: Optional[str] = None
    resume_url: Optional[str] = None

@api_router.get("/enterprise/jobs")
async def get_enterprise_jobs(current_user: dict = Depends(get_current_user)):
    enterprise = await db.enterprises.find_one({"user_id": current_user['id']})
    if not enterprise:
        return []
    jobs = await db.jobs.find({"enterprise_id": enterprise['id']}, {"_id": 0}).sort("created_at", -1).to_list(100)
    
    # Add application count for each job
    for job in jobs:
        job['applications_count'] = await db.job_applications.count_documents({"job_id": job['id']})
    
    return jobs

@api_router.post("/enterprise/jobs")
async def create_job(job: JobCreate, current_user: dict = Depends(get_current_user)):
    enterprise = await db.enterprises.find_one({"user_id": current_user['id']})
    if not enterprise:
        raise HTTPException(status_code=404, detail="Entreprise non trouvée")
    
    job_doc = {
        "id": str(uuid.uuid4()),
        "enterprise_id": enterprise['id'],
        "enterprise_name": enterprise['business_name'],
        "enterprise_logo": enterprise.get('logo', ''),
        "enterprise_category": enterprise.get('category', ''),
        **job.model_dump(),
        "is_active": True,
        "views": 0,
        "applications": 0,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.jobs.insert_one(job_doc)
    
    # Create notification for all clients about new job
    clients = await db.users.find({"user_type": "client"}, {"id": 1}).to_list(100)
    for client in clients:
        notification = {
            "id": str(uuid.uuid4()),
            "user_id": client['id'],
            "title": "Nouvelle offre d'emploi",
            "message": f"{enterprise['business_name']} recrute : {job.title}",
            "notification_type": "job",
            "data": {"job_id": job_doc['id']},
            "is_read": False,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.notifications.insert_one(notification)
    
    del job_doc['_id']
    return job_doc

@api_router.put("/enterprise/jobs/{job_id}")
async def update_job(job_id: str, job: JobCreate, current_user: dict = Depends(get_current_user)):
    enterprise = await db.enterprises.find_one({"user_id": current_user['id']})
    if not enterprise:
        raise HTTPException(status_code=404, detail="Entreprise non trouvée")
    
    await db.jobs.update_one(
        {"id": job_id, "enterprise_id": enterprise['id']},
        {"$set": job.model_dump()}
    )
    updated_job = await db.jobs.find_one({"id": job_id}, {"_id": 0})
    return updated_job

@api_router.put("/enterprise/jobs/{job_id}/toggle")
async def toggle_job(job_id: str, current_user: dict = Depends(get_current_user)):
    enterprise = await db.enterprises.find_one({"user_id": current_user['id']})
    if not enterprise:
        raise HTTPException(status_code=404, detail="Entreprise non trouvée")
    
    job = await db.jobs.find_one({"id": job_id, "enterprise_id": enterprise['id']})
    if not job:
        raise HTTPException(status_code=404, detail="Offre non trouvée")
    
    new_status = not job.get('is_active', True)
    await db.jobs.update_one({"id": job_id}, {"$set": {"is_active": new_status}})
    return {"is_active": new_status}

@api_router.delete("/enterprise/jobs/{job_id}")
async def delete_job(job_id: str, current_user: dict = Depends(get_current_user)):
    enterprise = await db.enterprises.find_one({"user_id": current_user['id']})
    if not enterprise:
        raise HTTPException(status_code=404, detail="Entreprise non trouvée")
    
    await db.jobs.delete_one({"id": job_id, "enterprise_id": enterprise['id']})
    await db.job_applications.delete_many({"job_id": job_id})
    return {"message": "Offre d'emploi supprimée"}

@api_router.get("/enterprise/jobs/{job_id}/applications")
async def get_job_applications(job_id: str, current_user: dict = Depends(get_current_user)):
    enterprise = await db.enterprises.find_one({"user_id": current_user['id']})
    if not enterprise:
        raise HTTPException(status_code=404, detail="Entreprise non trouvée")
    
    applications = await db.job_applications.find({"job_id": job_id}, {"_id": 0}).sort("created_at", -1).to_list(100)
    
    for app in applications:
        applicant = await db.users.find_one({"id": app['user_id']}, {"_id": 0, "password_hash": 0})
        app['applicant'] = applicant
    
    return {"applications": applications}

@api_router.get("/jobs")
async def get_all_jobs(job_type: Optional[str] = None, limit: int = 50):
    query = {"is_active": True}
    if job_type:
        query["job_type"] = job_type
    jobs = await db.jobs.find(query, {"_id": 0}).sort("created_at", -1).limit(limit).to_list(limit)
    
    # Add enterprise info for each job
    for job in jobs:
        enterprise = await db.enterprises.find_one({"id": job.get('enterprise_id')}, {"_id": 0})
        if enterprise:
            job['enterprise'] = {
                "id": enterprise['id'],
                "business_name": enterprise['business_name'],
                "logo": enterprise.get('logo', ''),
                "category": enterprise.get('category', '')
            }
    
    return jobs

@api_router.get("/jobs/{job_id}")
async def get_job_detail(job_id: str):
    job = await db.jobs.find_one({"id": job_id}, {"_id": 0})
    if not job:
        raise HTTPException(status_code=404, detail="Offre non trouvée")
    
    # Increment views
    await db.jobs.update_one({"id": job_id}, {"$inc": {"views": 1}})
    
    enterprise = await db.enterprises.find_one({"id": job.get('enterprise_id')}, {"_id": 0})
    if enterprise:
        job['enterprise'] = enterprise
    
    return job

@api_router.post("/jobs/{job_id}/apply")
async def apply_to_job(job_id: str, application: JobApplication, current_user: dict = Depends(get_current_user)):
    job = await db.jobs.find_one({"id": job_id, "is_active": True})
    if not job:
        raise HTTPException(status_code=404, detail="Offre non trouvée ou inactive")
    
    # Check if already applied
    existing = await db.job_applications.find_one({"job_id": job_id, "user_id": current_user['id']})
    if existing:
        raise HTTPException(status_code=400, detail="Vous avez déjà postulé à cette offre")
    
    app_doc = {
        "id": str(uuid.uuid4()),
        "job_id": job_id,
        "user_id": current_user['id'],
        "cover_letter": application.cover_letter,
        "resume_url": application.resume_url,
        "status": "pending",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.job_applications.insert_one(app_doc)
    
    # Update application count
    await db.jobs.update_one({"id": job_id}, {"$inc": {"applications": 1}})
    
    # Notify enterprise
    enterprise = await db.enterprises.find_one({"id": job['enterprise_id']})
    if enterprise:
        user = await db.users.find_one({"id": current_user['id']}, {"_id": 0, "password_hash": 0})
        notification = {
            "id": str(uuid.uuid4()),
            "user_id": enterprise['user_id'],
            "title": "Nouvelle candidature",
            "message": f"{user['first_name']} {user['last_name']} a postulé à : {job['title']}",
            "notification_type": "job_application",
            "data": {"job_id": job_id, "application_id": app_doc['id']},
            "is_read": False,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.notifications.insert_one(notification)
    
    del app_doc['_id']
    return app_doc

@api_router.get("/client/job-applications")
async def get_my_job_applications(current_user: dict = Depends(get_current_user)):
    applications = await db.job_applications.find({"user_id": current_user['id']}, {"_id": 0}).sort("created_at", -1).to_list(50)
    
    for app in applications:
        job = await db.jobs.find_one({"id": app['job_id']}, {"_id": 0})
        app['job'] = job
    
    return {"applications": applications}

# ============ REAL ESTATE/IMMOBILIER ROUTES ============

class RealEstateCreate(BaseModel):
    title: str
    description: str
    property_type: str = "commercial"  # commercial, office, storage, land
    transaction_type: str = "rent"  # rent, sale
    price: float
    price_period: Optional[str] = "monthly"  # monthly, yearly, one_time
    surface: Optional[float] = None  # m²
    address: str
    city: str = "Lausanne"
    features: List[str] = []
    images: List[str] = []

@api_router.get("/enterprise/real-estate")
async def get_enterprise_real_estate(current_user: dict = Depends(get_current_user)):
    enterprise = await db.enterprises.find_one({"user_id": current_user['id']})
    if not enterprise:
        return []
    properties = await db.real_estate.find({"enterprise_id": enterprise['id']}, {"_id": 0}).to_list(100)
    return properties

@api_router.post("/enterprise/real-estate")
async def create_real_estate(property_data: RealEstateCreate, current_user: dict = Depends(get_current_user)):
    enterprise = await db.enterprises.find_one({"user_id": current_user['id']})
    if not enterprise:
        raise HTTPException(status_code=404, detail="Entreprise non trouvée")
    
    property_doc = {
        "id": str(uuid.uuid4()),
        "enterprise_id": enterprise['id'],
        "enterprise_name": enterprise['business_name'],
        **property_data.model_dump(),
        "is_active": True,
        "views": 0,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.real_estate.insert_one(property_doc)
    del property_doc['_id']
    return property_doc

@api_router.delete("/enterprise/real-estate/{property_id}")
async def delete_real_estate(property_id: str, current_user: dict = Depends(get_current_user)):
    enterprise = await db.enterprises.find_one({"user_id": current_user['id']})
    if not enterprise:
        raise HTTPException(status_code=404, detail="Entreprise non trouvée")
    
    await db.real_estate.delete_one({"id": property_id, "enterprise_id": enterprise['id']})
    return {"message": "Bien immobilier supprimé"}

@api_router.get("/real-estate")
async def get_all_real_estate(property_type: Optional[str] = None, transaction_type: Optional[str] = None, limit: int = 50):
    query = {"is_active": True}
    if property_type:
        query["property_type"] = property_type
    if transaction_type:
        query["transaction_type"] = transaction_type
    properties = await db.real_estate.find(query, {"_id": 0}).sort("created_at", -1).limit(limit).to_list(limit)
    return properties

# ============ INVESTMENTS ROUTES ============

class InvestmentCreate(BaseModel):
    title: str
    description: str
    investment_type: str = "shares"  # shares, profit_sharing, bonds
    min_investment: float
    max_investment: Optional[float] = None
    expected_return: Optional[float] = None  # percentage
    duration: Optional[str] = None  # e.g., "12 mois"
    total_shares: Optional[int] = None
    available_shares: Optional[int] = None
    risk_level: str = "medium"  # low, medium, high

@api_router.get("/enterprise/investments")
async def get_enterprise_investments(current_user: dict = Depends(get_current_user)):
    enterprise = await db.enterprises.find_one({"user_id": current_user['id']})
    if not enterprise:
        return []
    investments = await db.investments.find({"enterprise_id": enterprise['id']}, {"_id": 0}).to_list(100)
    return investments

@api_router.post("/enterprise/investments")
async def create_investment(investment: InvestmentCreate, current_user: dict = Depends(get_current_user)):
    enterprise = await db.enterprises.find_one({"user_id": current_user['id']})
    if not enterprise:
        raise HTTPException(status_code=404, detail="Entreprise non trouvée")
    
    investment_doc = {
        "id": str(uuid.uuid4()),
        "enterprise_id": enterprise['id'],
        "enterprise_name": enterprise['business_name'],
        **investment.model_dump(),
        "is_active": True,
        "investors_count": 0,
        "total_raised": 0,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.investments.insert_one(investment_doc)
    del investment_doc['_id']
    return investment_doc

@api_router.delete("/enterprise/investments/{investment_id}")
async def delete_investment(investment_id: str, current_user: dict = Depends(get_current_user)):
    enterprise = await db.enterprises.find_one({"user_id": current_user['id']})
    if not enterprise:
        raise HTTPException(status_code=404, detail="Entreprise non trouvée")
    
    await db.investments.delete_one({"id": investment_id, "enterprise_id": enterprise['id']})
    return {"message": "Investissement supprimé"}

@api_router.get("/investments")
async def get_all_investments(investment_type: Optional[str] = None, limit: int = 50):
    query = {"is_active": True}
    if investment_type:
        query["investment_type"] = investment_type
    investments = await db.investments.find(query, {"_id": 0}).sort("created_at", -1).limit(limit).to_list(limit)
    return investments

# ============ STOCK MANAGEMENT ROUTES ============

class StockItemCreate(BaseModel):
    product_id: str
    product_name: str
    sku: Optional[str] = None
    quantity: int = 0
    min_quantity: int = 5  # Alert threshold
    max_quantity: Optional[int] = None
    unit: str = "pièce"  # pièce, kg, litre, etc.
    location: Optional[str] = None
    cost_price: Optional[float] = None

class StockMovement(BaseModel):
    product_id: str
    quantity: int
    movement_type: str  # in, out, adjustment
    reason: Optional[str] = None

@api_router.get("/enterprise/stock")
async def get_enterprise_stock(current_user: dict = Depends(get_current_user)):
    enterprise = await db.enterprises.find_one({"user_id": current_user['id']})
    if not enterprise:
        return {"items": [], "alerts": []}
    
    stock = await db.stock.find({"enterprise_id": enterprise['id']}, {"_id": 0}).to_list(500)
    alerts = [s for s in stock if s['quantity'] <= s['min_quantity']]
    
    return {"items": stock, "alerts": alerts}

@api_router.post("/enterprise/stock")
async def add_stock_item(item: StockItemCreate, current_user: dict = Depends(get_current_user)):
    enterprise = await db.enterprises.find_one({"user_id": current_user['id']})
    if not enterprise:
        raise HTTPException(status_code=404, detail="Entreprise non trouvée")
    
    stock_doc = {
        "id": str(uuid.uuid4()),
        "enterprise_id": enterprise['id'],
        **item.model_dump(),
        "last_updated": datetime.now(timezone.utc).isoformat()
    }
    await db.stock.insert_one(stock_doc)
    del stock_doc['_id']
    return stock_doc

@api_router.post("/enterprise/stock/movement")
async def record_stock_movement(movement: StockMovement, current_user: dict = Depends(get_current_user)):
    enterprise = await db.enterprises.find_one({"user_id": current_user['id']})
    if not enterprise:
        raise HTTPException(status_code=404, detail="Entreprise non trouvée")
    
    stock_item = await db.stock.find_one({"product_id": movement.product_id, "enterprise_id": enterprise['id']})
    if not stock_item:
        raise HTTPException(status_code=404, detail="Produit non trouvé dans le stock")
    
    # Calculate new quantity
    if movement.movement_type == "in":
        new_quantity = stock_item['quantity'] + movement.quantity
    elif movement.movement_type == "out":
        new_quantity = stock_item['quantity'] - movement.quantity
    else:  # adjustment
        new_quantity = movement.quantity
    
    # Update stock
    await db.stock.update_one(
        {"product_id": movement.product_id, "enterprise_id": enterprise['id']},
        {"$set": {"quantity": new_quantity, "last_updated": datetime.now(timezone.utc).isoformat()}}
    )
    
    # Record movement history
    movement_doc = {
        "id": str(uuid.uuid4()),
        "enterprise_id": enterprise['id'],
        "product_id": movement.product_id,
        "quantity": movement.quantity,
        "movement_type": movement.movement_type,
        "reason": movement.reason,
        "previous_quantity": stock_item['quantity'],
        "new_quantity": new_quantity,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.stock_movements.insert_one(movement_doc)
    
    return {"message": "Mouvement enregistré", "new_quantity": new_quantity}

@api_router.get("/enterprise/stock/history")
async def get_stock_history(current_user: dict = Depends(get_current_user), limit: int = 100):
    enterprise = await db.enterprises.find_one({"user_id": current_user['id']})
    if not enterprise:
        return []
    
    movements = await db.stock_movements.find(
        {"enterprise_id": enterprise['id']}, {"_id": 0}
    ).sort("created_at", -1).limit(limit).to_list(limit)
    return movements

# ============ AGENDA/CALENDAR ROUTES ============

class AgendaEventCreate(BaseModel):
    title: str
    description: Optional[str] = None
    event_type: str = "appointment"  # appointment, availability, blocked, task
    start_datetime: str
    end_datetime: str
    all_day: bool = False
    recurring: bool = False
    recurring_pattern: Optional[str] = None  # daily, weekly, monthly
    client_id: Optional[str] = None
    client_name: Optional[str] = None
    service_id: Optional[str] = None
    location: Optional[str] = None
    notes: Optional[str] = None
    color: str = "#0047AB"

@api_router.get("/enterprise/agenda")
async def get_enterprise_agenda(
    current_user: dict = Depends(get_current_user),
    start_date: Optional[str] = None,
    end_date: Optional[str] = None
):
    enterprise = await db.enterprises.find_one({"user_id": current_user['id']})
    if not enterprise:
        return []
    
    query = {"enterprise_id": enterprise['id']}
    if start_date:
        query["start_datetime"] = {"$gte": start_date}
    if end_date:
        if "start_datetime" in query:
            query["start_datetime"]["$lte"] = end_date
        else:
            query["start_datetime"] = {"$lte": end_date}
    
    events = await db.agenda.find(query, {"_id": 0}).sort("start_datetime", 1).to_list(500)
    return events

@api_router.post("/enterprise/agenda")
async def create_agenda_event(event: AgendaEventCreate, current_user: dict = Depends(get_current_user)):
    enterprise = await db.enterprises.find_one({"user_id": current_user['id']})
    if not enterprise:
        raise HTTPException(status_code=404, detail="Entreprise non trouvée")
    
    event_doc = {
        "id": str(uuid.uuid4()),
        "enterprise_id": enterprise['id'],
        **event.model_dump(),
        "status": "scheduled",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.agenda.insert_one(event_doc)
    del event_doc['_id']
    return event_doc

@api_router.put("/enterprise/agenda/{event_id}")
async def update_agenda_event(event_id: str, event: AgendaEventCreate, current_user: dict = Depends(get_current_user)):
    enterprise = await db.enterprises.find_one({"user_id": current_user['id']})
    if not enterprise:
        raise HTTPException(status_code=404, detail="Entreprise non trouvée")
    
    await db.agenda.update_one(
        {"id": event_id, "enterprise_id": enterprise['id']},
        {"$set": event.model_dump()}
    )
    return {"message": "Événement mis à jour"}

@api_router.delete("/enterprise/agenda/{event_id}")
async def delete_agenda_event(event_id: str, current_user: dict = Depends(get_current_user)):
    enterprise = await db.enterprises.find_one({"user_id": current_user['id']})
    if not enterprise:
        raise HTTPException(status_code=404, detail="Entreprise non trouvée")
    
    await db.agenda.delete_one({"id": event_id, "enterprise_id": enterprise['id']})
    return {"message": "Événement supprimé"}

# ============ TEAM/PERSONNEL ROUTES ============

class TeamMemberCreate(BaseModel):
    first_name: str
    last_name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    role: str
    department: Optional[str] = None
    hire_date: Optional[str] = None
    salary: Optional[float] = None
    working_hours: Optional[str] = None
    photo: Optional[str] = None
    skills: List[str] = []
    is_active: bool = True

class TeamOrderCreate(BaseModel):
    member_id: str
    title: str
    description: str
    priority: str = "normal"  # low, normal, high, urgent
    due_date: Optional[str] = None
    recurring: bool = False
    recurring_pattern: Optional[str] = None

@api_router.get("/enterprise/team")
async def get_enterprise_team(current_user: dict = Depends(get_current_user)):
    enterprise = await db.enterprises.find_one({"user_id": current_user['id']})
    if not enterprise:
        return []
    
    team = await db.team_members.find({"enterprise_id": enterprise['id']}, {"_id": 0}).to_list(100)
    return team

@api_router.post("/enterprise/team")
async def add_team_member(member: TeamMemberCreate, current_user: dict = Depends(get_current_user)):
    enterprise = await db.enterprises.find_one({"user_id": current_user['id']})
    if not enterprise:
        raise HTTPException(status_code=404, detail="Entreprise non trouvée")
    
    member_doc = {
        "id": str(uuid.uuid4()),
        "enterprise_id": enterprise['id'],
        **member.model_dump(),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.team_members.insert_one(member_doc)
    del member_doc['_id']
    return member_doc

@api_router.put("/enterprise/team/{member_id}")
async def update_team_member(member_id: str, member: TeamMemberCreate, current_user: dict = Depends(get_current_user)):
    enterprise = await db.enterprises.find_one({"user_id": current_user['id']})
    if not enterprise:
        raise HTTPException(status_code=404, detail="Entreprise non trouvée")
    
    await db.team_members.update_one(
        {"id": member_id, "enterprise_id": enterprise['id']},
        {"$set": member.model_dump()}
    )
    return {"message": "Membre mis à jour"}

@api_router.delete("/enterprise/team/{member_id}")
async def delete_team_member(member_id: str, current_user: dict = Depends(get_current_user)):
    enterprise = await db.enterprises.find_one({"user_id": current_user['id']})
    if not enterprise:
        raise HTTPException(status_code=404, detail="Entreprise non trouvée")
    
    await db.team_members.delete_one({"id": member_id, "enterprise_id": enterprise['id']})
    return {"message": "Membre supprimé"}

# Team Orders
@api_router.get("/enterprise/team/orders")
async def get_team_orders(current_user: dict = Depends(get_current_user)):
    enterprise = await db.enterprises.find_one({"user_id": current_user['id']})
    if not enterprise:
        return []
    
    orders = await db.team_orders.find({"enterprise_id": enterprise['id']}, {"_id": 0}).to_list(200)
    return orders

@api_router.post("/enterprise/team/orders")
async def create_team_order(order: TeamOrderCreate, current_user: dict = Depends(get_current_user)):
    enterprise = await db.enterprises.find_one({"user_id": current_user['id']})
    if not enterprise:
        raise HTTPException(status_code=404, detail="Entreprise non trouvée")
    
    order_doc = {
        "id": str(uuid.uuid4()),
        "enterprise_id": enterprise['id'],
        **order.model_dump(),
        "status": "pending",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.team_orders.insert_one(order_doc)
    del order_doc['_id']
    return order_doc

@api_router.put("/enterprise/team/orders/{order_id}/status")
async def update_team_order_status(order_id: str, status: str, current_user: dict = Depends(get_current_user)):
    enterprise = await db.enterprises.find_one({"user_id": current_user['id']})
    if not enterprise:
        raise HTTPException(status_code=404, detail="Entreprise non trouvée")
    
    await db.team_orders.update_one(
        {"id": order_id, "enterprise_id": enterprise['id']},
        {"$set": {"status": status}}
    )
    return {"message": "Statut mis à jour"}

# ============ PERMANENT ORDERS ROUTES ============

class PermanentOrderCreate(BaseModel):
    client_id: Optional[str] = None
    client_name: str
    client_email: Optional[str] = None
    client_phone: Optional[str] = None
    items: List[Dict[str, Any]]
    frequency: str = "weekly"  # daily, weekly, biweekly, monthly
    delivery_day: Optional[str] = None  # monday, tuesday, etc.
    delivery_time: Optional[str] = None
    delivery_address: Optional[str] = None
    total: float
    notes: Optional[str] = None
    start_date: str
    end_date: Optional[str] = None

@api_router.get("/enterprise/permanent-orders")
async def get_permanent_orders(current_user: dict = Depends(get_current_user)):
    enterprise = await db.enterprises.find_one({"user_id": current_user['id']})
    if not enterprise:
        return []
    
    orders = await db.permanent_orders.find({"enterprise_id": enterprise['id']}, {"_id": 0}).to_list(100)
    return orders

@api_router.post("/enterprise/permanent-orders")
async def create_permanent_order(order: PermanentOrderCreate, current_user: dict = Depends(get_current_user)):
    enterprise = await db.enterprises.find_one({"user_id": current_user['id']})
    if not enterprise:
        raise HTTPException(status_code=404, detail="Entreprise non trouvée")
    
    order_doc = {
        "id": str(uuid.uuid4()),
        "enterprise_id": enterprise['id'],
        **order.model_dump(),
        "is_active": True,
        "last_executed": None,
        "executions_count": 0,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.permanent_orders.insert_one(order_doc)
    del order_doc['_id']
    return order_doc

@api_router.put("/enterprise/permanent-orders/{order_id}/toggle")
async def toggle_permanent_order(order_id: str, current_user: dict = Depends(get_current_user)):
    enterprise = await db.enterprises.find_one({"user_id": current_user['id']})
    if not enterprise:
        raise HTTPException(status_code=404, detail="Entreprise non trouvée")
    
    order = await db.permanent_orders.find_one({"id": order_id, "enterprise_id": enterprise['id']})
    if not order:
        raise HTTPException(status_code=404, detail="Commande non trouvée")
    
    await db.permanent_orders.update_one(
        {"id": order_id},
        {"$set": {"is_active": not order['is_active']}}
    )
    return {"message": "Statut modifié", "is_active": not order['is_active']}

@api_router.delete("/enterprise/permanent-orders/{order_id}")
async def delete_permanent_order(order_id: str, current_user: dict = Depends(get_current_user)):
    enterprise = await db.enterprises.find_one({"user_id": current_user['id']})
    if not enterprise:
        raise HTTPException(status_code=404, detail="Entreprise non trouvée")
    
    await db.permanent_orders.delete_one({"id": order_id, "enterprise_id": enterprise['id']})
    return {"message": "Commande permanente supprimée"}

# ============ DOCUMENTS ROUTES ============

class DocumentCreate(BaseModel):
    title: str
    description: Optional[str] = None
    category: str = "other"  # legal, financial, contract, certificate, other
    file_url: str
    file_type: str  # pdf, doc, image, etc.
    file_size: Optional[int] = None
    expiry_date: Optional[str] = None
    is_important: bool = False

@api_router.get("/enterprise/documents")
async def get_enterprise_documents(current_user: dict = Depends(get_current_user), category: Optional[str] = None):
    enterprise = await db.enterprises.find_one({"user_id": current_user['id']})
    if not enterprise:
        return []
    
    query = {"enterprise_id": enterprise['id']}
    if category:
        query["category"] = category
    
    documents = await db.documents.find(query, {"_id": 0}).sort("created_at", -1).to_list(200)
    return documents

@api_router.post("/enterprise/documents")
async def add_document(doc: DocumentCreate, current_user: dict = Depends(get_current_user)):
    enterprise = await db.enterprises.find_one({"user_id": current_user['id']})
    if not enterprise:
        raise HTTPException(status_code=404, detail="Entreprise non trouvée")
    
    doc_record = {
        "id": str(uuid.uuid4()),
        "enterprise_id": enterprise['id'],
        **doc.model_dump(),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.documents.insert_one(doc_record)
    del doc_record['_id']
    return doc_record

@api_router.delete("/enterprise/documents/{doc_id}")
async def delete_document(doc_id: str, current_user: dict = Depends(get_current_user)):
    enterprise = await db.enterprises.find_one({"user_id": current_user['id']})
    if not enterprise:
        raise HTTPException(status_code=404, detail="Entreprise non trouvée")
    
    await db.documents.delete_one({"id": doc_id, "enterprise_id": enterprise['id']})
    return {"message": "Document supprimé"}

# ============ DEVELOPMENT/FORMATION ROUTES ============

class DevelopmentResourceCreate(BaseModel):
    title: str
    description: Optional[str] = None
    resource_type: str = "article"  # article, video, course, webinar, ebook
    category: str
    url: Optional[str] = None
    content: Optional[str] = None
    duration: Optional[str] = None
    is_completed: bool = False

@api_router.get("/enterprise/development")
async def get_development_resources(current_user: dict = Depends(get_current_user)):
    enterprise = await db.enterprises.find_one({"user_id": current_user['id']})
    if not enterprise:
        return {"resources": [], "progress": []}
    
    # Get available resources
    resources = await db.development_resources.find({}, {"_id": 0}).to_list(100)
    
    # Get enterprise progress
    progress = await db.development_progress.find(
        {"enterprise_id": enterprise['id']}, {"_id": 0}
    ).to_list(100)
    
    return {"resources": resources, "progress": progress}

@api_router.post("/enterprise/development/progress")
async def update_development_progress(
    resource_id: str, 
    is_completed: bool = True,
    current_user: dict = Depends(get_current_user)
):
    enterprise = await db.enterprises.find_one({"user_id": current_user['id']})
    if not enterprise:
        raise HTTPException(status_code=404, detail="Entreprise non trouvée")
    
    await db.development_progress.update_one(
        {"enterprise_id": enterprise['id'], "resource_id": resource_id},
        {"$set": {
            "is_completed": is_completed,
            "completed_at": datetime.now(timezone.utc).isoformat() if is_completed else None
        }},
        upsert=True
    )
    return {"message": "Progression mise à jour"}

# ============ FINANCES ROUTES ============

class FinanceTransactionCreate(BaseModel):
    transaction_type: str  # income, expense, transfer
    category: str  # sales, subscription, advertising, salary, supplies, other
    amount: float
    description: str
    date: str
    reference: Optional[str] = None
    payment_method: Optional[str] = None

@api_router.get("/enterprise/finances")
async def get_enterprise_finances(
    current_user: dict = Depends(get_current_user),
    start_date: Optional[str] = None,
    end_date: Optional[str] = None
):
    enterprise = await db.enterprises.find_one({"user_id": current_user['id']})
    if not enterprise:
        return {"transactions": [], "summary": {}}
    
    query = {"enterprise_id": enterprise['id']}
    if start_date:
        query["date"] = {"$gte": start_date}
    if end_date:
        if "date" in query:
            query["date"]["$lte"] = end_date
        else:
            query["date"] = {"$lte": end_date}
    
    transactions = await db.finance_transactions.find(query, {"_id": 0}).sort("date", -1).to_list(500)
    
    # Calculate summary
    total_income = sum(t['amount'] for t in transactions if t['transaction_type'] == 'income')
    total_expenses = sum(t['amount'] for t in transactions if t['transaction_type'] == 'expense')
    
    # Get orders revenue
    orders = await db.orders.find({"enterprise_id": enterprise['id'], "status": "completed"}, {"_id": 0}).to_list(1000)
    orders_revenue = sum(o.get('total', 0) for o in orders)
    
    summary = {
        "total_income": total_income + orders_revenue,
        "total_expenses": total_expenses,
        "net_profit": total_income + orders_revenue - total_expenses,
        "orders_revenue": orders_revenue,
        "commission_paid": orders_revenue * 0.05  # 5% commission
    }
    
    return {"transactions": transactions, "summary": summary}

@api_router.post("/enterprise/finances/transactions")
async def add_finance_transaction(transaction: FinanceTransactionCreate, current_user: dict = Depends(get_current_user)):
    enterprise = await db.enterprises.find_one({"user_id": current_user['id']})
    if not enterprise:
        raise HTTPException(status_code=404, detail="Entreprise non trouvée")
    
    transaction_doc = {
        "id": str(uuid.uuid4()),
        "enterprise_id": enterprise['id'],
        **transaction.model_dump(),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.finance_transactions.insert_one(transaction_doc)
    del transaction_doc['_id']
    return transaction_doc

@api_router.delete("/enterprise/finances/transactions/{transaction_id}")
async def delete_finance_transaction(transaction_id: str, current_user: dict = Depends(get_current_user)):
    enterprise = await db.enterprises.find_one({"user_id": current_user['id']})
    if not enterprise:
        raise HTTPException(status_code=404, detail="Entreprise non trouvée")
    
    await db.finance_transactions.delete_one({"id": transaction_id, "enterprise_id": enterprise['id']})
    return {"message": "Transaction supprimée"}

# ============ ADVERTISING ROUTES ============

class AdvertisingCreate(BaseModel):
    title: str
    description: Optional[str] = None
    ad_type: str = "banner"  # banner, featured, spotlight, premium_listing, video, popup
    placement: str = "homepage"  # homepage, category, search, sidebar
    target_audience: Optional[str] = None
    budget: float
    start_date: str
    end_date: str
    image_url: Optional[str] = None
    video_url: Optional[str] = None
    link_url: Optional[str] = None
    cta_text: Optional[str] = None

@api_router.get("/enterprise/advertising")
async def get_enterprise_advertising(current_user: dict = Depends(get_current_user)):
    enterprise = await db.enterprises.find_one({"user_id": current_user['id']})
    if not enterprise:
        return {"campaigns": [], "stats": {}}
    
    campaigns = await db.advertising.find({"enterprise_id": enterprise['id']}, {"_id": 0}).to_list(100)
    
    # Calculate stats
    total_spent = sum(c.get('spent', 0) for c in campaigns)
    total_impressions = sum(c.get('impressions', 0) for c in campaigns)
    total_clicks = sum(c.get('clicks', 0) for c in campaigns)
    
    stats = {
        "total_campaigns": len(campaigns),
        "active_campaigns": len([c for c in campaigns if c.get('is_active')]),
        "total_spent": total_spent,
        "total_impressions": total_impressions,
        "total_clicks": total_clicks,
        "ctr": (total_clicks / total_impressions * 100) if total_impressions > 0 else 0
    }
    
    return {"campaigns": campaigns, "stats": stats}

@api_router.post("/enterprise/advertising")
async def create_advertising_campaign(ad: AdvertisingCreate, current_user: dict = Depends(get_current_user)):
    enterprise = await db.enterprises.find_one({"user_id": current_user['id']})
    if not enterprise:
        raise HTTPException(status_code=404, detail="Entreprise non trouvée")
    
    ad_doc = {
        "id": str(uuid.uuid4()),
        "enterprise_id": enterprise['id'],
        "enterprise_name": enterprise['business_name'],
        **ad.model_dump(),
        "is_active": False,  # Inactive until paid
        "is_paid": False,  # Must pay to activate
        "is_approved": False,  # Requires admin approval after payment
        "payment_session_id": None,
        "impressions": 0,
        "clicks": 0,
        "spent": 0,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.advertising.insert_one(ad_doc)
    del ad_doc['_id']
    return ad_doc

@api_router.post("/enterprise/advertising/{ad_id}/pay")
async def pay_for_advertising(ad_id: str, request: Request, current_user: dict = Depends(get_current_user)):
    """Initiate payment for an advertising campaign"""
    enterprise = await db.enterprises.find_one({"user_id": current_user['id']})
    if not enterprise:
        raise HTTPException(status_code=404, detail="Entreprise non trouvée")
    
    ad = await db.advertising.find_one({"id": ad_id, "enterprise_id": enterprise['id']})
    if not ad:
        raise HTTPException(status_code=404, detail="Publicité non trouvée")
    
    if ad.get('is_paid'):
        raise HTTPException(status_code=400, detail="Cette publicité est déjà payée")
    
    # Determine price based on ad type
    ad_type = ad.get('ad_type', 'standard')
    ad_prices = {
        'standard': 50,  # 50 CHF
        'premium': 150,  # 150 CHF  
        'spotlight': 300,  # 300 CHF
        'video': 200,  # 200 CHF
        'banner': 100,  # 100 CHF
    }
    amount = ad.get('budget', ad_prices.get(ad_type, 50))
    
    host_url = str(request.base_url).rstrip('/')
    webhook_url = f"{host_url}/api/webhook/stripe"
    
    stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url=webhook_url)
    
    origin = request.headers.get('origin', host_url.replace('/api', ''))
    success_url = f"{origin}/payment/success?session_id={{CHECKOUT_SESSION_ID}}&type=advertising&ad_id={ad_id}"
    cancel_url = f"{origin}/payment/cancel?type=advertising"
    
    metadata = {
        "type": "advertising",
        "ad_id": ad_id,
        "enterprise_id": enterprise['id'],
        "user_id": current_user['id']
    }
    
    checkout_request = CheckoutSessionRequest(
        amount=float(amount),
        currency="chf",
        success_url=success_url,
        cancel_url=cancel_url,
        metadata=metadata
    )
    
    session = await stripe_checkout.create_checkout_session(checkout_request)
    
    # Store session ID on the ad
    await db.advertising.update_one(
        {"id": ad_id},
        {"$set": {"payment_session_id": session.session_id}}
    )
    
    # Store transaction
    transaction = {
        "id": str(uuid.uuid4()),
        "session_id": session.session_id,
        "user_id": current_user['id'],
        "enterprise_id": enterprise['id'],
        "ad_id": ad_id,
        "amount": amount,
        "currency": "CHF",
        "type": "advertising",
        "metadata": metadata,
        "payment_status": "pending",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.transactions.insert_one(transaction)
    
    return {"checkout_url": session.checkout_url, "session_id": session.session_id}

@api_router.post("/enterprise/advertising/{ad_id}/activate")
async def activate_advertising_after_payment(ad_id: str, session_id: str, current_user: dict = Depends(get_current_user)):
    """Activate advertising after successful payment verification"""
    enterprise = await db.enterprises.find_one({"user_id": current_user['id']})
    if not enterprise:
        raise HTTPException(status_code=404, detail="Entreprise non trouvée")
    
    ad = await db.advertising.find_one({"id": ad_id, "enterprise_id": enterprise['id']})
    if not ad:
        raise HTTPException(status_code=404, detail="Publicité non trouvée")
    
    # Verify the payment session
    if ad.get('payment_session_id') != session_id:
        raise HTTPException(status_code=400, detail="Session de paiement invalide")
    
    # Check transaction status
    transaction = await db.transactions.find_one({"session_id": session_id})
    if not transaction or transaction.get('payment_status') != 'completed':
        # Verify with Stripe
        stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url="")
        try:
            status = await stripe_checkout.get_checkout_status(session_id)
            if status.payment_status == "paid":
                # Update transaction
                await db.transactions.update_one(
                    {"session_id": session_id},
                    {"$set": {"payment_status": "completed"}}
                )
            else:
                raise HTTPException(status_code=400, detail="Paiement non confirmé")
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Erreur de vérification: {str(e)}")
    
    # Activate the ad
    await db.advertising.update_one(
        {"id": ad_id},
        {"$set": {
            "is_paid": True,
            "is_active": True,
            "paid_at": datetime.now(timezone.utc).isoformat()
        }}
    )
    
    return {"message": "Publicité activée avec succès", "is_active": True}

@api_router.put("/enterprise/advertising/{ad_id}/toggle")
async def toggle_advertising(ad_id: str, current_user: dict = Depends(get_current_user)):
    enterprise = await db.enterprises.find_one({"user_id": current_user['id']})
    if not enterprise:
        raise HTTPException(status_code=404, detail="Entreprise non trouvée")
    
    ad = await db.advertising.find_one({"id": ad_id, "enterprise_id": enterprise['id']})
    if not ad:
        raise HTTPException(status_code=404, detail="Publicité non trouvée")
    
    # Can only toggle if paid
    if not ad.get('is_paid'):
        raise HTTPException(status_code=400, detail="Vous devez payer cette publicité avant de l'activer")
    
    await db.advertising.update_one(
        {"id": ad_id},
        {"$set": {"is_active": not ad['is_active']}}
    )
    return {"message": "Statut modifié", "is_active": not ad['is_active']}

@api_router.delete("/enterprise/advertising/{ad_id}")
async def delete_advertising(ad_id: str, current_user: dict = Depends(get_current_user)):
    enterprise = await db.enterprises.find_one({"user_id": current_user['id']})
    if not enterprise:
        raise HTTPException(status_code=404, detail="Entreprise non trouvée")
    
    await db.advertising.delete_one({"id": ad_id, "enterprise_id": enterprise['id']})
    return {"message": "Publicité supprimée"}

# ============ IA MARKETING ROUTES ============

# --- IA Campaigns ---
@api_router.get("/enterprise/ia-campaigns")
async def get_ia_campaigns(current_user: dict = Depends(get_current_user)):
    enterprise = await db.enterprises.find_one({"user_id": current_user['id']})
    if not enterprise:
        raise HTTPException(status_code=404, detail="Entreprise non trouvée")
    
    campaigns = await db.ia_campaigns.find({"enterprise_id": enterprise['id']}, {"_id": 0}).sort("created_at", -1).to_list(100)
    
    # Calculate stats
    total_reach = sum(c.get('reach', 0) for c in campaigns)
    total_engagement = sum(c.get('engagement', 0) for c in campaigns)
    total_conversions = sum(c.get('conversions', 0) for c in campaigns)
    active_count = len([c for c in campaigns if c.get('status') == 'active'])
    
    return {
        "campaigns": campaigns,
        "stats": {
            "total_reach": total_reach,
            "total_engagement": total_engagement,
            "total_conversions": total_conversions,
            "active_campaigns": active_count,
            "engagement_rate": round((total_engagement / total_reach * 100), 1) if total_reach > 0 else 0,
            "conversion_rate": round((total_conversions / total_engagement * 100), 1) if total_engagement > 0 else 0
        }
    }

@api_router.post("/enterprise/ia-campaigns")
async def create_ia_campaign(campaign_data: IACampaignCreate, current_user: dict = Depends(get_current_user)):
    enterprise = await db.enterprises.find_one({"user_id": current_user['id']})
    if not enterprise:
        raise HTTPException(status_code=404, detail="Entreprise non trouvée")
    
    # Simulate reach based on targeting
    base_reach = 5000
    if campaign_data.gender != 'all':
        base_reach *= 0.5
    if len(campaign_data.interests) > 0:
        base_reach *= (0.3 + (len(campaign_data.interests) * 0.1))
    if campaign_data.budget == 'high':
        base_reach *= 1.5
    elif campaign_data.budget == 'premium':
        base_reach *= 2
    
    campaign = IACampaign(
        enterprise_id=enterprise['id'],
        **campaign_data.model_dump(),
        reach=int(base_reach + random.randint(500, 2000)),
        engagement=int(base_reach * 0.04 + random.randint(50, 200)),
        conversions=int(base_reach * 0.01 + random.randint(10, 50))
    )
    
    campaign_dict = campaign.model_dump()
    campaign_dict['created_at'] = campaign_dict['created_at'].isoformat()
    await db.ia_campaigns.insert_one(campaign_dict)
    
    # Remove MongoDB _id before returning
    campaign_dict.pop('_id', None)
    return campaign_dict

@api_router.put("/enterprise/ia-campaigns/{campaign_id}/toggle")
async def toggle_ia_campaign(campaign_id: str, current_user: dict = Depends(get_current_user)):
    enterprise = await db.enterprises.find_one({"user_id": current_user['id']})
    if not enterprise:
        raise HTTPException(status_code=404, detail="Entreprise non trouvée")
    
    campaign = await db.ia_campaigns.find_one({"id": campaign_id, "enterprise_id": enterprise['id']})
    if not campaign:
        raise HTTPException(status_code=404, detail="Campagne non trouvée")
    
    new_status = "paused" if campaign.get('status') == 'active' else 'active'
    await db.ia_campaigns.update_one({"id": campaign_id}, {"$set": {"status": new_status}})
    
    return {"status": new_status}

@api_router.delete("/enterprise/ia-campaigns/{campaign_id}")
async def delete_ia_campaign(campaign_id: str, current_user: dict = Depends(get_current_user)):
    enterprise = await db.enterprises.find_one({"user_id": current_user['id']})
    if not enterprise:
        raise HTTPException(status_code=404, detail="Entreprise non trouvée")
    
    await db.ia_campaigns.delete_one({"id": campaign_id, "enterprise_id": enterprise['id']})
    return {"message": "Campagne supprimée"}

# --- Influencers ---
@api_router.get("/influencers")
async def get_influencers(category: Optional[str] = None):
    """Get all available influencers"""
    query = {"is_available": True}
    if category and category != 'all':
        query["category"] = category
    
    influencers = await db.influencers.find(query, {"_id": 0}).sort("followers", -1).to_list(100)
    
    # If no influencers, seed some default ones
    if len(influencers) == 0:
        default_influencers = [
            {"id": str(uuid.uuid4()), "name": "Sophie Martin", "image": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200", "category": "Lifestyle", "followers": 45000, "engagement_rate": 5.2, "price": 500, "bio": "Passionnée de mode et de lifestyle à Lausanne", "is_available": True},
            {"id": str(uuid.uuid4()), "name": "Lucas Dubois", "image": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200", "category": "Food", "followers": 128000, "engagement_rate": 4.8, "price": 1200, "bio": "Chef et critique culinaire suisse", "is_available": True},
            {"id": str(uuid.uuid4()), "name": "Emma Bernard", "image": "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200", "category": "Beauty", "followers": 89000, "engagement_rate": 6.1, "price": 800, "bio": "Maquilleuse professionnelle et consultante beauté", "is_available": True},
            {"id": str(uuid.uuid4()), "name": "Thomas Petit", "image": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200", "category": "Tech", "followers": 210000, "engagement_rate": 3.9, "price": 1500, "bio": "Tech reviewer et entrepreneur", "is_available": True},
            {"id": str(uuid.uuid4()), "name": "Julie Rochat", "image": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200", "category": "Sport", "followers": 67000, "engagement_rate": 7.2, "price": 600, "bio": "Coach fitness et wellness", "is_available": True},
            {"id": str(uuid.uuid4()), "name": "Marc Favre", "image": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200", "category": "Travel", "followers": 156000, "engagement_rate": 4.5, "price": 1100, "bio": "Photographe de voyage et aventurier", "is_available": True},
            {"id": str(uuid.uuid4()), "name": "Clara Meyer", "image": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200", "category": "Lifestyle", "followers": 92000, "engagement_rate": 5.8, "price": 900, "bio": "Blogueuse lifestyle et déco d'intérieur", "is_available": True},
            {"id": str(uuid.uuid4()), "name": "Antoine Muller", "image": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200", "category": "Food", "followers": 73000, "engagement_rate": 6.4, "price": 700, "bio": "Sommelier et critique gastronomique", "is_available": True},
        ]
        for inf in default_influencers:
            inf['created_at'] = datetime.now(timezone.utc).isoformat()
            await db.influencers.insert_one(inf)
        influencers = default_influencers
    
    return {"influencers": influencers, "total": len(influencers)}

@api_router.get("/enterprise/influencer-collaborations")
async def get_influencer_collaborations(current_user: dict = Depends(get_current_user)):
    enterprise = await db.enterprises.find_one({"user_id": current_user['id']})
    if not enterprise:
        raise HTTPException(status_code=404, detail="Entreprise non trouvée")
    
    collaborations = await db.influencer_collaborations.find({"enterprise_id": enterprise['id']}, {"_id": 0}).sort("created_at", -1).to_list(100)
    
    # Enrich with influencer data
    for collab in collaborations:
        influencer = await db.influencers.find_one({"id": collab.get('influencer_id')}, {"_id": 0})
        collab['influencer'] = influencer
    
    total_investment = sum(c.get('budget', 0) for c in collaborations if c.get('status') in ['active', 'completed'])
    active_count = len([c for c in collaborations if c.get('status') == 'active'])
    
    return {
        "collaborations": collaborations,
        "stats": {
            "total_collaborations": len(collaborations),
            "active_collaborations": active_count,
            "total_investment": total_investment
        }
    }

@api_router.post("/enterprise/influencer-collaborations")
async def create_influencer_collaboration(influencer_id: str, message: Optional[str] = None, budget: float = 0, current_user: dict = Depends(get_current_user)):
    enterprise = await db.enterprises.find_one({"user_id": current_user['id']})
    if not enterprise:
        raise HTTPException(status_code=404, detail="Entreprise non trouvée")
    
    influencer = await db.influencers.find_one({"id": influencer_id})
    if not influencer:
        raise HTTPException(status_code=404, detail="Influenceur non trouvé")
    
    collab = InfluencerCollaboration(
        enterprise_id=enterprise['id'],
        influencer_id=influencer_id,
        message=message,
        budget=budget or influencer.get('price', 0)
    )
    
    collab_dict = collab.model_dump()
    collab_dict['created_at'] = collab_dict['created_at'].isoformat()
    await db.influencer_collaborations.insert_one(collab_dict)
    
    collab_dict.pop('_id', None)
    influencer_clean = {k: v for k, v in influencer.items() if k != '_id'}
    return {**collab_dict, "influencer": influencer_clean}

# --- Client Invitations ---
@api_router.get("/enterprise/invitations")
async def get_client_invitations(current_user: dict = Depends(get_current_user)):
    enterprise = await db.enterprises.find_one({"user_id": current_user['id']})
    if not enterprise:
        raise HTTPException(status_code=404, detail="Entreprise non trouvée")
    
    invitations = await db.client_invitations.find({"enterprise_id": enterprise['id']}, {"_id": 0}).sort("created_at", -1).to_list(100)
    
    total_sent = sum(i.get('sent_count', 0) for i in invitations)
    total_opened = sum(i.get('opened_count', 0) for i in invitations)
    total_responses = sum(i.get('response_count', 0) for i in invitations)
    
    return {
        "invitations": invitations,
        "stats": {
            "total_sent": total_sent,
            "total_opened": total_opened,
            "total_responses": total_responses,
            "open_rate": round((total_opened / total_sent * 100), 1) if total_sent > 0 else 0,
            "response_rate": round((total_responses / total_opened * 100), 1) if total_opened > 0 else 0
        }
    }

@api_router.post("/enterprise/invitations")
async def create_client_invitation(invitation_data: ClientInvitationCreate, current_user: dict = Depends(get_current_user)):
    enterprise = await db.enterprises.find_one({"user_id": current_user['id']})
    if not enterprise:
        raise HTTPException(status_code=404, detail="Entreprise non trouvée")
    
    # Simulate sending based on target audience
    base_count = 500
    if invitation_data.target_audience == 'all':
        base_count = 1000
    elif invitation_data.target_audience == 'loyal':
        base_count = 300
    elif invitation_data.target_audience == 'inactive':
        base_count = 400
    
    sent_count = base_count + random.randint(50, 200)
    opened_count = int(sent_count * (0.5 + random.random() * 0.3))
    response_count = int(opened_count * (0.1 + random.random() * 0.2))
    
    invitation = ClientInvitation(
        enterprise_id=enterprise['id'],
        **invitation_data.model_dump(),
        sent_count=sent_count,
        opened_count=opened_count,
        response_count=response_count
    )
    
    invitation_dict = invitation.model_dump()
    invitation_dict['created_at'] = invitation_dict['created_at'].isoformat()
    await db.client_invitations.insert_one(invitation_dict)
    
    invitation_dict.pop('_id', None)
    return invitation_dict

@api_router.delete("/enterprise/invitations/{invitation_id}")
async def delete_client_invitation(invitation_id: str, current_user: dict = Depends(get_current_user)):
    enterprise = await db.enterprises.find_one({"user_id": current_user['id']})
    if not enterprise:
        raise HTTPException(status_code=404, detail="Entreprise non trouvée")
    
    await db.client_invitations.delete_one({"id": invitation_id, "enterprise_id": enterprise['id']})
    return {"message": "Invitation supprimée"}

@api_router.put("/enterprise/invitations/{invitation_id}/toggle")
async def toggle_client_invitation(invitation_id: str, current_user: dict = Depends(get_current_user)):
    enterprise = await db.enterprises.find_one({"user_id": current_user['id']})
    if not enterprise:
        raise HTTPException(status_code=404, detail="Entreprise non trouvée")
    
    invitation = await db.client_invitations.find_one({"id": invitation_id, "enterprise_id": enterprise['id']})
    if not invitation:
        raise HTTPException(status_code=404, detail="Invitation non trouvée")
    
    new_status = "paused" if invitation.get('status') == 'active' else "active"
    await db.client_invitations.update_one(
        {"id": invitation_id},
        {"$set": {"status": new_status}}
    )
    return {"message": "Statut mis à jour", "status": new_status}

# --- Commercial Gestures ---
@api_router.get("/enterprise/commercial-gestures")
async def get_commercial_gestures(current_user: dict = Depends(get_current_user)):
    enterprise = await db.enterprises.find_one({"user_id": current_user['id']})
    if not enterprise:
        raise HTTPException(status_code=404, detail="Entreprise non trouvée")
    
    gestures = await db.commercial_gestures.find({"enterprise_id": enterprise['id']}, {"_id": 0}).sort("created_at", -1).to_list(100)
    
    active_count = len([g for g in gestures if g.get('is_active')])
    total_uses = sum(g.get('uses_count', 0) for g in gestures)
    
    return {
        "gestures": gestures,
        "stats": {
            "total_gestures": len(gestures),
            "active_gestures": active_count,
            "total_uses": total_uses
        }
    }

@api_router.post("/enterprise/commercial-gestures")
async def create_commercial_gesture(gesture_data: CommercialGestureCreate, current_user: dict = Depends(get_current_user)):
    enterprise = await db.enterprises.find_one({"user_id": current_user['id']})
    if not enterprise:
        raise HTTPException(status_code=404, detail="Entreprise non trouvée")
    
    gesture = CommercialGesture(
        enterprise_id=enterprise['id'],
        **gesture_data.model_dump()
    )
    
    gesture_dict = gesture.model_dump()
    gesture_dict['created_at'] = gesture_dict['created_at'].isoformat()
    await db.commercial_gestures.insert_one(gesture_dict)
    
    gesture_dict.pop('_id', None)
    return gesture_dict

@api_router.put("/enterprise/commercial-gestures/{gesture_id}/toggle")
async def toggle_commercial_gesture(gesture_id: str, current_user: dict = Depends(get_current_user)):
    enterprise = await db.enterprises.find_one({"user_id": current_user['id']})
    if not enterprise:
        raise HTTPException(status_code=404, detail="Entreprise non trouvée")
    
    gesture = await db.commercial_gestures.find_one({"id": gesture_id, "enterprise_id": enterprise['id']})
    if not gesture:
        raise HTTPException(status_code=404, detail="Geste commercial non trouvé")
    
    new_status = not gesture.get('is_active', True)
    await db.commercial_gestures.update_one({"id": gesture_id}, {"$set": {"is_active": new_status}})
    
    return {"is_active": new_status}

@api_router.delete("/enterprise/commercial-gestures/{gesture_id}")
async def delete_commercial_gesture(gesture_id: str, current_user: dict = Depends(get_current_user)):
    enterprise = await db.enterprises.find_one({"user_id": current_user['id']})
    if not enterprise:
        raise HTTPException(status_code=404, detail="Entreprise non trouvée")
    
    await db.commercial_gestures.delete_one({"id": gesture_id, "enterprise_id": enterprise['id']})
    return {"message": "Geste commercial supprimé"}

# ============ NOTIFICATIONS ROUTES ============

class NotificationCreate(BaseModel):
    title: str
    message: str
    notification_type: str = "info"  # info, order, alert, promotion
    link: Optional[str] = None
    data: Optional[Dict[str, Any]] = None

@api_router.get("/notifications")
async def get_notifications(current_user: dict = Depends(get_current_user), limit: int = 50, unread_only: bool = False):
    query = {"user_id": current_user['id']}
    if unread_only:
        query["is_read"] = False
    
    notifications = await db.notifications.find(query, {"_id": 0}).sort("created_at", -1).limit(limit).to_list(limit)
    unread_count = await db.notifications.count_documents({"user_id": current_user['id'], "is_read": False})
    
    return {"notifications": notifications, "unread_count": unread_count}

@api_router.post("/notifications")
async def create_notification(notification: NotificationCreate, user_id: str, current_user: dict = Depends(get_current_user)):
    # Only enterprise or admin can create notifications for users
    if current_user['user_type'] not in ['entreprise', 'admin']:
        raise HTTPException(status_code=403, detail="Non autorisé")
    
    notification_doc = {
        "id": str(uuid.uuid4()),
        "user_id": user_id,
        "sender_id": current_user['id'],
        **notification.model_dump(),
        "is_read": False,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.notifications.insert_one(notification_doc)
    del notification_doc['_id']
    return notification_doc

@api_router.put("/notifications/{notification_id}/read")
async def mark_notification_read(notification_id: str, current_user: dict = Depends(get_current_user)):
    result = await db.notifications.update_one(
        {"id": notification_id, "user_id": current_user['id']},
        {"$set": {"is_read": True, "read_at": datetime.now(timezone.utc).isoformat()}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Notification non trouvée")
    return {"message": "Notification marquée comme lue"}

@api_router.put("/notifications/read-all")
async def mark_all_notifications_read(current_user: dict = Depends(get_current_user)):
    await db.notifications.update_many(
        {"user_id": current_user['id'], "is_read": False},
        {"$set": {"is_read": True, "read_at": datetime.now(timezone.utc).isoformat()}}
    )
    return {"message": "Toutes les notifications marquées comme lues"}

@api_router.delete("/notifications/{notification_id}")
async def delete_notification(notification_id: str, current_user: dict = Depends(get_current_user)):
    result = await db.notifications.delete_one({"id": notification_id, "user_id": current_user['id']})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Notification non trouvée")
    return {"message": "Notification supprimée"}

# ============ IMAGE UPLOAD ROUTES ============

ALLOWED_EXTENSIONS = {'.jpg', '.jpeg', '.png', '.gif', '.webp'}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB

@api_router.post("/upload/image")
async def upload_image(file: UploadFile = File(...), current_user: dict = Depends(get_current_user)):
    """Upload an image file and return the URL"""
    # Check file extension
    file_ext = Path(file.filename).suffix.lower()
    if file_ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail=f"Type de fichier non autorisé. Utilisez: {', '.join(ALLOWED_EXTENSIONS)}")
    
    # Check file size
    contents = await file.read()
    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="Fichier trop volumineux (max 5MB)")
    
    # Generate unique filename
    unique_filename = f"{uuid.uuid4()}{file_ext}"
    file_path = UPLOADS_DIR / unique_filename
    
    # Save file
    with open(file_path, "wb") as f:
        f.write(contents)
    
    # Return URL
    image_url = f"/api/uploads/{unique_filename}"
    return {"url": image_url, "filename": unique_filename}

@api_router.post("/upload/image-base64")
async def upload_image_base64(data: dict, current_user: dict = Depends(get_current_user)):
    """Upload an image from base64 data"""
    try:
        base64_data = data.get("image", "")
        filename = data.get("filename", "image.jpg")
        
        # Remove data URL prefix if present
        if "," in base64_data:
            base64_data = base64_data.split(",")[1]
        
        # Decode base64
        image_bytes = base64.b64decode(base64_data)
        
        # Check file size
        if len(image_bytes) > MAX_FILE_SIZE:
            raise HTTPException(status_code=400, detail="Fichier trop volumineux (max 5MB)")
        
        # Get extension
        file_ext = Path(filename).suffix.lower()
        if file_ext not in ALLOWED_EXTENSIONS:
            file_ext = ".jpg"
        
        # Generate unique filename
        unique_filename = f"{uuid.uuid4()}{file_ext}"
        file_path = UPLOADS_DIR / unique_filename
        
        # Save file
        with open(file_path, "wb") as f:
            f.write(image_bytes)
        
        # Return URL
        image_url = f"/api/uploads/{unique_filename}"
        return {"url": image_url, "filename": unique_filename}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Erreur lors de l'upload: {str(e)}")

# ============ CLIENT PROFILE & FRIENDS ROUTES ============

class ClientProfileUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone: Optional[str] = None
    city: Optional[str] = None
    avatar: Optional[str] = None
    linkedin: Optional[str] = None
    bio: Optional[str] = None

@api_router.put("/client/profile")
async def update_client_profile(profile_data: ClientProfileUpdate, current_user: dict = Depends(get_current_user)):
    """Update client profile"""
    update_data = {k: v for k, v in profile_data.model_dump().items() if v is not None}
    if update_data:
        await db.users.update_one({"id": current_user['id']}, {"$set": update_data})
    
    updated_user = await db.users.find_one({"id": current_user['id']}, {"_id": 0, "password_hash": 0})
    return updated_user

@api_router.get("/client/profile")
async def get_client_profile(current_user: dict = Depends(get_current_user)):
    """Get client profile with stats"""
    user = await db.users.find_one({"id": current_user['id']}, {"_id": 0, "password_hash": 0})
    
    # Get real stats
    profile_views = await db.profile_views.count_documents({"viewed_user_id": current_user['id']})
    friends_count = await db.friendships.count_documents({
        "$or": [{"user_id": current_user['id']}, {"friend_id": current_user['id']}],
        "status": "accepted"
    })
    orders_count = await db.orders.count_documents({"user_id": current_user['id']})
    
    return {
        "user": user,
        "stats": {
            "profile_views": profile_views,
            "friends_count": friends_count,
            "orders_count": orders_count
        }
    }

# --- Friends System ---
class FriendRequestCreate(BaseModel):
    friend_id: str
    message: Optional[str] = None

@api_router.get("/client/friends")
async def get_friends_list(current_user: dict = Depends(get_current_user)):
    """Get list of friends"""
    friendships = await db.friendships.find({
        "$or": [{"user_id": current_user['id']}, {"friend_id": current_user['id']}],
        "status": "accepted"
    }, {"_id": 0}).to_list(100)
    
    friends = []
    for friendship in friendships:
        friend_user_id = friendship['friend_id'] if friendship['user_id'] == current_user['id'] else friendship['user_id']
        friend = await db.users.find_one({"id": friend_user_id}, {"_id": 0, "password_hash": 0})
        if friend:
            friends.append({**friend, "friendship_id": friendship['id'], "since": friendship.get('accepted_at')})
    
    return {"friends": friends, "count": len(friends)}

@api_router.get("/client/friend-requests")
async def get_friend_requests(current_user: dict = Depends(get_current_user)):
    """Get pending friend requests"""
    # Requests received
    received = await db.friendships.find({
        "friend_id": current_user['id'],
        "status": "pending"
    }, {"_id": 0}).to_list(50)
    
    for req in received:
        sender = await db.users.find_one({"id": req['user_id']}, {"_id": 0, "password_hash": 0})
        req['sender'] = sender
    
    # Requests sent
    sent = await db.friendships.find({
        "user_id": current_user['id'],
        "status": "pending"
    }, {"_id": 0}).to_list(50)
    
    for req in sent:
        recipient = await db.users.find_one({"id": req['friend_id']}, {"_id": 0, "password_hash": 0})
        req['recipient'] = recipient
    
    return {"received": received, "sent": sent}

@api_router.post("/client/friends/request")
async def send_friend_request(request: FriendRequestCreate, current_user: dict = Depends(get_current_user)):
    """Send a friend request"""
    if request.friend_id == current_user['id']:
        raise HTTPException(status_code=400, detail="Vous ne pouvez pas vous ajouter vous-même")
    
    # Check if friendship already exists
    existing = await db.friendships.find_one({
        "$or": [
            {"user_id": current_user['id'], "friend_id": request.friend_id},
            {"user_id": request.friend_id, "friend_id": current_user['id']}
        ]
    })
    if existing:
        raise HTTPException(status_code=400, detail="Une demande d'ami existe déjà")
    
    friendship = {
        "id": str(uuid.uuid4()),
        "user_id": current_user['id'],
        "friend_id": request.friend_id,
        "message": request.message,
        "status": "pending",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.friendships.insert_one(friendship)
    
    # Create notification for the recipient
    sender = await db.users.find_one({"id": current_user['id']}, {"_id": 0, "password_hash": 0})
    notification = {
        "id": str(uuid.uuid4()),
        "user_id": request.friend_id,
        "title": "Nouvelle demande d'ami",
        "message": f"{sender['first_name']} {sender['last_name']} souhaite vous ajouter comme ami",
        "notification_type": "friend_request",
        "data": {"friendship_id": friendship['id'], "sender_id": current_user['id']},
        "is_read": False,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.notifications.insert_one(notification)
    
    del friendship['_id']
    return friendship

@api_router.put("/client/friends/{friendship_id}/respond")
async def respond_to_friend_request(friendship_id: str, accept: bool, current_user: dict = Depends(get_current_user)):
    """Accept or decline a friend request"""
    friendship = await db.friendships.find_one({
        "id": friendship_id,
        "friend_id": current_user['id'],
        "status": "pending"
    })
    if not friendship:
        raise HTTPException(status_code=404, detail="Demande d'ami non trouvée")
    
    if accept:
        await db.friendships.update_one(
            {"id": friendship_id},
            {"$set": {"status": "accepted", "accepted_at": datetime.now(timezone.utc).isoformat()}}
        )
        # Notify the sender
        user = await db.users.find_one({"id": current_user['id']}, {"_id": 0, "password_hash": 0})
        notification = {
            "id": str(uuid.uuid4()),
            "user_id": friendship['user_id'],
            "title": "Demande d'ami acceptée",
            "message": f"{user['first_name']} {user['last_name']} a accepté votre demande d'ami",
            "notification_type": "friend_accepted",
            "is_read": False,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.notifications.insert_one(notification)
        return {"message": "Demande acceptée", "status": "accepted"}
    else:
        await db.friendships.delete_one({"id": friendship_id})
        return {"message": "Demande refusée", "status": "declined"}

@api_router.delete("/client/friends/{friendship_id}")
async def remove_friend(friendship_id: str, current_user: dict = Depends(get_current_user)):
    """Remove a friend"""
    result = await db.friendships.delete_one({
        "id": friendship_id,
        "$or": [{"user_id": current_user['id']}, {"friend_id": current_user['id']}]
    })
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Ami non trouvé")
    return {"message": "Ami supprimé"}

@api_router.get("/client/suggested-friends")
async def get_suggested_friends(current_user: dict = Depends(get_current_user), limit: int = 10):
    """Get suggested friends (other clients)"""
    # Get IDs of existing friends
    friendships = await db.friendships.find({
        "$or": [{"user_id": current_user['id']}, {"friend_id": current_user['id']}]
    }).to_list(1000)
    
    friend_ids = set()
    for f in friendships:
        friend_ids.add(f['user_id'])
        friend_ids.add(f['friend_id'])
    friend_ids.add(current_user['id'])
    
    # Find clients who are not already friends
    clients = await db.users.find({
        "id": {"$nin": list(friend_ids)},
        "user_type": "client"
    }, {"_id": 0, "password_hash": 0}).limit(limit).to_list(limit)
    
    return {"suggestions": clients}

# --- Payment Cards ---
class PaymentCardCreate(BaseModel):
    card_holder: str
    card_number_last4: str
    card_type: str = "visa"  # visa, mastercard, amex
    expiry_month: int
    expiry_year: int
    is_default: bool = False

@api_router.get("/client/cards")
async def get_payment_cards(current_user: dict = Depends(get_current_user)):
    """Get saved payment cards"""
    cards = await db.payment_cards.find({"user_id": current_user['id']}, {"_id": 0}).to_list(20)
    return {"cards": cards}

@api_router.post("/client/cards")
async def add_payment_card(card: PaymentCardCreate, current_user: dict = Depends(get_current_user)):
    """Add a payment card"""
    # If this is the first card or marked as default, unset other defaults
    if card.is_default:
        await db.payment_cards.update_many(
            {"user_id": current_user['id']},
            {"$set": {"is_default": False}}
        )
    
    card_doc = {
        "id": str(uuid.uuid4()),
        "user_id": current_user['id'],
        **card.model_dump(),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.payment_cards.insert_one(card_doc)
    del card_doc['_id']
    return card_doc

@api_router.delete("/client/cards/{card_id}")
async def delete_payment_card(card_id: str, current_user: dict = Depends(get_current_user)):
    """Delete a payment card"""
    result = await db.payment_cards.delete_one({"id": card_id, "user_id": current_user['id']})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Carte non trouvée")
    return {"message": "Carte supprimée"}

@api_router.put("/client/cards/{card_id}/default")
async def set_default_card(card_id: str, current_user: dict = Depends(get_current_user)):
    """Set a card as default"""
    await db.payment_cards.update_many(
        {"user_id": current_user['id']},
        {"$set": {"is_default": False}}
    )
    await db.payment_cards.update_one(
        {"id": card_id, "user_id": current_user['id']},
        {"$set": {"is_default": True}}
    )
    return {"message": "Carte par défaut mise à jour"}

# --- Client Documents ---
class ClientDocumentCreate(BaseModel):
    name: str
    category: str = "general"  # general, factures, contrats, autres
    url: str
    file_type: Optional[str] = None

@api_router.get("/client/documents")
async def get_client_documents(current_user: dict = Depends(get_current_user), category: Optional[str] = None):
    """Get client documents"""
    query = {"user_id": current_user['id']}
    if category:
        query["category"] = category
    documents = await db.client_documents.find(query, {"_id": 0}).sort("created_at", -1).to_list(100)
    return {"documents": documents}

@api_router.post("/client/documents")
async def add_client_document(doc: ClientDocumentCreate, current_user: dict = Depends(get_current_user)):
    """Add a document"""
    doc_entry = {
        "id": str(uuid.uuid4()),
        "user_id": current_user['id'],
        **doc.model_dump(),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.client_documents.insert_one(doc_entry)
    del doc_entry['_id']
    return doc_entry

@api_router.delete("/client/documents/{doc_id}")
async def delete_client_document(doc_id: str, current_user: dict = Depends(get_current_user)):
    """Delete a document"""
    result = await db.client_documents.delete_one({"id": doc_id, "user_id": current_user['id']})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Document non trouvé")
    return {"message": "Document supprimé"}

# --- Messaging System ---
class MessageCreate(BaseModel):
    recipient_id: str
    content: str
    message_type: str = "text"  # text, image, file

@api_router.get("/messages/conversations")
async def get_conversations(current_user: dict = Depends(get_current_user)):
    """Get all conversations for current user"""
    # Find all unique conversation partners
    pipeline = [
        {"$match": {"$or": [{"sender_id": current_user['id']}, {"recipient_id": current_user['id']}]}},
        {"$sort": {"created_at": -1}},
        {"$group": {
            "_id": {
                "$cond": [
                    {"$eq": ["$sender_id", current_user['id']]},
                    "$recipient_id",
                    "$sender_id"
                ]
            },
            "last_message": {"$first": "$$ROOT"},
            "unread_count": {
                "$sum": {
                    "$cond": [
                        {"$and": [
                            {"$eq": ["$recipient_id", current_user['id']]},
                            {"$eq": ["$is_read", False]}
                        ]},
                        1,
                        0
                    ]
                }
            }
        }}
    ]
    
    conversations_raw = await db.messages.aggregate(pipeline).to_list(50)
    
    conversations = []
    for conv in conversations_raw:
        partner_id = conv['_id']
        partner = await db.users.find_one({"id": partner_id}, {"_id": 0, "password_hash": 0})
        if not partner:
            # Check if it's an enterprise
            enterprise = await db.enterprises.find_one({"id": partner_id}, {"_id": 0})
            if enterprise:
                partner = {"id": partner_id, "first_name": enterprise['business_name'], "last_name": "", "user_type": "entreprise"}
        
        if partner:
            last_msg = conv['last_message']
            last_msg.pop('_id', None)
            conversations.append({
                "partner": partner,
                "last_message": last_msg,
                "unread_count": conv['unread_count']
            })
    
    return {"conversations": conversations}

@api_router.get("/messages/{partner_id}")
async def get_messages_with_partner(partner_id: str, current_user: dict = Depends(get_current_user), limit: int = 50):
    """Get messages with a specific partner"""
    messages = await db.messages.find({
        "$or": [
            {"sender_id": current_user['id'], "recipient_id": partner_id},
            {"sender_id": partner_id, "recipient_id": current_user['id']}
        ]
    }, {"_id": 0}).sort("created_at", -1).limit(limit).to_list(limit)
    
    # Mark as read
    await db.messages.update_many(
        {"sender_id": partner_id, "recipient_id": current_user['id'], "is_read": False},
        {"$set": {"is_read": True, "read_at": datetime.now(timezone.utc).isoformat()}}
    )
    
    # Get partner info
    partner = await db.users.find_one({"id": partner_id}, {"_id": 0, "password_hash": 0})
    if not partner:
        enterprise = await db.enterprises.find_one({"id": partner_id}, {"_id": 0})
        if enterprise:
            partner = {"id": partner_id, "first_name": enterprise['business_name'], "last_name": "", "user_type": "entreprise"}
    
    return {"messages": list(reversed(messages)), "partner": partner}

@api_router.post("/messages")
async def send_message(message: MessageCreate, current_user: dict = Depends(get_current_user)):
    """Send a message"""
    msg_doc = {
        "id": str(uuid.uuid4()),
        "sender_id": current_user['id'],
        "recipient_id": message.recipient_id,
        "content": message.content,
        "message_type": message.message_type,
        "is_read": False,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.messages.insert_one(msg_doc)
    
    # Create notification
    sender = await db.users.find_one({"id": current_user['id']}, {"_id": 0, "password_hash": 0})
    notification = {
        "id": str(uuid.uuid4()),
        "user_id": message.recipient_id,
        "title": "Nouveau message",
        "message": f"{sender['first_name']} vous a envoyé un message",
        "notification_type": "message",
        "data": {"sender_id": current_user['id']},
        "is_read": False,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.notifications.insert_one(notification)
    
    del msg_doc['_id']
    return msg_doc

# --- Profile Views Tracking ---
@api_router.post("/track/profile-view/{user_id}")
async def track_profile_view(user_id: str, current_user: dict = Depends(get_current_user)):
    """Track a profile view"""
    if user_id == current_user['id']:
        return {"message": "Self-view not tracked"}
    
    view_doc = {
        "id": str(uuid.uuid4()),
        "viewed_user_id": user_id,
        "viewer_id": current_user['id'],
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.profile_views.insert_one(view_doc)
    return {"message": "View tracked"}

@api_router.get("/stats/profile-views")
async def get_profile_view_stats(current_user: dict = Depends(get_current_user)):
    """Get profile view statistics"""
    total_views = await db.profile_views.count_documents({"viewed_user_id": current_user['id']})
    
    # Views in last 30 days
    thirty_days_ago = (datetime.now(timezone.utc) - timedelta(days=30)).isoformat()
    recent_views = await db.profile_views.count_documents({
        "viewed_user_id": current_user['id'],
        "created_at": {"$gte": thirty_days_ago}
    })
    
    return {
        "total_views": total_views,
        "recent_views": recent_views,
        "period": "30 days"
    }

# ============ INFLUENCER PROFILE ROUTES ============

class InfluencerProfileCreate(BaseModel):
    category: str
    bio: Optional[str] = None
    instagram: Optional[str] = None
    tiktok: Optional[str] = None
    facebook: Optional[str] = None
    followers_count: Optional[str] = None
    price: float = 500

class InfluencerProfileUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    bio: Optional[str] = None
    instagram: Optional[str] = None
    tiktok: Optional[str] = None
    facebook: Optional[str] = None
    price: Optional[float] = None
    image: Optional[str] = None

@api_router.get("/influencer/profile")
async def get_influencer_profile(current_user: dict = Depends(get_current_user)):
    """Get current user's influencer profile"""
    profile = await db.influencer_profiles.find_one({"user_id": current_user['id']}, {"_id": 0})
    if not profile:
        # Create a default profile if none exists
        user = await db.users.find_one({"id": current_user['id']}, {"_id": 0})
        profile = {
            "id": str(uuid.uuid4()),
            "user_id": current_user['id'],
            "name": f"{user.get('first_name', '')} {user.get('last_name', '')}".strip() or "Influenceur",
            "category": "Lifestyle",
            "followers": 0,
            "engagement_rate": 0,
            "price": 500,
            "bio": "",
            "instagram": "",
            "tiktok": "",
            "facebook": "",
            "image": user.get('avatar', ''),
            "total_views": 0,
            "total_likes": 0,
            "total_shares": 0,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.influencer_profiles.insert_one(profile)
    
    # Get collaborations for this influencer
    collaborations = await db.influencer_collaborations.find(
        {"influencer_id": profile['id']}, 
        {"_id": 0}
    ).sort("created_at", -1).to_list(50)
    
    # Calculate stats
    total_investment = sum(c.get('budget', 0) for c in collaborations if c.get('status') == 'active')
    total_collaborations = len([c for c in collaborations if c.get('status') == 'completed'])
    
    return {
        "profile": profile,
        "collaborations": collaborations,
        "stats": {
            "total_investment": total_investment,
            "total_collaborations": total_collaborations,
            "active_collaborations": len([c for c in collaborations if c.get('status') == 'active']),
            "pending_requests": len([c for c in collaborations if c.get('status') == 'pending'])
        }
    }

@api_router.put("/influencer/profile")
async def update_influencer_profile(profile_data: InfluencerProfileUpdate, current_user: dict = Depends(get_current_user)):
    """Update influencer profile"""
    profile = await db.influencer_profiles.find_one({"user_id": current_user['id']})
    if not profile:
        raise HTTPException(status_code=404, detail="Profil influenceur non trouvé")
    
    update_data = {k: v for k, v in profile_data.model_dump().items() if v is not None}
    if update_data:
        await db.influencer_profiles.update_one(
            {"user_id": current_user['id']},
            {"$set": update_data}
        )
    
    updated_profile = await db.influencer_profiles.find_one({"user_id": current_user['id']}, {"_id": 0})
    return updated_profile

@api_router.post("/influencer/profile")
async def create_influencer_profile(profile_data: InfluencerProfileCreate, current_user: dict = Depends(get_current_user)):
    """Create influencer profile for current user"""
    existing = await db.influencer_profiles.find_one({"user_id": current_user['id']})
    if existing:
        raise HTTPException(status_code=400, detail="Profil influenceur existe déjà")
    
    user = await db.users.find_one({"id": current_user['id']}, {"_id": 0})
    
    # Estimate followers from followers_count range
    followers_map = {
        "1k-5k": 3000,
        "5k-10k": 7500,
        "10k-50k": 30000,
        "50k-100k": 75000,
        "100k+": 150000
    }
    followers = followers_map.get(profile_data.followers_count, 5000)
    
    profile = {
        "id": str(uuid.uuid4()),
        "user_id": current_user['id'],
        "name": f"{user.get('first_name', '')} {user.get('last_name', '')}".strip() or "Influenceur",
        "category": profile_data.category,
        "followers": followers,
        "engagement_rate": round(3 + random.random() * 4, 1),  # Random engagement 3-7%
        "price": profile_data.price,
        "bio": profile_data.bio or "",
        "instagram": profile_data.instagram or "",
        "tiktok": profile_data.tiktok or "",
        "facebook": profile_data.facebook or "",
        "image": user.get('avatar', ''),
        "total_views": random.randint(50000, 200000),
        "total_likes": random.randint(5000, 15000),
        "total_shares": random.randint(500, 2000),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.influencer_profiles.insert_one(profile)
    
    # Also add to the public influencers list
    influencer_entry = {
        "id": profile['id'],
        "name": profile['name'],
        "image": profile['image'] or f"https://ui-avatars.com/api/?name={profile['name']}&background=D4AF37&color=fff",
        "category": profile['category'],
        "followers": profile['followers'],
        "engagement_rate": profile['engagement_rate'],
        "price": profile['price'],
        "bio": profile['bio'],
        "instagram": profile['instagram'],
        "is_available": True,
        "created_at": profile['created_at']
    }
    await db.influencers.insert_one(influencer_entry)
    
    profile.pop('_id', None)
    return profile

@api_router.put("/influencer/collaborations/{collab_id}/respond")
async def respond_to_collaboration(collab_id: str, accept: bool, current_user: dict = Depends(get_current_user)):
    """Accept or decline a collaboration request"""
    profile = await db.influencer_profiles.find_one({"user_id": current_user['id']})
    if not profile:
        raise HTTPException(status_code=404, detail="Profil influenceur non trouvé")
    
    collab = await db.influencer_collaborations.find_one({"id": collab_id, "influencer_id": profile['id']})
    if not collab:
        raise HTTPException(status_code=404, detail="Collaboration non trouvée")
    
    new_status = "active" if accept else "declined"
    await db.influencer_collaborations.update_one(
        {"id": collab_id},
        {"$set": {"status": new_status, "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    
    return {"message": f"Collaboration {'acceptée' if accept else 'déclinée'}", "status": new_status}

@api_router.get("/influencer/collaborations")
async def get_influencer_collaborations_list(current_user: dict = Depends(get_current_user)):
    """Get collaborations for the current influencer"""
    profile = await db.influencer_profiles.find_one({"user_id": current_user['id']})
    if not profile:
        return {"collaborations": [], "stats": {}}
    
    collaborations = await db.influencer_collaborations.find(
        {"influencer_id": profile['id']}, 
        {"_id": 0}
    ).sort("created_at", -1).to_list(100)
    
    # Enrich with enterprise data
    for collab in collaborations:
        enterprise = await db.enterprises.find_one({"id": collab.get('enterprise_id')}, {"_id": 0})
        if enterprise:
            collab['enterprise_name'] = enterprise.get('business_name', 'Entreprise')
            collab['enterprise_logo'] = enterprise.get('logo', '')
    
    total_investment = sum(c.get('budget', 0) for c in collaborations if c.get('status') in ['active', 'completed'])
    
    return {
        "collaborations": collaborations,
        "stats": {
            "total_investment": total_investment,
            "total_collaborations": len(collaborations),
            "active_collaborations": len([c for c in collaborations if c.get('status') == 'active']),
            "pending_requests": len([c for c in collaborations if c.get('status') == 'pending'])
        }
    }

# ============ ROOT ROUTE ============

@api_router.get("/")
async def root():
    return {"message": "Bienvenue sur l'API Titelli", "version": "2.0.0"}

# ============ HEALTH CHECK ============

@api_router.get("/health")
async def health_check():
    return {"status": "healthy"}

# Include the router in the main app
app.include_router(api_router)

# Mount uploads folder for serving static images
app.mount("/api/uploads", StaticFiles(directory=str(UPLOADS_DIR)), name="uploads")

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
