import { useContext, useEffect, useState, useMemo } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import { format, isToday, isYesterday, parseISO } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { 
  BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie
} from 'recharts';
import { 
  FiSearch, FiChevronDown, FiShoppingBag, FiCoffee, 
  FiTrendingDown, FiSmartphone, FiHome, FiHeart, FiMoreHorizontal,
  FiCreditCard, FiLock, FiCalendar
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

const PIE_COLORS = ['#e4769c', '#5c73df', '#f3b55a', '#4ade80', '#a78bfa', '#f43f5e', '#94a3b8'];

const IconMap: Record<string, any> = {
  FiCreditCard,
  FiSmartphone,
  FiDollarSign: FiSmartphone,
};

const Home = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [summary, setSummary] = useState<any>(null);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [lastMonthTotal, setLastMonthTotal] = useState(0);
  const [salaryStatus, setSalaryStatus] = useState<any>(null);
  const [trendData, setTrendData] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  
  // Salary Modal State
  const [showSalaryModal, setShowSalaryModal] = useState(false);
  const [salaryInput, setSalaryInput] = useState('');
  const [submittingSalary, setSubmittingSalary] = useState(false);

  const fetchData = async () => {
    try {
      const [summaryRes, expensesRes, insightsRes, statusRes, trendRes, chartsRes] = await Promise.all([
        api.get('/reports/summary'),
        api.get('/expenses'),
        api.get('/reports/insights').catch(() => ({ data: { currentMonth: [], lastMonth: [] } })),
        api.get('/salary/status').catch(() => ({ data: { isSalaryDay: false, today: new Date().getDate() } })),
        api.get('/reports/trend').catch(() => ({ data: [] })),
        api.get('/reports/charts').catch(() => ({ data: [] }))
      ]);
      setSummary(summaryRes.data);
      const allExpenses = Array.isArray(expensesRes.data) ? expensesRes.data : (expensesRes.data.expenses || []);
      setExpenses(allExpenses.slice(0, 20));
      
      const lastTotal = (insightsRes.data.lastMonth || []).reduce((s: number, c: any) => s + c.total, 0);
      setLastMonthTotal(lastTotal);
      setSalaryStatus(statusRes.data);

      // Trend data for bar chart
      const mappedTrend = (trendRes.data || []).map((t: any) => ({
        name: t.month,
        value: t.total
      }));
      setTrendData(mappedTrend);

      // Chart data for pie
      setChartData(chartsRes.data || []);
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
      const now = new Date();
      await api.post('/salary', { amount: Number(salaryInput), month: now.getMonth() + 1, year: now.getFullYear() });
      toast.success('Salary updated successfully!');
      setShowSalaryModal(false);
      setSalaryInput('');
      fetchData();
    } catch (error: any) {
      const msg = error?.response?.data?.message || 'Failed to update salary';
      toast.error(msg);
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

  const isSalaryDay = salaryStatus?.isSalaryDay || false;

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
              <p className="text-white/60 text-[10px] uppercase tracking-wider">Remaining</p>
              <p className={`font-semibold text-sm ${(summary?.remainingBalance || 0) < 0 ? 'text-[#ff6b6b]' : ''}`}>
                ₹{(summary?.remainingBalance || 0).toLocaleString()}
              </p>
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

      {/* Accounts List */}
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

      {/* Spending Trend Chart */}
      {trendData.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm mb-6"
        >
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Spending Trend</h3>
              <p className="text-xs text-slate-400">Last 6 months</p>
            </div>
          </div>
          <div className="h-36 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trendData} margin={{ top: 5, right: 0, left: -25, bottom: 0 }}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }} dy={8} />
                <Tooltip
                  cursor={{ fill: 'rgba(0,0,0,0.02)' }}
                  formatter={(value: any) => `₹${Number(value).toLocaleString()}`}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontSize: '12px' }}
                />
                <Bar dataKey="value" radius={[6, 6, 6, 6]} barSize={28}>
                  {trendData.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === trendData.length - 1 ? '#5c73df' : '#e2e8f0'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      )}

      {/* Category Breakdown Mini Chart */}
      {chartData.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm mb-6"
        >
          <h3 className="font-bold text-slate-800 text-sm mb-3">Category Breakdown</h3>
          <div className="flex items-center gap-4">
            <div className="w-24 h-24">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={22}
                    outerRadius={40}
                    paddingAngle={3}
                    strokeWidth={0}
                  >
                    {chartData.map((_entry: any, index: number) => (
                      <Cell key={`pie-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 grid grid-cols-2 gap-y-1.5 gap-x-3">
              {chartData.slice(0, 6).map((cat: any, i: number) => (
                <div key={cat.name} className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }}></div>
                  <span className="text-[11px] text-slate-600 font-medium truncate">{cat.name}</span>
                  <span className="text-[10px] text-slate-400 font-bold ml-auto">₹{cat.value.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Salary Update Button */}
      {isSalaryDay ? (
        <button 
          onClick={() => setShowSalaryModal(true)}
          className="w-full bg-[#5c73df]/10 text-[#5c73df] border border-[#5c73df]/20 p-4 rounded-2xl shadow-sm flex justify-center items-center gap-3 active:scale-95 transition-transform mb-8 font-bold"
        >
          <FiCalendar size={18} />
          Update This Month's Salary
        </button>
      ) : (
        <div className="w-full bg-slate-50 text-slate-400 border border-slate-100 p-4 rounded-2xl flex justify-center items-center gap-3 mb-8 font-bold text-sm">
          <FiLock size={16} />
          Salary updates on the 6th
          {salaryStatus?.today && salaryStatus.today < 6 && (
            <span className="text-xs text-slate-300 ml-1">({6 - salaryStatus.today} days left)</span>
          )}
        </div>
      )}

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
                  -₹{group.items.reduce((sum: number, item: any) => sum + item.amount, 0).toLocaleString()}
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

      {/* Salary Modal */}
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
