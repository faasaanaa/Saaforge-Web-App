import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/contexts/AuthContext";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Saaforge - Premium Software Solutions",
  description: "Building premium software solutions for modern businesses. Automation, custom software, and web development.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                // Remove browser extension attributes to prevent hydration warnings
                function removeBrowserExtensionAttributes() {
                  const attributes = ['bis_skin_checked', 'data-new-gr-c-s-check-loaded', 'data-gr-ext-installed'];
                  attributes.forEach(attr => {
                    document.querySelectorAll('[' + attr + ']').forEach(el => {
                      el.removeAttribute(attr);
                    });
                  });
                }
                
                // Run immediately
                if (document.readyState === 'loading') {
                  document.addEventListener('DOMContentLoaded', removeBrowserExtensionAttributes);
                } else {
                  removeBrowserExtensionAttributes();
                }
                
                // Continue monitoring for new additions
                if (typeof MutationObserver !== 'undefined') {
                  const observer = new MutationObserver(removeBrowserExtensionAttributes);
                  observer.observe(document.documentElement, {
                    attributes: true,
                    attributeFilter: ['bis_skin_checked', 'data-new-gr-c-s-check-loaded', 'data-gr-ext-installed'],
                    subtree: true,
                    childList: true
                  });
                }
              })();
            `,
          }}
        />
      </head>
      <body className={`${inter.variable} font-sans antialiased`} suppressHydrationWarning>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
