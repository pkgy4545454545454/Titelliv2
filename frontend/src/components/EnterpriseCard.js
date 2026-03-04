import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Star, MapPin, ChevronRight, ChevronDown } from 'lucide-react';
import { enterpriseAPI } from '../services/api';

// Categories that have video backgrounds - mapping exact category names to video files
const CATEGORY_VIDEOS = {
  'Restauration': '/api/uploads/category_videos/restaurant.mp4',
  'Personnel de maison': '/api/uploads/category_videos/personnel_maison.mp4',
  'Soins esthétiques': '/api/uploads/category_videos/soins_esthetiques.mp4',
  'Coiffeurs': '/api/uploads/category_videos/coiffeurs.mp4',
  'Cours de sport': '/api/uploads/category_videos/cours_sport.mp4',
  'Activités': '/api/uploads/category_videos/activites.mp4',
  'Professionnels de santé': '/api/uploads/category_videos/professionnels_sante.mp4',
  'Agent immobilier': '/api/uploads/category_videos/agent_immobilier.mp4',
  'Sécurité': '/api/uploads/category_videos/securite.mp4',
};

// Sous-catégories pour chaque catégorie principale
const MAIN_CATEGORY_SUBCATEGORIES = {
  'Restauration': ['Restaurant', 'Brasserie', 'Bistrot', 'Bar', 'Café', 'Boulangerie', 'Boucherie', 'Épicerie', 'Traiteur', 'Pizzeria', 'Japonais'],
  'Personnel de maison': ['Soins Domicile', 'Nettoyage', 'Aide Soignant', 'Ménage', 'Garde Enfant'],
  'Soins esthétiques': ['Institut De Beauté', 'Massage', 'Spa', 'Bronzage', 'Maquillage', 'Manucure'],
  'Coiffeurs': ['Coiffeur Homme', 'Coiffeur Femme', 'Barbier', 'Coiffure Mixte'],
  'Cours de sport': ['Fitness', 'Yoga', 'Arts Martiaux', 'Danse', 'Natation', 'Tennis', 'Football'],
  'Activités': ['Cinéma', 'Théâtre', 'Musée', 'Parc', 'Escape Game', 'Bowling'],
  'Professionnels de santé': ['Médecin', 'Dentiste', 'Pharmacie', 'Physiothérapeute', 'Ostéopathe', 'Psychologue'],
  'Agent immobilier': ['Vente', 'Location', 'Gestion locative', 'Estimation'],
  'Sécurité': ['Gardiennage', 'Alarme', 'Vidéosurveillance', 'Agent de sécurité'],
  'Professionnels de transports': ['Taxi', 'VTC', 'Déménagement', 'Livraison', 'Ambulance'],
  'Professionnels d\'éducation': ['École primaire', 'Collège', 'Lycée', 'Université', 'Formation professionnelle'],
  'Professionnels administratifs': ['Comptable', 'Fiduciaire', 'Secrétariat', 'Ressources humaines'],
  'Professionnels juridiques': ['Avocat', 'Notaire', 'Huissier', 'Médiateur'],
  'Professionnels informatiques': ['Développement web', 'Support IT', 'Cybersécurité', 'Cloud'],
  'Professionnels de construction': ['Maçonnerie', 'Électricité', 'Plomberie', 'Peinture', 'Menuiserie']
};

const EnterpriseCard = ({ enterprises = [], large = false, category }) => {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const [index, setIndex] = React.useState(0);
  const [coverError, setCoverError] = React.useState(false);
  const [logoError, setLogoError] = React.useState(false);
  const [showSubcategories, setShowSubcategories] = useState(false);
  const [subcategories, setSubcategories] = useState([]);
  const [loadingSubcats, setLoadingSubcats] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);

  // Check if this category has a video
  const categoryVideo = CATEGORY_VIDEOS[category];
  const hasVideo = !!categoryVideo;

  // Fetch subcategories when category changes
  useEffect(() => {
    if (category && showSubcategories && subcategories.length === 0) {
      // D'abord vérifier si on a les sous-catégories en local
      if (MAIN_CATEGORY_SUBCATEGORIES[category]) {
        setSubcategories(MAIN_CATEGORY_SUBCATEGORIES[category]);
      } else {
        // Sinon, récupérer depuis l'API
        const fetchSubcategories = async () => {
          setLoadingSubcats(true);
          try {
            const response = await enterpriseAPI.getSubcategories(category);
            if (response.data?.subcategories) {
              setSubcategories(response.data.subcategories);
            }
          } catch (error) {
            console.error('Error fetching subcategories:', error);
          } finally {
            setLoadingSubcats(false);
          }
        };
        fetchSubcategories();
      }
    }
  }, [category, showSubcategories, subcategories.length]);

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

  const imageHeight = large ? 'h-36 sm:h-44' : 'h-28 sm:h-36';
  const cardPadding = large ? 'p-2 sm:p-4' : 'p-2 sm:p-3';
  const titleSize = large ? 'text-xs sm:text-base' : 'text-xs sm:text-sm';

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

  // Check if category has subcategories (will show after API call)
  const hasSubcategories = subcategories.length > 0 || loadingSubcats;

  const handleCategoryClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    // Toggle subcategories menu - will trigger API call via useEffect
    setShowSubcategories(!showSubcategories);
  };

  const handleSubcategoryClick = (e, subcategory) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/categorie/${encodeURIComponent(category)}?subcategory=${encodeURIComponent(subcategory)}`);
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
          <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${showSubcategories ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* SUBCATEGORIES DROPDOWN - Animated */}
      {showSubcategories && (
        <div 
          className="subcategories-menu absolute top-12 left-0 right-0 z-50 bg-white rounded-xl shadow-2xl border border-gray-100 p-3 animate-in slide-in-from-top-2 duration-300 max-h-[300px] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
          data-testid="subcategories-menu"
        >
          {loadingSubcats ? (
            <div className="flex items-center justify-center py-4">
              <div className="w-6 h-6 border-2 border-[#0047AB] border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : subcategories.length > 0 ? (
            <>
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
                    navigate(`/categorie/${encodeURIComponent(category)}`);
                  }}
                  className="w-full text-center text-sm text-[#0047AB] font-medium hover:underline"
                >
                  Voir tous les {category}
                </button>
              </div>
            </>
          ) : (
            <div className="text-center py-3">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  navigate(`/categorie/${encodeURIComponent(category)}`);
                }}
                className="text-sm text-[#0047AB] font-medium hover:underline"
              >
                Voir tous les {category}
              </button>
            </div>
          )}
        </div>
      )}

      {/* IMAGE OR VIDEO */}
      <div className={`relative ${imageHeight} overflow-hidden`}>
        {hasVideo ? (
          <>
            {/* Video Background for specific categories */}
            <video
              ref={videoRef}
              src={categoryVideo}
              autoPlay
              loop
              muted
              playsInline
              onLoadedData={() => setVideoLoaded(true)}
              onError={() => setVideoLoaded(false)}
              className={`w-full h-full object-cover transition-all duration-500 rounded-2xl ${videoLoaded ? 'opacity-100' : 'opacity-0'}`}
            />
            {/* Fallback image while video loads or on error */}
            {!videoLoaded && (
              <img
                src={actualCover}
                alt={displayName}
                className="absolute inset-0 w-full h-full object-cover rounded-2xl"
                onError={() => setCoverError(true)}
              />
            )}
          </>
        ) : (
          <img
            src={actualCover}
            alt={displayName}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 rounded-2xl"
            onError={() => setCoverError(true)}
          />
        )}

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
