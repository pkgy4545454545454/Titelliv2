import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { notificationsAPI } from '../services/api';
import { Search, Menu, X, ShoppingCart, Heart, Bell, ChevronDown, Check, CheckCheck, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import { toast } from 'sonner';
import NotificationCenter from './NotificationCenter';

const Header = () => {
  const { user, logout, isAuthenticated, isEnterprise } = useAuth();
  const { getItemCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifLoading, setNotifLoading] = useState(false);

  const cartCount = getItemCount();

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      setNotifLoading(true);
      const response = await notificationsAPI.list();
      setNotifications(response.data.notifications || []);
      setUnreadCount(response.data.unread_count || 0);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setNotifLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchNotifications();
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const handleMarkRead = async (notifId) => {
    try {
      await notificationsAPI.markRead(notifId);
      setNotifications(notifications.map(n => 
        n.id === notifId ? { ...n, is_read: true } : n
      ));
      setUnreadCount(Math.max(0, unreadCount - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationsAPI.markAllRead();
      setNotifications(notifications.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
      toast.success('Toutes les notifications lues');
    } catch (error) {
      toast.error('Erreur');
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
    { path: '/', label: 'Accueil' },
    { path: '/services', label: 'Services' },
    { path: '/products', label: 'Produits' },
    { path: '/entreprises', label: 'Entreprises' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-heavy" data-testid="main-header">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3" data-testid="logo-link">
            <div className="logo-circle">T</div>
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
                className={`nav-link text-sm font-medium ${isActive(link.path) ? 'active' : ''}`}
                data-testid={`nav-${link.label.toLowerCase()}`}
              >
                {link.label}
              </Link>
            ))}
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
              <DropdownMenu open={notifOpen} onOpenChange={setNotifOpen}>
                <DropdownMenuTrigger asChild>
                  <button className="p-2 text-gray-400 hover:text-white transition-colors relative" data-testid="notifications-btn">
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80 bg-[#0F0F0F] border-white/10 max-h-96 overflow-y-auto">
                  <div className="px-3 py-2 border-b border-white/10 flex items-center justify-between">
                    <p className="text-sm font-medium text-white">Notifications</p>
                    {unreadCount > 0 && (
                      <button onClick={handleMarkAllRead} className="text-xs text-[#0047AB] hover:underline flex items-center gap-1">
                        <CheckCheck className="w-3 h-3" /> Tout lire
                      </button>
                    )}
                  </div>
                  {notifications.length > 0 ? (
                    <>
                      {notifications.slice(0, 10).map((notif) => (
                        <div
                          key={notif.id}
                          onClick={() => handleNotificationClick(notif)}
                          className={`px-3 py-3 border-b border-white/5 cursor-pointer hover:bg-white/5 transition-colors ${!notif.is_read ? 'bg-[#0047AB]/10' : ''}`}
                        >
                          <div className="flex items-start gap-3">
                            <span className="text-lg">{getNotificationIcon(notif.notification_type)}</span>
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm ${!notif.is_read ? 'text-white font-medium' : 'text-gray-300'}`}>
                                {notif.title}
                              </p>
                              <p className="text-xs text-gray-400 line-clamp-2 mt-0.5">{notif.message}</p>
                              <p className="text-xs text-gray-500 mt-1">{formatTime(notif.created_at)}</p>
                            </div>
                            {!notif.is_read && (
                              <div className="w-2 h-2 bg-[#0047AB] rounded-full flex-shrink-0 mt-1"></div>
                            )}
                          </div>
                        </div>
                      ))}
                    </>
                  ) : (
                    <div className="px-3 py-8 text-center">
                      <Bell className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                      <p className="text-sm text-gray-400">Aucune notification</p>
                    </div>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
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
                  className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    isActive(link.path) ? 'bg-white/10 text-white' : 'text-gray-400 hover:bg-white/5 hover:text-white'
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
