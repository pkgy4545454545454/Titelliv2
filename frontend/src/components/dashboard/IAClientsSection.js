import React, { useState, useEffect } from 'react';
import { Target, Trash2 } from 'lucide-react';
import { iaCampaignsAPI } from '../../services/api';
import { toast } from 'sonner';

const IAClientsSection = () => {
  const [targetAudience, setTargetAudience] = useState({
    name: '',
    age_range: '25-45',
    gender: 'all',
    interests: [],
    location: 'lausanne',
    budget: 'medium',
    behavior: []
  });
  const [campaigns, setCampaigns] = useState([]);
  const [stats, setStats] = useState({ total_reach: 0, total_engagement: 0, total_conversions: 0, engagement_rate: 0 });
  const [showCreate, setShowCreate] = useState(false);
  const [loading, setLoading] = useState(true);

  const interests = [
    'Bien-être', 'Mode', 'Gastronomie', 'Sport', 'Technologie', 
    'Voyage', 'Art & Culture', 'Famille', 'Business', 'Écologie'
  ];

  const behaviors = [
    'Acheteurs fréquents', 'Nouveaux clients', 'Clients fidèles',
    'Abandons de panier', 'Visiteurs réguliers', 'Clients premium'
  ];

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const response = await iaCampaignsAPI.list();
      setCampaigns(response.data.campaigns || []);
      setStats(response.data.stats || {});
    } catch (error) {
      console.error('Error fetching campaigns:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInterestToggle = (interest) => {
    setTargetAudience(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const handleBehaviorToggle = (behavior) => {
    setTargetAudience(prev => ({
      ...prev,
      behavior: prev.behavior.includes(behavior)
        ? prev.behavior.filter(b => b !== behavior)
        : [...prev.behavior, behavior]
    }));
  };

  const createCampaign = async () => {
    if (!targetAudience.name) {
      toast.error('Veuillez donner un nom à votre campagne');
      return;
    }
    try {
      const response = await iaCampaignsAPI.create(targetAudience);
      setCampaigns([response.data, ...campaigns]);
      setShowCreate(false);
      setTargetAudience({ name: '', age_range: '25-45', gender: 'all', interests: [], location: 'lausanne', budget: 'medium', behavior: [] });
      toast.success('Campagne IA créée avec succès');
      fetchCampaigns();
    } catch (error) {
      toast.error('Erreur lors de la création de la campagne');
    }
  };

  const toggleCampaign = async (campaignId) => {
    try {
      await iaCampaignsAPI.toggle(campaignId);
      fetchCampaigns();
      toast.success('Statut de la campagne mis à jour');
    } catch (error) {
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const deleteCampaign = async (campaignId) => {
    try {
      await iaCampaignsAPI.delete(campaignId);
      setCampaigns(campaigns.filter(c => c.id !== campaignId));
      toast.success('Campagne supprimée');
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    }
  };

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num?.toString() || '0';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-[#0047AB] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="ia-clients-section">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
            IA Ciblage Clients
          </h1>
          <p className="text-gray-400 mt-1">Ciblez intelligemment votre audience idéale</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="btn-primary flex items-center gap-2">
          <Target className="w-4 h-4" /> Nouveau ciblage
        </button>
      </div>

      {/* Question du jour */}
      <div className="card-service rounded-xl p-6 border-[#D4AF37]/30 bg-gradient-to-r from-[#D4AF37]/5 to-transparent">
        <h2 className="text-lg font-semibold text-[#D4AF37] mb-2 flex items-center gap-2">
          <Target className="w-5 h-5" />
          Quel type de public cible aujourd'hui ?
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
          {['Nouveaux clients', 'Clients fidèles', 'Clients premium', 'Clients locaux'].map((type) => (
            <button 
              key={type} 
              onClick={() => { setTargetAudience({...targetAudience, name: type, behavior: [type]}); setShowCreate(true); }}
              className="p-3 bg-white/5 rounded-lg text-white hover:bg-[#D4AF37]/20 hover:border-[#D4AF37]/50 border border-transparent transition-all text-sm"
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Stats IA */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card-service rounded-xl p-4">
          <p className="text-sm text-gray-400">Portée totale</p>
          <p className="text-2xl font-bold text-[#0047AB]">{formatNumber(stats.total_reach)}</p>
        </div>
        <div className="card-service rounded-xl p-4">
          <p className="text-sm text-gray-400">Taux d'engagement</p>
          <p className="text-2xl font-bold text-green-400">{stats.engagement_rate || 0}%</p>
        </div>
        <div className="card-service rounded-xl p-4">
          <p className="text-sm text-gray-400">Conversions</p>
          <p className="text-2xl font-bold text-[#D4AF37]">{formatNumber(stats.total_conversions)}</p>
        </div>
        <div className="card-service rounded-xl p-4">
          <p className="text-sm text-gray-400">Campagnes actives</p>
          <p className="text-2xl font-bold text-purple-400">{stats.active_campaigns || 0}</p>
        </div>
      </div>

      {/* Campagnes actives */}
      <div className="card-service rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Mes campagnes IA</h2>
        {campaigns.length > 0 ? (
          <div className="space-y-3">
            {campaigns.map((campaign) => (
              <div key={campaign.id} className="p-4 bg-white/5 rounded-xl flex items-center justify-between">
                <div>
                  <p className="text-white font-medium">{campaign.name || `Ciblage: ${campaign.age_range} ans`} • {campaign.location}</p>
                  <p className="text-sm text-gray-400">{campaign.interests?.join(', ') || 'Tous les intérêts'}</p>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-[#0047AB]">{formatNumber(campaign.reach)} portée</span>
                  <span className="text-green-400">{formatNumber(campaign.engagement)} engagements</span>
                  <button 
                    onClick={() => toggleCampaign(campaign.id)}
                    className={`px-2 py-1 rounded text-xs ${campaign.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}
                  >
                    {campaign.status === 'active' ? 'Actif' : 'En pause'}
                  </button>
                  <button onClick={() => deleteCampaign(campaign.id)} className="p-1 text-red-400 hover:bg-red-500/20 rounded">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Target className="w-12 h-12 text-gray-500 mx-auto mb-3" />
            <p className="text-gray-400">Aucune campagne IA active</p>
            <p className="text-sm text-gray-500">Créez votre première campagne de ciblage</p>
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="card-service rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-white mb-6">Créer un ciblage IA</h3>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Nom de la campagne *</label>
                <input
                  type="text"
                  value={targetAudience.name}
                  onChange={(e) => setTargetAudience({...targetAudience, name: e.target.value})}
                  placeholder="Ex: Campagne été 2026"
                  className="input-dark w-full"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Tranche d'âge</label>
                  <select value={targetAudience.age_range} onChange={(e) => setTargetAudience({...targetAudience, age_range: e.target.value})} className="input-dark w-full">
                    <option value="18-24">18-24 ans</option>
                    <option value="25-34">25-34 ans</option>
                    <option value="25-45">25-45 ans</option>
                    <option value="35-54">35-54 ans</option>
                    <option value="55+">55+ ans</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Genre</label>
                  <select value={targetAudience.gender} onChange={(e) => setTargetAudience({...targetAudience, gender: e.target.value})} className="input-dark w-full">
                    <option value="all">Tous</option>
                    <option value="male">Homme</option>
                    <option value="female">Femme</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Centres d'intérêt</label>
                <div className="flex flex-wrap gap-2">
                  {interests.map((interest) => (
                    <button
                      key={interest}
                      type="button"
                      onClick={() => handleInterestToggle(interest)}
                      className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                        targetAudience.interests.includes(interest)
                          ? 'bg-[#0047AB] text-white'
                          : 'bg-white/5 text-gray-400 hover:bg-white/10'
                      }`}
                    >
                      {interest}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Comportement</label>
                <div className="flex flex-wrap gap-2">
                  {behaviors.map((behavior) => (
                    <button
                      key={behavior}
                      type="button"
                      onClick={() => handleBehaviorToggle(behavior)}
                      className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                        targetAudience.behavior.includes(behavior)
                          ? 'bg-[#D4AF37] text-black'
                          : 'bg-white/5 text-gray-400 hover:bg-white/10'
                      }`}
                    >
                      {behavior}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Budget client cible</label>
                <select value={targetAudience.budget} onChange={(e) => setTargetAudience({...targetAudience, budget: e.target.value})} className="input-dark w-full">
                  <option value="low">Budget serré</option>
                  <option value="medium">Budget moyen</option>
                  <option value="high">Budget élevé</option>
                  <option value="premium">Premium / Luxe</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowCreate(false)} className="btn-secondary flex-1">Annuler</button>
              <button onClick={createCampaign} className="btn-primary flex-1">Lancer la campagne IA</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IAClientsSection;
