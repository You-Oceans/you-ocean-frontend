export interface SignupFormData {
    name: string;
    email: string;
    password: string;
    gender: 'male' | 'female' | 'other';
    purpose: 'personal' | 'business' | 'education';
    image: File | null;
  }
  export interface SigninFormData {
    email: string;
    password: string;
  }
  