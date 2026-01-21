import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, Users, Building2, ShoppingCart, CreditCard, BarChart3,
  CheckCircle, Award, Crown, TrendingUp, DollarSign, Eye, Settings
} from 'lucide-react';
import { adminAPI } from '../services/api';
import { toast } from 'sonner';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, usersRes] = await Promise.all([
          adminAPI.stats(),
          adminAPI.users()
        ]);
        setStats(statsRes.data);
        setUsers(usersRes.data.users);
      } catch (error) {
        console.error('Error fetching admin data:', error);
        toast.error('Accès non autorisé');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleVerifyUser = async (userId, isCertified = false, isLabeled = false) => {
    try {
      await adminAPI.verifyUser(userId, isCertified, isLabeled);
      toast.success('Utilisateur vérifié !');
      // Refresh users
      const response = await adminAPI.users();
      setUsers(response.data.users);
    } catch (error) {
      toast.error('Erreur lors de la vérification');
    }
  };

  const menuItems = [
    { id: 'overview', label: 'Vue d\'ensemble', icon: LayoutDashboard },
    { id: 'users', label: 'Utilisateurs', icon: Users },
    { id: 'enterprises', label: 'Entreprises', icon: Building2 },
    { id: 'orders', label: 'Commandes', icon: ShoppingCart },
    { id: 'payments', label: 'Paiements', icon: CreditCard },
    { id: 'settings', label: 'Paramètres', icon: Settings },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] pt-24 flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-[#0047AB] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (user?.email !== 'admin@titelli.com') {
    return (
      <div className="min-h-screen bg-[#050505] pt-24 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Accès refusé</h1>
          <p className="text-gray-400">Vous n'avez pas les droits d'accès à cette page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] pt-20" data-testid="admin-dashboard">
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 min-h-screen bg-[#0A0A0A] border-r border-white/5 fixed left-0 top-20 bottom-0 overflow-y-auto hidden lg:block">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center">
                <Crown className="w-6 h-6 text-red-500" />
              </div>
              <div>
                <p className="font-semibold text-white">Admin</p>
                <p className="text-xs text-gray-500">Tableau de bord</p>
              </div>
            </div>

            <nav className="space-y-1">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    activeTab === item.id
                      ? 'bg-red-500/20 text-red-500'
                      : 'text-gray-400 hover:bg-white/5 hover:text-white'
                  }`}
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
          {activeTab === 'overview' && stats && (
            <div className="space-y-8">
              <h1 className="text-2xl md:text-3xl font-bold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
                Tableau de bord Admin
              </h1>

              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="card-service rounded-xl p-6">
                  <div className="p-3 rounded-xl bg-[#0047AB]/20 w-fit mb-4">
                    <Users className="w-5 h-5 text-[#0047AB]" />
                  </div>
                  <p className="text-2xl font-bold text-white">{stats.stats.total_users}</p>
                  <p className="text-sm text-gray-400 mt-1">Utilisateurs</p>
                </div>
                <div className="card-service rounded-xl p-6">
                  <div className="p-3 rounded-xl bg-[#D4AF37]/20 w-fit mb-4">
                    <Building2 className="w-5 h-5 text-[#D4AF37]" />
                  </div>
                  <p className="text-2xl font-bold text-white">{stats.stats.total_enterprises}</p>
                  <p className="text-sm text-gray-400 mt-1">Entreprises</p>
                </div>
                <div className="card-service rounded-xl p-6">
                  <div className="p-3 rounded-xl bg-green-500/20 w-fit mb-4">
                    <ShoppingCart className="w-5 h-5 text-green-500" />
                  </div>
                  <p className="text-2xl font-bold text-white">{stats.stats.total_orders}</p>
                  <p className="text-sm text-gray-400 mt-1">Commandes</p>
                </div>
                <div className="card-service rounded-xl p-6">
                  <div className="p-3 rounded-xl bg-purple-500/20 w-fit mb-4">
                    <BarChart3 className="w-5 h-5 text-purple-500" />
                  </div>
                  <p className="text-2xl font-bold text-white">{stats.stats.total_reviews}</p>
                  <p className="text-sm text-gray-400 mt-1">Avis</p>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="card-service rounded-xl p-6">
                  <h2 className="text-lg font-bold text-white mb-4">Utilisateurs récents</h2>
                  <div className="space-y-3">
                    {stats.recent_users?.slice(0, 5).map((u) => (
                      <div key={u.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                        <div>
                          <p className="text-white font-medium">{u.first_name} {u.last_name}</p>
                          <p className="text-sm text-gray-400">{u.email}</p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          u.user_type === 'entreprise' ? 'bg-[#D4AF37]/20 text-[#D4AF37]' : 'bg-[#0047AB]/20 text-[#0047AB]'
                        }`}>
                          {u.user_type}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="card-service rounded-xl p-6">
                  <h2 className="text-lg font-bold text-white mb-4">Commandes récentes</h2>
                  <div className="space-y-3">
                    {stats.recent_orders?.length > 0 ? stats.recent_orders.slice(0, 5).map((o) => (
                      <div key={o.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                        <div>
                          <p className="text-white font-medium">#{o.id.slice(0, 8)}</p>
                          <p className="text-sm text-gray-400">{o.items?.length || 0} articles</p>
                        </div>
                        <p className="text-white font-medium">{o.total?.toFixed(2)} CHF</p>
                      </div>
                    )) : (
                      <p className="text-gray-500 text-center py-4">Aucune commande</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div>
              <h1 className="text-2xl font-bold text-white mb-8" style={{ fontFamily: 'Playfair Display, serif' }}>
                Gestion des utilisateurs
              </h1>
              <div className="card-service rounded-xl overflow-hidden">
                <table className="w-full">
                  <thead className="bg-white/5">
                    <tr>
                      <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">Utilisateur</th>
                      <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">Type</th>
                      <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">Statut</th>
                      <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.id} className="border-t border-white/5">
                        <td className="px-6 py-4">
                          <p className="text-white font-medium">{u.first_name} {u.last_name}</p>
                          <p className="text-sm text-gray-400">{u.email}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            u.user_type === 'entreprise' ? 'bg-[#D4AF37]/20 text-[#D4AF37]' : 'bg-[#0047AB]/20 text-[#0047AB]'
                          }`}>
                            {u.user_type}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            {u.is_verified && <span className="badge-certified text-xs">Vérifié</span>}
                            {u.is_certified && <span className="badge-certified text-xs">Certifié</span>}
                            {u.is_labeled && <span className="badge-labeled text-xs">Labellisé</span>}
                            {u.is_premium && <span className="badge-premium text-xs">Premium</span>}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleVerifyUser(u.id, true, false)}
                              className="px-3 py-1 bg-[#D4AF37]/20 text-[#D4AF37] rounded-lg text-xs hover:bg-[#D4AF37]/30"
                            >
                              Certifier
                            </button>
                            <button
                              onClick={() => handleVerifyUser(u.id, false, true)}
                              className="px-3 py-1 bg-green-500/20 text-green-500 rounded-lg text-xs hover:bg-green-500/30"
                            >
                              Labelliser
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {['enterprises', 'orders', 'payments', 'settings'].includes(activeTab) && (
            <div className="card-service rounded-xl p-12 text-center">
              <h2 className="text-xl font-bold text-white mb-4">
                {menuItems.find(m => m.id === activeTab)?.label}
              </h2>
              <p className="text-gray-400">Section en cours de développement</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
