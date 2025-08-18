import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SessionProvider } from '@/components/auth/SessionProvider';
import { getServerSession } from '@/lib/auth';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "AI Fiesta - Multi-Model Chat",
  description: "Chat with multiple AI models simultaneously and compare their responses",
};

export default async function RootLayout({ children }) {
  const session = await getServerSession();
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased dark`}
      >
        <SessionProvider initialSession={session}>
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
