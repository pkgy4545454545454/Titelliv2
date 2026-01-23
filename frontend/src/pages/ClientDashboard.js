import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, User, Heart, ShoppingCart, CreditCard, Wallet, Calendar, 
  MessageSquare, FileText, Settings, Gift, Crown, TrendingUp, MapPin,
  ChevronRight, Star, Bell, Search, Rss, Newspaper, PieChart, Briefcase,
  GraduationCap, FolderOpen, Phone, Truck, Package, Users, HelpCircle, 
  Handshake, Info, Target, Building2, Menu, X, Camera, Edit, Trash2, Plus,
  CheckCircle, XCircle, Send, Linkedin, Eye, UserPlus, ArrowLeftRight,
  Upload, Clock, ChevronDown
} from 'lucide-react';
import { 
  orderAPI, cashbackAPI, featuredAPI, clientProfileAPI, friendsAPI, 
  paymentCardsAPI, clientDocumentsAPI, messagesAPI, notificationsAPI, uploadAPI,
  trainingsAPI, onlineStatusAPI
} from '../services/api';
import api from '../services/api';
import { toast } from 'sonner';
import EnterpriseCard from '../components/EnterpriseCard';

const ClientDashboard = () => {
  const { user, isClient, updateUser } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(() => {
    const tabParam = searchParams.get('tab');
    return tabParam || 'overview';
  });
  
  // Get returnToJob parameter for CV upload flow
  const returnToJobId = searchParams.get('returnToJob');
  
  const [orders, setOrders] = useState([]);
  const [cashback, setCashback] = useState(0);
  const [tendances, setTendances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Profile states
  const [profileStats, setProfileStats] = useState({ profile_views: 0, friends_count: 0, orders_count: 0 });
  const [editProfile, setEditProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({});
  const fileInputRef = useRef(null);
  
  // Friends states
  const [friends, setFriends] = useState([]);
  const [friendRequests, setFriendRequests] = useState({ received: [], sent: [] });
  const [suggestedFriends, setSuggestedFriends] = useState([]);
  
  // Cards states
  const [cards, setCards] = useState([]);
  const [showAddCard, setShowAddCard] = useState(false);
  const [cardForm, setCardForm] = useState({ card_holder: '', card_number_last4: '', card_type: 'visa', expiry_month: 1, expiry_year: 2026, is_default: false });
  
  // Documents states
  const [documents, setDocuments] = useState([]);
  const [showAddDocument, setShowAddDocument] = useState(false);
  const [documentForm, setDocumentForm] = useState({ name: '', category: 'general', url: '' });
  
  // Pre-select CV category if coming from job application
  useEffect(() => {
    if (returnToJobId && activeTab === 'documents') {
      setDocumentForm(prev => ({ ...prev, category: 'cv' }));
    }
  }, [returnToJobId, activeTab]);
  
  // Messages states
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  
  // Notifications
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Trainings/Formations states
  const [myTrainings, setMyTrainings] = useState({ enrollments: [], stats: { total: 0, in_progress: 0, completed: 0 } });
  const [trainingsFilter, setTrainingsFilter] = useState('all'); // 'all', 'in_progress', 'completed'
  const [loadingTrainings, setLoadingTrainings] = useState(false);

  // Online status
  const [friendsOnlineData, setFriendsOnlineData] = useState({ friends: [], online_count: 0, total_count: 0 });

  // Training review state
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewingTraining, setReviewingTraining] = useState(null);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    if (!isClient) {
      navigate('/');
      return;
    }
    fetchInitialData();
    
    // Start heartbeat for online status
    const heartbeatInterval = setInterval(() => {
      onlineStatusAPI.heartbeat().catch(() => {});
    }, 60000); // Every minute
    
    // Send initial heartbeat
    onlineStatusAPI.heartbeat().catch(() => {});
    
    // Cleanup on unmount
    return () => {
      clearInterval(heartbeatInterval);
      onlineStatusAPI.setOffline().catch(() => {});
    };
  }, [isClient, navigate]);

  const fetchInitialData = async () => {
    try {
      const [ordersRes, cashbackRes, tendancesRes, notifRes] = await Promise.all([
        orderAPI.list(),
        cashbackAPI.balance(),
        featuredAPI.tendances(),
        notificationsAPI.list()
      ]);
      setOrders(ordersRes.data);
      setCashback(cashbackRes.data.balance);
      setTendances(tendancesRes.data);
      setNotifications(notifRes.data.notifications || []);
      setUnreadCount(notifRes.data.unread_count || 0);
      setProfileForm(user || {});
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch profile data when switching to profile tab
  useEffect(() => {
    if (activeTab === 'profile') {
      fetchProfileData();
    } else if (activeTab === 'contacts' || activeTab === 'demandes') {
      fetchFriendsData();
    } else if (activeTab === 'cartes') {
      fetchCards();
    } else if (activeTab === 'documents') {
      fetchDocuments();
    } else if (activeTab === 'messages') {
      fetchConversations();
    } else if (activeTab === 'formations') {
      fetchMyTrainings();
    }
  }, [activeTab]);

  const fetchProfileData = async () => {
    try {
      const res = await clientProfileAPI.get();
      setProfileStats(res.data.stats || {});
      setProfileForm(res.data.user || user);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const fetchFriendsData = async () => {
    try {
      const [friendsRes, requestsRes, suggestionsRes, onlineRes] = await Promise.all([
        friendsAPI.list(),
        friendsAPI.getRequests(),
        friendsAPI.getSuggestions(),
        onlineStatusAPI.getFriendsOnline()
      ]);
      setFriends(friendsRes.data.friends || []);
      setFriendRequests(requestsRes.data || { received: [], sent: [] });
      setSuggestedFriends(suggestionsRes.data.suggestions || []);
      setFriendsOnlineData(onlineRes.data || { friends: [], online_count: 0, total_count: 0 });
    } catch (error) {
      console.error('Error fetching friends:', error);
    }
  };

  const fetchCards = async () => {
    try {
      const res = await paymentCardsAPI.list();
      setCards(res.data.cards || []);
    } catch (error) {
      console.error('Error fetching cards:', error);
    }
  };

  const fetchDocuments = async () => {
    try {
      const res = await clientDocumentsAPI.list();
      setDocuments(res.data.documents || []);
    } catch (error) {
      console.error('Error fetching documents:', error);
    }
  };

  const fetchConversations = async () => {
    try {
      const res = await messagesAPI.getConversations();
      setConversations(res.data.conversations || []);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    }
  };

  // Trainings/Formations handlers
  const fetchMyTrainings = async () => {
    setLoadingTrainings(true);
    try {
      const statusParam = trainingsFilter === 'all' ? null : trainingsFilter;
      const res = await trainingsAPI.getMyTrainings(statusParam);
      setMyTrainings(res.data || { enrollments: [], stats: { total: 0, in_progress: 0, completed: 0 } });
    } catch (error) {
      console.error('Error fetching trainings:', error);
    } finally {
      setLoadingTrainings(false);
    }
  };

  const handleMarkTrainingComplete = async (enrollmentId) => {
    try {
      await trainingsAPI.markComplete(enrollmentId);
      toast.success('Formation marquée comme terminée');
      fetchMyTrainings();
    } catch (error) {
      toast.error('Erreur lors de la mise à jour');
    }
  };

  // Training review handler
  const handleSubmitReview = async () => {
    if (!reviewingTraining) return;
    setSubmittingReview(true);
    try {
      await trainingsAPI.createReview(reviewingTraining.training_id, {
        training_id: reviewingTraining.training_id,
        rating: reviewForm.rating,
        comment: reviewForm.comment
      });
      toast.success('Merci pour votre avis !');
      setShowReviewModal(false);
      setReviewingTraining(null);
      setReviewForm({ rating: 5, comment: '' });
    } catch (error) {
      const msg = error.response?.data?.detail || 'Erreur lors de l\'envoi';
      toast.error(msg);
    } finally {
      setSubmittingReview(false);
    }
  };

  // Refetch trainings when filter changes
  useEffect(() => {
    if (activeTab === 'formations') {
      fetchMyTrainings();
    }
  }, [trainingsFilter]);

  // Profile handlers
  const handleProfileUpdate = async () => {
    try {
      const res = await clientProfileAPI.update(profileForm);
      if (updateUser) updateUser(res.data);
      setEditProfile(false);
      toast.success('Profil mis à jour');
    } catch (error) {
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    try {
      const res = await uploadAPI.uploadImage(file);
      const avatarUrl = res.data.url;
      setProfileForm({ ...profileForm, avatar: avatarUrl });
      await clientProfileAPI.update({ avatar: avatarUrl });
      toast.success('Photo de profil mise à jour');
    } catch (error) {
      toast.error('Erreur lors de l\'upload');
    }
  };

  // Friends handlers
  const handleSendFriendRequest = async (friendId) => {
    try {
      await friendsAPI.sendRequest(friendId);
      toast.success('Demande d\'ami envoyée');
      fetchFriendsData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Erreur');
    }
  };

  const handleRespondToRequest = async (friendshipId, accept) => {
    try {
      await friendsAPI.respond(friendshipId, accept);
      toast.success(accept ? 'Ami ajouté' : 'Demande refusée');
      fetchFriendsData();
    } catch (error) {
      toast.error('Erreur');
    }
  };

  const handleRemoveFriend = async (friendshipId) => {
    try {
      await friendsAPI.remove(friendshipId);
      toast.success('Ami supprimé');
      fetchFriendsData();
    } catch (error) {
      toast.error('Erreur');
    }
  };

  // Cards handlers
  const handleAddCard = async () => {
    if (!cardForm.card_holder || !cardForm.card_number_last4) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }
    try {
      await paymentCardsAPI.add(cardForm);
      toast.success('Carte ajoutée');
      setShowAddCard(false);
      setCardForm({ card_holder: '', card_number_last4: '', card_type: 'visa', expiry_month: 1, expiry_year: 2026, is_default: false });
      fetchCards();
    } catch (error) {
      toast.error('Erreur lors de l\'ajout');
    }
  };

  const handleDeleteCard = async (cardId) => {
    try {
      await paymentCardsAPI.delete(cardId);
      toast.success('Carte supprimée');
      fetchCards();
    } catch (error) {
      toast.error('Erreur');
    }
  };

  // Documents handlers
  const handleAddDocument = async () => {
    // Auto-set name from uploaded file if empty
    const finalName = documentForm.name || (documentForm.url ? 'Mon document' : '');
    
    if (!finalName || !documentForm.url) {
      toast.error('Veuillez uploader un fichier');
      return;
    }
    try {
      await clientDocumentsAPI.add({
        ...documentForm,
        name: finalName
      });
      toast.success('Document ajouté');
      setShowAddDocument(false);
      setDocumentForm({ name: '', category: returnToJobId ? 'cv' : 'general', url: '' });
      fetchDocuments();
    } catch (error) {
      toast.error('Erreur lors de l\'ajout');
    }
  };

  const handleDocumentUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    try {
      const res = await uploadAPI.uploadImage(file);
      // Auto-set name from file if not already set
      const fileName = file.name.replace(/\.[^/.]+$/, ''); // Remove extension
      setDocumentForm({ 
        ...documentForm, 
        url: res.data.url, 
        name: documentForm.name || fileName 
      });
      toast.success('Fichier uploadé');
    } catch (error) {
      toast.error('Erreur lors de l\'upload');
    }
  };

  const handleDeleteDocument = async (docId) => {
    try {
      await clientDocumentsAPI.delete(docId);
      toast.success('Document supprimé');
      fetchDocuments();
    } catch (error) {
      toast.error('Erreur');
    }
  };

  // Messages handlers
  const handleSelectConversation = async (partnerId) => {
    try {
      const res = await messagesAPI.getMessages(partnerId);
      setMessages(res.data.messages || []);
      setSelectedConversation(res.data.partner);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;
    
    try {
      await messagesAPI.send(selectedConversation.id, newMessage);
      setNewMessage('');
      handleSelectConversation(selectedConversation.id);
    } catch (error) {
      toast.error('Erreur lors de l\'envoi');
    }
  };

  // Switch to particulier account (former entrepreneur)
  const handleSwitchAccount = async () => {
    // Check if user has a "particulier" profile
    try {
      const res = await api.get('/client/particulier-check');
      if (res.data?.has_particulier) {
        // User has a particulier account, switch view
        setActiveTab('particulier');
        toast.success('Basculé vers votre espace particulier');
      } else {
        toast.info('Créez un compte particulier depuis le menu pour accéder à cette fonctionnalité');
      }
    } catch (error) {
      // API doesn't exist yet, just switch to the particulier tab
      setActiveTab('particulier');
    }
  };

  const menuSections = [
    {
      title: 'Principal',
      gradient: 'from-blue-500/20 to-blue-600/10',
      borderColor: 'border-blue-500/30',
      items: [
        { id: 'overview', label: 'Accueil', icon: LayoutDashboard },
        { id: 'profile', label: 'Mon Profil', icon: User },
        { id: 'mode_vie', label: 'Mon mode de vie', icon: Heart },
        { id: 'feed', label: 'Mon fil d\'actualité', icon: Rss },
        { id: 'my_feed', label: 'Mon feed', icon: Newspaper },
      ]
    },
    {
      title: 'Avantages',
      gradient: 'from-purple-500/20 to-purple-600/10',
      borderColor: 'border-purple-500/30',
      items: [
        { id: 'cashback', label: 'Mon cash-back', icon: Wallet },
        { id: 'premium', label: 'Mon Premium', icon: Crown },
        { id: 'invitations', label: 'Mes invitations prestataires', icon: Gift },
        { id: 'offres', label: 'Mes offres du moment', icon: Target },
        { id: 'guests', label: 'Mes guests du moment', icon: Star },
        { id: 'tendances', label: 'Mes tendances actuelles', icon: TrendingUp },
        { id: 'cadeaux', label: 'Mes cadeaux du mois', icon: Gift },
      ]
    },
    {
      title: 'Investissements & Emplois',
      gradient: 'from-green-500/20 to-green-600/10',
      borderColor: 'border-green-500/30',
      items: [
        { id: 'investments', label: 'Mes investissements', icon: PieChart },
        { id: 'business_news', label: 'Mon local business news', icon: Newspaper },
        { id: 'jobs', label: 'Mes emplois', icon: Briefcase },
        { id: 'formations', label: 'Mes formations', icon: GraduationCap },
      ]
    },
    {
      title: 'Gestion',
      gradient: 'from-yellow-500/20 to-yellow-600/10',
      borderColor: 'border-yellow-500/30',
      items: [
        { id: 'agenda', label: 'Mon agenda', icon: Calendar },
        { id: 'cartes', label: 'Mes cartes', icon: CreditCard },
        { id: 'finances', label: 'Mes finances', icon: FileText },
        { id: 'donations', label: 'Mes donations', icon: Heart },
        { id: 'documents', label: 'Mes documents', icon: FolderOpen },
      ]
    },
    {
      title: 'Communication',
      gradient: 'from-pink-500/20 to-pink-600/10',
      borderColor: 'border-pink-500/30',
      items: [
        { id: 'messages', label: 'Messagerie', icon: MessageSquare, notifKey: 'messages' },
        { id: 'contacts', label: 'Contacts & Amis', icon: Users },
        { id: 'demandes', label: 'Demandes en cours', icon: UserPlus, notifKey: 'friend_requests' },
        { id: 'particulier', label: 'Compte particulier', icon: Building2 },
      ]
    },
    {
      title: 'Recommandations',
      gradient: 'from-cyan-500/20 to-cyan-600/10',
      borderColor: 'border-cyan-500/30',
      items: [
        { id: 'suggestions', label: 'Suggestions de mes contacts', icon: Users },
        { id: 'prestataires', label: 'Mes prestataires personnels', icon: Star },
        { id: 'wishlist', label: 'Ma liste de souhaits', icon: Heart },
      ]
    },
    {
      title: 'Commandes',
      gradient: 'from-orange-500/20 to-orange-600/10',
      borderColor: 'border-orange-500/30',
      items: [
        { id: 'orders', label: 'Mes commandes', icon: ShoppingCart, notifKey: 'orders' },
        { id: 'panier', label: 'Mon panier', icon: ShoppingCart },
        { id: 'livraisons', label: 'Livraison', icon: Truck },
      ]
    },
    {
      title: 'Aide & Informations',
      gradient: 'from-slate-500/20 to-slate-600/10',
      borderColor: 'border-slate-500/30',
      items: [
        { id: 'support', label: 'Service client', icon: HelpCircle },
        { id: 'partners', label: 'Partenaires', icon: Handshake },
        { id: 'about', label: 'À propos', icon: Info },
        { id: 'settings', label: 'Paramètres', icon: Settings },
      ]
    },
  ];

  // Notification counts for menu items
  const getNotificationCount = (key) => {
    switch(key) {
      case 'messages':
        return notifications.filter(n => n.type === 'message' && !n.read).length;
      case 'friend_requests':
        return friendRequests.received?.length || 0;
      case 'orders':
        return notifications.filter(n => n.type === 'order' && !n.read).length;
      default:
        return 0;
    }
  };

  const quickStats = [
    { label: 'Cash-back disponible', value: `${cashback.toFixed(2)} CHF`, icon: Wallet, color: 'text-green-500' },
    { label: 'Commandes', value: orders.length.toString(), icon: ShoppingCart, color: 'text-[#0047AB]' },
    { label: 'Vues profil', value: profileStats.profile_views?.toString() || '0', icon: Eye, color: 'text-purple-500' },
    { label: 'Amis', value: profileStats.friends_count?.toString() || '0', icon: Users, color: 'text-[#D4AF37]' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] pt-24 flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-[#0047AB] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] pt-20" data-testid="client-dashboard">
      {/* Mobile Menu Button */}
      <button 
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="lg:hidden fixed bottom-6 right-6 z-50 w-14 h-14 bg-[#0047AB] rounded-full flex items-center justify-center shadow-lg"
      >
        {mobileMenuOpen ? <X className="w-6 h-6 text-white" /> : <Menu className="w-6 h-6 text-white" />}
      </button>

      <div className="flex">
        {/* Sidebar */}
        <aside className={`w-64 min-h-screen bg-[#0A0A0A] border-r border-white/5 fixed left-0 top-20 bottom-0 overflow-y-auto z-40 transition-transform duration-300 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
          <div className="p-4 hide-scrollbar">
            {/* Profile Header with Switch Button */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#0047AB] flex items-center justify-center text-white font-bold text-sm overflow-hidden">
                  {profileForm?.avatar ? (
                    <img src={profileForm.avatar.startsWith('http') ? profileForm.avatar : `${process.env.REACT_APP_BACKEND_URL}${profileForm.avatar}`} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <>{user?.first_name?.[0]}{user?.last_name?.[0]}</>
                  )}
                </div>
                <div>
                  <p className="font-semibold text-white text-sm">{user?.first_name} {user?.last_name}</p>
                  <p className="text-xs text-gray-500">Espace client</p>
                </div>
              </div>
              <button 
                onClick={handleSwitchAccount}
                className="p-2 bg-white/5 rounded-lg hover:bg-[#0047AB]/20 transition-colors group"
                title="Basculer vers compte particulier"
              >
                <ArrowLeftRight className="w-4 h-4 text-gray-400 group-hover:text-[#0047AB] transition-colors" />
              </button>
            </div>

            {/* Notifications Badge */}
            {unreadCount > 0 && (
              <div className="mb-4 p-3 bg-[#0047AB]/10 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-[#0047AB]" />
                  <span className="text-sm text-white">{unreadCount} notification{unreadCount > 1 ? 's' : ''}</span>
                </div>
                <span className="w-2 h-2 bg-[#0047AB] rounded-full animate-pulse" />
              </div>
            )}

            {/* Search Bar */}
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input 
                type="text" 
                placeholder="Rechercher..."
                className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-gray-500 focus:border-[#0047AB]/50 focus:outline-none"
              />
            </div>

            <nav className="space-y-4">
              {menuSections.map((section) => (
                <div key={section.title}>
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-3">
                    {section.title}
                  </h3>
                  <div className="space-y-0.5">
                    {section.items.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => { setActiveTab(item.id); setMobileMenuOpen(false); }}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                          activeTab === item.id
                            ? 'bg-[#0047AB]/20 text-[#0047AB]'
                            : 'text-gray-400 hover:bg-white/5 hover:text-white'
                        }`}
                        data-testid={`menu-${item.id}`}
                      >
                        <item.icon className="w-4 h-4" />
                        <span className="truncate">{item.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </nav>
          </div>
        </aside>

        {/* Overlay for mobile */}
        {mobileMenuOpen && (
          <div 
            className="lg:hidden fixed inset-0 bg-black/50 z-30"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 lg:ml-64 p-4 md:p-6 lg:p-8">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6 md:space-y-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
                    Bonjour, {user?.first_name} !
                  </h1>
                  <p className="text-gray-400 mt-1 text-sm md:text-base">Bienvenue sur votre espace Titelli</p>
                </div>
                <Link to="/" className="btn-primary flex items-center justify-center gap-2 text-sm md:text-base">
                  <Search className="w-4 h-4 md:w-5 md:h-5" />
                  Explorer
                </Link>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                {quickStats.map((stat, index) => (
                  <div key={index} className="card-service rounded-xl p-4 md:p-6">
                    <div className={`p-3 rounded-xl bg-white/5 w-fit mb-4 ${stat.color}`}>
                      <stat.icon className="w-5 h-5" />
                    </div>
                    <p className="text-2xl font-bold text-white">{stat.value}</p>
                    <p className="text-sm text-gray-400 mt-1">{stat.label}</p>
                  </div>
                ))}
              </div>

              {/* Premium CTA */}
              {!user?.is_premium && (
                <div className="card-service rounded-xl p-8 bg-gradient-to-r from-[#0047AB]/20 to-[#D4AF37]/20 border border-[#D4AF37]/30">
                  <div className="flex items-center gap-6">
                    <div className="p-4 rounded-2xl bg-gradient-to-br from-[#D4AF37] to-[#0047AB]">
                      <Crown className="w-8 h-8 text-white" />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-xl font-bold text-white mb-2">Passez à Premium</h2>
                      <p className="text-gray-400">Accédez à des offres exclusives, un service premium et bien plus encore.</p>
                    </div>
                    <button className="btn-primary" data-testid="upgrade-premium">
                      Découvrir
                    </button>
                  </div>
                </div>
              )}

              {/* Recent Orders */}
              <div className="card-service rounded-xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
                    Mes dernières commandes
                  </h2>
                  <button onClick={() => setActiveTab('orders')} className="text-[#0047AB] text-sm font-medium flex items-center gap-1">
                    Voir tout <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
                {orders.length > 0 ? (
                  <div className="space-y-4">
                    {orders.slice(0, 3).map((order) => (
                      <div key={order.id} className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                        <div>
                          <p className="text-white font-medium">Commande #{order.id.slice(0, 8)}</p>
                          <p className="text-sm text-gray-400">{new Date(order.created_at).toLocaleDateString('fr-FR')}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-white font-medium">{order.total?.toFixed(2)} CHF</p>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            order.status === 'completed' ? 'bg-green-500/20 text-green-500' :
                            order.status === 'pending' ? 'bg-yellow-500/20 text-yellow-500' :
                            'bg-gray-500/20 text-gray-500'
                          }`}>
                            {order.status === 'pending' ? 'En cours' : order.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">Aucune commande pour le moment</p>
                )}
              </div>

              {/* Recommendations */}
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
                    Tendances pour vous
                  </h2>
                  <Link to="/labellises" className="text-[#D4AF37] text-sm font-medium flex items-center gap-1">
                    Voir tout <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {tendances.slice(0, 3).map((enterprise) => (
                    <EnterpriseCard key={enterprise.id} enterprise={enterprise} />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Profile Tab - Enhanced */}
          {activeTab === 'profile' && (
            <div className="max-w-2xl">
              <div className="flex items-center justify-between mb-8">
                <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
                  Mon Profil
                </h1>
                <button 
                  onClick={() => setEditProfile(!editProfile)}
                  className="btn-secondary flex items-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  {editProfile ? 'Annuler' : 'Modifier'}
                </button>
              </div>
              
              <div className="card-service rounded-xl p-8">
                {/* Avatar Section */}
                <div className="flex items-center gap-6 mb-8">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full bg-[#0047AB] flex items-center justify-center text-white text-2xl font-bold overflow-hidden">
                      {profileForm?.avatar ? (
                        <img 
                          src={profileForm.avatar.startsWith('http') ? profileForm.avatar : `${process.env.REACT_APP_BACKEND_URL}${profileForm.avatar}`} 
                          alt="" 
                          className="w-full h-full object-cover" 
                        />
                      ) : (
                        <>{user?.first_name?.[0]}{user?.last_name?.[0]}</>
                      )}
                    </div>
                    {editProfile && (
                      <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute -bottom-2 -right-2 p-2 bg-[#0047AB] rounded-full text-white hover:bg-[#0047AB]/80 transition-colors"
                      >
                        <Camera className="w-4 h-4" />
                      </button>
                    )}
                    <input 
                      ref={fileInputRef}
                      type="file" 
                      accept="image/*" 
                      onChange={handleAvatarUpload}
                      className="hidden" 
                    />
                  </div>
                  <div className="flex-1">
                    {editProfile ? (
                      <div className="grid grid-cols-2 gap-3">
                        <input
                          type="text"
                          value={profileForm.first_name || ''}
                          onChange={(e) => setProfileForm({...profileForm, first_name: e.target.value})}
                          placeholder="Prénom"
                          className="input-dark"
                        />
                        <input
                          type="text"
                          value={profileForm.last_name || ''}
                          onChange={(e) => setProfileForm({...profileForm, last_name: e.target.value})}
                          placeholder="Nom"
                          className="input-dark"
                        />
                      </div>
                    ) : (
                      <>
                        <h2 className="text-xl font-bold text-white">{user?.first_name} {user?.last_name}</h2>
                        <p className="text-gray-400">{user?.email}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <MapPin className="w-4 h-4 text-gray-500" />
                          <span className="text-gray-500">{user?.city || 'Lausanne'}</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-3 gap-4 mb-8 p-4 bg-white/5 rounded-xl">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-white">{profileStats.profile_views || 0}</p>
                    <p className="text-xs text-gray-500">Vues du profil</p>
                  </div>
                  <div className="text-center border-x border-white/10">
                    <p className="text-2xl font-bold text-white">{profileStats.friends_count || 0}</p>
                    <p className="text-xs text-gray-500">Amis</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-white">{profileStats.orders_count || 0}</p>
                    <p className="text-xs text-gray-500">Commandes</p>
                  </div>
                </div>

                {/* Profile Details */}
                <div className="space-y-4">
                  <div className="flex justify-between py-3 border-b border-white/10">
                    <span className="text-gray-400">Email</span>
                    {editProfile ? (
                      <span className="text-gray-500">{user?.email} (non modifiable)</span>
                    ) : (
                      <span className="text-white">{user?.email}</span>
                    )}
                  </div>
                  
                  <div className="flex justify-between py-3 border-b border-white/10">
                    <span className="text-gray-400">Téléphone</span>
                    {editProfile ? (
                      <input
                        type="tel"
                        value={profileForm.phone || ''}
                        onChange={(e) => setProfileForm({...profileForm, phone: e.target.value})}
                        className="input-dark text-right w-48"
                        placeholder="+41 XX XXX XX XX"
                      />
                    ) : (
                      <span className="text-white">{user?.phone || 'Non renseigné'}</span>
                    )}
                  </div>

                  <div className="flex justify-between py-3 border-b border-white/10">
                    <span className="text-gray-400 flex items-center gap-2">
                      <Linkedin className="w-4 h-4" /> LinkedIn
                    </span>
                    {editProfile ? (
                      <input
                        type="url"
                        value={profileForm.linkedin || ''}
                        onChange={(e) => setProfileForm({...profileForm, linkedin: e.target.value})}
                        className="input-dark text-right w-64"
                        placeholder="https://linkedin.com/in/..."
                      />
                    ) : (
                      <span className="text-white">
                        {user?.linkedin ? (
                          <a href={user.linkedin} target="_blank" rel="noopener noreferrer" className="text-[#0047AB] hover:underline">
                            Voir le profil
                          </a>
                        ) : 'Non connecté'}
                      </span>
                    )}
                  </div>

                  <div className="flex justify-between py-3 border-b border-white/10">
                    <span className="text-gray-400">Ville</span>
                    {editProfile ? (
                      <input
                        type="text"
                        value={profileForm.city || ''}
                        onChange={(e) => setProfileForm({...profileForm, city: e.target.value})}
                        className="input-dark text-right w-48"
                        placeholder="Lausanne"
                      />
                    ) : (
                      <span className="text-white">{user?.city || 'Non renseigné'}</span>
                    )}
                  </div>

                  <div className="flex justify-between py-3 border-b border-white/10">
                    <span className="text-gray-400">Compte Premium</span>
                    <span className={user?.is_premium ? 'text-[#D4AF37]' : 'text-gray-500'}>
                      {user?.is_premium ? 'Actif' : 'Inactif'}
                    </span>
                  </div>
                  
                  <div className="flex justify-between py-3 border-b border-white/10">
                    <span className="text-gray-400">Cash-back disponible</span>
                    <span className="text-green-500">{cashback.toFixed(2)} CHF</span>
                  </div>
                </div>

                {editProfile && (
                  <button onClick={handleProfileUpdate} className="btn-primary w-full mt-6">
                    Enregistrer les modifications
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Contacts & Friends Tab */}
          {activeTab === 'contacts' && (
            <div className="space-y-6">
              <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
                Contacts & Amis
              </h1>

              {/* Friend Requests */}
              {friendRequests.received.length > 0 && (
                <div className="card-service rounded-xl p-6 border-yellow-500/30">
                  <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Bell className="w-5 h-5 text-yellow-500" />
                    Demandes d'amis ({friendRequests.received.length})
                  </h2>
                  <div className="space-y-3">
                    {friendRequests.received.map((request) => (
                      <div key={request.id} className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-[#0047AB] flex items-center justify-center text-white font-bold">
                            {request.sender?.first_name?.[0]}{request.sender?.last_name?.[0]}
                          </div>
                          <div>
                            <p className="text-white font-medium">{request.sender?.first_name} {request.sender?.last_name}</p>
                            <p className="text-sm text-gray-400">{request.message || 'Souhaite vous ajouter'}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleRespondToRequest(request.id, true)}
                            className="p-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30"
                          >
                            <CheckCircle className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleRespondToRequest(request.id, false)}
                            className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30"
                          >
                            <XCircle className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Friends List */}
              <div className="card-service rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-white">Mes amis ({friends.length})</h2>
                  {friendsOnlineData.online_count > 0 && (
                    <span className="flex items-center gap-2 text-sm text-green-400">
                      <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                      {friendsOnlineData.online_count} en ligne
                    </span>
                  )}
                </div>
                
                {/* Online Friends Section */}
                {friendsOnlineData.friends.filter(f => f.is_online).length > 0 && (
                  <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
                    <h3 className="text-sm font-medium text-green-400 mb-3 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                      En ligne maintenant
                    </h3>
                    <div className="flex flex-wrap gap-3">
                      {friendsOnlineData.friends.filter(f => f.is_online).map((friend) => (
                        <button
                          key={friend.id}
                          onClick={() => {
                            const fullFriend = friends.find(f => f.id === friend.id);
                            if (fullFriend) {
                              setSelectedConversation(fullFriend);
                              setActiveTab('messages');
                            }
                          }}
                          className="flex items-center gap-2 px-3 py-2 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                        >
                          <div className="relative">
                            <div className="w-8 h-8 rounded-full bg-[#0047AB]/50 flex items-center justify-center text-white text-xs font-bold overflow-hidden">
                              {friend.avatar ? (
                                <img src={friend.avatar.startsWith('http') ? friend.avatar : `${process.env.REACT_APP_BACKEND_URL}${friend.avatar}`} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <>{friend.first_name?.[0]}{friend.last_name?.[0]}</>
                              )}
                            </div>
                            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-[#0A0A0A]" />
                          </div>
                          <span className="text-sm text-white">{friend.first_name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                
                {friends.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {friends.map((friend) => {
                      const onlineInfo = friendsOnlineData.friends.find(f => f.id === friend.id);
                      const isOnline = onlineInfo?.is_online || false;
                      
                      return (
                        <div key={friend.id} className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <div className="w-12 h-12 rounded-full bg-[#0047AB]/50 flex items-center justify-center text-white font-bold overflow-hidden">
                                {friend.avatar ? (
                                  <img src={friend.avatar.startsWith('http') ? friend.avatar : `${process.env.REACT_APP_BACKEND_URL}${friend.avatar}`} alt="" className="w-full h-full object-cover" />
                                ) : (
                                  <>{friend.first_name?.[0]}{friend.last_name?.[0]}</>
                                )}
                              </div>
                              {/* Online indicator */}
                              <span className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-[#0F0F0F] ${isOnline ? 'bg-green-500' : 'bg-gray-500'}`} />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="text-white font-medium">{friend.first_name} {friend.last_name}</p>
                                {isOnline && (
                                  <span className="text-xs text-green-400">En ligne</span>
                                )}
                              </div>
                              <p className="text-sm text-gray-400">{friend.city || 'Lausanne'}</p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => { setSelectedConversation(friend); setActiveTab('messages'); }}
                              className="p-2 bg-[#0047AB]/20 text-[#0047AB] rounded-lg hover:bg-[#0047AB]/30"
                            >
                              <MessageSquare className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleRemoveFriend(friend.friendship_id)}
                              className="p-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-400">Aucun ami pour le moment</p>
                  </div>
                )}
              </div>

              {/* Suggested Friends */}
              {suggestedFriends.length > 0 && (
                <div className="card-service rounded-xl p-6">
                  <h2 className="text-lg font-semibold text-white mb-4">Suggestions d'amis</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {suggestedFriends.map((suggestion) => (
                      <div key={suggestion.id} className="p-4 bg-white/5 rounded-xl">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-12 h-12 rounded-full bg-gray-600 flex items-center justify-center text-white font-bold">
                            {suggestion.first_name?.[0]}{suggestion.last_name?.[0]}
                          </div>
                          <div>
                            <p className="text-white font-medium">{suggestion.first_name} {suggestion.last_name}</p>
                            <p className="text-sm text-gray-400">{suggestion.city || 'Lausanne'}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleSendFriendRequest(suggestion.id)}
                          className="w-full btn-secondary text-sm flex items-center justify-center gap-2"
                        >
                          <UserPlus className="w-4 h-4" />
                          Ajouter
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Demandes en cours Tab */}
          {activeTab === 'demandes' && (
            <div className="space-y-6">
              <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
                Demandes en cours
              </h1>

              {/* Demandes envoyées */}
              {friendRequests.sent.length > 0 ? (
                <div className="card-service rounded-xl p-6">
                  <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Send className="w-5 h-5 text-[#0047AB]" />
                    Demandes envoyées ({friendRequests.sent.length})
                  </h2>
                  <div className="space-y-3">
                    {friendRequests.sent.map((request) => (
                      <div key={request.id} className="p-4 bg-white/5 rounded-xl">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-[#0047AB]/30 flex items-center justify-center text-white font-bold overflow-hidden">
                              {request.recipient?.avatar ? (
                                <img 
                                  src={request.recipient.avatar.startsWith('http') ? request.recipient.avatar : `${process.env.REACT_APP_BACKEND_URL}${request.recipient.avatar}`} 
                                  alt="" 
                                  className="w-full h-full object-cover" 
                                />
                              ) : (
                                <>{request.recipient?.first_name?.[0]}{request.recipient?.last_name?.[0]}</>
                              )}
                            </div>
                            <div>
                              <p className="text-white font-medium">{request.recipient?.first_name} {request.recipient?.last_name}</p>
                              <p className="text-sm text-gray-500">{request.recipient?.city || 'Lausanne'}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded-full">
                              En attente
                            </span>
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(request.created_at).toLocaleDateString('fr-FR')}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="card-service rounded-xl p-12 text-center">
                  <Send className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">Aucune demande en cours</h3>
                  <p className="text-gray-400">Vos demandes d'ami en attente apparaîtront ici</p>
                </div>
              )}

              {/* Demandes reçues en attente */}
              {friendRequests.received.length > 0 && (
                <div className="card-service rounded-xl p-6 border-[#D4AF37]/30">
                  <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Bell className="w-5 h-5 text-[#D4AF37]" />
                    Demandes reçues ({friendRequests.received.length})
                  </h2>
                  <div className="space-y-3">
                    {friendRequests.received.map((request) => (
                      <div key={request.id} className="p-4 bg-white/5 rounded-xl">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-[#D4AF37]/30 flex items-center justify-center text-white font-bold overflow-hidden">
                              {request.sender?.avatar ? (
                                <img 
                                  src={request.sender.avatar.startsWith('http') ? request.sender.avatar : `${process.env.REACT_APP_BACKEND_URL}${request.sender.avatar}`} 
                                  alt="" 
                                  className="w-full h-full object-cover" 
                                />
                              ) : (
                                <>{request.sender?.first_name?.[0]}{request.sender?.last_name?.[0]}</>
                              )}
                            </div>
                            <div>
                              <p className="text-white font-medium">{request.sender?.first_name} {request.sender?.last_name}</p>
                              <p className="text-sm text-gray-400">{request.message || 'Souhaite vous ajouter comme ami'}</p>
                              <p className="text-xs text-gray-500 mt-1">{request.sender?.city || 'Lausanne'}</p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleRespondToRequest(request.id, true)}
                              className="p-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30"
                            >
                              <CheckCircle className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleRespondToRequest(request.id, false)}
                              className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30"
                            >
                              <XCircle className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Amis acceptés récemment */}
              {friends.length > 0 && (
                <div className="card-service rounded-xl p-6 border-green-500/30">
                  <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    Amis acceptés ({friends.length})
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {friends.slice(0, 6).map((friend) => (
                      <div key={friend.id} className="p-4 bg-white/5 rounded-xl">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-14 h-14 rounded-full bg-green-500/20 flex items-center justify-center text-white font-bold overflow-hidden">
                            {friend.avatar ? (
                              <img 
                                src={friend.avatar.startsWith('http') ? friend.avatar : `${process.env.REACT_APP_BACKEND_URL}${friend.avatar}`} 
                                alt="" 
                                className="w-full h-full object-cover" 
                              />
                            ) : (
                              <>{friend.first_name?.[0]}{friend.last_name?.[0]}</>
                            )}
                          </div>
                          <div>
                            <p className="text-white font-medium">{friend.first_name} {friend.last_name}</p>
                            <p className="text-sm text-gray-400">{friend.city || 'Lausanne'}</p>
                            {friend.since && (
                              <p className="text-xs text-green-400">Ami depuis {new Date(friend.since).toLocaleDateString('fr-FR')}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => { setSelectedConversation(friend); setActiveTab('messages'); }}
                            className="flex-1 btn-secondary text-sm flex items-center justify-center gap-2"
                          >
                            <MessageSquare className="w-4 h-4" />
                            Message
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Cards Tab - Fixed */}
          {activeTab === 'cartes' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
                  Mes Cartes de Paiement
                </h1>
                <button onClick={() => setShowAddCard(true)} className="btn-primary flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Ajouter une carte
                </button>
              </div>

              {cards.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {cards.map((card) => (
                    <div key={card.id} className={`card-service rounded-xl p-6 ${card.is_default ? 'border-[#0047AB]' : ''}`}>
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <CreditCard className={`w-8 h-8 ${card.card_type === 'visa' ? 'text-blue-500' : card.card_type === 'mastercard' ? 'text-orange-500' : 'text-gray-400'}`} />
                          <div>
                            <p className="text-white font-medium uppercase">{card.card_type}</p>
                            {card.is_default && <span className="text-xs text-[#0047AB]">Par défaut</span>}
                          </div>
                        </div>
                        <button
                          onClick={() => handleDeleteCard(card.id)}
                          className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-xl text-white font-mono mb-2">•••• •••• •••• {card.card_number_last4}</p>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">{card.card_holder}</span>
                        <span className="text-gray-400">{String(card.expiry_month).padStart(2, '0')}/{card.expiry_year}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="card-service rounded-xl p-12 text-center">
                  <CreditCard className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400 mb-4">Aucune carte enregistrée</p>
                  <button onClick={() => setShowAddCard(true)} className="btn-secondary">
                    Ajouter une carte
                  </button>
                </div>
              )}

              {/* Add Card Modal */}
              {showAddCard && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                  <div className="card-service rounded-xl p-6 w-full max-w-md">
                    <h3 className="text-lg font-semibold text-white mb-6">Ajouter une carte</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm text-gray-400 mb-2">Nom du titulaire</label>
                        <input
                          type="text"
                          value={cardForm.card_holder}
                          onChange={(e) => setCardForm({...cardForm, card_holder: e.target.value})}
                          className="input-dark w-full"
                          placeholder="JOHN DOE"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-400 mb-2">4 derniers chiffres</label>
                        <input
                          type="text"
                          maxLength={4}
                          value={cardForm.card_number_last4}
                          onChange={(e) => setCardForm({...cardForm, card_number_last4: e.target.value.replace(/\D/g, '')})}
                          className="input-dark w-full"
                          placeholder="1234"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm text-gray-400 mb-2">Mois d'expiration</label>
                          <select
                            value={cardForm.expiry_month}
                            onChange={(e) => setCardForm({...cardForm, expiry_month: parseInt(e.target.value)})}
                            className="input-dark w-full"
                          >
                            {[...Array(12)].map((_, i) => (
                              <option key={i+1} value={i+1}>{String(i+1).padStart(2, '0')}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm text-gray-400 mb-2">Année</label>
                          <select
                            value={cardForm.expiry_year}
                            onChange={(e) => setCardForm({...cardForm, expiry_year: parseInt(e.target.value)})}
                            className="input-dark w-full"
                          >
                            {[2024, 2025, 2026, 2027, 2028, 2029, 2030].map((year) => (
                              <option key={year} value={year}>{year}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm text-gray-400 mb-2">Type de carte</label>
                        <select
                          value={cardForm.card_type}
                          onChange={(e) => setCardForm({...cardForm, card_type: e.target.value})}
                          className="input-dark w-full"
                        >
                          <option value="visa">Visa</option>
                          <option value="mastercard">Mastercard</option>
                          <option value="amex">American Express</option>
                        </select>
                      </div>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={cardForm.is_default}
                          onChange={(e) => setCardForm({...cardForm, is_default: e.target.checked})}
                          className="w-4 h-4 accent-[#0047AB]"
                        />
                        <span className="text-sm text-gray-400">Définir comme carte par défaut</span>
                      </label>
                    </div>
                    <div className="flex gap-3 mt-6">
                      <button onClick={() => setShowAddCard(false)} className="btn-secondary flex-1">Annuler</button>
                      <button onClick={handleAddCard} className="btn-primary flex-1">Ajouter</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Documents Tab - Fixed */}
          {activeTab === 'documents' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
                  Mes Documents
                </h1>
                <button onClick={() => setShowAddDocument(true)} className="btn-primary flex items-center gap-2">
                  <Upload className="w-4 h-4" />
                  Ajouter un document
                </button>
              </div>

              {/* Return to Job Alert */}
              {returnToJobId && (
                <div className="bg-[#0047AB]/20 border border-[#0047AB]/50 rounded-xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#0047AB]/30 flex items-center justify-center">
                      <Briefcase className="w-5 h-5 text-[#0047AB]" />
                    </div>
                    <div>
                      <p className="text-white font-medium">Vous souhaitez postuler à une offre</p>
                      <p className="text-sm text-gray-400">Ajoutez votre CV puis retournez postuler</p>
                    </div>
                  </div>
                  <Link 
                    to={`/emploi/${returnToJobId}`}
                    className="btn-primary text-sm"
                  >
                    Voir l'offre
                  </Link>
                </div>
              )}

              {documents.length > 0 ? (
                <div className="space-y-3">
                  {documents.map((doc) => (
                    <div key={doc.id} className="card-service rounded-xl p-4 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-[#0047AB]/20 rounded-xl flex items-center justify-center">
                          <FolderOpen className="w-6 h-6 text-[#0047AB]" />
                        </div>
                        <div>
                          <p className="text-white font-medium">{doc.name}</p>
                          <p className="text-sm text-gray-500">{doc.category} • {new Date(doc.created_at).toLocaleDateString('fr-FR')}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <a
                          href={doc.url.startsWith('http') ? doc.url : `${process.env.REACT_APP_BACKEND_URL}${doc.url}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 bg-[#0047AB]/20 text-[#0047AB] rounded-lg hover:bg-[#0047AB]/30"
                        >
                          <Eye className="w-4 h-4" />
                        </a>
                        <button
                          onClick={() => handleDeleteDocument(doc.id)}
                          className="p-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                  
                  {/* After adding CV, show button to return to job */}
                  {returnToJobId && documents.some(d => d.category === 'cv') && (
                    <div className="mt-4 text-center">
                      <Link 
                        to={`/emploi/${returnToJobId}`}
                        className="btn-primary inline-flex items-center gap-2"
                      >
                        <Briefcase className="w-4 h-4" />
                        Retourner postuler à l'offre
                      </Link>
                    </div>
                  )}
                </div>
              ) : (
                <div className="card-service rounded-xl p-12 text-center">
                  <FolderOpen className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400 mb-4">Aucun document</p>
                  <button onClick={() => setShowAddDocument(true)} className="btn-secondary">
                    Ajouter un document
                  </button>
                </div>
              )}

              {/* Add Document Modal */}
              {showAddDocument && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                  <div className="card-service rounded-xl p-6 w-full max-w-md">
                    <h3 className="text-lg font-semibold text-white mb-6">Ajouter un document</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm text-gray-400 mb-2">Nom du document</label>
                        <input
                          type="text"
                          value={documentForm.name}
                          onChange={(e) => setDocumentForm({...documentForm, name: e.target.value})}
                          className="input-dark w-full"
                          placeholder="Mon document"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-400 mb-2">Catégorie</label>
                        <select
                          value={documentForm.category}
                          onChange={(e) => setDocumentForm({...documentForm, category: e.target.value})}
                          className="input-dark w-full"
                        >
                          <option value="cv">📄 CV / Curriculum Vitae</option>
                          <option value="general">Général</option>
                          <option value="factures">Factures</option>
                          <option value="contrats">Contrats</option>
                          <option value="autres">Autres</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm text-gray-400 mb-2">Fichier</label>
                        <input
                          type="file"
                          onChange={handleDocumentUpload}
                          className="w-full text-gray-400"
                          accept=".pdf,.doc,.docx"
                        />
                        {documentForm.url && (
                          <p className="text-sm text-green-400 mt-2">Fichier uploadé ✓</p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-3 mt-6">
                      <button onClick={() => { setShowAddDocument(false); setDocumentForm({ name: '', category: returnToJobId ? 'cv' : 'general', url: '' }); }} className="btn-secondary flex-1">Annuler</button>
                      <button onClick={handleAddDocument} className="btn-primary flex-1">Ajouter</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Messages Tab - Production Ready */}
          {activeTab === 'messages' && (
            <div className="h-[calc(100vh-180px)]">
              <h1 className="text-2xl font-bold text-white mb-6" style={{ fontFamily: 'Playfair Display, serif' }}>
                Messagerie
              </h1>
              
              <div className="flex gap-6 h-[calc(100%-60px)]">
                {/* Conversations List */}
                <div className="w-80 card-service rounded-xl p-4 overflow-y-auto">
                  <h3 className="text-sm font-semibold text-gray-400 mb-4">Conversations</h3>
                  {conversations.length > 0 ? (
                    <div className="space-y-2">
                      {conversations.map((conv) => (
                        <button
                          key={conv.partner?.id}
                          onClick={() => handleSelectConversation(conv.partner?.id)}
                          className={`w-full p-3 rounded-xl text-left transition-colors ${
                            selectedConversation?.id === conv.partner?.id
                              ? 'bg-[#0047AB]/20'
                              : 'bg-white/5 hover:bg-white/10'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-[#0047AB]/50 flex items-center justify-center text-white font-bold text-sm">
                              {conv.partner?.first_name?.[0]}{conv.partner?.last_name?.[0]}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <p className="text-white font-medium truncate">{conv.partner?.first_name} {conv.partner?.last_name}</p>
                                {conv.unread_count > 0 && (
                                  <span className="w-5 h-5 bg-[#0047AB] rounded-full text-xs flex items-center justify-center text-white">
                                    {conv.unread_count}
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-gray-500 truncate">{conv.last_message?.content}</p>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <MessageSquare className="w-10 h-10 text-gray-600 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">Aucune conversation</p>
                    </div>
                  )}
                  
                  {/* Start new conversation with friends */}
                  {friends.length > 0 && (
                    <div className="mt-6 pt-4 border-t border-white/10">
                      <h4 className="text-xs font-semibold text-gray-500 mb-3">Démarrer une conversation</h4>
                      {friends.slice(0, 5).map((friend) => (
                        <button
                          key={friend.id}
                          onClick={() => handleSelectConversation(friend.id)}
                          className="w-full p-2 rounded-lg text-left bg-white/5 hover:bg-white/10 mb-2 flex items-center gap-2"
                        >
                          <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center text-white text-xs font-bold">
                            {friend.first_name?.[0]}{friend.last_name?.[0]}
                          </div>
                          <span className="text-sm text-gray-300">{friend.first_name}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Chat Area */}
                <div className="flex-1 card-service rounded-xl flex flex-col">
                  {selectedConversation ? (
                    <>
                      {/* Chat Header */}
                      <div className="p-4 border-b border-white/10 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#0047AB]/50 flex items-center justify-center text-white font-bold">
                          {selectedConversation.first_name?.[0]}{selectedConversation.last_name?.[0]}
                        </div>
                        <div>
                          <p className="text-white font-medium">{selectedConversation.first_name} {selectedConversation.last_name}</p>
                          <p className="text-sm text-gray-500">{selectedConversation.user_type === 'entreprise' ? 'Entreprise' : 'Client'}</p>
                        </div>
                      </div>

                      {/* Messages */}
                      <div className="flex-1 p-4 overflow-y-auto space-y-4">
                        {messages.map((msg) => (
                          <div
                            key={msg.id}
                            className={`flex ${msg.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-xs px-4 py-2 rounded-2xl ${
                                msg.sender_id === user?.id
                                  ? 'bg-[#0047AB] text-white rounded-br-none'
                                  : 'bg-white/10 text-white rounded-bl-none'
                              }`}
                            >
                              <p>{msg.content}</p>
                              <p className={`text-xs mt-1 ${msg.sender_id === user?.id ? 'text-white/60' : 'text-gray-500'}`}>
                                {new Date(msg.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Input */}
                      <div className="p-4 border-t border-white/10">
                        <div className="flex gap-3">
                          <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                            placeholder="Écrivez votre message..."
                            className="input-dark flex-1"
                          />
                          <button
                            onClick={handleSendMessage}
                            disabled={!newMessage.trim()}
                            className="btn-primary px-4 disabled:opacity-50"
                          >
                            <Send className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="flex-1 flex items-center justify-center">
                      <div className="text-center">
                        <MessageSquare className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                        <p className="text-gray-400">Sélectionnez une conversation</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Compte Particulier (Switch) */}
          {activeTab === 'particulier' && (
            <div className="max-w-md mx-auto">
              <h1 className="text-2xl font-bold text-white mb-8 text-center" style={{ fontFamily: 'Playfair Display, serif' }}>
                Compte Particulier
              </h1>
              <div className="card-service rounded-xl p-8 text-center">
                <Building2 className="w-16 h-16 text-[#0047AB] mx-auto mb-6" />
                <h2 className="text-xl font-bold text-white mb-4">Créez votre compte particulier</h2>
                <p className="text-gray-400 mb-6">
                  Avec un compte particulier, vous pouvez proposer vos propres services sur Titelli.
                </p>
                <button 
                  onClick={() => navigate('/auth?type=entreprise')}
                  className="btn-primary w-full"
                >
                  Créer un compte particulier
                </button>
              </div>
            </div>
          )}

          {/* Orders Tab */}
          {activeTab === 'orders' && (
            <div>
              <h1 className="text-2xl font-bold text-white mb-8" style={{ fontFamily: 'Playfair Display, serif' }}>
                Mes commandes
              </h1>
              {orders.length > 0 ? (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div key={order.id} className="card-service rounded-xl p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <p className="text-white font-semibold">Commande #{order.id.slice(0, 8)}</p>
                          <p className="text-sm text-gray-400">{new Date(order.created_at).toLocaleDateString('fr-FR')}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          order.status === 'completed' ? 'bg-green-500/20 text-green-500' :
                          order.status === 'pending' ? 'bg-yellow-500/20 text-yellow-500' :
                          'bg-gray-500/20 text-gray-500'
                        }`}>
                          {order.status === 'pending' ? 'En cours' : order.status}
                        </span>
                      </div>
                      <div className="space-y-2 mb-4">
                        {order.items?.map((item, i) => (
                          <div key={i} className="flex justify-between text-sm">
                            <span className="text-gray-400">{item.name} x{item.quantity}</span>
                            <span className="text-white">{(item.price * item.quantity).toFixed(2)} CHF</span>
                          </div>
                        ))}
                      </div>
                      <div className="flex justify-between pt-4 border-t border-white/10">
                        <span className="text-gray-400">Total</span>
                        <span className="text-xl font-bold text-white">{order.total?.toFixed(2)} CHF</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="card-service rounded-xl p-12 text-center">
                  <ShoppingCart className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <h2 className="text-xl font-bold text-white mb-2">Aucune commande</h2>
                  <p className="text-gray-400 mb-6">Explorez nos prestataires et passez votre première commande</p>
                  <Link to="/" className="btn-primary">Explorer</Link>
                </div>
              )}
            </div>
          )}

          {/* Cashback Tab */}
          {activeTab === 'cashback' && (
            <div>
              <h1 className="text-2xl font-bold text-white mb-8" style={{ fontFamily: 'Playfair Display, serif' }}>
                Mon Cash-back
              </h1>
              <div className="card-service rounded-xl p-8 text-center">
                <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
                  <Wallet className="w-10 h-10 text-green-500" />
                </div>
                <p className="text-5xl font-bold text-white mb-2">{cashback.toFixed(2)} CHF</p>
                <p className="text-gray-400">Solde cash-back disponible</p>
                <div className="mt-8 pt-8 border-t border-white/10">
                  <p className="text-sm text-gray-500">
                    Gagnez du cash-back sur chaque achat chez nos prestataires partenaires !
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div>
              <h1 className="text-2xl font-bold text-white mb-8" style={{ fontFamily: 'Playfair Display, serif' }}>
                Paramètres
              </h1>
              <div className="space-y-6">
                <div className="card-service rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Notifications</h3>
                  <div className="space-y-4">
                    <label className="flex items-center justify-between">
                      <span className="text-gray-400">Notifications par email</span>
                      <input type="checkbox" defaultChecked className="toggle" />
                    </label>
                    <label className="flex items-center justify-between">
                      <span className="text-gray-400">Notifications push</span>
                      <input type="checkbox" defaultChecked className="toggle" />
                    </label>
                    <label className="flex items-center justify-between">
                      <span className="text-gray-400">Demandes d'amis</span>
                      <input type="checkbox" defaultChecked className="toggle" />
                    </label>
                    <label className="flex items-center justify-between">
                      <span className="text-gray-400">Offres promotionnelles</span>
                      <input type="checkbox" className="toggle" />
                    </label>
                  </div>
                </div>
                <div className="card-service rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Confidentialité</h3>
                  <div className="space-y-4">
                    <label className="flex items-center justify-between">
                      <span className="text-gray-400">Profil visible publiquement</span>
                      <input type="checkbox" className="toggle" />
                    </label>
                    <label className="flex items-center justify-between">
                      <span className="text-gray-400">Partager mes avis</span>
                      <input type="checkbox" defaultChecked className="toggle" />
                    </label>
                    <label className="flex items-center justify-between">
                      <span className="text-gray-400">Recevoir des suggestions d'amis</span>
                      <input type="checkbox" defaultChecked className="toggle" />
                    </label>
                  </div>
                </div>
                <div className="card-service rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-4 text-red-500">Zone de danger</h3>
                  <button className="text-red-400 hover:text-red-300 text-sm">
                    Supprimer mon compte
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Formations Tab - Production Ready */}
          {activeTab === 'formations' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
                  Mes Formations
                </h1>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="card-service rounded-xl p-4 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#0047AB]/20 flex items-center justify-center">
                    <GraduationCap className="w-6 h-6 text-[#0047AB]" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{myTrainings.stats?.total || 0}</p>
                    <p className="text-sm text-gray-400">Total formations</p>
                  </div>
                </div>
                <div className="card-service rounded-xl p-4 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-yellow-500/20 flex items-center justify-center">
                    <Clock className="w-6 h-6 text-yellow-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{myTrainings.stats?.in_progress || 0}</p>
                    <p className="text-sm text-gray-400">En cours</p>
                  </div>
                </div>
                <div className="card-service rounded-xl p-4 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-green-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{myTrainings.stats?.completed || 0}</p>
                    <p className="text-sm text-gray-400">Terminées</p>
                  </div>
                </div>
              </div>

              {/* Filter Tabs */}
              <div className="flex gap-2 border-b border-white/10 pb-2">
                {[
                  { id: 'all', label: 'Toutes' },
                  { id: 'in_progress', label: 'En cours' },
                  { id: 'completed', label: 'Terminées' }
                ].map((filter) => (
                  <button
                    key={filter.id}
                    onClick={() => setTrainingsFilter(filter.id)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      trainingsFilter === filter.id 
                        ? 'bg-[#0047AB] text-white' 
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>

              {/* Trainings List */}
              {loadingTrainings ? (
                <div className="flex justify-center py-12">
                  <div className="w-10 h-10 border-4 border-[#0047AB] border-t-transparent rounded-full animate-spin" />
                </div>
              ) : myTrainings.enrollments?.length > 0 ? (
                <div className="space-y-4">
                  {myTrainings.enrollments.map((enrollment) => (
                    <div key={enrollment.id} className="card-service rounded-xl overflow-hidden">
                      <div className="p-6">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                enrollment.training_type === 'online' 
                                  ? 'bg-purple-500/20 text-purple-400' 
                                  : 'bg-blue-500/20 text-blue-400'
                              }`}>
                                {enrollment.training_type === 'online' ? '💻 En ligne' : '🏢 Présentiel'}
                              </span>
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                enrollment.status === 'completed' 
                                  ? 'bg-green-500/20 text-green-400' 
                                  : 'bg-yellow-500/20 text-yellow-400'
                              }`}>
                                {enrollment.status === 'completed' ? 'Terminée' : 'En cours'}
                              </span>
                            </div>
                            <h3 className="text-lg font-semibold text-white mb-1">{enrollment.training_title}</h3>
                            <p className="text-sm text-[#D4AF37]">{enrollment.enterprise_name}</p>
                            
                            {/* Training Details */}
                            <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-400">
                              <span>💰 {enrollment.price_paid} CHF</span>
                              {enrollment.start_date && (
                                <span>📅 {new Date(enrollment.start_date).toLocaleDateString('fr-FR')}</span>
                              )}
                              <span>📆 Inscrit le {new Date(enrollment.enrolled_at).toLocaleDateString('fr-FR')}</span>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex flex-col gap-2">
                            {enrollment.status === 'in_progress' && (
                              <button
                                onClick={() => handleMarkTrainingComplete(enrollment.id)}
                                className="px-4 py-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 text-sm flex items-center gap-2"
                              >
                                <CheckCircle className="w-4 h-4" />
                                Terminer
                              </button>
                            )}
                            {enrollment.status === 'completed' && !enrollment.has_reviewed && (
                              <button
                                onClick={() => {
                                  setReviewingTraining(enrollment);
                                  setShowReviewModal(true);
                                }}
                                className="px-4 py-2 bg-yellow-500/20 text-yellow-400 rounded-lg hover:bg-yellow-500/30 text-sm flex items-center gap-2"
                              >
                                <Star className="w-4 h-4" />
                                Donner un avis
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Downloadable Files for Online Trainings */}
                        {enrollment.training_type === 'online' && enrollment.downloadable_files?.length > 0 && (
                          <div className="mt-4 pt-4 border-t border-white/10">
                            <p className="text-sm text-gray-400 mb-3">📂 Fichiers téléchargeables :</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              {enrollment.downloadable_files.map((file, idx) => (
                                <a
                                  key={idx}
                                  href={file.url?.startsWith('http') ? file.url : `${process.env.REACT_APP_BACKEND_URL}${file.url}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-3 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                                >
                                  <span className="text-xl">
                                    {file.type?.includes('video') ? '🎬' : file.type?.includes('pdf') ? '📄' : file.type?.includes('image') ? '🖼️' : '📁'}
                                  </span>
                                  <span className="text-white text-sm truncate flex-1">{file.name}</span>
                                  <Eye className="w-4 h-4 text-gray-400" />
                                </a>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Progress Bar */}
                        {enrollment.status === 'in_progress' && (
                          <div className="mt-4">
                            <div className="flex justify-between text-xs text-gray-400 mb-1">
                              <span>Progression</span>
                              <span>{enrollment.progress || 0}%</span>
                            </div>
                            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-[#0047AB] transition-all duration-500"
                                style={{ width: `${enrollment.progress || 0}%` }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="card-service rounded-xl p-12 text-center">
                  <GraduationCap className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <h2 className="text-xl font-bold text-white mb-2">Aucune formation</h2>
                  <p className="text-gray-400 mb-6">
                    {trainingsFilter === 'all' 
                      ? "Vous n'êtes inscrit à aucune formation" 
                      : trainingsFilter === 'in_progress' 
                        ? "Aucune formation en cours" 
                        : "Aucune formation terminée"}
                  </p>
                  <Link to="/" className="btn-primary">
                    Découvrir les formations
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* Default placeholder for other tabs */}
          {!['overview', 'profile', 'contacts', 'cartes', 'documents', 'messages', 'particulier', 'orders', 'cashback', 'settings', 'formations'].includes(activeTab) && (
            <div className="card-service rounded-xl p-12 text-center">
              <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-gray-500" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Section en cours de développement</h2>
              <p className="text-gray-400">Cette fonctionnalité sera bientôt disponible.</p>
            </div>
          )}
        </main>
      </div>

      {/* Training Review Modal */}
      {showReviewModal && reviewingTraining && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0F0F0F] rounded-2xl p-6 w-full max-w-md border border-white/10">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Votre avis</h2>
              <button onClick={() => setShowReviewModal(false)} className="text-gray-400 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-400 text-sm mb-2">Formation</p>
              <p className="text-white font-medium">{reviewingTraining.training_title}</p>
              <p className="text-sm text-[#D4AF37]">{reviewingTraining.enterprise_name}</p>
            </div>
            
            {/* Star Rating */}
            <div className="mb-6">
              <p className="text-gray-400 text-sm mb-3">Note</p>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setReviewForm({...reviewForm, rating: star})}
                    className="transition-transform hover:scale-110"
                  >
                    <Star 
                      className={`w-8 h-8 ${star <= reviewForm.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'}`} 
                    />
                  </button>
                ))}
              </div>
            </div>
            
            {/* Comment */}
            <div className="mb-6">
              <label className="block text-gray-400 text-sm mb-2">Commentaire (optionnel)</label>
              <textarea
                value={reviewForm.comment}
                onChange={(e) => setReviewForm({...reviewForm, comment: e.target.value})}
                placeholder="Partagez votre expérience..."
                className="input-dark w-full h-24 resize-none"
              />
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowReviewModal(false)}
                className="flex-1 py-3 border border-white/20 rounded-xl text-white hover:bg-white/5"
              >
                Annuler
              </button>
              <button
                onClick={handleSubmitReview}
                disabled={submittingReview}
                className="flex-1 py-3 bg-[#0047AB] text-white rounded-xl hover:bg-[#0047AB]/80 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {submittingReview ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Envoi...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Envoyer
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientDashboard;
