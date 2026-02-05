import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Image, 
  Sparkles, 
  ShoppingCart, 
  Check, 
  ArrowRight, 
  Palette,
  Type,
  FileText,
  Clock,
  Star,
  Filter,
  Grid,
  List
} from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const MediaPubPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const enterpriseId = searchParams.get('enterprise_id');
  
  const [templates, setTemplates] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [loading, setLoading] = useState(true);
  const [orderStep, setOrderStep] = useState('browse'); // browse, customize, confirm, processing
  
  // Form state
  const [formData, setFormData] = useState({
    slogan: '',
    product_name: '',
    description: '',
    brand_colors: ['#0066CC', '#FFFFFF'],
    additional_notes: ''
  });
  
  const [orderResult, setOrderResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const response = await fetch(`${API_URL}/api/media-pub/templates`);
      const data = await response.json();
      setTemplates(data.templates);
      setCategories(data.categories);
    } catch (error) {
      console.error('Erreur chargement templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTemplates = selectedCategory === 'all' 
    ? templates 
    : templates.filter(t => t.category === selectedCategory);

  const handleSelectTemplate = (template) => {
    setSelectedTemplate(template);
    setOrderStep('customize');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleColorChange = (index, color) => {
    const newColors = [...formData.brand_colors];
    newColors[index] = color;
    setFormData(prev => ({ ...prev, brand_colors: newColors }));
  };

  const handleSubmitOrder = async () => {
    if (!formData.slogan || !formData.product_name) {
      alert('Veuillez remplir le slogan et le nom du produit');
      return;
    }

    setSubmitting(true);
    setOrderStep('processing');

    try {
      const response = await fetch(`${API_URL}/api/media-pub/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          template_id: selectedTemplate.id,
          enterprise_id: enterpriseId || 'demo-enterprise',
          ...formData
        })
      });

      const result = await response.json();
      setOrderResult(result);
      setOrderStep('confirm');
    } catch (error) {
      console.error('Erreur commande:', error);
      alert('Erreur lors de la commande');
      setOrderStep('customize');
    } finally {
      setSubmitting(false);
    }
  };

  // Render Browse Templates
  const renderBrowseStep = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">
          <Sparkles className="inline-block mr-2 text-yellow-400" />
          Créez votre Publicité
        </h1>
        <p className="text-gray-400">
          Choisissez un modèle et personnalisez-le avec votre marque
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-gray-800/50 p-4 rounded-xl">
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="w-5 h-5 text-gray-400" />
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              selectedCategory === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Tous
          </button>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-blue-600' : 'bg-gray-700'}`}
          >
            <Grid className="w-5 h-5" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-blue-600' : 'bg-gray-700'}`}
          >
            <List className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Templates Grid */}
      <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
        {filteredTemplates.map(template => (
          <div
            key={template.id}
            className="bg-gray-800/50 rounded-xl overflow-hidden border border-gray-700 hover:border-blue-500 transition-all group cursor-pointer"
            onClick={() => handleSelectTemplate(template)}
          >
            <div className="relative">
              <img
                src={template.preview_url}
                alt={template.name}
                className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
              />
              {template.popular && (
                <span className="absolute top-3 right-3 bg-yellow-500 text-black text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                  <Star className="w-3 h-3" /> Populaire
                </span>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-4">
                <button className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium flex items-center gap-2">
                  Sélectionner <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-semibold text-white">{template.name}</h3>
                  <p className="text-sm text-gray-400">{template.category}</p>
                </div>
                <span className="text-lg font-bold text-green-400">{template.price} CHF</span>
              </div>
              <p className="text-sm text-gray-500 line-clamp-2">{template.description}</p>
              <div className="mt-3 flex items-center gap-2">
                <span className="text-xs bg-gray-700 px-2 py-1 rounded text-gray-300">
                  {template.format}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Render Customize Step
  const renderCustomizeStep = () => (
    <div className="max-w-4xl mx-auto">
      {/* Back button */}
      <button
        onClick={() => setOrderStep('browse')}
        className="text-gray-400 hover:text-white mb-6 flex items-center gap-2"
      >
        ← Retour aux modèles
      </button>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Template Preview */}
        <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
          <h2 className="text-xl font-bold text-white mb-4">{selectedTemplate?.name}</h2>
          <img
            src={selectedTemplate?.preview_url}
            alt={selectedTemplate?.name}
            className="w-full rounded-lg mb-4"
          />
          <div className="space-y-2 text-sm">
            <p className="text-gray-400">
              <span className="text-gray-500">Catégorie:</span> {selectedTemplate?.category}
            </p>
            <p className="text-gray-400">
              <span className="text-gray-500">Format:</span> {selectedTemplate?.format}
            </p>
            <p className="text-2xl font-bold text-green-400 mt-4">
              {selectedTemplate?.price} CHF
            </p>
          </div>
        </div>

        {/* Customization Form */}
        <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Palette className="text-blue-400" />
            Personnalisez votre publicité
          </h2>

          <div className="space-y-5">
            {/* Slogan */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Type className="inline w-4 h-4 mr-1" />
                Slogan / Accroche *
              </label>
              <input
                type="text"
                name="slogan"
                value={formData.slogan}
                onChange={handleInputChange}
                placeholder="Ex: Qualité suisse, prix imbattable"
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            {/* Product Name */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <FileText className="inline w-4 h-4 mr-1" />
                Nom du produit/service *
              </label>
              <input
                type="text"
                name="product_name"
                value={formData.product_name}
                onChange={handleInputChange}
                placeholder="Ex: Collection Printemps 2026"
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Description (optionnel)
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Détails supplémentaires à inclure..."
                rows={3}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>

            {/* Brand Colors */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Palette className="inline w-4 h-4 mr-1" />
                Couleurs de marque
              </label>
              <div className="flex gap-4">
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={formData.brand_colors[0]}
                    onChange={(e) => handleColorChange(0, e.target.value)}
                    className="w-12 h-12 rounded-lg cursor-pointer border-2 border-gray-600"
                  />
                  <span className="text-sm text-gray-400">Principale</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={formData.brand_colors[1]}
                    onChange={(e) => handleColorChange(1, e.target.value)}
                    className="w-12 h-12 rounded-lg cursor-pointer border-2 border-gray-600"
                  />
                  <span className="text-sm text-gray-400">Secondaire</span>
                </div>
              </div>
            </div>

            {/* Important Notes */}
            <div className="bg-yellow-900/30 border border-yellow-700 rounded-lg p-4">
              <h4 className="font-medium text-yellow-400 mb-2">⚠️ À noter</h4>
              <ul className="text-sm text-yellow-200/80 space-y-1">
                <li>• Ne pas mettre de prix sur l'image</li>
                <li>• Ne pas inclure de dates</li>
                <li>• Les visages ne seront pas coupés</li>
              </ul>
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmitOrder}
              disabled={submitting || !formData.slogan || !formData.product_name}
              className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold rounded-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <ShoppingCart className="w-5 h-5" />
              Commander - {selectedTemplate?.price} CHF
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Render Processing Step
  const renderProcessingStep = () => (
    <div className="max-w-md mx-auto text-center py-12">
      <div className="w-24 h-24 mx-auto mb-6 relative">
        <div className="absolute inset-0 border-4 border-blue-500/30 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <Sparkles className="absolute inset-0 m-auto w-10 h-10 text-blue-400" />
      </div>
      <h2 className="text-2xl font-bold text-white mb-2">Création en cours...</h2>
      <p className="text-gray-400 mb-6">
        Notre IA génère votre publicité personnalisée
      </p>
      <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
        <Clock className="w-4 h-4" />
        Temps estimé: 2-5 minutes
      </div>
    </div>
  );

  // Render Confirm Step
  const renderConfirmStep = () => (
    <div className="max-w-md mx-auto text-center py-12">
      <div className="w-20 h-20 mx-auto mb-6 bg-green-500/20 rounded-full flex items-center justify-center">
        <Check className="w-10 h-10 text-green-400" />
      </div>
      <h2 className="text-2xl font-bold text-white mb-2">Commande enregistrée !</h2>
      <p className="text-gray-400 mb-6">
        Votre publicité sera disponible dans quelques minutes dans la section 
        <span className="text-blue-400 font-medium"> "Commandes Titelli"</span> de votre tableau de bord.
      </p>
      
      {orderResult && (
        <div className="bg-gray-800/50 rounded-xl p-4 mb-6 text-left">
          <p className="text-sm text-gray-400">
            <span className="text-gray-500">N° commande:</span> {orderResult.id}
          </p>
          <p className="text-sm text-gray-400">
            <span className="text-gray-500">Statut:</span> 
            <span className="text-yellow-400 ml-1">En cours de création</span>
          </p>
          <p className="text-sm text-gray-400">
            <span className="text-gray-500">Délai:</span> {orderResult.estimated_time}
          </p>
        </div>
      )}

      <div className="flex flex-col gap-3">
        <button
          onClick={() => navigate('/dashboard/enterprise?tab=commandes-titelli')}
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
        >
          Voir mes commandes
        </button>
        <button
          onClick={() => {
            setOrderStep('browse');
            setSelectedTemplate(null);
            setFormData({
              slogan: '',
              product_name: '',
              description: '',
              brand_colors: ['#0066CC', '#FFFFFF'],
              additional_notes: ''
            });
          }}
          className="w-full py-3 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors"
        >
          Créer une autre publicité
        </button>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        {orderStep === 'browse' && renderBrowseStep()}
        {orderStep === 'customize' && renderCustomizeStep()}
        {orderStep === 'processing' && renderProcessingStep()}
        {orderStep === 'confirm' && renderConfirmStep()}
      </div>
    </div>
  );
};

export default MediaPubPage;
