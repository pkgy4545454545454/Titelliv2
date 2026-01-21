import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, MapPin, Phone, Mail, Globe, Clock, CheckCircle, Award, Crown, ChevronRight, ShoppingCart, MessageCircle, Share2, Heart } from 'lucide-react';
import { enterpriseAPI, reviewAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { toast } from 'sonner';
import ServiceProductCard from '../components/ServiceProductCard';

const EnterprisePage = () => {
  const { id } = useParams();
  const { isAuthenticated, user } = useAuth();
  const { addItem } = useCart();
  const [enterprise, setEnterprise] = useState(null);
  const [services, setServices] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('presentation');
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });

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
      } catch (error) {
        console.error('Error fetching enterprise:', error);
        toast.error('Entreprise non trouvée');
      } finally {
        setLoading(false);
      }
    };
    fetchEnterprise();
  }, [id]);

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

  const tabs = [
    { id: 'presentation', label: 'Présentation' },
    { id: 'services', label: 'Services' },
    { id: 'produits', label: 'Produits' },
    { id: 'photos', label: 'Photos/Vidéos' },
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

  return (
    <div className="min-h-screen bg-[#050505]" data-testid="enterprise-page">
      {/* Header with Cover */}
      <div className="relative h-64 md:h-80">
        <img 
          src={enterprise.cover_image || defaultCover}
          alt={enterprise.business_name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/50 to-transparent" />
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 -mt-32 relative z-10">
        {/* Title Bar */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div className="flex items-end gap-6">
            {/* Logo */}
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl bg-[#0F0F0F] border border-white/10 p-2 flex-shrink-0">
              {enterprise.logo ? (
                <img src={enterprise.logo} alt="" className="w-full h-full object-cover rounded-xl" />
              ) : (
                <div className="w-full h-full rounded-xl bg-[#0047AB]/20 flex items-center justify-center">
                  <span className="text-3xl font-bold text-[#0047AB]">
                    {enterprise.business_name?.[0]}
                  </span>
                </div>
              )}
            </div>
            
            <div>
              <div className="flex flex-wrap items-center gap-3 mb-2">
                {enterprise.is_certified && (
                  <span className="badge-certified flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    Certifié
                  </span>
                )}
                {enterprise.is_labeled && (
                  <span className="badge-labeled flex items-center gap-1">
                    <Award className="w-3 h-3" />
                    Labellisé
                  </span>
                )}
                {enterprise.is_premium && (
                  <span className="badge-premium flex items-center gap-1">
                    <Crown className="w-3 h-3" />
                    Premium
                  </span>
                )}
              </div>
              
              <h1 className="text-3xl md:text-4xl font-bold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
                {enterprise.business_name}
                {enterprise.slogan && (
                  <span className="text-[#D4AF37] text-lg md:text-xl font-normal ml-3">
                    ({enterprise.slogan})
                  </span>
                )}
              </h1>
              
              <div className="flex items-center gap-4 mt-2 text-gray-400">
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span>{enterprise.city}</span>
                </div>
                {enterprise.rating > 0 && (
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-[#D4AF37] text-[#D4AF37]" />
                    <span className="text-white font-medium">{enterprise.rating.toFixed(1)}</span>
                    <span>({enterprise.review_count} avis)</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button className="p-3 bg-white/5 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-colors">
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

        {/* Profile Grid */}
        <div className="profile-grid">
          {/* Left Sidebar - Navigation */}
          <div className="card-service rounded-xl p-6 h-fit sticky top-24">
            <nav className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-[#0047AB]/20 text-[#0047AB]'
                      : 'text-gray-400 hover:bg-white/5 hover:text-white'
                  }`}
                  data-testid={`tab-${tab.id}`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Center Content */}
          <div className="space-y-6">
            {/* Description Card */}
            <div className="card-service rounded-xl p-6">
              <h2 className="text-xl font-semibold text-white mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
                Descriptif de l'entreprise
              </h2>
              <p className="text-gray-400 leading-relaxed whitespace-pre-line">
                {enterprise.description}
              </p>
            </div>

            {/* Services */}
            {(activeTab === 'presentation' || activeTab === 'services') && services.filter(s => s.type === 'service').length > 0 && (
              <div className="card-service rounded-xl p-6">
                <h2 className="text-xl font-semibold text-white mb-6" style={{ fontFamily: 'Playfair Display, serif' }}>
                  Nos Services
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {services.filter(s => s.type === 'service').map((service) => (
                    <div key={service.id} className="bg-white/5 rounded-xl p-4 border border-white/5 hover:border-[#0047AB]/30 transition-colors">
                      <div className="aspect-video rounded-lg bg-white/5 mb-4 overflow-hidden">
                        {service.images?.[0] ? (
                          <img src={service.images[0]} alt={service.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-500">
                            Pas d'image
                          </div>
                        )}
                      </div>
                      <h3 className="text-white font-semibold mb-2">{service.name}</h3>
                      <p className="text-sm text-gray-400 mb-3 line-clamp-2">{service.description}</p>
                      <p className="text-lg font-bold text-white">
                        {service.price.toFixed(2)} <span className="text-sm text-gray-400">{service.currency}</span>
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Products */}
            {(activeTab === 'presentation' || activeTab === 'produits') && services.filter(s => s.type === 'product').length > 0 && (
              <div className="card-service rounded-xl p-6">
                <h2 className="text-xl font-semibold text-white mb-6" style={{ fontFamily: 'Playfair Display, serif' }}>
                  Nos Produits
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {services.filter(s => s.type === 'product').map((product) => (
                    <div key={product.id} className="bg-white/5 rounded-xl p-4 border border-white/5 hover:border-[#D4AF37]/30 transition-colors">
                      <div className="aspect-video rounded-lg bg-white/5 mb-4 overflow-hidden">
                        {product.images?.[0] ? (
                          <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-500">
                            Pas d'image
                          </div>
                        )}
                      </div>
                      <h3 className="text-white font-semibold mb-2">{product.name}</h3>
                      <p className="text-sm text-gray-400 mb-3 line-clamp-2">{product.description}</p>
                      <div className="flex items-center justify-between">
                        <p className="text-lg font-bold text-white">
                          {product.price.toFixed(2)} <span className="text-sm text-gray-400">{product.currency}</span>
                        </p>
                        <button className="p-2 bg-[#D4AF37] rounded-full text-black hover:bg-[#F3CF55] transition-colors">
                          <ShoppingCart className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Contact */}
            {activeTab === 'contact' && (
              <div className="card-service rounded-xl p-6">
                <h2 className="text-xl font-semibold text-white mb-6" style={{ fontFamily: 'Playfair Display, serif' }}>
                  Contact
                </h2>
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 bg-white/5 rounded-xl">
                    <MapPin className="w-5 h-5 text-[#0047AB]" />
                    <div>
                      <p className="text-sm text-gray-400">Adresse</p>
                      <p className="text-white">{enterprise.address}, {enterprise.city}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-white/5 rounded-xl">
                    <Phone className="w-5 h-5 text-[#0047AB]" />
                    <div>
                      <p className="text-sm text-gray-400">Téléphone</p>
                      <p className="text-white">{enterprise.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-white/5 rounded-xl">
                    <Mail className="w-5 h-5 text-[#0047AB]" />
                    <div>
                      <p className="text-sm text-gray-400">Email</p>
                      <p className="text-white">{enterprise.email}</p>
                    </div>
                  </div>
                  {enterprise.website && (
                    <div className="flex items-center gap-4 p-4 bg-white/5 rounded-xl">
                      <Globe className="w-5 h-5 text-[#0047AB]" />
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

          {/* Right Sidebar - Reviews */}
          <div className="card-service rounded-xl p-6 h-fit sticky top-24">
            <h2 className="text-xl font-semibold text-white mb-6" style={{ fontFamily: 'Playfair Display, serif' }}>
              Commentaires
            </h2>
            
            {/* Reviews List */}
            <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
              {reviews.length > 0 ? reviews.map((review) => (
                <div key={review.id} className="pb-4 border-b border-white/5 last:border-0">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-white">{review.user_name}</span>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={`w-4 h-4 ${i < review.rating ? 'fill-[#D4AF37] text-[#D4AF37]' : 'text-gray-600'}`} 
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-gray-400">{review.comment}</p>
                </div>
              )) : (
                <p className="text-gray-500 text-sm">Aucun avis pour le moment</p>
              )}
            </div>

            {/* Add Review */}
            {isAuthenticated && (
              <form onSubmit={handleSubmitReview} className="pt-4 border-t border-white/10">
                <h3 className="text-sm font-medium text-gray-300 mb-3">Laisser un avis</h3>
                <div className="flex items-center gap-1 mb-3">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setNewReview({ ...newReview, rating: star })}
                    >
                      <Star 
                        className={`w-6 h-6 cursor-pointer transition-colors ${
                          star <= newReview.rating ? 'fill-[#D4AF37] text-[#D4AF37]' : 'text-gray-600 hover:text-[#D4AF37]'
                        }`} 
                      />
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
                <button type="submit" className="btn-primary w-full py-2 text-sm">
                  Publier
                </button>
              </form>
            )}

            {reviews.length > 3 && (
              <button className="flex items-center justify-center gap-2 w-full mt-4 text-[#0047AB] hover:text-[#2E74D6] text-sm font-medium">
                Voir tous les avis
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnterprisePage;
