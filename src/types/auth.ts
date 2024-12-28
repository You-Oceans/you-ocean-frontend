export interface SignupFormData {
    name: string;
    email: string;
    password: string;
    about:string,
    gender: 'male' | 'female' | 'other';
    purpose: 'personal' | 'business' | 'education';
    profileImage: string;
  }
  export interface SigninFormData {
    email: string;
    password: string;
  }
  