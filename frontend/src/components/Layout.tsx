import type { ReactNode } from 'react';
import { Navbar } from './Navbar';

export function Layout({ children }: { children: ReactNode }) {
  return (
    <main className="page">
      <header className="topbar">
        <h1>OX Game</h1>
        <Navbar />
      </header>
      {children}
    </main>
  );
}
