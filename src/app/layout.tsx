import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PlayJosh - Connect through Sports",
  description: "A sports connectivity platform for players, teams, and enthusiasts",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full bg-white">
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans h-full flex flex-col`}>
        <Navbar />
        <main className="grow">
          {children}
        </main>
        <footer className="bg-gray-50 py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <p className="text-center text-gray-500 text-sm">
              &copy; {new Date().getFullYear()} PlayJosh. All rights reserved.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
