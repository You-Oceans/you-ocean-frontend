import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import PrivateRoute from '../components/ProtectedRoute';
import Home from '../pages/Home';
import LoginPage from '../pages/LoginPage';
import SignupPage from '../pages/SignupPage';
import NotFound from '../pages/NotFound';
import { useEffect } from 'react';
import { useAuthStore } from '@/hooks/useAuthStore';
import { Navbar } from '@/components/Layout/Navbar';
const AppRoutes = () => {
  const { setAuthFromCookie } = useAuthStore(); 

  useEffect(() => {
    setAuthFromCookie();
  }, [setAuthFromCookie]);

  return (
    <Router>
        <Navbar/>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/" element={<PrivateRoute><Home /></PrivateRoute>} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
};

export default AppRoutes;
