
import React, { ReactNode } from 'react';
import { Link } from 'react-router-dom';

interface LayoutProps {
  children: ReactNode;
  title: string;
  backLink?: { to: string; text: string };
}

const Layout: React.FC<LayoutProps> = ({ children, title, backLink }) => {
  return (
    <div className="min-h-screen bg-primary text-text-main p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">{title}</h1>
            {backLink && (
              <Link to={backLink.to} className="text-sm font-semibold text-highlight hover:text-teal-300 transition-colors">
                &larr; {backLink.text}
              </Link>
            )}
          </div>
        </header>
        <main>{children}</main>
      </div>
    </div>
  );
};

export default Layout;
