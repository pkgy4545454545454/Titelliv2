"""
Script pour enrichir les entreprises avec des sous-catégories - Version batch
"""

import os
from pymongo import MongoClient, UpdateOne

# Connexion MongoDB
MONGO_URL = os.environ.get('MONGO_URL', 'mongodb+srv://prankgy:Mini.1996@cluster0.kwjifsg.mongodb.net/secondevie?retryWrites=true&w=majority&appName=Cluster0')
client = MongoClient(MONGO_URL)
db = client['secondevie']

# Mapping des sous-catégories par mot-clé
SUBCATEGORY_MAPPING = {
    'Restaurant': {
        'keywords': {
            'italien': 'Cuisine italienne', 'italia': 'Cuisine italienne', 'pizza': 'Pizzeria',
            'pizzeria': 'Pizzeria', 'chinois': 'Cuisine chinoise', 'china': 'Cuisine chinoise',
            'japonais': 'Cuisine japonaise', 'sushi': 'Sushi', 'ramen': 'Cuisine japonaise',
            'thai': 'Cuisine thaï', 'thaï': 'Cuisine thaï', 'indien': 'Cuisine indienne',
            'india': 'Cuisine indienne', 'curry': 'Cuisine indienne', 'mexicain': 'Cuisine mexicaine',
            'tacos': 'Cuisine mexicaine', 'libanais': 'Cuisine libanaise', 'liban': 'Cuisine libanaise',
            'grec': 'Cuisine grecque', 'kebab': 'Kebab', 'döner': 'Kebab', 'burger': 'Fast food',
            'brasserie': 'Brasserie', 'bistrot': 'Brasserie', 'végétarien': 'Végétarien/Vegan',
            'vegan': 'Végétarien/Vegan', 'vietnamien': 'Cuisine vietnamienne', 'poke': 'Poke Bowl',
            'coréen': 'Cuisine coréenne', 'gastronomique': 'Gastronomique',
        },
        'default': 'Cuisine traditionnelle'
    },
    'Restauration': {
        'keywords': {
            'italien': 'Cuisine italienne', 'pizza': 'Pizzeria', 'chinois': 'Cuisine chinoise',
            'japonais': 'Cuisine japonaise', 'sushi': 'Sushi', 'thai': 'Cuisine thaï',
            'indien': 'Cuisine indienne', 'mexicain': 'Cuisine mexicaine', 'kebab': 'Kebab',
            'burger': 'Fast food', 'brasserie': 'Brasserie', 'libanais': 'Cuisine libanaise',
        },
        'default': 'Cuisine traditionnelle'
    },
    'Coiffeur': {
        'keywords': {
            'homme': 'Coupe homme', 'barber': 'Barbier', 'barbier': 'Barbier', 'femme': 'Coupe femme',
            'color': 'Coloration', 'mèches': 'Mèches', 'lissage': 'Lissage', 'extension': 'Extensions',
            'mariage': 'Coiffure mariage', 'enfant': 'Coiffure enfant', 'afro': 'Coiffure afro',
        },
        'default': 'Coupe mixte'
    },
    'coiffure': {'keywords': {'homme': 'Coupe homme', 'barber': 'Barbier', 'femme': 'Coupe femme'}, 'default': 'Coupe mixte'},
    'Institut De Beaute': {
        'keywords': {
            'épilation': 'Épilation', 'laser': 'Épilation laser', 'visage': 'Soins du visage',
            'corps': 'Soins du corps', 'maquillage': 'Maquillage', 'manucure': 'Manucure',
            'ongle': 'Manucure', 'massage': 'Massage', 'bronzage': 'Bronzage', 'cils': 'Extension cils',
        },
        'default': 'Soins esthétiques'
    },
    'Spa': {
        'keywords': {'massage': 'Massage', 'sauna': 'Sauna', 'hammam': 'Hammam', 'jacuzzi': 'Jacuzzi'},
        'default': 'Spa & Bien-être'
    },
    'Medecin': {
        'keywords': {
            'généraliste': 'Généraliste', 'pédiatre': 'Pédiatre', 'gynéco': 'Gynécologue',
            'dermato': 'Dermatologue', 'cardio': 'Cardiologue', 'ophtalmo': 'Ophtalmologue',
        },
        'default': 'Généraliste'
    },
    'Dentiste': {
        'keywords': {'implant': 'Implants', 'orthodont': 'Orthodontie', 'esthétique': 'Dentisterie esthétique'},
        'default': 'Soins dentaires'
    },
    'Pharmacie': {
        'keywords': {'para': 'Parapharmacie', 'homéo': 'Homéopathie', 'cosmétique': 'Cosmétiques'},
        'default': 'Médicaments'
    },
    'Bijouteries': {
        'keywords': {
            'montre': 'Montres', 'watch': 'Montres', 'horlog': 'Horlogerie', 'bague': 'Bagues',
            'collier': 'Colliers', 'or': 'Bijoux en or', 'diamant': 'Diamants', 'réparation': 'Réparation',
        },
        'default': 'Bijoux'
    },
    'bijouteries': {
        'keywords': {'montre': 'Montres', 'horlog': 'Horlogerie', 'bague': 'Bagues', 'or': 'Bijoux en or'},
        'default': 'Bijoux'
    },
    'Garage': {
        'keywords': {
            'réparation': 'Réparation', 'carrosserie': 'Carrosserie', 'pneu': 'Pneus', 'vidange': 'Vidange',
        },
        'default': 'Mécanique générale'
    },
    'Agence Immobiliere': {
        'keywords': {'vente': 'Vente', 'location': 'Location', 'luxe': 'Immobilier de luxe'},
        'default': 'Transactions'
    },
    'Boulangerie': {
        'keywords': {'pâtisserie': 'Pâtisseries', 'bio': 'Pain bio', 'artisan': 'Pain artisanal'},
        'default': 'Pain'
    },
    'Electricien': {
        'keywords': {'dépannage': 'Dépannage', 'installation': 'Installation', 'domotique': 'Domotique'},
        'default': 'Électricité générale'
    },
    'Plombier': {
        'keywords': {'dépannage': 'Dépannage', 'débouchage': 'Débouchage', 'chauffe-eau': 'Chauffe-eau'},
        'default': 'Plomberie générale'
    },
    'Informatique': {
        'keywords': {'web': 'Développement web', 'mobile': 'Développement mobile', 'réparation': 'Réparation'},
        'default': 'Services informatiques'
    },
    'Avocat': {
        'keywords': {
            'pénal': 'Droit pénal', 'civil': 'Droit civil', 'famille': 'Droit de la famille',
            'travail': 'Droit du travail', 'affaires': 'Droit des affaires',
        },
        'default': 'Droit général'
    },
    'Fitness': {
        'keywords': {'cardio': 'Cardio', 'muscul': 'Musculation', 'yoga': 'Yoga', 'pilates': 'Pilates'},
        'default': 'Fitness général'
    },
    'Hotel': {
        'keywords': {'luxe': 'Hôtel de luxe', 'business': 'Hôtel business', 'boutique': 'Boutique hôtel'},
        'default': 'Hôtel'
    },
    'Banque': {
        'keywords': {'privé': 'Banque privée', 'crédit': 'Crédit'},
        'default': 'Services bancaires'
    },
    'Assurance': {
        'keywords': {'auto': 'Assurance auto', 'habitation': 'Assurance habitation', 'santé': 'Assurance santé'},
        'default': 'Assurance générale'
    },
}

def get_subcategory(enterprise):
    category = enterprise.get('category', '')
    name = (enterprise.get('business_name') or enterprise.get('name') or '').lower()
    description = (enterprise.get('description') or '').lower()
    text = f"{name} {description}"
    
    if category in SUBCATEGORY_MAPPING:
        mapping = SUBCATEGORY_MAPPING[category]
        for keyword, subcategory in mapping['keywords'].items():
            if keyword.lower() in text:
                return subcategory
        return mapping['default']
    return None

def update_enterprises_batch():
    """Met à jour les entreprises par batch"""
    # Préparer les opérations batch
    operations = []
    
    # Récupérer toutes les entreprises
    enterprises = list(db.enterprises.find({}, {'_id': 1, 'business_name': 1, 'name': 1, 'category': 1, 'description': 1}))
    
    for ent in enterprises:
        subcategory = get_subcategory(ent)
        if subcategory:
            operations.append(
                UpdateOne(
                    {'_id': ent['_id']},
                    {'$set': {'subcategory': subcategory}}
                )
            )
    
    # Exécuter par batch de 500
    if operations:
        print(f"Mise à jour de {len(operations)} entreprises...")
        result = db.enterprises.bulk_write(operations)
        print(f"Modifiées: {result.modified_count}")
        return result.modified_count
    return 0

if __name__ == '__main__':
    print("=== MISE À JOUR DES SOUS-CATÉGORIES (BATCH) ===\n")
    updated = update_enterprises_batch()
    
    # Vérification
    count = db.enterprises.count_documents({'subcategory': {'$exists': True, '$ne': None}})
    print(f"\nTotal avec subcategory: {count}")
