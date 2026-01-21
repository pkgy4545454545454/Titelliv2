import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Truck, Crown } from 'lucide-react';

const ServiceProductCard = ({ item, onAddToCart }) => {
  const {
    id,
    name,
    description,
    price,
    currency,
    type,
    images,
    is_premium,
    is_delivery
  } = item;

  const defaultImage = type === 'service' 
    ? 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=800'
    : 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800';

  return (
    <div 
      className="card-service group rounded-xl overflow-hidden"
      data-testid={`item-card-${id}`}
    >
      {/* Image */}
      <Link to={`/${type}/${id}`} className="block relative h-56 overflow-hidden">
        <img
          src={images?.[0] || defaultImage}
          alt={name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex gap-2">
          {is_premium && (
            <span className="badge-premium flex items-center gap-1">
              <Crown className="w-3 h-3" />
              Premium
            </span>
          )}
          {is_delivery && (
            <span className="px-2 py-1 bg-green-500/90 text-white text-xs rounded-full flex items-center gap-1">
              <Truck className="w-3 h-3" />
              Livraison
            </span>
          )}
        </div>

        {/* Type Badge */}
        <div className="absolute bottom-3 left-3">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
            type === 'service' ? 'bg-[#0047AB]/90 text-white' : 'bg-[#D4AF37]/90 text-black'
          }`}>
            {type === 'service' ? 'Service' : 'Produit'}
          </span>
        </div>
      </Link>

      {/* Content */}
      <div className="p-5">
        <Link to={`/${type}/${id}`}>
          <h3 className="text-lg font-semibold text-white group-hover:text-[#0047AB] transition-colors mb-2 line-clamp-1">
            {name}
          </h3>
        </Link>

        <p className="text-sm text-gray-400 mb-4 line-clamp-2">
          {description}
        </p>

        <div className="flex items-center justify-between">
          <span className="text-xl font-bold text-white">
            {price.toFixed(2)} <span className="text-sm text-gray-400">{currency}</span>
          </span>
          
          <button
            onClick={() => onAddToCart?.(item)}
            className="p-3 bg-[#0047AB] hover:bg-[#0047AB]/80 text-white rounded-full transition-all hover:scale-110"
            data-testid={`add-to-cart-${id}`}
          >
            <ShoppingCart className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ServiceProductCard;
