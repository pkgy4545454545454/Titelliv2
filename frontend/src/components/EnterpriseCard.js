import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, ChevronRight, ChevronLeft } from 'lucide-react';

// Categories that have video backgrounds - Using public folder for production deployment
const CATEGORY_VIDEOS = {
  'Restauration': '/videos/restaurant.mp4',
  'Personnel de maison': '/videos/personnel_maison.mp4',
  'Soins esthétiques': '/videos/soins_esthetiques.mp4',
  'Coiffeurs': '/videos/coiffeurs.mp4',
  'Cours de sport': '/videos/cours_sport.mp4',
  'Activités': '/videos/activites.mp4',
  'Professionnels de santé': '/videos/professionnels_sante.mp4',
  'Agent immobilier': '/videos/agent_immobilier.mp4',
  'Sécurité': '/videos/securite.mp4',
  'Professionnels de transports': '/videos/professionnels_transports.mp4',
  'Professionnels d\'éducation': '/videos/professionnels_education.mp4',
  'Professionnels administratifs': '/videos/professionnels_administratifs.mp4',
};

// Fonction pour nettoyer les titres (seulement la première lettre en majuscule)
const cleanTitle = (title) => {
  if (!title) return '';
  const cleaned = title
    .replace(/_/g, ' ')
    .replace(/-/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
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
  const [videoLoaded, setVideoLoaded] = useState(false);

  // Check if this category has a video
  const categoryVideo = CATEGORY_VIDEOS[category];
  const hasVideo = !!categoryVideo;

  // Nettoyer le titre de la catégorie
  const cleanCategoryTitle = cleanTitle(category);

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
  };

  const goPrev = (e) => {
    e.stopPropagation();
    setIndex((prev) =>
      prev === 0 ? enterprises.length - 1 : prev - 1
    );
    setCoverError(false);
  };

  const handleCardClick = (e) => {
    if (e.target.closest('button')) {
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
      {/* CATEGORY LABEL - Click to go to category page */}
      <div className="flex items-center justify-center gap-2 mb-3 relative">
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            navigate(`/categorie/${encodeURIComponent(category)}`);
          }}
          className="text-black hover:text-[#0047AB] transition-colors"
          style={{ fontFamily: 'Playfair Display, serif' }}
          data-testid="category-link-btn"
        >
          <span className="font-medium">{cleanCategoryTitle}</span>
        </button>
      </div>

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
   
    </div>
  );
};

export default EnterpriseCard;
