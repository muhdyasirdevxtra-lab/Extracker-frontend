import { useEffect, useState } from 'react';
import api from '../services/api';
import { motion } from 'framer-motion';
import { FiZap, FiTrendingUp, FiTrendingDown, FiAward, FiAlertCircle } from 'react-icons/fi';

interface Insight {
  icon: string;
  text: string;
  type: 'increase' | 'decrease' | 'tip' | 'top';
  color: string;
}

const INSIGHT_STYLES = {
  increase: { bg: 'bg-red-50', border: 'border-red-100', iconColor: 'text-red-500' },
  decrease: { bg: 'bg-green-50', border: 'border-green-100', iconColor: 'text-green-500' },
  tip: { bg: 'bg-amber-50', border: 'border-amber-100', iconColor: 'text-amber-500' },
  top: { bg: 'bg-blue-50', border: 'border-blue-100', iconColor: 'text-blue-500' },
};

const InsightIcon = ({ type }: { type: string }) => {
  switch (type) {
    case 'increase': return <FiTrendingUp size={18} />;
    case 'decrease': return <FiTrendingDown size={18} />;
    case 'tip': return <FiAlertCircle size={18} />;
    case 'top': return <FiAward size={18} />;
    default: return <FiZap size={18} />;
  }
};

const InsightsCard = () => {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        const { data } = await api.get('/reports/insights');
        const generated = generateInsights(data.currentMonth, data.lastMonth);
        setInsights(generated);
      } catch (error) {
        console.error('Failed to fetch insights', error);
      } finally {
        setLoading(false);
      }
    };
    fetchInsights();
  }, []);

  const generateInsights = (
    current: { category: string; total: number }[],
    last: { category: string; total: number }[]
  ): Insight[] => {
    const result: Insight[] = [];

    // Find top category this month
    if (current.length > 0) {
      const sorted = [...current].sort((a, b) => b.total - a.total);
      result.push({
        icon: '⚡',
        text: `Your top category this month is ${sorted[0].category} (₹${sorted[0].total.toLocaleString()})`,
        type: 'top',
        color: 'blue',
      });
    }

    // Compare categories between months
    const lastMap = new Map(last.map(l => [l.category, l.total]));

    current.forEach(curr => {
      const lastTotal = lastMap.get(curr.category) || 0;
      if (lastTotal > 0) {
        const change = ((curr.total - lastTotal) / lastTotal) * 100;
        if (change > 20) {
          result.push({
            icon: '🔴',
            text: `You spent ${Math.round(change)}% more on ${curr.category} compared to last month`,
            type: 'increase',
            color: 'red',
          });
        } else if (change < -15) {
          result.push({
            icon: '🟢',
            text: `Great! Your ${curr.category} expenses dropped by ${Math.abs(Math.round(change))}%`,
            type: 'decrease',
            color: 'green',
          });
        }
      }
    });

    // Add a tip
    if (current.length > 0) {
      const sorted = [...current].sort((a, b) => b.total - a.total);
      const topCat = sorted[0];
      const suggestedLimit = Math.round(topCat.total * 0.8 / 100) * 100;
      result.push({
        icon: '💡',
        text: `Tip: Try to keep ${topCat.category} under ₹${suggestedLimit.toLocaleString()} next month`,
        type: 'tip',
        color: 'amber',
      });
    }

    // Total comparison
    const totalCurrent = current.reduce((s, c) => s + c.total, 0);
    const totalLast = last.reduce((s, l) => s + l.total, 0);
    if (totalLast > 0) {
      const totalChange = ((totalCurrent - totalLast) / totalLast) * 100;
      if (totalChange > 0) {
        result.push({
          icon: '📊',
          text: `Overall spending is up ${Math.round(totalChange)}% this month (₹${totalCurrent.toLocaleString()} vs ₹${totalLast.toLocaleString()})`,
          type: 'increase',
          color: 'red',
        });
      } else {
        result.push({
          icon: '🎉',
          text: `You're spending ${Math.abs(Math.round(totalChange))}% less this month! Keep it up!`,
          type: 'decrease',
          color: 'green',
        });
      }
    }

    return result.length > 0 ? result : [{
      icon: '📝',
      text: 'Start adding expenses to see smart insights here!',
      type: 'tip',
      color: 'amber',
    }];
  };

  if (loading) {
    return (
      <div className="mb-6">
        <div className="flex gap-3 overflow-hidden">
          {[1, 2].map(i => (
            <div key={i} className="min-w-[280px] h-20 bg-slate-200 rounded-2xl animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-3">
        <FiZap className="text-amber-500" size={16} />
        <h3 className="font-bold text-sm text-slate-700">AI Insights</h3>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-6 px-6">
        {insights.map((insight, i) => {
          const style = INSIGHT_STYLES[insight.type];
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`min-w-[280px] ${style.bg} border ${style.border} rounded-2xl p-4 flex items-start gap-3`}
            >
              <div className={`mt-0.5 ${style.iconColor}`}>
                <InsightIcon type={insight.type} />
              </div>
              <p className="text-sm text-slate-700 leading-relaxed">{insight.text}</p>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default InsightsCard;
