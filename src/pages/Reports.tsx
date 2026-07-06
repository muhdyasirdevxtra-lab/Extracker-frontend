import { useEffect, useState } from 'react';
import api from '../services/api';
import {
  BarChart, Bar, XAxis, Tooltip, ResponsiveContainer
} from 'recharts';
import { motion } from 'framer-motion';
import { FiChevronDown, FiShoppingBag, FiCoffee, FiTrendingDown, FiSmartphone, FiHome, FiHeart, FiMoreHorizontal } from 'react-icons/fi';

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

const Reports = () => {
  const [summary, setSummary] = useState<any>(null);
  const [trendData, setTrendData] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [summaryRes, trendRes] = await Promise.all([
          api.get('/reports/summary'),
          api.get('/reports/trend')
        ]);
        setSummary(summaryRes.data);
        
        // Mock weekly data based on trend for the UI
        const mockWeekly = [
          { name: 'W1', value: 640 },
          { name: 'W2', value: 850 },
          { name: 'W3', value: 622 },
          { name: 'W4', value: 960 }, // over limit
          { name: 'W5', value: 732 }
        ];
        setTrendData(mockWeekly);
      } catch (error) {
        console.error('Failed to fetch report data', error);
      }
    };
    fetchData();
  }, []);

  const monthlyExpense = summary?.monthlyExpense || 0;
  const monthlyLimit = summary?.limits?.monthly || 4000;
  const limitPercent = Math.min((monthlyExpense / monthlyLimit) * 100, 100);

  // Mock category breakdown for segmented bar
  const categories = [
    { name: 'Shopping', percent: 25, color: '#a78bfa', amount: 1190 },
    { name: 'Transport', percent: 15, color: '#e4769c', amount: 867 },
    { name: 'Food', percent: 10, color: '#f3b55a', amount: 450 },
    { name: 'Bills', percent: 5, color: '#4ade80', amount: 200 },
    { name: 'Others', percent: 45, color: '#94a3b8', amount: 1027 },
  ];

  return (
    <div className="pt-12 px-6 bg-[#f8f9fd] min-h-screen font-sans pb-24">
      {/* App Bar */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold text-slate-800 tracking-tight">Statistic</h1>
        <div className="flex items-center gap-1 bg-white px-3 py-1.5 rounded-lg border border-slate-100 shadow-sm text-xs font-bold text-slate-700">
          This month <FiChevronDown size={14} />
        </div>
      </div>

      {/* Limit Card */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-[#6881f3] to-[#4b61c9] rounded-[1.25rem] p-5 text-white mb-8 shadow-[0_15px_30px_rgba(92,115,223,0.3)]"
      >
        <div className="flex justify-between items-start mb-2">
          <p className="text-white/80 font-medium text-sm">Total expense</p>
          <div className="w-8 h-5 bg-white/20 rounded-full flex items-center justify-center">
            <FiMoreHorizontal size={14} />
          </div>
        </div>
        <div className="flex items-end gap-2 mb-4">
          <h2 className="text-3xl font-bold tracking-tight">
            ₹{monthlyExpense.toLocaleString()}
          </h2>
          <p className="text-white/60 text-xs font-medium pb-1">
            / ₹{monthlyLimit.toLocaleString()} per month
          </p>
        </div>
        <div className="h-1.5 w-full bg-white/20 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${limitPercent}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className={`h-full rounded-full ${limitPercent >= 100 ? 'bg-[#ff6b6b]' : 'bg-[#f3b55a]'}`}
          />
        </div>
      </motion.div>

      {/* Expense Breakdown Chart */}
      <div className="mb-8">
        <div className="flex justify-between items-end mb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-800 leading-tight">Expense Breakdown</h3>
            <p className="text-sm font-bold text-slate-400">Limit ₹900 / week</p>
          </div>
          <div className="flex items-center gap-1 bg-white px-3 py-1.5 rounded-lg border border-slate-100 text-xs font-bold text-slate-700">
            Week <FiChevronDown size={14} />
          </div>
        </div>

        <div className="h-48 w-full mt-6">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={trendData} margin={{ top: 15, right: 0, left: -25, bottom: 0 }}>
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }} dy={10} />
              <Tooltip
                cursor={{ fill: 'rgba(0,0,0,0.02)' }}
                formatter={(value: any) => `₹${Number(value).toLocaleString()}`}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
              />
              <Bar 
                dataKey="value" 
                radius={[4, 4, 4, 4]} 
                barSize={32}
              >
                {trendData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.value > 900 ? '#ff6b6b' : '#4dc5c4'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        {/* Red limit line mockup */}
        <div className="relative -mt-[110px] mb-[110px] w-full h-[1px] bg-[#ff6b6b] z-10 flex items-center">
          <div className="bg-[#ff6b6b] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full absolute -left-2 -top-2">
            ₹900
          </div>
        </div>
      </div>

      {/* Spending Details */}
      <div>
        <h3 className="text-lg font-bold text-slate-800 leading-tight">Spending Details</h3>
        <p className="text-xs font-medium text-slate-400 mb-4">Your expenses are divided into 6 categories</p>
        
        {/* Segmented Progress Bar */}
        <div className="h-2.5 w-full bg-slate-100 rounded-full flex overflow-hidden mb-2">
          {categories.map(cat => (
            <div key={cat.name} style={{ width: `${cat.percent}%`, backgroundColor: cat.color }} className="h-full" />
          ))}
        </div>
        <div className="flex w-full text-[10px] font-bold text-slate-400 mb-6">
          {categories.map(cat => (
            <div key={cat.name} style={{ width: `${cat.percent}%` }} className="text-center truncate px-0.5">
              {cat.percent}%
            </div>
          ))}
        </div>

        {/* Category Cards */}
        <div className="grid grid-cols-2 gap-3">
          {categories.slice(0, 4).map((cat, i) => {
            const Icon = CategoryIconMap[cat.name] || FiShoppingBag;
            return (
              <motion.div
                key={cat.name}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm flex items-center gap-3"
              >
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `${cat.color}15`, color: cat.color }}
                >
                  <Icon size={18} strokeWidth={2.5} />
                </div>
                <div className="overflow-hidden">
                  <p className="font-bold text-slate-700 text-xs truncate">{cat.name}</p>
                  <p className="font-bold text-slate-400 text-xs truncate">-₹{cat.amount}</p>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  );
};

export default Reports;
