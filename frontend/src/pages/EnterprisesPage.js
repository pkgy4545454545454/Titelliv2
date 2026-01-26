import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Grid, List, Filter } from 'lucide-react';
import { enterpriseAPI } from '../services/api';
import EnterpriseCard from '../components/EnterpriseCard';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';

const EnterprisesPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [enterprises, setEnterprises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');

  const filter = searchParams.get('filter') || '';

  useEffect(() => {
    const fetchEnterprises = async () => {
      setLoading(true);
      try {
        const params = {};
        if (filter === 'certified') params.is_certified = true;
        if (filter === 'labeled') params.is_labeled = true;
        if (filter === 'premium') params.is_premium = true;
        if (searchQuery) params.search = searchQuery;

        const response = await enterpriseAPI.list(params);
        setEnterprises(response.data.enterprises);
        setTotal(response.data.total);
      } catch (error) {
        console.error('Error fetching enterprises:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchEnterprises();
  }, [filter, searchQuery]);

  const handleFilterChange = (value) => {
    if (value === 'all') {
      searchParams.delete('filter');
    } else {
      searchParams.set('filter', value);
    }
    setSearchParams(searchParams);
  };

  return (
    <div className="min-h-screen bg-[#050505] pt-24" data-testid="enterprises-page">
      {/* Hero with Video Background - Generated with Sora 2 AI */}
      <div className="relative h-[40vh] min-h-[300px] overflow-hidden">
        {/* Video Background */}
        <div className="absolute inset-0">
          <video
            autoPlay
            muted
            loop
            playsInline
            className="w-full h-full object-cover"
            poster="https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=1920&q=80"
          >
            <source src={`${process.env.REACT_APP_BACKEND_URL}/api/uploads/video_services.mp4`} type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-b from-[#050505]/70 via-[#050505]/50 to-[#050505]" />
        </div>
        
        {/* Content */}
        <div className="relative h-full flex items-center">
          <div className="max-w-7xl mx-auto px-4 md:px-8 w-full">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
              Nos Entreprises
            </h1>
            <p className="text-lg md:text-xl text-gray-300 max-w-2xl">
              Découvrez les meilleures entreprises de la région de Lausanne
            </p>
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        {/* Search Bar */}
        <div className="relative mb-8">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher une entreprise..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-[#0047AB]/50"
            data-testid="search-enterprises"
          />
        </div>

        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between mb-8">
          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => handleFilterChange('all')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                !filter 
                  ? 'bg-white text-black' 
                  : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
              }`}
            >
              Tous
            </button>
            <button
              onClick={() => handleFilterChange('certified')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                filter === 'certified' 
                  ? 'bg-[#D4AF37] text-black' 
                  : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
              }`}
            >
              Certifiés
            </button>
            <button
              onClick={() => handleFilterChange('labeled')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                filter === 'labeled' 
                  ? 'bg-green-500 text-white' 
                  : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
              }`}
            >
              Labellisés
            </button>
            <button
              onClick={() => handleFilterChange('premium')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                filter === 'premium' 
                  ? 'bg-[#0047AB] text-white' 
                  : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
              }`}
            >
              Premium
            </button>
          </div>

          {/* View Toggle & Count */}
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-400">{total} entreprises</span>
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

        {/* Enterprises Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="card-service rounded-xl h-80 animate-pulse" />
            ))}
          </div>
        ) : enterprises.length > 0 ? (
          <div className={viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
            : 'flex flex-col gap-4'
          }>
            {enterprises.map((enterprise, index) => (
              <div key={enterprise.id} className={`animate-fade-in stagger-${(index % 6) + 1}`}>
                <EnterpriseCard enterprise={enterprise} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-gray-400 text-lg mb-4">Aucune entreprise trouvée</p>
            <button 
              onClick={() => {
                handleFilterChange('all');
                setSearchQuery('');
              }}
              className="btn-secondary"
            >
              Voir toutes les entreprises
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default EnterprisesPage;
