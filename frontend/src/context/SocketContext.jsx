import React, { createContext, useContext, useState, useEffect } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext();

const SOCKET_URL = 'http://localhost:3000';

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [sysState, setSysState] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const newSocket = io(SOCKET_URL);
    setSocket(newSocket);

    newSocket.on('connect', () => {
      setIsConnected(true);
      console.log('🌐 Unified Socket Stream: Connected');
    });

    newSocket.on('system_update', (data) => {
      setSysState(data);
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
      console.log('🌐 Unified Socket Stream: Disconnected');
    });

    return () => newSocket.close();
  }, []);

  return (
    <SocketContext.Provider value={{ socket, sysState, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) throw new Error('useSocket must be used within a SocketProvider');
  return context;
};
