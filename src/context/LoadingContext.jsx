import React, { createContext, useContext, useState } from "react";
import { Loader2 } from "lucide-react";

const LoadingContext = createContext();

export const LoadingProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [loadingCount, setLoadingCount] = useState(0);

  const startLoading = () => {
    setLoadingCount((prev) => prev + 1);
    setLoading(true);
  };

  const stopLoading = () => {
    setLoadingCount((prev) => {
      const newCount = prev - 1;
      if (newCount <= 0) {
        setLoading(false);
        return 0;
      }
      return newCount;
    });
  };

  return (
    <LoadingContext.Provider value={{ loading, startLoading, stopLoading }}>
      {loading && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <Loader2 className="w-8 h-8 text-white animate-spin" />
        </div>
      )}
      {children}
    </LoadingContext.Provider>
  );
};

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error("useLoading must be used within a LoadingProvider");
  }
  return context;
};
