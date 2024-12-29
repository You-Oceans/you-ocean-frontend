import React, { useState } from 'react';
import { User, Mail, Lock, Users, Target } from 'lucide-react';
import { Input } from '../ui/input';
import { Select } from '../ui/select';
import { Button } from '../ui/button';
import { ImageUpload } from '../ImageUpload';
import { useForm } from '../../hooks/useForm';
import { GENDER_OPTIONS, PURPOSE_OPTIONS } from '../../constants/formOptions';
import type { SignupFormData } from '../../types/auth';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const initialFormData: SignupFormData = {
  name: '',
  email: '',
  password: '',
  gender: 'male',
  purpose: 'PERSONAL',
  profileImage: '', 
  about: '' 
};

export default function SignupForm() {
  const navigate = useNavigate();
  const { formData, handleChange, handleImageChange } = useForm<SignupFormData>(initialFormData);
  const [previewUrl, setPreviewUrl] = useState<string>('');

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const uploadedImageUrl = await handleImageChange(e);
      setPreviewUrl(uploadedImageUrl);
      handleChange({
        target: { name: 'profileImage', value: uploadedImageUrl },
      } as React.ChangeEvent<HTMLInputElement>);
  
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password || !formData.profileImage || !formData.about) {
      alert("Please fill in all required fields.");
      return;
    }

    const dataToSend = {
      name: formData.name,
      email: formData.email,
      password: formData.password,
      gender: formData.gender,
      purpose: formData.purpose,
      profileImage: formData.profileImage,
      about: formData.about, 
    };

    try {
      const response = await axios.post('http://localhost:3000/auth/register', dataToSend, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('Response:', response.data);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify({ name: response.data.user.name, profileImage: response.data.user.profileImage ,email: response.data.user.email}));
      navigate('/dashboard')
    } catch (error) {
      console.error('Error during sign-up:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="px-8 py-6">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-center">Create an account</h1>
            <h2 className="text-center">Enter your information to create your account</h2>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            <ImageUpload previewUrl={previewUrl} onChange={handleImageUpload} />

            <Input
              icon={User}
              type="text"
              name="name"
              required
              placeholder="Full Name"
              value={formData.name}
              onChange={handleChange}
            />

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

            <Select
              icon={Users}
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              options={GENDER_OPTIONS}
            />

            <Select
              icon={Target}
              name="purpose"
              value={formData.purpose}
              onChange={handleChange}
              options={PURPOSE_OPTIONS}
            />

            <Input
              icon={Target} 
              type="text"
              name="about"
              required
              placeholder="About Yourself"
              value={formData.about}
              onChange={handleChange}
            />

            <Button type="submit">Sign Up</Button>
          </form>

          <div className="flex justify-center my-4">
            <p className="text-sm text-muted-foreground">
              Already have an account? <a href="/login" className="text-primary hover:underline">Login</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
