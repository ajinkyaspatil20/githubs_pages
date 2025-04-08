import { create } from "zustand";

const useToastStore = create((set) => ({
  toasts: [],
  addToast: (toast) => set((state) => ({ toasts: [...state.toasts, toast] })),
  removeToast: (id) =>
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}));

export const useToast = () => {
  const { addToast, removeToast } = useToastStore();

  const toast = (options) => {
    const id = Math.random().toString(36).substr(2, 9);
    const defaultOptions = {
      id,
      duration: 3000,
      position: "top-right",
      ...options,
    };
    addToast(defaultOptions);
    setTimeout(() => removeToast(id), defaultOptions.duration);
  };

  return {
    toast,
    success: (message) => toast({ message, type: "success" }),
    error: (message) => toast({ message, type: "error" }),
    info: (message) => toast({ message, type: "info" }),
  };
};
