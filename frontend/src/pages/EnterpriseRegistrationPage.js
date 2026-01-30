import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Building2, MapPin, Phone, Globe, ChevronRight, Upload, User, FileText, Users, CheckCircle, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import api from '../services/api';

const EnterpriseRegistrationPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Select enterprise, 2: Fill form, 3: Success
  const [enterprises, setEnterprises] = useState([]);
  const [managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEnterprise, setSelectedEnterprise] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    first_name: '',
    last_name: '',
    phone: '',
    commerce_register_id: '',
    manager_id: '',
    identity_document: null
  });

  useEffect(() => {
    fetchEnterprises();
    fetchManagers();
  }, []);

  const fetchEnterprises = async (search = '') => {
    try {
      setLoading(true);
      const response = await api.get('/enterprises/available', { params: { search, limit: 200 } });
      setEnterprises(response.data.enterprises || []);
    } catch (error) {
      console.error('Error fetching enterprises:', error);
      toast.error('Erreur lors du chargement des entreprises');
    } finally {
      setLoading(false);
    }
  };

  const fetchManagers = async () => {
    try {
      const response = await api.get('/managers');
      setManagers(response.data.managers || []);
    } catch (error) {
      console.error('Error fetching managers:', error);
    }
  };

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    fetchEnterprises(value);
  };

  const handleSelectEnterprise = (enterprise) => {
    setSelectedEnterprise(enterprise);
    setStep(2);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Le fichier ne doit pas dépasser 5 Mo');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, identity_document: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    if (!formData.commerce_register_id) {
      toast.error('L\'ID du registre du commerce est requis');
      return;
    }

    if (!formData.manager_id) {
      toast.error('Veuillez sélectionner un manager');
      return;
    }

    try {
      setSubmitting(true);
      await api.post('/auth/register-enterprise', {
        enterprise_id: selectedEnterprise.id,
        email: formData.email,
        password: formData.password,
        first_name: formData.first_name,
        last_name: formData.last_name,
        phone: formData.phone,
        commerce_register_id: formData.commerce_register_id,
        manager_id: formData.manager_id,
        identity_document: formData.identity_document
      });
      
      setStep(3);
    } catch (error) {
      console.error('Error registering:', error);
      toast.error(error.response?.data?.detail || 'Erreur lors de l\'inscription');
    } finally {
      setSubmitting(false);
    }
  };

  // Step 1: Select Enterprise
  if (step === 1) {
    return (
      <div className="min-h-screen bg-[#050505] pt-24 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-white mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
              Activez votre entreprise
            </h1>
            <p className="text-gray-400 text-lg">
              Recherchez et sélectionnez votre entreprise pour commencer l'inscription
            </p>
          </div>

          {/* Search */}
          <div className="relative mb-8">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher votre entreprise par nom, catégorie ou adresse..."
              value={searchQuery}
              onChange={handleSearch}
              className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-[#0047AB]/50 text-lg"
            />
          </div>

          {/* Enterprise List */}
          <div className="space-y-4">
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="w-12 h-12 border-4 border-[#0047AB] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : enterprises.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <Building2 className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>Aucune entreprise trouvée</p>
              </div>
            ) : (
              enterprises.map((enterprise) => (
                <div
                  key={enterprise.id}
                  onClick={() => handleSelectEnterprise(enterprise)}
                  className="bg-white/5 border border-white/10 rounded-xl p-4 cursor-pointer hover:border-[#0047AB]/50 hover:bg-white/10 transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={enterprise.image || `https://ui-avatars.com/api/?name=${enterprise.name}&background=0047AB&color=fff`}
                      alt={enterprise.name}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-white font-semibold text-lg">{enterprise.name}</h3>
                        <span className={`px-2 py-0.5 rounded-full text-xs ${
                          enterprise.status === 'disponible' 
                            ? 'bg-green-500/20 text-green-400' 
                            : 'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          {enterprise.status === 'disponible' ? 'Disponible' : 'Bientôt disponible'}
                        </span>
                      </div>
                      <p className="text-[#D4AF37] text-sm mb-1">{enterprise.category}</p>
                      <div className="flex items-center gap-4 text-gray-400 text-sm">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {enterprise.address}
                        </span>
                        {enterprise.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="w-4 h-4" />
                            {enterprise.phone}
                          </span>
                        )}
                      </div>
                    </div>
                    <ChevronRight className="w-6 h-6 text-gray-400 group-hover:text-[#0047AB] transition-colors" />
                  </div>
                </div>
              ))
            )}
          </div>

          <p className="text-center text-gray-500 mt-8">
            {enterprises.length} entreprises disponibles
          </p>
        </div>
      </div>
    );
  }

  // Step 2: Registration Form
  if (step === 2) {
    return (
      <div className="min-h-screen bg-[#050505] pt-24 px-4 pb-12">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={() => setStep(1)}
            className="flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Retour à la sélection
          </button>

          {/* Selected Enterprise */}
          <div className="bg-[#0047AB]/10 border border-[#0047AB]/30 rounded-xl p-4 mb-8">
            <div className="flex items-center gap-4">
              <img
                src={selectedEnterprise.image || `https://ui-avatars.com/api/?name=${selectedEnterprise.name}&background=0047AB&color=fff`}
                alt={selectedEnterprise.name}
                className="w-16 h-16 rounded-lg object-cover"
              />
              <div>
                <h3 className="text-white font-semibold text-lg">{selectedEnterprise.name}</h3>
                <p className="text-[#D4AF37] text-sm">{selectedEnterprise.category}</p>
                <p className="text-gray-400 text-sm">{selectedEnterprise.address}</p>
              </div>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-white mb-6" style={{ fontFamily: 'Playfair Display, serif' }}>
            Formulaire d'inscription
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Info */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-[#0047AB]" />
                Informations personnelles
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Prénom *</label>
                  <input
                    type="text"
                    required
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#0047AB]/50"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Nom *</label>
                  <input
                    type="text"
                    required
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#0047AB]/50"
                  />
                </div>
              </div>
              <div className="mt-4">
                <label className="block text-gray-400 text-sm mb-2">Téléphone *</label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#0047AB]/50"
                  placeholder="+41 XX XXX XX XX"
                />
              </div>
            </div>

            {/* Account Info */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-[#0047AB]" />
                Informations de connexion
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Email professionnel *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#0047AB]/50"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-400 text-sm mb-2">Mot de passe *</label>
                    <input
                      type="password"
                      required
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#0047AB]/50"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-sm mb-2">Confirmer *</label>
                    <input
                      type="password"
                      required
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#0047AB]/50"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Business Documents */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#0047AB]" />
                Documents requis
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-2">ID du registre du commerce *</label>
                  <input
                    type="text"
                    required
                    value={formData.commerce_register_id}
                    onChange={(e) => setFormData({ ...formData, commerce_register_id: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#0047AB]/50"
                    placeholder="CHE-XXX.XXX.XXX"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Pièce d'identité (PDF ou image) *</label>
                  <div className="relative">
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={handleFileChange}
                      className="hidden"
                      id="identity-doc"
                    />
                    <label
                      htmlFor="identity-doc"
                      className="flex items-center justify-center gap-2 w-full px-4 py-4 bg-white/5 border border-dashed border-white/20 rounded-lg text-gray-400 hover:border-[#0047AB]/50 hover:text-white cursor-pointer transition-colors"
                    >
                      <Upload className="w-5 h-5" />
                      {formData.identity_document ? 'Document téléchargé ✓' : 'Cliquez pour télécharger'}
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Manager Selection */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-[#0047AB]" />
                Manager référent
              </h3>
              <p className="text-gray-400 text-sm mb-4">
                Sélectionnez le manager Titelli qui vous a recommandé
              </p>
              <select
                required
                value={formData.manager_id}
                onChange={(e) => setFormData({ ...formData, manager_id: e.target.value })}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#0047AB]/50"
              >
                <option value="" className="bg-[#0F0F0F]">Sélectionnez un manager</option>
                {managers.map((manager, index) => (
                  <option key={index} value={manager.name} className="bg-[#0F0F0F]">
                    {manager.name} - {manager.role}
                  </option>
                ))}
              </select>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 bg-[#0047AB] text-white font-semibold rounded-xl hover:bg-[#0047AB]/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Envoi en cours...
                </>
              ) : (
                <>
                  Soumettre ma demande
                  <ChevronRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Step 3: Success
  return (
    <div className="min-h-screen bg-[#050505] pt-24 px-4 flex items-center justify-center">
      <div className="max-w-lg mx-auto text-center">
        <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-8">
          <CheckCircle className="w-12 h-12 text-green-500" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
          Demande envoyée !
        </h1>
        <p className="text-gray-400 text-lg mb-8">
          Votre inscription est en attente de validation. Vous recevrez un email lorsque votre compte sera activé.
        </p>
        <div className="bg-white/5 border border-white/10 rounded-xl p-6 text-left mb-8">
          <h3 className="text-white font-semibold mb-3">Prochaines étapes :</h3>
          <ul className="text-gray-400 space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-[#D4AF37]">1.</span>
              Notre équipe vérifie vos documents
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#D4AF37]">2.</span>
              Validation de votre identité et registre du commerce
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#D4AF37]">3.</span>
              Activation de votre compte entreprise
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#D4AF37]">4.</span>
              Notification par email de confirmation
            </li>
          </ul>
        </div>
        <button
          onClick={() => navigate('/')}
          className="px-8 py-3 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-colors"
        >
          Retour à l'accueil
        </button>
      </div>
    </div>
  );
};

export default EnterpriseRegistrationPage;
