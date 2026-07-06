import { useEffect, useState } from 'react';
import api from '../services/api';
import {
  BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell
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
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [summaryRes, trendRes, chartsRes] = await Promise.all([
          api.get('/reports/summary'),
          api.get('/reports/trend'),
          api.get('/reports/charts')
        ]);
        setSummary(summaryRes.data);
        
        // Map trend data to chart format
        const mappedTrend = trendRes.data.map((t: any) => ({
          name: t.month,
          value: t.total
        }));
        setTrendData(mappedTrend);

        // Map chart data to categories with percentages
        const chartData = chartsRes.data || [];
        const totalAmount = chartData.reduce((acc: number, curr: any) => acc + curr.value, 0);
        
        const mappedCategories = chartData.map((c: any) => ({
          name: c.name,
          amount: c.value,
          percent: totalAmount > 0 ? Math.round((c.value / totalAmount) * 100) : 0,
          color: CategoryColorMap[c.name] || '#94a3b8'
        })).sort((a: any, b: any) => b.amount - a.amount);

        setCategories(mappedCategories);
      } catch (error) {
        console.error('Failed to fetch report data', error);
      }
    };
    fetchData();
  }, []);

  const monthlyExpense = summary?.monthlyExpense || 0;
  const monthlyLimit = summary?.limits?.monthly || 4000;
  const limitPercent = Math.min((monthlyExpense / monthlyLimit) * 100, 100);

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
            <p className="text-sm font-bold text-slate-400">Monthly Trend</p>
          </div>
          <div className="flex items-center gap-1 bg-white px-3 py-1.5 rounded-lg border border-slate-100 text-xs font-bold text-slate-700">
            Months <FiChevronDown size={14} />
          </div>
        </div>

        <div className="h-48 w-full mt-6">
          {trendData.length > 0 ? (
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
                    <Cell key={`cell-${index}`} fill={entry.value > monthlyLimit ? '#ff6b6b' : '#4dc5c4'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full w-full flex items-center justify-center text-slate-400 text-sm">
              No trend data available
            </div>
          )}
        </div>
        {/* Red limit line mockup */}
        <div className="relative -mt-[110px] mb-[110px] w-full h-[1px] bg-[#ff6b6b] z-10 flex items-center">
          <div className="bg-[#ff6b6b] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full absolute -left-2 -top-2">
            ₹{monthlyLimit}
          </div>
        </div>
      </div>

      {/* Spending Details */}
      <div>
        <h3 className="text-lg font-bold text-slate-800 leading-tight">Spending Details</h3>
        <p className="text-xs font-medium text-slate-400 mb-4">Your expenses are divided into {categories.length} categories</p>
        
        {categories.length > 0 ? (
          <>
            {/* Segmented Progress Bar */}
            <div className="h-2.5 w-full bg-slate-100 rounded-full flex overflow-hidden mb-2">
              {categories.map(cat => (
                <div key={cat.name} style={{ width: `${Math.max(cat.percent, 2)}%`, backgroundColor: cat.color }} className="h-full" />
              ))}
            </div>
            <div className="flex w-full text-[10px] font-bold text-slate-400 mb-6">
              {categories.map(cat => (
                <div key={cat.name} style={{ width: `${Math.max(cat.percent, 2)}%` }} className="text-center truncate px-0.5">
                  {cat.percent}%
                </div>
              ))}
            </div>

            {/* Category Cards */}
            <div className="grid grid-cols-2 gap-3">
              {categories.map((cat, i) => {
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
                      <p className="font-bold text-slate-400 text-xs truncate">-₹{cat.amount.toLocaleString()}</p>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </>
        ) : (
          <p className="text-slate-400 text-sm text-center py-6">No expenses this month</p>
        )}
      </div>
    </div>
  );
};

export default Reports;
