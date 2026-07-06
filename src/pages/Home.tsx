import { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { FiTrendingDown, FiTrendingUp, FiCreditCard, FiPieChart, FiUser } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';

const Home = () => {
  const { user } = useContext(AuthContext);
  const [summary, setSummary] = useState<any>(null);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSalaryModal, setShowSalaryModal] = useState(false);
  const [salaryInput, setSalaryInput] = useState('');
  const [submittingSalary, setSubmittingSalary] = useState(false);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [summaryRes, expensesRes] = await Promise.all([
          api.get('/reports/summary'),
          api.get('/expenses?limit=5') // Assuming backend supports limit, otherwise it just returns all
        ]);
        setSummary(summaryRes.data);
        setExpenses(expensesRes.data.slice(0, 5));

        // Trigger Salary Prompt if not added and date is >= 6
        if (summaryRes.data.monthlySalary === 0 && new Date().getDate() >= 6) {
          setShowSalaryModal(true);
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading) {
    return <div className="p-6 pt-12 animate-pulse space-y-6">
      <div className="h-8 bg-slate-200 rounded w-1/2"></div>
      <div className="h-32 bg-slate-200 rounded-3xl"></div>
      <div className="h-24 bg-slate-200 rounded-3xl"></div>
    </div>;
  }

  const currentDate = format(new Date(), 'EEEE, dd MMM yyyy');

  const handleSalarySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!salaryInput || isNaN(Number(salaryInput))) return;
    setSubmittingSalary(true);
    try {
      const now = new Date();
      await api.post('/salary', {
        amount: Number(salaryInput),
        month: now.getMonth() + 1,
        year: now.getFullYear()
      });
      setSummary({ 
        ...summary, 
        monthlySalary: Number(salaryInput), 
        remainingBalance: summary.remainingBalance + Number(salaryInput) 
      });
      setShowSalaryModal(false);
      toast.success('Salary updated for this month!');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update salary');
    } finally {
      setSubmittingSalary(false);
    }
  };

  return (
    <div className="pt-12 px-6">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-center mb-8"
      >
        <div>
          <p className="text-slate-500 text-sm">{currentDate}</p>
          <h1 className="text-2xl font-bold text-slate-800">Good Morning, {user?.username}</h1>
        </div>
        <Link to="/profile">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary border border-primary/20">
            <FiUser size={24} />
          </div>
        </Link>
      </motion.div>

      {/* Main Balance Card */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-primary rounded-[2rem] p-6 text-white shadow-xl shadow-primary/30 relative overflow-hidden mb-6"
      >
        <div className="absolute top-[-20%] right-[-10%] w-40 h-40 bg-white opacity-10 rounded-full blur-2xl"></div>
        <div className="relative z-10">
          <p className="text-white/70 text-sm font-medium mb-1">Remaining Balance</p>
          <h2 className="text-4xl font-bold mb-6">₹{(summary?.remainingBalance || 0).toLocaleString()}</h2>
          
          <div className="flex justify-between items-center">
            <div>
              <p className="text-white/60 text-xs">Monthly Salary</p>
              <p className="font-semibold">₹{(summary?.monthlySalary || 0).toLocaleString()}</p>
            </div>
            <div className="h-8 w-[1px] bg-white/20"></div>
            <div>
              <p className="text-white/60 text-xs">Total Savings</p>
              <p className="font-semibold">₹{(summary?.totalSavings || 0).toLocaleString()}</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Expense Summary Row */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-3 gap-3 mb-8"
      >
        <div className="bg-expense/10 p-4 rounded-2xl flex flex-col items-center justify-center text-center">
          <FiTrendingDown className="text-expense mb-1" />
          <p className="text-[10px] text-slate-500 font-medium">Today</p>
          <p className="font-bold text-slate-800 text-sm">₹{summary?.todayExpense || 0}</p>
        </div>
        <div className="bg-warning/10 p-4 rounded-2xl flex flex-col items-center justify-center text-center">
          <FiPieChart className="text-warning mb-1" />
          <p className="text-[10px] text-slate-500 font-medium">Weekly</p>
          <p className="font-bold text-slate-800 text-sm">₹{summary?.weeklyExpense || 0}</p>
        </div>
        <div className="bg-analytics/10 p-4 rounded-2xl flex flex-col items-center justify-center text-center">
          <FiCreditCard className="text-analytics mb-1" />
          <p className="text-[10px] text-slate-500 font-medium">Monthly</p>
          <p className="font-bold text-slate-800 text-sm">₹{summary?.monthlyExpense || 0}</p>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <div className="mb-8 flex justify-between items-center">
        <h3 className="font-bold text-lg text-slate-800">Quick Actions</h3>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <Link to="/add" className="bg-white border border-slate-100 p-4 rounded-2xl shadow-sm flex items-center gap-3 active:scale-95 transition-transform">
          <div className="bg-expense/10 p-3 rounded-full text-expense">
            <FiTrendingDown size={20} />
          </div>
          <span className="font-medium text-sm">Add Expense</span>
        </Link>
        <Link to="/savings" className="bg-white border border-slate-100 p-4 rounded-2xl shadow-sm flex items-center gap-3 active:scale-95 transition-transform">
          <div className="bg-savings/10 p-3 rounded-full text-savings">
            <FiTrendingUp size={20} />
          </div>
          <span className="font-medium text-sm">Add Savings</span>
        </Link>
      </div>

      <button 
        onClick={() => setShowSalaryModal(true)}
        className="w-full bg-primary/10 text-primary border border-primary/20 p-4 rounded-2xl shadow-sm flex justify-center items-center gap-3 active:scale-95 transition-transform mb-8 font-semibold"
      >
        Update This Month's Salary
      </button>

      {/* Latest Transactions */}
      <div className="mb-4 flex justify-between items-end">
        <h3 className="font-bold text-lg text-slate-800">Recent Transactions</h3>
        <Link to="/expenses" className="text-primary text-sm font-medium">See All</Link>
      </div>

      <div className="space-y-3">
        {expenses.length === 0 ? (
          <p className="text-center text-slate-400 py-4 text-sm">No recent transactions.</p>
        ) : (
          expenses.map((expense, i) => (
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + (i * 0.1) }}
              key={expense._id} 
              className="bg-white p-4 rounded-2xl flex justify-between items-center shadow-sm border border-slate-50"
            >
              <div className="flex items-center gap-4">
                <div className="bg-slate-100 p-3 rounded-xl text-slate-600">
                  <FiCreditCard />
                </div>
                <div>
                  <p className="font-semibold text-slate-800">{expense.category}</p>
                  <p className="text-xs text-slate-400">{expense.remark}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-expense">-₹{expense.amount}</p>
                <p className="text-[10px] text-slate-400">{format(new Date(expense.date), 'dd MMM')}</p>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Salary Modal Overlay */}
      <AnimatePresence>
        {showSalaryModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-[2rem] p-6 w-full max-w-sm shadow-2xl relative"
            >
              <h2 className="text-xl font-bold text-slate-800 mb-2">Update Monthly Salary</h2>
              <p className="text-sm text-slate-500 mb-6">Enter your received salary for this month. This helps track your remaining balance.</p>
              
              <form onSubmit={handleSalarySubmit}>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-slate-600 mb-1">Received Amount (₹)</label>
                  <input
                    type="number"
                    value={salaryInput}
                    onChange={(e) => setSalaryInput(e.target.value)}
                    className="input-field text-2xl font-bold h-16"
                    placeholder="0"
                    autoFocus
                  />
                </div>
                
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowSalaryModal(false)}
                    className="flex-1 py-4 font-bold text-slate-600 bg-slate-100 rounded-2xl active:scale-95 transition-transform"
                  >
                    Not Now
                  </button>
                  <button
                    type="submit"
                    disabled={submittingSalary}
                    className="flex-1 py-4 font-bold text-white bg-primary rounded-2xl active:scale-95 transition-transform disabled:opacity-70"
                  >
                    {submittingSalary ? 'Saving...' : 'Save Salary'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default Home;
