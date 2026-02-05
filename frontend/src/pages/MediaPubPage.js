import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  RotateCcw,
  Move,
  Trash2,
  Plus,
  Lock,
  Unlock,
  Bold,
  Italic,
  AlignLeft,
  AlignCenter,
  AlignRight,
  CreditCard,
  Wand2,
  Settings,
  Copy,
  MousePointer
} from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_URL;

// Élément draggable sur le canvas
const DraggableElement = ({ element, isSelected, onSelect, onUpdate, onDelete, showWatermark }) => {
  const elementRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const handleMouseDown = (e) => {
    if (element.locked) return;
    e.stopPropagation();
    onSelect(element.id);
    setIsDragging(true);
    const rect = elementRef.current.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  const handleMouseMove = useCallback((e) => {
    if (!isDragging || element.locked) return;
    const parent = elementRef.current.parentElement;
    const parentRect = parent.getBoundingClientRect();
    const newX = e.clientX - parentRect.left - dragOffset.x;
    const newY = e.clientY - parentRect.top - dragOffset.y;
    onUpdate(element.id, { x: Math.max(0, newX), y: Math.max(0, newY) });
  }, [isDragging, dragOffset, element.id, element.locked, onUpdate]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const style = {
    position: 'absolute',
    left: element.x,
    top: element.y,
    cursor: element.locked ? 'not-allowed' : (isDragging ? 'grabbing' : 'grab'),
    userSelect: 'none',
    zIndex: isSelected ? 100 : element.zIndex || 1,
    border: isSelected ? '2px dashed #3B82F6' : 'none',
    padding: '4px',
    borderRadius: '4px',
    backgroundColor: isSelected ? 'rgba(59, 130, 246, 0.1)' : 'transparent'
  };

  const textStyle = {
    fontSize: element.fontSize || 24,
    fontWeight: element.fontWeight || 'bold',
    fontStyle: element.fontStyle || 'normal',
    textAlign: element.textAlign || 'center',
    color: element.color || '#FFFFFF',
    textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
    whiteSpace: 'nowrap',
    maxWidth: '400px',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  };

  return (
    <div
      ref={elementRef}
      style={style}
      onMouseDown={handleMouseDown}
      data-testid={`canvas-element-${element.id}`}
    >
      <div style={textStyle}>
        {element.text || element.content}
      </div>
      {element.locked && (
        <Lock className="absolute -top-2 -right-2 w-4 h-4 text-yellow-400" />
      )}
    </div>
  );
};

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
  const [orderStep, setOrderStep] = useState('browse'); // browse, customize, sur_mesure, payment, processing, confirm
  const [previewZoom, setPreviewZoom] = useState(100);
  
  // Canvas elements (éditable style Canva)
  const [canvasElements, setCanvasElements] = useState([]);
  const [selectedElementId, setSelectedElementId] = useState(null);
  
  // Form state pour Sur Mesure
  const [surMesureData, setSurMesureData] = useState({
    customRequest: '',
    wantedColors: '',
    wantedStyle: '',
    additionalInfo: ''
  });
  
  // Form state standard
  const [formData, setFormData] = useState({
    slogan: '',
    product_name: '',
    description: '',
    brand_colors: ['#0066CC', '#FFFFFF'],
    additional_notes: ''
  });
  
  const [orderResult, setOrderResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [isPaid, setIsPaid] = useState(false);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const response = await fetch(`${API_URL}/api/media-pub/templates`);
      const data = await response.json();
      setTemplates(data.templates);
      setCategories(['Sur Mesure', ...data.categories]); // Ajouter Sur Mesure en premier
      setByCategory(data.by_category);
    } catch (error) {
      console.error('Erreur chargement templates:', error);
    } finally {
      setLoading(false);
    }
  };

  // Initialiser les éléments du canvas quand un template est sélectionné
  const initializeCanvasElements = (template) => {
    const baseElements = [
      {
        id: 'product_name',
        type: 'text',
        text: 'Nom du produit',
        x: 50,
        y: 80,
        fontSize: 28,
        fontWeight: 'bold',
        color: '#FFFFFF',
        locked: false,
        zIndex: 3
      },
      {
        id: 'slogan',
        type: 'text',
        text: 'Votre slogan ici',
        x: 50,
        y: 130,
        fontSize: 42,
        fontWeight: 'bold',
        color: formData.brand_colors[0],
        locked: false,
        zIndex: 4
      },
      {
        id: 'description',
        type: 'text',
        text: 'Description...',
        x: 50,
        y: 190,
        fontSize: 18,
        fontWeight: 'normal',
        color: '#CCCCCC',
        locked: false,
        zIndex: 2
      }
    ];
    setCanvasElements(baseElements);
    setSelectedElementId(null);
  };

  // Get subcategories for selected category
  const getSubcategories = () => {
    if (selectedCategory === 'all' || selectedCategory === 'Sur Mesure') return [];
    const categoryTemplates = templates.filter(t => t.category === selectedCategory);
    const subs = [...new Set(categoryTemplates.map(t => t.subcategory).filter(Boolean))];
    return subs;
  };

  const filteredTemplates = templates.filter(t => {
    if (selectedCategory === 'Sur Mesure') return false; // Sur Mesure n'a pas de templates
    if (selectedCategory !== 'all' && t.category !== selectedCategory) return false;
    if (selectedSubcategory !== 'all' && t.subcategory !== selectedSubcategory) return false;
    return true;
  });

  const handleSelectTemplate = (template) => {
    setSelectedTemplate(template);
    setOrderStep('customize');
    initializeCanvasElements(template);
    // Reset form
    setFormData({
      slogan: '',
      product_name: '',
      description: '',
      brand_colors: ['#0066CC', '#FFFFFF'],
      additional_notes: ''
    });
    setIsPaid(false);
  };

  const handleSurMesure = () => {
    setOrderStep('sur_mesure');
    setSelectedTemplate({
      id: 'sur_mesure',
      name: 'Création Sur Mesure',
      category: 'Sur Mesure',
      format: 'Selon vos besoins',
      price: 79.90,
      description: 'Création personnalisée selon vos instructions'
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Mettre à jour l'élément correspondant sur le canvas
    if (name === 'slogan') {
      updateElement('slogan', { text: value || 'Votre slogan ici' });
    } else if (name === 'product_name') {
      updateElement('product_name', { text: value || 'Nom du produit' });
    } else if (name === 'description') {
      updateElement('description', { text: value || 'Description...' });
    }
  };

  const handleColorChange = (index, color) => {
    const newColors = [...formData.brand_colors];
    newColors[index] = color;
    setFormData(prev => ({ ...prev, brand_colors: newColors }));
    
    // Mettre à jour la couleur du slogan
    if (index === 0) {
      updateElement('slogan', { color: color });
    }
  };

  // Canvas element management
  const updateElement = (id, updates) => {
    setCanvasElements(prev => prev.map(el => 
      el.id === id ? { ...el, ...updates } : el
    ));
  };

  const deleteElement = (id) => {
    setCanvasElements(prev => prev.filter(el => el.id !== id));
    setSelectedElementId(null);
  };

  const addNewElement = () => {
    const newElement = {
      id: `custom_${Date.now()}`,
      type: 'text',
      text: 'Nouveau texte',
      x: 100,
      y: 250,
      fontSize: 20,
      fontWeight: 'normal',
      color: '#FFFFFF',
      locked: false,
      zIndex: canvasElements.length + 1
    };
    setCanvasElements(prev => [...prev, newElement]);
    setSelectedElementId(newElement.id);
  };

  const duplicateElement = (id) => {
    const element = canvasElements.find(el => el.id === id);
    if (element) {
      const newElement = {
        ...element,
        id: `${element.id}_copy_${Date.now()}`,
        x: element.x + 20,
        y: element.y + 20
      };
      setCanvasElements(prev => [...prev, newElement]);
      setSelectedElementId(newElement.id);
    }
  };

  const toggleElementLock = (id) => {
    updateElement(id, { locked: !canvasElements.find(el => el.id === id)?.locked });
  };

  const selectedElement = canvasElements.find(el => el.id === selectedElementId);

  const handleProceedToPayment = () => {
    if (!formData.slogan || !formData.product_name) {
      alert('Veuillez remplir le slogan et le nom du produit');
      return;
    }
    setOrderStep('payment');
  };

  const handlePayment = async () => {
    // Simuler le paiement (à intégrer avec Stripe)
    setSubmitting(true);
    
    // Simulation d'un délai de paiement
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsPaid(true);
    setSubmitting(false);
    
    // Lancer la commande
    handleSubmitOrder();
  };

  const handleSubmitOrder = async () => {
    setSubmitting(true);
    setOrderStep('processing');

    try {
      const orderData = orderStep === 'sur_mesure' ? {
        template_id: 'sur_mesure',
        enterprise_id: enterpriseId || 'demo-enterprise',
        slogan: surMesureData.customRequest,
        product_name: 'Création Sur Mesure',
        description: `Couleurs: ${surMesureData.wantedColors}\nStyle: ${surMesureData.wantedStyle}\nInfos: ${surMesureData.additionalInfo}`,
        brand_colors: formData.brand_colors,
        additional_notes: surMesureData.additionalInfo
      } : {
        template_id: selectedTemplate.id,
        enterprise_id: enterpriseId || 'demo-enterprise',
        slogan: formData.slogan,
        product_name: formData.product_name,
        description: formData.description,
        brand_colors: formData.brand_colors,
        additional_notes: formData.additional_notes,
        canvas_elements: canvasElements // Envoyer les positions des éléments
      };

      const response = await fetch(`${API_URL}/api/media-pub/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
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

  // Watermark Component - Filigrane très visible
  const Watermark = () => (
    <div 
      className="absolute inset-0 pointer-events-none overflow-hidden rounded-lg"
      style={{ zIndex: 1000 }}
    >
      {/* Overlay semi-transparent */}
      <div className="absolute inset-0 bg-black/10" />
      
      {/* Grille de filigranes répétés */}
      <div className="absolute inset-0 flex flex-wrap justify-center items-center">
        {[...Array(9)].map((_, i) => (
          <div 
            key={i}
            className="text-2xl font-black transform -rotate-45 mx-8 my-4"
            style={{
              color: 'rgba(255,255,255,0.35)',
              textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
              letterSpacing: '4px'
            }}
          >
            TITELLI
          </div>
        ))}
      </div>
      
      {/* Filigrane central très visible */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div 
          className="text-5xl md:text-6xl font-black transform -rotate-12"
          style={{
            color: 'rgba(255,255,255,0.5)',
            textShadow: '3px 3px 6px rgba(0,0,0,0.7)',
            letterSpacing: '8px',
            WebkitTextStroke: '1px rgba(0,0,0,0.3)'
          }}
        >
          TITELLI
        </div>
      </div>
      
      {/* Bandes diagonales */}
      <div 
        className="absolute inset-0"
        style={{
          backgroundImage: `repeating-linear-gradient(
            45deg,
            transparent,
            transparent 30px,
            rgba(255,255,255,0.05) 30px,
            rgba(255,255,255,0.05) 60px
          )`
        }}
      />
    </div>
  );

  // Live Preview Component avec Canvas interactif
  const LivePreview = () => {
    if (!selectedTemplate) return null;

    return (
      <div className="relative bg-gray-900 rounded-xl overflow-hidden" data-testid="live-preview">
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

        {/* Info badge - Filigrane */}
        {!isPaid && (
          <div className="absolute top-3 left-3 z-20 bg-yellow-500/90 text-black text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-2">
            <Lock className="w-3 h-3" />
            Filigrane - Payez pour télécharger sans
          </div>
        )}

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
            className="relative shadow-2xl select-none"
            style={{ 
              transform: `scale(${previewZoom / 100})`,
              transformOrigin: 'center center',
              transition: 'transform 0.2s ease',
              minWidth: '400px',
              minHeight: '400px'
            }}
            onClick={() => setSelectedElementId(null)}
            data-testid="canvas-container"
          >
            {/* Background Image */}
            <img
              src={selectedTemplate.preview_url}
              alt={selectedTemplate.name}
              className="max-w-full rounded-lg"
              draggable={false}
            />
            
            {/* Draggable Elements */}
            {canvasElements.map(element => (
              <DraggableElement
                key={element.id}
                element={element}
                isSelected={selectedElementId === element.id}
                onSelect={setSelectedElementId}
                onUpdate={updateElement}
                onDelete={deleteElement}
                showWatermark={!isPaid}
              />
            ))}

            {/* Color Overlay */}
            <div 
              className="absolute inset-0 pointer-events-none mix-blend-overlay opacity-20 rounded-lg"
              style={{ backgroundColor: formData.brand_colors[0] }}
            />

            {/* FILIGRANE TITELLI - Visible uniquement si non payé */}
            {!isPaid && <Watermark />}
          </div>
        </div>

        {/* Preview Info */}
        <div className="p-3 bg-gray-800/50 border-t border-gray-700 flex items-center justify-between">
          <div className="text-sm text-gray-400">
            <span className="text-gray-500">Format:</span> {selectedTemplate.format}
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <MousePointer className="w-4 h-4 text-blue-400" />
              <span className="text-sm text-gray-400">Cliquez et déplacez les éléments</span>
            </div>
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-400">Aperçu en direct</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Element Editor Panel
  const ElementEditor = () => {
    if (!selectedElement) return (
      <div className="bg-gray-800/30 rounded-lg p-4 text-center text-gray-500">
        <MousePointer className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">Sélectionnez un élément sur le canvas pour le modifier</p>
      </div>
    );

    return (
      <div className="bg-gray-800/50 rounded-lg p-4 space-y-4" data-testid="element-editor">
        <div className="flex items-center justify-between">
          <h4 className="font-medium text-white flex items-center gap-2">
            <Settings className="w-4 h-4 text-blue-400" />
            Modifier l'élément
          </h4>
          <div className="flex gap-1">
            <button
              onClick={() => toggleElementLock(selectedElement.id)}
              className={`p-1.5 rounded ${selectedElement.locked ? 'bg-yellow-500/20 text-yellow-400' : 'bg-gray-700 text-gray-400 hover:text-white'}`}
              title={selectedElement.locked ? 'Déverrouiller' : 'Verrouiller'}
            >
              {selectedElement.locked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
            </button>
            <button
              onClick={() => duplicateElement(selectedElement.id)}
              className="p-1.5 rounded bg-gray-700 text-gray-400 hover:text-white"
              title="Dupliquer"
            >
              <Copy className="w-4 h-4" />
            </button>
            <button
              onClick={() => deleteElement(selectedElement.id)}
              className="p-1.5 rounded bg-red-500/20 text-red-400 hover:bg-red-500/30"
              title="Supprimer"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Texte */}
        <div>
          <label className="block text-xs text-gray-400 mb-1">Texte</label>
          <input
            type="text"
            value={selectedElement.text}
            onChange={(e) => updateElement(selectedElement.id, { text: e.target.value })}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
            disabled={selectedElement.locked}
          />
        </div>

        {/* Taille police */}
        <div>
          <label className="block text-xs text-gray-400 mb-1">Taille ({selectedElement.fontSize}px)</label>
          <input
            type="range"
            min="12"
            max="72"
            value={selectedElement.fontSize}
            onChange={(e) => updateElement(selectedElement.id, { fontSize: parseInt(e.target.value) })}
            className="w-full"
            disabled={selectedElement.locked}
          />
        </div>

        {/* Style texte */}
        <div className="flex gap-2">
          <button
            onClick={() => updateElement(selectedElement.id, { fontWeight: selectedElement.fontWeight === 'bold' ? 'normal' : 'bold' })}
            className={`flex-1 p-2 rounded ${selectedElement.fontWeight === 'bold' ? 'bg-blue-600' : 'bg-gray-700'}`}
            disabled={selectedElement.locked}
          >
            <Bold className="w-4 h-4 mx-auto" />
          </button>
          <button
            onClick={() => updateElement(selectedElement.id, { fontStyle: selectedElement.fontStyle === 'italic' ? 'normal' : 'italic' })}
            className={`flex-1 p-2 rounded ${selectedElement.fontStyle === 'italic' ? 'bg-blue-600' : 'bg-gray-700'}`}
            disabled={selectedElement.locked}
          >
            <Italic className="w-4 h-4 mx-auto" />
          </button>
        </div>

        {/* Alignement */}
        <div className="flex gap-2">
          <button
            onClick={() => updateElement(selectedElement.id, { textAlign: 'left' })}
            className={`flex-1 p-2 rounded ${selectedElement.textAlign === 'left' ? 'bg-blue-600' : 'bg-gray-700'}`}
            disabled={selectedElement.locked}
          >
            <AlignLeft className="w-4 h-4 mx-auto" />
          </button>
          <button
            onClick={() => updateElement(selectedElement.id, { textAlign: 'center' })}
            className={`flex-1 p-2 rounded ${(!selectedElement.textAlign || selectedElement.textAlign === 'center') ? 'bg-blue-600' : 'bg-gray-700'}`}
            disabled={selectedElement.locked}
          >
            <AlignCenter className="w-4 h-4 mx-auto" />
          </button>
          <button
            onClick={() => updateElement(selectedElement.id, { textAlign: 'right' })}
            className={`flex-1 p-2 rounded ${selectedElement.textAlign === 'right' ? 'bg-blue-600' : 'bg-gray-700'}`}
            disabled={selectedElement.locked}
          >
            <AlignRight className="w-4 h-4 mx-auto" />
          </button>
        </div>

        {/* Couleur */}
        <div>
          <label className="block text-xs text-gray-400 mb-1">Couleur</label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={selectedElement.color}
              onChange={(e) => updateElement(selectedElement.id, { color: e.target.value })}
              className="w-10 h-10 rounded cursor-pointer border border-gray-600"
              disabled={selectedElement.locked}
            />
            <input
              type="text"
              value={selectedElement.color}
              onChange={(e) => updateElement(selectedElement.id, { color: e.target.value })}
              className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
              disabled={selectedElement.locked}
            />
          </div>
        </div>
      </div>
    );
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
          
          {/* Sur Mesure - Option spéciale */}
          <button
            onClick={() => { setSelectedCategory('Sur Mesure'); setSelectedSubcategory('all'); }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
              selectedCategory === 'Sur Mesure'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                : 'bg-gradient-to-r from-purple-600/30 to-pink-600/30 text-purple-300 hover:from-purple-600/50 hover:to-pink-600/50'
            }`}
          >
            <Wand2 className="w-4 h-4" />
            Sur Mesure
          </button>
          
          {categories.filter(c => c !== 'Sur Mesure').map(cat => (
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

      {/* Sur Mesure Section */}
      {selectedCategory === 'Sur Mesure' && (
        <div className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 rounded-2xl p-8 border border-purple-500/30">
          <div className="text-center max-w-2xl mx-auto">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
              <Wand2 className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">Création Sur Mesure</h2>
            <p className="text-gray-300 mb-6">
              Décrivez exactement ce que vous voulez et notre IA créera une publicité unique basée sur vos instructions. 
              Couleurs, style, slogan, tout est personnalisable selon vos envies.
            </p>
            <div className="bg-black/30 rounded-xl p-4 mb-6 text-left">
              <h4 className="font-medium text-purple-300 mb-2">Ce que vous pouvez demander :</h4>
              <ul className="text-sm text-gray-400 space-y-1">
                <li>• Modifier les couleurs, polices et style du modèle de base</li>
                <li>• Ajouter votre slogan et description personnalisés</li>
                <li>• Choisir le positionnement des éléments</li>
                <li>• Demander un style spécifique (minimaliste, luxe, moderne, etc.)</li>
              </ul>
            </div>
            <button
              onClick={handleSurMesure}
              className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold rounded-xl flex items-center gap-2 mx-auto shadow-lg shadow-purple-500/30 transition-all"
              data-testid="sur-mesure-button"
            >
              <Sparkles className="w-5 h-5" />
              Commencer ma création - 79.90 CHF
            </button>
          </div>
        </div>
      )}

      {/* Results Count */}
      {selectedCategory !== 'Sur Mesure' && (
        <>
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
                data-testid={`template-${template.id}`}
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
        </>
      )}
    </div>
  );

  // Render Sur Mesure Step
  const renderSurMesureStep = () => (
    <div className="max-w-4xl mx-auto">
      {/* Back button */}
      <button
        onClick={() => setOrderStep('browse')}
        className="text-gray-400 hover:text-white mb-6 flex items-center gap-2"
      >
        <ArrowLeft className="w-4 h-4" /> Retour aux modèles
      </button>

      <div className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 rounded-2xl p-8 border border-purple-500/20">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
            <Wand2 className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Création Sur Mesure</h2>
          <p className="text-gray-400">Décrivez exactement ce que vous voulez</p>
        </div>

        <div className="space-y-6">
          {/* Description principale */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <FileText className="inline w-4 h-4 mr-1" />
              Décrivez votre publicité idéale *
            </label>
            <textarea
              value={surMesureData.customRequest}
              onChange={(e) => setSurMesureData(prev => ({ ...prev, customRequest: e.target.value }))}
              placeholder="Ex: Je veux une publicité pour mon restaurant italien avec une ambiance chaleureuse, montrant des plats de pâtes fraîches. Le slogan serait 'La vraie cuisine italienne à Lausanne'. Style élégant mais accessible..."
              rows={5}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
            />
            <p className="text-xs text-gray-500 mt-1">Soyez aussi précis que possible</p>
          </div>

          {/* Couleurs souhaitées */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <Palette className="inline w-4 h-4 mr-1" />
              Couleurs souhaitées
            </label>
            <input
              type="text"
              value={surMesureData.wantedColors}
              onChange={(e) => setSurMesureData(prev => ({ ...prev, wantedColors: e.target.value }))}
              placeholder="Ex: Rouge bordeaux, doré, noir élégant..."
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          {/* Style souhaité */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <Sparkles className="inline w-4 h-4 mr-1" />
              Style souhaité
            </label>
            <input
              type="text"
              value={surMesureData.wantedStyle}
              onChange={(e) => setSurMesureData(prev => ({ ...prev, wantedStyle: e.target.value }))}
              placeholder="Ex: Moderne et minimaliste, Luxueux, Chaleureux et familial..."
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          {/* Informations supplémentaires */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Informations supplémentaires
            </label>
            <textarea
              value={surMesureData.additionalInfo}
              onChange={(e) => setSurMesureData(prev => ({ ...prev, additionalInfo: e.target.value }))}
              placeholder="Tout autre détail important (format préféré, éléments à éviter, etc.)"
              rows={3}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Note importante */}
          <div className="bg-yellow-900/30 border border-yellow-700/50 rounded-xl p-4">
            <h4 className="font-medium text-yellow-400 mb-2 flex items-center gap-2">
              <Lock className="w-4 h-4" />
              Protection anti-screenshot
            </h4>
            <p className="text-sm text-yellow-200/80">
              Un filigrane "TITELLI" sera présent sur l'aperçu. Après paiement, vous recevrez l'image finale sans filigrane en haute qualité.
            </p>
          </div>

          {/* Bouton Commander */}
          <button
            onClick={() => setOrderStep('payment')}
            disabled={!surMesureData.customRequest}
            className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-purple-500/30"
            data-testid="sur-mesure-submit"
          >
            <CreditCard className="w-5 h-5" />
            Procéder au paiement - 79.90 CHF
          </button>
        </div>
      </div>
    </div>
  );

  // Render Customize Step with Live Preview
  const renderCustomizeStep = () => (
    <div className="max-w-7xl mx-auto">
      {/* Back button */}
      <button
        onClick={() => setOrderStep('browse')}
        className="text-gray-400 hover:text-white mb-6 flex items-center gap-2"
      >
        <ArrowLeft className="w-4 h-4" /> Retour aux modèles
      </button>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Live Preview - LEFT (3 cols) */}
        <div className="lg:col-span-3 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Eye className="text-blue-400" />
              Aperçu en direct
            </h2>
            <span className="text-sm text-gray-400">{selectedTemplate?.name}</span>
          </div>
          
          <LivePreview />
          
          {/* Element Editor */}
          <ElementEditor />
          
          {/* Add Element Button */}
          <button
            onClick={addNewElement}
            className="w-full py-3 bg-gray-800 hover:bg-gray-700 border-2 border-dashed border-gray-600 rounded-xl text-gray-400 hover:text-white flex items-center justify-center gap-2 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Ajouter un élément texte
          </button>
        </div>

        {/* Customization Form - RIGHT (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Palette className="text-purple-400" />
              Personnalisation rapide
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
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={formData.brand_colors[0]}
                        onChange={(e) => handleColorChange(0, e.target.value)}
                        className="w-12 h-12 rounded-lg cursor-pointer border-2 border-gray-600"
                      />
                      <div>
                        <p className="text-sm text-white">Principale</p>
                        <p className="text-xs text-gray-500">{formData.brand_colors[0]}</p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={formData.brand_colors[1]}
                        onChange={(e) => handleColorChange(1, e.target.value)}
                        className="w-12 h-12 rounded-lg cursor-pointer border-2 border-gray-600"
                      />
                      <div>
                        <p className="text-sm text-white">Secondaire</p>
                        <p className="text-xs text-gray-500">{formData.brand_colors[1]}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Quick Colors */}
                <div className="mt-3 flex items-center gap-2 flex-wrap">
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
            </div>
          </div>

          {/* Important Notes */}
          <div className="bg-yellow-900/30 border border-yellow-700 rounded-xl p-4">
            <h4 className="font-medium text-yellow-400 mb-2 flex items-center gap-2">
              <Lock className="w-4 h-4" />
              Protection anti-screenshot
            </h4>
            <ul className="text-sm text-yellow-200/80 space-y-1">
              <li>• Filigrane visible jusqu'au paiement</li>
              <li>• Image HD sans filigrane après achat</li>
              <li>• Pas de prix ni dates sur l'image</li>
            </ul>
          </div>

          {/* Template Info */}
          <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
            <div className="grid grid-cols-2 gap-3 text-sm">
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

          {/* Submit Button */}
          <button
            onClick={handleProceedToPayment}
            disabled={submitting || !formData.slogan || !formData.product_name}
            className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
            data-testid="proceed-to-payment"
          >
            <CreditCard className="w-5 h-5" />
            Procéder au paiement - {selectedTemplate?.price} CHF
          </button>
        </div>
      </div>
    </div>
  );

  // Render Payment Step
  const renderPaymentStep = () => (
    <div className="max-w-lg mx-auto">
      <button
        onClick={() => setOrderStep(selectedTemplate?.id === 'sur_mesure' ? 'sur_mesure' : 'customize')}
        className="text-gray-400 hover:text-white mb-6 flex items-center gap-2"
      >
        <ArrowLeft className="w-4 h-4" /> Retour à la personnalisation
      </button>

      <div className="bg-gray-800/50 rounded-2xl p-8 border border-gray-700">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-500/20 flex items-center justify-center">
            <CreditCard className="w-8 h-8 text-blue-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Paiement</h2>
          <p className="text-gray-400">Finalisez votre commande</p>
        </div>

        {/* Récapitulatif */}
        <div className="bg-gray-900/50 rounded-xl p-4 mb-6">
          <h4 className="font-medium text-white mb-3">Récapitulatif</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Template:</span>
              <span className="text-white">{selectedTemplate?.name}</span>
            </div>
            {selectedTemplate?.id !== 'sur_mesure' && (
              <>
                <div className="flex justify-between">
                  <span className="text-gray-400">Slogan:</span>
                  <span className="text-white">{formData.slogan || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Produit:</span>
                  <span className="text-white">{formData.product_name || '-'}</span>
                </div>
              </>
            )}
            <div className="border-t border-gray-700 pt-2 mt-2 flex justify-between">
              <span className="text-gray-300 font-medium">Total:</span>
              <span className="text-green-400 font-bold text-lg">{selectedTemplate?.price} CHF</span>
            </div>
          </div>
        </div>

        {/* Info Filigrane */}
        <div className="bg-green-900/30 border border-green-700/50 rounded-xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <Unlock className="w-5 h-5 text-green-400 mt-0.5" />
            <div>
              <h4 className="font-medium text-green-400 mb-1">Après paiement</h4>
              <p className="text-sm text-green-200/80">
                Vous recevrez votre image en haute qualité <strong>sans le filigrane Titelli</strong>. 
                Le fichier sera disponible dans votre espace "Commandes Titelli".
              </p>
            </div>
          </div>
        </div>

        {/* Bouton Paiement */}
        <button
          onClick={handlePayment}
          disabled={submitting}
          className="w-full py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-green-500/30"
          data-testid="confirm-payment"
        >
          {submitting ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Traitement en cours...
            </>
          ) : (
            <>
              <CreditCard className="w-5 h-5" />
              Payer {selectedTemplate?.price} CHF
            </>
          )}
        </button>

        <p className="text-xs text-gray-500 text-center mt-4">
          Paiement sécurisé par Stripe. Vos données sont protégées.
        </p>
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
      <h2 className="text-2xl font-bold text-white mb-2">Commande confirmée !</h2>
      <p className="text-gray-400 mb-6">
        Votre publicité <strong>sans filigrane</strong> sera disponible dans quelques minutes dans la section 
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
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <Download className="w-4 h-4" />
          Voir mes commandes
        </button>
        <button
          onClick={() => {
            setOrderStep('browse');
            setSelectedTemplate(null);
            setCanvasElements([]);
            setIsPaid(false);
            setFormData({
              slogan: '',
              product_name: '',
              description: '',
              brand_colors: ['#0066CC', '#FFFFFF'],
              additional_notes: ''
            });
            setSurMesureData({
              customRequest: '',
              wantedColors: '',
              wantedStyle: '',
              additionalInfo: ''
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
        {orderStep === 'sur_mesure' && renderSurMesureStep()}
        {orderStep === 'payment' && renderPaymentStep()}
        {orderStep === 'processing' && renderProcessingStep()}
        {orderStep === 'confirm' && renderConfirmStep()}
      </div>
    </div>
  );
};

export default MediaPubPage;
