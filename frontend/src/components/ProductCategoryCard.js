import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Minus, ChevronRight, ChevronLeft } from 'lucide-react';

// Vidéos de fond pour les catégories de produits
const PRODUCT_CATEGORY_VIDEOS = {
  'Courses alimentaires': '/videos/courses_alimentaires.mp4',
  'Vêtements et accessoires de mode': '/videos/vetements_mode.mp4',
  'Tout pour mon enfant': '/videos/enfant.mp4',
  'Matériel de soins': '/videos/soins.mp4',
  'Maquillage et beauté': '/videos/maquillage_beaute.mp4',
  'Matériel de sport': '/videos/sport.mp4',
  'Matériel de loisirs': '/videos/loisirs.mp4',
  'Nécessaire voyages': '/videos/voyages.mp4',
  'Appareils électroniques': '/videos/electronique.mp4',
  'Matériel de bureautique': '/videos/bureautique.mp4',
  'Appareils électroménager': '/videos/electromenager.mp4',
  'Ameublement et décoration d\'intérieur': '/videos/ameublement.mp4',
  'Matériel artisanal': '/videos/artisanal.mp4',
  'Matériel de bricolage et jardinage': '/videos/bricolage.mp4',
  'Acheter un bien immobilier': '/videos/immobilier.mp4',
  'Automobiles': '/videos/automobiles.mp4',
  'Matériel de sécurité': '/videos/securite_produits.mp4',
  'Matériel animaux': '/videos/animaux.mp4',
  'Matériel professionnel': '/videos/professionnel.mp4',
  'Métaux précieux et matières premières': '/videos/metaux_precieux.mp4',
  'Haute joaillerie': '/videos/joaillerie.mp4',
  'Montres': '/videos/montres.mp4',
};

// Images de fallback pour les catégories de produits
const PRODUCT_CATEGORY_IMAGES = {
  'Courses alimentaires': 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800',
  'Vêtements et accessoires de mode': 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=800',
  'Tout pour mon enfant': 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=800',
  'Matériel de soins': 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=800',
  'Maquillage et beauté': 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=800',
  'Matériel de sport': 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800',
  'Matériel de loisirs': 'https://images.unsplash.com/photo-1511882150382-421056c89033?w=800',
  'Nécessaire voyages': 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800',
  'Appareils électroniques': 'https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=800',
  'Matériel de bureautique': 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800',
  'Appareils électroménager': 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800',
  'Ameublement et décoration d\'intérieur': 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800',
  'Matériel artisanal': 'https://images.unsplash.com/photo-1452860606245-08befc0ff44b?w=800',
  'Matériel de bricolage et jardinage': 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800',
  'Acheter un bien immobilier': 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800',
  'Automobiles': 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800',
  'Matériel de sécurité': 'https://images.unsplash.com/photo-1558002038-1055907df827?w=800',
  'Matériel animaux': 'https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=800',
  'Matériel professionnel': 'https://images.unsplash.com/photo-1504917595217-d4dc5ebb6122?w=800',
  'Métaux précieux et matières premières': 'https://images.unsplash.com/photo-1610375461246-83df859d849d?w=800',
  'Haute joaillerie': 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800',
  'Montres': 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800',
};

// Fonction pour nettoyer les titres
const cleanTitle = (title) => {
  if (!title) return '';
  return title.charAt(0).toUpperCase() + title.slice(1);
};

const ProductCategoryCard = ({ category, products = [] }) => {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [showSubcategories, setShowSubcategories] = useState(false);
  const [index, setIndex] = useState(0);

  const categoryVideo = PRODUCT_CATEGORY_VIDEOS[category];
  const categoryImage = PRODUCT_CATEGORY_IMAGES[category] || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800';
  const hasVideo = !!categoryVideo;

  const handleCategoryClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowSubcategories(!showSubcategories);
  };

  const handleViewAll = (e) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/products?category=${encodeURIComponent(category)}`);
  };

  const goNext = (e) => {
    e.stopPropagation();
    if (products.length > 0) {
      setIndex((prev) => (prev + 1) % products.length);
    }
  };

  const goPrev = (e) => {
    e.stopPropagation();
    if (products.length > 0) {
      setIndex((prev) => prev === 0 ? products.length - 1 : prev - 1);
    }
  };

  const currentProduct = products[index] || {};

  return (
    <div 
      className="shadow-sm hover:shadow-lg group block rounded-2xl overflow-hidden h-full transition-all relative cursor-pointer"
      onClick={handleViewAll}
      data-testid={`product-category-card-${category}`}
    >
      {/* CATEGORY LABEL with + button */}
      <div className="flex items-center justify-center gap-2 mb-3 relative">
        <button
          onClick={handleCategoryClick}
          className="flex items-center gap-2 text-black hover:text-[#0047AB] transition-colors"
          style={{ fontFamily: 'Playfair Display, serif' }}
          data-testid="product-category-toggle-btn"
        >
          <span className="font-medium text-sm">{cleanTitle(category)}</span>
          <span className="w-5 h-5 rounded-full border-2 border-current flex items-center justify-center text-xs">
            {showSubcategories ? <Minus className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
          </span>
        </button>
      </div>

      {/* SUBCATEGORIES DROPDOWN */}
      {showSubcategories && (
        <div 
          className="subcategories-menu absolute top-12 left-0 right-0 z-50 bg-white rounded-xl shadow-2xl border border-gray-100 p-3 animate-in slide-in-from-top-2 duration-300 max-h-[300px] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
          data-testid="product-subcategories-menu"
        >
          <div className="space-y-1">
            <button
              onClick={handleViewAll}
              className="w-full text-left px-3 py-2 text-sm font-semibold text-[#0047AB] bg-[#0047AB]/10 hover:bg-[#0047AB]/20 rounded-lg transition-colors"
              style={{ fontFamily: 'Playfair Display, serif' }}
              data-testid="view-all-products-btn"
            >
              Tout voir
            </button>
          </div>
        </div>
      )}

      {/* VIDEO/IMAGE Background */}
      <div className="relative h-28 sm:h-36 overflow-hidden">
        {hasVideo ? (
          <>
            <video
              ref={videoRef}
              src={categoryVideo}
              autoPlay
              loop
              muted
              playsInline
              onLoadedData={() => setVideoLoaded(true)}
              onError={() => setVideoLoaded(false)}
              className={`w-full h-full object-cover transition-all duration-500 rounded-2xl ${videoLoaded ? 'opacity-100' : 'opacity-0'}`}
            />
            {!videoLoaded && (
              <img
                src={categoryImage}
                alt={category}
                className="absolute inset-0 w-full h-full object-cover rounded-2xl"
              />
            )}
          </>
        ) : (
          <img
            src={categoryImage}
            alt={category}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 rounded-2xl"
          />
        )}

        {/* Navigation arrows */}
        {products.length > 1 && (
          <>
            <button
              onClick={goPrev}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"
              data-testid="prev-product"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={goNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"
              data-testid="next-product"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}
      </div>

      {/* CONTENT */}
      <div className="p-2 sm:p-3">
        {currentProduct.name ? (
          <>
            <h3 
              className="text-xs sm:text-sm font-semibold text-gray-900 group-hover:text-[#0047AB] transition-colors line-clamp-2 mb-2 text-center"
              style={{ fontFamily: 'Playfair Display, serif' }}
            >
              {cleanTitle(currentProduct.name)}
            </h3>
            {currentProduct.price && (
              <p className="text-sm font-bold text-[#0047AB] text-center mb-2">
                {currentProduct.price} CHF
              </p>
            )}
          </>
        ) : (
          <h3 
            className="text-xs sm:text-sm font-semibold text-gray-900 group-hover:text-[#0047AB] transition-colors line-clamp-2 mb-2 text-center"
            style={{ fontFamily: 'Playfair Display, serif' }}
          >
            {cleanTitle(category)}
          </h3>
        )}
        
        <button
          onClick={handleViewAll}
          className="w-full py-2.5 rounded-xl text-sm font-medium transition-all bg-[#0047AB] text-white hover:bg-[#0047AB]/90"
          style={{ fontFamily: 'Playfair Display, serif' }}
        >
          Découvrir
        </button>
      </div>
    </div>
  );
};

export default ProductCategoryCard;
