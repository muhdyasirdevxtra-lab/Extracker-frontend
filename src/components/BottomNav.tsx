import { Link, useLocation } from 'react-router-dom';
import { FiHome, FiPieChart, FiPlusCircle, FiBarChart2, FiUser } from 'react-icons/fi';
import clsx from 'clsx';

const navItems = [
  { name: 'Home', path: '/', icon: FiHome },
  { name: 'Expenses', path: '/expenses', icon: FiPieChart },
  { name: 'Add', path: '/add', icon: FiPlusCircle, isFab: true },
  { name: 'Reports', path: '/reports', icon: FiBarChart2 },
  { name: 'Profile', path: '/profile', icon: FiUser },
];

const BottomNav = () => {
  const location = useLocation();

  return (
    <div className="absolute bottom-0 w-full bg-white/90 backdrop-blur-md border-t border-slate-200 pb-safe pt-2 px-6 flex justify-between items-center z-50 rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.05)] h-20">
      {navItems.map((item) => {
        const isActive = location.pathname === item.path;
        
        if (item.isFab) {
          return (
            <Link key={item.name} to={item.path} className="relative -top-6">
              <div className="bg-primary text-white p-4 rounded-full shadow-lg shadow-primary/40 active:scale-95 transition-transform">
                <item.icon size={28} />
              </div>
            </Link>
          );
        }

        return (
          <Link
            key={item.name}
            to={item.path}
            className={clsx(
              "flex flex-col items-center justify-center gap-1 w-14 transition-colors",
              isActive ? "text-primary" : "text-slate-400"
            )}
          >
            <item.icon size={22} className={clsx(isActive && "fill-primary/20 stroke-2")} />
            <span className="text-[10px] font-medium">{item.name}</span>
          </Link>
        );
      })}
    </div>
  );
};

export default BottomNav;
