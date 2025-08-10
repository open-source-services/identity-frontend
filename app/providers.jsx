"use client";

import { HeroUIProvider } from "@heroui/react";
import { AuthProvider } from "@/contexts/AuthContext";

export default function Providers({ children }) {
  return (
    <HeroUIProvider theme="light">
      <AuthProvider>{children}</AuthProvider>
    </HeroUIProvider>
  );
}
