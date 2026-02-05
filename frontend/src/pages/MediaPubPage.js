import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Image, 
  Sparkles, 
  ShoppingCart, 
  Check, 
  ArrowRight, 
  ArrowLeft,
  Palette,
  Type,
  FileText,
  Clock,
  Star,
  Filter,
  Grid,
  List,
  Eye,
  Download,
  Layers,
  ZoomIn,
  ZoomOut,
  RotateCcw
} from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const MediaPubPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const enterpriseId = searchParams.get('enterprise_id');
  const canvasRef = useRef(null);
  
  const [templates, setTemplates] = useState([]);
  const [categories, setCategories] = useState([]);
  const [byCategory, setByCategory] = useState({});
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSubcategory, setSelectedSubcategory] = useState('all');
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [loading, setLoading] = useState(true);
  const [orderStep, setOrderStep] = useState('browse'); // browse, customize, confirm, processing
  const [previewZoom, setPreviewZoom] = useState(100);
  
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
      setByCategory(data.by_category);
    } catch (error) {
      console.error('Erreur chargement templates:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get subcategories for selected category
  const getSubcategories = () => {
    if (selectedCategory === 'all') return [];
    const categoryTemplates = templates.filter(t => t.category === selectedCategory);
    const subs = [...new Set(categoryTemplates.map(t => t.subcategory).filter(Boolean))];
    return subs;
  };

  const filteredTemplates = templates.filter(t => {
    if (selectedCategory !== 'all' && t.category !== selectedCategory) return false;
    if (selectedSubcategory !== 'all' && t.subcategory !== selectedSubcategory) return false;
    return true;
  });

  const handleSelectTemplate = (template) => {
    setSelectedTemplate(template);
    setOrderStep('customize');
    // Reset form
    setFormData({
      slogan: '',
      product_name: '',
      description: '',
      brand_colors: ['#0066CC', '#FFFFFF'],
      additional_notes: ''
    });
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

  // Live Preview Component
  const LivePreview = () => {
    if (!selectedTemplate) return null;

    const getTextPositionStyle = () => {
      switch (selectedTemplate.text_position) {
        case 'top':
          return { top: '10%', left: '50%', transform: 'translateX(-50%)' };
        case 'bottom':
          return { bottom: '10%', left: '50%', transform: 'translateX(-50%)' };
        case 'left':
          return { top: '50%', left: '10%', transform: 'translateY(-50%)' };
        case 'right':
          return { top: '50%', right: '10%', transform: 'translateY(-50%)' };
        default:
          return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };
      }
    };

    return (
      <div className="relative bg-gray-900 rounded-xl overflow-hidden">
        {/* Zoom Controls */}
        <div className="absolute top-3 right-3 z-20 flex items-center gap-2 bg-black/50 rounded-lg p-1">
          <button 
            onClick={() => setPreviewZoom(Math.max(50, previewZoom - 10))}
            className="p-1 hover:bg-white/20 rounded"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-xs min-w-[40px] text-center">{previewZoom}%</span>
          <button 
            onClick={() => setPreviewZoom(Math.min(150, previewZoom + 10))}
            className="p-1 hover:bg-white/20 rounded"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button 
            onClick={() => setPreviewZoom(100)}
            className="p-1 hover:bg-white/20 rounded"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Preview Canvas */}
        <div 
          className="relative overflow-auto"
          style={{ 
            maxHeight: '500px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '20px'
          }}
        >
          <div 
            ref={canvasRef}
            className="relative shadow-2xl"
            style={{ 
              transform: `scale(${previewZoom / 100})`,
              transformOrigin: 'center center',
              transition: 'transform 0.2s ease'
            }}
          >
            {/* Background Image */}
            <img
              src={selectedTemplate.preview_url}
              alt={selectedTemplate.name}
              className="max-w-full"
              style={{ 
                filter: formData.brand_colors[0] !== '#0066CC' ? `hue-rotate(${getHueRotation(formData.brand_colors[0])}deg)` : 'none'
              }}
            />
            
            {/* Text Overlay */}
            <div 
              className="absolute text-center px-4"
              style={{
                ...getTextPositionStyle(),
                maxWidth: '80%'
              }}
            >
              {/* Product Name */}
              {formData.product_name && (
                <div 
                  className="font-bold text-shadow-lg mb-2"
                  style={{ 
                    fontSize: 'clamp(16px, 4vw, 32px)',
                    color: formData.brand_colors[1],
                    textShadow: '2px 2px 4px rgba(0,0,0,0.8)'
                  }}
                >
                  {formData.product_name}
                </div>
              )}
              
              {/* Slogan */}
              {formData.slogan && (
                <div 
                  className="font-bold"
                  style={{ 
                    fontSize: 'clamp(20px, 5vw, 42px)',
                    color: formData.brand_colors[0],
                    textShadow: '2px 2px 6px rgba(0,0,0,0.9)',
                    WebkitTextStroke: `1px ${formData.brand_colors[1]}`
                  }}
                >
                  {formData.slogan}
                </div>
              )}
              
              {/* Description */}
              {formData.description && (
                <div 
                  className="mt-2 opacity-90"
                  style={{ 
                    fontSize: 'clamp(12px, 2.5vw, 18px)',
                    color: formData.brand_colors[1],
                    textShadow: '1px 1px 3px rgba(0,0,0,0.7)'
                  }}
                >
                  {formData.description}
                </div>
              )}
            </div>

            {/* Color Overlay */}
            <div 
              className="absolute inset-0 pointer-events-none mix-blend-overlay opacity-20"
              style={{ backgroundColor: formData.brand_colors[0] }}
            />
          </div>
        </div>

        {/* Preview Info */}
        <div className="p-3 bg-gray-800/50 border-t border-gray-700 flex items-center justify-between">
          <div className="text-sm text-gray-400">
            <span className="text-gray-500">Format:</span> {selectedTemplate.format}
          </div>
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-400">Aperçu en direct</span>
          </div>
        </div>
      </div>
    );
  };

  // Helper function to calculate hue rotation
  const getHueRotation = (hexColor) => {
    const r = parseInt(hexColor.slice(1, 3), 16) / 255;
    const g = parseInt(hexColor.slice(3, 5), 16) / 255;
    const b = parseInt(hexColor.slice(5, 7), 16) / 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    if (max !== min) {
      const d = max - min;
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
        case g: h = ((b - r) / d + 2) / 6; break;
        case b: h = ((r - g) / d + 4) / 6; break;
      }
    }
    return Math.round(h * 360);
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
          Choisissez un modèle et personnalisez-le en direct comme sur Canva
        </p>
      </div>

      {/* Category Filters */}
      <div className="bg-gray-800/50 p-4 rounded-xl space-y-3">
        {/* Main Categories */}
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="w-5 h-5 text-gray-400" />
          <button
            onClick={() => { setSelectedCategory('all'); setSelectedSubcategory('all'); }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              selectedCategory === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Tous ({templates.length})
          </button>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => { setSelectedCategory(cat); setSelectedSubcategory('all'); }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {cat} ({templates.filter(t => t.category === cat).length})
            </button>
          ))}
        </div>

        {/* Subcategories */}
        {getSubcategories().length > 0 && (
          <div className="flex items-center gap-2 flex-wrap pl-7 pt-2 border-t border-gray-700">
            <Layers className="w-4 h-4 text-gray-500" />
            <button
              onClick={() => setSelectedSubcategory('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                selectedSubcategory === 'all'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
              }`}
            >
              Tous les types
            </button>
            {getSubcategories().map(sub => (
              <button
                key={sub}
                onClick={() => setSelectedSubcategory(sub)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  selectedSubcategory === sub
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                }`}
              >
                {sub}
              </button>
            ))}
          </div>
        )}
        
        {/* View Toggle */}
        <div className="flex items-center justify-end gap-2">
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

      {/* Results Count */}
      <div className="text-sm text-gray-400">
        {filteredTemplates.length} modèle{filteredTemplates.length > 1 ? 's' : ''} trouvé{filteredTemplates.length > 1 ? 's' : ''}
      </div>

      {/* Templates Grid */}
      <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'}`}>
        {filteredTemplates.map(template => (
          <div
            key={template.id}
            className="bg-gray-800/50 rounded-xl overflow-hidden border border-gray-700 hover:border-blue-500 transition-all group cursor-pointer"
            onClick={() => handleSelectTemplate(template)}
          >
            <div className="relative aspect-square">
              <img
                src={template.preview_url}
                alt={template.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              {template.popular && (
                <span className="absolute top-3 right-3 bg-yellow-500 text-black text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                  <Star className="w-3 h-3" /> Populaire
                </span>
              )}
              {template.subcategory && (
                <span className="absolute top-3 left-3 bg-purple-500/80 text-white text-xs px-2 py-1 rounded">
                  {template.subcategory}
                </span>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-4">
                <button className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium flex items-center gap-2 shadow-lg">
                  Personnaliser <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-semibold text-white text-sm">{template.name}</h3>
                  <p className="text-xs text-gray-500">{template.category}</p>
                </div>
                <span className="text-lg font-bold text-green-400">{template.price} CHF</span>
              </div>
              <p className="text-xs text-gray-500 line-clamp-2">{template.description}</p>
              <div className="mt-2 flex items-center gap-2">
                <span className="text-xs bg-gray-700 px-2 py-0.5 rounded text-gray-400">
                  {template.format}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Render Customize Step with Live Preview
  const renderCustomizeStep = () => (
    <div className="max-w-6xl mx-auto">
      {/* Back button */}
      <button
        onClick={() => setOrderStep('browse')}
        className="text-gray-400 hover:text-white mb-6 flex items-center gap-2"
      >
        <ArrowLeft className="w-4 h-4" /> Retour aux modèles
      </button>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Live Preview - LEFT */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Eye className="text-blue-400" />
              Aperçu en direct
            </h2>
            <span className="text-sm text-gray-400">{selectedTemplate?.name}</span>
          </div>
          
          <LivePreview />
          
          <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
            <h4 className="font-medium text-gray-300 mb-2">Informations</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Catégorie:</span>
                <span className="text-white ml-2">{selectedTemplate?.category}</span>
              </div>
              <div>
                <span className="text-gray-500">Format:</span>
                <span className="text-white ml-2">{selectedTemplate?.format}</span>
              </div>
              <div>
                <span className="text-gray-500">Type:</span>
                <span className="text-white ml-2">{selectedTemplate?.subcategory || 'Standard'}</span>
              </div>
              <div>
                <span className="text-gray-500">Prix:</span>
                <span className="text-green-400 ml-2 font-bold">{selectedTemplate?.price} CHF</span>
              </div>
            </div>
          </div>
        </div>

        {/* Customization Form - RIGHT */}
        <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700 h-fit">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Palette className="text-purple-400" />
            Personnalisation
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
                maxLength={50}
              />
              <p className="text-xs text-gray-500 mt-1">{formData.slogan.length}/50 caractères</p>
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
                maxLength={40}
              />
              <p className="text-xs text-gray-500 mt-1">{formData.product_name.length}/40 caractères</p>
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
                placeholder="Détails supplémentaires..."
                rows={2}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                maxLength={100}
              />
              <p className="text-xs text-gray-500 mt-1">{formData.description.length}/100 caractères</p>
            </div>

            {/* Brand Colors */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                <Palette className="inline w-4 h-4 mr-1" />
                Couleurs de marque
              </label>
              <div className="flex gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={formData.brand_colors[0]}
                      onChange={(e) => handleColorChange(0, e.target.value)}
                      className="w-14 h-14 rounded-xl cursor-pointer border-2 border-gray-600"
                    />
                    <div>
                      <p className="text-sm text-white">Principale</p>
                      <p className="text-xs text-gray-500">{formData.brand_colors[0]}</p>
                    </div>
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={formData.brand_colors[1]}
                      onChange={(e) => handleColorChange(1, e.target.value)}
                      className="w-14 h-14 rounded-xl cursor-pointer border-2 border-gray-600"
                    />
                    <div>
                      <p className="text-sm text-white">Secondaire</p>
                      <p className="text-xs text-gray-500">{formData.brand_colors[1]}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Quick Colors */}
              <div className="mt-3 flex items-center gap-2">
                <span className="text-xs text-gray-500">Rapide:</span>
                {['#E74C3C', '#3498DB', '#2ECC71', '#F39C12', '#9B59B6', '#1ABC9C', '#34495E'].map(color => (
                  <button
                    key={color}
                    onClick={() => handleColorChange(0, color)}
                    className="w-6 h-6 rounded-full border-2 border-gray-600 hover:scale-110 transition-transform"
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            </div>

            {/* Important Notes */}
            <div className="bg-yellow-900/30 border border-yellow-700 rounded-lg p-4">
              <h4 className="font-medium text-yellow-400 mb-2">⚠️ Règles importantes</h4>
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
              className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold rounded-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
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
          onClick={() => navigate('/dashboard/entreprise?tab=commandes-titelli')}
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
