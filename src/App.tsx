import { BrowserRouter, Route, Routes } from 'react-router-dom';
import './App.css';
import SignupForm from './components/auth/SignupForm';
import SigninForm from './components/auth/SiginForm';
import Layout from './Layout';
import Dashboard from './components/dashboard/Dashboard';
import { Navbar } from './components/navbar/Navbar';
import ProtectedRoute from './components/ProtectedRoute';  

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path='/' element={<Layout />} />
        <Route path='/signup' element={<SignupForm />} />
        <Route path='/login' element={<SigninForm />} />
        
       
        <Route
          path='/dashboard'
          element={
            <ProtectedRoute element={<Dashboard />} redirectTo="/login" />
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
