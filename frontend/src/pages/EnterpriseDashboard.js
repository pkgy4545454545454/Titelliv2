import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, Building2, Package, ShoppingCart, Users, MessageSquare, 
  CreditCard, BarChart3, Settings, Bell, Plus, Edit, Trash2, Eye, 
  TrendingUp, DollarSign, Star, Calendar, FileText, Megaphone, ChevronRight
} from 'lucide-react';
import { enterpriseAPI, servicesProductsAPI, orderAPI, paymentAPI } from '../services/api';
import { toast } from 'sonner';

const EnterpriseDashboard = () => {
  const { user, isEnterprise } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [enterprise, setEnterprise] = useState(null);
  const [services, setServices] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isEnterprise) {
      navigate('/');
      return;
    }

    const fetchData = async () => {
      try {
        // Try to get existing enterprise
        const enterpriseRes = await enterpriseAPI.list({ search: user?.email });
        if (enterpriseRes.data.enterprises.length > 0) {
          const ent = enterpriseRes.data.enterprises.find(e => e.user_id === user?.id);
          if (ent) {
            setEnterprise(ent);
            const servicesRes = await servicesProductsAPI.list({ enterprise_id: ent.id });
            setServices(servicesRes.data.items);
          }
        }
        const ordersRes = await orderAPI.list();
        setOrders(ordersRes.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [isEnterprise, navigate, user]);

  const menuItems = [
    { id: 'overview', label: 'Tableau de bord', icon: LayoutDashboard },
    { id: 'profile', label: 'Profil entreprise', icon: Building2 },
    { id: 'services', label: 'Services & Produits', icon: Package },
    { id: 'orders', label: 'Commandes', icon: ShoppingCart },
    { id: 'publicites', label: 'Mes publicités', icon: Megaphone },
    { id: 'finances', label: 'Mes finances', icon: CreditCard },
    { id: 'personnel', label: 'Mon personnel', icon: Users },
    { id: 'messages', label: 'Messagerie', icon: MessageSquare },
    { id: 'settings', label: 'Paramètres', icon: Settings },
  ];

  const stats = [
    { label: 'Vues ce mois', value: '1,234', icon: Eye, trend: '+12%', color: 'text-[#0047AB]' },
    { label: 'Commandes', value: orders.length.toString(), icon: ShoppingCart, trend: '+5%', color: 'text-green-500' },
    { label: 'Revenus', value: '2,450 CHF', icon: DollarSign, trend: '+18%', color: 'text-[#D4AF37]' },
    { label: 'Note moyenne', value: enterprise?.rating?.toFixed(1) || '0.0', icon: Star, trend: '+0.2', color: 'text-yellow-500' },
  ];

  const handleSubscribe = async (plan) => {
    try {
      const response = await paymentAPI.createCheckout(plan);
      window.location.href = response.data.url;
    } catch (error) {
      toast.error('Erreur lors de la création du paiement');
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
        <aside className="w-64 min-h-screen bg-[#0A0A0A] border-r border-white/5 fixed left-0 top-20 bottom-0 overflow-y-auto hidden lg:block">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-xl bg-[#0047AB]/20 flex items-center justify-center">
                <Building2 className="w-6 h-6 text-[#0047AB]" />
              </div>
              <div>
                <p className="font-semibold text-white truncate max-w-[140px]">
                  {enterprise?.business_name || 'Mon Entreprise'}
                </p>
                <p className="text-xs text-gray-500">Espace entreprise</p>
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
                  <p className="text-gray-400 mt-1">Voici un aperçu de votre activité</p>
                </div>
                <button className="btn-primary flex items-center gap-2" data-testid="add-service-btn">
                  <Plus className="w-5 h-5" />
                  Ajouter
                </button>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, index) => (
                  <div key={index} className="card-service rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`p-3 rounded-xl bg-white/5 ${stat.color}`}>
                        <stat.icon className="w-5 h-5" />
                      </div>
                      <span className="text-green-500 text-sm font-medium">{stat.trend}</span>
                    </div>
                    <p className="text-2xl font-bold text-white">{stat.value}</p>
                    <p className="text-sm text-gray-400 mt-1">{stat.label}</p>
                  </div>
                ))}
              </div>

              {/* Quick Actions */}
              {!enterprise && (
                <div className="card-service rounded-xl p-8 text-center">
                  <Building2 className="w-16 h-16 text-[#0047AB] mx-auto mb-4" />
                  <h2 className="text-xl font-bold text-white mb-2">Créez votre profil entreprise</h2>
                  <p className="text-gray-400 mb-6">Commencez à exposer vos services aux clients de Lausanne</p>
                  <button 
                    onClick={() => setActiveTab('profile')}
                    className="btn-primary"
                    data-testid="create-profile-btn"
                  >
                    Créer mon profil
                  </button>
                </div>
              )}

              {/* Subscription Plans */}
              <div className="card-service rounded-xl p-6">
                <h2 className="text-xl font-bold text-white mb-6" style={{ fontFamily: 'Playfair Display, serif' }}>
                  Abonnements
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-6 bg-white/5 rounded-xl border border-white/10">
                    <h3 className="font-semibold text-white mb-2">Annuel</h3>
                    <p className="text-3xl font-bold text-white mb-4">250 <span className="text-sm text-gray-400">CHF/an</span></p>
                    <ul className="text-sm text-gray-400 space-y-2 mb-6">
                      <li>• Profil entreprise complet</li>
                      <li>• Exposition de vos services</li>
                      <li>• Réception de commandes</li>
                    </ul>
                    <button onClick={() => handleSubscribe('annual')} className="btn-secondary w-full" data-testid="subscribe-annual">
                      S'abonner
                    </button>
                  </div>
                  <div className="p-6 bg-gradient-to-br from-[#0047AB]/20 to-[#D4AF37]/20 rounded-xl border border-[#D4AF37]/30 relative">
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-[#D4AF37] text-black text-xs font-bold rounded-full">
                      POPULAIRE
                    </span>
                    <h3 className="font-semibold text-white mb-2">Premium Annuel</h3>
                    <p className="text-3xl font-bold text-white mb-4">540 <span className="text-sm text-gray-400">CHF/an</span></p>
                    <ul className="text-sm text-gray-400 space-y-2 mb-6">
                      <li>• Tout de l'abonnement Annuel</li>
                      <li>• Référencement préférentiel</li>
                      <li>• Badge Premium</li>
                      <li>• Support prioritaire</li>
                    </ul>
                    <button onClick={() => handleSubscribe('premium_annual')} className="btn-primary w-full" data-testid="subscribe-premium-annual">
                      S'abonner
                    </button>
                  </div>
                  <div className="p-6 bg-white/5 rounded-xl border border-white/10">
                    <h3 className="font-semibold text-white mb-2">Premium Mensuel</h3>
                    <p className="text-3xl font-bold text-white mb-4">45 <span className="text-sm text-gray-400">CHF/mois</span></p>
                    <ul className="text-sm text-gray-400 space-y-2 mb-6">
                      <li>• Mêmes avantages que Premium</li>
                      <li>• Flexibilité mensuelle</li>
                      <li>• Sans engagement</li>
                    </ul>
                    <button onClick={() => handleSubscribe('premium_monthly')} className="btn-secondary w-full" data-testid="subscribe-premium-monthly">
                      S'abonner
                    </button>
                  </div>
                </div>
              </div>

              {/* Recent Orders */}
              <div className="card-service rounded-xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
                    Commandes récentes
                  </h2>
                  <button onClick={() => setActiveTab('orders')} className="text-[#0047AB] text-sm font-medium flex items-center gap-1">
                    Voir tout <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
                {orders.length > 0 ? (
                  <div className="space-y-4">
                    {orders.slice(0, 5).map((order) => (
                      <div key={order.id} className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                        <div>
                          <p className="text-white font-medium">Commande #{order.id.slice(0, 8)}</p>
                          <p className="text-sm text-gray-400">{order.items?.length || 0} articles</p>
                        </div>
                        <div className="text-right">
                          <p className="text-white font-medium">{order.total?.toFixed(2)} CHF</p>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            order.status === 'completed' ? 'bg-green-500/20 text-green-500' :
                            order.status === 'pending' ? 'bg-yellow-500/20 text-yellow-500' :
                            'bg-gray-500/20 text-gray-500'
                          }`}>
                            {order.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">Aucune commande pour le moment</p>
                )}
              </div>
            </div>
          )}

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <EnterpriseProfileForm enterprise={enterprise} setEnterprise={setEnterprise} />
          )}

          {/* Services Tab */}
          {activeTab === 'services' && (
            <ServicesTab services={services} setServices={setServices} enterpriseId={enterprise?.id} />
          )}

          {/* Orders Tab */}
          {activeTab === 'orders' && (
            <OrdersTab orders={orders} />
          )}

          {/* Other tabs show coming soon */}
          {['publicites', 'finances', 'personnel', 'messages', 'settings'].includes(activeTab) && (
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

// Enterprise Profile Form Component
const EnterpriseProfileForm = ({ enterprise, setEnterprise }) => {
  const [formData, setFormData] = useState({
    business_name: enterprise?.business_name || '',
    slogan: enterprise?.slogan || '',
    description: enterprise?.description || '',
    category: enterprise?.category || '',
    address: enterprise?.address || '',
    phone: enterprise?.phone || '',
    email: enterprise?.email || '',
    website: enterprise?.website || ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (enterprise) {
        await enterpriseAPI.update(enterprise.id, formData);
        toast.success('Profil mis à jour !');
      } else {
        const response = await enterpriseAPI.create(formData);
        setEnterprise(response.data);
        toast.success('Profil créé !');
      }
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Erreur');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-white mb-8" style={{ fontFamily: 'Playfair Display, serif' }}>
        {enterprise ? 'Modifier le profil' : 'Créer le profil entreprise'}
      </h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Nom de l'entreprise *</label>
          <input
            type="text"
            value={formData.business_name}
            onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
            required
            className="input-dark w-full"
            data-testid="input-business-name"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Slogan</label>
          <input
            type="text"
            value={formData.slogan}
            onChange={(e) => setFormData({ ...formData, slogan: e.target.value })}
            className="input-dark w-full"
            placeholder="Votre slogan accrocheur"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Description *</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            required
            rows={4}
            className="input-dark w-full resize-none"
            data-testid="input-description"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Catégorie *</label>
          <input
            type="text"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            required
            className="input-dark w-full"
            placeholder="ex: Restauration, Soins esthétiques..."
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Adresse *</label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              required
              className="input-dark w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Téléphone *</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              required
              className="input-dark w-full"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Email *</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              className="input-dark w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Site web</label>
            <input
              type="url"
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              className="input-dark w-full"
              placeholder="https://..."
            />
          </div>
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full py-4" data-testid="submit-profile">
          {loading ? 'Chargement...' : enterprise ? 'Mettre à jour' : 'Créer le profil'}
        </button>
      </form>
    </div>
  );
};

// Services Tab Component
const ServicesTab = ({ services, setServices, enterpriseId }) => {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    type: 'service',
    is_delivery: false
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!enterpriseId) {
      toast.error('Créez d\'abord votre profil entreprise');
      return;
    }
    setLoading(true);
    try {
      const response = await servicesProductsAPI.create({
        ...formData,
        price: parseFloat(formData.price)
      });
      setServices([...services, response.data]);
      setShowForm(false);
      setFormData({ name: '', description: '', price: '', category: '', type: 'service', is_delivery: false });
      toast.success('Service/Produit ajouté !');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Erreur');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer ce service/produit ?')) return;
    try {
      await servicesProductsAPI.delete(id);
      setServices(services.filter(s => s.id !== id));
      toast.success('Supprimé !');
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
          Services & Produits
        </h1>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Ajouter
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="card-service rounded-xl p-6 mb-8 space-y-4">
          <div className="flex gap-4 mb-4">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, type: 'service' })}
              className={`flex-1 py-3 rounded-xl font-medium transition-all ${
                formData.type === 'service' ? 'bg-[#0047AB] text-white' : 'bg-white/5 text-gray-400'
              }`}
            >
              Service
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, type: 'product' })}
              className={`flex-1 py-3 rounded-xl font-medium transition-all ${
                formData.type === 'product' ? 'bg-[#D4AF37] text-black' : 'bg-white/5 text-gray-400'
              }`}
            >
              Produit
            </button>
          </div>
          <input
            type="text"
            placeholder="Nom"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            className="input-dark w-full"
          />
          <textarea
            placeholder="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            required
            className="input-dark w-full resize-none"
            rows={3}
          />
          <div className="grid grid-cols-2 gap-4">
            <input
              type="number"
              step="0.01"
              placeholder="Prix (CHF)"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              required
              className="input-dark w-full"
            />
            <input
              type="text"
              placeholder="Catégorie"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              required
              className="input-dark w-full"
            />
          </div>
          <label className="flex items-center gap-3 text-gray-300">
            <input
              type="checkbox"
              checked={formData.is_delivery}
              onChange={(e) => setFormData({ ...formData, is_delivery: e.target.checked })}
              className="w-5 h-5 rounded bg-white/5 border-white/10"
            />
            Livraison disponible
          </label>
          <div className="flex gap-4">
            <button type="button" onClick={() => setShowForm(false)} className="btn-secondary flex-1">
              Annuler
            </button>
            <button type="submit" disabled={loading} className="btn-primary flex-1">
              {loading ? 'Ajout...' : 'Ajouter'}
            </button>
          </div>
        </form>
      )}

      {services.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map((item) => (
            <div key={item.id} className="card-service rounded-xl p-4">
              <div className="flex items-start justify-between mb-3">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  item.type === 'service' ? 'bg-[#0047AB]/20 text-[#0047AB]' : 'bg-[#D4AF37]/20 text-[#D4AF37]'
                }`}>
                  {item.type === 'service' ? 'Service' : 'Produit'}
                </span>
                <button onClick={() => handleDelete(item.id)} className="text-red-500 hover:text-red-400">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <h3 className="text-white font-semibold mb-2">{item.name}</h3>
              <p className="text-sm text-gray-400 mb-3 line-clamp-2">{item.description}</p>
              <p className="text-lg font-bold text-white">{item.price?.toFixed(2)} CHF</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500">
          <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>Aucun service ou produit</p>
        </div>
      )}
    </div>
  );
};

// Orders Tab Component
const OrdersTab = ({ orders }) => {
  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-8" style={{ fontFamily: 'Playfair Display, serif' }}>
        Commandes
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
                  {order.status === 'pending' ? 'En attente' : order.status === 'completed' ? 'Terminée' : order.status}
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
        <div className="text-center py-12 text-gray-500">
          <ShoppingCart className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>Aucune commande pour le moment</p>
        </div>
      )}
    </div>
  );
};

export default EnterpriseDashboard;
