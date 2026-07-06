import { useEffect, useState } from 'react';
import api from '../services/api';
import { format } from 'date-fns';
import { FiSearch, FiFilter, FiCreditCard } from 'react-icons/fi';
import { motion } from 'framer-motion';

const Expenses = () => {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        const { data } = await api.get('/expenses');
        setExpenses(data);
      } catch (error) {
        console.error('Failed to fetch expenses', error);
      } finally {
        setLoading(false);
      }
    };
    fetchExpenses();
  }, []);

  const filtered = expenses.filter(e => 
    e.remark.toLowerCase().includes(search.toLowerCase()) ||
    e.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="pt-12 px-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800">All Expenses</h1>
        <button className="bg-slate-100 p-3 rounded-full text-slate-600">
          <FiFilter size={20} />
        </button>
      </div>

      <div className="relative mb-8">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
          <FiSearch />
        </div>
        <input
          type="text"
          placeholder="Search expenses..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-field pl-12 h-14"
        />
      </div>

      {loading ? (
        <div className="space-y-4 animate-pulse">
          {[1,2,3,4,5].map(i => <div key={i} className="h-20 bg-slate-200 rounded-2xl"></div>)}
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.length === 0 ? (
            <p className="text-center text-slate-400 py-10">No expenses found.</p>
          ) : (
            filtered.map((expense, i) => (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                key={expense._id} 
                className="bg-white p-4 rounded-2xl flex justify-between items-center shadow-sm border border-slate-50"
              >
                <div className="flex items-center gap-4">
                  <div className="bg-expense/10 p-4 rounded-xl text-expense">
                    <FiCreditCard size={20} />
                  </div>
                  <div>
                    <p className="font-bold text-slate-800">{expense.category}</p>
                    <p className="text-xs text-slate-400">{expense.remark}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-expense text-lg">-₹{expense.amount.toLocaleString()}</p>
                  <p className="text-[10px] text-slate-400">{format(new Date(expense.date), 'dd MMM yyyy')}</p>
                </div>
              </motion.div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default Expenses;
