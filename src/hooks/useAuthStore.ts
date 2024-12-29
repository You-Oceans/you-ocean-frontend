import { create } from 'zustand';
import Cookies from 'js-cookie';

interface userInfo {
    name: string;
    profileImage: string;
    email: string;
}

interface AuthState {
    user: userInfo | null;
    isAuthenticated: boolean;
    login: (user: userInfo) => void;
    logout: () => void;
    setAuthFromCookie: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    isAuthenticated: false,
    login: (user) => {
        sessionStorage.setItem('user', JSON.stringify(user));
        set({ user, isAuthenticated: true });
    },
    logout: () => {
        set({ user: null, isAuthenticated: false });
        sessionStorage.removeItem('user');
        Cookies.remove('authToken');
    },
    setAuthFromCookie: () => {
        const token = Cookies.get('authToken');
        const user = sessionStorage.getItem('user');

        if (token && user) {
            set({ user: JSON.parse(user), isAuthenticated: true });
        } else {
            set({ user: null, isAuthenticated: false });
        }
    },
}));
