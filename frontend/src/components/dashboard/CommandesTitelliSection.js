import React, { useState, useEffect } from 'react';
import { 
  Package, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Download, 
  Eye,
  RefreshCw,
  Image,
  Calendar,
  DollarSign
} from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const CommandesTitelliSection = ({ enterpriseId }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (enterpriseId) {
      fetchOrders();
    }
  }, [enterpriseId]);

  // Auto-refresh pour les commandes en cours
  useEffect(() => {
    const hasProcessing = orders.some(o => o.status === 'processing');
    if (hasProcessing) {
      const interval = setInterval(fetchOrders, 10000); // Refresh toutes les 10s
      return () => clearInterval(interval);
    }
  }, [orders]);

  const fetchOrders = async () => {
    try {
      const response = await fetch(`${API_URL}/api/media-pub/orders?enterprise_id=${enterpriseId}`);
      const data = await response.json();
      setOrders(data.orders || []);
    } catch (error) {
      console.error('Erreur chargement commandes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchOrders();
    setRefreshing(false);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      processing: { color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50', icon: Clock, label: 'En cours' },
      completed: { color: 'bg-green-500/20 text-green-400 border-green-500/50', icon: CheckCircle, label: 'Terminée' },
      failed: { color: 'bg-red-500/20 text-red-400 border-red-500/50', icon: XCircle, label: 'Échec' },
      cancelled: { color: 'bg-gray-500/20 text-gray-400 border-gray-500/50', icon: XCircle, label: 'Annulée' }
    };
    
    const config = statusConfig[status] || statusConfig.processing;
    const Icon = config.icon;
    
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${config.color}`}>
        <Icon className="w-3 h-3" />
        {config.label}
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('fr-CH', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Package className="text-blue-400" />
            Commandes Titelli
          </h2>
          <p className="text-gray-400 text-sm mt-1">
            Vos publicités et créations personnalisées
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          Actualiser
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
          <p className="text-gray-400 text-sm">Total commandes</p>
          <p className="text-2xl font-bold text-white">{orders.length}</p>
        </div>
        <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
          <p className="text-gray-400 text-sm">En cours</p>
          <p className="text-2xl font-bold text-yellow-400">
            {orders.filter(o => o.status === 'processing').length}
          </p>
        </div>
        <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
          <p className="text-gray-400 text-sm">Terminées</p>
          <p className="text-2xl font-bold text-green-400">
            {orders.filter(o => o.status === 'completed').length}
          </p>
        </div>
        <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
          <p className="text-gray-400 text-sm">Total dépensé</p>
          <p className="text-2xl font-bold text-blue-400">
            {orders.filter(o => o.status === 'completed').reduce((sum, o) => sum + (o.price || 0), 0).toFixed(2)} CHF
          </p>
        </div>
      </div>

      {/* Orders List */}
      {orders.length === 0 ? (
        <div className="text-center py-12 bg-gray-800/30 rounded-xl border border-gray-700">
          <Image className="w-16 h-16 mx-auto text-gray-600 mb-4" />
          <h3 className="text-xl font-medium text-gray-400 mb-2">Aucune commande</h3>
          <p className="text-gray-500 mb-4">Créez votre première publicité personnalisée</p>
          <a
            href="/media-pub"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            Créer une publicité
          </a>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <div
              key={order.id}
              className="bg-gray-800/50 rounded-xl border border-gray-700 overflow-hidden hover:border-gray-600 transition-colors"
            >
              <div className="p-4 md:p-6">
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  {/* Image Preview */}
                  <div className="w-full md:w-32 h-32 bg-gray-700 rounded-lg overflow-hidden flex-shrink-0">
                    {order.status === 'completed' && order.image_url ? (
                      <img
                        src={order.image_url}
                        alt={order.template_name}
                        className="w-full h-full object-cover"
                      />
                    ) : order.status === 'processing' ? (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
                      </div>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Image className="w-8 h-8 text-gray-500" />
                      </div>
                    )}
                  </div>

                  {/* Order Details */}
                  <div className="flex-grow space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-white">{order.template_name}</h3>
                        <p className="text-sm text-gray-400">{order.template_category}</p>
                      </div>
                      {getStatusBadge(order.status)}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Slogan</p>
                        <p className="text-gray-300 truncate">{order.slogan}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Produit</p>
                        <p className="text-gray-300 truncate">{order.product_name}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {formatDate(order.created_at)}
                      </span>
                      <span className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4" />
                        {order.price} CHF
                      </span>
                      <span className="text-gray-500">#{order.id}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex md:flex-col gap-2">
                    {order.status === 'completed' && order.image_url && (
                      <>
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                          Voir
                        </button>
                        <a
                          href={order.image_url}
                          download
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm transition-colors"
                        >
                          <Download className="w-4 h-4" />
                          Télécharger
                        </a>
                      </>
                    )}
                    {order.status === 'processing' && (
                      <span className="text-xs text-yellow-400 animate-pulse">
                        Génération en cours...
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Image Preview Modal */}
      {selectedOrder && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedOrder(null)}
        >
          <div
            className="bg-gray-800 rounded-xl max-w-4xl max-h-[90vh] overflow-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-4 border-b border-gray-700 flex items-center justify-between">
              <h3 className="font-semibold text-white">{selectedOrder.template_name}</h3>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <div className="p-4">
              <img
                src={selectedOrder.image_url}
                alt={selectedOrder.template_name}
                className="w-full rounded-lg"
              />
              <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Slogan</p>
                  <p className="text-white">{selectedOrder.slogan}</p>
                </div>
                <div>
                  <p className="text-gray-500">Produit</p>
                  <p className="text-white">{selectedOrder.product_name}</p>
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <a
                  href={selectedOrder.image_url}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors"
                >
                  <Download className="w-5 h-5" />
                  Télécharger l'image
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommandesTitelliSection;
