import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Star, MapPin, ChevronRight } from 'lucide-react';

// Mapping des sous-catégories par catégorie principale
const SUBCATEGORIES_MAP = {
  'Restaurant': ['Cuisine française', 'Cuisine italienne', 'Cuisine chinoise', 'Cuisine japonaise', 'Cuisine thaï', 'Cuisine indienne', 'Cuisine mexicaine', 'Cuisine libanaise', 'Cuisine grecque', 'Fast food', 'Gastronomique', 'Végétarien/Vegan', 'Pizzeria', 'Sushi', 'Brasserie'],
  'Restauration': ['Cuisine française', 'Cuisine italienne', 'Cuisine chinoise', 'Cuisine japonaise', 'Cuisine thaï', 'Cuisine indienne', 'Cuisine mexicaine', 'Cuisine libanaise', 'Cuisine grecque', 'Fast food', 'Gastronomique', 'Végétarien/Vegan', 'Pizzeria', 'Sushi', 'Brasserie'],
  'Personnel de maison': ['Femme de ménage', 'Majordome', 'Cuisinier privé', 'Jardinier', 'Gouvernante', 'Chauffeur privé', 'Nounou', 'Aide à domicile', 'Agent multiservices', 'Gardien'],
  'Soins esthétiques': ['Épilation', 'Soins du visage', 'Soins du corps', 'Maquillage', 'Manucure', 'Pédicure', 'Massage', 'Bronzage', 'Extension cils', 'Microblading'],
  'Institut De Beaute': ['Épilation', 'Soins du visage', 'Soins du corps', 'Maquillage', 'Manucure', 'Pédicure', 'Massage', 'Bronzage', 'Extension cils', 'Microblading'],
  'Coiffeur': ['Coupe femme', 'Coupe homme', 'Coloration', 'Mèches', 'Lissage', 'Permanente', 'Extensions', 'Coiffure mariage', 'Barbier', 'Coiffure enfant'],
  'Coiffure & Beauté': ['Coupe femme', 'Coupe homme', 'Coloration', 'Mèches', 'Lissage', 'Permanente', 'Extensions', 'Coiffure mariage', 'Barbier', 'Coiffure enfant'],
  'Cours de sport': ['Fitness', 'Yoga', 'Pilates', 'CrossFit', 'Boxe', 'Arts martiaux', 'Natation', 'Tennis', 'Golf', 'Danse', 'Musculation', 'Coach personnel'],
  'Fitness': ['Cardio', 'Musculation', 'CrossFit', 'HIIT', 'Spinning', 'Zumba', 'Body pump', 'Stretching'],
  'Activités': ['Escape game', 'Bowling', 'Karting', 'Laser game', 'Cinéma', 'Théâtre', 'Parc attractions', 'Zoo', 'Musée', 'Concert'],
  'Professionnels de santé': ['Médecin généraliste', 'Dentiste', 'Kinésithérapeute', 'Ostéopathe', 'Psychologue', 'Nutritionniste', 'Podologue', 'Ophtalmologue', 'Dermatologue', 'Cardiologue'],
  'Medecin': ['Généraliste', 'Spécialiste', 'Urgentiste', 'Pédiatre', 'Gynécologue'],
  'Agent immobilier': ['Vente', 'Location', 'Gestion locative', 'Estimation', 'Immobilier de luxe', 'Immobilier commercial', 'Neuf', 'Ancien'],
  'Agence Immobiliere': ['Vente', 'Location', 'Gestion locative', 'Estimation', 'Immobilier de luxe', 'Immobilier commercial', 'Neuf', 'Ancien'],
  'Sécurité': ['Gardiennage', 'Vidéosurveillance', 'Alarme', 'Agent de sécurité', 'Protection rapprochée', 'Sécurité événementielle', 'Cybersécurité'],
  'Professionnels de transports': ['Taxi', 'VTC', 'Chauffeur privé', 'Transport de marchandises', 'Déménagement', 'Livraison', 'Location véhicule', 'Transport médical'],
  'Professionnels d\'éducation': ['École primaire', 'Collège', 'Lycée', 'Université', 'Cours particuliers', 'Soutien scolaire', 'École de langues', 'Formation professionnelle'],
  'Formation': ['Formation continue', 'Certification', 'Langues', 'Informatique', 'Management', 'Comptabilité', 'Marketing'],
  'Professionnels administratifs': ['Secrétariat', 'Comptabilité', 'Ressources humaines', 'Traduction', 'Domiciliation', 'Services postaux'],
  'Professionnels juridiques': ['Avocat', 'Notaire', 'Huissier', 'Conseil juridique', 'Médiation', 'Droit des affaires', 'Droit de la famille'],
  'Avocat': ['Droit pénal', 'Droit civil', 'Droit des affaires', 'Droit de la famille', 'Droit du travail', 'Droit immobilier', 'Droit fiscal'],
  'Professionnels informatiques': ['Développement web', 'Développement mobile', 'Maintenance', 'Conseil IT', 'Cybersécurité', 'Cloud', 'Data science', 'Support technique'],
  'Informatique': ['Développement web', 'Développement mobile', 'Maintenance', 'Conseil IT', 'Cybersécurité', 'Cloud', 'Data science', 'Support technique'],
  'Professionnels de construction': ['Maçonnerie', 'Plomberie', 'Électricité', 'Menuiserie', 'Carrelage', 'Peinture', 'Toiture', 'Isolation', 'Chauffage', 'Rénovation'],
  'Bijouterie': ['Bagues', 'Colliers', 'Bracelets', 'Boucles d\'oreilles', 'Montres', 'Bijoux sur mesure', 'Réparation', 'Gravure'],
  'Bijouteries': ['Bagues', 'Colliers', 'Bracelets', 'Boucles d\'oreilles', 'Montres', 'Bijoux sur mesure', 'Réparation', 'Gravure'],
  'Bijouteries & Horlogerie': ['Montres de luxe', 'Bijoux', 'Réparation montres', 'Gravure', 'Estimation', 'Rachat'],
  'Horlogerie': ['Montres de luxe', 'Montres sport', 'Montres connectées', 'Réparation', 'Estimation', 'Rachat'],
  'Garage': ['Réparation', 'Entretien', 'Carrosserie', 'Pneus', 'Vidange', 'Diagnostic', 'Climatisation auto'],
  'Automobile & Garage': ['Réparation', 'Entretien', 'Carrosserie', 'Pneus', 'Vidange', 'Diagnostic', 'Vente véhicules'],
  'Boulangerie': ['Pain traditionnel', 'Viennoiseries', 'Pâtisseries', 'Snacking', 'Pain bio', 'Pain sans gluten'],
  'Boulangerie & Pâtisserie': ['Pain', 'Croissants', 'Gâteaux', 'Tartes', 'Macarons', 'Chocolaterie'],
  'Pharmacie': ['Médicaments', 'Parapharmacie', 'Cosmétiques', 'Homéopathie', 'Matériel médical', 'Conseil santé'],
  'Banque': ['Compte courant', 'Épargne', 'Crédit immobilier', 'Crédit auto', 'Assurance', 'Investissement', 'Banque privée'],
  'Hotel': ['Hôtel de luxe', 'Hôtel business', 'Hôtel familial', 'Boutique hôtel', 'Apart-hôtel', 'Auberge'],
  'Spa': ['Massage', 'Sauna', 'Hammam', 'Jacuzzi', 'Soins du corps', 'Balnéothérapie'],
  'Veterinaire': ['Chiens', 'Chats', 'NAC', 'Équins', 'Urgences', 'Chirurgie', 'Vaccination'],
  'Fleuriste': ['Bouquets', 'Compositions', 'Plantes', 'Fleurs de mariage', 'Deuil', 'Événements', 'Abonnement floral'],
  'Assurance': ['Auto', 'Habitation', 'Santé', 'Vie', 'Professionnelle', 'Voyage'],
  'Comptable': ['Comptabilité générale', 'Fiscalité', 'Paie', 'Création entreprise', 'Audit', 'Conseil'],
  'Architecte': ['Maison individuelle', 'Appartement', 'Commercial', 'Rénovation', 'Extension', 'Décoration intérieure'],
  'Plombier': ['Dépannage', 'Installation', 'Rénovation salle de bain', 'Chauffe-eau', 'Débouchage'],
  'Electricien': ['Dépannage', 'Installation', 'Rénovation', 'Domotique', 'Mise aux normes'],
  'Serrurier': ['Dépannage', 'Ouverture de porte', 'Blindage', 'Coffre-fort', 'Reproduction clés'],
};

// Liste des catégories principales qui ont des sous-catégories
const CATEGORIES_WITH_SUBCATEGORIES = Object.keys(SUBCATEGORIES_MAP);

const EnterpriseCard = ({ enterprises = [], large = false, category }) => {
  const navigate = useNavigate();
  const [index, setIndex] = React.useState(0);
  const [coverError, setCoverError] = React.useState(false);
  const [logoError, setLogoError] = React.useState(false);
  const [showSubcategories, setShowSubcategories] = useState(false);

  if (!enterprises.length) return null;

  const enterprise = enterprises[index];

  const {
    id,
    business_name,
    name,
    city,
    rating,
    review_count,
    cover_image,
    logo,
    display_status,
    activation_status
  } = enterprise;

  const defaultImage =
    'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800';

  const isValidUrl = (url) => {
    if (!url) return false;
    if (url.includes('enterprise-media.preview.emergentagent.com')) return false;
    return true;
  };

  const actualCover =
    !coverError && isValidUrl(cover_image) ? cover_image : defaultImage;
  const actualLogo =
    !logoError && isValidUrl(logo) ? logo : null;

  const isActive =
    display_status === 'actif' || activation_status === 'active';

  const displayName = name || business_name;
  const displayRating = rating
    ? `${rating.toFixed(1)} / 5`
    : '4.5 / 5';

  const imageHeight = large ? 'h-44 sm:h-56' : 'h-36 sm:h-48';
  const cardPadding = large ? 'p-3 sm:p-5' : 'p-3 sm:p-4';
  const titleSize = large ? 'text-sm sm:text-xl' : 'text-sm sm:text-lg';

  const next = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIndex((prev) => (prev + 1) % enterprises.length);
    setCoverError(false);
    setLogoError(false);
  };

  const prev = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIndex((prev) =>
      prev === 0 ? enterprises.length - 1 : prev - 1
    );
    setCoverError(false);
    setLogoError(false);
  };

  // Vérifier si cette catégorie a des sous-catégories
  const hasSubcategories = category && CATEGORIES_WITH_SUBCATEGORIES.some(
    cat => category.toLowerCase().includes(cat.toLowerCase()) || cat.toLowerCase().includes(category.toLowerCase())
  );
  
  // Trouver les sous-catégories correspondantes
  const getSubcategories = () => {
    if (!category) return [];
    const matchingKey = CATEGORIES_WITH_SUBCATEGORIES.find(
      cat => category.toLowerCase().includes(cat.toLowerCase()) || cat.toLowerCase().includes(category.toLowerCase())
    );
    return matchingKey ? SUBCATEGORIES_MAP[matchingKey] : [];
  };

  const subcategories = getSubcategories();

  const handleCategoryClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (hasSubcategories && subcategories.length > 0) {
      setShowSubcategories(!showSubcategories);
    } else {
      navigate(`/entreprises?category=${encodeURIComponent(category)}`);
    }
  };

  const handleSubcategoryClick = (e, subcategory) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/entreprises?category=${encodeURIComponent(category)}&subcategory=${encodeURIComponent(subcategory)}`);
  };

  const handleCardClick = (e) => {
    // Ne pas naviguer si on clique sur les contrôles
    if (e.target.closest('button') || e.target.closest('.subcategories-menu')) {
      return;
    }
    navigate(`/entreprise/${id}`);
  };

  return (
    <div 
      className="shadow-sm hover:shadow-lg group block rounded-2xl overflow-hidden h-full transition-all relative cursor-pointer"
      onClick={handleCardClick}
      data-testid={`enterprise-card-${id}`}
    >
      {/* CATEGORY LABEL - Clickable */}
      <div className="flex items-center gap-1.5 mb-3 relative">
        <button
          onClick={handleCategoryClick}
          className="text-black justify-center m-auto flex items-center gap-1 hover:text-[#0047AB] transition-colors font-medium"
          data-testid={`category-btn-${category}`}
        >
          {category}
          {hasSubcategories && (
            <ChevronRight className={`w-4 h-4 transition-transform duration-300 ${showSubcategories ? 'rotate-90' : ''}`} />
          )}
        </button>
      </div>

      {/* SUBCATEGORIES DROPDOWN - Animated */}
      {showSubcategories && subcategories.length > 0 && (
        <div 
          className="subcategories-menu absolute top-12 left-0 right-0 z-50 bg-white rounded-xl shadow-2xl border border-gray-100 p-3 animate-in slide-in-from-top-2 duration-300 max-h-[300px] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
          data-testid="subcategories-menu"
        >
          <div className="grid grid-cols-2 gap-2">
            {subcategories.map((subcat, idx) => (
              <button
                key={idx}
                onClick={(e) => handleSubcategoryClick(e, subcat)}
                className="text-left px-3 py-2 text-sm text-gray-700 hover:bg-[#0047AB]/10 hover:text-[#0047AB] rounded-lg transition-all duration-200 transform hover:translate-x-1"
                style={{ animationDelay: `${idx * 30}ms` }}
                data-testid={`subcategory-${subcat}`}
              >
                {subcat}
              </button>
            ))}
          </div>
          <div className="mt-3 pt-3 border-t border-gray-100">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                navigate(`/entreprises?category=${encodeURIComponent(category)}`);
              }}
              className="w-full text-center text-sm text-[#0047AB] font-medium hover:underline"
            >
              Voir tous les {category}
            </button>
          </div>
        </div>
      )}

      {/* IMAGE */}
      <div className={`relative ${imageHeight} overflow-hidden`}>
        <img
          src={actualCover}
          alt={displayName}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 rounded-2xl"
          onError={() => setCoverError(true)}
        />

        {/* LOGO */}
        {actualLogo && (
          <div className={`absolute bottom-3 right-3 ${large ? 'w-12 h-12' : 'w-10 h-10'} rounded-full bg-white p-1 shadow-md`}>
            <img
              src={actualLogo}
              alt=""
              className="w-full h-full object-cover rounded-full"
              onError={() => setLogoError(true)}
            />
          </div>
        )}

        {/* ARROWS */}
        {enterprises.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white px-2 py-1 rounded-lg shadow-md transition-all hover:scale-110"
              data-testid="prev-enterprise-btn"
            >
              ◀
            </button>
            <button
              onClick={next}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white px-2 py-1 rounded-lg shadow-md transition-all hover:scale-110"
              data-testid="next-enterprise-btn"
            >
              ▶
            </button>
          </>
        )}

        {/* Counter indicator */}
        {enterprises.length > 1 && (
          <div className="absolute bottom-3 left-3 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
            {index + 1} / {enterprises.length}
          </div>
        )}
      </div>

      {/* CONTENT */}
      <div className={cardPadding}>
        <h3
          className={`${titleSize} font-semibold text-gray-900 group-hover:text-[#0047AB] transition-colors line-clamp-2 mb-2 justify-center m-auto flex items-center gap-1`}
        >
          {displayName}
        </h3>

        <div className="flex items-center gap-1.5 mb-3 justify-center">
          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
          <span className="text-sm font-medium text-gray-700">
            {displayRating}
          </span>
          {review_count > 0 && (
            <span className="text-xs text-gray-400">
              ({review_count} avis)
            </span>
          )}
        </div>

        <div className="flex items-center justify-center text-xs sm:text-sm gap-2">
          <div className="flex items-center gap-1 text-gray-400">
            <MapPin className="w-3.5 h-3.5" />
            <span className="line-clamp-1">{city || 'Lausanne'}</span>
          </div>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/entreprise/${id}`);
          }}
          className={`w-full mt-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
            isActive
              ? 'bg-[#0047AB] text-white hover:bg-[#0047AB]/90'
              : 'bg-gray-200 text-gray-500'
          }`}
          data-testid={`reserve-btn-${id}`}
        >
          {isActive ? 'Réserver' : 'Bientôt'}
        </button>
      </div>
    </div>
  );
};

export default EnterpriseCard;
