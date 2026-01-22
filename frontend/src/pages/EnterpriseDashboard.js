import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, Building2, Package, ShoppingCart, Users, MessageSquare, 
  CreditCard, Settings, Bell, Plus, Edit, Trash2, Eye, Calendar, FileText, 
  Megaphone, ChevronRight, TrendingUp, DollarSign, Star, Gift, Briefcase,
  Home, PieChart, GraduationCap, Clock, CheckCircle, XCircle, Archive,
  FolderOpen, BookOpen, Wallet, Target, BarChart3, PlayCircle, Pause,
  UserPlus, ClipboardList, AlertTriangle, Box, ArrowUpDown, Upload, Image, X,
  Search, Rss, Newspaper, Truck, Activity, Phone, Heart, HelpCircle, Info,
  Handshake, UserCircle, Receipt, Send, Crown, Zap, Check, ChevronDown
} from 'lucide-react';
import { 
  enterpriseAPI, servicesProductsAPI, orderAPI, paymentAPI, offersAPI,
  trainingsAPI, jobsAPI, realEstateAPI, investmentsAPI, stockAPI,
  agendaAPI, teamAPI, permanentOrdersAPI, documentsAPI, financesAPI, advertisingAPI,
  uploadAPI
} from '../services/api';
import { toast } from 'sonner';
// Composants extraits pour réduire la taille du fichier
import { IAClientsSection, InfluencersSection, InvitationsSection, SubscriptionsSection } from '../components/dashboard';

const EnterpriseDashboard = () => {
  const { user, isEnterprise } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [enterprise, setEnterprise] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Data states
  const [services, setServices] = useState([]);
  const [orders, setOrders] = useState([]);
  const [offers, setOffers] = useState([]);
  const [trainings, setTrainings] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [realEstate, setRealEstate] = useState([]);
  const [investments, setInvestments] = useState([]);
  const [stock, setStock] = useState({ items: [], alerts: [] });
  const [agenda, setAgenda] = useState([]);
  const [team, setTeam] = useState([]);
  const [teamOrders, setTeamOrders] = useState([]);
  const [permanentOrders, setPermanentOrders] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [finances, setFinances] = useState({ transactions: [], summary: {} });
  const [advertising, setAdvertising] = useState({ campaigns: [], stats: {} });

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [editItem, setEditItem] = useState(null);

  useEffect(() => {
    if (!isEnterprise) {
      navigate('/');
      return;
    }
    fetchAllData();
  }, [isEnterprise, navigate, user]);

  const fetchAllData = async () => {
    try {
      // Get enterprise by listing all and finding by user_id
      const enterpriseRes = await enterpriseAPI.list({});
      if (enterpriseRes.data.enterprises.length > 0) {
        const ent = enterpriseRes.data.enterprises.find(e => e.user_id === user?.id);
        if (ent) {
          setEnterprise(ent);
          const servicesRes = await servicesProductsAPI.list({ enterprise_id: ent.id });
          setServices(servicesRes.data.items);
        }
      }
      
      // Fetch all data in parallel
      const [ordersRes, offersRes, trainingsRes, jobsRes, realEstateRes, 
             investmentsRes, stockRes, agendaRes, teamRes, teamOrdersRes,
             permanentOrdersRes, documentsRes, financesRes, advertisingRes] = await Promise.all([
        orderAPI.list().catch(() => ({ data: [] })),
        offersAPI.list().catch(() => ({ data: [] })),
        trainingsAPI.list().catch(() => ({ data: [] })),
        jobsAPI.list().catch(() => ({ data: [] })),
        realEstateAPI.list().catch(() => ({ data: [] })),
        investmentsAPI.list().catch(() => ({ data: [] })),
        stockAPI.list().catch(() => ({ data: { items: [], alerts: [] } })),
        agendaAPI.list().catch(() => ({ data: [] })),
        teamAPI.list().catch(() => ({ data: [] })),
        teamAPI.listOrders().catch(() => ({ data: [] })),
        permanentOrdersAPI.list().catch(() => ({ data: [] })),
        documentsAPI.list().catch(() => ({ data: [] })),
        financesAPI.get().catch(() => ({ data: { transactions: [], summary: {} } })),
        advertisingAPI.list().catch(() => ({ data: { campaigns: [], stats: {} } })),
      ]);

      setOrders(ordersRes.data || []);
      setOffers(offersRes.data || []);
      setTrainings(trainingsRes.data || []);
      setJobs(jobsRes.data || []);
      setRealEstate(realEstateRes.data || []);
      setInvestments(investmentsRes.data || []);
      setStock(stockRes.data || { items: [], alerts: [] });
      setAgenda(agendaRes.data || []);
      setTeam(teamRes.data || []);
      setTeamOrders(teamOrdersRes.data || []);
      setPermanentOrders(permanentOrdersRes.data || []);
      setDocuments(documentsRes.data || []);
      setFinances(financesRes.data || { transactions: [], summary: {} });
      setAdvertising(advertisingRes.data || { campaigns: [], stats: {} });
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Menu restructuré selon les besoins
  const menuSections = [
    {
      title: 'Principal',
      items: [
        { id: 'overview', label: 'Accueil', icon: LayoutDashboard },
        { id: 'profile', label: 'Profil entreprise', icon: Building2 },
        { id: 'feed', label: 'Mon fil d\'actualité', icon: Rss },
        { id: 'business_feed', label: 'Mon feed entreprises', icon: Newspaper },
      ]
    },
    {
      title: 'Commercial',
      items: [
        { id: 'services', label: 'Services & Produits', icon: Package },
        { id: 'orders', label: 'Mes commandes', icon: ShoppingCart },
        { id: 'deliveries', label: 'Mes livraisons', icon: Truck },
        { id: 'activities', label: 'Mes activités', icon: Activity },
        { id: 'stock', label: 'Gestion des stocks', icon: Box },
        { id: 'permanent', label: 'Commandes permanentes', icon: ClipboardList },
      ]
    },
    {
      title: 'Marketing',
      items: [
        { id: 'offers', label: 'Offres & Promotions', icon: Gift },
        { id: 'advertising', label: 'Mes publicités', icon: Megaphone },
        { id: 'commercial_gesture', label: 'Geste commercial', icon: Heart },
        { id: 'tendances', label: 'Tendances actuelles', icon: TrendingUp },
        { id: 'guests', label: 'Guests du moment', icon: Star },
      ]
    },
    {
      title: 'IA & Marketing',
      items: [
        { id: 'ia_clients', label: 'IA Ciblage clients', icon: Target },
        { id: 'influencers', label: 'Influenceurs', icon: Users },
        { id: 'invitations', label: 'Invitations clients', icon: Send },
      ]
    },
    {
      title: 'Ressources Humaines',
      items: [
        { id: 'team', label: 'Mon personnel', icon: Users },
        { id: 'jobs', label: 'Emplois & Stages', icon: Briefcase },
        { id: 'trainings', label: 'Formations', icon: GraduationCap },
      ]
    },
    {
      title: 'Finances & Investissements',
      items: [
        { id: 'finances', label: 'Mes finances', icon: Wallet },
        { id: 'cards', label: 'Mes cartes', icon: CreditCard },
        { id: 'investments', label: 'Mes investissements', icon: PieChart },
        { id: 'donations', label: 'Donations', icon: Heart },
      ]
    },
    {
      title: 'Actualités & Formation',
      items: [
        { id: 'business_news', label: 'Business News', icon: Newspaper },
        { id: 'development', label: 'Formations métier', icon: BookOpen },
      ]
    },
    {
      title: 'Communication',
      items: [
        { id: 'messages', label: 'Messagerie', icon: MessageSquare },
        { id: 'contacts', label: 'Contacts', icon: Phone },
        { id: 'agenda', label: 'Agenda', icon: Calendar },
      ]
    },
    {
      title: 'Documents & Paramètres',
      items: [
        { id: 'subscriptions', label: 'Abonnements', icon: Crown },
        { id: 'documents', label: 'Documents', icon: FolderOpen },
        { id: 'realestate', label: 'Immobilier', icon: Home },
        { id: 'settings', label: 'Paramètres', icon: Settings },
      ]
    },
    {
      title: 'Aide & Informations',
      items: [
        { id: 'support', label: 'Service client', icon: HelpCircle },
        { id: 'partners', label: 'Partenaires', icon: Handshake },
        { id: 'about', label: 'À propos', icon: Info },
      ]
    },
  ];

  // Flatten menu items for easy lookup
  const menuItems = menuSections.flatMap(section => section.items);

  const stats = [
    { label: 'Vues ce mois', value: '1,234', icon: Eye, trend: '+12%', color: 'text-[#0047AB]' },
    { label: 'Commandes', value: orders.length.toString(), icon: ShoppingCart, trend: '+5%', color: 'text-green-500' },
    { label: 'Revenus', value: `${finances.summary.total_income?.toFixed(0) || 0} CHF`, icon: DollarSign, trend: '+18%', color: 'text-[#D4AF37]' },
    { label: 'Note moyenne', value: enterprise?.rating?.toFixed(1) || '0.0', icon: Star, trend: '+0.2', color: 'text-yellow-500' },
  ];

  const openModal = (type, item = null) => {
    setModalType(type);
    setEditItem(item);
    setShowModal(true);
  };

  const handleSubscribe = async (plan) => {
    try {
      const response = await paymentAPI.createCheckout(plan);
      window.location.href = response.data.url;
    } catch (error) {
      toast.error('Erreur lors de la création du paiement');
    }
  };

  // Generic delete handler
  const handleDelete = async (type, id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet élément ?')) return;
    
    try {
      switch(type) {
        case 'offer': await offersAPI.delete(id); setOffers(offers.filter(o => o.id !== id)); break;
        case 'training': await trainingsAPI.delete(id); setTrainings(trainings.filter(t => t.id !== id)); break;
        case 'job': await jobsAPI.delete(id); setJobs(jobs.filter(j => j.id !== id)); break;
        case 'realestate': await realEstateAPI.delete(id); setRealEstate(realEstate.filter(r => r.id !== id)); break;
        case 'investment': await investmentsAPI.delete(id); setInvestments(investments.filter(i => i.id !== id)); break;
        case 'team': await teamAPI.delete(id); setTeam(team.filter(t => t.id !== id)); break;
        case 'permanent': await permanentOrdersAPI.delete(id); setPermanentOrders(permanentOrders.filter(p => p.id !== id)); break;
        case 'document': await documentsAPI.delete(id); setDocuments(documents.filter(d => d.id !== id)); break;
        case 'advertising': await advertisingAPI.delete(id); fetchAllData(); break;
        case 'service': await servicesProductsAPI.delete(id); setServices(services.filter(s => s.id !== id)); break;
        default: break;
      }
      toast.success('Supprimé avec succès');
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] pt-24 flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-[#0047AB] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] pt-20" data-testid="enterprise-dashboard">
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-72 min-h-screen bg-[#0A0A0A] border-r border-white/5 fixed left-0 top-20 bottom-0 overflow-y-auto hidden lg:block">
          <div className="p-4">
            {/* Enterprise Header */}
            <div className="flex items-center gap-3 mb-4 pb-4 border-b border-white/10">
              <div className="w-10 h-10 rounded-xl bg-[#0047AB]/20 flex items-center justify-center overflow-hidden">
                {enterprise?.logo ? (
                  <img src={enterprise.logo} alt="" className="w-full h-full object-cover" />
                ) : (
                  <Building2 className="w-5 h-5 text-[#0047AB]" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-white text-sm truncate">
                  {enterprise?.business_name || 'Mon Entreprise'}
                </p>
                <p className="text-xs text-gray-500">Espace entreprise</p>
              </div>
            </div>

            {/* Search Bar */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input 
                type="text" 
                placeholder="Rechercher..." 
                className="w-full pl-9 pr-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-[#0047AB]/50"
              />
            </div>

            {/* Menu Sections */}
            <nav className="space-y-4">
              {menuSections.map((section) => (
                <div key={section.title}>
                  <p className="text-xs text-gray-500 uppercase tracking-wider px-3 mb-2">{section.title}</p>
                  <div className="space-y-0.5">
                    {section.items.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${
                          activeTab === item.id
                            ? 'bg-[#0047AB]/20 text-[#0047AB]'
                            : 'text-gray-400 hover:bg-white/5 hover:text-white'
                        }`}
                      >
                        <item.icon className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate">{item.label}</span>
                        {item.id === 'stock' && stock.alerts.length > 0 && (
                          <span className="ml-auto w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center flex-shrink-0">
                            {stock.alerts.length}
                          </span>
                        )}
                        {item.id === 'orders' && orders.filter(o => o.status === 'pending').length > 0 && (
                          <span className="ml-auto w-5 h-5 bg-orange-500 text-white text-xs rounded-full flex items-center justify-center flex-shrink-0">
                            {orders.filter(o => o.status === 'pending').length}
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

        {/* Main Content */}
        <main className="flex-1 lg:ml-72 p-4 md:p-8">
          {/* Mobile Menu */}
          <div className="lg:hidden mb-6 overflow-x-auto">
            <div className="flex gap-2 pb-2">
              {menuItems.slice(0, 8).map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm whitespace-nowrap ${
                    activeTab === item.id
                      ? 'bg-[#0047AB] text-white'
                      : 'bg-white/5 text-gray-400'
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
                Tableau de bord
              </h1>

              {!enterprise && (
                <div className="card-service rounded-xl p-6 border-[#D4AF37] text-center">
                  <Building2 className="w-12 h-12 text-[#D4AF37] mx-auto mb-4" />
                  <h2 className="text-xl font-semibold text-white mb-2">Créez votre profil entreprise</h2>
                  <p className="text-gray-400 mb-4">Pour accéder à toutes les fonctionnalités</p>
                  <button onClick={() => setActiveTab('profile')} className="btn-primary">
                    Créer mon profil
                  </button>
                </div>
              )}

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {stats.map((stat, index) => (
                  <div key={index} className="card-service rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <stat.icon className={`w-5 h-5 ${stat.color}`} />
                      <span className="text-xs text-green-400">{stat.trend}</span>
                    </div>
                    <p className="text-2xl font-bold text-white">{stat.value}</p>
                    <p className="text-xs text-gray-400">{stat.label}</p>
                  </div>
                ))}
              </div>

              {/* Alerts */}
              {stock.alerts.length > 0 && (
                <div className="card-service rounded-xl p-4 border-red-500/50">
                  <div className="flex items-center gap-2 text-red-400 mb-2">
                    <AlertTriangle className="w-5 h-5" />
                    <span className="font-semibold">Alertes Stock</span>
                  </div>
                  <p className="text-gray-400 text-sm">{stock.alerts.length} produit(s) en stock faible</p>
                </div>
              )}

              {/* Quick Actions */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <button onClick={() => { setActiveTab('services'); openModal('service'); }} className="card-service rounded-xl p-4 hover:border-[#0047AB]/50 transition-colors text-left">
                  <Package className="w-8 h-8 text-[#0047AB] mb-2" />
                  <p className="text-white font-medium">Ajouter service</p>
                </button>
                <button onClick={() => { setActiveTab('offers'); openModal('offer'); }} className="card-service rounded-xl p-4 hover:border-[#D4AF37]/50 transition-colors text-left">
                  <Gift className="w-8 h-8 text-[#D4AF37] mb-2" />
                  <p className="text-white font-medium">Créer offre</p>
                </button>
                <button onClick={() => { setActiveTab('jobs'); openModal('job'); }} className="card-service rounded-xl p-4 hover:border-green-500/50 transition-colors text-left">
                  <Briefcase className="w-8 h-8 text-green-500 mb-2" />
                  <p className="text-white font-medium">Publier emploi</p>
                </button>
                <button onClick={() => setActiveTab('agenda')} className="card-service rounded-xl p-4 hover:border-purple-500/50 transition-colors text-left">
                  <Calendar className="w-8 h-8 text-purple-500 mb-2" />
                  <p className="text-white font-medium">Voir agenda</p>
                </button>
              </div>

              {/* Recent Orders */}
              <div className="card-service rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-white">Dernières commandes</h2>
                  <button onClick={() => setActiveTab('orders')} className="text-[#0047AB] text-sm hover:underline">
                    Voir tout
                  </button>
                </div>
                {orders.length > 0 ? (
                  <div className="space-y-3">
                    {orders.slice(0, 5).map((order) => (
                      <div key={order.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                        <div>
                          <p className="text-white font-medium">#{order.id.slice(0, 8)}</p>
                          <p className="text-xs text-gray-400">{order.items?.length || 0} article(s)</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[#D4AF37] font-semibold">{order.total?.toFixed(2)} CHF</p>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            order.status === 'completed' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                          }`}>
                            {order.status === 'completed' ? 'Terminée' : 'En cours'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400 text-center py-8">Aucune commande</p>
                )}
              </div>
            </div>
          )}

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <ProfileSection enterprise={enterprise} onUpdate={() => fetchAllData()} />
          )}

          {/* Services Tab */}
          {activeTab === 'services' && (
            <ServicesSection services={services} onAdd={() => openModal('service')} onDelete={(id) => handleDelete('service', id)} onRefresh={fetchAllData} />
          )}

          {/* Orders Tab */}
          {activeTab === 'orders' && (
            <OrdersSection orders={orders} onRefresh={fetchAllData} />
          )}

          {/* Offers Tab */}
          {activeTab === 'offers' && (
            <GenericSection
              title="Offres & Promotions"
              icon={Gift}
              items={offers}
              onAdd={() => openModal('offer')}
              onDelete={(id) => handleDelete('offer', id)}
              emptyText="Aucune offre créée"
              renderItem={(item) => (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">{item.title}</p>
                    <p className="text-sm text-gray-400">{item.discount_value}% de réduction</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs ${item.is_active ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>
                    {item.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              )}
            />
          )}

          {/* Trainings Tab */}
          {activeTab === 'trainings' && (
            <GenericSection
              title="Formations"
              icon={GraduationCap}
              items={trainings}
              onAdd={() => openModal('training')}
              onDelete={(id) => handleDelete('training', id)}
              emptyText="Aucune formation proposée"
              renderItem={(item) => (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">{item.title}</p>
                    <p className="text-sm text-gray-400">{item.duration} • {item.is_online ? 'En ligne' : 'Présentiel'}</p>
                  </div>
                  <p className="text-[#D4AF37] font-semibold">{item.price} CHF</p>
                </div>
              )}
            />
          )}

          {/* Jobs Tab */}
          {activeTab === 'jobs' && (
            <GenericSection
              title="Offres d'emploi"
              icon={Briefcase}
              items={jobs}
              onAdd={() => openModal('job')}
              onDelete={(id) => handleDelete('job', id)}
              emptyText="Aucune offre d'emploi"
              renderItem={(item) => (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">{item.title}</p>
                    <p className="text-sm text-gray-400">{item.location} • {item.job_type}</p>
                  </div>
                  {item.salary_min && <p className="text-green-400">{item.salary_min} - {item.salary_max} CHF</p>}
                </div>
              )}
            />
          )}

          {/* Real Estate Tab */}
          {activeTab === 'realestate' && (
            <GenericSection
              title="Immobilier"
              icon={Home}
              items={realEstate}
              onAdd={() => openModal('realestate')}
              onDelete={(id) => handleDelete('realestate', id)}
              emptyText="Aucun bien immobilier"
              renderItem={(item) => (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">{item.title}</p>
                    <p className="text-sm text-gray-400">{item.surface} m² • {item.city}</p>
                  </div>
                  <p className="text-[#D4AF37] font-semibold">{item.price} CHF/{item.price_period}</p>
                </div>
              )}
            />
          )}

          {/* Investments Tab */}
          {activeTab === 'investments' && (
            <GenericSection
              title="Investissements"
              icon={PieChart}
              items={investments}
              onAdd={() => openModal('investment')}
              onDelete={(id) => handleDelete('investment', id)}
              emptyText="Aucune opportunité d'investissement"
              renderItem={(item) => (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">{item.title}</p>
                    <p className="text-sm text-gray-400">Min: {item.min_investment} CHF • {item.expected_return}% retour</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    item.risk_level === 'low' ? 'bg-green-500/20 text-green-400' :
                    item.risk_level === 'medium' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'
                  }`}>
                    Risque {item.risk_level}
                  </span>
                </div>
              )}
            />
          )}

          {/* Stock Tab */}
          {activeTab === 'stock' && (
            <StockSection stock={stock} services={services} onRefresh={fetchAllData} />
          )}

          {/* Agenda Tab */}
          {activeTab === 'agenda' && (
            <AgendaSection agenda={agenda} onRefresh={fetchAllData} />
          )}

          {/* Team Tab */}
          {activeTab === 'team' && (
            <TeamSection team={team} teamOrders={teamOrders} onDelete={(id) => handleDelete('team', id)} onRefresh={fetchAllData} />
          )}

          {/* Permanent Orders Tab */}
          {activeTab === 'permanent' && (
            <GenericSection
              title="Commandes permanentes"
              icon={ClipboardList}
              items={permanentOrders}
              onAdd={() => openModal('permanent')}
              onDelete={(id) => handleDelete('permanent', id)}
              emptyText="Aucune commande permanente"
              renderItem={(item) => (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">{item.client_name}</p>
                    <p className="text-sm text-gray-400">{item.frequency} • {item.items?.length || 0} article(s)</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-[#D4AF37] font-semibold">{item.total} CHF</p>
                    <span className={`px-2 py-1 rounded-full text-xs ${item.is_active ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>
                      {item.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              )}
            />
          )}

          {/* Documents Tab */}
          {activeTab === 'documents' && (
            <DocumentsSection documents={documents} onDelete={(id) => handleDelete('document', id)} onRefresh={fetchAllData} />
          )}

          {/* Development Tab */}
          {activeTab === 'development' && (
            <DevelopmentSection />
          )}

          {/* Finances Tab */}
          {activeTab === 'finances' && (
            <FinancesSection finances={finances} onRefresh={fetchAllData} />
          )}

          {/* Advertising Tab */}
          {activeTab === 'advertising' && (
            <AdvertisingSection advertising={advertising} onDelete={(id) => handleDelete('advertising', id)} onRefresh={fetchAllData} />
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
                Paramètres
              </h1>
              
              <div className="card-service rounded-xl p-6">
                <h2 className="text-lg font-semibold text-white mb-4">Abonnement</h2>
                <p className="text-gray-400 mb-4">Gérez votre abonnement et vos options</p>
                <button 
                  onClick={() => setActiveTab('subscriptions')} 
                  className="btn-primary flex items-center gap-2"
                >
                  <Crown className="w-4 h-4" />
                  Gérer mon abonnement
                </button>
              </div>

              <div className="card-service rounded-xl p-6">
                <h2 className="text-lg font-semibold text-white mb-4">Notifications</h2>
                <div className="space-y-3">
                  <label className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <span className="text-gray-300">Notifications par email</span>
                    <input type="checkbox" defaultChecked className="w-5 h-5 accent-[#0047AB]" />
                  </label>
                  <label className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <span className="text-gray-300">Notifications push</span>
                    <input type="checkbox" defaultChecked className="w-5 h-5 accent-[#0047AB]" />
                  </label>
                  <label className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <span className="text-gray-300">Résumé hebdomadaire</span>
                    <input type="checkbox" className="w-5 h-5 accent-[#0047AB]" />
                  </label>
                </div>
              </div>

              <div className="card-service rounded-xl p-6">
                <h2 className="text-lg font-semibold text-white mb-4">Sécurité</h2>
                <div className="space-y-4">
                  <button className="w-full p-3 bg-white/5 rounded-lg text-left hover:bg-white/10 transition-colors">
                    <p className="text-white font-medium">Changer le mot de passe</p>
                    <p className="text-sm text-gray-400">Sécurisez votre compte</p>
                  </button>
                  <button className="w-full p-3 bg-white/5 rounded-lg text-left hover:bg-white/10 transition-colors">
                    <p className="text-white font-medium">Authentification à deux facteurs</p>
                    <p className="text-sm text-gray-400">Ajouter une couche de sécurité</p>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Fil d'actualité - Avis clients */}
          {activeTab === 'feed' && (
            <div className="space-y-6">
              <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
                Mon fil d'actualité
              </h1>
              <p className="text-gray-400">Les expériences partagées par vos clients</p>
              <div className="card-service rounded-xl p-8 text-center">
                <Rss className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                <p className="text-gray-400 mb-2">Aucune publication récente</p>
                <p className="text-sm text-gray-500">Les avis et partages de vos clients apparaîtront ici</p>
              </div>
            </div>
          )}

          {/* Feed entreprises */}
          {activeTab === 'business_feed' && (
            <div className="space-y-6">
              <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
                Mon feed entreprises
              </h1>
              <p className="text-gray-400">Actualités et partages des autres entreprises</p>
              <div className="card-service rounded-xl p-8 text-center">
                <Newspaper className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                <p className="text-gray-400 mb-2">Aucune publication</p>
                <p className="text-sm text-gray-500">Suivez d'autres entreprises pour voir leur actualité</p>
              </div>
            </div>
          )}

          {/* Livraisons */}
          {activeTab === 'deliveries' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
                  Mes livraisons
                </h1>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="card-service rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-white">{orders.filter(o => o.status === 'pending').length}</p>
                  <p className="text-sm text-gray-400">En attente</p>
                </div>
                <div className="card-service rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-orange-500">{orders.filter(o => o.status === 'confirmed').length}</p>
                  <p className="text-sm text-gray-400">En cours</p>
                </div>
                <div className="card-service rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-green-500">{orders.filter(o => o.status === 'completed').length}</p>
                  <p className="text-sm text-gray-400">Livrées</p>
                </div>
                <div className="card-service rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-red-500">{orders.filter(o => o.status === 'cancelled').length}</p>
                  <p className="text-sm text-gray-400">Annulées</p>
                </div>
              </div>
              {orders.filter(o => o.items?.some(i => i.is_delivery)).length === 0 ? (
                <div className="card-service rounded-xl p-8 text-center">
                  <Truck className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-400">Aucune livraison en cours</p>
                </div>
              ) : (
                <div className="card-service rounded-xl divide-y divide-white/5">
                  {orders.filter(o => o.items?.some(i => i.is_delivery)).map((order) => (
                    <div key={order.id} className="p-4 flex items-center justify-between">
                      <div>
                        <p className="text-white font-medium">#{order.id.slice(0, 8)}</p>
                        <p className="text-sm text-gray-400">{order.delivery_address || 'Adresse non spécifiée'}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs ${order.status === 'completed' ? 'bg-green-500/20 text-green-400' : 'bg-orange-500/20 text-orange-400'}`}>
                        {order.status === 'pending' ? 'En attente' : order.status === 'confirmed' ? 'En cours' : order.status === 'completed' ? 'Livré' : 'Annulé'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Activités */}
          {activeTab === 'activities' && (
            <div className="space-y-6">
              <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
                Mes activités
              </h1>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="card-service rounded-xl p-4">
                  <Activity className="w-6 h-6 text-green-500 mb-2" />
                  <p className="text-2xl font-bold text-white">{orders.filter(o => o.status === 'completed').length}</p>
                  <p className="text-sm text-gray-400">Ventes terminées</p>
                </div>
                <div className="card-service rounded-xl p-4">
                  <Clock className="w-6 h-6 text-orange-500 mb-2" />
                  <p className="text-2xl font-bold text-white">{orders.filter(o => o.status === 'confirmed').length}</p>
                  <p className="text-sm text-gray-400">En cours</p>
                </div>
                <div className="card-service rounded-xl p-4">
                  <AlertTriangle className="w-6 h-6 text-yellow-500 mb-2" />
                  <p className="text-2xl font-bold text-white">{orders.filter(o => o.status === 'pending').length}</p>
                  <p className="text-sm text-gray-400">En attente</p>
                </div>
                <div className="card-service rounded-xl p-4">
                  <ClipboardList className="w-6 h-6 text-[#0047AB] mb-2" />
                  <p className="text-2xl font-bold text-white">{permanentOrders.length}</p>
                  <p className="text-sm text-gray-400">Permanentes</p>
                </div>
              </div>
              <div className="card-service rounded-xl p-6">
                <h2 className="text-lg font-semibold text-white mb-4">Activité récente</h2>
                {orders.length > 0 ? (
                  <div className="space-y-3">
                    {orders.slice(0, 10).map((order) => (
                      <div key={order.id} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                        <div className="flex items-center gap-3">
                          <div className={`w-2 h-2 rounded-full ${order.status === 'completed' ? 'bg-green-500' : order.status === 'pending' ? 'bg-yellow-500' : 'bg-orange-500'}`} />
                          <div>
                            <p className="text-white text-sm">{order.items?.length || 0} article(s) - {order.total?.toFixed(2)} CHF</p>
                            <p className="text-xs text-gray-500">{new Date(order.created_at).toLocaleDateString('fr-FR')}</p>
                          </div>
                        </div>
                        <span className="text-sm text-gray-400 capitalize">{order.status}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400 text-center py-4">Aucune activité récente</p>
                )}
              </div>
            </div>
          )}

          {/* Geste commercial */}
          {activeTab === 'commercial_gesture' && (
            <div className="space-y-6">
              <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
                Geste commercial
              </h1>
              <p className="text-gray-400">Offrez un geste commercial à vos nouveaux clients pour les fidéliser</p>
              <div className="card-service rounded-xl p-6">
                <h2 className="text-lg font-semibold text-white mb-4">Créer une offre de bienvenue</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Type d'offre</label>
                    <select className="input-dark w-full">
                      <option>Réduction en pourcentage</option>
                      <option>Montant fixe offert</option>
                      <option>Service gratuit</option>
                      <option>Produit offert</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Valeur</label>
                    <input type="number" placeholder="Ex: 10" className="input-dark w-full" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Conditions</label>
                    <textarea placeholder="Ex: Valable pour la première commande" className="input-dark w-full" rows={3} />
                  </div>
                  <button className="btn-primary">
                    <Gift className="w-4 h-4 mr-2" />
                    Créer le geste commercial
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Tendances */}
          {activeTab === 'tendances' && (
            <div className="space-y-6">
              <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
                Tendances actuelles
              </h1>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {['Bien-être', 'Éco-responsable', 'Digital', 'Local', 'Premium'].map((trend, i) => (
                  <div key={i} className="card-service rounded-xl p-6">
                    <TrendingUp className="w-8 h-8 text-[#0047AB] mb-3" />
                    <h3 className="text-white font-semibold mb-2">{trend}</h3>
                    <p className="text-sm text-gray-400">Tendance forte dans votre secteur</p>
                    <div className="mt-4 flex items-center gap-2">
                      <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-[#0047AB]" style={{ width: `${70 + i * 5}%` }} />
                      </div>
                      <span className="text-sm text-[#0047AB]">{70 + i * 5}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Guests du moment */}
          {activeTab === 'guests' && (
            <div className="space-y-6">
              <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
                Guests du moment
              </h1>
              <p className="text-gray-400">Les entreprises et personnalités mises en avant ce mois-ci</p>
              <div className="card-service rounded-xl p-8 text-center">
                <Star className="w-12 h-12 text-[#D4AF37] mx-auto mb-4" />
                <p className="text-gray-400 mb-2">Bientôt disponible</p>
                <p className="text-sm text-gray-500">Découvrez les guests du moment prochainement</p>
              </div>
            </div>
          )}

          {/* IA Ciblage Clients */}
          {activeTab === 'ia_clients' && (
            <IAClientsSection />
          )}

          {/* Influenceurs */}
          {activeTab === 'influencers' && (
            <InfluencersSection />
          )}

          {/* Invitations Clients */}
          {activeTab === 'invitations' && (
            <InvitationsSection />
          )}

          {/* Cartes de paiement */}
          {activeTab === 'cards' && (
            <div className="space-y-6">
              <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
                Mes cartes
              </h1>
              <div className="card-service rounded-xl p-8 text-center">
                <CreditCard className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                <p className="text-gray-400 mb-4">Aucune carte de paiement enregistrée</p>
                <button className="btn-secondary">
                  <Plus className="w-4 h-4 mr-2" />
                  Ajouter une carte
                </button>
              </div>
            </div>
          )}

          {/* Donations */}
          {activeTab === 'donations' && (
            <div className="space-y-6">
              <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
                Donations
              </h1>
              <p className="text-gray-400">Gérez vos dons et contributions caritatives</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="card-service rounded-xl p-6">
                  <Heart className="w-8 h-8 text-red-500 mb-3" />
                  <h3 className="text-white font-semibold mb-2">Faire un don</h3>
                  <p className="text-sm text-gray-400 mb-4">Soutenez une cause qui vous tient à cœur</p>
                  <button className="btn-secondary w-full">Faire un don</button>
                </div>
                <div className="card-service rounded-xl p-6">
                  <FileText className="w-8 h-8 text-[#0047AB] mb-3" />
                  <h3 className="text-white font-semibold mb-2">Historique</h3>
                  <p className="text-sm text-gray-400 mb-4">Consultez vos donations passées</p>
                  <p className="text-2xl font-bold text-white">0 CHF</p>
                  <p className="text-xs text-gray-500">Total des dons</p>
                </div>
              </div>
            </div>
          )}

          {/* Business News */}
          {activeTab === 'business_news' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
                  Business News
                </h1>
                <div className="flex gap-2">
                  <select className="input-dark text-sm px-3 py-1">
                    <option>Tous les secteurs</option>
                    <option>Mon secteur</option>
                    <option>Finance</option>
                    <option>Marketing</option>
                    <option>Technologie</option>
                  </select>
                </div>
              </div>
              <div className="space-y-4">
                {[
                  { title: 'Les nouvelles tendances du commerce local', category: 'Commerce', date: 'Aujourd\'hui' },
                  { title: 'Comment optimiser sa présence en ligne', category: 'Digital', date: 'Hier' },
                  { title: 'Les aides aux entreprises en 2026', category: 'Finance', date: 'Il y a 2 jours' },
                ].map((news, i) => (
                  <div key={i} className="card-service rounded-xl p-4 flex items-start gap-4">
                    <div className="w-16 h-16 bg-[#0047AB]/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Newspaper className="w-8 h-8 text-[#0047AB]" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-white font-medium mb-1">{news.title}</h3>
                      <div className="flex items-center gap-3 text-sm">
                        <span className="text-[#0047AB]">{news.category}</span>
                        <span className="text-gray-500">{news.date}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Messagerie */}
          {activeTab === 'messages' && (
            <div className="space-y-6">
              <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
                Messagerie
              </h1>
              <div className="card-service rounded-xl p-8 text-center">
                <MessageSquare className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                <p className="text-gray-400 mb-2">Aucun message</p>
                <p className="text-sm text-gray-500">Vos conversations avec les clients apparaîtront ici</p>
              </div>
            </div>
          )}

          {/* Contacts */}
          {activeTab === 'contacts' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
                  Contacts
                </h1>
                <button className="btn-primary">
                  <Plus className="w-4 h-4 mr-2" />
                  Ajouter
                </button>
              </div>
              <div className="card-service rounded-xl p-8 text-center">
                <Phone className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                <p className="text-gray-400 mb-2">Aucun contact enregistré</p>
                <p className="text-sm text-gray-500">Ajoutez vos fournisseurs, partenaires et clients importants</p>
              </div>
            </div>
          )}

          {/* Support */}
          {activeTab === 'support' && (
            <div className="space-y-6">
              <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
                Service client
              </h1>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="card-service rounded-xl p-6">
                  <MessageSquare className="w-8 h-8 text-[#0047AB] mb-3" />
                  <h3 className="text-white font-semibold mb-2">Chat en direct</h3>
                  <p className="text-sm text-gray-400 mb-4">Discutez avec notre équipe support</p>
                  <button className="btn-primary w-full">Démarrer un chat</button>
                </div>
                <div className="card-service rounded-xl p-6">
                  <Phone className="w-8 h-8 text-green-500 mb-3" />
                  <h3 className="text-white font-semibold mb-2">Nous appeler</h3>
                  <p className="text-sm text-gray-400 mb-4">Du lundi au vendredi, 9h-18h</p>
                  <p className="text-lg font-medium text-white">+41 21 123 45 67</p>
                </div>
              </div>
              <div className="card-service rounded-xl p-6">
                <h3 className="text-white font-semibold mb-4">Questions fréquentes</h3>
                <div className="space-y-3">
                  {['Comment modifier mon profil ?', 'Comment gérer mes commandes ?', 'Comment recevoir mes paiements ?'].map((q, i) => (
                    <div key={i} className="p-3 bg-white/5 rounded-lg hover:bg-white/10 cursor-pointer transition-colors">
                      <p className="text-gray-300">{q}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Partenaires */}
          {activeTab === 'partners' && (
            <div className="space-y-6">
              <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
                Partenaires
              </h1>
              <div className="card-service rounded-xl p-6">
                <h2 className="text-lg font-semibold text-white mb-4">Nos partenaires</h2>
                <p className="text-gray-400 mb-6">Découvrez les entreprises partenaires de Titelli</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="aspect-video bg-white/5 rounded-lg flex items-center justify-center">
                      <Handshake className="w-8 h-8 text-gray-500" />
                    </div>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link to="/mentions-legales" className="card-service rounded-xl p-4 flex items-center gap-3 hover:bg-white/10 transition-colors">
                  <FileText className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-300">Mentions légales</span>
                </Link>
                <Link to="/cgv" className="card-service rounded-xl p-4 flex items-center gap-3 hover:bg-white/10 transition-colors">
                  <FileText className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-300">CGV</span>
                </Link>
              </div>
            </div>
          )}

          {/* À propos */}
          {activeTab === 'about' && (
            <div className="space-y-6">
              <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
                À propos
              </h1>
              <div className="card-service rounded-xl p-6">
                <h2 className="text-lg font-semibold text-white mb-4">Titelli</h2>
                <p className="text-gray-400 mb-4">
                  Titelli est la marketplace de référence pour les prestataires de services et commerces locaux de la région lausannoise.
                </p>
                <p className="text-gray-400 mb-6">
                  Notre mission : connecter les entreprises locales avec leur communauté et faciliter le commerce de proximité.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Link to="/conditions-generales" className="card-service rounded-xl p-4 flex items-center gap-3 hover:bg-white/10 transition-colors">
                    <FileText className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-300">Conditions générales</span>
                  </Link>
                  <Link to="/politique-confidentialite" className="card-service rounded-xl p-4 flex items-center gap-3 hover:bg-white/10 transition-colors">
                    <FileText className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-300">Politique de confidentialité</span>
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Subscriptions Tab */}
          {activeTab === 'subscriptions' && (
            <SubscriptionsSection />
          )}
        </main>
      </div>

      {/* Modal */}
      {showModal && (
        <FormModal type={modalType} item={editItem} onClose={() => setShowModal(false)} onSuccess={() => { setShowModal(false); fetchAllData(); }} />
      )}
    </div>
  );
};

// Profile Section Component
const ProfileSection = ({ enterprise, onUpdate }) => {
  const [formData, setFormData] = useState({
    business_name: enterprise?.business_name || '',
    slogan: enterprise?.slogan || '',
    description: enterprise?.description || '',
    phone: enterprise?.phone || '',
    email: enterprise?.email || '',
    address: enterprise?.address || '',
    city: enterprise?.city || 'Lausanne',
    website: enterprise?.website || '',
    category: enterprise?.category || '',
    logo: enterprise?.logo || '',
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [logoPreview, setLogoPreview] = useState(enterprise?.logo || null);
  const logoInputRef = useRef(null);

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Type de fichier non autorisé. Utilisez JPG, PNG, GIF ou WEBP.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Fichier trop volumineux (max 5MB)');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setLogoPreview(reader.result);
    };
    reader.readAsDataURL(file);

    setUploading(true);
    try {
      const response = await uploadAPI.uploadImage(file);
      const logoUrl = process.env.REACT_APP_BACKEND_URL + response.data.url;
      setFormData(prev => ({ ...prev, logo: logoUrl }));
      toast.success('Logo uploadé !');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Erreur lors de l\'upload du logo');
      setLogoPreview(enterprise?.logo || null);
    } finally {
      setUploading(false);
    }
  };

  const removeLogo = () => {
    setLogoPreview(null);
    setFormData(prev => ({ ...prev, logo: '' }));
    if (logoInputRef.current) {
      logoInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (enterprise) {
        await enterpriseAPI.update(enterprise.id, formData);
      } else {
        await enterpriseAPI.create(formData);
      }
      toast.success('Profil enregistré !');
      onUpdate();
    } catch (error) {
      toast.error('Erreur lors de l\'enregistrement');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
        Profil Entreprise
      </h1>
      <form onSubmit={handleSubmit} className="card-service rounded-xl p-6 space-y-6">
        {/* Logo Upload */}
        <div>
          <label className="block text-sm text-gray-400 mb-2">Logo de l'entreprise</label>
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 rounded-xl overflow-hidden bg-white/5 flex items-center justify-center border-2 border-dashed border-white/20">
              {logoPreview || formData.logo ? (
                <div className="relative w-full h-full">
                  <img 
                    src={logoPreview || formData.logo} 
                    alt="Logo" 
                    className="w-full h-full object-cover"
                  />
                  {uploading && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                </div>
              ) : (
                <Image className="w-8 h-8 text-gray-500" />
              )}
            </div>
            <div className="flex-1 space-y-2">
              <input
                ref={logoInputRef}
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                onChange={handleLogoUpload}
                className="hidden"
                id="logo-upload"
              />
              <label 
                htmlFor="logo-upload" 
                className="btn-secondary inline-flex items-center gap-2 cursor-pointer"
              >
                <Upload className="w-4 h-4" />
                {formData.logo ? 'Changer le logo' : 'Ajouter un logo'}
              </label>
              {(logoPreview || formData.logo) && (
                <button type="button" onClick={removeLogo} className="text-red-400 hover:text-red-300 text-sm ml-4">
                  Supprimer
                </button>
              )}
              <p className="text-xs text-gray-500">JPG, PNG, GIF ou WEBP (max 5MB)</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Nom de l'entreprise *</label>
            <input type="text" value={formData.business_name} onChange={(e) => setFormData({...formData, business_name: e.target.value})} className="input-dark w-full" required />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Slogan</label>
            <input type="text" value={formData.slogan} onChange={(e) => setFormData({...formData, slogan: e.target.value})} className="input-dark w-full" />
          </div>
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">Description *</label>
          <textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="input-dark w-full h-24" required />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Téléphone *</label>
            <input type="tel" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="input-dark w-full" required />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Email *</label>
            <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="input-dark w-full" required />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Adresse *</label>
            <input type="text" value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} className="input-dark w-full" required />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Site web</label>
            <input type="url" value={formData.website} onChange={(e) => setFormData({...formData, website: e.target.value})} className="input-dark w-full" />
          </div>
        </div>
        <button type="submit" disabled={saving} className="btn-primary">
          {saving ? 'Enregistrement...' : 'Enregistrer'}
        </button>
      </form>
    </div>
  );
};

// Services Section Component
const ServicesSection = ({ services, onAdd, onDelete, onRefresh }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
          Services & Produits
        </h1>
        <button onClick={onAdd} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Ajouter
        </button>
      </div>
      {services.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map((item) => (
            <div key={item.id} className="card-service rounded-xl p-4">
              <div className="flex items-start justify-between mb-2">
                <span className={`px-2 py-1 rounded-full text-xs ${item.type === 'service' ? 'bg-[#0047AB]/20 text-[#0047AB]' : 'bg-[#D4AF37]/20 text-[#D4AF37]'}`}>
                  {item.type === 'service' ? 'Service' : 'Produit'}
                </span>
                <button onClick={() => onDelete(item.id)} className="text-red-400 hover:text-red-300">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <h3 className="text-white font-medium mb-1">{item.name}</h3>
              <p className="text-sm text-gray-400 line-clamp-2 mb-2">{item.description}</p>
              <p className="text-lg font-bold text-[#D4AF37]">{item.price} CHF</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="card-service rounded-xl p-12 text-center">
          <Package className="w-12 h-12 text-gray-500 mx-auto mb-4" />
          <p className="text-gray-400">Aucun service ou produit</p>
        </div>
      )}
    </div>
  );
};

// Orders Section Component
const OrdersSection = ({ orders, onRefresh }) => {
  const updateStatus = async (orderId, status) => {
    try {
      await orderAPI.updateStatus(orderId, status);
      toast.success('Statut mis à jour');
      onRefresh();
    } catch (error) {
      toast.error('Erreur');
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
        Commandes
      </h1>
      {orders.length > 0 ? (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="card-service rounded-xl p-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-white font-medium">Commande #{order.id.slice(0, 8)}</p>
                  <p className="text-sm text-gray-400">{new Date(order.created_at).toLocaleDateString('fr-FR')}</p>
                </div>
                <div className="flex items-center gap-2">
                  <select 
                    value={order.status} 
                    onChange={(e) => updateStatus(order.id, e.target.value)}
                    className="input-dark text-sm"
                  >
                    <option value="pending">En attente</option>
                    <option value="confirmed">Confirmée</option>
                    <option value="completed">Terminée</option>
                    <option value="cancelled">Annulée</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2 mb-4">
                {order.items?.map((item, i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span className="text-gray-400">{item.quantity}x {item.name}</span>
                    <span className="text-white">{(item.price * item.quantity).toFixed(2)} CHF</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between items-center pt-4 border-t border-white/10">
                <span className="text-gray-400">Total</span>
                <span className="text-xl font-bold text-[#D4AF37]">{order.total?.toFixed(2)} CHF</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card-service rounded-xl p-12 text-center">
          <ShoppingCart className="w-12 h-12 text-gray-500 mx-auto mb-4" />
          <p className="text-gray-400">Aucune commande</p>
        </div>
      )}
    </div>
  );
};

// Generic Section Component for similar layouts
const GenericSection = ({ title, icon: Icon, items, onAdd, onDelete, emptyText, renderItem }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
          {title}
        </h1>
        <button onClick={onAdd} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Ajouter
        </button>
      </div>
      {items.length > 0 ? (
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className="card-service rounded-xl p-4">
              <div className="flex items-center gap-4">
                <div className="flex-1">{renderItem(item)}</div>
                <button onClick={() => onDelete(item.id)} className="text-red-400 hover:text-red-300">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card-service rounded-xl p-12 text-center">
          <Icon className="w-12 h-12 text-gray-500 mx-auto mb-4" />
          <p className="text-gray-400">{emptyText}</p>
          <button onClick={onAdd} className="btn-secondary mt-4">Ajouter</button>
        </div>
      )}
    </div>
  );
};

// Stock Section Component
const StockSection = ({ stock, services, onRefresh }) => {
  const [showAdd, setShowAdd] = useState(false);
  const [formData, setFormData] = useState({ product_id: '', product_name: '', quantity: 0, min_quantity: 5, unit: 'pièce' });

  const addStock = async () => {
    try {
      await stockAPI.add(formData);
      toast.success('Produit ajouté au stock');
      setShowAdd(false);
      onRefresh();
    } catch (error) {
      toast.error('Erreur');
    }
  };

  const recordMovement = async (productId, type, qty) => {
    try {
      await stockAPI.movement({ product_id: productId, quantity: qty, movement_type: type });
      toast.success('Mouvement enregistré');
      onRefresh();
    } catch (error) {
      toast.error('Erreur');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
          Gestion des stocks
        </h1>
        <button onClick={() => setShowAdd(true)} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Ajouter produit
        </button>
      </div>

      {stock.alerts.length > 0 && (
        <div className="card-service rounded-xl p-4 border-red-500/50">
          <h3 className="text-red-400 font-medium mb-2 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" /> Alertes stock faible
          </h3>
          <div className="space-y-2">
            {stock.alerts.map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span className="text-white">{item.product_name}</span>
                <span className="text-red-400">{item.quantity} / {item.min_quantity} {item.unit}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {stock.items.length > 0 ? (
        <div className="space-y-3">
          {stock.items.map((item) => (
            <div key={item.id} className="card-service rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-medium">{item.product_name}</p>
                  <p className="text-sm text-gray-400">SKU: {item.sku || 'N/A'}</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <p className={`text-xl font-bold ${item.quantity <= item.min_quantity ? 'text-red-400' : 'text-green-400'}`}>
                      {item.quantity}
                    </p>
                    <p className="text-xs text-gray-400">{item.unit}</p>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => recordMovement(item.product_id, 'in', 1)} className="p-2 bg-green-500/20 text-green-400 rounded hover:bg-green-500/30">
                      <Plus className="w-4 h-4" />
                    </button>
                    <button onClick={() => recordMovement(item.product_id, 'out', 1)} className="p-2 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30">
                      <ArrowUpDown className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card-service rounded-xl p-12 text-center">
          <Box className="w-12 h-12 text-gray-500 mx-auto mb-4" />
          <p className="text-gray-400">Aucun produit en stock</p>
        </div>
      )}

      {showAdd && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="card-service rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-white mb-4">Ajouter au stock</h3>
            <div className="space-y-4">
              <select 
                value={formData.product_id} 
                onChange={(e) => {
                  const product = services.find(s => s.id === e.target.value);
                  setFormData({...formData, product_id: e.target.value, product_name: product?.name || ''});
                }}
                className="input-dark w-full"
              >
                <option value="">Sélectionner un produit</option>
                {services.filter(s => s.type === 'product').map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
              <input type="number" placeholder="Quantité" value={formData.quantity} onChange={(e) => setFormData({...formData, quantity: parseInt(e.target.value)})} className="input-dark w-full" />
              <input type="number" placeholder="Quantité minimum" value={formData.min_quantity} onChange={(e) => setFormData({...formData, min_quantity: parseInt(e.target.value)})} className="input-dark w-full" />
              <div className="flex gap-2">
                <button onClick={() => setShowAdd(false)} className="btn-secondary flex-1">Annuler</button>
                <button onClick={addStock} className="btn-primary flex-1">Ajouter</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Agenda Section Component
const AgendaSection = ({ agenda, onRefresh }) => {
  const [showAdd, setShowAdd] = useState(false);
  const [formData, setFormData] = useState({
    title: '', description: '', event_type: 'appointment', start_datetime: '', end_datetime: '', color: '#0047AB'
  });

  const addEvent = async () => {
    try {
      await agendaAPI.create(formData);
      toast.success('Événement ajouté');
      setShowAdd(false);
      setFormData({ title: '', description: '', event_type: 'appointment', start_datetime: '', end_datetime: '', color: '#0047AB' });
      onRefresh();
    } catch (error) {
      toast.error('Erreur');
    }
  };

  const deleteEvent = async (id) => {
    try {
      await agendaAPI.delete(id);
      toast.success('Événement supprimé');
      onRefresh();
    } catch (error) {
      toast.error('Erreur');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
          Agenda
        </h1>
        <button onClick={() => setShowAdd(true)} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Ajouter
        </button>
      </div>

      {agenda.length > 0 ? (
        <div className="space-y-3">
          {agenda.map((event) => (
            <div key={event.id} className="card-service rounded-xl p-4" style={{ borderLeftColor: event.color, borderLeftWidth: '4px' }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-medium">{event.title}</p>
                  <p className="text-sm text-gray-400">
                    {new Date(event.start_datetime).toLocaleString('fr-FR')}
                  </p>
                  {event.client_name && <p className="text-sm text-[#0047AB]">Client: {event.client_name}</p>}
                </div>
                <button onClick={() => deleteEvent(event.id)} className="text-red-400 hover:text-red-300">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card-service rounded-xl p-12 text-center">
          <Calendar className="w-12 h-12 text-gray-500 mx-auto mb-4" />
          <p className="text-gray-400">Aucun événement</p>
        </div>
      )}

      {showAdd && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="card-service rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-white mb-4">Ajouter un événement</h3>
            <div className="space-y-4">
              <input type="text" placeholder="Titre" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="input-dark w-full" />
              <select value={formData.event_type} onChange={(e) => setFormData({...formData, event_type: e.target.value})} className="input-dark w-full">
                <option value="appointment">Rendez-vous</option>
                <option value="availability">Disponibilité</option>
                <option value="blocked">Bloqué</option>
                <option value="task">Tâche</option>
              </select>
              <input type="datetime-local" value={formData.start_datetime} onChange={(e) => setFormData({...formData, start_datetime: e.target.value})} className="input-dark w-full" />
              <input type="datetime-local" value={formData.end_datetime} onChange={(e) => setFormData({...formData, end_datetime: e.target.value})} className="input-dark w-full" />
              <div className="flex gap-2">
                <button onClick={() => setShowAdd(false)} className="btn-secondary flex-1">Annuler</button>
                <button onClick={addEvent} className="btn-primary flex-1">Ajouter</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Team Section Component
const TeamSection = ({ team, teamOrders, onDelete, onRefresh }) => {
  const [showAdd, setShowAdd] = useState(false);
  const [formData, setFormData] = useState({ first_name: '', last_name: '', email: '', phone: '', role: '', department: '' });

  const addMember = async () => {
    try {
      await teamAPI.add(formData);
      toast.success('Membre ajouté');
      setShowAdd(false);
      setFormData({ first_name: '', last_name: '', email: '', phone: '', role: '', department: '' });
      onRefresh();
    } catch (error) {
      toast.error('Erreur');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
          Mon équipe
        </h1>
        <button onClick={() => setShowAdd(true)} className="btn-primary flex items-center gap-2">
          <UserPlus className="w-4 h-4" /> Ajouter
        </button>
      </div>

      {team.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {team.map((member) => (
            <div key={member.id} className="card-service rounded-xl p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-full bg-[#0047AB]/20 flex items-center justify-center text-[#0047AB] font-semibold">
                  {member.first_name[0]}{member.last_name[0]}
                </div>
                <button onClick={() => onDelete(member.id)} className="text-red-400 hover:text-red-300">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <h3 className="text-white font-medium">{member.first_name} {member.last_name}</h3>
              <p className="text-sm text-[#D4AF37]">{member.role}</p>
              {member.department && <p className="text-xs text-gray-400">{member.department}</p>}
              {member.email && <p className="text-xs text-gray-400 mt-2">{member.email}</p>}
            </div>
          ))}
        </div>
      ) : (
        <div className="card-service rounded-xl p-12 text-center">
          <Users className="w-12 h-12 text-gray-500 mx-auto mb-4" />
          <p className="text-gray-400">Aucun membre d'équipe</p>
        </div>
      )}

      {showAdd && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="card-service rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-white mb-4">Ajouter un membre</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <input type="text" placeholder="Prénom" value={formData.first_name} onChange={(e) => setFormData({...formData, first_name: e.target.value})} className="input-dark w-full" />
                <input type="text" placeholder="Nom" value={formData.last_name} onChange={(e) => setFormData({...formData, last_name: e.target.value})} className="input-dark w-full" />
              </div>
              <input type="email" placeholder="Email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="input-dark w-full" />
              <input type="tel" placeholder="Téléphone" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="input-dark w-full" />
              <input type="text" placeholder="Poste/Rôle" value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})} className="input-dark w-full" />
              <input type="text" placeholder="Département" value={formData.department} onChange={(e) => setFormData({...formData, department: e.target.value})} className="input-dark w-full" />
              <div className="flex gap-2">
                <button onClick={() => setShowAdd(false)} className="btn-secondary flex-1">Annuler</button>
                <button onClick={addMember} className="btn-primary flex-1">Ajouter</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Documents Section Component
const DocumentsSection = ({ documents, onDelete, onRefresh }) => {
  const [showAdd, setShowAdd] = useState(false);
  const [formData, setFormData] = useState({ title: '', category: 'other', file_url: '', file_type: 'pdf', is_important: false });

  const addDocument = async () => {
    try {
      await documentsAPI.add(formData);
      toast.success('Document ajouté');
      setShowAdd(false);
      onRefresh();
    } catch (error) {
      toast.error('Erreur');
    }
  };

  const categories = [
    { id: 'legal', name: 'Juridique', icon: FileText },
    { id: 'financial', name: 'Financier', icon: Wallet },
    { id: 'contract', name: 'Contrats', icon: ClipboardList },
    { id: 'certificate', name: 'Certificats', icon: CheckCircle },
    { id: 'other', name: 'Autre', icon: FolderOpen },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
          Documents
        </h1>
        <button onClick={() => setShowAdd(true)} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Ajouter
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {categories.map((cat) => (
          <div key={cat.id} className="card-service rounded-xl p-4 text-center">
            <cat.icon className="w-8 h-8 text-[#0047AB] mx-auto mb-2" />
            <p className="text-white text-sm font-medium">{cat.name}</p>
            <p className="text-xs text-gray-400">{documents.filter(d => d.category === cat.id).length} fichier(s)</p>
          </div>
        ))}
      </div>

      {documents.length > 0 ? (
        <div className="space-y-3">
          {documents.map((doc) => (
            <div key={doc.id} className="card-service rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText className="w-8 h-8 text-gray-400" />
                  <div>
                    <p className="text-white font-medium">{doc.title}</p>
                    <p className="text-xs text-gray-400">{doc.file_type.toUpperCase()} • {doc.category}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {doc.is_important && <Star className="w-4 h-4 text-[#D4AF37]" />}
                  <a href={doc.file_url} target="_blank" rel="noopener noreferrer" className="btn-secondary text-sm">Voir</a>
                  <button onClick={() => onDelete(doc.id)} className="text-red-400 hover:text-red-300">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card-service rounded-xl p-12 text-center">
          <FolderOpen className="w-12 h-12 text-gray-500 mx-auto mb-4" />
          <p className="text-gray-400">Aucun document</p>
        </div>
      )}

      {showAdd && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="card-service rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-white mb-4">Ajouter un document</h3>
            <div className="space-y-4">
              <input type="text" placeholder="Titre" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="input-dark w-full" />
              <select value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className="input-dark w-full">
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <input type="url" placeholder="URL du fichier" value={formData.file_url} onChange={(e) => setFormData({...formData, file_url: e.target.value})} className="input-dark w-full" />
              <label className="flex items-center gap-2 text-gray-400">
                <input type="checkbox" checked={formData.is_important} onChange={(e) => setFormData({...formData, is_important: e.target.checked})} />
                Document important
              </label>
              <div className="flex gap-2">
                <button onClick={() => setShowAdd(false)} className="btn-secondary flex-1">Annuler</button>
                <button onClick={addDocument} className="btn-primary flex-1">Ajouter</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Development Section Component
const DevelopmentSection = () => {
  const resources = [
    { id: '1', title: 'Guide du marketing digital', type: 'article', category: 'Marketing', duration: '15 min' },
    { id: '2', title: 'Optimisation fiscale pour entreprises', type: 'video', category: 'Finance', duration: '45 min' },
    { id: '3', title: 'Gestion de la relation client', type: 'course', category: 'Ventes', duration: '2 heures' },
    { id: '4', title: 'Réseaux sociaux pour les entreprises', type: 'webinar', category: 'Marketing', duration: '1 heure' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
        Développement & Formation
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {resources.map((resource) => (
          <div key={resource.id} className="card-service rounded-xl p-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-[#0047AB]/20 flex items-center justify-center">
                {resource.type === 'video' ? <PlayCircle className="w-6 h-6 text-[#0047AB]" /> : <BookOpen className="w-6 h-6 text-[#0047AB]" />}
              </div>
              <div className="flex-1">
                <h3 className="text-white font-medium">{resource.title}</h3>
                <p className="text-sm text-gray-400">{resource.category} • {resource.duration}</p>
                <span className="inline-block mt-2 px-2 py-1 bg-white/5 text-xs text-gray-400 rounded">{resource.type}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Finances Section Component
const FinancesSection = ({ finances, onRefresh }) => {
  const [showAdd, setShowAdd] = useState(false);
  const [formData, setFormData] = useState({ transaction_type: 'income', category: 'other', amount: 0, description: '', date: new Date().toISOString().split('T')[0] });

  const addTransaction = async () => {
    try {
      await financesAPI.addTransaction(formData);
      toast.success('Transaction ajoutée');
      setShowAdd(false);
      onRefresh();
    } catch (error) {
      toast.error('Erreur');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
          Finances
        </h1>
        <button onClick={() => setShowAdd(true)} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Transaction
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card-service rounded-xl p-4">
          <p className="text-sm text-gray-400 mb-1">Revenus totaux</p>
          <p className="text-2xl font-bold text-green-400">{finances.summary.total_income?.toFixed(2) || 0} CHF</p>
        </div>
        <div className="card-service rounded-xl p-4">
          <p className="text-sm text-gray-400 mb-1">Dépenses totales</p>
          <p className="text-2xl font-bold text-red-400">{finances.summary.total_expenses?.toFixed(2) || 0} CHF</p>
        </div>
        <div className="card-service rounded-xl p-4">
          <p className="text-sm text-gray-400 mb-1">Bénéfice net</p>
          <p className="text-2xl font-bold text-[#D4AF37]">{finances.summary.net_profit?.toFixed(2) || 0} CHF</p>
        </div>
        <div className="card-service rounded-xl p-4">
          <p className="text-sm text-gray-400 mb-1">Commissions Titelli</p>
          <p className="text-2xl font-bold text-gray-400">{finances.summary.commission_paid?.toFixed(2) || 0} CHF</p>
        </div>
      </div>

      {/* Transactions */}
      <div className="card-service rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Dernières transactions</h2>
        {finances.transactions?.length > 0 ? (
          <div className="space-y-3">
            {finances.transactions.slice(0, 10).map((t) => (
              <div key={t.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <div>
                  <p className="text-white">{t.description}</p>
                  <p className="text-xs text-gray-400">{t.date} • {t.category}</p>
                </div>
                <p className={`font-semibold ${t.transaction_type === 'income' ? 'text-green-400' : 'text-red-400'}`}>
                  {t.transaction_type === 'income' ? '+' : '-'}{t.amount.toFixed(2)} CHF
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400 text-center py-8">Aucune transaction</p>
        )}
      </div>

      {showAdd && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="card-service rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-white mb-4">Ajouter une transaction</h3>
            <div className="space-y-4">
              <select value={formData.transaction_type} onChange={(e) => setFormData({...formData, transaction_type: e.target.value})} className="input-dark w-full">
                <option value="income">Revenu</option>
                <option value="expense">Dépense</option>
              </select>
              <input type="number" placeholder="Montant" value={formData.amount} onChange={(e) => setFormData({...formData, amount: parseFloat(e.target.value)})} className="input-dark w-full" />
              <input type="text" placeholder="Description" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="input-dark w-full" />
              <input type="date" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} className="input-dark w-full" />
              <div className="flex gap-2">
                <button onClick={() => setShowAdd(false)} className="btn-secondary flex-1">Annuler</button>
                <button onClick={addTransaction} className="btn-primary flex-1">Ajouter</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Advertising Section Component
const AdvertisingSection = ({ advertising, onDelete, onRefresh }) => {
  const [showAdd, setShowAdd] = useState(false);
  const [payingAd, setPayingAd] = useState(null);
  const [formData, setFormData] = useState({
    title: '', ad_type: 'banner', placement: 'homepage', budget: 50,
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date(Date.now() + 30*24*60*60*1000).toISOString().split('T')[0],
    schedule_time: '12:00'
  });

  const adPrices = {
    banner: { name: 'Bannière', price: 50, desc: 'Bannière sur la page d\'accueil' },
    featured: { name: 'Mise en avant', price: 100, desc: 'Votre annonce en tête de liste' },
    spotlight: { name: 'Spotlight', price: 200, desc: 'Mise en lumière premium' },
    video: { name: 'Vidéo publicitaire', price: 150, desc: 'Vidéo de 3-9 secondes' },
    ia_clients: { name: 'IA Clients', price: 75, desc: 'Ciblage intelligent' },
    influencer: { name: 'Influenceurs', price: 250, desc: 'Partenariat influenceur' },
  };

  const createAd = async () => {
    try {
      const priceInfo = adPrices[formData.ad_type];
      const adData = {
        ...formData,
        budget: priceInfo?.price || formData.budget
      };
      const response = await advertisingAPI.create(adData);
      toast.success('Campagne créée - Procédez au paiement pour l\'activer');
      setShowAdd(false);
      setPayingAd(response.data);
      onRefresh();
    } catch (error) {
      toast.error('Erreur lors de la création');
    }
  };

  const handlePayment = async (adId) => {
    try {
      const response = await advertisingAPI.pay(adId);
      if (response.data.checkout_url) {
        // Open Stripe checkout in new tab
        window.open(response.data.checkout_url, '_blank');
        toast.success('Redirection vers le paiement...');
      }
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Erreur lors du paiement');
    }
  };

  const handleToggle = async (adId, isPaid) => {
    if (!isPaid) {
      toast.error('Vous devez payer cette publicité avant de l\'activer');
      return;
    }
    try {
      await advertisingAPI.toggle(adId);
      toast.success('Statut modifié');
      onRefresh();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Erreur');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
          Mes publicités
        </h1>
        <button onClick={() => setShowAdd(true)} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Nouvelle campagne
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card-service rounded-xl p-4">
          <p className="text-sm text-gray-400 mb-1">Campagnes actives</p>
          <p className="text-2xl font-bold text-[#0047AB]">{advertising.stats?.active_campaigns || 0}</p>
        </div>
        <div className="card-service rounded-xl p-4">
          <p className="text-sm text-gray-400 mb-1">Impressions</p>
          <p className="text-2xl font-bold text-white">{advertising.stats?.total_impressions || 0}</p>
        </div>
        <div className="card-service rounded-xl p-4">
          <p className="text-sm text-gray-400 mb-1">Clics</p>
          <p className="text-2xl font-bold text-green-400">{advertising.stats?.total_clicks || 0}</p>
        </div>
        <div className="card-service rounded-xl p-4">
          <p className="text-sm text-gray-400 mb-1">Budget dépensé</p>
          <p className="text-2xl font-bold text-[#D4AF37]">{advertising.stats?.total_spent || 0} CHF</p>
        </div>
      </div>

      {/* Ad Types Selection */}
      <div className="card-service rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Types de publicité disponibles</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(adPrices).map(([type, info]) => (
            <div key={type} className="p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors cursor-pointer border border-transparent hover:border-[#0047AB]/50"
                 onClick={() => { setFormData({...formData, ad_type: type, budget: info.price}); setShowAdd(true); }}>
              <div className="flex items-center justify-between mb-2">
                <p className="text-white font-medium">{info.name}</p>
                <span className="text-[#D4AF37] font-bold">{info.price} CHF</span>
              </div>
              <p className="text-sm text-gray-400">{info.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Campaigns List */}
      {advertising.campaigns?.length > 0 ? (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-white">Mes campagnes</h2>
          {advertising.campaigns.map((campaign) => (
            <div key={campaign.id} className="card-service rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <p className="text-white font-medium">{campaign.title}</p>
                    {!campaign.is_paid && (
                      <span className="px-2 py-0.5 rounded-full text-xs bg-red-500/20 text-red-400">
                        Non payée
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-400">{adPrices[campaign.ad_type]?.name || campaign.ad_type} • {campaign.placement} • {campaign.budget || 0} CHF</p>
                </div>
                <div className="flex items-center gap-3">
                  {!campaign.is_paid ? (
                    <button 
                      onClick={() => handlePayment(campaign.id)} 
                      className="px-4 py-2 bg-[#D4AF37] text-black rounded-lg text-sm font-medium hover:bg-[#B8860B] transition-colors flex items-center gap-2"
                    >
                      <CreditCard className="w-4 h-4" />
                      Payer pour activer
                    </button>
                  ) : (
                    <button 
                      onClick={() => handleToggle(campaign.id, campaign.is_paid)}
                      className={`px-3 py-1.5 rounded-lg text-sm flex items-center gap-2 ${
                        campaign.is_active 
                          ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30' 
                          : 'bg-gray-500/20 text-gray-400 hover:bg-gray-500/30'
                      }`}
                    >
                      {campaign.is_active ? <PlayCircle className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                      {campaign.is_active ? 'Active' : 'Inactive'}
                    </button>
                  )}
                  <button onClick={() => onDelete(campaign.id)} className="text-red-400 hover:text-red-300 p-2">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              {campaign.is_paid && (
                <div className="mt-3 pt-3 border-t border-white/10 flex gap-6 text-sm">
                  <div>
                    <span className="text-gray-500">Impressions:</span>
                    <span className="text-white ml-2">{campaign.impressions || 0}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Clics:</span>
                    <span className="text-white ml-2">{campaign.clicks || 0}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">CTR:</span>
                    <span className="text-white ml-2">{campaign.impressions > 0 ? ((campaign.clicks / campaign.impressions) * 100).toFixed(1) : 0}%</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="card-service rounded-xl p-12 text-center">
          <Megaphone className="w-12 h-12 text-gray-500 mx-auto mb-4" />
          <p className="text-gray-400 mb-2">Aucune campagne publicitaire</p>
          <p className="text-sm text-gray-500">Créez votre première campagne pour augmenter votre visibilité</p>
        </div>
      )}

      {/* Create Ad Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="card-service rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-white mb-4">Nouvelle campagne publicitaire</h3>
            
            <div className="space-y-4">
              {/* Selected Ad Type Info */}
              <div className="p-4 bg-[#0047AB]/10 border border-[#0047AB]/30 rounded-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">{adPrices[formData.ad_type]?.name}</p>
                    <p className="text-sm text-gray-400">{adPrices[formData.ad_type]?.desc}</p>
                  </div>
                  <p className="text-2xl font-bold text-[#D4AF37]">{adPrices[formData.ad_type]?.price} CHF</p>
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Titre de la campagne *</label>
                <input type="text" placeholder="Ex: Promotion été 2026" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="input-dark w-full" />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Type de publicité *</label>
                <select value={formData.ad_type} onChange={(e) => setFormData({...formData, ad_type: e.target.value, budget: adPrices[e.target.value]?.price || 50})} className="input-dark w-full">
                  {Object.entries(adPrices).map(([type, info]) => (
                    <option key={type} value={type}>{info.name} - {info.price} CHF</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Emplacement *</label>
                <select value={formData.placement} onChange={(e) => setFormData({...formData, placement: e.target.value})} className="input-dark w-full">
                  <option value="homepage">Page d'accueil</option>
                  <option value="category">Page catégorie</option>
                  <option value="search">Résultats recherche</option>
                  <option value="sidebar">Barre latérale</option>
                  <option value="feed">Fil d'actualité</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Horaire de diffusion</label>
                <select value={formData.schedule_time} onChange={(e) => setFormData({...formData, schedule_time: e.target.value})} className="input-dark w-full">
                  <option value="all_day">Toute la journée</option>
                  <option value="morning">Matin (6h-12h)</option>
                  <option value="afternoon">Après-midi (12h-18h)</option>
                  <option value="evening">Soir (18h-23h)</option>
                  <option value="peak">Heures de pointe (12h-14h, 18h-20h)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Date de début</label>
                  <input type="date" value={formData.start_date} onChange={(e) => setFormData({...formData, start_date: e.target.value})} className="input-dark w-full" />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Date de fin</label>
                  <input type="date" value={formData.end_date} onChange={(e) => setFormData({...formData, end_date: e.target.value})} className="input-dark w-full" />
                </div>
              </div>

              <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                <p className="text-sm text-yellow-400">
                  <strong>Note :</strong> Votre publicité sera créée mais inactive. Vous devrez procéder au paiement pour l'activer.
                </p>
              </div>

              <div className="flex gap-2 pt-2">
                <button onClick={() => setShowAdd(false)} className="btn-secondary flex-1">Annuler</button>
                <button onClick={createAd} disabled={!formData.title} className="btn-primary flex-1 disabled:opacity-50">
                  Créer la campagne
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Form Modal Component for adding items
const FormModal = ({ type, item, onClose, onSuccess }) => {
  const [formData, setFormData] = useState(() => {
    // Initialiser avec des valeurs par défaut selon le type
    switch(type) {
      case 'service':
        return { type: 'service', category: 'soins_esthetiques', is_delivery: false, images: [] };
      case 'offer':
        return { discount_type: 'percentage', is_active: true };
      case 'training':
        return { is_online: false, category: 'Marketing' };
      case 'job':
        return { job_type: 'full_time', location: 'Lausanne' };
      case 'realestate':
        return { property_type: 'commercial', city: 'Lausanne', transaction_type: 'rent', price_period: 'month' };
      case 'investment':
        return { risk_level: 'medium', investment_type: 'equity' };
      default:
        return {};
    }
  });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);

  const serviceCategories = [
    { id: 'restauration', name: 'Restauration' },
    { id: 'soins_esthetiques', name: 'Soins esthétiques' },
    { id: 'coiffure_barber', name: 'Coiffure/Barber' },
    { id: 'cours_sport', name: 'Cours de sport' },
    { id: 'activites_loisirs', name: 'Loisirs & Événements' },
    { id: 'nettoyage', name: 'Nettoyage' },
    { id: 'multiservices', name: 'Multiservices' },
    { id: 'petits_travaux', name: 'Petits travaux' },
    { id: 'formation', name: 'Formation' },
    { id: 'sante', name: 'Santé' },
    { id: 'expert_tech', name: 'Technologie' },
    { id: 'expert_fiscal', name: 'Fiscalité' },
    { id: 'expert_juridique', name: 'Juridique' },
  ];

  const productCategories = [
    { id: 'courses_alimentaires', name: 'Alimentaire' },
    { id: 'vetements_mode', name: 'Vêtements & Mode' },
    { id: 'maquillage_beaute', name: 'Beauté' },
    { id: 'sport', name: 'Sport' },
    { id: 'electronique', name: 'Électronique' },
    { id: 'ameublement_deco', name: 'Décoration' },
    { id: 'bricolage_jardinage', name: 'Bricolage' },
  ];

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Type de fichier non autorisé. Utilisez JPG, PNG, GIF ou WEBP.');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Fichier trop volumineux (max 5MB)');
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);

    // Upload file
    setUploading(true);
    try {
      const response = await uploadAPI.uploadImage(file);
      const imageUrl = process.env.REACT_APP_BACKEND_URL + response.data.url;
      setFormData(prev => ({ ...prev, images: [imageUrl] }));
      toast.success('Image uploadée !');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Erreur lors de l\'upload de l\'image');
      setImagePreview(null);
    } finally {
      setUploading(false);
    }
  };

  const removeImage = () => {
    setImagePreview(null);
    setFormData(prev => ({ ...prev, images: [] }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      switch(type) {
        case 'offer':
          if (!formData.title) throw new Error('Titre requis');
          await offersAPI.create({ ...formData, discount_type: 'percentage', is_active: true });
          break;
        case 'training':
          if (!formData.title) throw new Error('Titre requis');
          await trainingsAPI.create({ ...formData, category: formData.category || 'Marketing' });
          break;
        case 'job':
          if (!formData.title) throw new Error('Titre requis');
          await jobsAPI.create(formData);
          break;
        case 'realestate':
          if (!formData.title) throw new Error('Titre requis');
          await realEstateAPI.create({ ...formData, city: formData.city || 'Lausanne' });
          break;
        case 'investment':
          if (!formData.title) throw new Error('Titre requis');
          await investmentsAPI.create({ ...formData, investment_type: formData.investment_type || 'equity' });
          break;
        case 'service':
          if (!formData.name) throw new Error('Nom requis');
          if (!formData.description) throw new Error('Description requise');
          if (!formData.price) throw new Error('Prix requis');
          await servicesProductsAPI.create({ 
            ...formData, 
            currency: 'CHF',
            category: formData.category || 'soins_esthetiques',
            type: formData.type || 'service',
            images: formData.images || []
          });
          break;
        default:
          break;
      }
      toast.success('Créé avec succès !');
      onSuccess();
    } catch (error) {
      console.error('Error creating:', error);
      toast.error(error.message || 'Erreur lors de la création');
    } finally {
      setLoading(false);
    }
  };

  // Image Upload Component
  const ImageUploadSection = () => (
    <div className="mb-4">
      <label className="block text-sm text-gray-400 mb-2">Image de l'annonce</label>
      <div className="border-2 border-dashed border-white/20 rounded-xl p-4 text-center hover:border-[#0047AB]/50 transition-colors">
        {imagePreview || (formData.images && formData.images.length > 0) ? (
          <div className="relative inline-block">
            <img 
              src={imagePreview || formData.images[0]} 
              alt="Aperçu" 
              className="max-h-48 rounded-lg object-cover mx-auto"
            />
            <button
              type="button"
              onClick={removeImage}
              className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            {uploading && (
              <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>
        ) : (
          <label className="cursor-pointer block">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              onChange={handleImageUpload}
              className="hidden"
            />
            <div className="py-6">
              <Upload className="w-10 h-10 text-gray-500 mx-auto mb-2" />
              <p className="text-gray-400 text-sm">Cliquez pour choisir une image</p>
              <p className="text-gray-500 text-xs mt-1">JPG, PNG, GIF ou WEBP (max 5MB)</p>
            </div>
          </label>
        )}
      </div>
    </div>
  );

  const renderForm = () => {
    switch(type) {
      case 'offer':
        return (
          <>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Titre de l'offre *</label>
              <input type="text" placeholder="Ex: Promotion été -20%" value={formData.title || ''} onChange={(e) => setFormData({...formData, title: e.target.value})} className="input-dark w-full" required />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Description</label>
              <textarea placeholder="Décrivez votre offre" value={formData.description || ''} onChange={(e) => setFormData({...formData, description: e.target.value})} className="input-dark w-full" rows={3} />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Réduction (%) *</label>
              <input type="number" placeholder="Ex: 20" min="1" max="100" value={formData.discount_value || ''} onChange={(e) => setFormData({...formData, discount_value: parseFloat(e.target.value)})} className="input-dark w-full" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Date début</label>
                <input type="date" value={formData.valid_from || ''} onChange={(e) => setFormData({...formData, valid_from: e.target.value})} className="input-dark w-full" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Date fin</label>
                <input type="date" value={formData.valid_until || ''} onChange={(e) => setFormData({...formData, valid_until: e.target.value})} className="input-dark w-full" />
              </div>
            </div>
          </>
        );
      case 'training':
        return (
          <>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Titre de la formation *</label>
              <input type="text" placeholder="Ex: Formation Marketing Digital" value={formData.title || ''} onChange={(e) => setFormData({...formData, title: e.target.value})} className="input-dark w-full" required />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Description *</label>
              <textarea placeholder="Décrivez le contenu de la formation" value={formData.description || ''} onChange={(e) => setFormData({...formData, description: e.target.value})} className="input-dark w-full" rows={3} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Durée *</label>
                <input type="text" placeholder="Ex: 2 heures" value={formData.duration || ''} onChange={(e) => setFormData({...formData, duration: e.target.value})} className="input-dark w-full" required />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Prix (CHF) *</label>
                <input type="number" placeholder="Ex: 150" min="0" value={formData.price || ''} onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value)})} className="input-dark w-full" required />
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Catégorie</label>
              <select value={formData.category || 'Marketing'} onChange={(e) => setFormData({...formData, category: e.target.value})} className="input-dark w-full">
                <option value="Marketing">Marketing</option>
                <option value="Finance">Finance</option>
                <option value="Management">Management</option>
                <option value="Ventes">Ventes</option>
                <option value="Technologie">Technologie</option>
                <option value="Communication">Communication</option>
              </select>
            </div>
            <label className="flex items-center gap-2 text-gray-400">
              <input type="checkbox" checked={formData.is_online || false} onChange={(e) => setFormData({...formData, is_online: e.target.checked})} className="rounded" /> Formation en ligne
            </label>
          </>
        );
      case 'job':
        return (
          <>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Titre du poste *</label>
              <input type="text" placeholder="Ex: Développeur Web" value={formData.title || ''} onChange={(e) => setFormData({...formData, title: e.target.value})} className="input-dark w-full" required />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Description *</label>
              <textarea placeholder="Décrivez le poste et les responsabilités" value={formData.description || ''} onChange={(e) => setFormData({...formData, description: e.target.value})} className="input-dark w-full" rows={3} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Type de contrat *</label>
                <select value={formData.job_type || 'full_time'} onChange={(e) => setFormData({...formData, job_type: e.target.value})} className="input-dark w-full">
                  <option value="full_time">Temps plein</option>
                  <option value="part_time">Temps partiel</option>
                  <option value="freelance">Freelance</option>
                  <option value="internship">Stage</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Lieu *</label>
                <input type="text" placeholder="Ex: Lausanne" value={formData.location || 'Lausanne'} onChange={(e) => setFormData({...formData, location: e.target.value})} className="input-dark w-full" required />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Salaire min (CHF)</label>
                <input type="number" placeholder="Ex: 4000" min="0" value={formData.salary_min || ''} onChange={(e) => setFormData({...formData, salary_min: parseFloat(e.target.value) || null})} className="input-dark w-full" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Salaire max (CHF)</label>
                <input type="number" placeholder="Ex: 6000" min="0" value={formData.salary_max || ''} onChange={(e) => setFormData({...formData, salary_max: parseFloat(e.target.value) || null})} className="input-dark w-full" />
              </div>
            </div>
          </>
        );
      case 'realestate':
        return (
          <>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Titre *</label>
              <input type="text" placeholder="Ex: Bureau moderne centre-ville" value={formData.title || ''} onChange={(e) => setFormData({...formData, title: e.target.value})} className="input-dark w-full" required />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Description *</label>
              <textarea placeholder="Décrivez le bien immobilier" value={formData.description || ''} onChange={(e) => setFormData({...formData, description: e.target.value})} className="input-dark w-full" rows={3} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Type de bien *</label>
                <select value={formData.property_type || 'commercial'} onChange={(e) => setFormData({...formData, property_type: e.target.value})} className="input-dark w-full">
                  <option value="commercial">Commercial</option>
                  <option value="office">Bureau</option>
                  <option value="storage">Stockage</option>
                  <option value="land">Terrain</option>
                  <option value="apartment">Appartement</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Transaction *</label>
                <select value={formData.transaction_type || 'rent'} onChange={(e) => setFormData({...formData, transaction_type: e.target.value})} className="input-dark w-full">
                  <option value="rent">Location</option>
                  <option value="sale">Vente</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Surface (m²) *</label>
                <input type="number" placeholder="Ex: 80" min="1" value={formData.surface || ''} onChange={(e) => setFormData({...formData, surface: parseFloat(e.target.value)})} className="input-dark w-full" required />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Prix (CHF) *</label>
                <input type="number" placeholder="Ex: 2500" min="0" value={formData.price || ''} onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value)})} className="input-dark w-full" required />
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Adresse *</label>
              <input type="text" placeholder="Ex: Rue du Grand-Pont 12" value={formData.address || ''} onChange={(e) => setFormData({...formData, address: e.target.value})} className="input-dark w-full" required />
            </div>
          </>
        );
      case 'investment':
        return (
          <>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Titre *</label>
              <input type="text" placeholder="Ex: Expansion du restaurant" value={formData.title || ''} onChange={(e) => setFormData({...formData, title: e.target.value})} className="input-dark w-full" required />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Description *</label>
              <textarea placeholder="Décrivez l'opportunité d'investissement" value={formData.description || ''} onChange={(e) => setFormData({...formData, description: e.target.value})} className="input-dark w-full" rows={3} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Investissement min (CHF) *</label>
                <input type="number" placeholder="Ex: 5000" min="1" value={formData.min_investment || ''} onChange={(e) => setFormData({...formData, min_investment: parseFloat(e.target.value)})} className="input-dark w-full" required />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Retour attendu (%) *</label>
                <input type="number" placeholder="Ex: 8" min="0" step="0.1" value={formData.expected_return || ''} onChange={(e) => setFormData({...formData, expected_return: parseFloat(e.target.value)})} className="input-dark w-full" required />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Type d'investissement</label>
                <select value={formData.investment_type || 'equity'} onChange={(e) => setFormData({...formData, investment_type: e.target.value})} className="input-dark w-full">
                  <option value="equity">Capital</option>
                  <option value="loan">Prêt</option>
                  <option value="revenue_share">Partage de revenus</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Niveau de risque *</label>
                <select value={formData.risk_level || 'medium'} onChange={(e) => setFormData({...formData, risk_level: e.target.value})} className="input-dark w-full">
                  <option value="low">Risque faible</option>
                  <option value="medium">Risque moyen</option>
                  <option value="high">Risque élevé</option>
                </select>
              </div>
            </div>
          </>
        );
      case 'service':
        return (
          <>
            <ImageUploadSection />
            <div>
              <label className="block text-sm text-gray-400 mb-1">Nom du service/produit *</label>
              <input type="text" placeholder="Ex: Massage relaxant 60 min" value={formData.name || ''} onChange={(e) => setFormData({...formData, name: e.target.value})} className="input-dark w-full" required />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Description *</label>
              <textarea placeholder="Décrivez votre service ou produit en détail" value={formData.description || ''} onChange={(e) => setFormData({...formData, description: e.target.value})} className="input-dark w-full" rows={3} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Type *</label>
                <select value={formData.type || 'service'} onChange={(e) => setFormData({...formData, type: e.target.value})} className="input-dark w-full">
                  <option value="service">Service</option>
                  <option value="product">Produit</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Catégorie *</label>
                <select value={formData.category || 'soins_esthetiques'} onChange={(e) => setFormData({...formData, category: e.target.value})} className="input-dark w-full">
                  {(formData.type === 'product' ? productCategories : serviceCategories).map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Prix (CHF) *</label>
              <input type="number" placeholder="Ex: 120" min="0" step="0.01" value={formData.price || ''} onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value)})} className="input-dark w-full" required />
            </div>
            <label className="flex items-center gap-2 text-gray-400">
              <input type="checkbox" checked={formData.is_delivery || false} onChange={(e) => setFormData({...formData, is_delivery: e.target.checked})} className="rounded" /> Livraison disponible
            </label>
          </>
        );
      default:
        return null;
    }
  };

  const titles = {
    offer: 'Nouvelle offre',
    training: 'Nouvelle formation',
    job: 'Nouvelle offre d\'emploi',
    realestate: 'Nouveau bien immobilier',
    investment: 'Nouvel investissement',
    service: 'Nouveau service/produit',
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="card-service rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-semibold text-white mb-4">{titles[type]}</h3>
        <div className="space-y-4">
          {renderForm()}
          <div className="flex gap-2 pt-4">
            <button onClick={onClose} className="btn-secondary flex-1">Annuler</button>
            <button onClick={handleSubmit} disabled={loading} className="btn-primary flex-1">
              {loading ? 'Création...' : 'Créer'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// IA Ciblage Clients Section
const IAClientsSection = () => {
  const [targetAudience, setTargetAudience] = useState({
    name: '',
    age_range: '25-45',
    gender: 'all',
    interests: [],
    location: 'lausanne',
    budget: 'medium',
    behavior: []
  });
  const [campaigns, setCampaigns] = useState([]);
  const [stats, setStats] = useState({ total_reach: 0, total_engagement: 0, total_conversions: 0, engagement_rate: 0 });
  const [showCreate, setShowCreate] = useState(false);
  const [loading, setLoading] = useState(true);

  const interests = [
    'Bien-être', 'Mode', 'Gastronomie', 'Sport', 'Technologie', 
    'Voyage', 'Art & Culture', 'Famille', 'Business', 'Écologie'
  ];

  const behaviors = [
    'Acheteurs fréquents', 'Nouveaux clients', 'Clients fidèles',
    'Abandons de panier', 'Visiteurs réguliers', 'Clients premium'
  ];

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const response = await iaCampaignsAPI.list();
      setCampaigns(response.data.campaigns || []);
      setStats(response.data.stats || {});
    } catch (error) {
      console.error('Error fetching campaigns:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInterestToggle = (interest) => {
    setTargetAudience(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const handleBehaviorToggle = (behavior) => {
    setTargetAudience(prev => ({
      ...prev,
      behavior: prev.behavior.includes(behavior)
        ? prev.behavior.filter(b => b !== behavior)
        : [...prev.behavior, behavior]
    }));
  };

  const createCampaign = async () => {
    if (!targetAudience.name) {
      toast.error('Veuillez donner un nom à votre campagne');
      return;
    }
    try {
      const response = await iaCampaignsAPI.create(targetAudience);
      setCampaigns([response.data, ...campaigns]);
      setShowCreate(false);
      setTargetAudience({ name: '', age_range: '25-45', gender: 'all', interests: [], location: 'lausanne', budget: 'medium', behavior: [] });
      toast.success('Campagne IA créée avec succès');
      fetchCampaigns();
    } catch (error) {
      toast.error('Erreur lors de la création de la campagne');
    }
  };

  const toggleCampaign = async (campaignId) => {
    try {
      await iaCampaignsAPI.toggle(campaignId);
      fetchCampaigns();
      toast.success('Statut de la campagne mis à jour');
    } catch (error) {
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const deleteCampaign = async (campaignId) => {
    try {
      await iaCampaignsAPI.delete(campaignId);
      setCampaigns(campaigns.filter(c => c.id !== campaignId));
      toast.success('Campagne supprimée');
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    }
  };

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num?.toString() || '0';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-[#0047AB] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="ia-clients-section">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
            IA Ciblage Clients
          </h1>
          <p className="text-gray-400 mt-1">Ciblez intelligemment votre audience idéale</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="btn-primary flex items-center gap-2">
          <Target className="w-4 h-4" /> Nouveau ciblage
        </button>
      </div>

      {/* Question du jour */}
      <div className="card-service rounded-xl p-6 border-[#D4AF37]/30 bg-gradient-to-r from-[#D4AF37]/5 to-transparent">
        <h2 className="text-lg font-semibold text-[#D4AF37] mb-2 flex items-center gap-2">
          <Target className="w-5 h-5" />
          Quel type de public cible aujourd'hui ?
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
          {['Nouveaux clients', 'Clients fidèles', 'Clients premium', 'Clients locaux'].map((type) => (
            <button 
              key={type} 
              onClick={() => { setTargetAudience({...targetAudience, name: type, behavior: [type]}); setShowCreate(true); }}
              className="p-3 bg-white/5 rounded-lg text-white hover:bg-[#D4AF37]/20 hover:border-[#D4AF37]/50 border border-transparent transition-all text-sm"
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Stats IA */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card-service rounded-xl p-4">
          <p className="text-sm text-gray-400">Portée totale</p>
          <p className="text-2xl font-bold text-[#0047AB]">{formatNumber(stats.total_reach)}</p>
        </div>
        <div className="card-service rounded-xl p-4">
          <p className="text-sm text-gray-400">Taux d'engagement</p>
          <p className="text-2xl font-bold text-green-400">{stats.engagement_rate || 0}%</p>
        </div>
        <div className="card-service rounded-xl p-4">
          <p className="text-sm text-gray-400">Conversions</p>
          <p className="text-2xl font-bold text-[#D4AF37]">{formatNumber(stats.total_conversions)}</p>
        </div>
        <div className="card-service rounded-xl p-4">
          <p className="text-sm text-gray-400">Campagnes actives</p>
          <p className="text-2xl font-bold text-purple-400">{stats.active_campaigns || 0}</p>
        </div>
      </div>

      {/* Campagnes actives */}
      <div className="card-service rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Mes campagnes IA</h2>
        {campaigns.length > 0 ? (
          <div className="space-y-3">
            {campaigns.map((campaign) => (
              <div key={campaign.id} className="p-4 bg-white/5 rounded-xl flex items-center justify-between">
                <div>
                  <p className="text-white font-medium">{campaign.name || `Ciblage: ${campaign.age_range} ans`} • {campaign.location}</p>
                  <p className="text-sm text-gray-400">{campaign.interests?.join(', ') || 'Tous les intérêts'}</p>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-[#0047AB]">{formatNumber(campaign.reach)} portée</span>
                  <span className="text-green-400">{formatNumber(campaign.engagement)} engagements</span>
                  <button 
                    onClick={() => toggleCampaign(campaign.id)}
                    className={`px-2 py-1 rounded text-xs ${campaign.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}
                  >
                    {campaign.status === 'active' ? 'Actif' : 'En pause'}
                  </button>
                  <button onClick={() => deleteCampaign(campaign.id)} className="p-1 text-red-400 hover:bg-red-500/20 rounded">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Target className="w-12 h-12 text-gray-500 mx-auto mb-3" />
            <p className="text-gray-400">Aucune campagne IA active</p>
            <p className="text-sm text-gray-500">Créez votre première campagne de ciblage</p>
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="card-service rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-white mb-6">Créer un ciblage IA</h3>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Nom de la campagne *</label>
                <input
                  type="text"
                  value={targetAudience.name}
                  onChange={(e) => setTargetAudience({...targetAudience, name: e.target.value})}
                  placeholder="Ex: Campagne été 2026"
                  className="input-dark w-full"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Tranche d'âge</label>
                  <select value={targetAudience.age_range} onChange={(e) => setTargetAudience({...targetAudience, age_range: e.target.value})} className="input-dark w-full">
                    <option value="18-24">18-24 ans</option>
                    <option value="25-34">25-34 ans</option>
                    <option value="25-45">25-45 ans</option>
                    <option value="35-54">35-54 ans</option>
                    <option value="55+">55+ ans</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Genre</label>
                  <select value={targetAudience.gender} onChange={(e) => setTargetAudience({...targetAudience, gender: e.target.value})} className="input-dark w-full">
                    <option value="all">Tous</option>
                    <option value="male">Homme</option>
                    <option value="female">Femme</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Centres d'intérêt</label>
                <div className="flex flex-wrap gap-2">
                  {interests.map((interest) => (
                    <button
                      key={interest}
                      type="button"
                      onClick={() => handleInterestToggle(interest)}
                      className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                        targetAudience.interests.includes(interest)
                          ? 'bg-[#0047AB] text-white'
                          : 'bg-white/5 text-gray-400 hover:bg-white/10'
                      }`}
                    >
                      {interest}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Comportement</label>
                <div className="flex flex-wrap gap-2">
                  {behaviors.map((behavior) => (
                    <button
                      key={behavior}
                      type="button"
                      onClick={() => handleBehaviorToggle(behavior)}
                      className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                        targetAudience.behavior.includes(behavior)
                          ? 'bg-[#D4AF37] text-black'
                          : 'bg-white/5 text-gray-400 hover:bg-white/10'
                      }`}
                    >
                      {behavior}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Budget client cible</label>
                <select value={targetAudience.budget} onChange={(e) => setTargetAudience({...targetAudience, budget: e.target.value})} className="input-dark w-full">
                  <option value="low">Budget serré</option>
                  <option value="medium">Budget moyen</option>
                  <option value="high">Budget élevé</option>
                  <option value="premium">Premium / Luxe</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowCreate(false)} className="btn-secondary flex-1">Annuler</button>
              <button onClick={createCampaign} className="btn-primary flex-1">Lancer la campagne IA</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Influenceurs Section
const InfluencersSection = () => {
  const [influencers, setInfluencers] = useState([]);
  const [collaborations, setCollaborations] = useState([]);
  const [stats, setStats] = useState({ total_collaborations: 0, active_collaborations: 0, total_investment: 0 });
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [showContactModal, setShowContactModal] = useState(false);
  const [selectedInfluencer, setSelectedInfluencer] = useState(null);
  const [contactMessage, setContactMessage] = useState('');

  const categories = ['all', 'Lifestyle', 'Food', 'Beauty', 'Tech', 'Sport', 'Travel'];

  useEffect(() => {
    fetchData();
  }, [selectedCategory]);

  const fetchData = async () => {
    try {
      const [infRes, collabRes] = await Promise.all([
        influencersAPI.list(selectedCategory === 'all' ? null : selectedCategory),
        influencersAPI.getCollaborations()
      ]);
      setInfluencers(infRes.data.influencers || []);
      setCollaborations(collabRes.data.collaborations || []);
      setStats(collabRes.data.stats || {});
    } catch (error) {
      console.error('Error fetching influencers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleContact = (influencer) => {
    setSelectedInfluencer(influencer);
    setShowContactModal(true);
  };

  const submitCollaboration = async () => {
    if (!selectedInfluencer) return;
    try {
      await influencersAPI.createCollaboration(selectedInfluencer.id, contactMessage, selectedInfluencer.price);
      toast.success('Demande de collaboration envoyée !');
      setShowContactModal(false);
      setContactMessage('');
      fetchData();
    } catch (error) {
      toast.error('Erreur lors de l\'envoi de la demande');
    }
  };

  const formatFollowers = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(0) + 'K';
    return num?.toString() || '0';
  };

  const totalReach = influencers.reduce((sum, inf) => sum + (inf.followers || 0), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-[#0047AB] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="influencers-section">
      <div>
        <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
          Influenceurs
        </h1>
        <p className="text-gray-400 mt-1">Collaborez avec des influenceurs locaux</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card-service rounded-xl p-4">
          <p className="text-sm text-gray-400">Influenceurs disponibles</p>
          <p className="text-2xl font-bold text-[#0047AB]">{influencers.length}</p>
        </div>
        <div className="card-service rounded-xl p-4">
          <p className="text-sm text-gray-400">Collaborations actives</p>
          <p className="text-2xl font-bold text-green-400">{stats.active_collaborations}</p>
        </div>
        <div className="card-service rounded-xl p-4">
          <p className="text-sm text-gray-400">Portée totale</p>
          <p className="text-2xl font-bold text-[#D4AF37]">{formatFollowers(totalReach)}</p>
        </div>
        <div className="card-service rounded-xl p-4">
          <p className="text-sm text-gray-400">Investissement</p>
          <p className="text-2xl font-bold text-purple-400">{stats.total_investment?.toLocaleString()} CHF</p>
        </div>
      </div>

      {/* My Collaborations */}
      {collaborations.length > 0 && (
        <div className="card-service rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Mes collaborations</h2>
          <div className="space-y-3">
            {collaborations.map((collab) => (
              <div key={collab.id} className="p-3 bg-white/5 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img src={collab.influencer?.image} alt="" className="w-10 h-10 rounded-full object-cover" />
                  <div>
                    <p className="text-white font-medium">{collab.influencer?.name}</p>
                    <p className="text-xs text-gray-400">{collab.influencer?.category}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[#D4AF37]">{collab.budget} CHF</span>
                  <span className={`px-2 py-1 rounded text-xs ${
                    collab.status === 'active' ? 'bg-green-500/20 text-green-400' : 
                    collab.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-gray-500/20 text-gray-400'
                  }`}>
                    {collab.status === 'active' ? 'Actif' : collab.status === 'pending' ? 'En attente' : collab.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Category Filter */}
      <div className="flex gap-2 flex-wrap">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedCategory === cat ? 'bg-[#0047AB] text-white' : 'bg-white/5 text-gray-400 hover:text-white'
            }`}
          >
            {cat === 'all' ? 'Tous' : cat}
          </button>
        ))}
      </div>

      {/* Influencers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {influencers.map((influencer) => (
          <div key={influencer.id} className="card-service rounded-xl p-4">
            <div className="flex gap-4">
              <img src={influencer.image} alt={influencer.name} className="w-16 h-16 rounded-full object-cover" />
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-white font-semibold">{influencer.name}</h3>
                  <span className="text-xs bg-[#0047AB]/20 text-[#0047AB] px-2 py-1 rounded">{influencer.category}</span>
                </div>
                <p className="text-xs text-gray-500 mb-2">{influencer.bio}</p>
                <div className="flex items-center gap-4 text-sm text-gray-400 mb-3">
                  <span>{formatFollowers(influencer.followers)} abonnés</span>
                  <span>{influencer.engagement_rate}% engagement</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#D4AF37] font-semibold">{influencer.price} CHF</span>
                  <button 
                    onClick={() => handleContact(influencer)}
                    className="px-4 py-1.5 bg-[#0047AB] text-white rounded-lg text-sm hover:bg-[#2E74D6] transition-colors"
                  >
                    Contacter
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="card-service rounded-xl p-6 border-[#D4AF37]/30 bg-gradient-to-r from-[#D4AF37]/5 to-transparent text-center">
        <Crown className="w-12 h-12 text-[#D4AF37] mx-auto mb-3" />
        <h3 className="text-white font-semibold mb-2">Devenez partenaire influenceur</h3>
        <p className="text-sm text-gray-400 mb-4">Bénéficiez d'un accompagnement personnalisé pour vos campagnes</p>
        <button className="btn-primary">Découvrir les partenariats</button>
      </div>

      {/* Contact Modal */}
      {showContactModal && selectedInfluencer && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="card-service rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-white mb-4">Contacter {selectedInfluencer.name}</h3>
            <div className="flex items-center gap-4 mb-4 p-3 bg-white/5 rounded-lg">
              <img src={selectedInfluencer.image} alt="" className="w-12 h-12 rounded-full object-cover" />
              <div>
                <p className="text-white font-medium">{selectedInfluencer.name}</p>
                <p className="text-sm text-gray-400">{formatFollowers(selectedInfluencer.followers)} abonnés • {selectedInfluencer.engagement_rate}%</p>
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-sm text-gray-400 mb-2">Votre message</label>
              <textarea
                value={contactMessage}
                onChange={(e) => setContactMessage(e.target.value)}
                placeholder="Présentez votre entreprise et votre proposition de collaboration..."
                className="input-dark w-full h-32"
              />
            </div>
            <div className="p-3 bg-[#D4AF37]/10 rounded-lg mb-4">
              <p className="text-sm text-gray-400">Budget estimé</p>
              <p className="text-xl font-bold text-[#D4AF37]">{selectedInfluencer.price} CHF</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowContactModal(false)} className="btn-secondary flex-1">Annuler</button>
              <button onClick={submitCollaboration} className="btn-primary flex-1">Envoyer la demande</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Invitations Clients Section
const InvitationsSection = () => {
  const [invitations, setInvitations] = useState([]);
  const [stats, setStats] = useState({ total_sent: 0, total_opened: 0, total_responses: 0, open_rate: 0, response_rate: 0 });
  const [showCreate, setShowCreate] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    type: 'question',
    title: '',
    message: '',
    target_audience: 'all',
    incentive: ''
  });

  const invitationTypes = [
    { id: 'question', name: 'Question suggestive', desc: 'Posez une question engageante à vos clients', icon: HelpCircle },
    { id: 'invitation', name: 'Invitation directe', desc: 'Invitez vos clients à un événement ou offre', icon: Send },
    { id: 'survey', name: 'Sondage', desc: 'Recueillez l\'avis de vos clients', icon: ClipboardList },
    { id: 'reminder', name: 'Rappel personnalisé', desc: 'Rappelez un service ou produit', icon: Bell },
  ];

  useEffect(() => {
    fetchInvitations();
  }, []);

  const fetchInvitations = async () => {
    try {
      const response = await clientInvitationsAPI.list();
      setInvitations(response.data.invitations || []);
      setStats(response.data.stats || {});
    } catch (error) {
      console.error('Error fetching invitations:', error);
    } finally {
      setLoading(false);
    }
  };

  const createInvitation = async () => {
    if (!formData.title || !formData.message) {
      toast.error('Veuillez remplir le titre et le message');
      return;
    }
    try {
      const response = await clientInvitationsAPI.create(formData);
      setInvitations([response.data, ...invitations]);
      setShowCreate(false);
      setFormData({ type: 'question', title: '', message: '', target_audience: 'all', incentive: '' });
      toast.success('Invitation envoyée avec succès !');
      fetchInvitations();
    } catch (error) {
      toast.error('Erreur lors de l\'envoi de l\'invitation');
    }
  };

  const deleteInvitation = async (id) => {
    try {
      await clientInvitationsAPI.delete(id);
      setInvitations(invitations.filter(i => i.id !== id));
      toast.success('Invitation supprimée');
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-[#0047AB] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="invitations-section">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
            Invitations Clients
          </h1>
          <p className="text-gray-400 mt-1">Envoyez des invitations et questions à vos clients</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="btn-primary flex items-center gap-2">
          <Send className="w-4 h-4" /> Nouvelle invitation
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card-service rounded-xl p-4">
          <p className="text-sm text-gray-400">Invitations envoyées</p>
          <p className="text-2xl font-bold text-[#0047AB]">{stats.total_sent?.toLocaleString()}</p>
        </div>
        <div className="card-service rounded-xl p-4">
          <p className="text-sm text-gray-400">Taux d'ouverture</p>
          <p className="text-2xl font-bold text-green-400">{stats.open_rate || 0}%</p>
        </div>
        <div className="card-service rounded-xl p-4">
          <p className="text-sm text-gray-400">Réponses</p>
          <p className="text-2xl font-bold text-[#D4AF37]">{stats.total_responses?.toLocaleString()}</p>
        </div>
        <div className="card-service rounded-xl p-4">
          <p className="text-sm text-gray-400">Taux de réponse</p>
          <p className="text-2xl font-bold text-purple-400">{stats.response_rate || 0}%</p>
        </div>
      </div>

      {/* Invitation Types */}
      <div className="card-service rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Types d'invitations</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {invitationTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => { setFormData({...formData, type: type.id}); setShowCreate(true); }}
              className="p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors text-left border border-transparent hover:border-[#0047AB]/50"
            >
              <type.icon className="w-8 h-8 text-[#0047AB] mb-3" />
              <h3 className="text-white font-medium mb-1">{type.name}</h3>
              <p className="text-xs text-gray-400">{type.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Recent Invitations */}
      <div className="card-service rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Invitations récentes</h2>
        {invitations.length > 0 ? (
          <div className="space-y-3">
            {invitations.map((inv) => (
              <div key={inv.id} className="p-4 bg-white/5 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className="text-white font-medium">{inv.title}</span>
                    <span className="text-xs bg-[#0047AB]/20 text-[#0047AB] px-2 py-1 rounded">{invitationTypes.find(t => t.id === inv.type)?.name}</span>
                  </div>
                  <button onClick={() => deleteInvitation(inv.id)} className="p-1 text-red-400 hover:bg-red-500/20 rounded">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-sm text-gray-400 mb-3">{inv.message}</p>
                <div className="flex gap-4 text-sm">
                  <span className="text-gray-400">Envoyées: <span className="text-white">{inv.sent_count}</span></span>
                  <span className="text-gray-400">Ouvertes: <span className="text-green-400">{inv.opened_count}</span></span>
                  <span className="text-gray-400">Réponses: <span className="text-[#D4AF37]">{inv.response_count}</span></span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Send className="w-12 h-12 text-gray-500 mx-auto mb-3" />
            <p className="text-gray-400">Aucune invitation envoyée</p>
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="card-service rounded-xl p-6 w-full max-w-lg">
            <h3 className="text-lg font-semibold text-white mb-6">Créer une invitation</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Type</label>
                <select value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})} className="input-dark w-full">
                  {invitationTypes.map((type) => (
                    <option key={type.id} value={type.id}>{type.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Titre *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="Ex: Envie de découvrir notre nouvelle collection ?"
                  className="input-dark w-full"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Message *</label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                  placeholder="Votre message personnalisé..."
                  className="input-dark w-full h-24"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Audience cible</label>
                <select value={formData.target_audience} onChange={(e) => setFormData({...formData, target_audience: e.target.value})} className="input-dark w-full">
                  <option value="all">Tous les clients</option>
                  <option value="new">Nouveaux clients</option>
                  <option value="loyal">Clients fidèles</option>
                  <option value="inactive">Clients inactifs</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Incentive (optionnel)</label>
                <input
                  type="text"
                  value={formData.incentive}
                  onChange={(e) => setFormData({...formData, incentive: e.target.value})}
                  placeholder="Ex: -10% sur votre prochaine commande"
                  className="input-dark w-full"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowCreate(false)} className="btn-secondary flex-1">Annuler</button>
              <button onClick={createInvitation} className="btn-primary flex-1">Envoyer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Subscriptions Section Component
const SubscriptionsSection = () => {
  const [plans, setPlans] = useState({});
  const [addons, setAddons] = useState({});
  const [baseFeatures, setBaseFeatures] = useState([]);
  const [currentSubscription, setCurrentSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [selectedAddons, setSelectedAddons] = useState([]);
  const [showAddons, setShowAddons] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');

  useEffect(() => {
    fetchPlansAndSubscription();
  }, []);

  const fetchPlansAndSubscription = async () => {
    try {
      const [plansRes, currentRes] = await Promise.all([
        subscriptionsAPI.getPlans(),
        subscriptionsAPI.getCurrent()
      ]);
      setPlans(plansRes.data.plans || {});
      setAddons(plansRes.data.addons || {});
      setBaseFeatures(plansRes.data.base_features || []);
      setCurrentSubscription(currentRes.data);
    } catch (error) {
      console.error('Error fetching plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (planId) => {
    try {
      const response = await subscriptionsAPI.createCheckout(planId, selectedAddons);
      window.location.href = response.data.url;
    } catch (error) {
      toast.error('Erreur lors de la création du paiement');
    }
  };

  const handleAddonPurchase = async (addonId) => {
    try {
      const response = await subscriptionsAPI.createAddonCheckout(addonId);
      window.location.href = response.data.url;
    } catch (error) {
      toast.error('Erreur lors de la création du paiement');
    }
  };

  const toggleAddon = (addonId) => {
    setSelectedAddons(prev => 
      prev.includes(addonId) 
        ? prev.filter(id => id !== addonId)
        : [...prev, addonId]
    );
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-CH', { style: 'decimal' }).format(price);
  };

  const getPlansByTier = (tier) => {
    return Object.entries(plans).filter(([_, plan]) => plan.tier === tier);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8" data-testid="subscriptions-section">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
            Abonnements
          </h1>
          <p className="text-gray-400 mt-1">Choisissez le forfait adapté à vos besoins</p>
        </div>
        {currentSubscription?.is_active && (
          <div className="px-4 py-2 bg-[#D4AF37]/20 rounded-lg border border-[#D4AF37]/30">
            <p className="text-sm text-gray-400">Abonnement actuel</p>
            <p className="text-[#D4AF37] font-semibold">{currentSubscription.plan_name}</p>
          </div>
        )}
      </div>

      {/* Base Features Banner */}
      <div className="card-service rounded-xl p-6 border-[#0047AB]/30 bg-[#0047AB]/5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-[#0047AB]/20 flex items-center justify-center">
            <Check className="w-5 h-5 text-[#0047AB]" />
          </div>
          <h2 className="text-lg font-semibold text-white">Inclus dans tous nos forfaits</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {baseFeatures.map((feature, index) => (
            <div key={index} className="flex items-center gap-2 text-sm text-gray-300">
              <Check className="w-4 h-4 text-[#0047AB] flex-shrink-0" />
              <span>{feature}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/10 pb-2">
        <button
          onClick={() => setActiveTab('basic')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'basic' ? 'bg-[#0047AB] text-white' : 'text-gray-400 hover:text-white'
          }`}
        >
          Forfaits de base
        </button>
        <button
          onClick={() => setActiveTab('premium')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'premium' ? 'bg-[#D4AF37] text-black' : 'text-gray-400 hover:text-white'
          }`}
        >
          Premium
        </button>
        <button
          onClick={() => setActiveTab('optimisation')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'optimisation' ? 'bg-gradient-to-r from-[#D4AF37] to-[#0047AB] text-white' : 'text-gray-400 hover:text-white'
          }`}
        >
          Optimisation d'entreprise
        </button>
        <button
          onClick={() => setActiveTab('addons')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'addons' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'
          }`}
        >
          Options à la carte
        </button>
      </div>

      {/* Basic Plans */}
      {activeTab === 'basic' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {getPlansByTier('basic').map(([planId, plan]) => (
            <div 
              key={planId} 
              className={`card-service rounded-xl p-6 relative overflow-hidden ${
                currentSubscription?.plan_id === planId ? 'border-[#D4AF37] ring-2 ring-[#D4AF37]/20' : ''
              }`}
            >
              {currentSubscription?.plan_id === planId && (
                <div className="absolute top-0 right-0 bg-[#D4AF37] text-black text-xs font-bold px-3 py-1 rounded-bl-lg">
                  ACTUEL
                </div>
              )}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                  <p className="text-3xl font-bold text-[#D4AF37] mt-2">
                    {formatPrice(plan.price)} <span className="text-base text-gray-400 font-normal">CHF/mois</span>
                  </p>
                </div>
                <Star className="w-8 h-8 text-[#0047AB]" />
              </div>
              <ul className="space-y-2 mb-6">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-gray-300">
                    <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <button
                onClick={() => handleSubscribe(planId)}
                disabled={currentSubscription?.plan_id === planId}
                className={`w-full py-3 rounded-lg font-medium transition-all ${
                  currentSubscription?.plan_id === planId
                    ? 'bg-white/10 text-gray-500 cursor-not-allowed'
                    : 'btn-primary'
                }`}
              >
                {currentSubscription?.plan_id === planId ? 'Abonnement actif' : 'Souscrire'}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Premium Plans */}
      {activeTab === 'premium' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {getPlansByTier('premium').map(([planId, plan]) => (
            <div 
              key={planId} 
              className={`card-service rounded-xl p-6 relative overflow-hidden border-[#D4AF37]/30 ${
                currentSubscription?.plan_id === planId ? 'border-[#D4AF37] ring-2 ring-[#D4AF37]/20' : ''
              }`}
            >
              {currentSubscription?.plan_id === planId && (
                <div className="absolute top-0 right-0 bg-[#D4AF37] text-black text-xs font-bold px-3 py-1 rounded-bl-lg">
                  ACTUEL
                </div>
              )}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#D4AF37] to-[#F3CF55]" />
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                  <p className="text-3xl font-bold text-[#D4AF37] mt-2">
                    {formatPrice(plan.price)} <span className="text-base text-gray-400 font-normal">CHF/mois</span>
                  </p>
                </div>
                <Crown className="w-8 h-8 text-[#D4AF37]" />
              </div>
              <ul className="space-y-2 mb-6 max-h-64 overflow-y-auto">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-gray-300">
                    <Check className="w-4 h-4 text-[#D4AF37] mt-0.5 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <button
                onClick={() => handleSubscribe(planId)}
                disabled={currentSubscription?.plan_id === planId}
                className={`w-full py-3 rounded-lg font-medium transition-all ${
                  currentSubscription?.plan_id === planId
                    ? 'bg-white/10 text-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-[#D4AF37] to-[#F3CF55] text-black hover:opacity-90'
                }`}
              >
                {currentSubscription?.plan_id === planId ? 'Abonnement actif' : 'Souscrire Premium'}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Optimisation Plans */}
      {activeTab === 'optimisation' && (
        <div className="space-y-6">
          <div className="card-service rounded-xl p-4 border-purple-500/30 bg-purple-500/5">
            <div className="flex items-center gap-2 text-purple-400">
              <Zap className="w-5 h-5" />
              <span className="font-medium">Forfaits Optimisation d'entreprise</span>
            </div>
            <p className="text-sm text-gray-400 mt-1">
              Solutions complètes pour maximiser la croissance et l'efficacité de votre entreprise
            </p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {getPlansByTier('optimisation').map(([planId, plan]) => (
              <div 
                key={planId} 
                className={`card-service rounded-xl p-6 relative overflow-hidden ${
                  currentSubscription?.plan_id === planId ? 'border-[#D4AF37] ring-2 ring-[#D4AF37]/20' : ''
                }`}
              >
                {currentSubscription?.plan_id === planId && (
                  <div className="absolute top-0 right-0 bg-[#D4AF37] text-black text-xs font-bold px-3 py-1 rounded-bl-lg">
                    ACTUEL
                  </div>
                )}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#D4AF37] via-purple-500 to-[#0047AB]" />
                <div className="mb-4">
                  <h3 className="text-lg font-bold text-white">{plan.name}</h3>
                  <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] to-purple-400 mt-2">
                    {formatPrice(plan.price)} <span className="text-sm text-gray-400 font-normal">CHF/mois</span>
                  </p>
                </div>
                <ul className="space-y-1.5 mb-6 max-h-48 overflow-y-auto text-xs">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-gray-300">
                      <Check className="w-3 h-3 text-purple-400 mt-0.5 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => handleSubscribe(planId)}
                  disabled={currentSubscription?.plan_id === planId}
                  className={`w-full py-2.5 rounded-lg font-medium text-sm transition-all ${
                    currentSubscription?.plan_id === planId
                      ? 'bg-white/10 text-gray-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-[#D4AF37] via-purple-500 to-[#0047AB] text-white hover:opacity-90'
                  }`}
                >
                  {currentSubscription?.plan_id === planId ? 'Actif' : 'Souscrire'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add-ons */}
      {activeTab === 'addons' && (
        <div className="space-y-6">
          <div className="card-service rounded-xl p-4 border-purple-500/30 bg-purple-500/5">
            <div className="flex items-center gap-2 text-purple-400">
              <Plus className="w-5 h-5" />
              <span className="font-medium">Options à la carte</span>
            </div>
            <p className="text-sm text-gray-400 mt-1">
              Ajoutez des fonctionnalités supplémentaires à votre forfait
            </p>
          </div>
          
          {/* Monthly Add-ons */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Options mensuelles</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(addons).filter(([_, addon]) => addon.type === 'monthly').map(([addonId, addon]) => (
                <div key={addonId} className="card-service rounded-xl p-4">
                  <div className="flex items-start justify-between mb-3">
                    <h4 className="text-white font-medium">{addon.name}</h4>
                    <span className="text-xs bg-white/10 px-2 py-1 rounded text-gray-400">Mensuel</span>
                  </div>
                  <p className="text-xl font-bold text-[#D4AF37] mb-4">
                    {formatPrice(addon.price)} <span className="text-sm text-gray-400 font-normal">CHF/mois</span>
                  </p>
                  <button
                    onClick={() => handleAddonPurchase(addonId)}
                    className="w-full py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white text-sm font-medium transition-colors"
                  >
                    Ajouter
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* One-time Add-ons */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Options ponctuelles</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(addons).filter(([_, addon]) => addon.type === 'one_time').map(([addonId, addon]) => (
                <div key={addonId} className="card-service rounded-xl p-4">
                  <div className="flex items-start justify-between mb-3">
                    <h4 className="text-white font-medium">{addon.name}</h4>
                    <span className="text-xs bg-green-500/20 px-2 py-1 rounded text-green-400">Unique</span>
                  </div>
                  <p className="text-xl font-bold text-[#D4AF37] mb-4">
                    {formatPrice(addon.price)} <span className="text-sm text-gray-400 font-normal">CHF</span>
                  </p>
                  <button
                    onClick={() => handleAddonPurchase(addonId)}
                    className="w-full py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white text-sm font-medium transition-colors"
                  >
                    Acheter
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnterpriseDashboard;
