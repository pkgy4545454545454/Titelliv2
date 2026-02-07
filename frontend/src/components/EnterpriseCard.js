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

  return (
    <Link 
      to={`/entreprise/${id}`}
      className="card-service group block rounded-xl overflow-hidden"
      data-testid={`enterprise-card-${id}`}
    >
      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={actualCover}
          alt={displayName}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          onError={() => setCoverError(true)}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        
        {/* Status Badge - Top Right */}
        <div className="absolute top-3 right-3">
          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${statusLabel.color} flex items-center gap-1`}>
            {statusLabel.text === 'Actif' ? (
              <CheckCircle className="w-3 h-3" />
            ) : (
              <Clock className="w-3 h-3" />
            )}
            {statusLabel.text}
          </span>
        </div>
        
        {/* Badges - Top Left */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-2">
          {is_certified && (
            <span className="badge-certified flex items-center gap-1">
              <CheckCircle className="w-3 h-3" />
              Certifié
            </span>
          )}
          {is_labeled && (
            <span className="badge-labeled flex items-center gap-1">
              <Award className="w-3 h-3" />
              Labellisé
            </span>
          )}
          {is_premium && (
            <span className="badge-premium flex items-center gap-1">
              <Crown className="w-3 h-3" />
              Premium
            </span>
          )}
        </div>

        {/* Logo */}
        {actualLogo && (
          <div className="absolute bottom-3 right-3 w-12 h-12 rounded-full bg-white p-1">
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
      <div className="p-5">
        <div className="flex items-start justify-between gap-4 mb-2">
          <h3 className="text-lg font-semibold text-white group-hover:text-[#0047AB] transition-colors line-clamp-1">
            {displayName}
          </h3>
          {rating > 0 && (
            <div className="flex items-center gap-1 flex-shrink-0">
              <Star className="w-4 h-4 fill-[#D4AF37] text-[#D4AF37]" />
              <span className="text-sm font-medium text-white">{rating.toFixed(1)}</span>
            </div>
          )}
        </div>

        {slogan && (
          <p className="text-sm text-[#D4AF37] mb-2 line-clamp-1">{slogan}</p>
        )}

        <p className="text-sm text-gray-400 mb-4 line-clamp-2">
          {description}
        </p>

        <div className="flex items-center justify-between text-sm">
          <span className="px-3 py-1 bg-white/5 rounded-full text-gray-400">
            {category}
          </span>
          <div className="flex items-center gap-1 text-gray-500">
            <MapPin className="w-4 h-4" />
            <span>{city}</span>
          </div>
        </div>

        {review_count > 0 && (
          <p className="text-xs text-gray-500 mt-3">
            {review_count} avis
          </p>
        )}
      </div>
    </Link>
  );
};

export default EnterpriseCard;
