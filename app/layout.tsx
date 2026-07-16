import { Inter } from "next/font/google";
import "./globals.css";
import QueryProvider from "@/components/QueryProvider";
import Navigation from "@/components/Navigation";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Kapyaata - Premium Autos",
  description: "Premium autos at Kapyaata",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body 
        className={inter.className} 
        style={{ background: "#000000", margin: 0, padding: 0 }}
        suppressHydrationWarning
      >
        <QueryProvider>
          <main style={{ 
            maxWidth: "1200px", 
            margin: "0 auto", 
            padding: "20px 20px 80px 20px",
            width: "100%",
            minHeight: "100vh"
          }}>
            {children}
          </main>
          <Navigation />
        </QueryProvider>
      </body>
    </html>
  );
}