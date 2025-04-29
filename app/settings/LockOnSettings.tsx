"use client";

import { usePrivateKey } from "@/components/private-key-context";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

export function LockOnSettings() {
  const { lock } = usePrivateKey();
  const pathname = usePathname();

  useEffect(() => {
    if (pathname === "/settings") {
      lock();
    }
  }, [pathname]);

  return null;
}
