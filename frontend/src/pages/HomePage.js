import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Star, Award, Crown, CheckCircle, Play, Sparkles, TrendingUp, Gift, Users, ChevronLeft, ChevronRight } from 'lucide-react';
import { featuredAPI, enterpriseAPI, servicesProductsAPI } from '../services/api';

const HomePage = () => {
  const [enterprises, setEnterprises] = useState([]);
  const [services, setServices] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [videoPlaying, setVideoPlaying] = useState(true);
  const videoRef = useRef(null);
  const servicesScrollRef = useRef(null);
  const productsScrollRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [entRes, servRes, prodRes] = await Promise.all([
          enterpriseAPI.list({ limit: 12 }),
          servicesProductsAPI.list({ type: 'service', limit: 10 }),
          servicesProductsAPI.list({ type: 'product', limit: 10 })
        ]);
        setEnterprises(entRes.data.enterprises || []);
        setServices(servRes.data.items || []);
        setProducts(prodRes.data.items || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Catégories du haut : Services, Produits, Certifiés, Premium
  const topCategories = [
    { id: 'services', label: 'Services', path: '/services', icon: Sparkles, color: 'from-[#0047AB] to-[#0066CC]' },
    { id: 'products', label: 'Produits', path: '/products', icon: Gift, color: 'from-[#D4AF37] to-[#B8860B]' },
    { id: 'certifies', label: 'Certifiés', path: '/entreprises?filter=certified', icon: CheckCircle, color: 'from-emerald-500 to-emerald-700' },
    { id: 'premium', label: 'Premium', path: '/entreprises?filter=premium', icon: Crown, color: 'from-purple-500 to-purple-700' },
  ];

  // Catégories du bas : Offres du moment, Guests du moment, Labellisés, Tendances actuelles
  const bottomCategories = [
    { id: 'offres', label: 'Offres du moment', path: '/offres', icon: Gift },
    { id: 'guests', label: 'Guests du moment', path: '/guests', icon: Users },
    { id: 'labellises', label: 'Labellisés', path: '/entreprises?filter=labeled', icon: Award },
    { id: 'tendances', label: 'Tendances actuelles', path: '/tendances', icon: TrendingUp },
  ];

  const scroll = (ref, direction) => {
    if (ref.current) {
      const scrollAmount = direction === 'left' ? -400 : 400;
      ref.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  // Video URL placeholder (panoramic video)
  const videoUrl = 'https://videos.pexels.com/video-files/4065924/4065924-uhd_2560_1440_30fps.mp4';

  return (
    <div className="min-h-screen bg-black" data-testid="home-page">
      {/* Hero Section avec Vidéo Panoramique */}
      <section className="relative h-screen overflow-hidden" data-testid="hero-section">
        {/* Background Video - Panoramic */}
        <div className="absolute inset-0">
          <video 
            ref={videoRef}
            autoPlay 
            muted 
            loop 
            playsInline
            className="w-full h-full object-cover"
            style={{ objectPosition: 'center' }}
          >
            <source src={videoUrl} type="video/mp4" />
          </video>
          {/* Overlay gradient noir */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black" />
        </div>

        {/* Top Categories Bar */}
        <div className="absolute top-24 left-0 right-0 z-20">
          <div className="max-w-7xl mx-auto px-4 md:px-8">
            <div className="flex justify-center gap-4 md:gap-8">
              {topCategories.map((cat) => (
                <Link 
                  key={cat.id}
                  to={cat.path}
                  className="group flex flex-col items-center gap-2 px-4 py-3 rounded-2xl bg-black/30 backdrop-blur-sm border border-white/10 hover:border-white/30 transition-all"
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${cat.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <cat.icon className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-white text-sm font-medium">{cat.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Hero Content - Center */}
        <div className="absolute inset-0 flex flex-col justify-center items-center text-center px-4">
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-white mb-6" style={{ fontFamily: 'Playfair Display, serif' }}>
            Les meilleurs prestataires<br />
            <span className="bg-gradient-to-r from-[#D4AF37] to-[#F4E4BC] bg-clip-text text-transparent">de ta région</span>
          </h1>
          <p className="text-base md:text-lg text-gray-300 max-w-xl mb-8">
            Services et produits de qualité à Lausanne
          </p>
          
          {/* Play Button */}
          <button 
            onClick={() => setVideoPlaying(!videoPlaying)}
            className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-lg border border-white/20 flex items-center justify-center hover:bg-white/20 transition-all"
          >
            <Play className="w-7 h-7 text-white ml-1" fill={videoPlaying ? "white" : "none"} />
          </button>
        </div>

        {/* Bottom Categories Bar */}
        <div className="absolute bottom-12 left-0 right-0 z-20">
          <div className="max-w-7xl mx-auto px-4 md:px-8">
            <div className="flex justify-center gap-4 md:gap-8">
              {bottomCategories.map((cat) => (
                <Link 
                  key={cat.id}
                  to={cat.path}
                  className="group flex items-center gap-2 px-5 py-2.5 rounded-full bg-black/40 backdrop-blur-sm border border-white/10 hover:border-[#D4AF37]/50 hover:bg-black/60 transition-all"
                >
                  <cat.icon className="w-4 h-4 text-[#D4AF37]" />
                  <span className="text-white text-sm">{cat.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Services Section - Slide Horizontal */}
      <section className="py-16 bg-black">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
              Meilleurs services de la région
            </h2>
            <div className="flex gap-2">
              <button onClick={() => scroll(servicesScrollRef, 'left')} className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors">
                <ChevronLeft className="w-5 h-5 text-white" />
              </button>
              <button onClick={() => scroll(servicesScrollRef, 'right')} className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors">
                <ChevronRight className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>
          
          {/* Horizontal Scroll Container */}
          <div 
            ref={servicesScrollRef}
            className="flex gap-4 overflow-x-auto scrollbar-hide pb-4 -mx-4 px-4"
            style={{ scrollSnapType: 'x mandatory' }}
          >
            {services.map((service) => (
              <Link 
                key={service.id} 
                to={`/service/${service.id}`}
                className="flex-shrink-0 w-64 group"
                style={{ scrollSnapAlign: 'start' }}
              >
                <div className="aspect-[4/5] rounded-2xl overflow-hidden bg-white/5 mb-3">
                  <img 
                    src={service.images?.[0] || 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400'} 
                    alt={service.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <h3 className="text-white font-medium truncate">{service.name}</h3>
                <p className="text-[#D4AF37] font-semibold">{service.price?.toFixed(0)} CHF</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Products Section - Slide Horizontal */}
      <section className="py-16 bg-black">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
              Meilleurs produits de la région
            </h2>
            <div className="flex gap-2">
              <button onClick={() => scroll(productsScrollRef, 'left')} className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors">
                <ChevronLeft className="w-5 h-5 text-white" />
              </button>
              <button onClick={() => scroll(productsScrollRef, 'right')} className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors">
                <ChevronRight className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>
          
          <div 
            ref={productsScrollRef}
            className="flex gap-4 overflow-x-auto scrollbar-hide pb-4 -mx-4 px-4"
            style={{ scrollSnapType: 'x mandatory' }}
          >
            {products.map((product) => (
              <Link 
                key={product.id} 
                to={`/product/${product.id}`}
                className="flex-shrink-0 w-64 group"
                style={{ scrollSnapAlign: 'start' }}
              >
                <div className="aspect-[4/5] rounded-2xl overflow-hidden bg-white/5 mb-3">
                  <img 
                    src={product.images?.[0] || 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400'} 
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <h3 className="text-white font-medium truncate">{product.name}</h3>
                <p className="text-[#D4AF37] font-semibold">{product.price?.toFixed(0)} CHF</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Enterprises Section - Featured */}
      <section className="py-16 bg-black">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-8" style={{ fontFamily: 'Playfair Display, serif' }}>
            Entreprises de Lausanne
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {enterprises.slice(0, 8).map((enterprise) => (
              <Link 
                key={enterprise.id} 
                to={`/entreprise/${enterprise.id}`}
                className="group"
              >
                <div className="aspect-square rounded-2xl overflow-hidden bg-white/5 mb-3 relative">
                  <img 
                    src={enterprise.logo || enterprise.cover_image || 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400'} 
                    alt={enterprise.business_name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {/* Badges */}
                  <div className="absolute top-2 right-2 flex gap-1">
                    {enterprise.is_certified && (
                      <span className="w-7 h-7 rounded-full bg-cyan-500 flex items-center justify-center">
                        <CheckCircle className="w-4 h-4 text-white" />
                      </span>
                    )}
                    {enterprise.is_labeled && (
                      <span className="w-7 h-7 rounded-full bg-[#D4AF37] flex items-center justify-center">
                        <Award className="w-4 h-4 text-white" />
                      </span>
                    )}
                    {enterprise.is_premium && (
                      <span className="w-7 h-7 rounded-full bg-purple-500 flex items-center justify-center">
                        <Crown className="w-4 h-4 text-white" />
                      </span>
                    )}
                  </div>
                </div>
                <h3 className="text-white font-medium truncate">{enterprise.business_name}</h3>
                <div className="flex items-center gap-1 text-sm text-gray-400">
                  <Star className="w-4 h-4 text-[#D4AF37] fill-[#D4AF37]" />
                  <span>{enterprise.average_rating?.toFixed(1) || 'N/A'}</span>
                  <span className="mx-1">•</span>
                  <span>{enterprise.city || 'Lausanne'}</span>
                </div>
              </Link>
            ))}
          </div>
          
          <div className="text-center mt-10">
            <Link to="/entreprises" className="inline-flex items-center gap-2 px-8 py-3 bg-white/5 hover:bg-white/10 rounded-full text-white transition-colors">
              Voir toutes les entreprises
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-black border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="text-left">
            <h3 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
              Titelli
            </h3>
            <p className="text-gray-400 text-sm max-w-md">
              La marketplace des prestataires de services et produits de qualité à Lausanne et sa région.
            </p>
            <div className="mt-8 pt-8 border-t border-white/5">
              <p className="text-gray-500 text-sm">© {new Date().getFullYear()} Yousee.H - Tous droits réservés</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
