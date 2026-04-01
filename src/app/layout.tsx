import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { TabBar } from "@/components/TabBar";
import { PhotoperiodProvider } from "@/components/providers/PhotoperiodProvider";
import { StealthProvider } from "@/components/providers/StealthProvider";
import { FakeUI } from "@/components/FakeUI";
import { getStealthStatus } from "@/app/actions/profileActions";
import { Toaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MasterGrow 2.0",
  description: "Cultivo Profesional SaaS",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const isStealthMode = await getStealthStatus();

  return (
    <html lang="es" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-black text-white min-h-screen pb-20`}
      >
        <StealthProvider initialStealthState={isStealthMode}>
          <PhotoperiodProvider>
            {children}
            <TabBar />
            <FakeUI />
            <Toaster 
              theme="dark" 
              toastOptions={{
                style: {
                  background: '#121212',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: '#fff',
                },
                classNames: {
                  error: 'border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.2)]',
                  success: 'border-[#50C878]/50 shadow-[0_0_15px_rgba(80,200,120,0.2)]',
                }
              }} 
            />
          </PhotoperiodProvider>
        </StealthProvider>
      </body>
    </html>
  );
}

