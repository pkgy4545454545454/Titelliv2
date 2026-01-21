import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, Building2, User, ArrowLeft, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

const AuthPage = () => {
  const [searchParams] = useSearchParams();
  const defaultType = searchParams.get('type') || 'client';
  
  const [isLogin, setIsLogin] = useState(true);
  const [userType, setUserType] = useState(defaultType);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    phone: ''
  });

  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        await login(formData.email, formData.password);
        toast.success('Connexion réussie !');
      } else {
        await register({ ...formData, user_type: userType });
        toast.success('Inscription réussie !');
      }
      
      // Redirect based on user type
      navigate(userType === 'entreprise' ? '/dashboard/entreprise' : '/dashboard/client');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex" data-testid="auth-page">
      {/* Left Side - Image/Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative">
        <img 
          src="https://images.unsplash.com/photo-1733950489642-bd1a7c3e69bb?w=1920&q=80"
          alt="Lausanne"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#050505] via-[#050505]/50 to-transparent" />
        <div className="absolute inset-0 flex flex-col justify-center px-12">
          <Link to="/" className="flex items-center gap-3 mb-8">
            <div className="logo-circle">T</div>
            <span className="text-2xl font-bold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
              Titelli
            </span>
          </Link>
          <h1 className="text-4xl font-bold text-white mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
            Les meilleurs prestataires<br />de la région
          </h1>
          <p className="text-gray-300 text-lg max-w-md">
            Rejoignez notre communauté et découvrez les services et produits de qualité à Lausanne.
          </p>
        </div>
      </div>

      {/* Right Side - Auth Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Mobile Back Button */}
          <Link to="/" className="lg:hidden flex items-center gap-2 text-gray-400 hover:text-white mb-8">
            <ArrowLeft className="w-5 h-5" />
            Retour
          </Link>

          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="logo-circle">T</div>
            <span className="text-xl font-bold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
              Titelli
            </span>
          </div>

          {/* Title */}
          <h2 className="text-3xl font-bold text-white mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
            {isLogin ? 'Connexion' : 'Inscription'}
          </h2>
          <p className="text-gray-400 mb-8">
            {isLogin ? 'Bon retour parmi nous !' : 'Créez votre compte Titelli'}
          </p>

          {/* User Type Toggle (Registration only) */}
          {!isLogin && (
            <div className="flex gap-3 mb-8">
              <button
                type="button"
                onClick={() => setUserType('client')}
                className={`flex-1 flex items-center justify-center gap-3 p-4 rounded-xl border transition-all ${
                  userType === 'client'
                    ? 'bg-[#0047AB]/20 border-[#0047AB] text-white'
                    : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20'
                }`}
                data-testid="type-client-btn"
              >
                <User className="w-5 h-5" />
                <span className="font-medium">Client</span>
                {userType === 'client' && <CheckCircle className="w-4 h-4 text-[#0047AB]" />}
              </button>
              <button
                type="button"
                onClick={() => setUserType('entreprise')}
                className={`flex-1 flex items-center justify-center gap-3 p-4 rounded-xl border transition-all ${
                  userType === 'entreprise'
                    ? 'bg-[#D4AF37]/20 border-[#D4AF37] text-white'
                    : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20'
                }`}
                data-testid="type-entreprise-btn"
              >
                <Building2 className="w-5 h-5" />
                <span className="font-medium">Entreprise</span>
                {userType === 'entreprise' && <CheckCircle className="w-4 h-4 text-[#D4AF37]" />}
              </button>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Prénom</label>
                    <input
                      type="text"
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleChange}
                      required={!isLogin}
                      className="input-dark w-full"
                      placeholder="Jean"
                      data-testid="input-first-name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Nom</label>
                    <input
                      type="text"
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleChange}
                      required={!isLogin}
                      className="input-dark w-full"
                      placeholder="Dupont"
                      data-testid="input-last-name"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Téléphone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="input-dark w-full"
                    placeholder="+41 XX XXX XX XX"
                    data-testid="input-phone"
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="input-dark w-full"
                placeholder="exemple@email.com"
                data-testid="input-email"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Mot de passe</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="input-dark w-full pr-12"
                  placeholder="••••••••"
                  data-testid="input-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {isLogin && (
              <div className="flex justify-end">
                <button type="button" className="text-sm text-[#0047AB] hover:text-[#2E74D6]">
                  Mot de passe oublié ?
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-4 text-base disabled:opacity-50 disabled:cursor-not-allowed"
              data-testid="submit-btn"
            >
              {loading ? 'Chargement...' : isLogin ? 'Se connecter' : "S'inscrire"}
            </button>
          </form>

          {/* Toggle Login/Register */}
          <p className="text-center text-gray-400 mt-8">
            {isLogin ? "Pas encore de compte ?" : "Déjà un compte ?"}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="ml-2 text-[#0047AB] hover:text-[#2E74D6] font-medium"
              data-testid="toggle-auth-btn"
            >
              {isLogin ? "S'inscrire" : "Se connecter"}
            </button>
          </p>

          {/* Terms */}
          {!isLogin && (
            <p className="text-xs text-gray-500 text-center mt-6">
              En vous inscrivant, vous acceptez nos{' '}
              <Link to="/cgv" className="text-[#0047AB] hover:underline">CGV</Link>
              {' '}et notre{' '}
              <Link to="/mentions-legales" className="text-[#0047AB] hover:underline">politique de confidentialité</Link>.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
