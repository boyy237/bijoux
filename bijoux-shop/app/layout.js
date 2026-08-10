import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PwaRegister from "@/components/PwaRegister";

export const metadata = {
  title: "Bijoux Pro - Bijoux, mode et accessoires de luxe",
  description:
    "Boutique en ligne de bijoux, habits, sacs, montres et accessoires de luxe. Réservez ou achetez en ligne.",
  manifest: "/manifest.json",
  icons: {
    icon: "/icons/icon-192.png",
    apple: "/icons/icon-192.png",
  },
};

export const viewport = {
  themeColor: "#1a1a1a",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body>
        <CartProvider>
          <Header />
          <main>{children}</main>
          <Footer />
        </CartProvider>
        <PwaRegister />
      </body>
    </html>
  );
}
