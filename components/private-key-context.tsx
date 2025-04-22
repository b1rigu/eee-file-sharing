"use client";

import { createContext, useContext, useState } from "react";

type PrivateKeyContextType = {
  localPrivateKey: string | null;
  lock: () => void;
  setPrivateLocalKey: (key: string) => void;
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

  const lock = () => {
    setPrivateLocalKeyState(null);
  };

  const setPrivateLocalKey = (key: string) => {
    setPrivateLocalKeyState(key);
  };

  return (
    <PrivateKeyContext.Provider
      value={{ localPrivateKey, lock, setPrivateLocalKey }}
    >
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
