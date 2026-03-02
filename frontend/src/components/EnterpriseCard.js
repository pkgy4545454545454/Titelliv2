import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Star, MapPin, ChevronRight, ChevronDown } from 'lucide-react';
import { enterpriseAPI } from '../services/api';

const EnterpriseCard = ({ enterprises = [], large = false, category }) => {
  const navigate = useNavigate();
  const [index, setIndex] = React.useState(0);
  const [coverError, setCoverError] = React.useState(false);
  const [logoError, setLogoError] = React.useState(false);
  const [showSubcategories, setShowSubcategories] = useState(false);
  const [subcategories, setSubcategories] = useState([]);
  const [loadingSubcats, setLoadingSubcats] = useState(false);

  // Fetch subcategories when category changes
  useEffect(() => {
    if (category && showSubcategories && subcategories.length === 0) {
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
