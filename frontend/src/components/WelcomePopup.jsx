import React, { useState, useEffect } from 'react';
import { X, Gift, Sparkles, QrCode, ArrowRight, Check } from 'lucide-react';
import API from '../services/api';

const WelcomePopup = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [promoCode, setPromoCode] = useState(null);
  const [isValidating, setIsValidating] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    // Vérifier si c'est la première visite
    const hasVisited = localStorage.getItem('titelli_visited');
    
    if (!hasVisited) {
      // Attendre un peu avant d'afficher la popup
      const timer = setTimeout(() => {
        setIsVisible(true);
        fetchPromoCode();
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, []);

  const fetchPromoCode = async () => {
    setIsValidating(true);
    try {
      // Valider le code promo BIENVENUE100 via l'API
      const response = await API.post('/api/promo/validate', { code: 'BIENVENUE100' });
      if (response.data.valid) {
        setPromoCode(response.data);
      }
    } catch (error) {
      console.error('Erreur validation code promo:', error);
    } finally {
      setIsValidating(false);
    }
  };

  const handleClose = () => {
    setIsVisible(false);
    // Marquer comme visité
    localStorage.setItem('titelli_visited', 'true');
    localStorage.setItem('titelli_first_visit_date', new Date().toISOString());
  };

  const handleCopyCode = () => {
    if (promoCode?.code) {
      navigator.clipboard.writeText(promoCode.code);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  const handleExplore = () => {
    handleClose();
    // Scroll vers les services ou rediriger
    window.location.href = '/media-pub';
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Overlay sombre */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={handleClose}
      />
      
      {/* Popup */}
      <div className="relative w-full max-w-lg bg-gradient-to-b from-[#0a0a0f] to-[#111118] rounded-2xl border border-white/10 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
        
        {/* Header avec gradient */}
        <div className="relative h-32 bg-gradient-to-r from-blue-600 via-blue-500 to-purple-600 overflow-hidden">
          {/* Particules décoratives */}
          <div className="absolute inset-0">
            <div className="absolute top-4 left-8 w-2 h-2 bg-white/30 rounded-full animate-pulse" />
            <div className="absolute top-12 right-12 w-3 h-3 bg-yellow-400/40 rounded-full animate-pulse delay-100" />
            <div className="absolute bottom-8 left-1/4 w-2 h-2 bg-white/20 rounded-full animate-pulse delay-200" />
            <div className="absolute top-6 right-1/3 w-1.5 h-1.5 bg-yellow-300/50 rounded-full animate-pulse delay-300" />
          </div>
          
          {/* Icône centrale */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/20">
              <Gift className="w-10 h-10 text-yellow-400" />
            </div>
          </div>
          
          {/* Bouton fermer */}
          <button 
            onClick={handleClose}
            className="absolute top-3 right-3 w-8 h-8 bg-black/30 backdrop-blur-sm rounded-full flex items-center justify-center text-white/70 hover:text-white hover:bg-black/50 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        
        {/* Contenu */}
        <div className="p-6 text-center">
          {/* Titre */}
          <h2 className="text-2xl font-bold text-white mb-2">
            Bienvenue sur <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Titelli</span> !
          </h2>
          
          <p className="text-gray-400 text-sm mb-6">
            Merci de votre confiance. Profitez de votre cadeau de bienvenue<br />
            et commencez à rentabiliser votre business !
          </p>
          
          {/* Code promo */}
          {isValidating ? (
            <div className="bg-white/5 rounded-xl p-4 mb-6 border border-white/10">
              <div className="animate-pulse flex items-center justify-center gap-2">
                <Sparkles className="w-5 h-5 text-yellow-400" />
                <span className="text-gray-400">Chargement de votre cadeau...</span>
              </div>
            </div>
          ) : promoCode ? (
            <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-xl p-4 mb-6 border border-yellow-500/30">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Sparkles className="w-5 h-5 text-yellow-400" />
                <span className="text-yellow-400 text-sm font-medium">VOTRE CODE PROMO</span>
                <Sparkles className="w-5 h-5 text-yellow-400" />
              </div>
              
              <button 
                onClick={handleCopyCode}
                className="group relative bg-[#0a0a0f] px-6 py-3 rounded-lg border border-yellow-500/50 hover:border-yellow-400 transition-all"
              >
                <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400">
                  {promoCode.code}
                </span>
                <div className="absolute -top-2 -right-2 bg-green-500 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {copySuccess ? (
                    <Check className="w-3 h-3 text-white" />
                  ) : (
                    <span className="text-[10px] text-white px-1">Copier</span>
                  )}
                </div>
              </button>
              
              <p className="text-white font-semibold mt-3">
                {promoCode.credit_amount} CHF de crédit publicitaire offert
              </p>
              <p className="text-gray-400 text-xs mt-1">
                {promoCode.description}
              </p>
            </div>
          ) : (
            <div className="bg-white/5 rounded-xl p-4 mb-6 border border-white/10">
              <p className="text-gray-400">Créez un compte entreprise pour profiter de votre cadeau !</p>
            </div>
          )}
          
          {/* Suggestions */}
          <div className="bg-white/5 rounded-xl p-4 mb-6 border border-white/10">
            <h3 className="text-white font-semibold mb-3 flex items-center justify-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              Découvrez nos prestations IA
            </h3>
            <div className="space-y-2 text-sm text-gray-300">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
                <span>Images publicitaires IA - <span className="text-green-400">Testez gratuitement !</span></span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-purple-400 rounded-full" />
                <span>Vidéos promotionnelles IA - Aperçu avant paiement</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full" />
                <span>Ciblage intelligent - Optimisez votre audience</span>
              </div>
            </div>
          </div>
          
          {/* Message bas */}
          <p className="text-gray-500 text-xs mb-4">
            Essayez sans engagement • Rentrez votre photo ou descriptif • Validez et payez si satisfait !
          </p>
          
          {/* Boutons */}
          <div className="flex gap-3">
            <button
              onClick={handleClose}
              className="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl border border-white/10 transition-all text-sm font-medium"
            >
              Plus tard
            </button>
            <button
              onClick={handleExplore}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-xl transition-all text-sm font-medium flex items-center justify-center gap-2"
            >
              Découvrir
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        {/* Footer */}
        <div className="px-6 py-3 bg-white/5 border-t border-white/10 text-center">
          <p className="text-gray-500 text-xs">
            🌐 www.titelli.com • La plateforme suisse de mise en relation
          </p>
        </div>
      </div>
    </div>
  );
};

export default WelcomePopup;
