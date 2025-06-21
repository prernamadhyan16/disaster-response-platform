import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { SOCKET_URL } from '../constants';
const MOCK_UPDATES = [
  { type: 'Disaster', content: '  Flood reported in City Center.', timestamp: Date.now() },
  { type: 'Social Media', content: '  Trending hashtag #CityFlood.', timestamp: Date.now() },
  { type: 'Resources', content: '  New shelter opened at Main School.', timestamp: Date.now() },
  { type: 'Disaster', content: '  Earthquake detected in North District.', timestamp: Date.now() },
  { type: 'Social Media', content: '  #HelpNorth trending on Twitter.', timestamp: Date.now() },
  { type: 'Resources', content: '  Medical camp set up at Riverside.', timestamp: Date.now() },
  { type: 'Disaster', content: '  Wildfire spreading near Forest Park.', timestamp: Date.now() },
  { type: 'Social Media', content: '  Volunteers needed at Main School.', timestamp: Date.now() },
  { type: 'Resources', content: '  Food supplies delivered to City Center.', timestamp: Date.now() },
  { type: 'Disaster', content: '  Heavy rainfall warning issued.', timestamp: Date.now() },
  { type: 'Social Media', content: '  #StaySafe posts increasing.', timestamp: Date.now() },
  { type: 'Resources', content: '  Evacuation buses dispatched.', timestamp: Date.now() },
];
export const useSocket = () => {
  const [connected, setConnected] = useState(false);
  const [updates, setUpdates] = useState([]);
<<<<<<< HEAD
  const [connectionError, setConnectionError] = useState(null);

=======
>>>>>>> e8f9f6ea2b74831771aa3e30bf813b394172f4cd
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
<<<<<<< HEAD

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

=======
    socket.on('disconnect', () => {
      setConnected(false);
    });
>>>>>>> e8f9f6ea2b74831771aa3e30bf813b394172f4cd
    return () => {
      socket.disconnect();
    };
  }, []);
<<<<<<< HEAD

  return { connected, updates, connectionError };
}; 
=======
  useEffect(() => {
    if (!connected) return;
    let idx = 0;
    const interval = setInterval(() => {
      setUpdates(prev => [
        {
          ...MOCK_UPDATES[idx % MOCK_UPDATES.length],
          timestamp: Date.now(),
        },
        ...prev,
      ].slice(0, 4));
      idx++;
    }, 3000);
    return () => clearInterval(interval);
  }, [connected]);
  return { connected, updates };
};
>>>>>>> e8f9f6ea2b74831771aa3e30bf813b394172f4cd
