"""
Media Pub Router - Système de commande de publicités
- Affichage des templates (style Canva)
- Commande de pub avec personnalisation
- Génération IA des images
- Suivi des commandes
"""
from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, timezone
import uuid
import os
import base64
import logging
import asyncio

from dotenv import load_dotenv
load_dotenv()

router = APIRouter(prefix="/api/media-pub", tags=["Media Pub"])
logger = logging.getLogger(__name__)

# MongoDB connection (will be set from server.py)
db = None

def set_db(database):
    global db
    db = database

# Configuration
EMERGENT_LLM_KEY = os.getenv("EMERGENT_LLM_KEY")
UPLOADS_DIR = "/app/backend/uploads/pub_orders"
BASE_URL = os.getenv("REACT_APP_BACKEND_URL", "https://scraper-portal-1.preview.emergentagent.com")

# Créer le dossier si nécessaire
os.makedirs(UPLOADS_DIR, exist_ok=True)


# ============ TEMPLATES CATALOGUE ============
# Templates inspirés Canva pour différents formats pub

TEMPLATES = [
    # RÉSEAUX SOCIAUX
    {
        "id": "social_promo_1",
        "name": "Promo Flash",
        "category": "Réseaux Sociaux",
        "format": "1080x1080",
        "description": "Template carré idéal pour Instagram et Facebook. Design moderne avec mise en avant du produit.",
        "preview_url": "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400&h=400&fit=crop",
        "price": 29.90,
        "popular": True
    },
    {
        "id": "social_story_1",
        "name": "Story Élégante",
        "category": "Réseaux Sociaux",
        "format": "1080x1920",
        "description": "Format story vertical pour Instagram/Facebook. Style épuré et professionnel.",
        "preview_url": "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=300&h=533&fit=crop",
        "price": 24.90,
        "popular": True
    },
    {
        "id": "social_carousel_1",
        "name": "Carousel Produit",
        "category": "Réseaux Sociaux",
        "format": "1080x1080",
        "description": "Design pour carousel multi-images. Présentation de plusieurs produits ou services.",
        "preview_url": "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=400&h=400&fit=crop",
        "price": 39.90,
        "popular": False
    },
    
    # BANNIÈRES WEB
    {
        "id": "banner_hero_1",
        "name": "Bannière Hero",
        "category": "Bannières Web",
        "format": "1920x600",
        "description": "Grande bannière pour page d'accueil. Impact visuel maximal.",
        "preview_url": "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&h=188&fit=crop",
        "price": 49.90,
        "popular": True
    },
    {
        "id": "banner_sidebar_1",
        "name": "Bannière Sidebar",
        "category": "Bannières Web",
        "format": "300x600",
        "description": "Format vertical pour barres latérales. Idéal pour campagnes display.",
        "preview_url": "https://images.unsplash.com/photo-1553484771-371a605b060b?w=200&h=400&fit=crop",
        "price": 34.90,
        "popular": False
    },
    
    # FLYERS & AFFICHES
    {
        "id": "flyer_event_1",
        "name": "Flyer Événement",
        "category": "Flyers & Affiches",
        "format": "A5",
        "description": "Flyer promotionnel pour événements, ouvertures, ventes privées.",
        "preview_url": "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=566&fit=crop",
        "price": 44.90,
        "popular": True
    },
    {
        "id": "poster_promo_1",
        "name": "Affiche Vitrine",
        "category": "Flyers & Affiches",
        "format": "A3",
        "description": "Grande affiche pour vitrine ou intérieur boutique. Haute résolution impression.",
        "preview_url": "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=566&fit=crop",
        "price": 59.90,
        "popular": False
    },
    
    # EMAILS & NEWSLETTERS
    {
        "id": "email_header_1",
        "name": "Header Email",
        "category": "Email Marketing",
        "format": "600x200",
        "description": "En-tête d'email professionnel. Compatible tous clients mail.",
        "preview_url": "https://images.unsplash.com/photo-1563986768494-4dee2763ff3f?w=600&h=200&fit=crop",
        "price": 19.90,
        "popular": False
    },
    {
        "id": "newsletter_1",
        "name": "Newsletter Complète",
        "category": "Email Marketing",
        "format": "600x900",
        "description": "Template newsletter complet avec zones produits et texte.",
        "preview_url": "https://images.unsplash.com/photo-1557426272-fc759fdf7a8d?w=400&h=600&fit=crop",
        "price": 54.90,
        "popular": True
    },
    
    # VIDÉO THUMBNAILS
    {
        "id": "youtube_thumb_1",
        "name": "Miniature YouTube",
        "category": "Vidéo",
        "format": "1280x720",
        "description": "Miniature accrocheuse pour vidéos YouTube. Style click-worthy.",
        "preview_url": "https://images.unsplash.com/photo-1611162616475-46b635cb6868?w=400&h=225&fit=crop",
        "price": 24.90,
        "popular": True
    },
    
    # CARTES DE VISITE
    {
        "id": "business_card_1",
        "name": "Carte de Visite Pro",
        "category": "Print",
        "format": "85x55mm",
        "description": "Design carte de visite moderne et professionnel.",
        "preview_url": "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=400&h=235&fit=crop",
        "price": 34.90,
        "popular": False
    },
    
    # MENU RESTAURANT
    {
        "id": "menu_restaurant_1",
        "name": "Menu Restaurant",
        "category": "Restauration",
        "format": "A4",
        "description": "Template menu élégant pour restaurants et cafés.",
        "preview_url": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=566&fit=crop",
        "price": 44.90,
        "popular": True
    }
]


# ============ MODELS ============

class PubOrderCreate(BaseModel):
    template_id: str
    enterprise_id: str
    slogan: str
    product_name: str
    description: Optional[str] = None
    brand_colors: Optional[List[str]] = None  # Ex: ["#FF5733", "#333333"]
    additional_notes: Optional[str] = None


class PubOrderResponse(BaseModel):
    id: str
    status: str
    message: str
    estimated_time: str


# ============ HELPER FUNCTIONS ============

async def get_current_user(authorization: str = None):
    """Simple auth check - à remplacer par vraie auth"""
    # Import ici pour éviter circular imports
    from server import get_current_user as server_get_current_user
    return await server_get_current_user()


async def generate_pub_image(order_id: str, order_data: dict):
    """Génère l'image publicitaire avec IA en arrière-plan"""
    try:
        from emergentintegrations.llm.openai.image_generation import OpenAIImageGeneration
        
        logger.info(f"🎨 Génération image pour commande {order_id}")
        
        template = next((t for t in TEMPLATES if t["id"] == order_data["template_id"]), None)
        if not template:
            raise ValueError("Template non trouvé")
        
        # Construire le prompt pour l'IA
        colors_str = ", ".join(order_data.get("brand_colors", ["#0066CC", "#FFFFFF"])) if order_data.get("brand_colors") else "blue and white professional colors"
        
        prompt = f"""Create a professional marketing advertisement image for a business.

TEMPLATE STYLE: {template['name']} - {template['category']}
FORMAT: {template['format']}

CONTENT TO INCLUDE:
- Business/Product Name: {order_data['product_name']}
- Slogan/Tagline: {order_data['slogan']}
- Description: {order_data.get('description', 'Professional quality service')}

DESIGN REQUIREMENTS:
- Use these brand colors: {colors_str}
- Modern, professional, clean design
- High contrast for readability
- DO NOT include any prices or dates
- DO NOT crop any faces if people are shown
- Make text clearly readable
- Professional marketing aesthetic
- Suitable for {template['category']}

STYLE: Premium advertising quality, Swiss/European professional standards, elegant typography."""

        # Générer l'image
        image_gen = OpenAIImageGeneration(api_key=EMERGENT_LLM_KEY)
        
        images = await image_gen.generate_images(
            prompt=prompt,
            model="gpt-image-1",
            number_of_images=1
        )
        
        if images and len(images) > 0:
            # Sauvegarder l'image
            filename = f"pub_{order_id}.png"
            filepath = f"{UPLOADS_DIR}/{filename}"
            
            with open(filepath, "wb") as f:
                f.write(images[0])
            
            image_url = f"{BASE_URL}/api/uploads/pub_orders/{filename}"
            
            # Mettre à jour la commande
            await db.pub_orders.update_one(
                {"id": order_id},
                {"$set": {
                    "status": "completed",
                    "image_url": image_url,
                    "completed_at": datetime.now(timezone.utc).isoformat()
                }}
            )
            
            logger.info(f"✅ Image générée: {image_url}")
            
            # Créer notification pour l'entreprise
            await db.notifications.insert_one({
                "id": str(uuid.uuid4()),
                "user_id": order_data.get("user_id"),
                "type": "pub_order_ready",
                "title": "Votre publicité est prête !",
                "message": f"Votre commande '{template['name']}' est disponible dans vos commandes Titelli.",
                "link": "/dashboard/enterprise?tab=commandes-titelli",
                "is_read": False,
                "created_at": datetime.now(timezone.utc).isoformat()
            })
            
        else:
            raise ValueError("Aucune image générée")
            
    except Exception as e:
        logger.error(f"❌ Erreur génération: {e}")
        await db.pub_orders.update_one(
            {"id": order_id},
            {"$set": {
                "status": "failed",
                "error": str(e)[:500],
                "completed_at": datetime.now(timezone.utc).isoformat()
            }}
        )


# ============ ROUTES ============

@router.get("/templates")
async def get_templates(category: Optional[str] = None):
    """Liste tous les templates disponibles"""
    templates = TEMPLATES
    
    if category:
        templates = [t for t in templates if t["category"].lower() == category.lower()]
    
    # Grouper par catégorie
    categories = {}
    for t in TEMPLATES:
        cat = t["category"]
        if cat not in categories:
            categories[cat] = []
        categories[cat].append(t)
    
    return {
        "templates": templates,
        "categories": list(categories.keys()),
        "by_category": categories,
        "total": len(templates)
    }


@router.get("/templates/{template_id}")
async def get_template_detail(template_id: str):
    """Détail d'un template"""
    template = next((t for t in TEMPLATES if t["id"] == template_id), None)
    if not template:
        raise HTTPException(status_code=404, detail="Template non trouvé")
    return template


@router.post("/orders", response_model=PubOrderResponse)
async def create_pub_order(
    order: PubOrderCreate,
    background_tasks: BackgroundTasks
):
    """Créer une commande de publicité"""
    
    # Vérifier le template
    template = next((t for t in TEMPLATES if t["id"] == order.template_id), None)
    if not template:
        raise HTTPException(status_code=404, detail="Template non trouvé")
    
    # Vérifier l'entreprise
    enterprise = await db.enterprises.find_one({"id": order.enterprise_id})
    if not enterprise:
        raise HTTPException(status_code=404, detail="Entreprise non trouvée")
    
    # Créer la commande
    order_id = str(uuid.uuid4())[:8]
    order_data = {
        "id": order_id,
        "template_id": order.template_id,
        "template_name": template["name"],
        "template_category": template["category"],
        "enterprise_id": order.enterprise_id,
        "enterprise_name": enterprise.get("business_name") or enterprise.get("name"),
        "user_id": enterprise.get("user_id"),
        "slogan": order.slogan,
        "product_name": order.product_name,
        "description": order.description,
        "brand_colors": order.brand_colors or ["#0066CC", "#FFFFFF"],
        "additional_notes": order.additional_notes,
        "price": template["price"],
        "currency": "CHF",
        "status": "processing",
        "image_url": None,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "completed_at": None,
        "error": None
    }
    
    await db.pub_orders.insert_one(order_data)
    
    # Lancer la génération en arrière-plan
    background_tasks.add_task(generate_pub_image, order_id, order_data)
    
    return PubOrderResponse(
        id=order_id,
        status="processing",
        message="Votre publicité est en cours de création",
        estimated_time="2-5 minutes"
    )


@router.get("/orders")
async def get_enterprise_orders(enterprise_id: str):
    """Liste les commandes d'une entreprise"""
    orders = await db.pub_orders.find(
        {"enterprise_id": enterprise_id},
        {"_id": 0}
    ).sort("created_at", -1).to_list(100)
    
    return {"orders": orders, "total": len(orders)}


@router.get("/orders/{order_id}")
async def get_order_detail(order_id: str):
    """Détail d'une commande"""
    order = await db.pub_orders.find_one({"id": order_id}, {"_id": 0})
    if not order:
        raise HTTPException(status_code=404, detail="Commande non trouvée")
    return order


@router.get("/admin/orders")
async def admin_get_all_orders(
    status: Optional[str] = None,
    limit: int = 50,
    skip: int = 0
):
    """Admin: Liste toutes les commandes pub"""
    query = {}
    if status:
        query["status"] = status
    
    orders = await db.pub_orders.find(query, {"_id": 0}).sort("created_at", -1).skip(skip).limit(limit).to_list(limit)
    total = await db.pub_orders.count_documents(query)
    
    # Stats
    stats = {
        "total": total,
        "processing": await db.pub_orders.count_documents({"status": "processing"}),
        "completed": await db.pub_orders.count_documents({"status": "completed"}),
        "failed": await db.pub_orders.count_documents({"status": "failed"})
    }
    
    # Revenus
    completed_orders = await db.pub_orders.find({"status": "completed"}, {"price": 1}).to_list(1000)
    stats["total_revenue"] = sum(o.get("price", 0) for o in completed_orders)
    
    return {
        "orders": orders,
        "stats": stats,
        "pagination": {"limit": limit, "skip": skip, "total": total}
    }


@router.delete("/orders/{order_id}")
async def cancel_order(order_id: str):
    """Annuler une commande (si pas encore traitée)"""
    order = await db.pub_orders.find_one({"id": order_id})
    if not order:
        raise HTTPException(status_code=404, detail="Commande non trouvée")
    
    if order.get("status") == "completed":
        raise HTTPException(status_code=400, detail="Commande déjà terminée, impossible d'annuler")
    
    await db.pub_orders.update_one(
        {"id": order_id},
        {"$set": {"status": "cancelled", "completed_at": datetime.now(timezone.utc).isoformat()}}
    )
    
    return {"message": "Commande annulée"}
