from fastapi import FastAPI, APIRouter, HTTPException, Depends, Request, Header
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone
import bcrypt
import jwt
from emergentintegrations.payments.stripe.checkout import StripeCheckout, CheckoutSessionResponse, CheckoutStatusResponse, CheckoutSessionRequest

ROOT_DIR = Path(__file__).parent
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

# Subscription Plans
SUBSCRIPTION_PLANS = {
    "annual": {"name": "Abonnement Annuel", "price": 250.0, "duration_months": 12},
    "premium_annual": {"name": "Premium Annuel", "price": 540.0, "duration_months": 12},
    "premium_monthly": {"name": "Premium Mensuel", "price": 45.0, "duration_months": 1},
}

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

@api_router.get("/enterprise/jobs")
async def get_enterprise_jobs(current_user: dict = Depends(get_current_user)):
    enterprise = await db.enterprises.find_one({"user_id": current_user['id']})
    if not enterprise:
        return []
    jobs = await db.jobs.find({"enterprise_id": enterprise['id']}, {"_id": 0}).to_list(100)
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
        **job.model_dump(),
        "is_active": True,
        "applications": 0,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.jobs.insert_one(job_doc)
    del job_doc['_id']
    return job_doc

@api_router.delete("/enterprise/jobs/{job_id}")
async def delete_job(job_id: str, current_user: dict = Depends(get_current_user)):
    enterprise = await db.enterprises.find_one({"user_id": current_user['id']})
    if not enterprise:
        raise HTTPException(status_code=404, detail="Entreprise non trouvée")
    
    await db.jobs.delete_one({"id": job_id, "enterprise_id": enterprise['id']})
    return {"message": "Offre d'emploi supprimée"}

@api_router.get("/jobs")
async def get_all_jobs(job_type: Optional[str] = None, limit: int = 50):
    query = {"is_active": True}
    if job_type:
        query["job_type"] = job_type
    jobs = await db.jobs.find(query, {"_id": 0}).sort("created_at", -1).limit(limit).to_list(limit)
    return jobs

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
        "is_active": True,
        "is_approved": False,  # Requires admin approval
        "impressions": 0,
        "clicks": 0,
        "spent": 0,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.advertising.insert_one(ad_doc)
    del ad_doc['_id']
    return ad_doc

@api_router.put("/enterprise/advertising/{ad_id}/toggle")
async def toggle_advertising(ad_id: str, current_user: dict = Depends(get_current_user)):
    enterprise = await db.enterprises.find_one({"user_id": current_user['id']})
    if not enterprise:
        raise HTTPException(status_code=404, detail="Entreprise non trouvée")
    
    ad = await db.advertising.find_one({"id": ad_id, "enterprise_id": enterprise['id']})
    if not ad:
        raise HTTPException(status_code=404, detail="Publicité non trouvée")
    
    await db.advertising.update_one(
        {"id": ad_id},
        {"$set": {"is_active": not ad['is_active']}}
    )
    return {"message": "Statut modifié"}

@api_router.delete("/enterprise/advertising/{ad_id}")
async def delete_advertising(ad_id: str, current_user: dict = Depends(get_current_user)):
    enterprise = await db.enterprises.find_one({"user_id": current_user['id']})
    if not enterprise:
        raise HTTPException(status_code=404, detail="Entreprise non trouvée")
    
    await db.advertising.delete_one({"id": ad_id, "enterprise_id": enterprise['id']})
    return {"message": "Publicité supprimée"}

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

# Auto-create notification when order is created (helper function)
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
