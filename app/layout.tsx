import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Encode_Sans_Expanded } from 'next/font/google';
import { Providers } from "./providers"
import "./globals.css";
import StyledJsxRegistry from './registry';

const inter = Inter({ subsets: ["latin"] });

const encodeSansExpanded = Encode_Sans_Expanded({
  subsets: ['latin'],
  display: 'swap',
  weight: "300"
});

export const metadata: Metadata = {
  title: "WebMap - Swissgeol",
  description: "Developed by Nards IT",
  authors: [{name:"Nards IT", url: "https://nards.it"}]
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="gs">
      <body className={encodeSansExpanded.className}>
        <Providers>
          <StyledJsxRegistry>{children}</StyledJsxRegistry>
        </Providers>
      </body>
    </html>
  );
}
