import axios from "axios";
import { SigninFormData, SignupFormData } from "@/types/auth";
const API_URL = import.meta.env.VITE_API_FETCHDATA_API;

export const login = async (data: SigninFormData) => {
  const response = await axios.post(`${API_URL}/auth/login`, data, {
    withCredentials: true,
  });
  return response.data;
};

export const signup = async (data: SignupFormData) => {
  const response = await axios.post(`${API_URL}/auth/register`, data);
  return response.data;
};
