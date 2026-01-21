import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Grid, List } from 'lucide-react';
import { categoryAPI, servicesProductsAPI, enterpriseAPI } from '../services/api';
import { useCart } from '../context/CartContext';
import ServiceProductCard from '../components/ServiceProductCard';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';

const ProductsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { addItem } = useCart();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [enterprises, setEnterprises] = useState({});
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [viewMode, setViewMode] = useState('grid');
  
  const selectedCategory = searchParams.get('category') || '';

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await categoryAPI.products();
        setCategories(response.data);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = { type: 'product' };
        if (selectedCategory) params.category = selectedCategory;
        
        const response = await servicesProductsAPI.list(params);
        setProducts(response.data.items);
        setTotal(response.data.total);

        // Fetch enterprises for products
        const enterpriseIds = [...new Set(response.data.items.map(p => p.enterprise_id))];
        const enterprisesMap = {};
        for (const eid of enterpriseIds) {
          try {
            const entRes = await enterpriseAPI.getById(eid);
            enterprisesMap[eid] = entRes.data;
          } catch (e) {
            console.error('Error fetching enterprise:', e);
          }
        }
        setEnterprises(enterprisesMap);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [selectedCategory]);

  const handleCategoryChange = (value) => {
    if (value === 'all') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', value);
    }
    setSearchParams(searchParams);
  };

  const handleAddToCart = (item) => {
    const enterprise = enterprises[item.enterprise_id];
    addItem(item, enterprise);
  };

  return (
    <div className="min-h-screen bg-[#050505] pt-24" data-testid="products-page">
      {/* Hero */}
      <div className="bg-gradient-to-b from-[#D4AF37]/10 to-transparent py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
            Produits
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl">
            Trouvez les meilleurs produits de la région de Lausanne
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between mb-8">
          {/* Category Filter */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => handleCategoryChange('all')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                !selectedCategory 
                  ? 'bg-[#D4AF37] text-black' 
                  : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
              }`}
            >
              Tous
            </button>
            {categories.slice(0, 6).map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleCategoryChange(cat.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedCategory === cat.id 
                    ? 'bg-[#D4AF37] text-black' 
                    : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                }`}
              >
                {cat.name}
              </button>
            ))}
            
            {categories.length > 6 && (
              <Select onValueChange={handleCategoryChange}>
                <SelectTrigger className="w-[180px] bg-white/5 border-white/10 text-gray-400">
                  <SelectValue placeholder="Plus de catégories" />
                </SelectTrigger>
                <SelectContent className="bg-[#0F0F0F] border-white/10">
                  {categories.slice(6).map((cat) => (
                    <SelectItem key={cat.id} value={cat.id} className="text-gray-300 hover:text-white">
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* View Toggle & Count */}
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-400">{total} résultats</span>
            <div className="flex items-center gap-1 bg-white/5 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-white/10 text-white' : 'text-gray-400'}`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-colors ${viewMode === 'list' ? 'bg-white/10 text-white' : 'text-gray-400'}`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="card-service rounded-xl h-80 animate-pulse" />
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className={viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
            : 'flex flex-col gap-4'
          }>
            {products.map((product, index) => (
              <div key={product.id} className={`animate-fade-in stagger-${(index % 6) + 1}`}>
                <ServiceProductCard item={product} onAddToCart={handleAddToCart} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-gray-400 text-lg mb-4">Aucun produit trouvé</p>
            <button 
              onClick={() => handleCategoryChange('all')}
              className="btn-secondary"
            >
              Voir tous les produits
            </button>
          </div>
        )}

        {/* All Categories */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-white mb-8" style={{ fontFamily: 'Playfair Display, serif' }}>
            Toutes les catégories
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                to={`/products?category=${cat.id}`}
                className="p-4 bg-white/5 rounded-xl border border-white/5 hover:border-[#D4AF37]/30 transition-all text-center"
              >
                <span className="text-gray-300 hover:text-white text-sm">{cat.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;
