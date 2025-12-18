import { ReactNode } from 'react';
import Header from './Header';
import Footer from './Footer';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col noise">
      <div className="pointer-events-none fixed inset-0 app-grid opacity-50" />
      <Header />
      <main className="relative z-10 flex-grow container mx-auto px-4 py-10">
        <div className="mx-auto w-full max-w-6xl">
          {children}
        </div>
      </main>
      <Footer />
    </div>
  );
}
