import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SessionProvider } from '@/components/auth/SessionProvider';
import { getServerSession } from '@/lib/auth';
import { Analytics } from "@vercel/analytics/next"

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
              <Analytics />
              {/* Open source repo call-to-action */}
              <div className="fixed bottom-2 right-2 max-w-xs text-[10px] sm:text-xs text-muted-foreground/80 hover:text-muted-foreground transition-colors bg-background/70 backdrop-blur px-2 py-1 rounded border shadow-sm">
                <a href="https://github.com/MananGandhi1810/ai-fiesta" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 font-medium">AI Fiesta</a> is open source. Star the repo if you like it ⭐
              </div>
          </body>
      </html>
  );
}
