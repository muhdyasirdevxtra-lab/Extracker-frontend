import { Link, useLocation } from 'react-router-dom';
import { FiHome, FiPieChart, FiPlus, FiBell, FiUser } from 'react-icons/fi';
import clsx from 'clsx';

const navItems = [
  { name: 'Home', path: '/', icon: FiHome },
  { name: 'Reports', path: '/reports', icon: FiPieChart },
  { name: 'Add', path: '/add', icon: FiPlus, isFab: true },
  { name: 'Settings', path: '/settings', icon: FiBell }, // using settings page for bell for now
  { name: 'Profile', path: '/profile', icon: FiUser },
];

const BottomNav = () => {
  const location = useLocation();

  return (
    <div className="absolute bottom-0 w-full bg-white border-t border-slate-100 pb-safe pt-2 px-6 flex justify-between items-center z-50 h-20 shadow-[0_-10px_20px_rgba(0,0,0,0.02)]">
      {navItems.map((item) => {
        const isActive = location.pathname === item.path || (item.path === '/reports' && location.pathname === '/expenses');
        
        if (item.isFab) {
          return (
            <Link key={item.name} to={item.path} className="relative">
              <div className="bg-[#e4769c] text-white p-3 rounded-2xl shadow-lg shadow-[#e4769c]/30 active:scale-95 transition-transform">
                <item.icon size={24} strokeWidth={3} />
              </div>
            </Link>
          );
        }

        return (
          <Link
            key={item.name}
            to={item.path}
            className={clsx(
              "flex flex-col items-center justify-center gap-1 w-12 transition-colors",
              isActive ? "text-[#5c73df]" : "text-slate-300"
            )}
          >
            <item.icon size={24} className={clsx(isActive && "stroke-[2.5px]")} />
          </Link>
        );
      })}
    </div>
  );
};

export default BottomNav;
