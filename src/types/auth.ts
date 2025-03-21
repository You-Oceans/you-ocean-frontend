export interface SignupFormData {
    name: string;
    email: string;
    password: string;
    about:string,
    gender: 'MALE' | 'FEMALE' | 'OTHERS';
    purpose: 'PERSONAL' | 'BUSINESS' | 'EDUCATION';
    profileImage: string;
  }
  export interface SigninFormData {
    email: string;
    password: string;
  }
  export interface User {
    name: string;
    profileImage: string;
    email?: string;
  }
  
  export interface NavbarProps {
    className?: string;
  }
  
  