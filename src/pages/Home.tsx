import { useContext, useEffect, useState, useMemo } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { Link } from 'react-router-dom';
import { format, isToday, isYesterday, parseISO } from 'date-fns';
import { motion } from 'framer-motion';
import { FiSearch, FiChevronDown, FiShoppingBag, FiCoffee, FiTrendingDown, FiSmartphone, FiHome, FiHeart, FiMoreHorizontal } from 'react-icons/fi';

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

const Home = () => {
  const { user } = useContext(AuthContext);
  const [summary, setSummary] = useState<any>(null);
  const [expenses, setExpenses] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [summaryRes, expensesRes] = await Promise.all([
          api.get('/reports/summary'),
          api.get('/expenses?limit=20') // Fetch recent expenses
        ]);
        setSummary(summaryRes.data);
        setExpenses(expensesRes.data.expenses || []);
      } catch (error) {
        console.error('Failed to fetch dashboard data', error);
      }
    };
    fetchData();
  }, []);

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
        <button className="p-2 text-slate-800">
          <FiSearch size={22} strokeWidth={2.5} />
        </button>
      </div>

      {/* Profile & Filter */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-slate-200 rounded-full overflow-hidden border-2 border-white shadow-sm">
            <img src={`https://ui-avatars.com/api/?name=${user?.name}&background=random`} alt="Avatar" className="w-full h-full object-cover" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Morning</p>
            <p className="text-sm font-bold text-slate-800">{user?.name?.split(' ')[0]}</p>
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
        <div className="relative z-10 w-[60%]">
          <p className="text-white/80 font-medium mb-1">Expense total</p>
          <h2 className="text-4xl font-bold mb-3 tracking-tight">
            <span className="text-2xl mr-1">₹</span>
            {summary ? summary.monthlyExpense.toLocaleString() : '---'}
          </h2>
          <div className="inline-block bg-[#ff6b6b] text-white text-[10px] font-bold px-2.5 py-1 rounded-md">
            +₹240 than last month
          </div>
        </div>
        
        {/* 3D Illustration */}
        <div className="absolute -right-4 top-1/2 -translate-y-1/2 w-[160px] h-[160px] pointer-events-none">
          <img src="/dashboard_pie.png" alt="3D Pie Chart" className="w-full h-full object-contain drop-shadow-2xl scale-125 translate-x-4" />
        </div>
      </motion.div>

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
    </div>
  );
};

export default Home;
