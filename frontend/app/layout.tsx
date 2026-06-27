import "./globals.css";

export const metadata = {
  title: "URL Shortener",
  description: "Simple URL shortener built with Next.js",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}