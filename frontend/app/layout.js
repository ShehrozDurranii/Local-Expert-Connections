import './globals.css';
import { Toaster } from 'sonner';

export const metadata = {
  title: 'Local Expert-Connect | Verified Local Services & Inspections',
  description:
    'Connect with verified local experts for physical inspection, property verification, and specialized field services in your city.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-background-primary text-text-primary font-sans antialiased">
        {children}
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
