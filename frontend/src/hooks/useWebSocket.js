import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';

/**
 * Hook pour gérer la connexion WebSocket des notifications en temps réel.
 * 
 * Fonctionnalités:
 * - Connexion automatique à l'authentification
 * - Reconnexion automatique en cas de déconnexion
 * - Heartbeat pour maintenir la connexion
 * - Mise à jour temps réel des notifications
 */
export const useNotificationWebSocket = () => {
  const { user, isAuthenticated } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;
  const baseReconnectDelay = 1000;

  // Construire l'URL WebSocket
  const getWebSocketUrl = useCallback(() => {
    const token = localStorage.getItem('titelli_token');
    if (!token) return null;

    // Convertir l'URL HTTP en WS
    const backendUrl = process.env.REACT_APP_BACKEND_URL || '';
    const wsProtocol = backendUrl.startsWith('https') ? 'wss' : 'ws';
    const wsHost = backendUrl.replace(/^https?:\/\//, '');
    
    return `${wsProtocol}://${wsHost}/ws/notifications?token=${token}`;
  }, []);

  // Gestionnaire de messages WebSocket
  const handleMessage = useCallback((event) => {
    try {
      const data = JSON.parse(event.data);
      
      if (data.type === 'ping') {
        // Répondre au ping du serveur
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({ type: 'pong' }));
        }
        return;
      }
      
      if (data.type === 'notification') {
        if (data.action === 'new') {
          // Nouvelle notification reçue
          const notif = data.notification;
          setNotifications(prev => [notif, ...prev]);
          setUnreadCount(prev => prev + 1);
          
          // Afficher un toast pour la nouvelle notification
          toast(notif.title, {
            description: notif.message,
            duration: 5000,
            action: notif.link ? {
              label: 'Voir',
              onClick: () => window.location.href = notif.link
            } : undefined
          });
          
          // Jouer un son de notification (optionnel)
          playNotificationSound();
        } else if (data.action === 'count_update') {
          setUnreadCount(data.unread_count);
        } else if (data.action === 'list') {
          setNotifications(data.notifications || []);
        }
      }
      
    } catch (error) {
      console.error('Error parsing WebSocket message:', error);
    }
  }, []);

  // Jouer un son de notification
  const playNotificationSound = () => {
    try {
      // Créer un son de notification simple avec Web Audio API
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      gainNode.gain.value = 0.1;
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.1);
    } catch (e) {
      // Ignorer si l'audio n'est pas disponible
    }
  };

  // Connecter au WebSocket
  const connect = useCallback(() => {
    const url = getWebSocketUrl();
    if (!url || !isAuthenticated) return;

    // Fermer la connexion existante si elle existe
    if (wsRef.current) {
      wsRef.current.close();
    }

    console.log('Connecting to WebSocket...');
    const ws = new WebSocket(url);

    ws.onopen = () => {
      console.log('WebSocket connected');
      setIsConnected(true);
      reconnectAttempts.current = 0;
    };

    ws.onmessage = handleMessage;

    ws.onclose = (event) => {
      console.log('WebSocket closed:', event.code, event.reason);
      setIsConnected(false);
      
      // Reconnexion automatique si ce n'est pas une fermeture volontaire
      if (event.code !== 1000 && isAuthenticated) {
        scheduleReconnect();
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setIsConnected(false);
    };

    wsRef.current = ws;
  }, [getWebSocketUrl, isAuthenticated, handleMessage]);

  // Planifier une reconnexion avec backoff exponentiel
  const scheduleReconnect = useCallback(() => {
    if (reconnectAttempts.current >= maxReconnectAttempts) {
      console.log('Max reconnection attempts reached');
      return;
    }

    const delay = baseReconnectDelay * Math.pow(2, reconnectAttempts.current);
    console.log(`Scheduling reconnection in ${delay}ms...`);
    
    reconnectTimeoutRef.current = setTimeout(() => {
      reconnectAttempts.current++;
      connect();
    }, delay);
  }, [connect]);

  // Déconnecter
  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    if (wsRef.current) {
      wsRef.current.close(1000, 'User disconnected');
      wsRef.current = null;
    }
    setIsConnected(false);
  }, []);

  // Envoyer un message au serveur
  const sendMessage = useCallback((message) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    }
  }, []);

  // Marquer une notification comme lue via WebSocket
  const markRead = useCallback((notificationId) => {
    sendMessage({ type: 'mark_read', notification_id: notificationId });
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
    );
  }, [sendMessage]);

  // Marquer toutes comme lues via WebSocket
  const markAllRead = useCallback(() => {
    sendMessage({ type: 'mark_all_read' });
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    setUnreadCount(0);
  }, [sendMessage]);

  // Demander la liste des notifications
  const fetchNotifications = useCallback((limit = 20) => {
    sendMessage({ type: 'get_notifications', limit });
  }, [sendMessage]);

  // Effet pour connecter/déconnecter automatiquement
  useEffect(() => {
    if (isAuthenticated && user) {
      connect();
    } else {
      disconnect();
    }

    return () => {
      disconnect();
    };
  }, [isAuthenticated, user, connect, disconnect]);

  // Effet pour nettoyer lors du démontage
  useEffect(() => {
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, []);

  return {
    isConnected,
    unreadCount,
    notifications,
    markRead,
    markAllRead,
    fetchNotifications,
    reconnect: connect
  };
};

/**
 * Hook pour le statut de présence des amis en temps réel.
 */
export const usePresenceWebSocket = () => {
  const { isAuthenticated } = useAuth();
  const [onlineFriends, setOnlineFriends] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef(null);

  const getWebSocketUrl = useCallback(() => {
    const token = localStorage.getItem('titelli_token');
    if (!token) return null;

    const backendUrl = process.env.REACT_APP_BACKEND_URL || '';
    const wsProtocol = backendUrl.startsWith('https') ? 'wss' : 'ws';
    const wsHost = backendUrl.replace(/^https?:\/\//, '');
    
    return `${wsProtocol}://${wsHost}/ws/presence?token=${token}`;
  }, []);

  const connect = useCallback(() => {
    const url = getWebSocketUrl();
    if (!url || !isAuthenticated) return;

    if (wsRef.current) {
      wsRef.current.close();
    }

    const ws = new WebSocket(url);

    ws.onopen = () => {
      setIsConnected(true);
      // Demander la liste des amis en ligne
      ws.send(JSON.stringify({ type: 'get_online_friends' }));
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.type === 'ping') {
          ws.send(JSON.stringify({ type: 'pong' }));
          return;
        }
        
        if (data.type === 'presence') {
          if (data.action === 'online') {
            setOnlineFriends(prev => {
              if (!prev.find(f => f.id === data.user_id)) {
                return [...prev, { id: data.user_id, name: data.user_name }];
              }
              return prev;
            });
          } else if (data.action === 'offline') {
            setOnlineFriends(prev => prev.filter(f => f.id !== data.user_id));
          } else if (data.action === 'online_friends') {
            setOnlineFriends(data.friends || []);
          }
        }
      } catch (error) {
        console.error('Presence WebSocket error:', error);
      }
    };

    ws.onclose = () => {
      setIsConnected(false);
    };

    wsRef.current = ws;
  }, [getWebSocketUrl, isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      connect();
    }

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [isAuthenticated, connect]);

  return {
    isConnected,
    onlineFriends
  };
};

export default useNotificationWebSocket;
