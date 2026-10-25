
import ReduxProvider from "@/redux/ReduxProvider";
import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import { Toaster } from "sonner";

import NextAuthSessionProvider from "../../lib/NextAuthSessionProvider";
import brandLogo from "@/src/favicon.ico";
import "./globals.css";

// console.log()
// const roboto = Roboto({
//   subsets: ["latin"],
//   weight: ["100", "300", "400", "500", "700", "900"],
// });

const roboto = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "DermaCare AI",
  description: "AI-assisted skin screening and dermatologist-led care.",
  icons: {
    icon: brandLogo.src,
    shortcut: brandLogo.src,
    apple: brandLogo.src,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${roboto.className} antialiased`}>
        <Toaster position="top-center" richColors />
        <NextAuthSessionProvider>
          <ReduxProvider>{children}</ReduxProvider>
        </NextAuthSessionProvider>
      </body>
    </html>
  );
}
