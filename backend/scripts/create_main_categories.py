#!/usr/bin/env python3
"""
Script to create/update the 15 main categories with proper mapping
"""
import os
import sys
from dotenv import load_dotenv
from pymongo import MongoClient

load_dotenv('/app/backend/.env')

MONGO_URL = os.environ.get('MONGO_URL')
DB_NAME = os.environ.get('DB_NAME', 'titelli_db')

# Main 15 categories with their subcategories (existing DB categories)
MAIN_CATEGORIES = {
    'Restauration': {
        'subcategories': ['Restaurant', 'Brasserie', 'Bistrot', 'Bar', 'Café', 'Boulangerie', 'Boucherie', 'Épicerie', 'Traiteur', 'Pizzeria', 'Japonais', 'Alimentation'],
        'video': 'restaurant.mp4',
        'background_image': 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800'
    },
    'Personnel de maison': {
        'subcategories': ['Soins Domicile', 'Nettoyage', 'Aide Soignant', 'Menage', 'Garde Enfant'],
        'video': 'personnel_maison.mp4',
        'background_image': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800'
    },
    'Soins esthétiques': {
        'subcategories': ['Institut De Beaute', 'Beauté & Bien-être', 'Beauté & Santé', 'Massage', 'Spa', 'spa', 'Bronzage', 'Maquillage', 'Manucure'],
        'video': 'soins_esthetiques.mp4',
        'background_image': 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800'
    },
    'Coiffeurs': {
        'subcategories': ['Coiffeur', 'Coiffure & Beauté', 'coiffure', 'coiffure_barber'],
        'video': 'coiffeurs.mp4',
        'background_image': 'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=800'
    },
    'Cours de sport': {
        'subcategories': ['Fitness', 'Sport', 'Sports & Loisirs', 'Coach', 'cours_sport', 'Yoga', 'Arts Martiaux', 'Danse'],
        'video': 'cours_sport.mp4',
        'background_image': 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800'
    },
    'Activités': {
        'subcategories': ['Activités', 'Hotel', 'Montagne', 'Loisirs', 'Cinema', 'Theatre', 'Musee'],
        'video': 'activites.mp4',
        'background_image': 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800'
    },
    'Professionnels de santé': {
        'subcategories': ['Physiotherapie', 'Dentiste', 'Pharmacie', 'Chirurgien', 'Osteopathe', 'Psychologue', 'Cabinet Medical', 'Cardiologue', 'Ophtalmo'],
        'video': 'professionnels_sante.mp4',
        'background_image': 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800'
    },
    'Agent immobilier': {
        'subcategories': ['Agence Immobiliere', 'Agences immobilières', 'Immobilier', 'Courtier Immobilier'],
        'video': 'agent_immobilier.mp4',
        'background_image': 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800'
    },
    'Sécurité': {
        'subcategories': ['Sécurité - Protection', 'Securite', 'Alarme', 'Surveillance'],
        'video': 'securite.mp4',
        'background_image': 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=800'
    },
    'Professionnels de transports': {
        'subcategories': ['Transport', 'Taxi', 'VTC', 'Demenagement', 'Livraison', 'Ambulance', 'Assistance Routiere'],
        'video': None,
        'background_image': 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=800'
    },
    'Professionnels d\'éducation': {
        'subcategories': ['Enseignement', 'Ecole', 'Formation', 'Cours', 'Auto Ecole', 'Creche'],
        'video': None,
        'background_image': 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800'
    },
    'Professionnels administratifs': {
        'subcategories': ['Administration', 'Secretariat', 'Comptable', 'Fiduciaire', 'Gestion'],
        'video': None,
        'background_image': 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800'
    },
    'Professionnels juridiques': {
        'subcategories': ['Avocat', 'Notaire', 'Juridique', 'Huissier'],
        'video': None,
        'background_image': 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800'
    },
    'Professionnels informatiques': {
        'subcategories': ['Informatique', 'Web', 'IT', 'Developpeur', 'expert_tech', 'Numerique'],
        'video': None,
        'background_image': 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800'
    },
    'Professionnels de construction': {
        'subcategories': ['Construction', 'BTP', 'Architecte', 'Maconnerie', 'Peinture', 'Electricien', 'Plombier'],
        'video': None,
        'background_image': 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800'
    }
}

def main():
    print("Connecting to MongoDB...")
    client = MongoClient(MONGO_URL)
    db = client[DB_NAME]
    
    # Create/update main_categories collection
    main_cat_collection = db['main_categories']
    
    print("\nCreating/Updating main categories...")
    for idx, (cat_name, cat_data) in enumerate(MAIN_CATEGORIES.items()):
        doc = {
            'name': cat_name,
            'order': idx + 1,
            'subcategories': cat_data['subcategories'],
            'video': cat_data['video'],
            'background_image': cat_data['background_image']
        }
        
        result = main_cat_collection.update_one(
            {'name': cat_name},
            {'$set': doc},
            upsert=True
        )
        
        status = "Updated" if result.matched_count > 0 else "Created"
        print(f"  {idx + 1}. {status}: {cat_name}")
    
    print(f"\n✅ {len(MAIN_CATEGORIES)} main categories created/updated")
    
    # Count enterprises in each main category
    print("\nCounting enterprises per main category...")
    enterprises = db['enterprises']
    
    for cat_name, cat_data in MAIN_CATEGORIES.items():
        count = enterprises.count_documents({'category': {'$in': cat_data['subcategories']}})
        print(f"  - {cat_name}: {count} enterprises")
    
    client.close()
    print("\n✅ Done!")

if __name__ == "__main__":
    main()
