"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

type DirectoryContextType = {
  dir: string;
  segments: string[];
  currentDir: string | null;
};

const DirectoryContext = createContext<DirectoryContextType | null>(null);

export function DirectoryProvider({ children }: { children: React.ReactNode }) {
  const searchParams = useSearchParams();
  const [dir, setDir] = useState<string>("/");

  useEffect(() => {
    const rawDir = searchParams.get("dir");
    setDir(rawDir ?? "/");
  }, [searchParams]);

  const segments = dir ? dir.split("/").filter(Boolean) : [];
  const currentDir = segments.length > 0 ? segments[segments.length - 1] : null;

  return (
    <DirectoryContext.Provider value={{ dir, segments, currentDir }}>
      {children}
    </DirectoryContext.Provider>
  );
}

export function useDirectory() {
  const context = useContext(DirectoryContext);
  if (!context) {
    throw new Error("useDirectory must be used within a DirectoryProvider");
  }
  return context;
}
