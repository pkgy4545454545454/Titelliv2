import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, User, Heart, ShoppingCart, CreditCard, Wallet, Calendar, 
  MessageSquare, FileText, Settings, Gift, Crown, TrendingUp, MapPin,
  ChevronRight, Star, Bell, Search, Rss, Newspaper, PieChart, Briefcase,
  GraduationCap, FolderOpen, Phone, Truck, Package, Users, HelpCircle, 
  Handshake, Info, Target, Building2, Menu, X
} from 'lucide-react';
import { orderAPI, cashbackAPI, featuredAPI } from '../services/api';
import { toast } from 'sonner';
import EnterpriseCard from '../components/EnterpriseCard';

const ClientDashboard = () => {
  const { user, isClient } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [orders, setOrders] = useState([]);
  const [cashback, setCashback] = useState(0);
  const [tendances, setTendances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!isClient) {
      navigate('/');
      return;
    }

    const fetchData = async () => {
      try {
        const [ordersRes, cashbackRes, tendancesRes] = await Promise.all([
          orderAPI.list(),
          cashbackAPI.balance(),
          featuredAPI.tendances()
        ]);
        setOrders(ordersRes.data);
        setCashback(cashbackRes.data.balance);
        setTendances(tendancesRes.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [isClient, navigate]);

  // Menu restructuré selon le cahier des charges
  const menuSections = [
    {
      title: 'Principal',
      items: [
        { id: 'overview', label: 'Accueil', icon: LayoutDashboard },
        { id: 'profile', label: 'Mon Profil', icon: User },
        { id: 'mode_vie', label: 'Mon mode de vie', icon: Heart },
        { id: 'feed', label: 'Mon fil d\'actualité', icon: Rss },
        { id: 'my_feed', label: 'Mon feed', icon: Newspaper },
      ]
    },
    {
      title: 'Avantages',
      items: [
        { id: 'cashback', label: 'Mon cash-back', icon: Wallet },
        { id: 'premium', label: 'Mon Premium', icon: Crown },
        { id: 'invitations', label: 'Mes invitations prestataires', icon: Gift },
        { id: 'offres', label: 'Mes offres du moment', icon: Target },
        { id: 'guests', label: 'Mes guests du moment', icon: Star },
        { id: 'tendances', label: 'Mes tendances actuelles', icon: TrendingUp },
        { id: 'cadeaux', label: 'Mes cadeaux du mois', icon: Gift },
      ]
    },
    {
      title: 'Investissements & Emplois',
      items: [
        { id: 'investments', label: 'Mes investissements', icon: PieChart },
        { id: 'business_news', label: 'Mon local business news', icon: Newspaper },
        { id: 'jobs', label: 'Mes emplois', icon: Briefcase },
        { id: 'formations', label: 'Mes formations', icon: GraduationCap },
      ]
    },
    {
      title: 'Gestion',
      items: [
        { id: 'agenda', label: 'Mon agenda', icon: Calendar },
        { id: 'cartes', label: 'Mes cartes', icon: CreditCard },
        { id: 'finances', label: 'Mes finances', icon: FileText },
        { id: 'donations', label: 'Mes donations', icon: Heart },
        { id: 'documents', label: 'Mes documents', icon: FolderOpen },
      ]
    },
    {
      title: 'Communication',
      items: [
        { id: 'messages', label: 'Messagerie', icon: MessageSquare },
        { id: 'contacts', label: 'Contacts', icon: Phone },
        { id: 'entrepreneur', label: 'Compte entrepreneur', icon: Building2 },
      ]
    },
    {
      title: 'Recommandations',
      items: [
        { id: 'suggestions', label: 'Suggestions de mes contacts', icon: Users },
        { id: 'prestataires', label: 'Mes prestataires personnels', icon: Star },
        { id: 'wishlist', label: 'Ma liste de souhaits', icon: Heart },
      ]
    },
    {
      title: 'Commandes',
      items: [
        { id: 'orders', label: 'Mes commandes', icon: ShoppingCart },
        { id: 'panier', label: 'Mon panier', icon: ShoppingCart },
        { id: 'livraisons', label: 'Livraison', icon: Truck },
      ]
    },
    {
      title: 'Aide & Informations',
      items: [
        { id: 'support', label: 'Service client', icon: HelpCircle },
        { id: 'partners', label: 'Partenaires', icon: Handshake },
        { id: 'about', label: 'À propos', icon: Info },
        { id: 'settings', label: 'Paramètres', icon: Settings },
      ]
    },
  ];

  const quickStats = [
    { label: 'Cash-back disponible', value: `${cashback.toFixed(2)} CHF`, icon: Wallet, color: 'text-green-500' },
    { label: 'Commandes', value: orders.length.toString(), icon: ShoppingCart, color: 'text-[#0047AB]' },
    { label: 'Favoris', value: '0', icon: Heart, color: 'text-red-500' },
    { label: 'Points fidélité', value: '0', icon: Star, color: 'text-[#D4AF37]' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] pt-24 flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-[#0047AB] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] pt-20" data-testid="client-dashboard">
      {/* Mobile Menu Button */}
      <button 
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="lg:hidden fixed bottom-6 right-6 z-50 w-14 h-14 bg-[#0047AB] rounded-full flex items-center justify-center shadow-lg"
      >
        {mobileMenuOpen ? <X className="w-6 h-6 text-white" /> : <Menu className="w-6 h-6 text-white" />}
      </button>

      <div className="flex">
        {/* Sidebar - Desktop & Mobile */}
        <aside className={`w-64 min-h-screen bg-[#0A0A0A] border-r border-white/5 fixed left-0 top-20 bottom-0 overflow-y-auto z-40 transition-transform duration-300 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
          <div className="p-4 hide-scrollbar">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-[#0047AB] flex items-center justify-center text-white font-bold text-sm">
                {user?.first_name?.[0]}{user?.last_name?.[0]}
              </div>
              <div>
                <p className="font-semibold text-white text-sm">{user?.first_name} {user?.last_name}</p>
                <p className="text-xs text-gray-500">Espace client</p>
              </div>
            </div>

            {/* Search Bar */}
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input 
                type="text" 
                placeholder="Rechercher..."
                className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-gray-500 focus:border-[#0047AB]/50 focus:outline-none"
              />
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
                            ? 'bg-[#0047AB]/20 text-[#0047AB]'
                            : 'text-gray-400 hover:bg-white/5 hover:text-white'
                        }`}
                        data-testid={`menu-${item.id}`}
                      >
                        <item.icon className="w-4 h-4" />
                        <span className="truncate">{item.label}</span>
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
          <div 
            className="lg:hidden fixed inset-0 bg-black/50 z-30"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 lg:ml-64 p-4 md:p-6 lg:p-8">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6 md:space-y-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
                    Bonjour, {user?.first_name} !
                  </h1>
                  <p className="text-gray-400 mt-1 text-sm md:text-base">Bienvenue sur votre espace Titelli</p>
                </div>
                <Link to="/" className="btn-primary flex items-center justify-center gap-2 text-sm md:text-base">
                  <Search className="w-4 h-4 md:w-5 md:h-5" />
                  Explorer
                </Link>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                {quickStats.map((stat, index) => (
                  <div key={index} className="card-service rounded-xl p-4 md:p-6">
                    <div className={`p-3 rounded-xl bg-white/5 w-fit mb-4 ${stat.color}`}>
                      <stat.icon className="w-5 h-5" />
                    </div>
                    <p className="text-2xl font-bold text-white">{stat.value}</p>
                    <p className="text-sm text-gray-400 mt-1">{stat.label}</p>
                  </div>
                ))}
              </div>

              {/* Premium CTA */}
              {!user?.is_premium && (
                <div className="card-service rounded-xl p-8 bg-gradient-to-r from-[#0047AB]/20 to-[#D4AF37]/20 border border-[#D4AF37]/30">
                  <div className="flex items-center gap-6">
                    <div className="p-4 rounded-2xl bg-gradient-to-br from-[#D4AF37] to-[#0047AB]">
                      <Crown className="w-8 h-8 text-white" />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-xl font-bold text-white mb-2">Passez à Premium</h2>
                      <p className="text-gray-400">Accédez à des offres exclusives, un service premium et bien plus encore.</p>
                    </div>
                    <button className="btn-primary" data-testid="upgrade-premium">
                      Découvrir
                    </button>
                  </div>
                </div>
              )}

              {/* Recent Orders */}
              <div className="card-service rounded-xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
                    Mes dernières commandes
                  </h2>
                  <button onClick={() => setActiveTab('orders')} className="text-[#0047AB] text-sm font-medium flex items-center gap-1">
                    Voir tout <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
                {orders.length > 0 ? (
                  <div className="space-y-4">
                    {orders.slice(0, 3).map((order) => (
                      <div key={order.id} className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                        <div>
                          <p className="text-white font-medium">Commande #{order.id.slice(0, 8)}</p>
                          <p className="text-sm text-gray-400">{new Date(order.created_at).toLocaleDateString('fr-FR')}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-white font-medium">{order.total?.toFixed(2)} CHF</p>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            order.status === 'completed' ? 'bg-green-500/20 text-green-500' :
                            order.status === 'pending' ? 'bg-yellow-500/20 text-yellow-500' :
                            'bg-gray-500/20 text-gray-500'
                          }`}>
                            {order.status === 'pending' ? 'En cours' : order.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">Aucune commande pour le moment</p>
                )}
              </div>

              {/* Recommendations */}
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
                    Tendances pour vous
                  </h2>
                  <Link to="/labellises" className="text-[#D4AF37] text-sm font-medium flex items-center gap-1">
                    Voir tout <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {tendances.slice(0, 3).map((enterprise) => (
                    <EnterpriseCard key={enterprise.id} enterprise={enterprise} />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="max-w-2xl">
              <h1 className="text-2xl font-bold text-white mb-8" style={{ fontFamily: 'Playfair Display, serif' }}>
                Mon Profil
              </h1>
              <div className="card-service rounded-xl p-8">
                <div className="flex items-center gap-6 mb-8">
                  <div className="w-20 h-20 rounded-full bg-[#0047AB] flex items-center justify-center text-white text-2xl font-bold">
                    {user?.first_name?.[0]}{user?.last_name?.[0]}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">{user?.first_name} {user?.last_name}</h2>
                    <p className="text-gray-400">{user?.email}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <MapPin className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-500">{user?.city || 'Lausanne'}</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between py-3 border-b border-white/10">
                    <span className="text-gray-400">Téléphone</span>
                    <span className="text-white">{user?.phone || 'Non renseigné'}</span>
                  </div>
                  <div className="flex justify-between py-3 border-b border-white/10">
                    <span className="text-gray-400">Compte Premium</span>
                    <span className={user?.is_premium ? 'text-[#D4AF37]' : 'text-gray-500'}>
                      {user?.is_premium ? 'Actif' : 'Inactif'}
                    </span>
                  </div>
                  <div className="flex justify-between py-3 border-b border-white/10">
                    <span className="text-gray-400">Cash-back disponible</span>
                    <span className="text-green-500">{cashback.toFixed(2)} CHF</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Orders Tab */}
          {activeTab === 'orders' && (
            <div>
              <h1 className="text-2xl font-bold text-white mb-8" style={{ fontFamily: 'Playfair Display, serif' }}>
                Mes commandes
              </h1>
              {orders.length > 0 ? (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div key={order.id} className="card-service rounded-xl p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <p className="text-white font-semibold">Commande #{order.id.slice(0, 8)}</p>
                          <p className="text-sm text-gray-400">{new Date(order.created_at).toLocaleDateString('fr-FR')}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          order.status === 'completed' ? 'bg-green-500/20 text-green-500' :
                          order.status === 'pending' ? 'bg-yellow-500/20 text-yellow-500' :
                          'bg-gray-500/20 text-gray-500'
                        }`}>
                          {order.status === 'pending' ? 'En cours' : order.status}
                        </span>
                      </div>
                      <div className="space-y-2 mb-4">
                        {order.items?.map((item, i) => (
                          <div key={i} className="flex justify-between text-sm">
                            <span className="text-gray-400">{item.name} x{item.quantity}</span>
                            <span className="text-white">{(item.price * item.quantity).toFixed(2)} CHF</span>
                          </div>
                        ))}
                      </div>
                      <div className="flex justify-between pt-4 border-t border-white/10">
                        <span className="text-gray-400">Total</span>
                        <span className="text-xl font-bold text-white">{order.total?.toFixed(2)} CHF</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="card-service rounded-xl p-12 text-center">
                  <ShoppingCart className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <h2 className="text-xl font-bold text-white mb-2">Aucune commande</h2>
                  <p className="text-gray-400 mb-6">Explorez nos prestataires et passez votre première commande</p>
                  <Link to="/" className="btn-primary">Explorer</Link>
                </div>
              )}
            </div>
          )}

          {/* Cashback Tab */}
          {activeTab === 'cashback' && (
            <div>
              <h1 className="text-2xl font-bold text-white mb-8" style={{ fontFamily: 'Playfair Display, serif' }}>
                Mon Cash-back
              </h1>
              <div className="card-service rounded-xl p-8 text-center">
                <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
                  <Wallet className="w-10 h-10 text-green-500" />
                </div>
                <p className="text-5xl font-bold text-white mb-2">{cashback.toFixed(2)} CHF</p>
                <p className="text-gray-400">Solde cash-back disponible</p>
                <div className="mt-8 pt-8 border-t border-white/10">
                  <p className="text-sm text-gray-500">
                    Gagnez du cash-back sur chaque achat chez nos prestataires partenaires !
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Mode de vie */}
          {activeTab === 'mode_vie' && (
            <div>
              <h1 className="text-2xl font-bold text-white mb-8" style={{ fontFamily: 'Playfair Display, serif' }}>
                Mon Mode de Vie
              </h1>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="card-service rounded-xl p-6">
                  <Heart className="w-8 h-8 text-red-500 mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-2">Mes Favoris</h3>
                  <p className="text-gray-400 text-sm mb-4">Retrouvez vos entreprises et services favoris</p>
                  <p className="text-3xl font-bold text-white">0</p>
                  <p className="text-gray-500 text-sm">favoris enregistrés</p>
                </div>
                <div className="card-service rounded-xl p-6">
                  <Star className="w-8 h-8 text-[#D4AF37] mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-2">Mes Avis</h3>
                  <p className="text-gray-400 text-sm mb-4">Consultez les avis que vous avez laissés</p>
                  <p className="text-3xl font-bold text-white">0</p>
                  <p className="text-gray-500 text-sm">avis publiés</p>
                </div>
              </div>
            </div>
          )}

          {/* Premium */}
          {activeTab === 'premium' && (
            <div>
              <h1 className="text-2xl font-bold text-white mb-8" style={{ fontFamily: 'Playfair Display, serif' }}>
                Titelli Premium
              </h1>
              <div className="card-service rounded-xl p-8 text-center border-2 border-[#D4AF37]/30">
                <Crown className="w-16 h-16 text-[#D4AF37] mx-auto mb-6" />
                <h2 className="text-2xl font-bold text-white mb-4">Passez à Premium</h2>
                <p className="text-gray-400 mb-8 max-w-lg mx-auto">
                  Profitez d'avantages exclusifs : cash-back doublé, accès prioritaire, offres spéciales et bien plus !
                </p>
                <ul className="text-left max-w-md mx-auto space-y-3 mb-8">
                  <li className="flex items-center gap-3 text-gray-300">
                    <div className="w-5 h-5 rounded-full bg-[#D4AF37]/20 flex items-center justify-center">
                      <span className="text-[#D4AF37] text-xs">✓</span>
                    </div>
                    Cash-back doublé sur tous vos achats
                  </li>
                  <li className="flex items-center gap-3 text-gray-300">
                    <div className="w-5 h-5 rounded-full bg-[#D4AF37]/20 flex items-center justify-center">
                      <span className="text-[#D4AF37] text-xs">✓</span>
                    </div>
                    Accès prioritaire aux nouvelles offres
                  </li>
                  <li className="flex items-center gap-3 text-gray-300">
                    <div className="w-5 h-5 rounded-full bg-[#D4AF37]/20 flex items-center justify-center">
                      <span className="text-[#D4AF37] text-xs">✓</span>
                    </div>
                    Réductions exclusives chez nos partenaires
                  </li>
                  <li className="flex items-center gap-3 text-gray-300">
                    <div className="w-5 h-5 rounded-full bg-[#D4AF37]/20 flex items-center justify-center">
                      <span className="text-[#D4AF37] text-xs">✓</span>
                    </div>
                    Support client prioritaire
                  </li>
                </ul>
                <button className="btn-primary bg-gradient-to-r from-[#D4AF37] to-[#B8860B] hover:from-[#B8860B] hover:to-[#D4AF37]">
                  S'abonner à Premium - 9.90 CHF/mois
                </button>
              </div>
            </div>
          )}

          {/* Agenda */}
          {activeTab === 'agenda' && (
            <div>
              <h1 className="text-2xl font-bold text-white mb-8" style={{ fontFamily: 'Playfair Display, serif' }}>
                Mon Agenda
              </h1>
              <div className="card-service rounded-xl p-8 text-center">
                <Calendar className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                <p className="text-gray-400 mb-4">Aucun rendez-vous à venir</p>
                <p className="text-sm text-gray-500">
                  Vos rendez-vous pris chez les prestataires apparaîtront ici
                </p>
              </div>
            </div>
          )}

          {/* Cartes */}
          {activeTab === 'cartes' && (
            <div>
              <h1 className="text-2xl font-bold text-white mb-8" style={{ fontFamily: 'Playfair Display, serif' }}>
                Mes Cartes de Paiement
              </h1>
              <div className="card-service rounded-xl p-8 text-center">
                <CreditCard className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                <p className="text-gray-400 mb-4">Aucune carte enregistrée</p>
                <button className="btn-secondary">
                  Ajouter une carte
                </button>
              </div>
            </div>
          )}

          {/* Finances */}
          {activeTab === 'finances' && (
            <div>
              <h1 className="text-2xl font-bold text-white mb-8" style={{ fontFamily: 'Playfair Display, serif' }}>
                Mes Finances
              </h1>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="card-service rounded-xl p-6 text-center">
                  <p className="text-gray-400 text-sm mb-2">Total dépensé</p>
                  <p className="text-2xl font-bold text-white">
                    {orders.reduce((sum, o) => sum + (o.total || 0), 0).toFixed(2)} CHF
                  </p>
                </div>
                <div className="card-service rounded-xl p-6 text-center">
                  <p className="text-gray-400 text-sm mb-2">Cash-back gagné</p>
                  <p className="text-2xl font-bold text-green-500">{cashback.toFixed(2)} CHF</p>
                </div>
                <div className="card-service rounded-xl p-6 text-center">
                  <p className="text-gray-400 text-sm mb-2">Économies totales</p>
                  <p className="text-2xl font-bold text-[#D4AF37]">{cashback.toFixed(2)} CHF</p>
                </div>
              </div>
              <div className="card-service rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Historique des transactions</h3>
                {orders.length > 0 ? (
                  <div className="space-y-3">
                    {orders.slice(0, 5).map((order) => (
                      <div key={order.id} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
                        <div>
                          <p className="text-white">{order.items?.length || 0} article(s)</p>
                          <p className="text-sm text-gray-500">{new Date(order.created_at).toLocaleDateString('fr-FR')}</p>
                        </div>
                        <p className="text-white font-medium">-{order.total?.toFixed(2)} CHF</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400 text-center py-8">Aucune transaction</p>
                )}
              </div>
            </div>
          )}

          {/* Messages */}
          {activeTab === 'messages' && (
            <div>
              <h1 className="text-2xl font-bold text-white mb-8" style={{ fontFamily: 'Playfair Display, serif' }}>
                Messagerie
              </h1>
              <div className="card-service rounded-xl p-8 text-center">
                <MessageSquare className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                <p className="text-gray-400 mb-4">Aucun message</p>
                <p className="text-sm text-gray-500">
                  Vos conversations avec les prestataires apparaîtront ici
                </p>
              </div>
            </div>
          )}

          {/* Settings */}
          {activeTab === 'settings' && (
            <div>
              <h1 className="text-2xl font-bold text-white mb-8" style={{ fontFamily: 'Playfair Display, serif' }}>
                Paramètres
              </h1>
              <div className="space-y-6">
                <div className="card-service rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Notifications</h3>
                  <div className="space-y-4">
                    <label className="flex items-center justify-between">
                      <span className="text-gray-400">Notifications par email</span>
                      <input type="checkbox" defaultChecked className="toggle" />
                    </label>
                    <label className="flex items-center justify-between">
                      <span className="text-gray-400">Notifications push</span>
                      <input type="checkbox" defaultChecked className="toggle" />
                    </label>
                    <label className="flex items-center justify-between">
                      <span className="text-gray-400">Offres promotionnelles</span>
                      <input type="checkbox" className="toggle" />
                    </label>
                  </div>
                </div>
                <div className="card-service rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Confidentialité</h3>
                  <div className="space-y-4">
                    <label className="flex items-center justify-between">
                      <span className="text-gray-400">Profil visible publiquement</span>
                      <input type="checkbox" className="toggle" />
                    </label>
                    <label className="flex items-center justify-between">
                      <span className="text-gray-400">Partager mes avis</span>
                      <input type="checkbox" defaultChecked className="toggle" />
                    </label>
                  </div>
                </div>
                <div className="card-service rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-4 text-red-500">Zone de danger</h3>
                  <button className="text-red-400 hover:text-red-300 text-sm">
                    Supprimer mon compte
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default ClientDashboard;
