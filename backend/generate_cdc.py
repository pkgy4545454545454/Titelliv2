#!/usr/bin/env python3
"""
Générateur de Cahiers des Charges Titelli
- CDC Monétisation complète
- CDC Fonctionnalités détaillées
"""
from fpdf import FPDF
from datetime import datetime
import os

# Créer le dossier de sortie
OUTPUT_DIR = "/app/backend/uploads/documents"
os.makedirs(OUTPUT_DIR, exist_ok=True)

class TitelliPDF(FPDF):
    """PDF personnalisé avec style Titelli"""
    
    def __init__(self):
        super().__init__()
        self.set_auto_page_break(auto=True, margin=15)
        
    def header(self):
        self.set_font('Helvetica', 'B', 12)
        self.set_text_color(245, 158, 11)  # Jaune Titelli
        self.cell(0, 10, 'TITELLI', 0, 0, 'L')
        self.set_text_color(150, 150, 150)
        self.set_font('Helvetica', '', 8)
        self.cell(0, 10, f'Document confidentiel - {datetime.now().strftime("%d/%m/%Y")}', 0, 0, 'R')
        self.ln(15)
        
    def footer(self):
        self.set_y(-15)
        self.set_font('Helvetica', 'I', 8)
        self.set_text_color(150, 150, 150)
        self.cell(0, 10, f'Page {self.page_no()}/{{nb}}', 0, 0, 'C')
        
    def title_page(self, title, subtitle=""):
        self.add_page()
        self.ln(60)
        self.set_font('Helvetica', 'B', 28)
        self.set_text_color(245, 158, 11)
        self.multi_cell(0, 15, title, 0, 'C')
        if subtitle:
            self.ln(10)
            self.set_font('Helvetica', '', 16)
            self.set_text_color(100, 100, 100)
            self.multi_cell(0, 10, subtitle, 0, 'C')
        self.ln(30)
        self.set_font('Helvetica', '', 12)
        self.set_text_color(80, 80, 80)
        self.cell(0, 10, f'Date: {datetime.now().strftime("%d %B %Y")}', 0, 1, 'C')
        self.cell(0, 10, 'Version: 1.0', 0, 1, 'C')
        
    def chapter_title(self, title, num=None):
        self.set_font('Helvetica', 'B', 16)
        self.set_text_color(245, 158, 11)
        if num:
            self.cell(0, 12, f'{num}. {title}', 0, 1, 'L')
        else:
            self.cell(0, 12, title, 0, 1, 'L')
        self.ln(4)
        
    def section_title(self, title):
        self.set_font('Helvetica', 'B', 12)
        self.set_text_color(60, 60, 60)
        self.cell(0, 8, title, 0, 1, 'L')
        self.ln(2)
        
    def body_text(self, text):
        self.set_font('Helvetica', '', 10)
        self.set_text_color(80, 80, 80)
        self.multi_cell(0, 6, text)
        self.ln(3)
        
    def bullet_point(self, text, indent=10):
        self.set_font('Helvetica', '', 10)
        self.set_text_color(80, 80, 80)
        current_x = self.get_x()
        self.set_x(current_x + indent)
        bullet_text = chr(149) + "  " + text
        self.multi_cell(0, 6, bullet_text)
        
    def highlight_box(self, title, text, color=(245, 158, 11)):
        self.set_fill_color(color[0], color[1], color[2])
        self.set_draw_color(color[0], color[1], color[2])
        self.set_text_color(255, 255, 255)
        self.set_font('Helvetica', 'B', 11)
        self.cell(0, 8, f'  {title}', 1, 1, 'L', True)
        self.set_fill_color(250, 250, 250)
        self.set_text_color(60, 60, 60)
        self.set_font('Helvetica', '', 10)
        self.multi_cell(0, 6, text, 1, 'L', True)
        self.ln(5)


def generate_monetisation_cdc():
    """Génère le CDC de Monétisation complet"""
    pdf = TitelliPDF()
    pdf.alias_nb_pages()
    
    # Page de titre
    pdf.title_page(
        "CAHIER DES CHARGES",
        "Monétisation Titelli\nStratégie et Modèle Économique"
    )
    
    # Table des matières
    pdf.add_page()
    pdf.chapter_title("Table des Matières")
    toc = [
        "1. Procédé de Facturation",
        "2. Cash-Back Système",
        "3. Cash-Back Entreprise VIP Secret",
        "4. Tarification des Services",
        "5. Avantages Prestataires",
        "6. Services Premium",
        "7. Labellisation et Certification",
        "8. Publicité et Marketing",
        "9. Investissements",
        "10. Conditions de Renouvellement"
    ]
    for item in toc:
        pdf.bullet_point(item, 5)
    
    # 1. Procédé de Facturation
    pdf.add_page()
    pdf.chapter_title("Procédé de Facturation", 1)
    
    pdf.highlight_box(
        "VERSEMENT MENSUEL",
        "Titelli vous verse chaque début du mois les revenus de vos ventes du mois précédent, déduisant 20% (cash-back + frais Titelli)."
    )
    
    pdf.body_text("Les ventes livrées retiennent des frais de livraison supplémentaires selon le mode choisi.")
    
    pdf.highlight_box(
        "PROJECTION DE BÉNÉFICES",
        "En dépit des frais, il est attendu d'obtenir une augmentation de 20 à 45% de vos bénéfices la première année sous réserve de bonne gestion de vos opportunités business Titelli."
    )
    
    # 2. Cash-Back Client
    pdf.add_page()
    pdf.chapter_title("Cash-Back Système", 2)
    
    pdf.section_title("Pour les Clients")
    pdf.body_text("« Si la concurrence en a un, j'en veux un aussi ! »")
    pdf.body_text("Le Système de Cash-Back permet aux utilisateurs de bénéficier d'un retour sur leur achat s'élevant à 10% du montant total facturé par le prestataire.")
    
    pdf.bullet_point("Accessible au client chaque début du mois suivant la facturation")
    pdf.bullet_point("Utilisable sur l'ensemble de la plate-forme")
    pdf.bullet_point("Interchangeable avec tout utilisateur de l'application")
    
    pdf.ln(5)
    pdf.body_text("Rappeler au client qu'il dispose d'un certain montant à consommer auprès de ses prestataires préférés sur l'ensemble de la plateforme.")
    
    # 3. Cash-Back Entreprise VIP
    pdf.add_page()
    pdf.chapter_title("Cash-Back Entreprise VIP Secret", 3)
    
    pdf.body_text("Votre cash back entreprise pour plus d'initiatives qui rapportent plus pour votre entreprise.")
    pdf.body_text("Cash-Back entreprise te permet un accès illimité à une unité interne Titelli.")
    
    pdf.section_title("Avantages inclus:")
    avantages_vip = [
        "Avantages fiscaux",
        "Data la plus importante",
        "Pouvoir de gestion sur ton domaine d'activité",
        "Influence de marché",
        "Investisseurs guests",
        "Réseaux professionnels",
        "Patrimoine",
        "Labellisation particulière",
        "Responsabilité complète de votre activité"
    ]
    for av in avantages_vip:
        pdf.bullet_point(av)
    
    pdf.ln(5)
    pdf.highlight_box(
        "TITELLI S'OCCUPE DE TOUT",
        "Titelli s'occupe de réaliser votre rêve pendant qu'elle rentabilise votre business ! Oser Titelli, c'est Oser une nouvelle vie !"
    )
    
    pdf.section_title("Niveaux de Cash-Back:")
    pdf.body_text("À partir de 20% de ta paie jusqu'à 99% avec possibilité de combiner ton système client avec ton système entreprise à partir de 60%!")
    
    pdf.section_title("Services Premium VIP:")
    services_vip = [
        "Premium + livraison instantanée",
        "Recrutement personnel instantané",
        "+ Pub 2M",
        "Immobilier accès VIP 2M / 20M",
        "Premium dépôt 24/24",
        "Fournisseurs Premium + 20% net",
        "Investissements Premium + 20% net",
        "Expert Marketing Premium +",
        "Expert gestion des contrats",
        "Expert gestion entreprise",
        "Liquidation de ton stock dès 20'000.-",
        "Formations before even after",
        "Soin entreprise à partir de 5'000.-"
    ]
    for serv in services_vip:
        pdf.bullet_point(serv)
    
    # 4. Tarification
    pdf.add_page()
    pdf.chapter_title("Tarification des Services", 4)
    
    pdf.section_title("Inscription et Abonnements")
    pdf.body_text("Inscription annuelle: 250 CHF")
    pdf.body_text("Service Premium annuel: 540 CHF")
    pdf.body_text("Service Premium mensuel: 45 CHF")
    pdf.body_text("Commission sur ventes: 10-20%")
    
    pdf.section_title("Services à la Carte - Pub Média")
    pdf.body_text("Templates standards: 29.90 - 49.90 CHF")
    pdf.body_text("Création Sur Mesure: 149.90 CHF")
    
    # 5. Avantages Prestataires
    pdf.add_page()
    pdf.chapter_title("Avantages Prestataires", 5)
    
    avantages = {
        "Gestion du personnel": "Ils savent et comprennent ce que vous attendez d'eux exactement, sans vous répéter. Établir des cahiers des charges, donner des ordres instantanés, suivre leurs performances.",
        "Gestion des stocks": "Accès instantané à toutes les informations. Suivre en temps réel les mouvements, alertes de fluctuations, rapports détaillés, automatisation du réassort.",
        "Espace cartes": "Toutes vos cartes, vos réductions, vos moyens de paiement, visibles en un seul endroit.",
        "Espace finance": "Évaluer votre rentabilité, vos investissements et plus encore! Gardez un œil sur votre pouvoir d'achat.",
        "Feed entreprises": "Voir ce qui se fait de nouveau dans votre domaine d'activité. Élargir votre réseau!",
        "Actualités": "Permettre à de nouveaux clients de vous découvrir par des clients satisfaits!",
        "Formations": "Des formations en constante évolutions, riches et complètes. Restez connecté aux dernières évolutions techniques!",
        "Business News": "Ne vous laissez plus jamais dépasser par la concurrence et participez activement au marché!",
        "Page pub spontanée": "Explorez de nouvelles opportunités commerciales: teasers investisseurs, invitations personnelles, ciblage clients, influenceurs."
    }
    
    for titre, desc in avantages.items():
        pdf.section_title(titre)
        pdf.body_text(desc)
        pdf.ln(2)
    
    # 6. Services Premium
    pdf.add_page()
    pdf.chapter_title("Services Premium", 6)
    
    services = {
        "Exposition sur Titelli": "Être présent de manière régulière et forte aux yeux des clients. Se voir recommander constamment et laisser venir un nouveau public.",
        "Spécialiste marketing": "Reprend en main votre communication. Révision ou création de votre image, site web vitrine, campagne marketing réseaux sociaux, short vidéo publicitaire.",
        "Référencement préférentiel": "Renforcer votre présence sur le marché. Suggestions d'experts et algorithmes pour apparaître aux bons endroits au bon moment.",
        "Publication d'offres illimitées": "Proposer des gestes commerciaux, fidéliser votre clientèle, attirer de nouveaux clients. Liquider vos stocks en période de faible influence.",
        "Livraison 24/24": "Proposer votre savoir-faire ou produit en service à domicile en tout temps. Répondre à une clientèle exigeante.",
        "Fiches d'exigences clients": "Regrouper les attentes clients pour une expérience inoubliable grâce à un service personnalisé hors du commun.",
        "Healthy lifestyle pass": "Prestataires répondant aux exigences spécifiques de santé. Services et produits qui prennent véritablement soin des clients."
    }
    
    for titre, desc in services.items():
        pdf.section_title(titre)
        pdf.body_text(desc)
        pdf.ln(2)
    
    # 7. Labellisation
    pdf.add_page()
    pdf.chapter_title("Labellisation et Certification", 7)
    
    pdf.section_title("Mention 'Certifié'")
    pdf.body_text("Permet de revaloriser un savoir-faire spécifique et de reconnaître des produits de haut-standing. Remplissez nos conditions de labellisation et démarquez-vous de vos concurrents.")
    
    pdf.section_title("Labellisés")
    pdf.body_text("Nos prestations les plus prestigieuses répondent à des exigences particulières faites par des experts attitrés du domaine d'activité correspondant.")
    
    pdf.section_title("Optimisation fiscale")
    pdf.body_text("Un expert comptable et juridique se chargent d'une optimisation fiscale reflétant directement sur vos bénéfices.")
    
    # 8. Publicité
    pdf.add_page()
    pdf.chapter_title("Publicité et Marketing", 8)
    
    pdf.section_title("Accueil")
    pdf.body_text("Suggérer chaque jour à tous les clients Titelli une vidéo qui promeut un prestataire ou des suggestions d'offres qui défilent.")
    
    pdf.section_title("Tendances actuelles")
    pdf.body_text("Guider les clients sur les meilleures suggestions du moment! Démarquez-vous et proposez une publicité Titelli.")
    
    pdf.section_title("Pub Média IA")
    pdf.body_text("Création de publicités professionnelles avec intelligence artificielle. Templates personnalisables, génération sur mesure, texte parfait garanti.")
    
    # 9. Investissements
    pdf.add_page()
    pdf.chapter_title("Investissements", 9)
    
    pdf.body_text("Les investissements vous donnent l'opportunité de proposer des parts sur bénéfice sur un temps défini contre investissement.")
    pdf.body_text("Trouvez votre partenaire en affaire d'exception avec qui partager vos parts.")
    
    pdf.highlight_box(
        "POSSIBILITÉS",
        "Et si toutes vos dettes étaient remboursées instantanément?\nEt si on refaisait la décoration?\nEt si vous pouviez avoir un partenaire en affaire sur du court ou long terme?"
    )
    
    pdf.body_text("Fixez un prix, fixez un temps, fixez une part et recevez le budget inestimable tant attendu!")
    
    # 10. Renouvellement
    pdf.add_page()
    pdf.chapter_title("Conditions de Renouvellement", 10)
    
    pdf.body_text("Renouvellement de la prestation chaque année sous réserve d'un courrier écrit dans le mois qui précède le renouvellement.")
    
    pdf.ln(5)
    pdf.body_text("Si vous ne souhaitez pas souscrire aux services Titelli, et que vous ne souhaitez pas être exposé à titre indicatif, il vous est possible d'adresser un mail au service client concerné.")
    
    # Sauvegarder
    output_path = f"{OUTPUT_DIR}/CDC_MONETISATION_TITELLI.pdf"
    pdf.output(output_path)
    print(f"✅ CDC Monétisation généré: {output_path}")
    return output_path


def generate_fonctionnalites_cdc():
    """Génère le CDC de toutes les fonctionnalités"""
    pdf = TitelliPDF()
    pdf.alias_nb_pages()
    
    # Page de titre
    pdf.title_page(
        "CAHIER DES CHARGES",
        "Fonctionnalités Complètes\nPlateforme Titelli"
    )
    
    # Table des matières
    pdf.add_page()
    pdf.chapter_title("Table des Matières")
    toc = [
        "PARTIE A - FONCTIONNALITÉS CLIENT",
        "  1. Système de Cash-Back Client",
        "  2. Navigation et Recherche",
        "  3. Commandes et Paiements",
        "  4. Profil et Préférences",
        "  5. Lifestyle Pass",
        "PARTIE B - FONCTIONNALITÉS ENTREPRISE",
        "  6. Dashboard Entreprise",
        "  7. Gestion du Personnel",
        "  8. Gestion des Stocks",
        "  9. Finances et Investissements",
        "  10. Marketing et Publicité",
        "  11. Pub Média IA",
        "PARTIE C - FONCTIONNALITÉS ADMIN",
        "  12. Dashboard Admin",
        "  13. Gestion Utilisateurs",
        "  14. Statistiques et Rapports"
    ]
    for item in toc:
        if item.startswith("PARTIE"):
            pdf.set_font('Helvetica', 'B', 10)
            pdf.cell(0, 6, item, 0, 1)
        else:
            pdf.bullet_point(item.strip(), 5)
    
    # PARTIE A - CLIENT
    pdf.add_page()
    pdf.set_font('Helvetica', 'B', 20)
    pdf.set_text_color(245, 158, 11)
    pdf.cell(0, 20, "PARTIE A", 0, 1, 'C')
    pdf.set_font('Helvetica', 'B', 16)
    pdf.set_text_color(60, 60, 60)
    pdf.cell(0, 10, "FONCTIONNALITÉS CLIENT", 0, 1, 'C')
    
    # 1. Cash-Back Client
    pdf.add_page()
    pdf.chapter_title("Système de Cash-Back Client", 1)
    
    pdf.section_title("Description")
    pdf.body_text("Le Système de Cash-Back permet aux utilisateurs de bénéficier d'un retour sur leur achat s'élevant à 10% du montant total facturé par le prestataire.")
    
    pdf.section_title("Fonctionnalités")
    fonc = [
        "Accumulation automatique de 10% sur chaque achat",
        "Consultation du solde en temps réel",
        "Utilisation sur l'ensemble de la plateforme",
        "Transfert entre utilisateurs",
        "Historique des transactions",
        "Notifications de crédit mensuel"
    ]
    for f in fonc:
        pdf.bullet_point(f)
    
    pdf.section_title("Règles métier")
    pdf.body_text("- Cash-back crédité au début du mois suivant la facturation")
    pdf.body_text("- Valable sur tous les prestataires Titelli")
    pdf.body_text("- Non convertible en espèces")
    
    # 2. Navigation
    pdf.add_page()
    pdf.chapter_title("Navigation et Recherche", 2)
    
    pdf.section_title("Page d'accueil")
    fonc = [
        "Vidéos promotionnelles des prestataires",
        "Offres du moment en carousel",
        "Suggestions personnalisées par algorithme",
        "Tendances actuelles",
        "Prestataires guests du moment"
    ]
    for f in fonc:
        pdf.bullet_point(f)
    
    pdf.section_title("Recherche et Filtres")
    fonc = [
        "Recherche par nom, catégorie, localisation",
        "Filtres: Certifiés, Labellisés, Premium, Livraison",
        "Tri par popularité, prix, distance",
        "Carte interactive",
        "Favoris et historique"
    ]
    for f in fonc:
        pdf.bullet_point(f)
    
    pdf.section_title("Catégories de services")
    cats = ["Restauration", "Beauté & Bien-être", "Mode & Shopping", "Services à domicile", 
            "Santé", "Événementiel", "Sport & Loisirs", "Artisanat", "Immobilier", "Finance"]
    for c in cats:
        pdf.bullet_point(c)
    
    # 3. Commandes
    pdf.add_page()
    pdf.chapter_title("Commandes et Paiements", 3)
    
    pdf.section_title("Processus de commande")
    fonc = [
        "Panier multi-prestataires",
        "Choix du mode de livraison (standard, express, 24/24)",
        "Ajout de notes et instructions",
        "Application du cash-back",
        "Codes promo et réductions"
    ]
    for f in fonc:
        pdf.bullet_point(f)
    
    pdf.section_title("Paiements")
    fonc = [
        "Paiement sécurisé via Stripe",
        "Carte bancaire / Apple Pay / Google Pay",
        "Paiement en cash-back",
        "Factures automatiques",
        "Historique des transactions"
    ]
    for f in fonc:
        pdf.bullet_point(f)
    
    pdf.section_title("Suivi des commandes")
    fonc = [
        "Statut en temps réel",
        "Notifications push",
        "Chat avec le prestataire",
        "Évaluation et avis",
        "Réclamations et SAV"
    ]
    for f in fonc:
        pdf.bullet_point(f)
    
    # 4. Profil Client
    pdf.add_page()
    pdf.chapter_title("Profil et Préférences", 4)
    
    pdf.section_title("Informations personnelles")
    fonc = [
        "Photo de profil",
        "Coordonnées et adresses",
        "Préférences alimentaires/santé",
        "Centres d'intérêt",
        "Mode de communication préféré"
    ]
    for f in fonc:
        pdf.bullet_point(f)
    
    pdf.section_title("Fiches d'exigences")
    pdf.body_text("Permet aux prestataires de connaître vos préférences spécifiques pour un service personnalisé hors du commun.")
    
    pdf.section_title("Espace cartes")
    fonc = [
        "Cartes de fidélité",
        "Moyens de paiement enregistrés",
        "Réductions et avantages",
        "QR code membre"
    ]
    for f in fonc:
        pdf.bullet_point(f)
    
    # 5. Lifestyle Pass
    pdf.add_page()
    pdf.chapter_title("Lifestyle Pass", 5)
    
    pdf.section_title("Description")
    pdf.body_text("Le lifestyle pass donne accès au client à un nouveau mode de vie. Ce mode de vie permet de profiter des meilleurs services prestataires de leurs régions choisies!")
    
    pdf.section_title("Healthy Lifestyle Pass")
    pdf.body_text("Les prestataires qui répondent aux exigences spécifiques de santé. Ils respectent les clients de par la qualité et l'étude approfondie de leur métier.")
    
    fonc = [
        "Services et produits santé certifiés",
        "Livraison quotidienne possible",
        "Accompagnement personnalisé",
        "Conseils d'experts"
    ]
    for f in fonc:
        pdf.bullet_point(f)
    
    # PARTIE B - ENTREPRISE
    pdf.add_page()
    pdf.set_font('Helvetica', 'B', 20)
    pdf.set_text_color(245, 158, 11)
    pdf.cell(0, 20, "PARTIE B", 0, 1, 'C')
    pdf.set_font('Helvetica', 'B', 16)
    pdf.set_text_color(60, 60, 60)
    pdf.cell(0, 10, "FONCTIONNALITÉS ENTREPRISE", 0, 1, 'C')
    
    # 6. Dashboard Entreprise
    pdf.add_page()
    pdf.chapter_title("Dashboard Entreprise", 6)
    
    pdf.section_title("Vue d'ensemble")
    fonc = [
        "Statistiques de ventes en temps réel",
        "Graphiques de performance",
        "Chiffre d'affaires mensuel/annuel",
        "Nombre de clients et commandes",
        "Taux de satisfaction",
        "Cash-back généré"
    ]
    for f in fonc:
        pdf.bullet_point(f)
    
    pdf.section_title("Gestion des commandes")
    fonc = [
        "Liste des commandes en cours",
        "Validation et traitement",
        "Historique complet",
        "Export des données",
        "Notifications de nouvelles commandes"
    ]
    for f in fonc:
        pdf.bullet_point(f)
    
    pdf.section_title("Profil entreprise")
    fonc = [
        "Logo et images",
        "Description et présentation",
        "Horaires d'ouverture",
        "Coordonnées et localisation",
        "Certifications et labels"
    ]
    for f in fonc:
        pdf.bullet_point(f)
    
    # 7. Gestion Personnel
    pdf.add_page()
    pdf.chapter_title("Gestion du Personnel", 7)
    
    pdf.body_text("« Ils savent et comprennent ce que vous attendez d'eux exactement, sans vous répéter. »")
    
    pdf.section_title("Fonctionnalités")
    fonc = [
        "Profils employés",
        "Cahiers des charges journaliers/hebdomadaires/mensuels",
        "Ordres instantanés",
        "Suivi des performances",
        "Planning et disponibilités",
        "Évaluations"
    ]
    for f in fonc:
        pdf.bullet_point(f)
    
    pdf.section_title("Recrutement")
    fonc = [
        "Publication d'offres d'emploi",
        "Gestion des candidatures",
        "Filtrage et sélection",
        "Entretiens intégrés",
        "Contrats et documents"
    ]
    for f in fonc:
        pdf.bullet_point(f)
    
    # 8. Gestion Stocks
    pdf.add_page()
    pdf.chapter_title("Gestion des Stocks", 8)
    
    pdf.body_text("« C'est apaisant de pouvoir économiser mon énergie, Lorsque Titelli s'occupe de tout. »")
    
    pdf.section_title("Fonctionnalités principales")
    fonc = [
        "Inventaire en temps réel",
        "Mouvements de stocks",
        "Alertes de rupture",
        "Suggestions par algorithme",
        "Automatisation du réassort",
        "Rapports détaillés"
    ]
    for f in fonc:
        pdf.bullet_point(f)
    
    pdf.section_title("Commandes fournisseurs")
    fonc = [
        "Commandes actives, en cours, en attentes, permanentes",
        "Budget minimum exécutif",
        "Statistiques de ventes",
        "Niveau d'appréciation produits/services",
        "Inventaires facilités"
    ]
    for f in fonc:
        pdf.bullet_point(f)
    
    # 9. Finances
    pdf.add_page()
    pdf.chapter_title("Finances et Investissements", 9)
    
    pdf.section_title("Espace Finance")
    pdf.body_text("« Une vue sur ce qu'il se passe dans mes activités financières ? Et des suggestions pour rester dans mes objectifs ! »")
    
    fonc = [
        "Tableau de bord financier",
        "Détail des factures",
        "Suivi des paiements",
        "Gestion de portefeuille",
        "Prévisions et objectifs"
    ]
    for f in fonc:
        pdf.bullet_point(f)
    
    pdf.section_title("Investissements")
    pdf.body_text("Proposer des parts sur bénéfice sur un temps défini contre investissement. Trouver votre partenaire en affaire d'exception!")
    
    fonc = [
        "Création d'offres d'investissement",
        "Recherche d'investisseurs",
        "Négociation intégrée",
        "Suivi des participations",
        "Documents juridiques"
    ]
    for f in fonc:
        pdf.bullet_point(f)
    
    # 10. Marketing
    pdf.add_page()
    pdf.chapter_title("Marketing et Publicité", 10)
    
    pdf.section_title("Page pub spontanée")
    fonc = [
        "Teaser pour investisseurs",
        "Invitations personnelles (jusqu'à 200 clients)",
        "Ciblage de nouveaux clients",
        "Collaboration avec influenceurs",
        "Analyse des performances"
    ]
    for f in fonc:
        pdf.bullet_point(f)
    
    pdf.section_title("Offres et promotions")
    fonc = [
        "Publication d'offres illimitées",
        "Gestes commerciaux",
        "Périodes promotionnelles",
        "Liquidation de stocks",
        "Fidélisation clientèle"
    ]
    for f in fonc:
        pdf.bullet_point(f)
    
    pdf.section_title("Référencement")
    fonc = [
        "Référencement préférentiel",
        "Suggestions d'experts",
        "Algorithmes de visibilité",
        "Statistiques de recherche",
        "Optimisation SEO local"
    ]
    for f in fonc:
        pdf.bullet_point(f)
    
    # 11. Pub Média IA
    pdf.add_page()
    pdf.chapter_title("Pub Média IA", 11)
    
    pdf.section_title("Description")
    pdf.body_text("Système de création de publicités professionnelles avec intelligence artificielle. Interface style Canva avec aperçu en direct et génération automatique.")
    
    pdf.section_title("Fonctionnalités")
    fonc = [
        "34 templates dans 7 catégories",
        "Personnalisation en temps réel",
        "Couleurs de marque",
        "Texte slogan et description",
        "Filigrane de protection (retiré après paiement)",
        "Génération IA de l'image",
        "Post-processing du texte (qualité parfaite)",
        "Téléchargement HD"
    ]
    for f in fonc:
        pdf.bullet_point(f)
    
    pdf.section_title("Catégories de templates")
    cats = ["Réseaux Sociaux (Instagram, Facebook)", "Bannières Web", "Restauration (Menus)", 
            "Flyers & Affiches", "Email Marketing", "Stories", "Cartes de visite"]
    for c in cats:
        pdf.bullet_point(c)
    
    pdf.section_title("Tarification")
    pdf.body_text("Templates standards: 29.90 - 49.90 CHF")
    pdf.body_text("Création Sur Mesure: 149.90 CHF")
    
    # PARTIE C - ADMIN
    pdf.add_page()
    pdf.set_font('Helvetica', 'B', 20)
    pdf.set_text_color(245, 158, 11)
    pdf.cell(0, 20, "PARTIE C", 0, 1, 'C')
    pdf.set_font('Helvetica', 'B', 16)
    pdf.set_text_color(60, 60, 60)
    pdf.cell(0, 10, "FONCTIONNALITÉS ADMIN", 0, 1, 'C')
    
    # 12. Dashboard Admin
    pdf.add_page()
    pdf.chapter_title("Dashboard Admin", 12)
    
    pdf.section_title("Vue d'ensemble plateforme")
    fonc = [
        "Statistiques globales",
        "Nombre d'utilisateurs (clients, entreprises, influenceurs)",
        "Volume de transactions",
        "Revenus et commissions",
        "Graphiques et tendances"
    ]
    for f in fonc:
        pdf.bullet_point(f)
    
    pdf.section_title("Gestion des contenus")
    fonc = [
        "Validation des entreprises",
        "Modération des avis",
        "Gestion des offres",
        "Labellisation et certification",
        "Contenu éditorial"
    ]
    for f in fonc:
        pdf.bullet_point(f)
    
    # 13. Gestion Utilisateurs
    pdf.add_page()
    pdf.chapter_title("Gestion Utilisateurs", 13)
    
    pdf.section_title("Clients")
    fonc = [
        "Liste et recherche",
        "Profils détaillés",
        "Historique d'achats",
        "Gestion cash-back",
        "Support client"
    ]
    for f in fonc:
        pdf.bullet_point(f)
    
    pdf.section_title("Entreprises")
    fonc = [
        "Validation des inscriptions",
        "Suivi des performances",
        "Gestion des abonnements",
        "Certification et labellisation",
        "Communication"
    ]
    for f in fonc:
        pdf.bullet_point(f)
    
    pdf.section_title("Influenceurs")
    fonc = [
        "Profils vérifiés",
        "Statistiques d'engagement",
        "Collaborations actives",
        "Rémunérations"
    ]
    for f in fonc:
        pdf.bullet_point(f)
    
    # 14. Statistiques
    pdf.add_page()
    pdf.chapter_title("Statistiques et Rapports", 14)
    
    pdf.section_title("Rapports automatiques")
    fonc = [
        "Rapport journalier",
        "Rapport hebdomadaire",
        "Rapport mensuel",
        "Rapport annuel",
        "Export Excel/PDF"
    ]
    for f in fonc:
        pdf.bullet_point(f)
    
    pdf.section_title("Métriques clés")
    fonc = [
        "GMV (Gross Merchandise Value)",
        "Taux de conversion",
        "Panier moyen",
        "Rétention client",
        "NPS (Net Promoter Score)",
        "CAC (Coût d'Acquisition Client)"
    ]
    for f in fonc:
        pdf.bullet_point(f)
    
    # Sauvegarder
    output_path = f"{OUTPUT_DIR}/CDC_FONCTIONNALITES_TITELLI.pdf"
    pdf.output(output_path)
    print(f"✅ CDC Fonctionnalités généré: {output_path}")
    return output_path


if __name__ == "__main__":
    print("🔧 Génération des Cahiers des Charges Titelli...")
    
    # Générer les 2 PDFs
    path1 = generate_monetisation_cdc()
    path2 = generate_fonctionnalites_cdc()
    
    print("\n✅ Génération terminée!")
    print(f"📄 {path1}")
    print(f"📄 {path2}")
