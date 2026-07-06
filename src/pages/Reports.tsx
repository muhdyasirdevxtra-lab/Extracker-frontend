import { useEffect, useState } from 'react';
import api from '../services/api';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { motion } from 'framer-motion';
import { FiChevronDown, FiMoreHorizontal } from 'react-icons/fi';

const PIE_COLORS = ['#e4769c', '#5c73df', '#f3b55a', '#4ade80', '#a78bfa', '#f43f5e', '#94a3b8'];

const Reports = () => {
  const [summary, setSummary] = useState<any>(null);
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [summaryRes, chartsRes] = await Promise.all([
          api.get('/reports/summary'),
          api.get('/reports/charts')
        ]);
        setSummary(summaryRes.data);
        
        const cData = chartsRes.data || [];
        setChartData(cData.sort((a: any, b: any) => b.value - a.value));
      } catch (error) {
        console.error('Failed to fetch report data', error);
      }
    };
    fetchData();
  }, []);

  const monthlyExpense = summary?.monthlyExpense || 0;
  const monthlyLimit = summary?.limits?.monthly || 4000;
  const limitPercent = Math.min((monthlyExpense / monthlyLimit) * 100, 100);

  const todayExpense = summary?.todayExpense || 0;
  const dailyLimit = summary?.limits?.daily || 200;
  const dailyPercent = Math.min((todayExpense / dailyLimit) * 100, 100);

  return (
    <div className="pt-12 px-6 bg-[#f8f9fd] min-h-screen font-sans pb-24">
      {/* App Bar */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold text-slate-800 tracking-tight">Statistic</h1>
        <div className="flex items-center gap-1 bg-white px-3 py-1.5 rounded-lg border border-slate-100 shadow-sm text-xs font-bold text-slate-700">
          This cycle <FiChevronDown size={14} />
        </div>
      </div>

      {/* Monthly Limit Card */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-[#6881f3] to-[#4b61c9] rounded-[1.25rem] p-5 text-white mb-4 shadow-[0_15px_30px_rgba(92,115,223,0.3)]"
      >
        <div className="flex justify-between items-start mb-2">
          <p className="text-white/80 font-medium text-sm">Monthly expense</p>
          <div className="w-8 h-5 bg-white/20 rounded-full flex items-center justify-center">
            <FiMoreHorizontal size={14} />
          </div>
        </div>
        <div className="flex items-end gap-2 mb-4">
          <h2 className="text-3xl font-bold tracking-tight">
            ₹{monthlyExpense.toLocaleString()}
          </h2>
          <p className="text-white/60 text-xs font-medium pb-1">
            / ₹{monthlyLimit.toLocaleString()}
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

      {/* Daily Limit Tracker */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-[1.25rem] p-5 border border-slate-100 shadow-sm mb-8"
      >
        <div className="flex justify-between items-start mb-2">
          <p className="text-slate-600 font-bold text-sm">Today's expense</p>
        </div>
        <div className="flex items-end gap-2 mb-4">
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">
            ₹{todayExpense.toLocaleString()}
          </h2>
          <p className="text-slate-400 text-xs font-bold pb-1">
            / ₹{dailyLimit.toLocaleString()}
          </p>
        </div>
        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${dailyPercent}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className={`h-full rounded-full ${dailyPercent >= 100 ? 'bg-[#ff6b6b]' : 'bg-[#4ade80]'}`}
          />
        </div>
      </motion.div>

      {/* Category Breakdown Donut Chart */}
      <div className="mb-8">
        <h3 className="text-lg font-bold text-slate-800 leading-tight mb-4">Category Breakdown</h3>
        
        {chartData.length > 0 ? (
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col items-center">
            <div className="w-48 h-48 mb-6">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip 
                    formatter={(value: any) => `₹${Number(value).toLocaleString()}`}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontSize: '12px', fontWeight: 'bold' }}
                  />
                  <Pie
                    data={chartData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={85}
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
            
            <div className="w-full grid grid-cols-2 gap-y-4 gap-x-4">
              {chartData.map((cat: any, i: number) => (
                <div key={cat.name} className="flex items-center gap-2">
                  <div className="w-3.5 h-3.5 rounded-full shrink-0" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }}></div>
                  <div className="flex-1 overflow-hidden">
                    <p className="text-[11px] text-slate-500 font-bold truncate">{cat.name}</p>
                    <p className="text-[13px] text-slate-800 font-bold">₹{cat.value.toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-slate-400 text-sm text-center py-6 bg-white rounded-2xl border border-slate-100 shadow-sm">No expenses this cycle</p>
        )}
      </div>

    </div>
  );
};

export default Reports;
