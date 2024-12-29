import axios from 'axios';
import { SigninFormData, SignupFormData } from '@/types/auth';
const API_URL = 'http://localhost:3000/auth';

export const login = async (data:SigninFormData) => {
    const response = await axios.post(`${API_URL}/login`,data, { withCredentials: true });
    return response.data; 
};

export const signup = async (data:SignupFormData) => {
    const response = await axios.post(`${API_URL}/register`, data);
    return response.data;
};

