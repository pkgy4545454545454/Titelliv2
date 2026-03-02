import React, { useState, useEffect, useRef } from 'react';
import { useParams, useSearchParams, Link, useNavigate } from 'react-router-dom';
import { Search, ChevronLeft, ChevronRight, MapPin, Star, ArrowLeft, Play, Pause } from 'lucide-react';
import { enterpriseAPI } from '../services/api';
import { toast } from 'sonner';

const CategoryEnterprisesPage = () => {
  const { category } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const subcategory = searchParams.get('subcategory') || '';
  const videoRef = useRef(null);
  
  const [enterprises, setEnterprises] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryName, setCategoryName] = useState('');
  const [isVideoPlaying, setIsVideoPlaying] = useState(true);

  // Decode category from URL
  const decodedCategory = decodeURIComponent(category || '').replace(/_/g, ' ');

  // Fetch category details and subcategories
  useEffect(() => {
    const fetchCategoryData = async () => {
      try {
        const response = await enterpriseAPI.getSubcategories(category);
        if (response.data) {
          setCategoryName(response.data.category || decodedCategory);
          setSubcategories(response.data.subcategories || []);
        }
      } catch (error) {
        console.error('Error fetching category data:', error);
      }
    };
    if (category) {
      fetchCategoryData();
    }
  }, [category, decodedCategory]);

  // Fetch enterprises
  useEffect(() => {
    const fetchEnterprises = async () => {
      setLoading(true);
      try {
        const params = { 
          category: decodedCategory,
          limit: 100 
        };
        if (subcategory) {
          params.subcategory = subcategory;
        }
        if (searchQuery) {
          params.search = searchQuery;
        }

        const response = await enterpriseAPI.list(params);
        setEnterprises(response.data.enterprises || []);
        setTotal(response.data.total || 0);
      } catch (error) {
        console.error('Error fetching enterprises:', error);
        toast.error('Erreur lors du chargement des entreprises');
      } finally {
        setLoading(false);
      }
    };
    
    if (decodedCategory) {
      fetchEnterprises();
    }
  }, [decodedCategory, subcategory, searchQuery]);

  // Handle subcategory click
  const handleSubcategoryClick = (subcat) => {
    navigate(`/categorie/${encodeURIComponent(category)}?subcategory=${encodeURIComponent(subcat)}`);
  };

  // Clear subcategory filter
  const clearSubcategory = () => {
    navigate(`/categorie/${encodeURIComponent(category)}`);
  };

  // Toggle video
  const toggleVideo = () => {
    if (videoRef.current) {
      if (isVideoPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsVideoPlaying(!isVideoPlaying);
    }
  };

  // Carousel scroll
  const carouselRef = useRef(null);
  const scrollCarousel = (direction) => {
    if (carouselRef.current) {
      const scrollAmount = 320;
      const newScrollLeft = carouselRef.current.scrollLeft + (direction === 'left' ? -scrollAmount : scrollAmount);
      carouselRef.current.scrollTo({ left: newScrollLeft, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] pt-20" data-testid="category-enterprises-page">
      {/* Hero Section with Video - Like EnterprisesPage */}
      <div className="relative h-[45vh] min-h-[350px] overflow-hidden">
        {/* Video Background */}
        <div className="absolute inset-0">
          <video
            ref={videoRef}
            autoPlay
            muted
            loop
            playsInline
            className="w-full h-full object-cover"
            poster="https://images.unsplash.com/photo-1497366216548-37526070297c?w=1920&q=80"
          >
            <source src={`${process.env.REACT_APP_BACKEND_URL}/api/uploads/video_services.mp4`} type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-b from-[#050505]/60 via-[#050505]/40 to-[#050505]" />
        </div>

        {/* Hero Content - Centered */}
        <div className="relative h-full flex flex-col items-center justify-center text-center px-4">
          {/* Back Button */}
          <button 
            onClick={() => navigate(-1)}
            className="absolute top-4 left-4 flex items-center gap-2 text-white/80 hover:text-white transition-colors bg-black/30 backdrop-blur-sm px-4 py-2 rounded-full"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Retour</span>
          </button>

          {/* Category Title */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
            {categoryName || decodedCategory}
          </h1>
          
          {/* Subcategory Badge */}
          {subcategory && (
            <div className="flex items-center gap-2 mb-4">
              <span className="inline-flex items-center gap-2 px-5 py-2 bg-[#0047AB] text-white rounded-full text-sm font-medium">
                {subcategory}
                <button 
                  onClick={clearSubcategory}
                  className="hover:bg-white/20 rounded-full p-0.5 transition-colors"
                >
                  ×
                </button>
              </span>
            </div>
          )}

          <p className="text-lg text-gray-300 max-w-2xl">
            {total} prestataires disponibles
          </p>

          {/* Video Control */}
          <button 
            onClick={toggleVideo}
            className="absolute bottom-6 right-6 bg-black/50 backdrop-blur-sm text-white p-3 rounded-full hover:bg-black/70 transition-colors"
          >
            {isVideoPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Subcategories Navigation - Horizontal scroll */}
      {subcategories.length > 0 && (
        <div className="bg-[#0A0A0A] border-y border-white/10 sticky top-16 z-40">
          <div className="max-w-7xl mx-auto px-4 md:px-8">
            <div className="flex gap-3 py-4 overflow-x-auto scrollbar-hide" style={{ scrollbarWidth: 'none' }}>
              <button
                onClick={clearSubcategory}
                className={`flex-shrink-0 px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
                  !subcategory 
                    ? 'bg-white text-black' 
                    : 'text-gray-400 hover:text-white border border-white/20 hover:border-white/40'
                }`}
              >
                Tous
              </button>
              {subcategories.map((subcat, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSubcategoryClick(subcat)}
                  className={`flex-shrink-0 px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
                    subcategory === subcat 
                      ? 'bg-[#0047AB] text-white' 
                      : 'text-gray-400 hover:text-white border border-white/20 hover:border-[#0047AB]'
                  }`}
                  data-testid={`subcategory-btn-${subcat}`}
                >
                  {subcat}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Search Bar */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-6">
        <div className="relative max-w-xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder={`Rechercher dans ${categoryName || decodedCategory}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-[#0047AB]/50 transition-all"
            data-testid="search-input"
          />
        </div>
      </div>

      {/* Enterprises Carousel - Like EnterprisesPage */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 pb-12">
        {loading ? (
          <div className="flex gap-6 overflow-hidden">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex-shrink-0 w-[300px] h-[280px] bg-white/5 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : enterprises.length > 0 ? (
          <div className="relative">
            {/* Navigation Buttons */}
            <button
              onClick={() => scrollCarousel('left')}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-black/80 hover:bg-black text-white p-3 rounded-full shadow-lg border border-white/20 transition-all hover:scale-110 -ml-4"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            
            <button
              onClick={() => scrollCarousel('right')}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-black/80 hover:bg-black text-white p-3 rounded-full shadow-lg border border-white/20 transition-all hover:scale-110 -mr-4"
            >
              <ChevronRight className="w-6 h-6" />
            </button>

            {/* Carousel Container */}
            <div 
              ref={carouselRef}
              className="flex gap-5 overflow-x-auto scrollbar-hide scroll-smooth pb-4 px-2"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {enterprises.map((enterprise, index) => (
                <EnterpriseCardDark 
                  key={enterprise.id} 
                  enterprise={enterprise}
                  index={index}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-10 h-10 text-gray-500" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Aucune entreprise trouvée</h3>
            <p className="text-gray-400 mb-4">
              {subcategory 
                ? `Aucune entreprise dans "${subcategory}"` 
                : `Aucune entreprise dans "${categoryName || decodedCategory}"`
              }
            </p>
            {subcategory && (
              <button
                onClick={clearSubcategory}
                className="px-6 py-3 bg-[#0047AB] text-white rounded-full font-medium hover:bg-[#0047AB]/80 transition-colors"
              >
                Voir toutes les {categoryName || decodedCategory}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Dark themed Enterprise Card for this page
const EnterpriseCardDark = ({ enterprise, index = 0 }) => {
  const navigate = useNavigate();
  const [imageError, setImageError] = useState(false);

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
  } = enterprise;

  const defaultImage = 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800';
  const actualCover = !imageError && cover_image ? cover_image : defaultImage;
  const displayName = business_name || name;
  const displayRating = rating ? rating.toFixed(1) : '4.5';
  const isActive = display_status === 'actif' || activation_status === 'active';

  return (
    <div 
      className="flex-shrink-0 w-[280px] sm:w-[320px] bg-[#111] rounded-2xl overflow-hidden border border-white/10 hover:border-[#0047AB]/50 transition-all cursor-pointer group animate-fade-in"
      onClick={() => navigate(`/entreprise/${id}`)}
      style={{ animationDelay: `${index * 50}ms` }}
      data-testid={`enterprise-card-${id}`}
    >
      {/* Image */}
      <div className="relative h-44 overflow-hidden">
        <img
          src={actualCover}
          alt={displayName}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={() => setImageError(true)}
        />
        {/* Subcategory Badge */}
        {subcategory && (
          <div className="absolute top-3 left-3">
            <span className="px-3 py-1 bg-black/70 backdrop-blur-sm text-white text-xs rounded-full">
              {subcategory}
            </span>
          </div>
        )}
        {/* Logo */}
        {logo && (
          <div className="absolute bottom-3 right-3 w-12 h-12 rounded-full bg-white p-1 shadow-lg">
            <img src={logo} alt="" className="w-full h-full object-cover rounded-full" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-base font-semibold text-white group-hover:text-[#0047AB] transition-colors line-clamp-2 mb-2">
          {displayName}
        </h3>
        <div className="flex items-center gap-2 mb-2">
          <Star className="w-4 h-4 fill-[#D4AF37] text-[#D4AF37]" />
          <span className="text-sm text-gray-300">{displayRating}/5</span>
          {review_count > 0 && <span className="text-xs text-gray-500">({review_count})</span>}
        </div>
        <div className="flex items-center gap-1 text-sm text-gray-400 mb-4">
          <MapPin className="w-4 h-4" />
          <span>{city || 'Lausanne'}</span>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/entreprise/${id}`);
          }}
          className={`w-full py-2.5 rounded-xl text-sm font-medium transition-all ${
            isActive 
              ? 'bg-[#0047AB] text-white hover:bg-[#0047AB]/80' 
              : 'bg-white/10 text-gray-400'
          }`}
        >
          {isActive ? 'Réserver' : 'Bientôt'}
        </button>
      </div>
    </div>
  );
};

export default CategoryEnterprisesPage;
