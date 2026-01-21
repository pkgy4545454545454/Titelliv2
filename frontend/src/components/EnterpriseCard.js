import React from 'react';
import { Link } from 'react-router-dom';
import { Star, MapPin, Award, Crown, CheckCircle } from 'lucide-react';

const EnterpriseCard = ({ enterprise }) => {
  const {
    id,
    business_name,
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
    logo
  } = enterprise;

  const defaultImage = 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800';

  return (
    <Link 
      to={`/entreprise/${id}`}
      className="card-service group block rounded-xl overflow-hidden"
      data-testid={`enterprise-card-${id}`}
    >
      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={cover_image || defaultImage}
          alt={business_name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        
        {/* Badges */}
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
        {logo && (
          <div className="absolute bottom-3 right-3 w-12 h-12 rounded-full bg-white p-1">
            <img src={logo} alt="" className="w-full h-full object-cover rounded-full" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-4 mb-2">
          <h3 className="text-lg font-semibold text-white group-hover:text-[#0047AB] transition-colors line-clamp-1">
            {business_name}
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
