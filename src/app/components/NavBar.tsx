// src/app/components/NavBar.tsx
import Link from 'next/link';

const NavBar = () => {
  return (
    <nav className="bg-black/20 backdrop-blur sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="text-xl font-bold text-white hover:text-gray-200 transition-colors">
          Imagen Starter
        </Link>
        <div className="flex gap-8 items-center">
          <Link href="/imagen" className="text-white/80 hover:text-white transition-colors">
            Imagen Lab
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
