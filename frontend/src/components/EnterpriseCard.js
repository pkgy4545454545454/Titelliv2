import React from 'react';
import { Link } from 'react-router-dom';
import { Star, MapPin, Award, Crown, CheckCircle, Clock } from 'lucide-react';

const EnterpriseCard = ({ enterprise, large = false }) => {
  const {
    id,
    business_name,
    name,
    slogan,
    description,
    category,
    city,
    rating,
    review_count,
    is_certified,
    is_labeled,
    is_premium,
    cover_image,
    logo,
    display_status,
    activation_status
  } = enterprise;

  const defaultImage = 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800';
  const defaultLogo = null;
  
  // State for handling broken images
  const [coverError, setCoverError] = React.useState(false);
  const [logoError, setLogoError] = React.useState(false);
  
  // Check if URL is valid (not from old broken domain)
  const isValidUrl = (url) => {
    if (!url) return false;
    if (url.includes('enterprise-media.preview.emergentagent.com')) return false;
    return true;
  };
  
  const actualCover = !coverError && isValidUrl(cover_image) ? cover_image : defaultImage;
  const actualLogo = !logoError && isValidUrl(logo) ? logo : defaultLogo;
  
  // Determine status label
  const getStatusLabel = () => {
    const status = display_status || (activation_status === 'active' ? 'actif' : 'bientot_disponible');
    switch(status) {
      case 'actif':
        return { text: 'Actif', color: 'bg-green-500/20 text-green-400 border-green-500/30' };
      case 'en_attente':
        return { text: 'En attente', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' };
      default:
        return { text: 'Bientôt disponible', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' };
    }
  };
  
  const statusLabel = getStatusLabel();
  const displayName = name || business_name;

  // Responsive sizes
  const imageHeight = large ? 'h-44 sm:h-56' : 'h-36 sm:h-48';
  const cardPadding = large ? 'p-3 sm:p-5' : 'p-3 sm:p-4';
  const titleSize = large ? 'text-sm sm:text-xl' : 'text-sm sm:text-lg';
  const descHeight = large ? 'line-clamp-2 sm:line-clamp-3' : 'line-clamp-2';

  return (
    <Link 
      to={`/entreprise/${id}`}
      className="bg-black border border-white/10 shadow-sm hover:shadow-md group block rounded-xl overflow-hidden h-full transition-all"
      data-testid={`enterprise-card-${id}`}
    >
      {/* Image */}
      <div className={`relative ${imageHeight} overflow-hidden`}>
        <img
          src={actualCover}
          alt={displayName}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          onError={() => setCoverError(true)}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        
        {/* Status Badge - Top Right */}
        <div className="absolute top-2 sm:top-3 right-2 sm:right-3">
          <span className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium border ${statusLabel.color} flex items-center gap-0.5 sm:gap-1`}>
            {statusLabel.text === 'Actif' ? (
              <CheckCircle className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
            ) : (
              <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
            )}
            <span className="hidden sm:inline">{statusLabel.text}</span>
            <span className="sm:hidden">{statusLabel.text === 'Actif' ? 'Actif' : 'Bientôt'}</span>
          </span>
        </div>
        
        {/* Badges - Top Left */}
        <div className="absolute top-2 sm:top-3 left-2 sm:left-3 flex flex-wrap gap-1 sm:gap-2">
          {is_certified && (
            <span className="badge-certified flex items-center gap-0.5 sm:gap-1 text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1">
              <CheckCircle className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
              <span className="hidden sm:inline">Certifié</span>
            </span>
          )}
          {is_labeled && (
            <span className="badge-labeled flex items-center gap-0.5 sm:gap-1 text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1">
              <Award className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
              <span className="hidden sm:inline">Labellisé</span>
            </span>
          )}
          {is_premium && (
            <span className="badge-premium flex items-center gap-0.5 sm:gap-1 text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1">
              <Crown className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
              <span className="hidden sm:inline">Premium</span>
            </span>
          )}
        </div>

        {/* Logo */}
        {actualLogo && (
          <div className={`absolute bottom-2 sm:bottom-3 right-2 sm:right-3 ${large ? 'w-10 h-10 sm:w-14 sm:h-14' : 'w-8 h-8 sm:w-12 sm:h-12'} rounded-full bg-white p-0.5 sm:p-1`}>
            <img 
              src={actualLogo} 
              alt="" 
              className="w-full h-full object-cover rounded-full" 
              onError={() => setLogoError(true)}
            />
          </div>
        )}
      </div>

      {/* Content */}
      <div className={cardPadding}>
        <div className="flex items-start justify-between gap-2 sm:gap-4 mb-1.5 sm:mb-2">
          <h3 className={`${titleSize} font-semibold text-white group-hover:text-[#D4AF37] transition-colors line-clamp-1`}>
            {category ? `${category} - ${displayName}` : displayName}
          </h3>
          {rating > 0 && (
            <div className="flex items-center gap-0.5 sm:gap-1 flex-shrink-0">
              <Star className="w-3 h-3 sm:w-4 sm:h-4 fill-[#D4AF37] text-[#D4AF37]" />
              <span className="text-xs sm:text-sm font-medium text-white">{rating.toFixed(1)}</span>
            </div>
          )}
        </div>

        {slogan && (
          <p className="text-xs sm:text-sm text-[#D4AF37] mb-1.5 sm:mb-2 line-clamp-1">{slogan}</p>
        )}

        <p className={`text-xs sm:text-sm text-gray-400 mb-2 sm:mb-4 ${descHeight}`}>
          {description}
        </p>

        <div className="flex items-center justify-between text-xs sm:text-sm gap-2">
          <span className="px-2 sm:px-3 py-0.5 sm:py-1 bg-white/10 rounded-full text-gray-300 line-clamp-1 flex-shrink min-w-0">
            {category}
          </span>
          <div className="flex items-center gap-0.5 sm:gap-1 text-gray-400 flex-shrink-0">
            <MapPin className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="line-clamp-1">{city}</span>
          </div>
        </div>

        {review_count > 0 && (
          <p className="text-[10px] sm:text-xs text-gray-500 mt-2 sm:mt-3">
            {review_count} avis
          </p>
        )}
      </div>
    </Link>
  );
};

export default EnterpriseCard;
