import type { Metadata } from "next";
import { Mitr } from "next/font/google";
import "./globals.css";

const mitr = Mitr({
  subsets: ["thai", "latin"],
  variable: "--font-mitr",
  weight: ["400", "500", "600", "700"],
});


export const metadata: Metadata = {
  title: "Antiques App",
  description: "Antiques Shop",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${mitr.variable} antialiased bg-stone-200`}
      >
        <div>{children}</div>
      </body>
    </html>
  );
}
