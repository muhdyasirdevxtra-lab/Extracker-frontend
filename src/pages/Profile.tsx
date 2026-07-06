import { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { FiLogOut, FiSettings, FiCreditCard, FiAward } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';

const Profile = () => {
  const { user, logout } = useContext(AuthContext);
  const [showSalaryHistory, setShowSalaryHistory] = useState(false);
  const [salaries, setSalaries] = useState<any[]>([]);
  const [loadingSalaries, setLoadingSalaries] = useState(false);

  const fetchSalaries = async () => {
    setLoadingSalaries(true);
    try {
      const { data } = await api.get('/salary');
      setSalaries(data);
    } catch (error) {
      console.error('Failed to fetch salaries');
    } finally {
      setLoadingSalaries(false);
    }
  };

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  return (
    <div className="pt-12 px-6">
      <h1 className="text-2xl font-bold text-slate-800 mb-8">Profile</h1>

      <div className="flex flex-col items-center mb-10">
        <div className="w-24 h-24 bg-[#5c73df]/10 rounded-full flex items-center justify-center text-[#5c73df] border-4 border-white shadow-lg mb-4">
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
        
        <button 
          onClick={() => { setShowSalaryHistory(true); fetchSalaries(); }}
          className="w-full bg-white p-4 rounded-2xl flex items-center gap-4 shadow-sm active:scale-95 transition-transform text-left"
        >
          <div className="bg-slate-100 p-3 rounded-xl text-slate-600">
            <FiCreditCard size={20} />
          </div>
          <span className="font-semibold text-slate-700 flex-1">Salary History</span>
        </button>

        <Link to="/savings" className="bg-white p-4 rounded-2xl flex items-center gap-4 shadow-sm active:scale-95 transition-transform">
          <div className="bg-slate-100 p-3 rounded-xl text-slate-600">
            <FiAward size={20} />
          </div>
          <span className="font-semibold text-slate-700 flex-1">Savings</span>
        </Link>

        <button 
          onClick={logout}
          className="w-full bg-[#f43f5e]/10 p-4 rounded-2xl flex items-center gap-4 active:scale-95 transition-transform mt-8"
        >
          <div className="bg-[#f43f5e]/20 p-3 rounded-xl text-[#f43f5e]">
            <FiLogOut size={20} />
          </div>
          <span className="font-semibold text-[#f43f5e] flex-1 text-left">Logout</span>
        </button>
      </div>

      {/* Salary History Modal */}
      <AnimatePresence>
        {showSalaryHistory && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="bg-white rounded-t-[2rem] p-6 w-full max-w-lg shadow-2xl max-h-[70vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-slate-800">Salary History</h2>
                <button onClick={() => setShowSalaryHistory(false)} className="text-sm font-bold text-slate-400 bg-slate-100 px-3 py-1.5 rounded-lg">
                  Close
                </button>
              </div>

              {loadingSalaries ? (
                <div className="space-y-3 animate-pulse">
                  {[1,2,3].map(i => <div key={i} className="h-16 bg-slate-100 rounded-xl"></div>)}
                </div>
              ) : salaries.length === 0 ? (
                <p className="text-slate-400 text-center py-8">No salary records yet.</p>
              ) : (
                <div className="space-y-3">
                  {salaries.map((s: any) => (
                    <div key={s._id} className="bg-slate-50 p-4 rounded-xl flex justify-between items-center">
                      <div>
                        <p className="font-bold text-slate-800">{monthNames[s.month - 1]} {s.year}</p>
                        <p className="text-xs text-slate-400">Received salary</p>
                      </div>
                      <p className="font-bold text-[#4ade80] text-lg">₹{s.amount.toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Profile;
