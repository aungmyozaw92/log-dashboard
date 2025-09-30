import { create } from "zustand";
const tokenFromStorage = localStorage.getItem("token");
const userFromStorage = localStorage.getItem("user")
  ? JSON.parse(localStorage.getItem("user"))
  : null;

export const useAuthStore = create((set) => ({
  user: userFromStorage,
  token: tokenFromStorage,
  login: (userData, token) => {
    // Save to localStorage
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("token", token);
    set({ user: userData, token });
  },
  logout: () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    set({ user: null, token: null });
  },
}));

