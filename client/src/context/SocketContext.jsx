import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { AuthContext } from './AuthContext';
import { getAccessToken } from '../api/axiosInstance';

const SocketContext = createContext(null);

function SocketProvider({ children }) {
  const { isAuthenticated } = useContext(AuthContext);
  const [socket, setSocket] = useState(null);
  const socketRef = useRef(null);

  useEffect(() => {
    if (isAuthenticated) {
      const token = getAccessToken();
      if (!token) return;

      const newSocket = io(window.location.origin, {
        auth: { token },
        withCredentials: true,
      });

      socketRef.current = newSocket;
      setSocket(newSocket);

      return () => {
        newSocket.disconnect();
        socketRef.current = null;
        setSocket(null);
      };
    }

    // If not authenticated, disconnect any existing socket
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
      setSocket(null);
    }
  }, [isAuthenticated]);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
}

export { SocketContext, SocketProvider };
