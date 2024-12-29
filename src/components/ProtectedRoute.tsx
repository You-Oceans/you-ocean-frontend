import { Route, Navigate } from 'react-router-dom';
interface ProtectedRouteProps {
  element: React.ReactNode;
  redirectTo: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ element, redirectTo }) => {
  const isAuthenticated = localStorage.getItem('token');  

  if (!isAuthenticated) {
    return <Navigate to={redirectTo} />;
  }
  return <>{element}</>;
};

export default ProtectedRoute;
