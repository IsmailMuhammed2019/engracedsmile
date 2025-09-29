import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import "../globals.css";
import AdminRootLayout from "@/components/layout/AdminRootLayout";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Admin Dashboard - EngracedSmile Transport",
  description: "Admin dashboard for managing EngracedSmile Transport operations.",
  robots: "noindex, nofollow", // Prevent indexing of admin pages
};

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content="#6b5618" />
        <meta name="mobile-web-app-capable" content="no" />
        <meta name="apple-mobile-web-app-capable" content="no" />
      </head>
      <body
        className={`${inter.variable} ${poppins.variable} antialiased font-sans`}
      >
        <AdminRootLayout>
          {children}
        </AdminRootLayout>
      </body>
    </html>
  );
}
