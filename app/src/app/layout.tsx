import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import TonProvider from "@/components/ton/TonProvidor";
import ModalProvider from "@/components/modals/ModalProvider";
import Header from "@/components/mains/Header";
import Footer from "@/components/mains/Footer";
import ItemMenu from "@/components/mains/ItemMenu";
import CurrencyBox from "@/components/mains/content/CurrencyBox";
import MainboxColor from "@/components/mains/content/MainboxColor";

const geistSans = localFont({
  /*  src: "@/app/fonts/GeistVF.woff", */
  src: './fonts/GeistVF.woff',
   variable: "--font-geist-sans",
   weight: "100 900",
});
const geistMono = localFont({
   src: "./fonts/GeistMonoVF.woff",
   variable: "--font-geist-mono",
   weight: "100 900",
});

export const metadata: Metadata = {
   title: "Star Store",
   description: "Internet sowda",
};

export default async function RootLayout({
   children,
}: Readonly<{
   children: React.ReactNode;
}>) {
   return (
      <html lang="en">
         <body
            className={`${geistSans.variable} ${geistMono.variable} antialiased`}
         >
            <TonProvider>
               <ModalProvider />
               <Header />
               <ItemMenu />
               <CurrencyBox />
               <MainboxColor>{children}</MainboxColor>
               <Footer />
            </TonProvider>
         </body>
      </html>
   );
}
