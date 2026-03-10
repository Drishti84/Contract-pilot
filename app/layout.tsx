import "./globals.css";
import Providers from "./providers";

export const metadata = {
  title: "ContractPilot",
  description: "AI Contract Review for Freelancers",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
