import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, Building2, User, ArrowLeft, CheckCircle, Lock, Mail, Phone, UserCircle, Shield, Sparkles, Award, Crown } from 'lucide-react';
import { toast } from 'sonner';

const AuthPage = () => {
  const [searchParams] = useSearchParams();
  const defaultType = searchParams.get('type') || 'client';
  
  const [isLogin, setIsLogin] = useState(true);
  const [userType, setUserType] = useState(defaultType);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // Multi-step registration
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    first_name: '',
    last_name: '',
    phone: '',
    acceptTerms: false,
    business_name: '',
    business_category: ''
  });

  const { login, register } = useAuth();
  const navigate = useNavigate();

  // Password strength calculator
  useEffect(() => {
    const password = formData.password;
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 25;
    if (/[^A-Za-z0-9]/.test(password)) strength += 25;
    setPasswordStrength(strength);
  }, [formData.password]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
  };

  const validateStep1 = () => {
    if (!formData.first_name || !formData.last_name) {
      toast.error('Veuillez remplir votre nom et prénom');
      return false;
    }
    if (userType === 'entreprise' && !formData.business_name) {
      toast.error("Veuillez entrer le nom de votre entreprise");
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Email invalide');
      return false;
    }
    if (formData.password.length < 8) {
      toast.error('Le mot de passe doit contenir au moins 8 caractères');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas');
      return false;
    }
    if (!formData.acceptTerms) {
      toast.error('Veuillez accepter les conditions générales');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isLogin && step === 1) {
      if (validateStep1()) setStep(2);
      return;
    }

    if (!isLogin && !validateStep2()) return;

    setLoading(true);

    try {
      let loggedUser;
      if (isLogin) {
        loggedUser = await login(formData.email, formData.password);
        toast.success('Connexion réussie !');
      } else {
        loggedUser = await register({ 
          ...formData, 
          user_type: userType,
          business_name: userType === 'entreprise' ? formData.business_name : undefined
        });
        toast.success('Inscription réussie ! Bienvenue sur Titelli');
      }
      
      const redirectType = loggedUser?.user_type || userType;
      navigate(redirectType === 'entreprise' ? '/dashboard/entreprise' : '/dashboard/client');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const getStrengthColor = () => {
    if (passwordStrength < 50) return 'bg-red-500';
    if (passwordStrength < 75) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getStrengthText = () => {
    if (passwordStrength < 25) return 'Très faible';
    if (passwordStrength < 50) return 'Faible';
    if (passwordStrength < 75) return 'Moyen';
    if (passwordStrength < 100) return 'Fort';
    return 'Très fort';
  };

  const benefits = userType === 'entreprise' ? [
    { icon: Award, text: 'Profil prestataire professionnel' },
    { icon: Sparkles, text: 'Visibilité auprès de milliers de clients' },
    { icon: Crown, text: 'Outils marketing avancés' },
  ] : [
    { icon: CheckCircle, text: 'Accès aux meilleurs prestataires' },
    { icon: Sparkles, text: 'Offres exclusives et promotions' },
    { icon: Shield, text: 'Paiements sécurisés' },
  ];

  return (
    <div className="min-h-screen bg-[#050505] flex" data-testid="auth-page">
      {/* Left Side - Image/Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img 
          src="https://images.unsplash.com/photo-1733950489642-bd1a7c3e69bb?w=1920&q=80"
          alt="Lausanne"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#050505] via-[#050505]/60 to-transparent" />
        
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-[#0047AB]/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-[#D4AF37]/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>
        
        <div className="absolute inset-0 flex flex-col justify-center px-12 z-10">
          <Link to="/" className="flex items-center gap-3 mb-8">
            <div className="logo-circle">T</div>
            <span className="text-2xl font-bold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
              Titelli
            </span>
          </Link>
          <h1 className="text-4xl font-bold text-white mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
            {userType === 'entreprise' ? 'Développez votre activité' : 'Les meilleurs prestataires'}
            <br />
            <span className="gold-gradient">{userType === 'entreprise' ? 'avec Titelli' : 'de la région'}</span>
          </h1>
          <p className="text-gray-300 text-lg max-w-md mb-8">
            {userType === 'entreprise' 
              ? 'Rejoignez notre marketplace et connectez-vous avec des milliers de clients à Lausanne.'
              : 'Découvrez les services et produits de qualité près de chez vous.'}
          </p>
          
          {/* Benefits */}
          <div className="space-y-4">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-center gap-3 text-gray-300">
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                  <benefit.icon className="w-4 h-4 text-[#D4AF37]" />
                </div>
                <span>{benefit.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Side - Auth Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Mobile Back Button */}
          <Link to="/" className="lg:hidden flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors">
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
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-white mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
              {isLogin ? 'Connexion' : step === 1 ? 'Créer un compte' : 'Sécurité du compte'}
            </h2>
            <p className="text-gray-400">
              {isLogin ? 'Bon retour parmi nous !' : step === 1 ? 'Commençons par vos informations' : 'Protégez votre compte'}
            </p>
          </div>

          {/* Progress Steps (Registration) */}
          {!isLogin && (
            <div className="flex items-center gap-2 mb-8">
              <div className={`flex-1 h-1 rounded-full ${step >= 1 ? 'bg-[#0047AB]' : 'bg-white/10'}`} />
              <div className={`flex-1 h-1 rounded-full ${step >= 2 ? 'bg-[#0047AB]' : 'bg-white/10'}`} />
            </div>
          )}

          {/* User Type Toggle (Registration only - Step 1) */}
          {!isLogin && step === 1 && (
            <div className="flex gap-3 mb-8">
              <button
                type="button"
                onClick={() => setUserType('client')}
                className={`flex-1 flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${
                  userType === 'client'
                    ? 'bg-[#0047AB]/20 border-[#0047AB] text-white'
                    : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20'
                }`}
                data-testid="type-client-btn"
              >
                <User className="w-6 h-6" />
                <span className="font-medium">Client</span>
                <span className="text-xs text-gray-500">Particulier</span>
              </button>
              <button
                type="button"
                onClick={() => setUserType('entreprise')}
                className={`flex-1 flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${
                  userType === 'entreprise'
                    ? 'bg-[#D4AF37]/20 border-[#D4AF37] text-white'
                    : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20'
                }`}
                data-testid="type-entreprise-btn"
              >
                <Building2 className="w-6 h-6" />
                <span className="font-medium">Entreprise</span>
                <span className="text-xs text-gray-500">Prestataire</span>
              </button>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {isLogin ? (
              // Login Form
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="input-dark w-full pl-12"
                      placeholder="exemple@email.com"
                      data-testid="input-email"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Mot de passe</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      className="input-dark w-full pl-12 pr-12"
                      placeholder="••••••••"
                      data-testid="input-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button type="button" className="text-sm text-[#0047AB] hover:text-[#2E74D6] transition-colors">
                    Mot de passe oublié ?
                  </button>
                </div>
              </>
            ) : step === 1 ? (
              // Registration Step 1 - Personal Info
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Prénom *</label>
                    <div className="relative">
                      <UserCircle className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                      <input
                        type="text"
                        name="first_name"
                        value={formData.first_name}
                        onChange={handleChange}
                        required
                        className="input-dark w-full pl-12"
                        placeholder="Jean"
                        data-testid="input-first-name"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Nom *</label>
                    <input
                      type="text"
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleChange}
                      required
                      className="input-dark w-full"
                      placeholder="Dupont"
                      data-testid="input-last-name"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Téléphone</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="input-dark w-full pl-12"
                      placeholder="+41 XX XXX XX XX"
                      data-testid="input-phone"
                    />
                  </div>
                </div>

                {userType === 'entreprise' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Nom de l'entreprise *</label>
                      <div className="relative">
                        <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                        <input
                          type="text"
                          name="business_name"
                          value={formData.business_name}
                          onChange={handleChange}
                          required
                          className="input-dark w-full pl-12"
                          placeholder="Ma Super Entreprise"
                          data-testid="input-business-name"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Catégorie</label>
                      <select
                        name="business_category"
                        value={formData.business_category}
                        onChange={handleChange}
                        className="input-dark w-full"
                      >
                        <option value="">Sélectionnez une catégorie</option>
                        <option value="beaute">Beauté & Bien-être</option>
                        <option value="restaurant">Restaurant & Food</option>
                        <option value="services">Services</option>
                        <option value="commerce">Commerce</option>
                        <option value="artisan">Artisanat</option>
                        <option value="sante">Santé</option>
                        <option value="autre">Autre</option>
                      </select>
                    </div>
                  </>
                )}
              </>
            ) : (
              // Registration Step 2 - Security
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Email *</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="input-dark w-full pl-12"
                      placeholder="exemple@email.com"
                      data-testid="input-email"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Mot de passe *</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      className="input-dark w-full pl-12 pr-12"
                      placeholder="Minimum 8 caractères"
                      data-testid="input-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {/* Password Strength Indicator */}
                  {formData.password && (
                    <div className="mt-2">
                      <div className="flex gap-1 mb-1">
                        {[...Array(4)].map((_, i) => (
                          <div
                            key={i}
                            className={`h-1 flex-1 rounded-full ${
                              i < passwordStrength / 25 ? getStrengthColor() : 'bg-white/10'
                            }`}
                          />
                        ))}
                      </div>
                      <p className={`text-xs ${passwordStrength >= 75 ? 'text-green-400' : passwordStrength >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>
                        Force: {getStrengthText()}
                      </p>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Confirmer le mot de passe *</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                      className="input-dark w-full pl-12"
                      placeholder="Répétez le mot de passe"
                    />
                    {formData.confirmPassword && formData.password === formData.confirmPassword && (
                      <CheckCircle className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
                    )}
                  </div>
                </div>

                {/* Security Info */}
                <div className="p-4 bg-[#0047AB]/10 rounded-xl border border-[#0047AB]/20">
                  <div className="flex items-center gap-2 text-[#0047AB] mb-2">
                    <Shield className="w-4 h-4" />
                    <span className="text-sm font-medium">Sécurité renforcée</span>
                  </div>
                  <p className="text-xs text-gray-400">
                    Votre mot de passe est chiffré et stocké de manière sécurisée. Nous ne le partagerons jamais.
                  </p>
                </div>

                {/* Terms Checkbox */}
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="acceptTerms"
                    checked={formData.acceptTerms}
                    onChange={handleChange}
                    className="mt-1 w-4 h-4 accent-[#0047AB]"
                  />
                  <span className="text-sm text-gray-400">
                    J'accepte les{' '}
                    <Link to="/cgv" className="text-[#0047AB] hover:underline">conditions générales</Link>
                    {' '}et la{' '}
                    <Link to="/mentions-legales" className="text-[#0047AB] hover:underline">politique de confidentialité</Link>
                  </span>
                </label>
              </>
            )}

            {/* Buttons */}
            <div className="flex gap-3">
              {!isLogin && step === 2 && (
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="btn-secondary flex-1 py-4"
                >
                  Retour
                </button>
              )}
              <button
                type="submit"
                disabled={loading}
                className={`btn-primary py-4 text-base disabled:opacity-50 disabled:cursor-not-allowed ${!isLogin && step === 2 ? 'flex-1' : 'w-full'}`}
                data-testid="submit-btn"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Chargement...
                  </span>
                ) : isLogin ? 'Se connecter' : step === 1 ? 'Continuer' : "Créer mon compte"}
              </button>
            </div>
          </form>

          {/* Toggle Login/Register */}
          <p className="text-center text-gray-400 mt-8">
            {isLogin ? "Pas encore de compte ?" : "Déjà un compte ?"}
            <button
              onClick={() => { setIsLogin(!isLogin); setStep(1); }}
              className="ml-2 text-[#0047AB] hover:text-[#2E74D6] font-medium transition-colors"
              data-testid="toggle-auth-btn"
            >
              {isLogin ? "S'inscrire" : "Se connecter"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
