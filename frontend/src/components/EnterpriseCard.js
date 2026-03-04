import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Star, MapPin, ChevronRight, ChevronLeft, Plus, Minus } from 'lucide-react';
import { enterpriseAPI } from '../services/api';

// Categories that have video backgrounds
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
  'Professionnels de transports': '/api/uploads/category_videos/professionnels_transports.mp4',
  'Professionnels d\'éducation': '/api/uploads/category_videos/professionnels_education.mp4',
  'Professionnels administratifs': '/api/uploads/category_videos/professionnels_administratifs.mp4',
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

// Fonction pour nettoyer les titres (enlever _ et - et mettre en forme propre)
const cleanTitle = (title) => {
  if (!title) return '';
  return title
    .replace(/_/g, ' ')
    .replace(/-/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

// Composant pour les bulles de notation (5 mini bulles vertes)
const RatingDots = ({ rating = 0, maxRating = 5 }) => {
  const filledDots = Math.round(rating);
  return (
    <div className="flex items-center gap-1">
      {[...Array(maxRating)].map((_, index) => (
        <div
          key={index}
          className={`w-2 h-2 rounded-full ${
            index < filledDots ? 'bg-green-500' : 'bg-gray-300'
          }`}
        />
      ))}
    </div>
  );
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

  // Nettoyer le titre de la catégorie
  const cleanCategoryTitle = cleanTitle(category);

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

  const current = enterprises[index] || {};
  const {
    id,
    business_name,
    name,
    city,
    rating,
    review_count,
    cover_image,
    logo,
    subcategory,
    display_status,
    activation_status
  } = current;

  const defaultImage = 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800';
  const actualCover = !coverError && cover_image ? cover_image : defaultImage;
  const displayName = cleanTitle(business_name || name);
  const displayRating = rating ? Math.min(5, Math.round(rating)) : 4;
  const isActive = display_status === 'actif' || activation_status === 'active';

  const imageHeight = large ? 'h-40 sm:h-48 md:h-56' : 'h-28 sm:h-36';

  const goNext = (e) => {
    e.stopPropagation();
    setIndex((prev) => (prev + 1) % enterprises.length);
    setCoverError(false);
    setLogoError(false);
  };

  const goPrev = (e) => {
    e.stopPropagation();
    setIndex((prev) =>
      prev === 0 ? enterprises.length - 1 : prev - 1
    );
    setCoverError(false);
    setLogoError(false);
  };

  const handleCategoryClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowSubcategories(!showSubcategories);
  };

  const handleSubcategoryClick = (e, subcategory) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/categorie/${encodeURIComponent(category)}?subcategory=${encodeURIComponent(subcategory)}`);
  };

  const handleCardClick = (e) => {
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
      {/* CATEGORY LABEL with + button */}
      <div className="flex items-center justify-center gap-2 mb-3 relative">
        <span 
          className="text-black text-center font-medium"
          style={{ fontFamily: 'Playfair Display, serif' }}
        >
          {cleanCategoryTitle}
        </span>
        <button
          onClick={handleCategoryClick}
          className="w-5 h-5 rounded-full bg-[#0047AB] text-white flex items-center justify-center hover:bg-[#003080] transition-colors"
          data-testid={`category-btn-${category}`}
        >
          {showSubcategories ? (
            <Minus className="w-3 h-3" />
          ) : (
            <Plus className="w-3 h-3" />
          )}
        </button>
      </div>

      {/* SUBCATEGORIES DROPDOWN */}
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
            <div className="space-y-1">
              {subcategories.map((subcat, idx) => (
                <button
                  key={idx}
                  onClick={(e) => handleSubcategoryClick(e, subcat)}
                  className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-[#0047AB]/10 hover:text-[#0047AB] rounded-lg transition-colors"
                  style={{ fontFamily: 'Playfair Display, serif' }}
                >
                  {cleanTitle(subcat)}
                </button>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-sm text-center py-2">Aucune sous-catégorie</p>
          )}
        </div>
      )}

      {/* IMAGE/VIDEO with navigation arrows */}
      <div className={`relative ${imageHeight} overflow-hidden`}>
        {hasVideo ? (
          <>
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

        {/* Navigation arrows on media */}
        {enterprises.length > 1 && (
          <>
            <button
              onClick={goPrev}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"
              data-testid="prev-enterprise"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={goNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"
              data-testid="next-enterprise"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}

        {/* LOGO */}
        {logo && !logoError && (
          <div className="absolute bottom-2 right-2 w-10 h-10 rounded-full bg-white p-1 shadow-md z-10">
            <img
              src={logo}
              alt=""
              className="w-full h-full object-cover rounded-full"
              onError={() => setLogoError(true)}
            />
          </div>
        )}
      </div>

      {/* CONTENT */}
      <div className="p-2 sm:p-3">
        <h3 
          className="text-xs sm:text-sm font-semibold text-gray-900 group-hover:text-[#0047AB] transition-colors line-clamp-2 mb-2 text-center"
          style={{ fontFamily: 'Playfair Display, serif' }}
        >
          {displayName}
        </h3>
        
        {/* Rating with green dots */}
        <div className="flex items-center justify-center mb-2">
          <RatingDots rating={displayRating} />
        </div>
        
        <div className="flex items-center justify-center text-xs sm:text-sm gap-1 text-gray-400 mb-3">
          <MapPin className="w-3.5 h-3.5" />
          <span className="line-clamp-1">{city || 'Lausanne'}</span>
        </div>
        
        <button
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/entreprise/${id}`);
          }}
          className={`w-full py-2.5 rounded-xl text-sm font-medium transition-all ${
            isActive 
              ? 'bg-[#0047AB] text-white hover:bg-[#0047AB]/90' 
              : 'bg-gray-200 text-gray-500'
          }`}
          style={{ fontFamily: 'Playfair Display, serif' }}
        >
          {isActive ? 'Réserver' : 'Bientôt'}
        </button>
      </div>

      {/* Enterprise counter */}
      {enterprises.length > 1 && (
        <div className="absolute top-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded-full z-10">
          {index + 1}/{enterprises.length}
        </div>
      )}
    </div>
  );
};

export default EnterpriseCard;
