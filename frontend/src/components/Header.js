import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { notificationsAPI } from '../services/api';
import { Search, Menu, X, ShoppingBag, Heart, Bell, ChevronDown, Check, CheckCheck, Trash2, Wifi, WifiOff, Image, Video, Sparkles, User, HandCoins } from 'lucide-react';
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
    if (!wsConnected) {
      fetchNotificationsAPI();
      const interval = setInterval(fetchNotificationsAPI, 30000);
      return () => clearInterval(interval);
    }
  }, [fetchNotificationsAPI, wsConnected]);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

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
      setMobileMenuOpen(false);
    }
  };

  const navLinks = [
    { path: '/services', label: 'Services' },
    { path: '/products', label: 'Produits', className: 'text-amber-400' },
    { path: '/entreprises', label: 'Entreprises' },
    { path: '/rdv', label: 'Rdv', className: 'text-red-400' },
    { path: '/sports', label: 'Sports', className: 'text-green-400' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black" data-testid="main-header">
      <div className="max-w-7xl mx-auto px-4">
        {/* Main Header Bar */}
        <div className="flex items-center justify-between h-14 lg:h-16">
          
          {/* Left: Hamburger (mobile) + Navigation (desktop) */}
          <div className="flex items-center gap-6">
            {/* Mobile hamburger */}
            <button 
              className="lg:hidden p-1.5 text-white"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              data-testid="mobile-menu-btn"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-6">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`text-sm font-medium transition-colors ${
                    isActive(link.path) 
                      ? 'text-white' 
                      : link.className || 'text-gray-400 hover:text-white'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              
              {/* Pub IA Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger className="text-sm font-medium text-purple-400 flex items-center gap-1 outline-none">
                  <Sparkles className="w-3.5 h-3.5" />
                  Pub IA
                  <ChevronDown className="w-3 h-3" />
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-gray-900 border border-white/10 rounded-xl p-2">
                  <DropdownMenuItem asChild>
                    <Link to="/media-pub" className="flex items-center gap-2 text-amber-400 cursor-pointer">
                      <Image className="w-4 h-4" />
                      Images IA
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/video-pub" className="flex items-center gap-2 text-purple-400 cursor-pointer">
                      <Video className="w-4 h-4" />
                      Vidéos IA
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </nav>
          </div>

          {/* Right: Actions + Logo */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Cashback */}
            <Link to="/cashback" className="p-2 text-amber-400 hover:text-amber-300 hidden sm:block" data-testid="cashback-link">
              <HandCoins className="w-5 h-5" />
            </Link>

            {/* Wishlist */}
            <Link to="/wishlist" className="p-2 text-gray-400 hover:text-white hidden sm:block">
              <Heart className="w-5 h-5" />
            </Link>

            {/* Cart */}
            <Link to="/cart" className="p-2 text-gray-400 hover:text-white relative">
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Auth Button / User Menu */}
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger className="p-2 text-gray-400 hover:text-white outline-none">
                  <User className="w-5 h-5" />
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-gray-900 border border-white/10 rounded-xl p-2 min-w-[180px]">
                  <div className="px-3 py-2 text-sm text-white border-b border-white/10 mb-2">
                    {user?.first_name || 'Mon compte'}
                  </div>
                  <DropdownMenuItem asChild>
                    <Link to={isEnterprise ? '/dashboard/entreprise' : '/dashboard/client'} className="cursor-pointer">
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/orders" className="cursor-pointer">
                      Mes Commandes
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-white/10" />
                  <DropdownMenuItem onClick={logout} className="text-red-400 cursor-pointer">
                    Déconnexion
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link 
                to="/auth" 
                className="bg-white text-black text-xs sm:text-sm font-medium py-1.5 px-3 sm:px-4 rounded-full hover:bg-gray-200 transition-colors"
                data-testid="login-btn"
              >
                Connexion
              </Link>
            )}

            {/* Logo */}
            <Link to="/" className="ml-1 sm:ml-2" data-testid="logo-link">
              <img 
                src="/logo_titelli.png" 
                alt="Titelli"
                className="w-8 h-8 sm:w-9 sm:h-9 object-contain"
              />
            </Link>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-white/10 py-4">
            {/* Search */}
            <form onSubmit={handleSearch} className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  placeholder="Rechercher..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-white/20"
                />
              </div>
            </form>

            {/* Navigation Links */}
            <nav className="space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`block py-3 px-4 rounded-lg text-center text-sm font-medium transition-colors ${
                    isActive(link.path) 
                      ? 'bg-white/10 text-white' 
                      : link.className || 'text-gray-300 hover:bg-white/5'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              
              {/* Pub IA Links */}
              <div className="pt-2 border-t border-white/10 mt-2">
                <Link
                  to="/media-pub"
                  className="block py-3 px-4 rounded-lg text-center text-sm font-medium text-amber-400 hover:bg-white/5"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Pub IA - Images
                </Link>
                <Link
                  to="/video-pub"
                  className="block py-3 px-4 rounded-lg text-center text-sm font-medium text-purple-400 hover:bg-white/5"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Pub IA - Vidéos
                </Link>
              </div>

              {/* Wishlist mobile */}
              <div className="pt-2 border-t border-white/10 mt-2">
                <Link
                  to="/cashback"
                  className="block py-3 px-4 rounded-lg text-center text-sm font-medium text-amber-400 hover:bg-white/5"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Cashback
                </Link>
                <Link
                  to="/wishlist"
                  className="block py-3 px-4 rounded-lg text-center text-sm font-medium text-gray-300 hover:bg-white/5"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Mes Favoris
                </Link>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
