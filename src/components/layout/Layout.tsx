import { ReactNode } from 'react';
import Header from './Header';
import Footer from './Footer';
import CompareBar from '@/components/property/CompareBar';

interface LayoutProps {
  children: ReactNode;
  hideCompareBar?: boolean;
}

const Layout = ({ children, hideCompareBar }: LayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      {!hideCompareBar && <CompareBar />}
    </div>
  );
};

export default Layout;
