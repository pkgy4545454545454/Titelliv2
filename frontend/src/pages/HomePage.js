import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronRight, ChevronLeft, Star, Award, Crown, CheckCircle, ArrowRight, Play, Sparkles, TrendingUp, Gift, Users, Briefcase, MapPin, Clock, X, FileText, Send, Filter, GraduationCap, Calendar, Pause, Volume2, VolumeX, Search } from 'lucide-react';
import { featuredAPI, categoryAPI, enterpriseAPI, servicesProductsAPI, jobsAPI, clientDocumentsAPI, trainingsAPI } from '../services/api';
import EnterpriseCard from '../components/EnterpriseCard';
import ServiceProductCard from '../components/ServiceProductCard';
import ScrollingReviews from '../components/ScrollingReviews';
import { toast } from 'sonner';

// Carousel Component
const Carousel = ({ children, itemWidth = 400 }) => {
  const carouselRef = useRef(null);

  const scrollCarousel = (direction) => {
    if (carouselRef.current) {
      const scrollAmount = itemWidth + 24;
      const newScrollLeft = carouselRef.current.scrollLeft + (direction === 'left' ? -scrollAmount : scrollAmount);
      carouselRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => scrollCarousel('left')}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white hover:bg-gray-50 text-gray-700 p-3 rounded-full shadow-lg border border-gray-200 transition-all hover:scale-110 -ml-4"
        data-testid="carousel-prev"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      
      <button
        onClick={() => scrollCarousel('right')}
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white hover:bg-gray-50 text-gray-700 p-3 rounded-full shadow-lg border border-gray-200 transition-all hover:scale-110 -mr-4"
        data-testid="carousel-next"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      <div 
        ref={carouselRef}
        className="flex gap-6 overflow-x-auto scrollbar-hide scroll-smooth pb-4 px-2"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {children}
      </div>
    </div>
  );
};

const HomePage = () => {
  const navigate = useNavigate();
  const [allEnterprises, setAllEnterprises] = useState([]);
  const [tendances, setTendances] = useState([]);
  const [guests, setGuests] = useState([]);
  const [offres, setOffres] = useState([]);
  const [premium, setPremium] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [trainings, setTrainings] = useState([]);
  const [productCategories, setProductCategories] = useState([]);
  const [serviceCategories, setServiceCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  
  // Filter state
  const [jobFilters, setJobFilters] = useState({
    type: '',
    location: '',
    enterprise: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  
  // Application Modal state
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [userDocuments, setUserDocuments] = useState([]);
  const [applyForm, setApplyForm] = useState({
    resume_url: '',
    cover_letter: ''
  });
  const [applying, setApplying] = useState(false);
  
  // Training purchase state
  const [purchasingTraining, setPurchasingTraining] = useState(null);

  // Sort enterprises by profile completeness
  const sortByProfileCompleteness = (enterprises) => {
    return [...enterprises].sort((a, b) => {
      const getScore = (e) => {
        let score = 0;
        if (e.cover_image && !e.cover_image.includes('unsplash')) score += 3;
        if (e.logo) score += 2;
        if (e.description && e.description.length > 50) score += 2;
        if (e.slogan) score += 1;
        if (e.rating > 0) score += 2;
        if (e.review_count > 0) score += 1;
        if (e.is_certified) score += 2;
        if (e.is_labeled) score += 2;
        if (e.is_premium) score += 2;
        return score;
      };
      return getScore(b) - getScore(a);
    });
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [enterprisesRes, tendRes, guestRes, offreRes, premRes, prodCatRes, servCatRes, jobsRes, trainingsRes] = await Promise.all([
          enterpriseAPI.list({ limit: 50 }),
          featuredAPI.tendances(),
          featuredAPI.guests(),
          featuredAPI.offres(),
          featuredAPI.premium(),
          categoryAPI.products(),
          categoryAPI.services(),
          jobsAPI.listAll().catch(() => ({ data: [] })),
          trainingsAPI.listAll({ limit: 6 }).catch(() => ({ data: [] }))
        ]);
        
        // Sort all enterprises by profile completeness
        const sortedEnterprises = sortByProfileCompleteness(enterprisesRes.data.enterprises || []);
        setAllEnterprises(sortedEnterprises);
        
        setTendances(sortByProfileCompleteness(tendRes.data || []));
        setGuests(sortByProfileCompleteness(guestRes.data || []));
        setOffres(offreRes.data);
        setPremium(sortByProfileCompleteness(premRes.data || []));
        setProductCategories(prodCatRes.data);
        setServiceCategories(servCatRes.data);
        const jobsData = jobsRes.data || [];
        setJobs(jobsData);
        setFilteredJobs(jobsData);
        setTrainings(trainingsRes.data || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);
  
  // Apply filters
  useEffect(() => {
    let result = [...jobs];
    
    if (jobFilters.type) {
      result = result.filter(job => job.type === jobFilters.type);
    }
    
    if (jobFilters.location) {
      result = result.filter(job => 
        (job.location || '').toLowerCase().includes(jobFilters.location.toLowerCase())
      );
    }
    
    if (jobFilters.enterprise) {
      result = result.filter(job => 
        (job.enterprise_name || '').toLowerCase().includes(jobFilters.enterprise.toLowerCase())
      );
    }
    
    setFilteredJobs(result);
  }, [jobFilters, jobs]);
  
  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };
  
  // Open apply modal
  const handleApplyClick = async (e, job) => {
    e.preventDefault();
    e.stopPropagation();
    
    const token = localStorage.getItem('titelli_token');
    if (!token) {
      toast.error('Connectez-vous pour postuler');
      return;
    }
    
    setSelectedJob(job);
    setApplyForm({ resume_url: '', cover_letter: '' });
    
    try {
      const res = await clientDocumentsAPI.list();
      const allDocs = res.data?.documents || res.data || [];
      const cvDocs = allDocs.filter(d => d.category === 'cv' || d.category === 'general' || d.file_type?.includes('pdf'));
      setUserDocuments(cvDocs.length > 0 ? cvDocs : allDocs);
    } catch (err) {
      console.error('Error fetching documents:', err);
      setUserDocuments([]);
    }
    
    setShowApplyModal(true);
  };
  
  // Submit application
  const handleSubmitApplication = async () => {
    if (!applyForm.resume_url) {
      toast.error('Veuillez sélectionner un CV');
      return;
    }
    
    setApplying(true);
    try {
      await jobsAPI.apply(selectedJob.id, {
        resume_url: applyForm.resume_url,
        cover_letter: applyForm.cover_letter
      });
      toast.success('Candidature envoyée avec succès !');
      setShowApplyModal(false);
    } catch (error) {
      const msg = error.response?.data?.detail || 'Erreur lors de l\'envoi';
      toast.error(msg);
    } finally {
      setApplying(false);
    }
  };

  // Handle training purchase
  const handlePurchaseTraining = async (training) => {
    const token = localStorage.getItem('titelli_token');
    if (!token) {
      toast.error('Connectez-vous pour acheter une formation');
      navigate('/auth');
      return;
    }
    
    setPurchasingTraining(training.id);
    try {
      const res = await trainingsAPI.purchase(training.id);
      if (res.data.url) {
        window.location.href = res.data.url;
      }
    } catch (error) {
      const msg = error.response?.data?.detail || 'Erreur lors de l\'achat';
      toast.error(msg);
    } finally {
      setPurchasingTraining(null);
    }
  };

  // Video state for panoramic hero
  const videoRef = useRef(null);
  const [isVideoPlaying, setIsVideoPlaying] = useState(true);
  const [isVideoMuted, setIsVideoMuted] = useState(true);

  const toggleVideoPlay = () => {
    if (videoRef.current) {
      if (isVideoPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsVideoPlaying(!isVideoPlaying);
    }
  };

  const toggleVideoMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isVideoMuted;
      setIsVideoMuted(!isVideoMuted);
    }
  };

  const panoramicVideoUrl = `${process.env.REACT_APP_BACKEND_URL}/api/uploads/video_accueil_couple_lausanne.mp4`;
  const heroImage = 'https://images.unsplash.com/photo-1733950489642-bd1a7c3e69bb?w=1920&q=80';

  const mainCategories = [
    { id: 'services', label: 'Services', path: '/services', icon: Sparkles },
    { id: 'produits', label: 'Produits', path: '/products', icon: Gift },
    { id: 'certifies', label: 'Certifiés', path: '/certifies', icon: CheckCircle },
    { id: 'guests', label: 'Guests', path: '/guests', icon: Users },
  ];

  return (
    <div className="min-h-screen bg-[#FAFAFA]" data-testid="home-page">
      {/* Hero Section with Panoramic Video */}
      <section className="relative h-screen overflow-hidden" data-testid="hero-section">
        {/* Video Background */}
        <div className="absolute inset-0">
          <video
            ref={videoRef}
            autoPlay
            muted
            loop
            playsInline
            className="w-full h-full object-cover"
            poster={heroImage}
          >
            <source src={panoramicVideoUrl} type="video/mp4" />
          </video>
          <img 
            src={heroImage} 
            alt="Lausanne" 
            className="absolute inset-0 w-full h-full object-cover -z-10"
          />
          <div className="panoramic-overlay absolute inset-0" />
          <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-[#FAFAFA] via-[#FAFAFA]/90 to-transparent" />
        </div>

        {/* Hero Content */}
        <div className="absolute inset-0 flex flex-col justify-center items-center text-center px-4 pt-20">
          <div className="mb-6 animate-fade-in">
            <img 
              src="/logo_titelli.png" 
              alt="Titelli" 
              className="w-24 h-24 mx-auto object-contain"
            />
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-white mb-6 animate-fade-in drop-shadow-lg" style={{ fontFamily: 'Playfair Display, serif' }}>
            Les meilleurs prestataires<br />
            <span className="gold-gradient">de ta région</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-200 max-w-2xl mb-8 animate-fade-in stagger-1 drop-shadow">
            Découvrez les services et produits de qualité à Lausanne
          </p>

          {/* Category Buttons */}
          <div className="inline-flex flex-wrap justify-center gap-3 animate-fade-in stagger-2">
            {mainCategories.map((cat) => (
              <Link
                key={cat.id}
                to={cat.path}
                className="inline-block px-6 py-3 bg-white/90 backdrop-blur-lg border border-gray-200 rounded-lg text-gray-800 font-medium hover:bg-[#0047AB] hover:text-white hover:border-[#0047AB] transition-all duration-300 shadow-md"
                data-testid={`hero-btn-${cat.id}`}
              >
                <span className="flex items-center gap-2">
                  <cat.icon className="w-5 h-5" />
                  {cat.label}
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 rounded-full border-2 border-gray-400 flex justify-center pt-2">
            <div className="w-1.5 h-3 bg-gray-400 rounded-full" />
          </div>
        </div>
      </section>

      {/* Search Bar Section - Under Video */}
      <section className="py-8 bg-[#FAFAFA]" data-testid="search-section">
        <div className="max-w-3xl mx-auto px-4">
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher des produits, services ou entreprises..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-14 pr-6 py-4 bg-white border border-gray-200 rounded-full text-lg text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-[#0047AB] focus:ring-2 focus:ring-[#0047AB]/20 shadow-md transition-all"
              data-testid="home-search-input"
            />
            <button 
              type="submit"
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-[#0047AB] text-white px-6 py-2 rounded-full hover:bg-[#003380] transition-colors"
            >
              Rechercher
            </button>
          </form>
        </div>
      </section>

      {/* Les meilleurs prestataires Section - Carousel */}
      <section className="py-12 bg-[#FAFAFA]" data-testid="top-providers-section">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-[#0047AB]/10">
                <Award className="w-6 h-6 text-[#0047AB]" />
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-800" style={{ fontFamily: 'Playfair Display, serif' }}>
                  Les meilleurs prestataires
                </h2>
                <p className="text-gray-500 mt-1">Triés par profil le plus complet</p>
              </div>
            </div>
            <Link to="/entreprises" className="hidden md:flex items-center gap-2 text-[#0047AB] hover:text-[#003380] font-medium transition-colors">
              Voir tout
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>

          {loading ? (
            <div className="flex gap-6 overflow-hidden">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex-shrink-0 w-[350px] h-[320px] bg-gray-100 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : (
            <Carousel itemWidth={350}>
              {allEnterprises.slice(0, 12).map((enterprise, index) => (
                <div 
                  key={enterprise.id} 
                  className="flex-shrink-0 w-[350px] animate-fade-in"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <EnterpriseCard enterprise={enterprise} />
                </div>
              ))}
            </Carousel>
          )}

          <Link to="/entreprises" className="md:hidden flex items-center justify-center gap-2 mt-6 text-[#0047AB] font-medium">
            Voir tous les prestataires
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Services Section - Carousel */}
      <section className="py-16 bg-white" data-testid="services-section">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-[#0047AB]/10">
                <Sparkles className="w-6 h-6 text-[#0047AB]" />
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-800" style={{ fontFamily: 'Playfair Display, serif' }}>
                  Les meilleurs services de ta région
                </h2>
                <p className="text-gray-500 mt-1">Découvrez nos prestataires de confiance</p>
              </div>
            </div>
            <Link to="/services" className="hidden md:flex items-center gap-2 text-[#0047AB] hover:text-[#003380] font-medium transition-colors" data-testid="view-all-services">
              Voir tout
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>

          {/* Service Category Tabs */}
          <div className="flex flex-wrap gap-3 mb-8">
            {serviceCategories.slice(0, 8).map((cat) => (
              <Link
                key={cat.id}
                to={`/services?category=${cat.id}`}
                className="px-5 py-2.5 bg-gray-100 hover:bg-[#0047AB] hover:text-white border border-gray-200 rounded-full text-sm text-gray-600 transition-all"
                data-testid={`service-cat-${cat.id}`}
              >
                {cat.name}
              </Link>
            ))}
          </div>

          {/* Service Cards Carousel */}
          {offres.length > 0 ? (
            <Carousel itemWidth={350}>
              {offres.map((item, index) => (
                <div key={item.id} className="flex-shrink-0 w-[350px]">
                  <ServiceProductCard item={item} />
                </div>
              ))}
            </Carousel>
          ) : (
            <div className="flex gap-6 overflow-hidden">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex-shrink-0 w-[350px] card-service rounded-xl overflow-hidden">
                  <div className="h-56 bg-gray-100 animate-pulse" />
                  <div className="p-5 space-y-3">
                    <div className="h-6 bg-gray-100 rounded animate-pulse" />
                    <div className="h-4 bg-gray-100 rounded w-3/4 animate-pulse" />
                    <div className="h-8 bg-gray-100 rounded w-1/3 animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          )}

          <Link to="/services" className="md:hidden flex items-center justify-center gap-2 mt-8 text-[#0047AB] font-medium">
            Voir tous les services
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Products Section - Carousel */}
      <section className="py-16 bg-[#FAFAFA]" data-testid="products-section">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-[#D4AF37]/10">
                <Gift className="w-6 h-6 text-[#D4AF37]" />
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-800" style={{ fontFamily: 'Playfair Display, serif' }}>
                  Produits
                </h2>
                <p className="text-gray-500 mt-1">Trouvez ce dont vous avez besoin</p>
              </div>
            </div>
            <Link to="/products" className="hidden md:flex items-center gap-2 text-[#D4AF37] hover:text-[#B8860B] font-medium transition-colors">
              Voir tout
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>

          <Carousel itemWidth={200}>
            {productCategories.slice(0, 12).map((cat, index) => (
              <Link
                key={cat.id}
                to={`/products?category=${cat.id}`}
                className="flex-shrink-0 w-[200px] group relative h-48 rounded-xl overflow-hidden bg-white border border-gray-200 hover:border-[#D4AF37]/50 transition-all shadow-sm hover:shadow-md"
                data-testid={`product-cat-${cat.id}`}
              >
                <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
                  <div className="w-12 h-12 rounded-full bg-[#D4AF37]/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <Gift className="w-6 h-6 text-[#D4AF37]" />
                  </div>
                  <span className="text-gray-700 font-medium text-sm">{cat.name}</span>
                </div>
              </Link>
            ))}
          </Carousel>
        </div>
      </section>

      {/* Tendances Actuelles - Carousel */}
      <section className="py-16 bg-white" data-testid="tendances-section">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-[#D4AF37]/10">
                <TrendingUp className="w-6 h-6 text-[#D4AF37]" />
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-800" style={{ fontFamily: 'Playfair Display, serif' }}>
                  Tendances actuelles
                </h2>
                <p className="text-gray-500 mt-1">Nos prestataires labellisés du moment</p>
              </div>
            </div>
            <Link to="/labellises" className="hidden md:flex items-center gap-2 text-[#D4AF37] hover:text-[#B8860B] font-medium transition-colors">
              Voir tout
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>

          {tendances.length > 0 ? (
            <Carousel itemWidth={350}>
              {tendances.map((enterprise, index) => (
                <div key={enterprise.id} className="flex-shrink-0 w-[350px]">
                  <EnterpriseCard enterprise={enterprise} />
                </div>
              ))}
            </Carousel>
          ) : (
            <div className="flex gap-6 overflow-hidden">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex-shrink-0 w-[350px] card-service rounded-xl h-80 animate-pulse bg-gray-100" />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Guests du moment - Carousel */}
      <section className="py-16 bg-[#FAFAFA]" data-testid="guests-section">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-[#0047AB]/10">
                <CheckCircle className="w-6 h-6 text-[#0047AB]" />
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-800" style={{ fontFamily: 'Playfair Display, serif' }}>
                  Guests du moment
                </h2>
                <p className="text-gray-500 mt-1">Nos prestataires certifiés</p>
              </div>
            </div>
            <Link to="/certifies" className="hidden md:flex items-center gap-2 text-[#0047AB] hover:text-[#003380] font-medium transition-colors">
              Voir tout
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>

          {guests.length > 0 ? (
            <Carousel itemWidth={350}>
              {guests.map((enterprise, index) => (
                <div key={enterprise.id} className="flex-shrink-0 w-[350px]">
                  <EnterpriseCard enterprise={enterprise} />
                </div>
              ))}
            </Carousel>
          ) : (
            <div className="flex gap-6 overflow-hidden">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex-shrink-0 w-[350px] card-service rounded-xl h-80 animate-pulse bg-gray-100" />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Premium Section - Carousel */}
      <section className="py-16 bg-gradient-to-r from-[#0047AB]/5 via-white to-[#D4AF37]/5" data-testid="premium-section">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#0047AB]">
                <Crown className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-800" style={{ fontFamily: 'Playfair Display, serif' }}>
                  Premium
                </h2>
                <p className="text-gray-500 mt-1">L'excellence à votre service</p>
              </div>
            </div>
            <Link to="/premium" className="hidden md:flex items-center gap-2 text-[#D4AF37] hover:text-[#B8860B] font-medium transition-colors">
              Découvrir
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>

          {premium.length > 0 ? (
            <Carousel itemWidth={350}>
              {premium.map((enterprise, index) => (
                <div key={enterprise.id} className="flex-shrink-0 w-[350px]">
                  <EnterpriseCard enterprise={enterprise} />
                </div>
              ))}
            </Carousel>
          ) : (
            <div className="flex gap-6 overflow-hidden">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex-shrink-0 w-[350px] card-service rounded-xl h-80 animate-pulse bg-gray-100" />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Job Offers Section - Carousel */}
      <section className="py-16 bg-white" data-testid="jobs-section">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-[#0047AB]/10">
                <Briefcase className="w-6 h-6 text-[#0047AB]" />
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-800" style={{ fontFamily: 'Playfair Display, serif' }}>
                  Offres d'emploi
                </h2>
                <p className="text-gray-500 mt-1 text-sm md:text-base">Opportunités chez nos prestataires</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${showFilters ? 'bg-[#0047AB] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                data-testid="jobs-filter-btn"
              >
                <Filter className="w-4 h-4" />
                <span className="hidden sm:inline">Filtres</span>
              </button>
              <Link to="/emplois" className="hidden md:flex items-center gap-2 text-[#0047AB] hover:text-[#003380] font-medium transition-colors">
                Voir toutes les offres
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
          
          {/* Filters */}
          {showFilters && (
            <div className="mb-6 p-5 bg-gray-50 rounded-xl border border-gray-200 animate-fade-in" data-testid="jobs-filters">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm text-gray-500 mb-2">Type de contrat</label>
                  <select 
                    value={jobFilters.type}
                    onChange={(e) => setJobFilters({...jobFilters, type: e.target.value})}
                    className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-gray-700 focus:border-[#0047AB] outline-none"
                    data-testid="jobs-filter-type"
                  >
                    <option value="">Tous les types</option>
                    <option value="CDI">CDI</option>
                    <option value="CDD">CDD</option>
                    <option value="Stage">Stage</option>
                    <option value="Freelance">Freelance</option>
                    <option value="Apprentissage">Apprentissage</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-500 mb-2">Ville</label>
                  <input 
                    type="text"
                    value={jobFilters.location}
                    onChange={(e) => setJobFilters({...jobFilters, location: e.target.value})}
                    placeholder="Ex: Lausanne, Genève..."
                    className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-gray-700 placeholder-gray-400 focus:border-[#0047AB] outline-none"
                    data-testid="jobs-filter-location"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-500 mb-2">Entreprise</label>
                  <input 
                    type="text"
                    value={jobFilters.enterprise}
                    onChange={(e) => setJobFilters({...jobFilters, enterprise: e.target.value})}
                    placeholder="Nom de l'entreprise..."
                    className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-gray-700 placeholder-gray-400 focus:border-[#0047AB] outline-none"
                    data-testid="jobs-filter-enterprise"
                  />
                </div>
                <div className="flex items-end">
                  <button 
                    onClick={() => setJobFilters({ type: '', location: '', enterprise: '' })}
                    className="w-full px-4 py-2.5 bg-gray-200 hover:bg-gray-300 rounded-lg text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    Réinitialiser
                  </button>
                </div>
              </div>
              {filteredJobs.length !== jobs.length && (
                <p className="mt-4 text-sm text-[#0047AB]">{filteredJobs.length} résultat(s) sur {jobs.length}</p>
              )}
            </div>
          )}

          {filteredJobs.length > 0 ? (
            <Carousel itemWidth={350}>
              {filteredJobs.slice(0, 9).map((job, index) => (
                <div 
                  key={job.id} 
                  className="flex-shrink-0 w-[350px] card-service rounded-xl p-5 hover:border-[#0047AB]/30 transition-all"
                  data-testid={`job-card-${job.id}`}
                >
                  <Link to={`/emploi/${job.id}`} className="block">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-[#0047AB]/10 flex items-center justify-center">
                          <Briefcase className="w-6 h-6 text-[#0047AB]" />
                        </div>
                        <div>
                          <h3 className="text-gray-800 font-semibold text-sm md:text-base">{job.title}</h3>
                          <p className="text-[#0047AB] text-sm font-medium">{job.enterprise_name || 'Entreprise'}</p>
                        </div>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        job.type === 'CDI' ? 'bg-green-100 text-green-700' :
                        job.type === 'CDD' ? 'bg-orange-100 text-orange-700' :
                        job.type === 'Stage' ? 'bg-purple-100 text-purple-700' :
                        job.type === 'Freelance' ? 'bg-cyan-100 text-cyan-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {job.type || 'CDI'}
                      </span>
                    </div>
                    <p className="text-gray-500 text-sm line-clamp-2 mb-4">{job.description}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-400 mb-4">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {job.location || 'Lausanne'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {job.salary || 'À discuter'}
                      </span>
                    </div>
                  </Link>
                  <button
                    onClick={(e) => handleApplyClick(e, job)}
                    className="w-full bg-[#0047AB] hover:bg-[#003380] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                    data-testid={`job-apply-btn-${job.id}`}
                  >
                    <Send className="w-4 h-4" />
                    Postuler
                  </button>
                </div>
              ))}
            </Carousel>
          ) : (
            <div className="text-center py-12">
              <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">
                {jobs.length === 0 ? "Aucune offre d'emploi pour le moment" : "Aucune offre ne correspond aux filtres"}
              </p>
              <p className="text-sm text-gray-400 mt-1">
                {jobs.length === 0 ? "Les offres de nos prestataires apparaîtront ici" : "Essayez d'autres critères de recherche"}
              </p>
            </div>
          )}

          <Link to="/emplois" className="md:hidden flex items-center justify-center gap-2 mt-8 text-[#0047AB] font-medium">
            Voir toutes les offres
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Formations Section - Carousel */}
      {trainings.length > 0 && (
        <section className="py-16 bg-[#FAFAFA]" data-testid="trainings-section">
          <div className="max-w-7xl mx-auto px-4 md:px-8">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-purple-100">
                  <GraduationCap className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-800" style={{ fontFamily: 'Playfair Display, serif' }}>
                    Formations disponibles
                  </h2>
                  <p className="text-gray-500 mt-1 text-sm md:text-base">Développez vos compétences avec nos partenaires</p>
                </div>
              </div>
            </div>

            <Carousel itemWidth={350}>
              {trainings.map((training) => (
                <div 
                  key={training.id} 
                  className="flex-shrink-0 w-[350px] card-service rounded-xl overflow-hidden hover:scale-[1.02] transition-transform"
                  data-testid={`training-card-${training.id}`}
                >
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        training.training_type === 'online' 
                          ? 'bg-purple-100 text-purple-700' 
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {training.training_type === 'online' ? 'En ligne' : 'Présentiel'}
                      </span>
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                        {training.category}
                      </span>
                    </div>
                    
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">{training.title}</h3>
                    <p className="text-sm text-gray-500 line-clamp-2 mb-3">{training.description}</p>
                    
                    <div className="flex items-center gap-2 mb-4">
                      {training.enterprise_logo ? (
                        <img 
                          src={training.enterprise_logo.startsWith('http') ? training.enterprise_logo : `${process.env.REACT_APP_BACKEND_URL}${training.enterprise_logo}`}
                          alt={training.enterprise_name}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-[#0047AB]/20 flex items-center justify-center text-xs text-[#0047AB] font-bold">
                          {training.enterprise_name?.[0]}
                        </div>
                      )}
                      <span className="text-sm text-[#0047AB]">{training.enterprise_name}</span>
                    </div>
                    
                    <div className="flex flex-wrap gap-3 text-xs text-gray-400 mb-4">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {training.duration}
                      </span>
                      {training.training_type === 'on_site' && training.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {training.location}
                        </span>
                      )}
                      {training.start_date && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(training.start_date).toLocaleDateString('fr-FR')}
                        </span>
                      )}
                      {training.certificate && (
                        <span className="flex items-center gap-1 text-green-600">
                          <CheckCircle className="w-3 h-3" />
                          Certificat
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div>
                        <p className="text-2xl font-bold text-gray-800">{training.price} <span className="text-sm font-normal text-gray-400">CHF</span></p>
                      </div>
                      <button
                        onClick={() => handlePurchaseTraining(training)}
                        disabled={purchasingTraining === training.id}
                        className="px-4 py-2 bg-[#0047AB] text-white rounded-lg hover:bg-[#003380] transition-colors disabled:opacity-50 flex items-center gap-2"
                        data-testid={`buy-training-${training.id}`}
                      >
                        {purchasingTraining === training.id ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Achat...
                          </>
                        ) : (
                          "S'inscrire"
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </Carousel>
          </div>
        </section>
      )}
      
      {/* Apply Modal */}
      {showApplyModal && selectedJob && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" data-testid="apply-modal">
          <div className="bg-white rounded-2xl w-full max-w-lg border border-gray-200 max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-800">Postuler à l'offre</h2>
                <button onClick={() => setShowApplyModal(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="text-gray-800 font-semibold">{selectedJob.title}</h3>
                <p className="text-[#0047AB] text-sm">{selectedJob.enterprise_name}</p>
                <div className="flex items-center gap-4 text-xs text-gray-400 mt-2">
                  <span>{selectedJob.type}</span>
                  <span>{selectedJob.location || 'Lausanne'}</span>
                </div>
              </div>
              
              <div>
                <label className="block text-sm text-gray-500 mb-2">
                  <FileText className="w-4 h-4 inline mr-2" />
                  Sélectionnez votre CV *
                </label>
                {userDocuments.length > 0 ? (
                  <div className="space-y-2">
                    {userDocuments.map((doc) => (
                      <label 
                        key={doc.id} 
                        className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                          applyForm.resume_url === doc.url 
                            ? 'bg-[#0047AB]/10 border border-[#0047AB]' 
                            : 'bg-gray-50 border border-gray-200 hover:bg-gray-100'
                        }`}
                      >
                        <input
                          type="radio"
                          name="resume"
                          value={doc.url}
                          checked={applyForm.resume_url === doc.url}
                          onChange={(e) => setApplyForm({...applyForm, resume_url: e.target.value})}
                          className="accent-[#0047AB]"
                        />
                        <FileText className="w-5 h-5 text-[#0047AB]" />
                        <div className="flex-1">
                          <span className="text-gray-700 text-sm">{doc.name}</span>
                          <span className="text-xs text-gray-400 ml-2">({doc.category})</span>
                        </div>
                      </label>
                    ))}
                  </div>
                ) : (
                  <div className="text-center p-6 bg-gray-50 rounded-xl">
                    <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 text-sm mb-3">Vous n'avez pas encore de CV enregistré</p>
                    <Link 
                      to={`/dashboard/client?tab=documents&returnToJob=${selectedJob.id}`}
                      className="text-[#0047AB] hover:underline text-sm"
                      onClick={() => setShowApplyModal(false)}
                    >
                      Ajouter un CV dans mon espace
                    </Link>
                  </div>
                )}
              </div>
              
              <div>
                <label className="block text-sm text-gray-500 mb-2">Lettre de motivation (optionnel)</label>
                <textarea
                  value={applyForm.cover_letter}
                  onChange={(e) => setApplyForm({...applyForm, cover_letter: e.target.value})}
                  placeholder="Présentez-vous brièvement et expliquez votre motivation..."
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-700 placeholder-gray-400 focus:border-[#0047AB] outline-none h-32 resize-none"
                  data-testid="apply-cover-letter"
                />
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setShowApplyModal(false)}
                  className="flex-1 px-4 py-3 rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleSubmitApplication}
                  disabled={applying || !applyForm.resume_url}
                  className="flex-1 px-4 py-3 rounded-xl bg-[#0047AB] text-white hover:bg-[#003380] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  data-testid="apply-submit-btn"
                >
                  {applying ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Envoi...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Envoyer ma candidature
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Scrolling Reviews Section */}
      <ScrollingReviews 
        title="Ce que nos clients disent"
        speed={35}
      />

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-[#0047AB] to-[#003380]" data-testid="cta-section">
        <div className="max-w-4xl mx-auto px-4 md:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6" style={{ fontFamily: 'Playfair Display, serif' }}>
            Vous êtes un prestataire ?
          </h2>
          <p className="text-lg text-white/80 mb-10 max-w-2xl mx-auto">
            Rejoignez Titelli et exposez vos services aux clients de la région de Lausanne. 
            Bénéficiez d'une visibilité premium et développez votre activité.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth?type=entreprise" className="bg-white text-[#0047AB] text-lg px-10 py-4 rounded-full font-medium hover:bg-gray-100 transition-colors" data-testid="cta-register-btn">
              Inscrire mon entreprise
            </Link>
            <Link to="/about" className="bg-transparent text-white text-lg px-10 py-4 rounded-full font-medium border border-white/50 hover:bg-white/10 transition-colors">
              En savoir plus
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
