import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, Users, Building2, ShoppingCart, CreditCard, BarChart3,
  CheckCircle, Award, Crown, TrendingUp, DollarSign, Eye, Settings, Wallet,
  Download, Clock, XCircle, AlertCircle
} from 'lucide-react';
import { adminAPI } from '../services/api';
import { toast } from 'sonner';

// List of admin emails
const ADMIN_EMAILS = ['admin@titelli.com', 'spa.luxury@titelli.com'];

const AdminDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Withdrawals state
  const [withdrawals, setWithdrawals] = useState([]);
  const [withdrawalStats, setWithdrawalStats] = useState({});
  const [withdrawalFilter, setWithdrawalFilter] = useState(null);
  const [selectedWithdrawal, setSelectedWithdrawal] = useState(null);

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
    { id: 'withdrawals', label: 'Retraits', icon: Wallet },
    { id: 'users', label: 'Utilisateurs', icon: Users },
    { id: 'enterprises', label: 'Entreprises', icon: Building2 },
    { id: 'orders', label: 'Commandes', icon: ShoppingCart },
    { id: 'payments', label: 'Paiements', icon: CreditCard },
    { id: 'settings', label: 'Paramètres', icon: Settings },
  ];

  // Fetch withdrawals when tab changes
  useEffect(() => {
    if (activeTab === 'withdrawals') {
      fetchWithdrawals();
    }
  }, [activeTab, withdrawalFilter]);

  const fetchWithdrawals = async () => {
    try {
      const res = await adminAPI.withdrawals(withdrawalFilter);
      setWithdrawals(res.data.withdrawals || []);
      setWithdrawalStats(res.data.status_counts || {});
    } catch (error) {
      console.error('Error fetching withdrawals:', error);
    }
  };

  const handleUpdateWithdrawalStatus = async (withdrawalId, newStatus, adminNote = null) => {
    try {
      await adminAPI.updateWithdrawalStatus(withdrawalId, newStatus, adminNote);
      toast.success(`Statut mis à jour: ${newStatus}`);
      fetchWithdrawals();
      setSelectedWithdrawal(null);
    } catch (error) {
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const handleExportCSV = () => {
    const token = localStorage.getItem('token');
    const url = adminAPI.exportWithdrawalsCSV(withdrawalFilter);
    // Open in new window with auth header workaround
    window.open(`${url}&token=${token}`, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] pt-24 flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-[#0047AB] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!ADMIN_EMAILS.includes(user?.email)) {
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

          {activeTab === 'withdrawals' && (
            <div>
              <div className="flex items-center justify-between mb-8">
                <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
                  Gestion des retraits
                </h1>
                <button
                  onClick={handleExportCSV}
                  className="flex items-center gap-2 px-4 py-2 bg-[#D4AF37] text-black rounded-lg font-medium hover:bg-[#C4A030] transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Exporter CSV
                </button>
              </div>

              {/* Status Filter Cards */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                <button
                  onClick={() => setWithdrawalFilter(null)}
                  className={`card-service rounded-xl p-4 text-left transition-all ${!withdrawalFilter ? 'ring-2 ring-[#D4AF37]' : ''}`}
                >
                  <p className="text-2xl font-bold text-white">{Object.values(withdrawalStats).reduce((a, b) => a + b, 0)}</p>
                  <p className="text-sm text-gray-400">Tous</p>
                </button>
                <button
                  onClick={() => setWithdrawalFilter('manual_processing')}
                  className={`card-service rounded-xl p-4 text-left transition-all ${withdrawalFilter === 'manual_processing' ? 'ring-2 ring-yellow-500' : ''}`}
                >
                  <p className="text-2xl font-bold text-yellow-500">{withdrawalStats.manual_processing || 0}</p>
                  <p className="text-sm text-gray-400">En attente</p>
                </button>
                <button
                  onClick={() => setWithdrawalFilter('processing')}
                  className={`card-service rounded-xl p-4 text-left transition-all ${withdrawalFilter === 'processing' ? 'ring-2 ring-blue-500' : ''}`}
                >
                  <p className="text-2xl font-bold text-blue-500">{withdrawalStats.processing || 0}</p>
                  <p className="text-sm text-gray-400">En cours</p>
                </button>
                <button
                  onClick={() => setWithdrawalFilter('completed')}
                  className={`card-service rounded-xl p-4 text-left transition-all ${withdrawalFilter === 'completed' ? 'ring-2 ring-green-500' : ''}`}
                >
                  <p className="text-2xl font-bold text-green-500">{withdrawalStats.completed || 0}</p>
                  <p className="text-sm text-gray-400">Complétés</p>
                </button>
                <button
                  onClick={() => setWithdrawalFilter('failed')}
                  className={`card-service rounded-xl p-4 text-left transition-all ${withdrawalFilter === 'failed' ? 'ring-2 ring-red-500' : ''}`}
                >
                  <p className="text-2xl font-bold text-red-500">{withdrawalStats.failed || 0}</p>
                  <p className="text-sm text-gray-400">Échoués</p>
                </button>
              </div>

              {/* Withdrawals Table */}
              <div className="card-service rounded-xl overflow-hidden">
                <table className="w-full">
                  <thead className="bg-white/5">
                    <tr>
                      <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">Date</th>
                      <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">Utilisateur</th>
                      <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">IBAN</th>
                      <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">Montant</th>
                      <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">Statut</th>
                      <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {withdrawals.map((w) => (
                      <tr key={w.id} className="hover:bg-white/5">
                        <td className="px-6 py-4">
                          <p className="text-white text-sm">{new Date(w.created_at).toLocaleDateString('fr-FR')}</p>
                          <p className="text-gray-500 text-xs">{new Date(w.created_at).toLocaleTimeString('fr-FR')}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-white font-medium">{w.account_holder}</p>
                          <p className="text-gray-400 text-sm">{w.user_email}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-white font-mono text-sm">{w.iban}</p>
                          {w.bic_swift && <p className="text-gray-500 text-xs">BIC: {w.bic_swift}</p>}
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-[#D4AF37] font-bold">{w.amount.toFixed(2)} CHF</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            w.status === 'completed' ? 'bg-green-500/20 text-green-500' :
                            w.status === 'failed' ? 'bg-red-500/20 text-red-500' :
                            w.status === 'processing' ? 'bg-blue-500/20 text-blue-500' :
                            'bg-yellow-500/20 text-yellow-500'
                          }`}>
                            {w.status === 'completed' ? 'Complété' :
                             w.status === 'failed' ? 'Échoué' :
                             w.status === 'processing' ? 'En cours' :
                             w.status === 'manual_processing' ? 'En attente' : w.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            {w.status === 'manual_processing' && (
                              <>
                                <button
                                  onClick={() => handleUpdateWithdrawalStatus(w.id, 'completed')}
                                  className="p-2 bg-green-500/20 text-green-500 rounded-lg hover:bg-green-500/30 transition-colors"
                                  title="Marquer comme complété"
                                >
                                  <CheckCircle className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleUpdateWithdrawalStatus(w.id, 'failed')}
                                  className="p-2 bg-red-500/20 text-red-500 rounded-lg hover:bg-red-500/30 transition-colors"
                                  title="Marquer comme échoué (rembourse)"
                                >
                                  <XCircle className="w-4 h-4" />
                                </button>
                              </>
                            )}
                            <button
                              onClick={() => setSelectedWithdrawal(w)}
                              className="p-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
                              title="Voir détails"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {withdrawals.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                          Aucun retrait trouvé
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Withdrawal Detail Modal */}
              {selectedWithdrawal && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
                  <div className="card-service rounded-xl p-6 w-full max-w-lg">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-xl font-bold text-white">Détails du retrait</h2>
                      <button onClick={() => setSelectedWithdrawal(null)} className="text-gray-400 hover:text-white">×</button>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-400">Montant</p>
                          <p className="text-xl font-bold text-[#D4AF37]">{selectedWithdrawal.amount.toFixed(2)} CHF</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">Statut</p>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            selectedWithdrawal.status === 'completed' ? 'bg-green-500/20 text-green-500' :
                            selectedWithdrawal.status === 'failed' ? 'bg-red-500/20 text-red-500' :
                            'bg-yellow-500/20 text-yellow-500'
                          }`}>
                            {selectedWithdrawal.status}
                          </span>
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-sm text-gray-400">Titulaire</p>
                        <p className="text-white font-medium">{selectedWithdrawal.account_holder}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-gray-400">IBAN (complet)</p>
                        <p className="text-white font-mono bg-white/10 p-2 rounded">{selectedWithdrawal.iban}</p>
                      </div>
                      
                      {selectedWithdrawal.bic_swift && (
                        <div>
                          <p className="text-sm text-gray-400">BIC/SWIFT</p>
                          <p className="text-white font-mono">{selectedWithdrawal.bic_swift}</p>
                        </div>
                      )}
                      
                      <div>
                        <p className="text-sm text-gray-400">Email</p>
                        <p className="text-white">{selectedWithdrawal.user_email}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-gray-400">Date de demande</p>
                        <p className="text-white">{new Date(selectedWithdrawal.created_at).toLocaleString('fr-FR')}</p>
                      </div>
                      
                      {selectedWithdrawal.processing_note && (
                        <div>
                          <p className="text-sm text-gray-400">Note</p>
                          <p className="text-yellow-500 text-sm">{selectedWithdrawal.processing_note}</p>
                        </div>
                      )}
                      
                      {selectedWithdrawal.status === 'manual_processing' && (
                        <div className="flex gap-3 pt-4">
                          <button
                            onClick={() => handleUpdateWithdrawalStatus(selectedWithdrawal.id, 'completed')}
                            className="flex-1 py-3 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
                          >
                            <CheckCircle className="w-4 h-4" />
                            Marquer complété
                          </button>
                          <button
                            onClick={() => handleUpdateWithdrawalStatus(selectedWithdrawal.id, 'failed')}
                            className="flex-1 py-3 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
                          >
                            <XCircle className="w-4 h-4" />
                            Échoué (rembourse)
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
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
