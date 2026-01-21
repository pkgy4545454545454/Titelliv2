import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Trash2, Plus, Minus, ArrowLeft, CreditCard, Building2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { orderAPI } from '../services/api';
import { toast } from 'sonner';

const CartPage = () => {
  const { items, removeItem, updateQuantity, clearCart, getTotal, getItemsByEnterprise } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [notes, setNotes] = useState('');

  const groupedItems = getItemsByEnterprise();
  const total = getTotal();

  const handleCheckout = async () => {
    if (!isAuthenticated) {
      toast.error('Connectez-vous pour passer commande');
      navigate('/auth');
      return;
    }

    if (items.length === 0) {
      toast.error('Votre panier est vide');
      return;
    }

    setLoading(true);
    
    try {
      // Create orders for each enterprise
      for (const group of groupedItems) {
        const orderData = {
          enterprise_id: group.enterprise_id,
          items: group.items.map(item => ({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity
          })),
          delivery_address: deliveryAddress || null,
          notes: notes || null
        };

        await orderAPI.create(orderData);
      }

      toast.success('Commande(s) créée(s) avec succès !');
      clearCart();
      navigate('/orders');
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error('Erreur lors de la commande');
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[#050505] pt-24 px-4" data-testid="cart-page">
        <div className="max-w-4xl mx-auto py-16 text-center">
          <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingCart className="w-12 h-12 text-gray-500" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
            Votre panier est vide
          </h1>
          <p className="text-gray-400 mb-8">
            Découvrez nos services et produits pour commencer vos achats
          </p>
          <div className="flex gap-4 justify-center">
            <Link to="/services" className="btn-primary">
              Voir les services
            </Link>
            <Link to="/products" className="btn-secondary">
              Voir les produits
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] pt-24 px-4" data-testid="cart-page">
      <div className="max-w-6xl mx-auto py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link to="/" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-2">
              <ArrowLeft className="w-4 h-4" />
              Continuer mes achats
            </Link>
            <h1 className="text-3xl font-bold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
              Mon Panier
            </h1>
          </div>
          <button 
            onClick={clearCart}
            className="text-red-400 hover:text-red-300 text-sm flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Vider le panier
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-6">
            {groupedItems.map((group) => (
              <div key={group.enterprise_id} className="card-service rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4 pb-4 border-b border-white/10">
                  <Building2 className="w-5 h-5 text-[#0047AB]" />
                  <Link 
                    to={`/entreprise/${group.enterprise_id}`}
                    className="font-semibold text-white hover:text-[#0047AB] transition-colors"
                  >
                    {group.enterprise_name}
                  </Link>
                </div>

                <div className="space-y-4">
                  {group.items.map((item) => (
                    <div key={item.id} className="flex gap-4 p-4 bg-white/5 rounded-xl">
                      {/* Image */}
                      <div className="w-20 h-20 rounded-lg bg-white/10 overflow-hidden flex-shrink-0">
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-500 text-xs">
                            Pas d'image
                          </div>
                        )}
                      </div>

                      {/* Details */}
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <div>
                            <h3 className="font-medium text-white">{item.name}</h3>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                              item.type === 'service' 
                                ? 'bg-[#0047AB]/20 text-[#0047AB]' 
                                : 'bg-[#D4AF37]/20 text-[#D4AF37]'
                            }`}>
                              {item.type === 'service' ? 'Service' : 'Produit'}
                            </span>
                          </div>
                          <button 
                            onClick={() => removeItem(item.id)}
                            className="text-gray-400 hover:text-red-400 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="flex items-center justify-between mt-3">
                          {/* Quantity */}
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="w-8 text-center text-white font-medium">{item.quantity}</span>
                            <button 
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>

                          {/* Price */}
                          <p className="text-lg font-bold text-white">
                            {(item.price * item.quantity).toFixed(2)} {item.currency}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="card-service rounded-xl p-6 sticky top-24">
              <h2 className="text-xl font-semibold text-white mb-6" style={{ fontFamily: 'Playfair Display, serif' }}>
                Récapitulatif
              </h2>

              {/* Delivery Address */}
              <div className="mb-4">
                <label className="block text-sm text-gray-400 mb-2">Adresse de livraison (optionnel)</label>
                <textarea
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  placeholder="Votre adresse..."
                  className="input-dark w-full h-20 resize-none"
                />
              </div>

              {/* Notes */}
              <div className="mb-6">
                <label className="block text-sm text-gray-400 mb-2">Notes (optionnel)</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Instructions spéciales..."
                  className="input-dark w-full h-20 resize-none"
                />
              </div>

              {/* Price Breakdown */}
              <div className="space-y-3 mb-6 pb-6 border-b border-white/10">
                <div className="flex justify-between text-gray-400">
                  <span>Sous-total</span>
                  <span>{total.toFixed(2)} CHF</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Frais de service</span>
                  <span>0.00 CHF</span>
                </div>
              </div>

              {/* Total */}
              <div className="flex justify-between mb-6">
                <span className="text-lg font-semibold text-white">Total</span>
                <span className="text-2xl font-bold text-[#D4AF37]">{total.toFixed(2)} CHF</span>
              </div>

              {/* Checkout Button */}
              <button
                onClick={handleCheckout}
                disabled={loading}
                className="btn-primary w-full py-4 flex items-center justify-center gap-2"
                data-testid="checkout-btn"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <CreditCard className="w-5 h-5" />
                    Passer la commande
                  </>
                )}
              </button>

              <p className="text-xs text-gray-500 text-center mt-4">
                Paiement sécurisé via Stripe
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
