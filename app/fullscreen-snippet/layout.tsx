import { Suspense } from "react";
import Spinner from "@/components/Spinner";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Suspense fallback={<Spinner />}>
            {children}
        </Suspense>
      </body>
    </html>
  );
}
