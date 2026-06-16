import { ReactNode } from 'react';
import { Navbar } from './Navbar';

interface Props {
  children: ReactNode;
  className?: string;
}

export function PageShell({ children, className = '' }: Props) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className={`max-w-6xl mx-auto px-4 py-8 ${className}`}>{children}</main>
    </div>
  );
}
