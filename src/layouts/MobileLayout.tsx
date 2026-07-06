import { Outlet } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import { Toaster } from 'react-hot-toast';

const MobileLayout = () => {
  return (
    <div className="bg-slate-900 min-h-screen w-full flex justify-center items-center p-0 sm:p-4">
      {/* 
        This container enforces the mobile aspect ratio and look on desktop, 
        and fills the screen on actual mobile devices. 
      */}
      <div className="mobile-container flex flex-col sm:rounded-[2.5rem] sm:border-[8px] sm:border-slate-800 sm:h-[850px] sm:shadow-2xl">
        <Toaster position="top-center" containerStyle={{ top: 20 }} />
        
        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto pb-24 scroll-smooth">
          <Outlet />
        </div>

        <BottomNav />
      </div>
    </div>
  );
};

export default MobileLayout;
