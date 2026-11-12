import { create } from "zustand";
import { persist } from "zustand/middleware";
import api from "../services/api";

const useAuthStore = create(
    persist(
        (set) => ({
            user: null,
            token: null,
            isAuthenticated: false,

            login: (user, token) =>
                set({
                    user,
                    token,
                    isAuthenticated: true,
                }),

            logout: () =>
                set({
                    user: null,
                    token: null,
                    isAuthenticated: false,
                }),

            setUser: (user) => set({ user }),
        }),
        {
            name: "auth-storage",
        },
    ),
);

export default useAuthStore;
