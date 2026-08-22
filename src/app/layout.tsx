import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import healthData from "../../data/health-data.json";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: `${healthData.profile.name}'s Morning Brief`,
  description:
    "One actionable thing every morning, found across your health, calendar, email and spending data",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-gray-50 text-gray-900 font-sans">
        <nav className="bg-white border-b border-gray-200">
          <div className="max-w-4xl mx-auto px-8 h-14 flex items-center gap-6">
            <span className="font-semibold text-gray-900">
              {healthData.profile.name}&apos;s Morning Brief
            </span>
            <div className="flex items-center gap-4 text-sm">
              <Link
                href="/"
                className="text-gray-600 hover:text-gray-900 hover:underline underline-offset-4"
              >
                Today
              </Link>
              <Link
                href="/data"
                className="text-gray-600 hover:text-gray-900 hover:underline underline-offset-4"
              >
                Raw data
              </Link>
            </div>
          </div>
        </nav>
        {children}
      </body>
    </html>
  );
}
