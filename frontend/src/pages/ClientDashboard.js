import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, User, Heart, ShoppingCart, CreditCard, Wallet, Calendar, 
  MessageSquare, FileText, Settings, Gift, Crown, TrendingUp, MapPin,
  ChevronRight, Star, Bell, Search
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

  const menuItems = [
    { id: 'overview', label: 'Tableau de bord', icon: LayoutDashboard },
    { id: 'profile', label: 'Mon Profil', icon: User },
    { id: 'mode_vie', label: 'Mon mode de vie', icon: Heart },
    { id: 'orders', label: 'Mes commandes', icon: ShoppingCart },
    { id: 'cashback', label: 'Mon cash-back', icon: Wallet },
    { id: 'premium', label: 'Mon Premium', icon: Crown },
    { id: 'agenda', label: 'Mon agenda', icon: Calendar },
    { id: 'cartes', label: 'Mes cartes', icon: CreditCard },
    { id: 'finances', label: 'Mes finances', icon: FileText },
    { id: 'messages', label: 'Messagerie', icon: MessageSquare },
    { id: 'settings', label: 'Paramètres', icon: Settings },
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
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 min-h-screen bg-[#0A0A0A] border-r border-white/5 fixed left-0 top-20 bottom-0 overflow-y-auto hidden lg:block">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-full bg-[#0047AB] flex items-center justify-center text-white font-bold">
                {user?.first_name?.[0]}{user?.last_name?.[0]}
              </div>
              <div>
                <p className="font-semibold text-white">{user?.first_name} {user?.last_name}</p>
                <p className="text-xs text-gray-500">Espace client</p>
              </div>
            </div>

            <nav className="space-y-1">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    activeTab === item.id
                      ? 'bg-[#0047AB]/20 text-[#0047AB]'
                      : 'text-gray-400 hover:bg-white/5 hover:text-white'
                  }`}
                  data-testid={`menu-${item.id}`}
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </button>
              ))}
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 lg:ml-64 p-6 lg:p-8">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
                    Bonjour, {user?.first_name} !
                  </h1>
                  <p className="text-gray-400 mt-1">Bienvenue sur votre espace Titelli</p>
                </div>
                <Link to="/" className="btn-primary flex items-center gap-2">
                  <Search className="w-5 h-5" />
                  Explorer
                </Link>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {quickStats.map((stat, index) => (
                  <div key={index} className="card-service rounded-xl p-6">
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

          {/* Other tabs */}
          {['mode_vie', 'premium', 'agenda', 'cartes', 'finances', 'messages', 'settings'].includes(activeTab) && (
            <div className="card-service rounded-xl p-12 text-center">
              <h2 className="text-xl font-bold text-white mb-4">
                {menuItems.find(m => m.id === activeTab)?.label}
              </h2>
              <p className="text-gray-400">Cette section sera bientôt disponible</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default ClientDashboard;
