import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { SOCKET_URL } from '../constants';

export const useSocket = () => {
  const [connected, setConnected] = useState(false);
  const [updates, setUpdates] = useState([]);
  const [connectionError, setConnectionError] = useState(null);

  useEffect(() => {
    const socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      timeout: 20000,
      forceNew: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000
    });
    socket.on('connect', () => {
      console.log('WebSocket connected successfully');
      setConnected(true);
      setConnectionError(null);
    });

    socket.on('disconnect', (reason) => {
      console.log('WebSocket disconnected:', reason);
      setConnected(false);
    });

    socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      setConnectionError(error.message);
      setConnected(false);
    });

    socket.on('reconnect', (attemptNumber) => {
      console.log('WebSocket reconnected after', attemptNumber, 'attempts');
      setConnected(true);
      setConnectionError(null);
    });

    socket.on('reconnect_error', (error) => {
      console.error('WebSocket reconnection error:', error);
      setConnectionError(error.message);
    });

    socket.on('update', (update) => {
      setUpdates(prev => [update, ...prev.slice(0, 19)]);
    });

    // Optionally, fetch initial updates from backend if needed
    // socket.emit('get-initial-updates');

    return () => {
      socket.disconnect();
    };
  }, []);

  return { connected, updates, connectionError };
};
