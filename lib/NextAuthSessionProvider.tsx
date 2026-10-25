"use client";
import { SessionProvider } from "next-auth/react";
import { isDemoAuthEnabled } from "@/utils/demoAuth";

import { ReactNode } from "react";

const NextAuthSessionProvider = ({ children }: { children: ReactNode }) => {
  if (isDemoAuthEnabled()) {
    return <>{children}</>;
  }

  return <SessionProvider>{children}</SessionProvider>;
};

export default NextAuthSessionProvider;
