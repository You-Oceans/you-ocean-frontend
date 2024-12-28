import React, { useState } from 'react';
import { User, Mail, Lock, Users, Target } from 'lucide-react';
import { Input } from '../ui/input';
import { Select } from '../ui/select';
import { Button } from '../ui/button';
import { ImageUpload } from '../ImageUpload';
import { useForm } from '../../hooks/useForm';
import { GENDER_OPTIONS, PURPOSE_OPTIONS } from '../../constants/formOptions';
import type { SignupFormData } from '../../types/auth';

const initialFormData: SignupFormData = {
  name: '',
  email: '',
  password: '',
  gender: 'male',
  purpose: 'personal',
  image: null
};

export default function SignupForm() {
  const { formData, handleChange, handleImageChange } = useForm<SignupFormData>(initialFormData);
  const [previewUrl, setPreviewUrl] = useState<string>('');

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = await handleImageChange(e);
    setPreviewUrl(url);
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  
    if (!formData.name || !formData.email || !formData.password) {
      alert("Please fill in all required fields.");
      return;
    }
  
    console.log("Form submitted:", formData);
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="px-8 py-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-center">Create an account</h1>
          <h2 className="text-center">
            Enter your information to create your account
          </h2>
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

            <Button type="submit">
              Sign Up
            </Button>
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