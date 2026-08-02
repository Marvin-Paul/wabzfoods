import type { Metadata } from "next";
import { CartProvider } from "@/components/CartContext";
import { ToastProvider } from "@/components/ui/use-toast";
import Navbar from "@/components/Navbar";
import CartDrawer from "@/components/CartDrawer";
import Footer from "@/components/Footer";
import WhatsAppChatWidget from "@/components/WhatsAppChatWidget";
import SplashScreen from "@/components/SplashScreen";
import "./globals.css";

export const metadata: Metadata = {
  title: "Wabz Foods",
  description: "Order Ugandan and fast food online",
  icons: {
    icon: { url: "/wabzfoodz-favicon.png", sizes: "64x64", type: "image/png" },
    apple: { url: "/wabzfoodz-icon-192.png", sizes: "192x192" },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="flex flex-col min-h-screen">
        <SplashScreen />
        <CartProvider>
          <ToastProvider>
            <Navbar />
            <CartDrawer />
            <main className="flex-1">{children}</main>
            <WhatsAppChatWidget />
            <Footer />
          </ToastProvider>
        </CartProvider>
      </body>
    </html>
  );
}
