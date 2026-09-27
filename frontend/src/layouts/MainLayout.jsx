import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/Navbar.jsx';
import { Footer } from '../components/Footer.jsx';

/**
 * Main application layout wrapping Navbar, Content Outlet, and Footer
 */
export const MainLayout = () => {
  return (
    <div className="relative min-h-screen flex flex-col bg-[#0b0f19] text-gray-100 overflow-x-hidden">
      {/* Ambient background glows */}
      <div className="pointer-events-none fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[500px] overflow-hidden -z-10 opacity-30">
        <div className="absolute -top-40 left-1/4 w-96 h-96 bg-[#f84464] rounded-full blur-[140px]" />
        <div className="absolute -top-40 right-1/4 w-96 h-96 bg-[#3b82f6] rounded-full blur-[160px]" />
      </div>

      <Navbar />

      <main className="flex-1 w-full">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
};

export default MainLayout;
