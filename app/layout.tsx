import type { Metadata } from "next";
import { Epilogue, DM_Mono } from "next/font/google";
import "./globals.css";

const epilogue = Epilogue({
  subsets: ["latin"],
  variable: "--font-epilogue",
  weight: ["400", "500", "600", "700", "800"],
});

const dmMono = DM_Mono({
  subsets: ["latin"],
  variable: "--font-dm-mono",
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "投標案件管理系統",
  description: "Bid Manager - 投標案件追蹤與管理",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-TW">
      <body className={`${epilogue.variable} ${dmMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
