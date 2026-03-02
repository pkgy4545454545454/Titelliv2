import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link, useNavigate } from 'react-router-dom';
import { Search, MapPin, Star, ArrowLeft, ArrowRight } from 'lucide-react';
import { enterpriseAPI } from '../services/api';
import { toast } from 'sonner';

const CategoryEnterprisesPage = () => {
  const { category } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const subcategory = searchParams.get('subcategory') || '';
  
  const [enterprises, setEnterprises] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryName, setCategoryName] = useState('');

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

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    // Search is already reactive via useEffect
  };

  return (
    <div className="min-h-screen bg-white pt-14 lg:pt-16" data-testid="category-enterprises-page">
      {/* Hero Section - Same style as HomePage */}
      <section className="relative h-[40vh] min-h-[300px] overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1497366216548-37526070297c?w=1920&q=80"
            alt={categoryName || decodedCategory}
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-white/30 to-white" />
        </div>

        {/* Hero Content */}
        <div className="absolute inset-0 flex flex-col justify-center px-4 md:px-8">
          <div className="max-w-7xl mx-auto w-full">
            {/* Back Button */}
            <button 
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-gray-700 hover:text-[#0047AB] transition-colors mb-4"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Retour</span>
            </button>

            {/* Category Title */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-black mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
              {categoryName || decodedCategory}
              {subcategory && (
                <span className="text-[#0047AB]"> - {subcategory}</span>
              )}
            </h1>

            <p className="text-lg text-gray-600">
              {total} prestataires disponibles
            </p>
          </div>
        </div>
      </section>

      {/* Search Bar Section */}
      <section className="py-4 sm:py-6 bg-white" data-testid="search-section">
        <div className="max-w-2xl mx-auto px-4">
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder={`Rechercher dans ${categoryName || decodedCategory}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-20 py-2.5 bg-gray-50 border border-gray-200 rounded-full text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#0047AB] focus:bg-white transition-all"
              data-testid="search-input"
            />
            <button 
              type="submit"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-[#0047AB] text-white px-4 py-1.5 rounded-full text-xs font-medium hover:bg-[#0047AB]/90 transition-colors"
            >
              Rechercher
            </button>
          </form>
        </div>
      </section>

      {/* Subcategories Filter Bar */}
      {subcategories.length > 0 && (
        <section className="bg-gray-50 border-y border-gray-200 sticky top-14 lg:top-16 z-40">
          <div className="max-w-7xl mx-auto px-4 md:px-8">
            <div className="flex gap-2 py-3 overflow-x-auto scrollbar-hide" style={{ scrollbarWidth: 'none' }}>
              <button
                onClick={clearSubcategory}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  !subcategory 
                    ? 'bg-[#0047AB] text-white' 
                    : 'text-gray-600 hover:text-[#0047AB] border border-gray-200 hover:border-[#0047AB]'
                }`}
              >
                Tous
              </button>
              {subcategories.map((subcat, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSubcategoryClick(subcat)}
                  className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    subcategory === subcat 
                      ? 'bg-[#0047AB] text-white' 
                      : 'text-gray-600 hover:text-[#0047AB] border border-gray-200 hover:border-[#0047AB]'
                  }`}
                  data-testid={`subcategory-btn-${subcat}`}
                >
                  {subcat}
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Enterprises Grid - Same as HomePage (5 columns) */}
      <section className="py-6 sm:py-10 bg-white" data-testid="enterprises-section">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          {/* Section Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg sm:text-2xl md:text-3xl font-semibold text-gray-900" style={{ fontFamily: 'Playfair Display, serif' }}>
              {subcategory ? subcategory : `Tous les ${categoryName || decodedCategory}`}
            </h2>
            <Link to="/entreprises" className="hidden md:flex items-center gap-2 text-[#0047AB] hover:text-[#2E74D6] font-medium transition-colors">
              Voir tout
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>

          {/* Grid */}
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
                <div key={i} className="h-[280px] w-full bg-gray-100 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : enterprises.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
              {enterprises.map((enterprise, index) => (
                <EnterpriseCardLight 
                  key={enterprise.id} 
                  enterprise={enterprise}
                  index={index}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucune entreprise trouvée</h3>
              <p className="text-gray-500 mb-4">
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
                  Voir tous les {categoryName || decodedCategory}
                </button>
              )}
            </div>
          )}

          {/* Mobile link */}
          <Link to="/entreprises" className="md:hidden flex items-center justify-start gap-2 mt-4 sm:mt-6 text-[#0047AB] font-medium text-sm">
            Voir toutes les entreprises
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
};

// Light themed Enterprise Card - Same style as HomePage
const EnterpriseCardLight = ({ enterprise, index = 0 }) => {
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
      className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all cursor-pointer group animate-fade-in border border-gray-100"
      onClick={() => navigate(`/entreprise/${id}`)}
      style={{ animationDelay: `${index * 30}ms` }}
      data-testid={`enterprise-card-${id}`}
    >
      {/* Image */}
      <div className="relative h-28 sm:h-36 overflow-hidden">
        <img
          src={actualCover}
          alt={displayName}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 rounded-t-2xl"
          onError={() => setImageError(true)}
        />
        {/* Subcategory Badge */}
        {subcategory && (
          <div className="absolute top-2 left-2">
            <span className="px-2 py-1 bg-black/60 backdrop-blur-sm text-white text-xs rounded-full">
              {subcategory}
            </span>
          </div>
        )}
        {/* Logo */}
        {logo && !imageError && (
          <div className="absolute bottom-2 right-2 w-10 h-10 rounded-full bg-white p-1 shadow-md">
            <img src={logo} alt="" className="w-full h-full object-cover rounded-full" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-2 sm:p-3">
        <h3 className="text-xs sm:text-sm font-semibold text-gray-900 group-hover:text-[#0047AB] transition-colors line-clamp-2 mb-2 text-center">
          {displayName}
        </h3>
        <div className="flex items-center gap-1.5 mb-2 justify-center">
          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
          <span className="text-sm font-medium text-gray-700">{displayRating}/5</span>
          {review_count > 0 && <span className="text-xs text-gray-400">({review_count})</span>}
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
        >
          {isActive ? 'Réserver' : 'Bientôt'}
        </button>
      </div>
    </div>
  );
};

export default CategoryEnterprisesPage;
