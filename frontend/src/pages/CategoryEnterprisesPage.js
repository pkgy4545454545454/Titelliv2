import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link, useNavigate } from 'react-router-dom';
import { Search, Grid, List, ChevronLeft, ChevronRight, MapPin, Star, ArrowLeft, Filter } from 'lucide-react';
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
  const [viewMode, setViewMode] = useState('grid');
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

  const defaultImage = 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800';

  return (
    <div className="min-h-screen bg-white" data-testid="category-enterprises-page">
      {/* Header with back button and category name */}
      <div className="bg-gradient-to-b from-gray-50 to-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-6">
          {/* Back button */}
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-[#0047AB] mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Retour</span>
          </button>

          {/* Category Title */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
            {categoryName || decodedCategory}
          </h1>
          
          {/* Active subcategory indicator */}
          {subcategory && (
            <div className="flex items-center gap-2 mt-3">
              <span className="text-gray-500">Sous-catégorie :</span>
              <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#0047AB]/10 text-[#0047AB] rounded-full text-sm font-medium">
                {subcategory}
                <button 
                  onClick={clearSubcategory}
                  className="hover:bg-[#0047AB]/20 rounded-full p-0.5 transition-colors"
                >
                  ×
                </button>
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Subcategories Navigation - Animated */}
      {subcategories.length > 0 && (
        <div className="bg-white border-b border-gray-100 sticky top-16 z-40">
          <div className="max-w-7xl mx-auto px-4 md:px-8">
            <div className="flex gap-2 py-4 overflow-x-auto scrollbar-hide" style={{ scrollbarWidth: 'none' }}>
              <button
                onClick={clearSubcategory}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                  !subcategory 
                    ? 'bg-[#0047AB] text-white shadow-md' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Tous
              </button>
              {subcategories.map((subcat, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSubcategoryClick(subcat)}
                  className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 transform hover:scale-105 ${
                    subcategory === subcat 
                      ? 'bg-[#0047AB] text-white shadow-md' 
                      : 'bg-gray-100 text-gray-700 hover:bg-[#0047AB]/10 hover:text-[#0047AB]'
                  }`}
                  style={{ animationDelay: `${idx * 50}ms` }}
                  data-testid={`subcategory-btn-${subcat}`}
                >
                  {subcat}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Search and Results */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        {/* Search Bar */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-8">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder={`Rechercher dans ${categoryName || decodedCategory}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#0047AB] focus:ring-2 focus:ring-[#0047AB]/20 transition-all"
              data-testid="search-input"
            />
          </div>
          
          <div className="flex items-center gap-4">
            <span className="text-gray-600">
              <span className="font-semibold text-gray-900">{total}</span> résultats
            </span>
            <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-white shadow-sm text-[#0047AB]' : 'text-gray-500'}`}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-white shadow-sm text-[#0047AB]' : 'text-gray-500'}`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Enterprises Grid/List */}
        {loading ? (
          <div className={viewMode === 'grid' 
            ? "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
            : "space-y-4"
          }>
            {[...Array(15)].map((_, i) => (
              <div key={i} className={`bg-gray-100 rounded-2xl animate-pulse ${viewMode === 'grid' ? 'h-72' : 'h-28'}`} />
            ))}
          </div>
        ) : enterprises.length > 0 ? (
          <div className={viewMode === 'grid' 
            ? "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
            : "space-y-4"
          }>
            {enterprises.map((enterprise, index) => (
              <EnterpriseCardSimple 
                key={enterprise.id} 
                enterprise={enterprise}
                viewMode={viewMode}
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
            <p className="text-gray-600 mb-4">
              {subcategory 
                ? `Aucune entreprise dans "${subcategory}"` 
                : `Aucune entreprise dans "${categoryName || decodedCategory}"`
              }
            </p>
            {subcategory && (
              <button
                onClick={clearSubcategory}
                className="px-6 py-2 bg-[#0047AB] text-white rounded-full font-medium hover:bg-[#0047AB]/90 transition-colors"
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

// Simple Enterprise Card Component
const EnterpriseCardSimple = ({ enterprise, viewMode = 'grid', index = 0 }) => {
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
    category,
    display_status,
    activation_status
  } = enterprise;

  const defaultImage = 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800';
  const actualCover = !imageError && cover_image ? cover_image : defaultImage;
  const displayName = business_name || name;
  const displayRating = rating ? rating.toFixed(1) : '4.5';
  const isActive = display_status === 'actif' || activation_status === 'active';

  if (viewMode === 'list') {
    return (
      <div 
        className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-200 hover:shadow-lg hover:border-[#0047AB]/30 transition-all cursor-pointer animate-fade-in"
        onClick={() => navigate(`/entreprise/${id}`)}
        style={{ animationDelay: `${index * 30}ms` }}
        data-testid={`enterprise-list-${id}`}
      >
        <img
          src={actualCover}
          alt={displayName}
          className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-xl flex-shrink-0"
          onError={() => setImageError(true)}
        />
        <div className="flex-1 min-w-0">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate">{displayName}</h3>
          <div className="flex items-center gap-2 mt-1">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm text-gray-700">{displayRating}/5</span>
            {review_count > 0 && <span className="text-xs text-gray-400">({review_count} avis)</span>}
          </div>
          <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
            <MapPin className="w-3.5 h-3.5" />
            {city || 'Lausanne'}
          </div>
        </div>
        <button
          className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            isActive ? 'bg-[#0047AB] text-white hover:bg-[#0047AB]/90' : 'bg-gray-200 text-gray-500'
          }`}
        >
          {isActive ? 'Voir' : 'Bientôt'}
        </button>
      </div>
    );
  }

  return (
    <div 
      className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all cursor-pointer border border-gray-100 animate-fade-in"
      onClick={() => navigate(`/entreprise/${id}`)}
      style={{ animationDelay: `${index * 30}ms` }}
      data-testid={`enterprise-card-${id}`}
    >
      {/* Image */}
      <div className="relative h-40 sm:h-48 overflow-hidden">
        <img
          src={actualCover}
          alt={displayName}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={() => setImageError(true)}
        />
        {/* Logo */}
        {logo && (
          <div className="absolute bottom-2 right-2 w-10 h-10 rounded-full bg-white p-1 shadow-md">
            <img src={logo} alt="" className="w-full h-full object-cover rounded-full" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3 sm:p-4">
        <h3 className="text-sm sm:text-base font-semibold text-gray-900 group-hover:text-[#0047AB] transition-colors line-clamp-2 mb-2">
          {displayName}
        </h3>
        <div className="flex items-center gap-1.5 mb-2 justify-center">
          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
          <span className="text-sm font-medium text-gray-700">{displayRating}/5</span>
          {review_count > 0 && <span className="text-xs text-gray-400">({review_count})</span>}
        </div>
        <div className="flex items-center justify-center gap-1 text-xs text-gray-500">
          <MapPin className="w-3.5 h-3.5" />
          <span>{city || 'Lausanne'}</span>
        </div>
        <button
          className={`w-full mt-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
            isActive ? 'bg-[#0047AB] text-white hover:bg-[#0047AB]/90' : 'bg-gray-200 text-gray-500'
          }`}
        >
          {isActive ? 'Réserver' : 'Bientôt'}
        </button>
      </div>
    </div>
  );
};

export default CategoryEnterprisesPage;
