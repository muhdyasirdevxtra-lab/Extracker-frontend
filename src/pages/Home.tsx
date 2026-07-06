import { useContext, useEffect, useState, useMemo } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import { format, isToday, isYesterday, parseISO } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { 
  FiSearch, FiChevronDown, FiShoppingBag, FiCoffee, 
  FiTrendingDown, FiSmartphone, FiHome, FiHeart, FiMoreHorizontal,
  FiCreditCard
} from 'react-icons/fi';
import InsightsCard from '../components/InsightsCard';

const CategoryIconMap: Record<string, any> = {
  Food: FiCoffee,
  Shopping: FiShoppingBag,
  Transport: FiTrendingDown,
  Bills: FiSmartphone,
  Rent: FiHome,
  Health: FiHeart,
  Others: FiMoreHorizontal
};

const CategoryColorMap: Record<string, string> = {
  Food: '#e4769c',
  Shopping: '#5c73df',
  Transport: '#f3b55a',
  Bills: '#4ade80',
  Rent: '#a78bfa',
  Health: '#f43f5e',
  Others: '#94a3b8'
};

const IconMap: Record<string, any> = {
  FiCreditCard,
  FiSmartphone,
  FiDollarSign: FiSmartphone, // mapping
};

const Home = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [summary, setSummary] = useState<any>(null);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [lastMonthTotal, setLastMonthTotal] = useState(0);
  
  // Salary Modal State
  const [showSalaryModal, setShowSalaryModal] = useState(false);
  const [salaryInput, setSalaryInput] = useState('');
  const [submittingSalary, setSubmittingSalary] = useState(false);

  const fetchData = async () => {
    try {
      const [summaryRes, expensesRes, insightsRes] = await Promise.all([
        api.get('/reports/summary'),
        api.get('/expenses'),
        api.get('/reports/insights').catch(() => ({ data: { currentMonth: [], lastMonth: [] } }))
      ]);
      setSummary(summaryRes.data);
      // Bug #2 fix: backend returns flat array, not { expenses: [...] }
      const allExpenses = Array.isArray(expensesRes.data) ? expensesRes.data : (expensesRes.data.expenses || []);
      setExpenses(allExpenses.slice(0, 20));
      
      // Bug #5: Compute real last month total for the badge
      const lastTotal = (insightsRes.data.lastMonth || []).reduce((s: number, c: any) => s + c.total, 0);
      setLastMonthTotal(lastTotal);
    } catch (error) {
      console.error('Failed to fetch dashboard data', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSalarySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!salaryInput || Number(salaryInput) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    
    setSubmittingSalary(true);
    try {
      // Bug #1 fix: backend expects { amount, month: 1-12, year: number }
      const now = new Date();
      await api.post('/salary', { amount: Number(salaryInput), month: now.getMonth() + 1, year: now.getFullYear() });
      toast.success('Salary updated successfully!');
      setShowSalaryModal(false);
      setSalaryInput('');
      fetchData(); // Refresh summary
    } catch (error) {
      toast.error('Failed to update salary');
    } finally {
      setSubmittingSalary(false);
    }
  };

  // Group expenses by date
  const groupedExpenses = useMemo(() => {
    const groups: { [key: string]: any[] } = {};
    expenses.forEach(exp => {
      const dateStr = exp.date.split('T')[0];
      if (!groups[dateStr]) {
        groups[dateStr] = [];
      }
      groups[dateStr].push(exp);
    });

    // Sort dates descending
    const sortedDates = Object.keys(groups).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
    
    return sortedDates.map(dateStr => ({
      date: dateStr,
      items: groups[dateStr]
    }));
  }, [expenses]);

  const formatDateHeader = (dateStr: string) => {
    const date = parseISO(dateStr);
    if (isToday(date)) return `Today, ${format(date, 'd')}`;
    if (isYesterday(date)) return `Yesterday, ${format(date, 'd')}`;
    return format(date, 'EEEE, d');
  };

  return (
    <div className="pt-12 px-6 bg-[#f8f9fd] min-h-screen font-sans pb-24">
      {/* App Bar */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            <div className="w-2.5 h-4 bg-[#e4769c] rounded-full transform -skew-x-12"></div>
            <div className="w-2.5 h-4 bg-[#5c73df] rounded-full transform -skew-x-12"></div>
          </div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">Monety</h1>
        </div>
        <button className="p-2 text-slate-800" onClick={() => navigate('/expenses')}>
          <FiSearch size={22} strokeWidth={2.5} />
        </button>
      </div>

      {/* Profile & Filter */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-slate-200 rounded-full overflow-hidden border-2 border-white shadow-sm">
            <img src={`https://ui-avatars.com/api/?name=${user?.username}&background=random`} alt="Avatar" className="w-full h-full object-cover" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Morning</p>
            <p className="text-sm font-bold text-slate-800">{user?.username?.split(' ')[0]}</p>
          </div>
        </div>
        <div className="flex items-center gap-1 bg-white px-3 py-1.5 rounded-lg border border-slate-100 shadow-sm text-xs font-bold text-slate-700">
          This month <FiChevronDown size={14} />
        </div>
      </div>

      {/* Main Expense Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-[#6881f3] to-[#4b61c9] rounded-[1.5rem] p-6 text-white mb-8 relative overflow-hidden shadow-[0_15px_30px_rgba(92,115,223,0.3)]"
      >
        <div className="relative z-10 w-[68%]">
          <p className="text-white/80 font-medium mb-1">Expense total</p>
          <h2 className="text-4xl font-bold mb-3 tracking-tight">
            <span className="text-2xl mr-1">₹</span>
            {summary ? summary.monthlyExpense.toLocaleString() : '---'}
          </h2>
          <div className="flex items-center gap-2 mb-2">
            <div>
              <p className="text-white/60 text-[10px] uppercase tracking-wider">Salary</p>
              <p className="font-semibold text-sm">₹{(summary?.monthlySalary || 0).toLocaleString()}</p>
            </div>
            <div className="h-5 w-[1px] bg-white/20"></div>
            <div>
              <p className="text-white/60 text-[10px] uppercase tracking-wider">Available</p>
              <p className="font-semibold text-sm">₹{((summary?.monthlySalary || 0) - (summary?.monthlyExpense || 0)).toLocaleString()}</p>
            </div>
            <div className="h-5 w-[1px] bg-white/20"></div>
            <div>
              <p className="text-white/60 text-[10px] uppercase tracking-wider">Savings</p>
              <p className="font-semibold text-sm">₹{(summary?.totalSavings || 0).toLocaleString()}</p>
            </div>
          </div>
          {(() => {
            const diff = (summary?.monthlyExpense || 0) - lastMonthTotal;
            if (lastMonthTotal === 0) return null;
            return diff > 0 ? (
              <div className="inline-block bg-[#ff6b6b] text-white text-[10px] font-bold px-2.5 py-1 rounded-md">
                +₹{diff.toLocaleString()} than last month
              </div>
            ) : (
              <div className="inline-block bg-[#4ade80] text-white text-[10px] font-bold px-2.5 py-1 rounded-md">
                -₹{Math.abs(diff).toLocaleString()} than last month
              </div>
            );
          })()}
        </div>
        
        {/* 3D Illustration */}
        <div className="absolute -right-4 top-1/2 -translate-y-1/2 w-[160px] h-[160px] pointer-events-none">
          <img src="/dashboard_pie.png" alt="3D Pie Chart" className="w-full h-full object-contain drop-shadow-2xl scale-125 translate-x-4" />
        </div>
      </motion.div>

      {/* Accounts List (Horizontal Scroll) */}
      <div className="mb-8">
        <h3 className="font-bold text-lg text-slate-800 mb-4">Your Accounts</h3>
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-6 px-6">
          {summary?.accounts?.map((account: any, i: number) => {
            const Icon = IconMap[account.icon] || FiCreditCard;
            return (
              <motion.div
                key={account._id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 + (i * 0.1) }}
                className="min-w-[140px] bg-white border border-slate-100 rounded-2xl p-4 shadow-sm"
              >
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-2 rounded-full" style={{ backgroundColor: `${account.color}15`, color: account.color }}>
                    <Icon size={16} />
                  </div>
                  <p className="font-bold text-slate-700 text-sm">{account.name}</p>
                </div>
                <p className="text-xs text-slate-400 mb-0.5">Balance</p>
                <p className="font-bold text-lg text-slate-800">₹{account.balance.toLocaleString()}</p>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* AI Insights */}
      <InsightsCard />

      <button 
        onClick={() => setShowSalaryModal(true)}
        className="w-full bg-[#5c73df]/10 text-[#5c73df] border border-[#5c73df]/20 p-4 rounded-2xl shadow-sm flex justify-center items-center gap-3 active:scale-95 transition-transform mb-8 font-bold"
      >
        Update This Month's Salary
      </button>

      {/* Expense List */}
      <div>
        <h3 className="text-lg font-bold text-slate-800 mb-4">Expense List</h3>
        
        {groupedExpenses.length === 0 && summary && (
          <p className="text-center text-slate-400 py-10">No recent expenses.</p>
        )}

        <div className="space-y-6">
          {groupedExpenses.map((group, groupIdx) => (
            <div key={group.date}>
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-bold text-slate-800 text-sm">{formatDateHeader(group.date)}</h4>
                <p className="font-bold text-slate-800 text-sm">
                  -₹{group.items.reduce((sum, item) => sum + item.amount, 0).toLocaleString()}
                </p>
              </div>
              
              <div className="space-y-1">
                {group.items.map((expense: any, idx: number) => {
                  const Icon = CategoryIconMap[expense.category] || FiShoppingBag;
                  const color = CategoryColorMap[expense.category] || '#94a3b8';
                  
                  return (
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: (groupIdx * 0.1) + (idx * 0.05) }}
                      key={expense._id}
                      className="bg-white rounded-2xl p-3 flex items-center justify-between border border-slate-50/50"
                    >
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-12 h-12 rounded-2xl flex items-center justify-center opacity-90"
                          style={{ backgroundColor: `${color}15`, color: color }}
                        >
                          <Icon size={20} strokeWidth={2.5} />
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 text-[15px]">{expense.category}</p>
                          <p className="text-xs text-slate-400 font-medium truncate max-w-[140px]">{expense.remark || 'Expense'}</p>
                        </div>
                      </div>
                      <p className="font-bold text-[#f43f5e]">
                        -₹{expense.amount.toLocaleString()}
                      </p>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
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
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none font-semibold text-slate-800 focus:border-[#5c73df] text-2xl h-16"
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
                    className="flex-1 py-4 font-bold text-white bg-[#5c73df] rounded-2xl active:scale-95 transition-transform disabled:opacity-70"
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
