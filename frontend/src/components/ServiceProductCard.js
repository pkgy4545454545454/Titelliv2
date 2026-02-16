import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Truck, Crown, Heart } from 'lucide-react';
import { wishlistAPI } from '../services/api';
import { toast } from 'sonner';

const ServiceProductCard = ({ item, onAddToCart }) => {
  const navigate = useNavigate();
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  
  const {
    id,
    name,
    description,
    price,
    currency,
    type,
    images,
    is_premium,
    is_delivery,
    enterprise_id,
    enterprise_name
  } = item;

  const handleToggleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const token = localStorage.getItem('titelli_token');
    if (!token) {
      toast.error('Connectez-vous pour ajouter aux favoris');
      navigate('/auth');
      return;
    }
    
    setWishlistLoading(true);
    try {
      if (isInWishlist) {
        await wishlistAPI.remove(id);
        setIsInWishlist(false);
        toast.success('Retiré des favoris');
      } else {
        await wishlistAPI.add({
          item_id: id,
          item_type: type,
          item_name: name,
          item_price: price,
          item_image: images?.[0] || '',
          enterprise_id: enterprise_id,
          enterprise_name: enterprise_name
        });
        setIsInWishlist(true);
        toast.success('Ajouté aux favoris !');
      }
    } catch (error) {
      const errorMsg = error.response?.data?.detail;
      if (typeof errorMsg === 'string') {
        toast.error(errorMsg);
      } else if (Array.isArray(errorMsg)) {
        toast.error(errorMsg[0]?.msg || 'Erreur de validation');
      } else {
        toast.error('Erreur lors de l\'ajout aux favoris');
      }
    } finally {
      setWishlistLoading(false);
    }
  };

  const defaultImage = type === 'service' 
    ? 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=800'
    : 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800';

  return (
    <div 
      className="bg-black border border-white/10 shadow-sm hover:shadow-md group rounded-xl overflow-hidden transition-all"
      data-testid={`item-card-${id}`}
    >
      {/* Image */}
      <Link to={`/${type}/${id}`} className="block relative h-40 sm:h-56 overflow-hidden">
        <img
          src={images?.[0] || defaultImage}
          alt={name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        
        {/* Badges */}
        <div className="absolute top-2 sm:top-3 left-2 sm:left-3 flex gap-1.5 sm:gap-2">
          {is_premium && (
            <span className="badge-premium flex items-center gap-0.5 sm:gap-1 text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1">
              <Crown className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
              <span className="hidden sm:inline">Premium</span>
            </span>
          )}
          {is_delivery && (
            <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-green-500/90 text-white text-[10px] sm:text-xs rounded-full flex items-center gap-0.5 sm:gap-1">
              <Truck className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
              <span className="hidden sm:inline">Livraison</span>
            </span>
          )}
        </div>

        {/* Wishlist Heart Button */}
        <button
          onClick={handleToggleWishlist}
          disabled={wishlistLoading}
          data-testid={`wishlist-btn-${id}`}
          className={`absolute top-2 sm:top-3 right-2 sm:right-3 p-1.5 sm:p-2 rounded-full transition-all ${
            isInWishlist 
              ? 'bg-red-500 text-white' 
              : 'bg-black/50 text-white hover:bg-red-500'
          }`}
        >
          <Heart className={`w-3 h-3 sm:w-4 sm:h-4 ${isInWishlist ? 'fill-white' : ''}`} />
        </button>

        {/* Type Badge */}
        <div className="absolute bottom-2 sm:bottom-3 left-2 sm:left-3">
          <span className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium ${
            type === 'service' ? 'bg-[#0047AB]/90 text-white' : 'bg-[#D4AF37]/90 text-black'
          }`}>
            {type === 'service' ? 'Service' : 'Produit'}
          </span>
        </div>
      </Link>

      {/* Content */}
      <div className="p-3 sm:p-5">
        <Link to={`/${type}/${id}`}>
          <h3 className="text-sm sm:text-lg font-semibold text-gray-900 group-hover:text-[#0047AB] transition-colors mb-1.5 sm:mb-2 line-clamp-1">
            {name}
          </h3>
        </Link>

        <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4 line-clamp-2">
          {description}
        </p>

        <div className="flex items-center justify-between">
          <span className="text-base sm:text-xl font-bold text-gray-900">
            {price.toFixed(2)} <span className="text-xs sm:text-sm text-gray-500">{currency}</span>
          </span>
          
          <button
            onClick={() => onAddToCart?.(item)}
            className="p-2 sm:p-3 bg-[#0047AB] hover:bg-[#0047AB]/80 text-white rounded-full transition-all hover:scale-110"
            data-testid={`add-to-cart-${id}`}
          >
            <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ServiceProductCard;
