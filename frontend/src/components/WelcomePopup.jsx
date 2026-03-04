import React, { useState, useEffect } from 'react';
import { X, Gift, Award, Phone, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';

const WelcomePopup = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [codeCopied, setCodeCopied] = useState(false);

  useEffect(() => {
    // Vérifier si c'est la première visite
    const hasVisited = localStorage.getItem('titelli_visited');
    
    if (!hasVisited) {
      // Attendre un peu avant d'afficher la popup
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    // Marquer comme visité
    localStorage.setItem('titelli_visited', 'true');
    localStorage.setItem('titelli_first_visit_date', new Date().toISOString());
  };

  const handleExplore = () => {
    handleClose();
    window.location.href = '/auth';
  };

  const copyCode = () => {
    navigator.clipboard.writeText('Neworldpourtoi');
    setCodeCopied(true);
    toast.success('Code copié !');
    setTimeout(() => setCodeCopied(false), 2000);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4">
      {/* Overlay sombre */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={handleClose}
      />
      
      {/* Popup */}
      <div className="relative w-full max-w-[380px] sm:max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
        
        {/* Bouton fermer */}
        <button 
          onClick={handleClose}
          className="absolute top-3 right-3 z-10 w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center text-gray-500 hover:text-gray-700 transition-all"
          data-testid="welcome-popup-close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header avec gradient */}
        <div className="bg-gradient-to-br from-[#0047AB] to-[#002266] p-6 sm:p-8 text-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-3" style={{ fontFamily: 'Playfair Display, serif' }}>
            Bienvenue parmi les meilleurs prestataires de la région
          </h1>
          <p className="text-white/90 text-sm sm:text-base">
            Tous représentés sur <span className="text-[#D4AF37] font-semibold">Titelli</span> !
          </p>
        </div>

        {/* Contenu */}
        <div className="p-5 sm:p-8 space-y-6">
          
          {/* Offre publicitaire */}
          <div className="bg-gradient-to-r from-[#D4AF37]/10 to-[#D4AF37]/5 rounded-xl p-4 sm:p-5 border border-[#D4AF37]/20">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-[#D4AF37]/20 rounded-lg flex-shrink-0">
                <Gift className="w-5 h-5 sm:w-6 sm:h-6 text-[#D4AF37]" />
              </div>
              <div className="flex-1">
                <p className="text-gray-800 text-sm sm:text-base leading-relaxed">
                  Profitez immédiatement de <span className="font-bold text-[#0047AB]">100.- de publicité</span> de votre choix offerte, utilisable sur toute votre page publicitaire !
                </p>
                
                {/* Code promo */}
                <div className="mt-3 flex items-center gap-2">
                  <span className="text-gray-600 text-sm">Code :</span>
                  <button
                    onClick={copyCode}
                    className="flex items-center gap-2 px-3 py-1.5 bg-[#0047AB] hover:bg-[#003080] text-white rounded-lg text-sm font-mono transition-all"
                  >
                    <span>Neworldpourtoi</span>
                    {codeCopied ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Labellisation */}
          <div className="bg-gray-50 rounded-xl p-4 sm:p-5">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-[#0047AB]/10 rounded-lg flex-shrink-0">
                <Phone className="w-5 h-5 sm:w-6 sm:h-6 text-[#0047AB]" />
              </div>
              <div>
                <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
                  De plus, un représentant prendra contact avec vous afin d'établir un bilan et de vous communiquer les critères nécessaires imposés par les experts afin de répondre à une de nos labellisations !
                </p>
              </div>
            </div>
          </div>

          {/* Message final */}
          <div className="flex items-center gap-3 justify-center">
            <div className="p-2 bg-green-100 rounded-full">
              <Award className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-gray-800 font-medium text-sm sm:text-base text-center">
              Soyez reconnu dans votre domaine d'activité auprès des professionnels.
            </p>
          </div>

          {/* Boutons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={handleClose}
              className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-all text-sm font-medium"
              data-testid="welcome-popup-later"
            >
              Plus tard
            </button>
            <button
              onClick={handleExplore}
              className="flex-1 px-4 py-3 bg-[#0047AB] hover:bg-[#003080] text-white rounded-xl transition-all text-sm font-medium"
              data-testid="welcome-popup-signup"
            >
              S'inscrire gratuitement
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomePopup;
