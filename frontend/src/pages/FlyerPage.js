import React, { useRef } from 'react';
import { Download, Phone, Mail, MapPin, Globe } from 'lucide-react';

const FlyerPage = () => {
  const flyerRef = useRef(null);
  
  const SITE_URL = "https://titelli.com";
  const QR_CODE_URL = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(SITE_URL)}&bgcolor=ffffff&color=0047AB`;
  
  const handleDownload = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 py-8 px-4">
      {/* Download Button */}
      <div className="max-w-[595px] mx-auto mb-6 flex justify-center print:hidden">
        <button
          onClick={handleDownload}
          className="flex items-center gap-2 px-8 py-3 bg-[#0047AB] text-white rounded-full font-semibold hover:bg-[#003380] transition-all shadow-lg hover:shadow-xl"
        >
          <Download className="w-5 h-5" />
          Télécharger / Imprimer
        </button>
      </div>

      {/* Flyer Container - A4 Format - More professional */}
      <div 
        ref={flyerRef}
        className="max-w-[595px] mx-auto bg-white relative overflow-hidden shadow-2xl print:shadow-none"
        style={{ minHeight: '950px' }}
      >
        {/* Top accent bar */}
        <div className="h-2 bg-gradient-to-r from-[#0047AB] via-red-500 to-[#0047AB]" />
        
        {/* Content Container */}
        <div className="h-full flex flex-col px-8 py-6">
          
          {/* HEADER - Logo & Tagline */}
          <div className="flex items-center gap-4 mb-6 pb-4 border-b border-gray-100">
            {/* Logo */}
            <div className="w-14 h-14 rounded-xl bg-[#0047AB] flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-3xl" style={{ fontFamily: 'Playfair Display, serif' }}>T</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#0047AB]" style={{ fontFamily: 'Playfair Display, serif' }}>
                Titelli
              </h1>
              <p className="text-gray-500 text-xs italic tracking-wide">
                Tous les meilleurs prestataires sont sur Titelli
              </p>
            </div>
          </div>

          {/* MAIN TITLE */}
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 leading-tight" style={{ fontFamily: 'Playfair Display, serif' }}>
              Les meilleurs prestataires
              <br />
              <span className="text-[#0047AB]">de votre région</span>
            </h2>
          </div>

          {/* SLOGANS - Clean minimalist cards */}
          <div className="space-y-3 mb-6">
            <div className="p-4 bg-gradient-to-r from-gray-50 to-white border-l-4 border-[#0047AB] rounded-r-lg">
              <p className="text-gray-800 text-sm font-medium leading-relaxed">
                Tous les meilleurs prestataires préférés de la région sont sur Titelli, 
                <span className="text-[#0047AB] font-bold"> les meilleures opportunités aussi.</span>
              </p>
            </div>
            
            <div className="p-4 bg-gradient-to-r from-red-50 to-white border-l-4 border-red-500 rounded-r-lg">
              <p className="text-gray-800 text-sm font-medium leading-relaxed">
                Ne cherchez plus vos clients, 
                <span className="text-red-600 font-bold"> laissez-les vous trouver maintenant sur Titelli!</span>
              </p>
            </div>
            
            <div className="p-4 bg-gradient-to-r from-blue-50 to-white border-l-4 border-[#0047AB] rounded-r-lg">
              <p className="text-gray-800 text-sm font-medium leading-relaxed">
                Titelli accompagne ses clients tout au long de leurs journées de consommation, 
                <span className="text-[#D4AF37] font-bold"> devenez notre recommandation préférée!</span>
              </p>
            </div>

            <div className="p-4 bg-gradient-to-r from-amber-50 to-white border-l-4 border-[#D4AF37] rounded-r-lg">
              <p className="text-gray-800 text-sm font-medium leading-relaxed">
                <span className="font-bold">Êtes-vous labellisés par un expert Suisse?</span>
                <br />
                <span className="text-gray-600">Soyez reconnu dans votre domaine d'activité auprès des professionnels.</span>
              </p>
            </div>
          </div>

          {/* WOMAN IMAGE - Centered */}
          <div className="flex-1 flex items-center justify-center relative py-4">
            <div className="relative">
              {/* Subtle glow */}
              <div className="absolute inset-0 bg-[#0047AB]/10 blur-3xl scale-110 rounded-full" />
              
              {/* Image with elegant frame */}
              <div className="relative bg-gradient-to-b from-white to-gray-50 p-2 rounded-2xl shadow-xl">
                <img
                  src="https://static.prod-images.emergentagent.com/jobs/f4332303-e66b-4547-8bcc-769c9b82fc6d/images/d343b00951f2d8eec641ab219b9fc88c02f7bab65d4dc93d29c2315d2312032a.png"
                  alt="Réservez facilement sur Titelli"
                  className="h-[220px] object-contain rounded-xl"
                />
              </div>
            </div>
          </div>

          {/* CTA - Below woman */}
          <div className="text-center py-4 mb-4">
            <div className="inline-block bg-[#0047AB] px-6 py-4 rounded-xl shadow-lg">
              <p className="text-white text-base font-bold leading-snug">
                Connectez-vous maintenant et profitez de vos
                <br />
                <span className="text-[#D4AF37]">innombrables avantages offerts</span> avec Titelli!
              </p>
            </div>
          </div>

          {/* FOOTER - QR Code & Contact - Clean layout */}
          <div className="flex items-center justify-between gap-4 pt-4 border-t border-gray-200">
            {/* QR Code */}
            <div className="flex items-center gap-3">
              <div className="bg-white p-2 rounded-lg border-2 border-[#0047AB] shadow-md">
                <img
                  src={QR_CODE_URL}
                  alt="QR Code Titelli"
                  className="w-20 h-20"
                />
              </div>
              <div>
                <p className="text-[#0047AB] font-bold text-sm">Scannez-moi</p>
                <p className="text-gray-500 text-xs">Accédez à Titelli</p>
              </div>
            </div>
            
            {/* Coordonnées - Compact */}
            <div className="text-right space-y-1">
              <div className="flex items-center justify-end gap-2 text-gray-700 text-xs">
                <Globe className="w-3.5 h-3.5 text-[#0047AB]" />
                <span className="font-medium">www.titelli.com</span>
              </div>
              <div className="flex items-center justify-end gap-2 text-gray-700 text-xs">
                <Mail className="w-3.5 h-3.5 text-[#0047AB]" />
                <span>contact@titelli.com</span>
              </div>
              <div className="flex items-center justify-end gap-2 text-gray-700 text-xs">
                <Phone className="w-3.5 h-3.5 text-[#0047AB]" />
                <span>+41 21 XXX XX XX</span>
              </div>
              <div className="flex items-center justify-end gap-2 text-gray-700 text-xs">
                <MapPin className="w-3.5 h-3.5 text-[#0047AB]" />
                <span>Lausanne, Suisse</span>
              </div>
            </div>
          </div>

          {/* Bottom accent */}
          <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-center gap-3">
            <span className="text-gray-400 text-[10px]">© 2024 Titelli</span>
            <span className="w-1 h-1 rounded-full bg-[#D4AF37]" />
            <span className="text-gray-400 text-[10px]">Swiss Quality</span>
            <span className="w-1 h-1 rounded-full bg-[#D4AF37]" />
            <span className="text-gray-400 text-[10px]">Tous droits réservés</span>
          </div>
        </div>
      </div>

      {/* Print styles */}
      <style>{`
        @media print {
          body {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            background: white !important;
          }
          .print\\:hidden {
            display: none !important;
          }
          .print\\:shadow-none {
            box-shadow: none !important;
          }
          @page {
            size: A4;
            margin: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default FlyerPage;
