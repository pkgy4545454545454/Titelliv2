import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, User, TrendingUp, MessageSquare, Star, Users, DollarSign,
  Calendar, FileText, Settings, Bell, Eye, Heart, Share2, BarChart3, Target,
  CheckCircle, XCircle, Clock, Camera, Edit, Menu, X, Instagram, ExternalLink,
  Briefcase, Award
} from 'lucide-react';
import { influencersAPI, getImageUrl } from '../services/api';
import { toast } from 'sonner';

const InfluencerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [profile, setProfile] = useState(null);
  const [collaborations, setCollaborations] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [editProfile, setEditProfile] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    category: 'Lifestyle',
    price: 500,
    instagram: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // In production, this would fetch the influencer's own profile
      // For now, we'll use mock data structure
      const profileData = {
        id: user?.id || 'inf-1',
        name: user?.first_name + ' ' + user?.last_name || 'Mon Profil',
        image: user?.avatar || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200',
        category: 'Lifestyle',
        followers: 45000,
        engagement_rate: 5.2,
        price: 500,
        bio: 'Créateur de contenu passionné',
        instagram: '@moncompte',
        total_views: 125000,
        total_likes: 8500,
        total_shares: 1200
      };
      setProfile(profileData);
      setFormData({
        name: profileData.name,
        bio: profileData.bio,
        category: profileData.category,
        price: profileData.price,
        instagram: profileData.instagram
      });

      // Fetch collaborations (pending requests from enterprises)
      const collabRes = await influencersAPI.getCollaborations().catch(() => ({ data: { collaborations: [] } }));
      setCollaborations(collabRes.data?.collaborations || []);
      setStats(collabRes.data?.stats || {});
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptCollab = async (collabId) => {
    toast.success('Collaboration acceptée !');
    // In production: update collaboration status via API
  };

  const handleDeclineCollab = async (collabId) => {
    toast.success('Collaboration déclinée');
    // In production: update collaboration status via API
  };

  const handleSaveProfile = async () => {
    // In production: save profile via API
    setProfile({ ...profile, ...formData });
    setEditProfile(false);
    toast.success('Profil mis à jour !');
  };

  const menuSections = [
    {
      title: 'Principal',
      items: [
        { id: 'overview', label: 'Tableau de bord', icon: LayoutDashboard },
        { id: 'profile', label: 'Mon Profil', icon: User },
        { id: 'stats', label: 'Statistiques', icon: BarChart3 },
      ]
    },
    {
      title: 'Collaborations',
      items: [
        { id: 'requests', label: 'Demandes reçues', icon: Bell },
        { id: 'active', label: 'Collaborations actives', icon: Briefcase },
        { id: 'history', label: 'Historique', icon: Clock },
      ]
    },
    {
      title: 'Revenus',
      items: [
        { id: 'earnings', label: 'Mes revenus', icon: DollarSign },
        { id: 'invoices', label: 'Factures', icon: FileText },
      ]
    },
    {
      title: 'Communication',
      items: [
        { id: 'messages', label: 'Messages', icon: MessageSquare },
        { id: 'calendar', label: 'Calendrier', icon: Calendar },
      ]
    },
    {
      title: 'Paramètres',
      items: [
        { id: 'settings', label: 'Paramètres', icon: Settings },
      ]
    },
  ];

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num?.toString() || '0';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] pt-24 flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] pt-20" data-testid="influencer-dashboard">
      {/* Mobile Menu Button */}
      <button 
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="lg:hidden fixed bottom-6 right-6 z-50 w-14 h-14 bg-[#D4AF37] rounded-full flex items-center justify-center shadow-lg"
      >
        {mobileMenuOpen ? <X className="w-6 h-6 text-black" /> : <Menu className="w-6 h-6 text-black" />}
      </button>

      <div className="flex">
        {/* Sidebar */}
        <aside className={`w-64 min-h-screen bg-[#0A0A0A] border-r border-white/5 fixed left-0 top-20 bottom-0 overflow-y-auto z-40 transition-transform duration-300 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
          <div className="p-4">
            {/* Profile Card */}
            <div className="mb-6 p-4 bg-gradient-to-br from-[#D4AF37]/10 to-transparent rounded-xl border border-[#D4AF37]/20">
              <div className="flex items-center gap-3 mb-3">
                <img 
                  src={profile?.image} 
                  alt="" 
                  className="w-12 h-12 rounded-full object-cover border-2 border-[#D4AF37]"
                />
                <div>
                  <p className="font-semibold text-white text-sm">{profile?.name}</p>
                  <p className="text-xs text-[#D4AF37]">Influenceur</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div>
                  <p className="text-white font-bold">{formatNumber(profile?.followers)}</p>
                  <p className="text-gray-500">Abonnés</p>
                </div>
                <div>
                  <p className="text-white font-bold">{profile?.engagement_rate}%</p>
                  <p className="text-gray-500">Engage.</p>
                </div>
                <div>
                  <p className="text-white font-bold">{collaborations.length}</p>
                  <p className="text-gray-500">Collabs</p>
                </div>
              </div>
            </div>

            <nav className="space-y-4">
              {menuSections.map((section) => (
                <div key={section.title}>
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-3">
                    {section.title}
                  </h3>
                  <div className="space-y-0.5">
                    {section.items.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => { setActiveTab(item.id); setMobileMenuOpen(false); }}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                          activeTab === item.id
                            ? 'bg-[#D4AF37]/20 text-[#D4AF37]'
                            : 'text-gray-400 hover:bg-white/5 hover:text-white'
                        }`}
                      >
                        <item.icon className="w-4 h-4" />
                        {item.label}
                        {item.id === 'requests' && collaborations.filter(c => c.status === 'pending').length > 0 && (
                          <span className="ml-auto w-5 h-5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center">
                            {collaborations.filter(c => c.status === 'pending').length}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </nav>
          </div>
        </aside>

        {/* Overlay for mobile */}
        {mobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 bg-black/50 z-30" onClick={() => setMobileMenuOpen(false)} />
        )}

        {/* Main Content */}
        <main className="flex-1 lg:ml-64 p-4 md:p-6 lg:p-8">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
                  Bienvenue, {profile?.name?.split(' ')[0]} !
                </h1>
                <p className="text-gray-400 mt-1">Votre espace influenceur Titelli</p>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="card-service rounded-xl p-5">
                  <div className="flex items-center justify-between mb-2">
                    <Eye className="w-5 h-5 text-[#0047AB]" />
                    <span className="text-xs text-green-400">+12%</span>
                  </div>
                  <p className="text-2xl font-bold text-white">{formatNumber(profile?.total_views)}</p>
                  <p className="text-sm text-gray-400">Vues totales</p>
                </div>
                <div className="card-service rounded-xl p-5">
                  <div className="flex items-center justify-between mb-2">
                    <Heart className="w-5 h-5 text-red-400" />
                    <span className="text-xs text-green-400">+8%</span>
                  </div>
                  <p className="text-2xl font-bold text-white">{formatNumber(profile?.total_likes)}</p>
                  <p className="text-sm text-gray-400">Likes totaux</p>
                </div>
                <div className="card-service rounded-xl p-5">
                  <div className="flex items-center justify-between mb-2">
                    <Share2 className="w-5 h-5 text-[#D4AF37]" />
                    <span className="text-xs text-green-400">+5%</span>
                  </div>
                  <p className="text-2xl font-bold text-white">{formatNumber(profile?.total_shares)}</p>
                  <p className="text-sm text-gray-400">Partages</p>
                </div>
                <div className="card-service rounded-xl p-5">
                  <div className="flex items-center justify-between mb-2">
                    <DollarSign className="w-5 h-5 text-green-400" />
                  </div>
                  <p className="text-2xl font-bold text-white">{stats.total_investment || 0} CHF</p>
                  <p className="text-sm text-gray-400">Revenus du mois</p>
                </div>
              </div>

              {/* Pending Collaboration Requests */}
              <div className="card-service rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-white">Demandes de collaboration</h2>
                  <span className="text-sm text-gray-400">{collaborations.filter(c => c.status === 'pending').length} en attente</span>
                </div>
                {collaborations.filter(c => c.status === 'pending').length > 0 ? (
                  <div className="space-y-3">
                    {collaborations.filter(c => c.status === 'pending').slice(0, 3).map((collab) => (
                      <div key={collab.id} className="p-4 bg-white/5 rounded-xl">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-[#0047AB]/20 flex items-center justify-center">
                              <Briefcase className="w-5 h-5 text-[#0047AB]" />
                            </div>
                            <div>
                              <p className="text-white font-medium">{collab.enterprise_name || 'Entreprise'}</p>
                              <p className="text-xs text-gray-400">Proposition de collaboration</p>
                            </div>
                          </div>
                          <span className="text-[#D4AF37] font-semibold">{collab.budget} CHF</span>
                        </div>
                        <p className="text-sm text-gray-400 mb-3">{collab.message || 'Nouvelle demande de collaboration'}</p>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleAcceptCollab(collab.id)}
                            className="flex-1 py-2 bg-green-500/20 text-green-400 rounded-lg text-sm font-medium hover:bg-green-500/30 transition-colors flex items-center justify-center gap-2"
                          >
                            <CheckCircle className="w-4 h-4" /> Accepter
                          </button>
                          <button 
                            onClick={() => handleDeclineCollab(collab.id)}
                            className="flex-1 py-2 bg-red-500/20 text-red-400 rounded-lg text-sm font-medium hover:bg-red-500/30 transition-colors flex items-center justify-center gap-2"
                          >
                            <XCircle className="w-4 h-4" /> Décliner
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Bell className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-400">Aucune demande en attente</p>
                  </div>
                )}
              </div>

              {/* Performance Chart Placeholder */}
              <div className="card-service rounded-xl p-6">
                <h2 className="text-lg font-semibold text-white mb-4">Performance ce mois</h2>
                <div className="h-48 flex items-end justify-between gap-2">
                  {[65, 45, 78, 52, 90, 67, 85].map((value, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2">
                      <div 
                        className="w-full bg-gradient-to-t from-[#D4AF37] to-[#D4AF37]/50 rounded-t-lg transition-all"
                        style={{ height: `${value}%` }}
                      />
                      <span className="text-xs text-gray-500">
                        {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'][i]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
                  Mon Profil Influenceur
                </h1>
                <button 
                  onClick={() => setEditProfile(!editProfile)}
                  className="btn-secondary flex items-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  {editProfile ? 'Annuler' : 'Modifier'}
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Profile Card */}
                <div className="card-service rounded-xl p-6 text-center">
                  <div className="relative inline-block mb-4">
                    <img 
                      src={profile?.image} 
                      alt="" 
                      className="w-32 h-32 rounded-full object-cover border-4 border-[#D4AF37]/30 mx-auto"
                    />
                    <button className="absolute bottom-0 right-0 w-10 h-10 bg-[#D4AF37] rounded-full flex items-center justify-center">
                      <Camera className="w-5 h-5 text-black" />
                    </button>
                  </div>
                  <h2 className="text-xl font-bold text-white">{profile?.name}</h2>
                  <p className="text-[#D4AF37]">{profile?.category}</p>
                  <div className="flex items-center justify-center gap-2 mt-2 text-gray-400">
                    <Instagram className="w-4 h-4" />
                    <span>{profile?.instagram}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-white/10">
                    <div>
                      <p className="text-xl font-bold text-white">{formatNumber(profile?.followers)}</p>
                      <p className="text-xs text-gray-400">Abonnés</p>
                    </div>
                    <div>
                      <p className="text-xl font-bold text-white">{profile?.engagement_rate}%</p>
                      <p className="text-xs text-gray-400">Engagement</p>
                    </div>
                    <div>
                      <p className="text-xl font-bold text-white">{profile?.price} CHF</p>
                      <p className="text-xs text-gray-400">Tarif</p>
                    </div>
                  </div>
                </div>

                {/* Edit Form */}
                <div className="lg:col-span-2 card-service rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Informations du profil</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Nom d'affichage</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        disabled={!editProfile}
                        className="input-dark w-full disabled:opacity-50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Bio</label>
                      <textarea
                        value={formData.bio}
                        onChange={(e) => setFormData({...formData, bio: e.target.value})}
                        disabled={!editProfile}
                        className="input-dark w-full h-24 disabled:opacity-50"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-gray-400 mb-2">Catégorie</label>
                        <select
                          value={formData.category}
                          onChange={(e) => setFormData({...formData, category: e.target.value})}
                          disabled={!editProfile}
                          className="input-dark w-full disabled:opacity-50"
                        >
                          <option value="Lifestyle">Lifestyle</option>
                          <option value="Food">Food</option>
                          <option value="Beauty">Beauty</option>
                          <option value="Tech">Tech</option>
                          <option value="Sport">Sport</option>
                          <option value="Travel">Travel</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm text-gray-400 mb-2">Tarif (CHF)</label>
                        <input
                          type="number"
                          value={formData.price}
                          onChange={(e) => setFormData({...formData, price: parseInt(e.target.value)})}
                          disabled={!editProfile}
                          className="input-dark w-full disabled:opacity-50"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Instagram</label>
                      <input
                        type="text"
                        value={formData.instagram}
                        onChange={(e) => setFormData({...formData, instagram: e.target.value})}
                        disabled={!editProfile}
                        className="input-dark w-full disabled:opacity-50"
                      />
                    </div>
                    {editProfile && (
                      <button onClick={handleSaveProfile} className="btn-primary w-full mt-4">
                        Enregistrer les modifications
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Requests Tab */}
          {activeTab === 'requests' && (
            <div className="space-y-6">
              <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
                Demandes de collaboration
              </h1>

              {collaborations.filter(c => c.status === 'pending').length > 0 ? (
                <div className="space-y-4">
                  {collaborations.filter(c => c.status === 'pending').map((collab) => (
                    <div key={collab.id} className="card-service rounded-xl p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 rounded-xl bg-[#0047AB]/20 flex items-center justify-center">
                            <Briefcase className="w-7 h-7 text-[#0047AB]" />
                          </div>
                          <div>
                            <h3 className="text-white font-semibold text-lg">{collab.enterprise_name || 'Entreprise'}</h3>
                            <p className="text-gray-400 text-sm">Nouvelle proposition</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-[#D4AF37]">{collab.budget} CHF</p>
                          <p className="text-xs text-gray-500">Budget proposé</p>
                        </div>
                      </div>
                      <p className="text-gray-300 mb-4">{collab.message || 'Demande de collaboration pour promotion de services/produits'}</p>
                      <div className="flex gap-3">
                        <button 
                          onClick={() => handleAcceptCollab(collab.id)}
                          className="flex-1 py-3 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
                        >
                          <CheckCircle className="w-5 h-5" /> Accepter
                        </button>
                        <button 
                          onClick={() => handleDeclineCollab(collab.id)}
                          className="flex-1 py-3 bg-white/10 text-white rounded-lg font-medium hover:bg-white/20 transition-colors flex items-center justify-center gap-2"
                        >
                          <XCircle className="w-5 h-5" /> Décliner
                        </button>
                        <button className="px-6 py-3 bg-[#0047AB]/20 text-[#0047AB] rounded-lg font-medium hover:bg-[#0047AB]/30 transition-colors flex items-center justify-center gap-2">
                          <MessageSquare className="w-5 h-5" /> Discuter
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="card-service rounded-xl p-12 text-center">
                  <Bell className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-xl text-white mb-2">Aucune demande en attente</h3>
                  <p className="text-gray-400">Les entreprises peuvent vous contacter via votre profil sur Titelli</p>
                </div>
              )}
            </div>
          )}

          {/* Stats Tab */}
          {activeTab === 'stats' && (
            <div className="space-y-6">
              <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
                Statistiques détaillées
              </h1>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="card-service rounded-xl p-5">
                  <Eye className="w-6 h-6 text-[#0047AB] mb-3" />
                  <p className="text-3xl font-bold text-white">{formatNumber(profile?.total_views)}</p>
                  <p className="text-gray-400">Vues du profil</p>
                </div>
                <div className="card-service rounded-xl p-5">
                  <Users className="w-6 h-6 text-[#D4AF37] mb-3" />
                  <p className="text-3xl font-bold text-white">{formatNumber(profile?.followers)}</p>
                  <p className="text-gray-400">Abonnés</p>
                </div>
                <div className="card-service rounded-xl p-5">
                  <TrendingUp className="w-6 h-6 text-green-400 mb-3" />
                  <p className="text-3xl font-bold text-white">{profile?.engagement_rate}%</p>
                  <p className="text-gray-400">Taux d'engagement</p>
                </div>
                <div className="card-service rounded-xl p-5">
                  <Award className="w-6 h-6 text-purple-400 mb-3" />
                  <p className="text-3xl font-bold text-white">{stats.total_collaborations || 0}</p>
                  <p className="text-gray-400">Collaborations</p>
                </div>
              </div>

              <div className="card-service rounded-xl p-6">
                <h2 className="text-lg font-semibold text-white mb-6">Évolution des abonnés</h2>
                <div className="h-64 flex items-end justify-between gap-1">
                  {[35, 42, 38, 55, 48, 62, 58, 72, 68, 85, 78, 92].map((value, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2">
                      <div 
                        className="w-full bg-gradient-to-t from-[#0047AB] to-[#0047AB]/50 rounded-t transition-all hover:from-[#D4AF37] hover:to-[#D4AF37]/50"
                        style={{ height: `${value}%` }}
                      />
                      <span className="text-xs text-gray-500">
                        {['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'][i]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Other tabs - placeholder */}
          {!['overview', 'profile', 'requests', 'stats'].includes(activeTab) && (
            <div className="card-service rounded-xl p-12 text-center">
              <Target className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl text-white mb-2">Section en développement</h3>
              <p className="text-gray-400">Cette fonctionnalité sera bientôt disponible</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default InfluencerDashboard;
