import { create } from "zustand";

import { User } from "@/types/user";

interface UserStore {
  user: User | null;
  setUser: (user: User | null) => void;
}

export const useUserStore = create<UserStore>(set => ({
  user: null,
  setUser: (user: User | null) => set({ user }),
}));
