import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "./provider";

const inter = Inter({
  subsets: ["latin"],
});

export const metadata = {
  title: "Account Authentication",
  description: "Secure authentication service",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="light">
      <body className={`${inter.className} antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
