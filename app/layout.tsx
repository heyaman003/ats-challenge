import type { Metadata } from "next";
import { ThemeProvider } from "@/components/theme-provider"; // Import correctly
import "./globals.css";

export const metadata: Metadata = {
  title: "ATS Challenge",
  description: "ATS Challenge",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning> 
      <body className="antialiased">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
