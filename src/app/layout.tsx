import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "../components/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "HealthAssistant — Analysis Agent",
  description: "Daily anticipatory health intelligence and action agent",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased text-[15px] sm:text-[16px]`}
    >
      <body className="min-h-full bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-blue-100 selection:text-blue-900">
        <Navbar />
        <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
          {children}
        </main>
        <footer className="border-t border-gray-200 bg-white py-6 text-center text-sm text-gray-500">
          <p>
            HealthAssistant · Imperial DeepMind Hackathon 2026
          </p>
        </footer>
      </body>
    </html>
  );
}
