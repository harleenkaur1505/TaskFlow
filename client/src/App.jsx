import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import ProtectedRoute from './components/layout/ProtectedRoute';
import Login from './pages/Login/Login';
import Register from './pages/Register/Register';
import Boards from './pages/Boards/Boards';
import Board from './pages/Board/Board';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SocketProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/boards"
              element={
                <ProtectedRoute>
                  <Boards />
                </ProtectedRoute>
              }
            />
            <Route
              path="/board/:boardId"
              element={
                <ProtectedRoute>
                  <Board />
                </ProtectedRoute>
              }
            />
            <Route
              path="/board/:boardId/card/:cardId"
              element={
                <ProtectedRoute>
                  <Board />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/boards" replace />} />
          </Routes>
        </SocketProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
