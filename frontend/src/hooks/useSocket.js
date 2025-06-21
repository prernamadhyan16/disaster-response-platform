import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { SOCKET_URL } from '../constants';

export const useSocket = () => {
  const [connected, setConnected] = useState(false);
  const [updates, setUpdates] = useState([]);

  useEffect(() => {
    const socket = io(SOCKET_URL, {
      transports: ['websocket'],
      autoConnect: true,
    });

    socket.on('connect', () => {
      setConnected(true);
    });

    socket.on('disconnect', () => {
      setConnected(false);
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

  return { connected, updates };
}; 