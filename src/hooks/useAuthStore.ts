import { create } from "zustand";
import Cookies from "js-cookie";

interface userInfo {
  name: string;
  profileImage: string;
  email: string;
  gender: string;
  about: string;
  purpose: string;
}

interface AuthState {
  user: userInfo | null;
  isAuthenticated: boolean;
  login: (user: userInfo) => void;
  logout: () => void;
  setAuthFromCookie: () => void;
}

export const useAuthStore = create<
  AuthState & { updateUser: (updatedUser: Partial<userInfo>) => void }
>((set) => ({
  user: null,
  isAuthenticated: false,
  login: (user) => {
    sessionStorage.setItem("user", JSON.stringify(user));
    set({ user, isAuthenticated: true });
  },
  logout: () => {
    set({ user: null, isAuthenticated: false });
    sessionStorage.removeItem("user");
    Cookies.remove("authToken");
  },
  setAuthFromCookie: () => {
    const token = Cookies.get("authToken");
    const user = sessionStorage.getItem("user");
    // console.log(token, user);

    if (token || user) {
      set({ user: JSON.parse(user!), isAuthenticated: true });
    } else {
      set({ user: null, isAuthenticated: false });
    }
  },
  updateUser: (updatedUser) => {
    set((state: any) => {
      const newUser = { ...state.user, ...updatedUser };
      sessionStorage.setItem("user", JSON.stringify(newUser));
      return { ...state, user: newUser }; 
    });
  },
}));
