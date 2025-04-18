"use client";

import { createContext, useContext, useEffect, useState } from "react";

type PrivateKeyContextType = {
  localPrivateKey: string | null;
  setPrivateLocalKey: (key: string | null) => void;
};

const PrivateKeyContext = createContext<PrivateKeyContextType | undefined>(
  undefined
);

export const PrivateKeyProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [localPrivateKey, setPrivateLocalKeyState] = useState<string | null>(
    null
  );

  useEffect(() => {
    const key = localStorage.getItem("privateKey");
    setPrivateLocalKeyState(key);
  }, []);

  const setPrivateLocalKey = (key: string | null) => {
    if (key) {
      localStorage.setItem("privateKey", key);
    } else {
      localStorage.removeItem("privateKey");
    }
    setPrivateLocalKeyState(key);
  };

  return (
    <PrivateKeyContext.Provider value={{ localPrivateKey, setPrivateLocalKey }}>
      {children}
    </PrivateKeyContext.Provider>
  );
};

export const usePrivateKey = (): PrivateKeyContextType => {
  const context = useContext(PrivateKeyContext);
  if (!context) {
    throw new Error("usePrivateKey must be used within a PrivateKeyProvider");
  }
  return context;
};
