import type { Metadata } from "next";
import { Toaster } from "react-hot-toast";
import Navbar from "@/components/layout/Navbar";
import HydrationProvider from "@/components/providers/HydrationProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "GoldRent — Gold Jewellery Rental Platform",
  description:
    "Discover, rent, and list authentic gold jewellery for weddings and special occasions.",
  keywords: ["gold jewellery rental", "jewellery rent", "wedding jewellery"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 antialiased">
        <HydrationProvider>
          <Navbar />
          <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            {children}
          </main>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: { fontSize: "14px" },
            }}
          />
        </HydrationProvider>
      </body>
    </html>
  );
}
