#!/usr/bin/env python3
"""
Comprehensive scraper for local.ch - Lausanne businesses
Version 3: More categories, postal codes, retry logic
"""

import asyncio
import re
import os
from datetime import datetime, timezone
from motor.motor_asyncio import AsyncIOMotorClient
from urllib.parse import quote
import logging

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('/app/backend/scraper_v3.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# MongoDB connection
MONGO_URL = "mongodb+srv://prankgy:Minijetaime1996@cluster0.kwjifsg.mongodb.net/secondevie?retryWrites=true&w=majority&appName=Cluster0"
DB_NAME = "secondevie"


async def get_existing_keys(db):
    """Get set of existing business keys"""
    existing = set()
    cursor = db.enterprises.find({}, {"name": 1, "business_name": 1, "address": 1})
    async for doc in cursor:
        name = doc.get("name") or doc.get("business_name", "")
        address = doc.get("address", "")
        if name:
            key = f"{name.lower().strip()[:50]}|{address.lower().strip()[:30]}"
            existing.add(key)
    logger.info(f"Found {len(existing)} existing businesses")
    return existing


def normalize_key(name, address):
    """Create normalized key for duplicate detection"""
    name_clean = name.lower().strip()[:50] if name else ""
    addr_clean = address.lower().strip()[:30] if address else ""
    return f"{name_clean}|{addr_clean}"


async def scrape_search(page, search_term, location, existing_keys, max_pages=30):
    """Scrape search results for a term in a location"""
    from playwright.async_api import TimeoutError as PlaywrightTimeout
    
    businesses = []
    
    for page_num in range(1, max_pages + 1):
        url = f"https://www.local.ch/fr/s/{quote(search_term)}/{quote(location)}?page={page_num}"
        
        try:
            # Navigate with shorter timeout
            await page.goto(url, wait_until='domcontentloaded', timeout=20000)
            await page.wait_for_timeout(1500)
            
            # Try to wait for content
            try:
                await page.wait_for_selector('a[href*="/fr/d/"]', timeout=5000)
            except:
                pass
            
            # Get all business links
            listings = await page.query_selector_all('a[href*="/fr/d/"]')
            
            if not listings:
                logger.debug(f"{search_term}/{location} page {page_num}: No listings found")
                break
            
            page_businesses = []
            seen_on_page = set()
            
            for listing in listings:
                try:
                    href = await listing.get_attribute('href')
                    if not href or '/fr/d/' not in href:
                        continue
                    
                    # Skip duplicates on same page
                    if href in seen_on_page:
                        continue
                    seen_on_page.add(href)
                    
                    text = await listing.inner_text()
                    lines = [l.strip() for l in text.split('\n') if l.strip()]
                    
                    if not lines:
                        continue
                    
                    name = lines[0][:100]
                    
                    # Skip generic entries
                    if len(name) < 3 or name.lower() in ['voir plus', 'plus', 'suivant', 'précédent']:
                        continue
                    
                    business = {
                        'name': name,
                        'city': 'Lausanne',
                        'canton': 'Vaud',
                        'country': 'Suisse',
                        'source': 'local.ch',
                        'activation_status': 'inactive',
                        'status': 'bientot_disponible',
                        'is_verified': False,
                        'is_certified': False,
                        'is_premium': False,
                        'category': search_term.replace('-', ' ').title(),
                        'search_location': location,
                    }
                    
                    # Find address
                    for line in lines[1:5]:
                        if re.search(r'\d{4}', line):
                            business['address'] = line[:200]
                            # Extract postal code
                            postal_match = re.search(r'(\d{4})', line)
                            if postal_match:
                                business['postal_code'] = postal_match.group(1)
                            break
                    
                    # Find phone
                    for line in lines:
                        phone_match = re.search(r'(\+41[\s.-]?\d{2}[\s.-]?\d{3}[\s.-]?\d{2}[\s.-]?\d{2}|0\d{2}[\s.-]?\d{3}[\s.-]?\d{2}[\s.-]?\d{2})', line)
                        if phone_match:
                            business['phone'] = phone_match.group(1).replace(' ', '').replace('.', '').replace('-', '')
                            break
                    
                    # Check for duplicate
                    key = normalize_key(name, business.get('address', ''))
                    if key not in existing_keys:
                        page_businesses.append(business)
                        existing_keys.add(key)
                        
                except Exception as e:
                    continue
            
            if page_businesses:
                businesses.extend(page_businesses)
                logger.info(f"{search_term}/{location} p{page_num}: +{len(page_businesses)} new")
            
            # Check if we should continue
            if len(page_businesses) < 3:
                break
                
            await page.wait_for_timeout(800)
            
        except PlaywrightTimeout:
            logger.warning(f"{search_term}/{location} p{page_num}: Timeout, moving on")
            break
        except Exception as e:
            logger.error(f"{search_term}/{location} p{page_num}: Error - {str(e)[:50]}")
            break
    
    return businesses


async def insert_businesses(db, businesses):
    """Insert businesses into MongoDB"""
    if not businesses:
        return 0
    
    now = datetime.now(timezone.utc).isoformat()
    
    for biz in businesses:
        biz['id'] = f"lch_{abs(hash(biz['name'] + biz.get('address', '') + biz.get('phone', ''))) % 10000000000}"
        biz['created_at'] = now
        biz['updated_at'] = now
        
        if not biz.get('image'):
            name_encoded = quote(biz['name'][:20])
            biz['image'] = f"https://ui-avatars.com/api/?name={name_encoded}&background=0047AB&color=fff&size=400"
    
    try:
        result = await db.enterprises.insert_many(businesses, ordered=False)
        return len(result.inserted_ids)
    except Exception as e:
        # Handle duplicates
        inserted = 0
        for biz in businesses:
            try:
                await db.enterprises.insert_one(biz)
                inserted += 1
            except:
                pass
        return inserted


async def main():
    """Main scraping function"""
    from playwright.async_api import async_playwright
    
    logger.info("=" * 60)
    logger.info("LOCAL.CH COMPREHENSIVE SCRAPER V3")
    logger.info("=" * 60)
    
    # Connect to MongoDB
    mongo_client = AsyncIOMotorClient(MONGO_URL)
    db = mongo_client[DB_NAME]
    
    existing_keys = await get_existing_keys(db)
    initial_count = await db.enterprises.count_documents({})
    
    # Comprehensive list of search terms
    search_terms = [
        # Food & Restaurants
        "restaurant", "cafe", "bar", "pizzeria", "sushi", "thai", "chinois", "indien",
        "japonais", "mexicain", "italien", "francais", "libanais", "turc", "grec",
        "vietnamien", "coreen", "africain", "bresilien", "espagnol", "portugais",
        "boulangerie", "patisserie", "chocolatier", "glacier", "epicerie", "supermarche",
        "boucherie", "poissonnerie", "fromagerie", "caviste", "traiteur", "kebab",
        "fast-food", "burger", "sandwich", "salade", "vegetarien", "vegan", "bio",
        "tea-room", "brunch", "bistrot", "brasserie", "pub", "lounge", "club",
        
        # Beauty & Wellness
        "coiffeur", "coiffeuse", "salon-de-coiffure", "barbier", "institut-de-beaute",
        "estheticienne", "manucure", "pedicure", "onglerie", "maquillage", "massage",
        "spa", "hammam", "sauna", "fitness", "gym", "musculation", "yoga", "pilates",
        "danse", "crossfit", "boxe", "arts-martiaux", "natation", "piscine",
        "tatoueur", "tatouage", "piercing", "bronzage", "solarium", "epilation",
        
        # Health & Medical
        "medecin", "docteur", "generaliste", "specialiste", "dentiste", "orthodontiste",
        "pharmacie", "opticien", "lunettes", "lentilles", "physiotherapie", "kinesitherapie",
        "osteopathe", "chiropracteur", "acupuncture", "homeopathie", "naturopathe",
        "psychologue", "psychiatre", "psychotherapeute", "coach", "nutritionniste",
        "dieteticien", "pediatre", "gynecologue", "dermatologue", "cardiologue",
        "neurologue", "orl", "ophtalmologue", "orthopediste", "radiologue", "chirurgien",
        "clinique", "hopital", "cabinet-medical", "laboratoire", "veterinaire",
        "sage-femme", "infirmier", "aide-soignant", "ambulance", "urgences",
        
        # Professional Services
        "avocat", "notaire", "huissier", "comptable", "fiduciaire", "expert-comptable",
        "conseiller-fiscal", "audit", "consultant", "coach-professionnel", "formation",
        "traducteur", "interprete", "secretariat", "centre-affaires", "coworking",
        "architecte", "architecte-interieur", "geometre", "ingenieur", "bureau-etude",
        "urbaniste", "paysagiste", "decorateur", "designer", "graphiste", "webdesigner",
        "photographe", "videaste", "imprimerie", "serigraphie", "publicite", "marketing",
        "communication", "relations-publiques", "evenementiel", "agence-voyage",
        
        # Financial Services
        "banque", "credit", "pret", "hypotheque", "assurance", "courtier", "gestionnaire",
        "immobilier", "agence-immobiliere", "syndic", "regie", "location", "vente",
        "estimation", "expertise", "investissement", "placement", "patrimoine",
        
        # Retail & Shopping
        "mode", "vetements", "boutique", "pret-a-porter", "haute-couture", "accessoires",
        "chaussures", "maroquinerie", "sacs", "bagages", "bijouterie", "horlogerie",
        "montres", "joaillerie", "parfumerie", "cosmetiques", "lingerie", "maillots",
        "sport", "articles-sport", "velo", "ski", "randonnee", "camping", "peche",
        "chasse", "golf", "tennis", "equitation", "plongee", "surf", "skateboard",
        "electronique", "informatique", "ordinateur", "telephone", "mobile", "tablette",
        "tv", "hifi", "electromenager", "cuisine", "menager", "robot", "aspirateur",
        "meuble", "mobilier", "canape", "lit", "matelas", "armoire", "bureau", "chaise",
        "decoration", "luminaire", "tapis", "rideau", "linge-maison", "vaisselle",
        "bricolage", "quincaillerie", "outillage", "peinture", "papier-peint", "parquet",
        "carrelage", "sanitaire", "robinetterie", "chauffage", "climatisation",
        "jardinage", "jardinerie", "plantes", "fleurs", "fleuriste", "pepiniere",
        "animalerie", "animaux", "chien", "chat", "aquarium", "oiseau",
        "librairie", "livre", "papeterie", "fourniture", "bureau", "scolaire",
        "jouet", "jeux", "loisirs", "musique", "instrument", "disque", "cd", "vinyle",
        "art", "galerie", "tableau", "cadre", "encadrement", "antiquaire", "brocante",
        "occasion", "depot-vente", "friperie", "vintage", "seconde-main",
        
        # Automotive
        "garage", "mecanique", "carrosserie", "peinture-auto", "pneu", "pneumatique",
        "auto", "voiture", "vehicule", "concessionnaire", "occasion", "location-voiture",
        "moto", "scooter", "velo", "velo-electrique", "trottinette", "parking",
        "lavage-auto", "station-service", "essence", "remorquage", "depannage",
        "auto-ecole", "permis", "conduite", "taxi", "vtc", "chauffeur", "limousine",
        
        # Construction & Home Services
        "construction", "entreprise-generale", "maconnerie", "beton", "charpente",
        "couverture", "toiture", "facade", "isolation", "etancheite", "demolition",
        "terrassement", "excavation", "fondation", "gros-oeuvre", "second-oeuvre",
        "menuiserie", "ebenisterie", "parqueteur", "poseur", "installateur",
        "plombier", "plomberie", "chauffagiste", "climaticien", "ventilation",
        "electricien", "electricite", "domotique", "alarme", "videosurveillance",
        "peintre", "peinture", "decoration", "tapissier", "platrerie", "plafonnier",
        "carreleur", "faience", "mosaique", "sol", "revetement", "parquet",
        "serrurier", "serrurerie", "cle", "coffre-fort", "blindage", "vitrier",
        "verrier", "miroiterie", "store", "volet", "pergola", "veranda",
        "cuisiniste", "cuisine-equipee", "salle-bain", "amenagement", "renovation",
        "demenagement", "garde-meuble", "stockage", "nettoyage", "menage", "entretien",
        "desinsectisation", "desinfection", "ramonage", "debouchage", "assainissement",
        
        # Hotels & Tourism
        "hotel", "motel", "auberge", "pension", "chambre-hote", "gite", "apparthotel",
        "residence", "apart-hotel", "camping", "hostel", "refuge", "chalet",
        "tourisme", "guide", "excursion", "visite", "croisiere", "voyage",
        
        # Education & Culture
        "ecole", "college", "lycee", "universite", "formation", "cours", "soutien",
        "creche", "garderie", "jardin-enfants", "parascolaire", "camp", "colonie",
        "auto-ecole", "ecole-langue", "musique", "danse", "theatre", "art",
        "musee", "galerie", "exposition", "cinema", "spectacle", "concert", "festival",
        "bibliotheque", "mediatheque", "ludotheque", "centre-culturel", "association",
        
        # Technology & Digital
        "informatique", "depannage-informatique", "reparation-ordinateur", "data",
        "developpement", "web", "application", "logiciel", "software", "hardware",
        "reseau", "securite-informatique", "cloud", "hebergement", "serveur",
        "telecoms", "telephonie", "fibre", "internet", "mobile", "operateur",
        
        # Industry & B2B
        "industrie", "usine", "manufacture", "production", "fabrication", "atelier",
        "mecanique-precision", "usinage", "soudure", "metallurgie", "fonderie",
        "plastique", "caoutchouc", "composite", "textile", "confection", "broderie",
        "imprimerie", "edition", "packaging", "emballage", "conditionnement",
        "logistique", "transport", "livraison", "coursier", "messagerie", "fret",
        "import-export", "negoce", "grossiste", "distributeur", "representant",
        
        # Misc Services
        "pressing", "teinturerie", "laverie", "blanchisserie", "couture", "retouche",
        "cordonnerie", "reparation", "cle-minute", "gravure", "tampon", "cachet",
        "photocopie", "scan", "reliure", "plastification", "destruction-documents",
        "pompes-funebres", "funeraire", "crematorium", "cimetiere", "fleurs-deuil",
        "garde", "securite", "surveillance", "gardiennage", "agent-securite",
        "detective", "enqueteur", "huissier", "recouvrement", "mediation",
    ]
    
    # Locations to search (Lausanne and surroundings)
    locations = [
        "lausanne",
        "lausanne-1000", "lausanne-1003", "lausanne-1004", "lausanne-1005",
        "lausanne-1006", "lausanne-1007", "lausanne-1010", "lausanne-1012",
        "lausanne-1018", "lausanne-flon", "lausanne-gare", "lausanne-ouchy",
        "pully", "prilly", "renens", "ecublens", "chavannes", "epalinges",
        "le-mont-sur-lausanne", "crissier", "bussigny", "morges",
    ]
    
    total_new = 0
    categories_done = 0
    
    async with async_playwright() as p:
        browser = await p.chromium.launch(
            headless=True,
            args=['--no-sandbox', '--disable-dev-shm-usage']
        )
        context = await browser.new_context(
            user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
            locale='fr-CH',
            viewport={'width': 1920, 'height': 1080}
        )
        page = await context.new_page()
        
        # Process each search term with main location first
        for search_term in search_terms:
            for location in locations:
                try:
                    businesses = await scrape_search(page, search_term, location, existing_keys, max_pages=25)
                    
                    if businesses:
                        inserted = await insert_businesses(db, businesses)
                        total_new += inserted
                        if inserted > 0:
                            logger.info(f"✓ {search_term}/{location}: +{inserted} (Total new: {total_new})")
                    
                    # Rate limiting
                    await asyncio.sleep(0.5)
                    
                except Exception as e:
                    logger.error(f"✗ {search_term}/{location}: {str(e)[:50]}")
                    continue
                
                # Only search other locations if we found results in main location
                if location == "lausanne" and not businesses:
                    break
            
            categories_done += 1
            
            # Progress report every 20 categories
            if categories_done % 20 == 0:
                current = await db.enterprises.count_documents({})
                logger.info(f"\n{'='*60}")
                logger.info(f"PROGRESS: {categories_done}/{len(search_terms)} categories")
                logger.info(f"Total enterprises: {current} (+{total_new} new)")
                logger.info(f"{'='*60}\n")
        
        await browser.close()
    
    # Final stats
    final_count = await db.enterprises.count_documents({})
    lausanne_count = await db.enterprises.count_documents({'city': 'Lausanne'})
    localch_count = await db.enterprises.count_documents({'source': 'local.ch'})
    
    logger.info("=" * 60)
    logger.info("SCRAPING COMPLETED")
    logger.info(f"Initial: {initial_count}")
    logger.info(f"Final: {final_count}")
    logger.info(f"New added: {total_new}")
    logger.info(f"Total from local.ch: {localch_count}")
    logger.info(f"Lausanne: {lausanne_count}")
    logger.info("=" * 60)


if __name__ == "__main__":
    asyncio.run(main())
