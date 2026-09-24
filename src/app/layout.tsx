import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Maternal Visual Attention",
  description: "Browser-based visual attention research application",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
