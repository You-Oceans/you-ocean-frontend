import React from 'react';
import { Mail, Lock } from 'lucide-react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { useForm } from '../../hooks/useForm';
import type { SigninFormData } from '../../types/auth';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
const initialFormData: SigninFormData = {
  email: '',
  password: '',
};

export default function SigninForm() {
  const { formData, handleChange } = useForm<SigninFormData>(initialFormData);
  const navigate = useNavigate();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    
    try {
      const response = await axios.post('http://localhost:3000/auth/login', formData);
      console.log('Response:', response.data);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify({ name: response.data.user.name, profileImage: response.data.user.profileImage }));
      navigate('/dashboard')
    } catch (error) {
      console.error('Error during sign-in:', error);
    }
  };
  

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="px-8 py-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-center">Welcome back</h1>
          <h2 className="text-center">
          Enter your information to access your account
          </h2>
        </div>
          <form onSubmit={handleSubmit} className="space-y-6 my-6">
            <Input
              icon={Mail}
              type="email"
              name="email"
              required
              placeholder="Email Address"
              value={formData.email}
              onChange={handleChange}
            />

            <Input
              icon={Lock}
              type="password"
              name="password"
              required
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
            />


            <Button type="submit">
              Sign In
            </Button>
          </form>
          <div className="flex justify-center my-4">
          <p className="text-sm text-muted-foreground">
          Don't have an account?{' '} <a href="/" className="text-primary hover:underline">Sign up</a>
          </p>
        </div>
        </div>
       
      </div>
    </div>
  );
}