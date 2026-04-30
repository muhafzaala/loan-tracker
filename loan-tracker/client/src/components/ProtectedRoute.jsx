import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function ProtectedRoute({ children }) {
  const { userToken } = useAuth();

  if (!userToken) {
    return <Navigate to="/auth" replace />;
  }

  return children;
}
