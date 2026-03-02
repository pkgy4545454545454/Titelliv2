import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { Search, Grid, List, Filter, ChevronLeft, ChevronRight, ChevronDown, MapPin, Star, Play, X } from 'lucide-react';
import { enterpriseAPI } from '../services/api';
import { toast } from 'sonner';

const EnterprisesPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [enterprises, setEnterprises] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  const [expandedCategory, setExpandedCategory] = useState(null);
  const videoRef = useRef(null);

  const categoryParam = searchParams.get('category') || '';
  const subcategoryParam = searchParams.get('subcategory') || '';
  const filter = searchParams.get('filter') || '';

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await enterpriseAPI.getCategories();
        setCategories(response.data.categories || []);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    fetchCategories();
  }, []);

  // Fetch enterprises based on filters
  useEffect(() => {
    const fetchEnterprises = async () => {
      setLoading(true);
      try {
        const params = { limit: 100 };
        if (categoryParam) params.category = categoryParam;
        if (subcategoryParam) params.subcategory = subcategoryParam;
        if (filter === 'certified') params.is_certified = true;
        if (filter === 'labeled') params.is_labeled = true;
        if (filter === 'premium') params.is_premium = true;
        if (searchQuery) params.search = searchQuery;

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
    fetchEnterprises();
  }, [categoryParam, subcategoryParam, filter, searchQuery]);

  // Handle category click
  const handleCategoryClick = (category) => {
    if (expandedCategory === category.name) {
      setExpandedCategory(null);
    } else {
      setExpandedCategory(category.name);
    }
  };

  // Handle subcategory selection
  const handleSubcategorySelect = (category, subcategory) => {
    setSearchParams({ category: category.name, subcategory });
    setExpandedCategory(null);
  };

  // Handle view all in category
  const handleViewAllCategory = (category) => {
    setSearchParams({ category: category.name });
    setExpandedCategory(null);
  };

  // Clear filters
  const clearFilters = () => {
    setSearchParams({});
    setSearchQuery('');
  };

  // Group enterprises by category for display
  const enterprisesByCategory = enterprises.reduce((acc, ent) => {
    const cat = ent.category || 'Autres';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(ent);
    return acc;
  }, {});

  const defaultImage = 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800';

  return (
    <div className="min-h-screen bg-white" data-testid="enterprises-page">
      {/* Hero with Video - Centered as per sketch */}
      <section className="relative bg-gradient-to-b from-gray-100 to-white py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          {/* Title */}
          <div className="text-center mb-6">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
              Tous les prestataires
            </h1>
            <p className="text-gray-600 text-lg">Produits / Services</p>
          </div>

          {/* Video - Centered */}
          <div className="flex justify-center mb-8">
            <div className="relative w-full max-w-2xl aspect-video rounded-2xl overflow-hidden shadow-xl border-4 border-white">
              <video
                ref={videoRef}
                autoPlay
                muted
                loop
                playsInline
                className="w-full h-full object-cover"
                poster="https://images.unsplash.com/photo-1497366216548-37526070297c?w=800"
              >
                <source src={`${process.env.REACT_APP_BACKEND_URL}/api/uploads/video_services.mp4`} type="video/mp4" />
              </video>
              <div className="absolute inset-0 bg-black/10 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                <Play className="w-16 h-16 text-white/80" />
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="max-w-xl mx-auto mb-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher un prestataire..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-full text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#0047AB] focus:ring-2 focus:ring-[#0047AB]/20 transition-all shadow-sm"
                data-testid="search-input"
              />
            </div>
          </div>

          {/* Active Filters */}
          {(categoryParam || subcategoryParam) && (
            <div className="flex items-center justify-center gap-2 flex-wrap">
              {categoryParam && (
                <span className="inline-flex items-center gap-2 px-4 py-2 bg-[#0047AB]/10 text-[#0047AB] rounded-full text-sm font-medium">
                  {categoryParam}
                  <button 
                    onClick={() => setSearchParams(subcategoryParam ? { subcategory: subcategoryParam } : {})}
                    className="hover:bg-[#0047AB]/20 rounded-full p-0.5"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </span>
              )}
              {subcategoryParam && (
                <span className="inline-flex items-center gap-2 px-4 py-2 bg-[#D4AF37]/10 text-[#D4AF37] rounded-full text-sm font-medium">
                  {subcategoryParam}
                  <button 
                    onClick={() => setSearchParams(categoryParam ? { category: categoryParam } : {})}
                    className="hover:bg-[#D4AF37]/20 rounded-full p-0.5"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </span>
              )}
              <button
                onClick={clearFilters}
                className="text-sm text-gray-500 hover:text-gray-700 underline"
              >
                Effacer tout
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Categories Navigation */}
      <section className="sticky top-16 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex gap-2 py-3 overflow-x-auto scrollbar-hide" style={{ scrollbarWidth: 'none' }}>
            <button
              onClick={clearFilters}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                !categoryParam ? 'bg-[#0047AB] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Tous
            </button>
            {categories.slice(0, 15).map((cat) => (
              <div key={cat.id} className="relative">
                <button
                  onClick={() => cat.has_subcategories ? handleCategoryClick(cat) : handleViewAllCategory(cat)}
                  className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-1 ${
                    categoryParam === cat.name ? 'bg-[#0047AB] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  data-testid={`category-filter-${cat.id}`}
                >
                  {cat.name}
                  {cat.has_subcategories && <ChevronDown className={`w-4 h-4 transition-transform ${expandedCategory === cat.name ? 'rotate-180' : ''}`} />}
                  <span className="ml-1 text-xs opacity-70">({cat.count})</span>
                </button>

                {/* Subcategories Dropdown */}
                {expandedCategory === cat.name && cat.subcategories?.length > 0 && (
                  <div 
                    className="absolute top-full left-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-gray-100 p-3 z-50 animate-in slide-in-from-top-2 duration-200 max-h-80 overflow-y-auto"
                    data-testid="subcategories-dropdown"
                  >
                    <div className="space-y-1">
                      {cat.subcategories.map((subcat, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSubcategorySelect(cat, subcat)}
                          className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-[#0047AB]/10 hover:text-[#0047AB] rounded-lg transition-all"
                        >
                          {subcat}
                        </button>
                      ))}
                    </div>
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <button
                        onClick={() => handleViewAllCategory(cat)}
                        className="w-full text-center text-sm text-[#0047AB] font-medium hover:underline"
                      >
                        Voir tous les {cat.name}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Enterprises Grid - Mixed Layout (Panorama for services, Portrait for products as per sketch) */}
      <section className="py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          {/* Results count */}
          <div className="flex items-center justify-between mb-6">
            <p className="text-gray-600">
              <span className="font-semibold text-gray-900">{total}</span> prestataires trouvés
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-[#0047AB] text-white' : 'bg-gray-100 text-gray-600'}`}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-[#0047AB] text-white' : 'bg-gray-100 text-gray-600'}`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {[...Array(20)].map((_, i) => (
                <div key={i} className="bg-gray-100 rounded-2xl h-72 animate-pulse" />
              ))}
            </div>
          ) : enterprises.length > 0 ? (
            <>
              {/* If filtered by category, show all in one grid */}
              {categoryParam ? (
                <div className={viewMode === 'grid' 
                  ? "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
                  : "space-y-4"
                }>
                  {enterprises.map((enterprise) => (
                    <EnterpriseCardSimple 
                      key={enterprise.id} 
                      enterprise={enterprise} 
                      viewMode={viewMode}
                    />
                  ))}
                </div>
              ) : (
                /* Show grouped by category with mixed layout */
                <div className="space-y-12">
                  {Object.entries(enterprisesByCategory).slice(0, 10).map(([category, ents]) => (
                    <div key={category}>
                      {/* Category Header */}
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{category}</h2>
                        <Link
                          to={`/entreprises?category=${encodeURIComponent(category)}`}
                          className="text-[#0047AB] hover:underline text-sm font-medium flex items-center gap-1"
                        >
                          Voir tout <ChevronRight className="w-4 h-4" />
                        </Link>
                      </div>

                      {/* Mixed layout: First row panorama (services), second row portrait (products) */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                        {ents.slice(0, 10).map((enterprise, idx) => (
                          <EnterpriseCardSimple 
                            key={enterprise.id} 
                            enterprise={enterprise}
                            viewMode="grid"
                            isPanorama={idx < 3} // First 3 are panorama style
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucun prestataire trouvé</h3>
              <p className="text-gray-600 mb-4">Essayez de modifier vos critères de recherche</p>
              <button
                onClick={clearFilters}
                className="px-6 py-2 bg-[#0047AB] text-white rounded-full font-medium hover:bg-[#0047AB]/90 transition-colors"
              >
                Voir tous les prestataires
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

// Simple Enterprise Card for this page
const EnterpriseCardSimple = ({ enterprise, viewMode = 'grid', isPanorama = false }) => {
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
        className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-200 hover:shadow-lg transition-all cursor-pointer"
        onClick={() => navigate(`/entreprise/${id}`)}
        data-testid={`enterprise-list-${id}`}
      >
        <img
          src={actualCover}
          alt={displayName}
          className="w-24 h-24 object-cover rounded-xl"
          onError={() => setImageError(true)}
        />
        <div className="flex-1">
          <p className="text-xs text-[#0047AB] font-medium mb-1">{category}</p>
          <h3 className="text-lg font-semibold text-gray-900">{displayName}</h3>
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
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
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
      className={`group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all cursor-pointer border border-gray-100 ${
        isPanorama ? 'col-span-2 sm:col-span-1' : ''
      }`}
      onClick={() => navigate(`/entreprise/${id}`)}
      data-testid={`enterprise-card-${id}`}
    >
      {/* Image */}
      <div className={`relative ${isPanorama ? 'h-32 sm:h-40' : 'h-40 sm:h-48'} overflow-hidden`}>
        <img
          src={actualCover}
          alt={displayName}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={() => setImageError(true)}
        />
        {/* Category Badge */}
        <div className="absolute top-2 left-2">
          <span className="px-2 py-1 bg-black/60 backdrop-blur-sm text-white text-xs rounded-full">
            {category}
          </span>
        </div>
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
        <div className="flex items-center gap-1.5 mb-2">
          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
          <span className="text-sm font-medium text-gray-700">{displayRating}/5</span>
          {review_count > 0 && <span className="text-xs text-gray-400">({review_count})</span>}
        </div>
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <MapPin className="w-3.5 h-3.5" />
          <span>{city || 'Lausanne'}</span>
        </div>
        <button
          className={`w-full mt-3 py-2 rounded-xl text-sm font-medium transition-all ${
            isActive ? 'bg-[#0047AB] text-white hover:bg-[#0047AB]/90' : 'bg-gray-200 text-gray-500'
          }`}
        >
          {isActive ? 'Réserver' : 'Bientôt'}
        </button>
      </div>
    </div>
  );
};

export default EnterprisesPage;
