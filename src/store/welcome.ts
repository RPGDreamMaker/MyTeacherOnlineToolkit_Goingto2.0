import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface WelcomeState {
  message: string;
  setMessage: (message: string) => void;
}

export const useWelcomeStore = create<WelcomeState>()(
  persist(
    (set) => ({
      message: "Welcome back! (customize this sentence using the button on the right)",
      setMessage: (message) => set({ message }),
    }),
    {
      name: 'welcome-message-storage',
    }
  )
);