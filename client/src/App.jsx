import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ChatDashboard from './pages/ChatDashboard';

/**
 * ProtectedRoute Component
 */
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <Loader fullScreen message="Identifying your session..." />;
  if (!user) return <Navigate to="/login" />;
  return children;
};

/**
 * PublicRoute Component
 */
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <Loader fullScreen message="Identifying your session..." />;
  if (user) return <Navigate to="/chat" />;
  return children;
};

function App() {
  return (
    <Routes>
      {/* Landing Page */}
      <Route path="/" element={<Home />} />

      {/* Auth Routes */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        }
      />

      {/* Workspace */}
      <Route
        path="/chat"
        element={
          <ProtectedRoute>
            <ChatDashboard />
          </ProtectedRoute>
        }
      />

      {/* Catch-all redirect to chat if logged in, else home */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;
