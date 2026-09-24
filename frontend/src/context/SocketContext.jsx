import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext({
  socket: null,
  isConnected: false,
  lastAlert: null,
  activeClientsCount: 0,
});

export function SocketProvider({ children }) {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastAlert, setLastAlert] = useState(null);
  const [activeClientsCount, setActiveClientsCount] = useState(0);

  useEffect(() => {
    // Determine backend host from current window or API base URL
    const backendUrl = import.meta.env.VITE_API_URL
      ? import.meta.env.VITE_API_URL.replace(/\/api\/v1\/?$/, '')
      : window.location.origin.includes(':5173')
      ? 'http://localhost:5000'
      : window.location.origin;

    const socketInstance = io(backendUrl, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });

    socketInstance.on('connect', () => {
      setIsConnected(true);
    });

    socketInstance.on('connection:ready', (data) => {
      if (data?.activeClients) {
        setActiveClientsCount(data.activeClients);
      }
    });

    socketInstance.on('event:alert', (alertData) => {
      setLastAlert(alertData);
    });

    socketInstance.on('disconnect', () => {
      setIsConnected(false);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        lastAlert,
        activeClientsCount,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  return useContext(SocketContext);
}
