import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { notificationsAPI } from '../services/api';
import { Search, Menu, X, ShoppingCart, Heart, Bell, ChevronDown, Check, CheckCheck, Trash2, Wifi, WifiOff, Image, Video, Sparkles } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import { toast } from 'sonner';
import NotificationCenter from './NotificationCenter';
import { useNotificationWebSocket } from '../hooks/useWebSocket';

const Header = () => {
  const { user, logout, isAuthenticated, isEnterprise } = useAuth();
  const { getItemCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifLoading, setNotifLoading] = useState(false);

  const cartCount = getItemCount();

  // Use WebSocket for real-time notifications
  const {
    isConnected: wsConnected,
    unreadCount: wsUnreadCount,
    notifications: wsNotifications,
    markRead: wsMarkRead,
    markAllRead: wsMarkAllRead,
    fetchNotifications: wsFetchNotifications,
    reconnect: wsReconnect
  } = useNotificationWebSocket();

  // State for notifications (fallback to API if WS not connected)
  const [apiNotifications, setApiNotifications] = useState([]);
  const [apiUnreadCount, setApiUnreadCount] = useState(0);

  // Use WebSocket data if connected, otherwise use API data
  const notifications = wsConnected ? wsNotifications : apiNotifications;
  const unreadCount = wsConnected ? wsUnreadCount : apiUnreadCount;

  // Fetch notifications via API (fallback)
  const fetchNotificationsAPI = useCallback(async () => {
    if (!isAuthenticated || wsConnected) return;
    try {
      setNotifLoading(true);
      const response = await notificationsAPI.list();
      setApiNotifications(response.data.notifications || []);
      setApiUnreadCount(response.data.unread_count || 0);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setNotifLoading(false);
    }
  }, [isAuthenticated, wsConnected]);

  useEffect(() => {
    // Only poll if WebSocket is not connected
    if (!wsConnected) {
      fetchNotificationsAPI();
      const interval = setInterval(fetchNotificationsAPI, 30000);
      return () => clearInterval(interval);
    }
  }, [fetchNotificationsAPI, wsConnected]);

  const handleMarkRead = async (notifId) => {
    if (wsConnected) {
      wsMarkRead(notifId);
    } else {
      try {
        await notificationsAPI.markRead(notifId);
        setApiNotifications(apiNotifications.map(n => 
          n.id === notifId ? { ...n, is_read: true } : n
        ));
        setApiUnreadCount(Math.max(0, apiUnreadCount - 1));
      } catch (error) {
        console.error('Error marking notification as read:', error);
      }
    }
  };

  const handleMarkAllRead = async () => {
    if (wsConnected) {
      wsMarkAllRead();
      toast.success('Toutes les notifications lues');
    } else {
      try {
        await notificationsAPI.markAllRead();
        setApiNotifications(apiNotifications.map(n => ({ ...n, is_read: true })));
        setApiUnreadCount(0);
        toast.success('Toutes les notifications lues');
      } catch (error) {
        toast.error('Erreur');
      }
    }
  };

  // Handle refresh - use WebSocket if connected, otherwise API
  const handleRefresh = () => {
    if (wsConnected) {
      wsFetchNotifications(50);
    } else {
      fetchNotificationsAPI();
    }
  };

  const handleNotificationClick = (notif) => {
    if (!notif.is_read) {
      handleMarkRead(notif.id);
    }
    if (notif.link) {
      navigate(notif.link);
      setNotifOpen(false);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'order': return '🛒';
      case 'alert': return '⚠️';
      case 'promotion': return '🎁';
      default: return '📬';
    }
  };

  const formatTime = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = (now - date) / 1000;
    
    if (diff < 60) return 'À l\'instant';
    if (diff < 3600) return `Il y a ${Math.floor(diff / 60)} min`;
    if (diff < 86400) return `Il y a ${Math.floor(diff / 3600)} h`;
    return date.toLocaleDateString('fr-FR');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const navLinks = [
    { path: '/services', label: 'Services' },
    { path: '/products', label: 'Produits', className: 'gold' },
    { path: '/entreprises', label: 'Entreprises' },
    { path: '/rdv', label: 'Rdv', className: 'rdv' },
    { path: '/sports', label: 'Sports', className: 'sports' },
  ];

  const pubIALinks = [
    { path: '/media-pub', label: 'Images IA', icon: Image, description: 'Créer des publicités images' },
    { path: '/video-pub', label: 'Vidéos IA', icon: Video, description: 'Créer des vidéos publicitaires' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-heavy" data-testid="main-header">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo statique Titelli */}
          <Link to="/" className="flex items-center gap-2" data-testid="logo-link">
            <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 border border-[#0047AB]/30 bg-black flex items-center justify-center">
              <img 
                src="/logo_titelli.png" 
                alt="Titelli"
                className="w-8 h-8 object-contain"
              />
            </div>
            <span className="font-semibold text-lg hidden sm:block" style={{ fontFamily: 'Playfair Display, serif' }}>
              Titelli
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`nav-link text-sm font-medium ${link.className || ''} ${isActive(link.path) ? 'active' : ''}`}
                data-testid={`nav-${link.label.toLowerCase()}`}
              >
                {link.label}
              </Link>
            ))}
            
            {/* Pub IA Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger className="nav-link media-pub text-sm font-medium flex items-center gap-1 outline-none">
                <Sparkles className="w-4 h-4" />
                Pub IA
                <ChevronDown className="w-3 h-3" />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-gray-900 border border-white/10 rounded-xl p-2 min-w-[200px]">
                {pubIALinks.map((link) => (
                  <DropdownMenuItem key={link.path} asChild>
                    <Link
                      to={link.path}
                      className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        link.path === '/video-pub' ? 'bg-purple-500/20' : 'bg-amber-500/20'
                      }`}>
                        <link.icon className={`w-4 h-4 ${
                          link.path === '/video-pub' ? 'text-purple-400' : 'text-amber-400'
                        }`} />
                      </div>
                      <div>
                        <p className="text-white text-sm font-medium">{link.label}</p>
                        <p className="text-gray-400 text-xs">{link.description}</p>
                      </div>
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="hidden md:flex items-center flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher des produits et services"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-full text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-[#0047AB]/50"
                data-testid="search-input"
              />
            </div>
          </form>

          {/* Right Actions */}
          <div className="flex items-center gap-2 md:gap-4">
            {/* Icons */}
            <button className="p-2 text-gray-400 hover:text-white transition-colors hidden sm:block" data-testid="wishlist-btn">
              <Heart className="w-5 h-5" />
            </button>

            {/* Notifications */}
            {isAuthenticated && (
              <>
                <button 
                  onClick={() => setNotifOpen(true)}
                  className="p-2 text-gray-400 hover:text-white transition-colors relative" 
                  data-testid="notifications-btn"
                  title={wsConnected ? 'Connecté en temps réel' : 'Mode polling'}
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[20px] h-5 bg-[#0047AB] text-white text-xs font-bold rounded-full flex items-center justify-center px-1 animate-pulse">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                  {/* WebSocket connection indicator */}
                  <span className={`absolute -bottom-1 -right-1 w-2 h-2 rounded-full ${wsConnected ? 'bg-green-500' : 'bg-gray-500'}`} title={wsConnected ? 'Temps réel actif' : 'Temps réel inactif'} />
                </button>
                <NotificationCenter
                  isOpen={notifOpen}
                  onClose={() => setNotifOpen(false)}
                  notifications={notifications}
                  onRefresh={handleRefresh}
                  loading={notifLoading}
                  userType={isEnterprise ? 'entreprise' : 'client'}
                  isRealTime={wsConnected}
                />
              </>
            )}

            <Link to="/cart" className="p-2 text-gray-400 hover:text-white transition-colors relative" data-testid="cart-btn">
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#D4AF37] text-black text-xs font-bold rounded-full flex items-center justify-center">
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
            </Link>

            {/* User Menu */}
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 p-2 text-gray-400 hover:text-white transition-colors" data-testid="user-menu-btn">
                    <div className="w-8 h-8 rounded-full bg-[#0047AB] flex items-center justify-center text-white text-sm font-medium">
                      {user?.first_name?.[0]}{user?.last_name?.[0]}
                    </div>
                    <ChevronDown className="w-4 h-4 hidden sm:block" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-[#0F0F0F] border-white/10">
                  <div className="px-3 py-2 border-b border-white/10">
                    <p className="text-sm font-medium text-white">{user?.first_name} {user?.last_name}</p>
                    <p className="text-xs text-gray-400">{user?.email}</p>
                  </div>
                  <DropdownMenuItem asChild>
                    <Link to={isEnterprise ? '/dashboard/entreprise' : '/dashboard/client'} className="cursor-pointer">
                      Mon Dashboard
                    </Link>
                  </DropdownMenuItem>
                  {isEnterprise && (
                    <DropdownMenuItem asChild>
                      <Link to="/dashboard/entreprise/profile" className="cursor-pointer">
                        Mon Profil Entreprise
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem asChild>
                    <Link to="/orders" className="cursor-pointer">
                      Mes Commandes
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-white/10" />
                  <DropdownMenuItem onClick={logout} className="text-red-400 cursor-pointer" data-testid="logout-btn">
                    Déconnexion
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link 
                to="/auth" 
                className="btn-primary text-sm py-2 px-4 md:px-6"
                data-testid="login-btn"
              >
                Connexion
              </Link>
            )}

            {/* Mobile Menu Toggle */}
            <button 
              className="lg:hidden p-2 text-gray-400"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              data-testid="mobile-menu-btn"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-white/10">
            <form onSubmit={handleSearch} className="mb-4">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder:text-gray-500 focus:outline-none"
                />
              </div>
            </form>
            <nav className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors ${link.className || ''} ${
                    isActive(link.path) ? 'bg-white/10 text-white' : `${link.className ? '' : 'text-gray-400'} hover:bg-white/5 hover:text-white`
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
