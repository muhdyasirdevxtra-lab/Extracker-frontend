import { useEffect, useState } from 'react';
import api from '../services/api';
import {
  PieChart, Pie, Cell, ResponsiveContainer,
  BarChart, Bar, XAxis, Tooltip,
  LineChart, Line, YAxis, CartesianGrid, Area, AreaChart
} from 'recharts';
import { motion } from 'framer-motion';
import { FiTrendingUp, FiPieChart } from 'react-icons/fi';

const COLORS = ['#ef4444', '#3b82f6', '#f97316', '#22c55e', '#a855f7', '#ec4899', '#14b8a6', '#f59e0b', '#6366f1', '#64748b'];

const AnimatedNumber = ({ value }: { value: number }) => {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let start = 0;
    const end = value;
    const duration = 1000;
    const stepTime = 20;
    const steps = duration / stepTime;
    const increment = end / steps;
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setDisplay(end);
        clearInterval(timer);
      } else {
        setDisplay(Math.floor(start));
      }
    }, stepTime);
    return () => clearInterval(timer);
  }, [value]);
  return <span>₹{display.toLocaleString()}</span>;
};

const Reports = () => {
  const [chartData, setChartData] = useState<any[]>([]);
  const [trendData, setTrendData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const [chartsRes, trendRes] = await Promise.all([
          api.get('/reports/charts'),
          api.get('/reports/trend')
        ]);
        setChartData(chartsRes.data);
        setTrendData(trendRes.data);
      } catch (error) {
        console.error('Failed to fetch reports', error);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  const totalMonthly = chartData.reduce((sum, c) => sum + c.value, 0);

  return (
    <div className="pt-12 px-6 pb-8">
      <h1 className="text-2xl font-bold text-slate-800 mb-8">Analytics</h1>

      {loading ? (
        <div className="animate-pulse space-y-6">
          <div className="h-64 bg-slate-200 rounded-3xl"></div>
          <div className="h-64 bg-slate-200 rounded-3xl"></div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Donut Chart with Center Label */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-50"
          >
            <div className="flex items-center gap-2 mb-6">
              <FiPieChart className="text-primary" />
              <h3 className="font-bold text-slate-700">Expense by Category</h3>
            </div>
            <div className="h-64 relative">
              {chartData.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={65}
                        outerRadius={90}
                        paddingAngle={4}
                        dataKey="value"
                        animationBegin={0}
                        animationDuration={1200}
                        animationEasing="ease-out"
                        stroke="none"
                      >
                        {chartData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: number) => `₹${value.toLocaleString()}`}
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  {/* Center Label */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <p className="text-[10px] text-slate-400 uppercase font-medium">Total</p>
                    <p className="text-2xl font-bold text-slate-800">
                      <AnimatedNumber value={totalMonthly} />
                    </p>
                  </div>
                </>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-400">No data for this month</div>
              )}
            </div>
            {/* Legend */}
            <div className="flex flex-wrap gap-3 mt-4 justify-center">
              {chartData.map((entry, index) => (
                <div key={entry.name} className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                  <span className="text-xs text-slate-600">{entry.name}</span>
                  <span className="text-xs text-slate-400">₹{entry.value.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Spending Trend Line Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-50"
          >
            <div className="flex items-center gap-2 mb-6">
              <FiTrendingUp className="text-savings" />
              <h3 className="font-bold text-slate-700">Monthly Spending Trend</h3>
            </div>
            <div className="h-56">
              {trendData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendData}>
                    <defs>
                      <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#103F60" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="#103F60" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="month" fontSize={11} tickMargin={8} stroke="#94a3b8" />
                    <YAxis fontSize={10} stroke="#94a3b8" tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`} />
                    <Tooltip
                      formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Total']}
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                    />
                    <Area
                      type="monotone"
                      dataKey="total"
                      stroke="#103F60"
                      strokeWidth={3}
                      fill="url(#trendGradient)"
                      dot={{ r: 5, fill: '#103F60', strokeWidth: 2, stroke: '#fff' }}
                      activeDot={{ r: 7, fill: '#103F60' }}
                      animationDuration={1500}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-400">Not enough data yet</div>
              )}
            </div>
          </motion.div>

          {/* Top Categories Bar Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-50"
          >
            <h3 className="font-bold text-slate-700 mb-6">Top Categories</h3>
            <div className="h-56">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData.slice(0, 6)}>
                    <XAxis dataKey="name" fontSize={10} tickMargin={10} stroke="#94a3b8" />
                    <Tooltip
                      cursor={{ fill: 'rgba(0,0,0,0.03)' }}
                      formatter={(value: number) => `₹${value.toLocaleString()}`}
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                    />
                    <Bar
                      dataKey="value"
                      radius={[8, 8, 0, 0]}
                      animationDuration={1200}
                    >
                      {chartData.slice(0, 6).map((_, index) => (
                        <Cell key={`bar-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-400">No data</div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Reports;
