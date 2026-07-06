import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { FiLogOut, FiSettings, FiCreditCard, FiAward } from 'react-icons/fi';
import { Link } from 'react-router-dom';

const Profile = () => {
  const { user, logout } = useContext(AuthContext);

  return (
    <div className="pt-12 px-6">
      <h1 className="text-2xl font-bold text-slate-800 mb-8">Profile</h1>

      <div className="flex flex-col items-center mb-10">
        <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center text-primary border-4 border-white shadow-lg mb-4">
          <span className="text-4xl font-bold">{user?.username.charAt(0).toUpperCase()}</span>
        </div>
        <h2 className="text-xl font-bold text-slate-800">{user?.username}</h2>
        <p className="text-slate-500 text-sm">Premium Member</p>
      </div>

      <div className="space-y-4">
        <Link to="/settings" className="bg-white p-4 rounded-2xl flex items-center gap-4 shadow-sm active:scale-95 transition-transform">
          <div className="bg-slate-100 p-3 rounded-xl text-slate-600">
            <FiSettings size={20} />
          </div>
          <span className="font-semibold text-slate-700 flex-1">Settings</span>
        </Link>
        
        <div className="bg-white p-4 rounded-2xl flex items-center gap-4 shadow-sm active:scale-95 transition-transform">
          <div className="bg-slate-100 p-3 rounded-xl text-slate-600">
            <FiCreditCard size={20} />
          </div>
          <span className="font-semibold text-slate-700 flex-1">Salary History</span>
        </div>

        <div className="bg-white p-4 rounded-2xl flex items-center gap-4 shadow-sm active:scale-95 transition-transform">
          <div className="bg-slate-100 p-3 rounded-xl text-slate-600">
            <FiAward size={20} />
          </div>
          <span className="font-semibold text-slate-700 flex-1">Achievements</span>
        </div>

        <button 
          onClick={logout}
          className="w-full bg-expense/10 p-4 rounded-2xl flex items-center gap-4 active:scale-95 transition-transform mt-8"
        >
          <div className="bg-expense/20 p-3 rounded-xl text-expense">
            <FiLogOut size={20} />
          </div>
          <span className="font-semibold text-expense flex-1 text-left">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Profile;
