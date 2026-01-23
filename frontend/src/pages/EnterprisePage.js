import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, MapPin, Phone, Mail, Globe, Clock, CheckCircle, Award, Crown, ChevronRight, ChevronLeft, ShoppingCart, MessageCircle, Share2, Heart, Play, Pause, Volume2, VolumeX, Users, TrendingUp, BarChart3, Calendar as CalendarIcon, GraduationCap, Briefcase, Image, Video, X } from 'lucide-react';
import { enterpriseAPI, reviewAPI, servicesProductsAPI, getImageUrl, trainingsAPI, jobsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { toast } from 'sonner';

const EnterprisePage = () => {
  const { id } = useParams();
  const { isAuthenticated, user } = useAuth();
  const { addItem } = useCart();
  const [enterprise, setEnterprise] = useState(null);
  const [services, setServices] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [trainings, setTrainings] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [mediaGallery, setMediaGallery] = useState({ photos: [], videos: [] });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('presentation');
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
  const [videoPlaying, setVideoPlaying] = useState(true);
  const [videoMuted, setVideoMuted] = useState(true);
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0);
  const [displayVariant, setDisplayVariant] = useState('side'); // 'side' or 'below'
  const [selectedMedia, setSelectedMedia] = useState(null); // For lightbox
  const videoRef = useRef(null);

  const handleAddToCart = (item) => {
    addItem(item, enterprise);
  };

  useEffect(() => {
    const fetchEnterprise = async () => {
      try {
        const response = await enterpriseAPI.get(id);
        setEnterprise(response.data);
        setServices(response.data.services || []);
        setReviews(response.data.reviews || []);
        
        // Extract photos and videos from enterprise media gallery
        const photos = response.data.media_gallery?.filter(m => m.type === 'photo' || m.media_type === 'photo') || [];
        const videos = response.data.media_gallery?.filter(m => m.type === 'video' || m.media_type === 'video') || [];
        setMediaGallery({ photos, videos });
        
        // Fetch enterprise trainings
        try {
          const trainingsRes = await trainingsAPI.getAll();
          const enterpriseTrainings = (trainingsRes.data || []).filter(t => t.enterprise_id === id);
          setTrainings(enterpriseTrainings);
        } catch (err) {
          console.error('Error fetching trainings:', err);
        }
        
        // Fetch enterprise jobs
        try {
          const jobsRes = await jobsAPI.list();
          const jobsData = jobsRes.data?.jobs || jobsRes.data || [];
          const enterpriseJobs = jobsData.filter(j => j.enterprise_id === id);
          setJobs(enterpriseJobs);
        } catch (err) {
          console.error('Error fetching jobs:', err);
        }
      } catch (error) {
        console.error('Error fetching enterprise:', error);
        toast.error('Entreprise non trouvée');
      } finally {
        setLoading(false);
      }
    };
    fetchEnterprise();
  }, [id]);

  // Auto-scroll reviews
  useEffect(() => {
    if (reviews.length > 1) {
      const interval = setInterval(() => {
        setCurrentReviewIndex((prev) => (prev + 1) % reviews.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [reviews.length]);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error('Connectez-vous pour laisser un avis');
      return;
    }

    try {
      const response = await reviewAPI.create({
        enterprise_id: id,
        rating: newReview.rating,
        comment: newReview.comment
      });
      setReviews([response.data, ...reviews]);
      setNewReview({ rating: 5, comment: '' });
      toast.success('Avis publié !');
    } catch (error) {
      toast.error('Erreur lors de la publication');
    }
  };

  const toggleVideo = () => {
    if (videoRef.current) {
      if (videoPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setVideoPlaying(!videoPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoMuted;
      setVideoMuted(!videoMuted);
    }
  };

  const tabs = [
    { id: 'presentation', label: 'Présentation' },
    { id: 'services', label: 'Services' },
    { id: 'produits', label: 'Produits' },
    { id: 'photos', label: 'Photos/Vidéos' },
    { id: 'formations', label: 'Formations' },
    { id: 'emplois', label: 'Offres d\'emploi' },
    { id: 'contact', label: 'Contact' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] pt-24 flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-[#0047AB] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!enterprise) {
    return (
      <div className="min-h-screen bg-[#050505] pt-24 flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold text-white mb-4">Entreprise non trouvée</h2>
        <Link to="/entreprises" className="btn-primary">Retour aux entreprises</Link>
      </div>
    );
  }

  const defaultCover = 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1920';
  const defaultVideo = 'https://videos.pexels.com/video-files/4065924/4065924-uhd_2560_1440_30fps.mp4';
  const hasVideo = enterprise.videos?.length > 0 || enterprise.cover_video;

  // Stats indicateurs
  const indicators = [
    { label: 'Compétences', value: enterprise.skills_score || 85, color: '#0047AB' },
    { label: 'Profit mensuel', value: enterprise.profit_score || 72, color: '#D4AF37' },
    { label: 'Influence', value: enterprise.influence_score || 68, color: '#10B981' },
    { label: 'Potentiel', value: enterprise.potential_score || 90, color: '#8B5CF6' },
    { label: 'Performance', value: enterprise.performance_score || 78, color: '#EC4899' },
    { label: 'Évolution', value: enterprise.evolution_score || 82, color: '#F59E0B' },
  ];

  return (
    <div className="min-h-screen bg-[#050505]" data-testid="enterprise-page">
      {/* Hero Section - Panoramic Video/Image */}
      <div className="relative h-[50vh] md:h-[60vh] overflow-hidden">
        {hasVideo ? (
          <>
            <video
              ref={videoRef}
              autoPlay
              muted
              loop
              playsInline
              className="w-full h-full object-cover"
            >
              <source src={enterprise.cover_video || defaultVideo} type="video/mp4" />
            </video>
            {/* Video Controls */}
            <div className="absolute bottom-6 right-6 flex gap-2 z-20">
              <button
                onClick={toggleVideo}
                className="p-3 bg-black/50 backdrop-blur-sm rounded-full text-white hover:bg-black/70 transition-colors"
              >
                {videoPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              </button>
              <button
                onClick={toggleMute}
                className="p-3 bg-black/50 backdrop-blur-sm rounded-full text-white hover:bg-black/70 transition-colors"
              >
                {videoMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </button>
            </div>
          </>
        ) : (
          <img
            src={enterprise.cover_image || defaultCover}
            alt={enterprise.business_name}
            className="w-full h-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/40 to-transparent" />

        {/* Portrait Photo Overlay */}
        <div className="absolute bottom-0 left-8 md:left-16 transform translate-y-1/2 z-30">
          <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-[#050505] overflow-hidden bg-[#0F0F0F] shadow-2xl">
            {enterprise.logo ? (
              <img src={getImageUrl(enterprise.logo)} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#0047AB] to-[#D4AF37]">
                <span className="text-4xl font-bold text-white">
                  {enterprise.business_name?.[0]}
                </span>
              </div>
            )}
          </div>
          {/* Labels */}
          <div className="absolute -right-2 -top-2 flex flex-col gap-1">
            {enterprise.is_certified && (
              <span className="w-8 h-8 rounded-full bg-cyan-500 flex items-center justify-center shadow-lg">
                <CheckCircle className="w-4 h-4 text-white" />
              </span>
            )}
            {enterprise.is_labeled && (
              <span className="w-8 h-8 rounded-full bg-[#D4AF37] flex items-center justify-center shadow-lg">
                <Award className="w-4 h-4 text-white" />
              </span>
            )}
            {enterprise.is_premium && (
              <span className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center shadow-lg">
                <Crown className="w-4 h-4 text-white" />
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 pt-24 pb-12">
        {/* Header Info */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
          <div className="md:pl-48">
            <h1 className="text-3xl md:text-4xl font-bold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
              {enterprise.business_name}
            </h1>
            {enterprise.slogan && (
              <p className="text-[#D4AF37] text-lg mt-1">{enterprise.slogan}</p>
            )}
            <div className="flex flex-wrap items-center gap-4 mt-3 text-gray-400">
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                <span>{enterprise.city}</span>
              </div>
              {enterprise.rating > 0 && (
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-[#D4AF37] text-[#D4AF37]" />
                  <span className="text-white font-medium">{enterprise.rating?.toFixed(1) || '0.0'}</span>
                  <span>({enterprise.review_count || 0} avis)</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                <span>{enterprise.followers_count || 0} abonnés</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 md:mt-4">
            <button className="p-3 bg-white/5 rounded-full text-gray-400 hover:text-red-400 hover:bg-white/10 transition-colors">
              <Heart className="w-5 h-5" />
            </button>
            <button className="p-3 bg-white/5 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-colors">
              <Share2 className="w-5 h-5" />
            </button>
            <button className="btn-primary flex items-center gap-2" data-testid="contact-btn">
              <MessageCircle className="w-5 h-5" />
              Contacter
            </button>
          </div>
        </div>

        {/* Performance Indicators */}
        <div className="card-service rounded-xl p-6 mb-8">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-[#0047AB]" />
            Indicateurs de performance
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {indicators.map((indicator, index) => (
              <div key={index} className="text-center">
                <div className="relative w-16 h-16 mx-auto mb-2">
                  <svg className="w-full h-full -rotate-90">
                    <circle
                      cx="32"
                      cy="32"
                      r="28"
                      fill="none"
                      stroke="rgba(255,255,255,0.1)"
                      strokeWidth="4"
                    />
                    <circle
                      cx="32"
                      cy="32"
                      r="28"
                      fill="none"
                      stroke={indicator.color}
                      strokeWidth="4"
                      strokeDasharray={`${(indicator.value / 100) * 176} 176`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-white font-bold text-sm">
                    {indicator.value}%
                  </span>
                </div>
                <p className="text-xs text-gray-400">{indicator.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Scrolling Reviews Banner */}
        {reviews.length > 0 && (
          <div className="card-service rounded-xl p-4 mb-8 overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-400 flex items-center gap-2">
                <MessageCircle className="w-4 h-4" />
                Avis clients
              </h3>
              <div className="flex gap-1">
                <button
                  onClick={() => setCurrentReviewIndex((prev) => (prev - 1 + reviews.length) % reviews.length)}
                  className="p-1 hover:bg-white/10 rounded transition-colors"
                >
                  <ChevronLeft className="w-4 h-4 text-gray-400" />
                </button>
                <button
                  onClick={() => setCurrentReviewIndex((prev) => (prev + 1) % reviews.length)}
                  className="p-1 hover:bg-white/10 rounded transition-colors"
                >
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </button>
              </div>
            </div>
            <div className="relative h-20 overflow-hidden">
              {reviews.map((review, index) => (
                <div
                  key={review.id}
                  className={`absolute inset-0 transition-all duration-500 ${
                    index === currentReviewIndex
                      ? 'opacity-100 translate-x-0'
                      : index < currentReviewIndex
                      ? 'opacity-0 -translate-x-full'
                      : 'opacity-0 translate-x-full'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-[#0047AB]/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-[#0047AB] font-semibold">{review.user_name?.[0] || 'U'}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-white font-medium">{review.user_name}</span>
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`w-3 h-3 ${i < review.rating ? 'fill-[#D4AF37] text-[#D4AF37]' : 'text-gray-600'}`} />
                          ))}
                        </div>
                      </div>
                      <p className="text-gray-400 text-sm line-clamp-2">{review.comment}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-center gap-1 mt-3">
              {reviews.slice(0, 5).map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentReviewIndex(index)}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentReviewIndex ? 'bg-[#D4AF37]' : 'bg-white/20'
                  }`}
                />
              ))}
            </div>
          </div>
        )}

        {/* Display Variant Toggle */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-[#0047AB] text-white'
                    : 'bg-white/5 text-gray-400 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <span>Affichage:</span>
            <button
              onClick={() => setDisplayVariant('side')}
              className={`px-3 py-1.5 rounded ${displayVariant === 'side' ? 'bg-[#0047AB] text-white' : 'bg-white/5 hover:bg-white/10'}`}
            >
              Côte à côte
            </button>
            <button
              onClick={() => setDisplayVariant('below')}
              className={`px-3 py-1.5 rounded ${displayVariant === 'below' ? 'bg-[#0047AB] text-white' : 'bg-white/5 hover:bg-white/10'}`}
            >
              Texte dessous
            </button>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <div className="card-service rounded-xl p-6">
              <h2 className="text-xl font-semibold text-white mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
                À propos
              </h2>
              <p className="text-gray-400 leading-relaxed whitespace-pre-line">
                {enterprise.description}
              </p>
            </div>

            {/* Services - Variant Display */}
            {(activeTab === 'presentation' || activeTab === 'services') && services.filter(s => s.type === 'service').length > 0 && (
              <div className="card-service rounded-xl p-6">
                <h2 className="text-xl font-semibold text-white mb-6" style={{ fontFamily: 'Playfair Display, serif' }}>
                  Nos Services
                </h2>
                <div className={displayVariant === 'side' ? 'space-y-4' : 'grid grid-cols-1 md:grid-cols-2 gap-4'}>
                  {services.filter(s => s.type === 'service').map((service) => (
                    displayVariant === 'side' ? (
                      // Side by Side Layout
                      <Link to={`/service/${service.id}`} key={service.id} className="flex gap-4 p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors border border-transparent hover:border-[#0047AB]/30">
                        <div className="w-32 h-24 rounded-lg bg-white/5 overflow-hidden flex-shrink-0">
                          {service.images?.[0] ? (
                            <img src={service.images[0]} alt={service.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-500 text-xs">Pas d'image</div>
                          )}
                        </div>
                        <div className="flex-1 flex flex-col justify-between">
                          <div>
                            <h3 className="text-white font-semibold mb-1">{service.name}</h3>
                            <p className="text-sm text-gray-400 line-clamp-2">{service.description}</p>
                          </div>
                          <div className="flex items-center justify-between mt-2">
                            <p className="text-lg font-bold text-[#D4AF37]">{service.price?.toFixed(2)} CHF</p>
                            <button
                              onClick={(e) => { e.preventDefault(); handleAddToCart(service); }}
                              className="p-2 bg-[#0047AB] rounded-full text-white hover:bg-[#2E74D6] transition-colors"
                            >
                              <ShoppingCart className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </Link>
                    ) : (
                      // Text Below Layout
                      <Link to={`/service/${service.id}`} key={service.id} className="bg-white/5 rounded-xl overflow-hidden hover:bg-white/10 transition-colors border border-transparent hover:border-[#0047AB]/30">
                        <div className="aspect-video bg-white/5 overflow-hidden">
                          {service.images?.[0] ? (
                            <img src={service.images[0]} alt={service.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-500">Pas d'image</div>
                          )}
                        </div>
                        <div className="p-4">
                          <h3 className="text-white font-semibold mb-2">{service.name}</h3>
                          <p className="text-sm text-gray-400 line-clamp-2 mb-3">{service.description}</p>
                          <div className="flex items-center justify-between">
                            <p className="text-lg font-bold text-[#D4AF37]">{service.price?.toFixed(2)} CHF</p>
                            <button
                              onClick={(e) => { e.preventDefault(); handleAddToCart(service); }}
                              className="p-2 bg-[#0047AB] rounded-full text-white hover:bg-[#2E74D6] transition-colors"
                            >
                              <ShoppingCart className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </Link>
                    )
                  ))}
                </div>
              </div>
            )}

            {/* Products - Variant Display */}
            {(activeTab === 'presentation' || activeTab === 'produits') && services.filter(s => s.type === 'product').length > 0 && (
              <div className="card-service rounded-xl p-6">
                <h2 className="text-xl font-semibold text-white mb-6" style={{ fontFamily: 'Playfair Display, serif' }}>
                  Nos Produits
                </h2>
                <div className={displayVariant === 'side' ? 'space-y-4' : 'grid grid-cols-1 md:grid-cols-2 gap-4'}>
                  {services.filter(s => s.type === 'product').map((product) => (
                    displayVariant === 'side' ? (
                      // Side by Side Layout
                      <Link to={`/product/${product.id}`} key={product.id} className="flex gap-4 p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors border border-transparent hover:border-[#D4AF37]/30">
                        <div className="w-32 h-24 rounded-lg bg-white/5 overflow-hidden flex-shrink-0">
                          {product.images?.[0] ? (
                            <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-500 text-xs">Pas d'image</div>
                          )}
                        </div>
                        <div className="flex-1 flex flex-col justify-between">
                          <div>
                            <h3 className="text-white font-semibold mb-1">{product.name}</h3>
                            <p className="text-sm text-gray-400 line-clamp-2">{product.description}</p>
                          </div>
                          <div className="flex items-center justify-between mt-2">
                            <p className="text-lg font-bold text-[#D4AF37]">{product.price?.toFixed(2)} CHF</p>
                            <button
                              onClick={(e) => { e.preventDefault(); handleAddToCart(product); }}
                              className="p-2 bg-[#D4AF37] rounded-full text-black hover:bg-[#F3CF55] transition-colors"
                            >
                              <ShoppingCart className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </Link>
                    ) : (
                      // Text Below Layout
                      <Link to={`/product/${product.id}`} key={product.id} className="bg-white/5 rounded-xl overflow-hidden hover:bg-white/10 transition-colors border border-transparent hover:border-[#D4AF37]/30">
                        <div className="aspect-video bg-white/5 overflow-hidden">
                          {product.images?.[0] ? (
                            <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-500">Pas d'image</div>
                          )}
                        </div>
                        <div className="p-4">
                          <h3 className="text-white font-semibold mb-2">{product.name}</h3>
                          <p className="text-sm text-gray-400 line-clamp-2 mb-3">{product.description}</p>
                          <div className="flex items-center justify-between">
                            <p className="text-lg font-bold text-[#D4AF37]">{product.price?.toFixed(2)} CHF</p>
                            <button
                              onClick={(e) => { e.preventDefault(); handleAddToCart(product); }}
                              className="p-2 bg-[#D4AF37] rounded-full text-black hover:bg-[#F3CF55] transition-colors"
                            >
                              <ShoppingCart className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </Link>
                    )
                  ))}
                </div>
              </div>
            )}

            {/* Contact Tab */}
            {activeTab === 'contact' && (
              <div className="card-service rounded-xl p-6">
                <h2 className="text-xl font-semibold text-white mb-6" style={{ fontFamily: 'Playfair Display, serif' }}>
                  Contact
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-4 p-4 bg-white/5 rounded-xl">
                    <MapPin className="w-6 h-6 text-[#0047AB]" />
                    <div>
                      <p className="text-sm text-gray-400">Adresse</p>
                      <p className="text-white">{enterprise.address}, {enterprise.city}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-white/5 rounded-xl">
                    <Phone className="w-6 h-6 text-[#0047AB]" />
                    <div>
                      <p className="text-sm text-gray-400">Téléphone</p>
                      <p className="text-white">{enterprise.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-white/5 rounded-xl">
                    <Mail className="w-6 h-6 text-[#0047AB]" />
                    <div>
                      <p className="text-sm text-gray-400">Email</p>
                      <p className="text-white">{enterprise.email}</p>
                    </div>
                  </div>
                  {enterprise.website && (
                    <div className="flex items-center gap-4 p-4 bg-white/5 rounded-xl">
                      <Globe className="w-6 h-6 text-[#0047AB]" />
                      <div>
                        <p className="text-sm text-gray-400">Site web</p>
                        <a href={enterprise.website} target="_blank" rel="noopener noreferrer" className="text-[#0047AB] hover:underline">
                          {enterprise.website}
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Contact */}
            <div className="card-service rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Prendre RDV</h3>
              <div className="space-y-3">
                <button className="w-full py-3 px-4 bg-[#0047AB] text-white rounded-lg font-medium hover:bg-[#2E74D6] transition-colors flex items-center justify-center gap-2">
                  <CalendarIcon className="w-5 h-5" />
                  Réserver maintenant
                </button>
                <button className="w-full py-3 px-4 bg-white/5 text-white rounded-lg font-medium hover:bg-white/10 transition-colors flex items-center justify-center gap-2">
                  <Phone className="w-5 h-5" />
                  Appeler
                </button>
              </div>
            </div>

            {/* All Reviews */}
            <div className="card-service rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Tous les avis ({reviews.length})</h3>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {reviews.length > 0 ? reviews.map((review) => (
                  <div key={review.id} className="pb-4 border-b border-white/5 last:border-0">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-white">{review.user_name}</span>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`w-3 h-3 ${i < review.rating ? 'fill-[#D4AF37] text-[#D4AF37]' : 'text-gray-600'}`} />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-gray-400">{review.comment}</p>
                  </div>
                )) : (
                  <p className="text-gray-500 text-sm">Aucun avis pour le moment</p>
                )}
              </div>

              {/* Add Review Form */}
              {isAuthenticated && (
                <form onSubmit={handleSubmitReview} className="pt-4 mt-4 border-t border-white/10">
                  <h4 className="text-sm font-medium text-gray-300 mb-3">Laisser un avis</h4>
                  <div className="flex items-center gap-1 mb-3">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button key={star} type="button" onClick={() => setNewReview({ ...newReview, rating: star })}>
                        <Star className={`w-6 h-6 cursor-pointer transition-colors ${star <= newReview.rating ? 'fill-[#D4AF37] text-[#D4AF37]' : 'text-gray-600 hover:text-[#D4AF37]'}`} />
                      </button>
                    ))}
                  </div>
                  <textarea
                    value={newReview.comment}
                    onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                    placeholder="Votre commentaire..."
                    className="input-dark w-full h-24 resize-none mb-3"
                    required
                  />
                  <button type="submit" className="btn-primary w-full py-2 text-sm">Publier</button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnterprisePage;
