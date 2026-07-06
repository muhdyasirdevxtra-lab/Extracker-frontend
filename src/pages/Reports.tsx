import { useEffect, useState } from 'react';
import api from '../services/api';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, Tooltip } from 'recharts';

const COLORS = ['#ef4444', '#3b82f6', '#f97316', '#22c55e', '#a855f7', '#ec4899', '#14b8a6', '#f59e0b', '#6366f1', '#64748b'];

const Reports = () => {
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const { data } = await api.get('/reports/charts');
        setChartData(data);
      } catch (error) {
        console.error('Failed to fetch reports', error);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  return (
    <div className="pt-12 px-6">
      <h1 className="text-2xl font-bold text-slate-800 mb-8">Analytics</h1>

      {loading ? (
        <div className="animate-pulse h-64 bg-slate-200 rounded-3xl"></div>
      ) : (
        <div className="space-y-8">
          <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-50">
            <h3 className="font-bold text-slate-700 mb-6 text-center">Expense by Category</h3>
            <div className="h-64">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {chartData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `₹${value}`} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-400">No data for this month</div>
              )}
            </div>
            {/* Legend */}
            <div className="flex flex-wrap gap-3 mt-4 justify-center">
              {chartData.map((_entry, index) => (
                <div key={_entry.name} className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                  <span className="text-xs text-slate-600">{_entry.name}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-50">
            <h3 className="font-bold text-slate-700 mb-6 text-center">Top Categories</h3>
            <div className="h-64">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <XAxis dataKey="name" fontSize={10} tickMargin={10} />
                    <Tooltip cursor={{fill: 'transparent'}} formatter={(value) => `₹${value}`} />
                    <Bar dataKey="value" fill="#103F60" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-400">No data</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
