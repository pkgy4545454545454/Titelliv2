import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Facebook, Instagram, Twitter, Linkedin } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#0A0A0A] border-t border-white/5" data-testid="main-footer">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div>
            <Link to="/" className="flex items-center gap-3 mb-6">
              <img src="/logo_titelli.png" alt="Titelli" className="w-10 h-10 object-contain" />
              <span className="font-semibold text-xl" style={{ fontFamily: 'Playfair Display, serif' }}>
                Titelli
              </span>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              Les meilleurs prestataires de la région de Lausanne. Découvrez des services et produits de qualité, certifiés et labellisés.
            </p>
            <div className="flex gap-4">
              <a href="#" className="p-2 bg-white/5 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-colors">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="#" className="p-2 bg-white/5 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-colors">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="#" className="p-2 bg-white/5 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-colors">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#" className="p-2 bg-white/5 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-colors">
                <Linkedin className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-white font-semibold mb-6">Navigation</h4>
            <ul className="space-y-3">
              <li><Link to="/" className="text-gray-400 hover:text-white text-sm transition-colors">Accueil</Link></li>
              <li><Link to="/services" className="text-gray-400 hover:text-white text-sm transition-colors">Services</Link></li>
              <li><Link to="/products" className="text-gray-400 hover:text-white text-sm transition-colors">Produits</Link></li>
              <li><Link to="/entreprises" className="text-gray-400 hover:text-white text-sm transition-colors">Entreprises</Link></li>
              <li><Link to="/certifies" className="text-gray-400 hover:text-white text-sm transition-colors">Certifiés</Link></li>
              <li><Link to="/labellises" className="text-gray-400 hover:text-white text-sm transition-colors">Labellisés</Link></li>
              <li><Link to="/premium" className="text-gray-400 hover:text-white text-sm transition-colors">Premium</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-white font-semibold mb-6">Informations</h4>
            <ul className="space-y-3">
              <li><Link to="/about" className="text-gray-400 hover:text-white text-sm transition-colors">À propos</Link></li>
              <li><Link to="/cgv" className="text-gray-400 hover:text-white text-sm transition-colors">Conditions Générales de Vente</Link></li>
              <li><Link to="/mentions-legales" className="text-gray-400 hover:text-white text-sm transition-colors">Mentions Légales</Link></li>
              <li><Link to="/partenaires" className="text-gray-400 hover:text-white text-sm transition-colors">Partenaires</Link></li>
              <li><Link to="/service-client" className="text-gray-400 hover:text-white text-sm transition-colors">Service Client</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-6">Contact</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-[#0047AB] flex-shrink-0 mt-0.5" />
                <span className="text-gray-400 text-sm">Lausanne, Suisse</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-[#0047AB] flex-shrink-0" />
                <span className="text-gray-400 text-sm">+41 XX XXX XX XX</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-[#0047AB] flex-shrink-0" />
                <span className="text-gray-400 text-sm">contact@titelli.com</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-sm">
            © {currentYear} Titelli. Tous droits réservés.
          </p>
          <div className="flex items-center gap-2">
            <span className="text-gray-500 text-sm">Paiements sécurisés</span>
            <div className="flex items-center gap-2 ml-2">
              <div className="px-2 py-1 bg-white/5 rounded text-xs text-gray-400">Visa</div>
              <div className="px-2 py-1 bg-white/5 rounded text-xs text-gray-400">Mastercard</div>
              <div className="px-2 py-1 bg-white/5 rounded text-xs text-gray-400">Stripe</div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
