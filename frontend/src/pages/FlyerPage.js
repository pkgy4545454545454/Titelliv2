import React, { useRef } from 'react';
import { Download, Phone, Mail, MapPin, Globe } from 'lucide-react';

const FlyerPage = () => {
  const flyerRef = useRef(null);
  
  const SITE_URL = "https://titelli.com";
  const QR_CODE_URL = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(SITE_URL)}`;
  
  const handleDownload = () => {
    // Use html2canvas to download as image (would need library)
    // For now, just open print dialog
    window.print();
  };

  return (
    <div className="min-h-screen bg-gray-900 py-8 px-4">
      {/* Download Button */}
      <div className="max-w-[800px] mx-auto mb-6 flex justify-end print:hidden">
        <button
          onClick={handleDownload}
          className="flex items-center gap-2 px-6 py-3 bg-[#0047AB] text-white rounded-xl hover:bg-[#0047AB]/80 transition-colors"
        >
          <Download className="w-5 h-5" />
          Télécharger / Imprimer le Flyer
        </button>
      </div>

      {/* Flyer Container - A4 Ratio */}
      <div 
        ref={flyerRef}
        className="max-w-[800px] mx-auto bg-black relative overflow-hidden shadow-2xl print:shadow-none"
        style={{ aspectRatio: '210/297' }}
      >
        {/* Background gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black via-black/95 to-black" />
        
        {/* Content Container */}
        <div className="relative z-10 h-full flex flex-col p-8 md:p-12">
          
          {/* HEADER - Logo & Tagline */}
          <div className="flex items-center gap-4 mb-8">
            <div className="flex items-center gap-3">
              {/* Logo placeholder - Blue T */}
              <div className="w-14 h-14 md:w-16 md:h-16 rounded-xl bg-gradient-to-br from-[#0047AB] to-[#0033A0] flex items-center justify-center shadow-lg shadow-blue-500/30">
                <span className="text-white font-bold text-3xl md:text-4xl" style={{ fontFamily: 'Playfair Display, serif' }}>T</span>
              </div>
              <div>
                <h1 className="text-white text-2xl md:text-3xl font-bold" style={{ fontFamily: 'Playfair Display, serif' }}>
                  Titelli
                </h1>
                <p className="text-gray-400 text-xs md:text-sm italic">
                  Tous les meilleurs prestataires sont sur Titelli
                </p>
              </div>
            </div>
          </div>

          {/* MAIN SLOGANS */}
          <div className="space-y-5 mb-8">
            {/* Slogan 1 */}
            <div className="bg-gradient-to-r from-white/10 to-transparent p-4 rounded-lg border-l-4 border-[#D4AF37]">
              <p className="text-white text-base md:text-lg font-bold leading-relaxed">
                Tous les meilleurs prestataires préférés de la région sont sur Titelli, les meilleures opportunités aussi.
              </p>
            </div>
            
            {/* Slogan 2 - RED accent */}
            <div className="bg-gradient-to-r from-red-600/20 to-transparent p-4 rounded-lg border-l-4 border-red-500">
              <p className="text-white text-base md:text-lg font-bold leading-relaxed">
                Ne cherchez plus vos clients, laissez-les vous trouver maintenant sur 
                <span className="text-red-400"> Titelli!</span>
              </p>
            </div>
            
            {/* Slogan 3 */}
            <div className="bg-gradient-to-r from-[#0047AB]/20 to-transparent p-4 rounded-lg border-l-4 border-[#0047AB]">
              <p className="text-white text-base md:text-lg font-bold leading-relaxed">
                Titelli accompagne ses clients tout au long de leurs journées de consommation, 
                <span className="text-[#D4AF37]"> devenez notre recommandation préférée !</span>
              </p>
            </div>
            
            {/* Slogan 4 - Question */}
            <div className="bg-gradient-to-r from-[#D4AF37]/20 to-transparent p-4 rounded-lg border-l-4 border-[#D4AF37]">
              <p className="text-white text-base md:text-lg font-bold leading-relaxed">
                Êtes-vous labellisés par un expert Suisse ? 
                <span className="text-gray-300 font-normal"> Soyez reconnu dans votre domaine d'activité auprès des professionnels.</span>
              </p>
            </div>
          </div>

          {/* WOMAN IMAGE - Centered */}
          <div className="flex-1 flex items-center justify-center relative mb-6">
            <div className="relative">
              {/* Glow effect */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0047AB]/30 to-transparent blur-3xl scale-125" />
              
              {/* Image */}
              <img
                src="https://static.prod-images.emergentagent.com/jobs/f4332303-e66b-4547-8bcc-769c9b82fc6d/images/d343b00951f2d8eec641ab219b9fc88c02f7bab65d4dc93d29c2315d2312032a.png"
                alt="Client satisfait sur Titelli"
                className="relative z-10 h-[250px] md:h-[320px] object-contain drop-shadow-2xl"
              />
            </div>
          </div>

          {/* CTA - Below woman */}
          <div className="text-center mb-8">
            <div className="inline-block bg-gradient-to-r from-[#0047AB] via-[#0047AB] to-red-600 p-[2px] rounded-xl">
              <div className="bg-black/90 px-6 py-4 rounded-xl">
                <p className="text-white text-lg md:text-xl font-bold">
                  Connectez-vous maintenant et profitez de vos 
                  <span className="text-[#D4AF37]"> innombrables avantages offerts</span> avec Titelli !
                </p>
              </div>
            </div>
          </div>

          {/* FOOTER - QR Code & Contact */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-6 border-t border-white/10">
            {/* QR Code */}
            <div className="flex items-center gap-4">
              <div className="bg-white p-2 rounded-lg">
                <img
                  src={QR_CODE_URL}
                  alt="QR Code Titelli"
                  className="w-20 h-20 md:w-24 md:h-24"
                />
              </div>
              <div>
                <p className="text-[#D4AF37] font-bold text-sm">Scannez-moi</p>
                <p className="text-gray-400 text-xs">pour accéder à Titelli</p>
              </div>
            </div>
            
            {/* Coordonnées */}
            <div className="text-right space-y-1">
              <div className="flex items-center justify-end gap-2 text-gray-300 text-sm">
                <Globe className="w-4 h-4 text-[#0047AB]" />
                <span>www.titelli.com</span>
              </div>
              <div className="flex items-center justify-end gap-2 text-gray-300 text-sm">
                <Mail className="w-4 h-4 text-[#0047AB]" />
                <span>contact@titelli.com</span>
              </div>
              <div className="flex items-center justify-end gap-2 text-gray-300 text-sm">
                <Phone className="w-4 h-4 text-[#0047AB]" />
                <span>+41 21 XXX XX XX</span>
              </div>
              <div className="flex items-center justify-end gap-2 text-gray-300 text-sm">
                <MapPin className="w-4 h-4 text-[#0047AB]" />
                <span>Lausanne, Suisse</span>
              </div>
            </div>
          </div>

          {/* Bottom brand bar */}
          <div className="mt-6 flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-transparent via-white/5 to-transparent">
            <span className="text-gray-500 text-xs">© 2024 Titelli - Tous droits réservés</span>
            <span className="text-[#D4AF37]">|</span>
            <span className="text-gray-500 text-xs">Swiss Quality</span>
          </div>
        </div>
      </div>

      {/* Print styles */}
      <style>{`
        @media print {
          body {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .print\\:hidden {
            display: none !important;
          }
          .print\\:shadow-none {
            box-shadow: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default FlyerPage;
