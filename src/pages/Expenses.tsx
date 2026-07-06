import { useEffect, useState, useCallback } from 'react';
import api from '../services/api';
import { format } from 'date-fns';
import { FiSearch, FiCreditCard, FiEdit2, FiTrash2, FiX, FiCheck } from 'react-icons/fi';
import { motion, useMotionValue, useTransform, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import CalendarExpenseView from '../components/CalendarExpenseView';

interface EditExpense {
  _id: string;
  amount: number;
  category: string;
  remark: string;
  date: string;
  paymentMethod: string;
}

const CATEGORIES = ['Food', 'Fuel', 'Travel', 'Medical', 'Shopping', 'Bills', 'Entertainment', 'Investment', 'Education', 'Subscription', 'Others'];

const SwipeableExpenseCard = ({ expense, onDelete, onEdit }: { expense: any; onDelete: (id: string) => void; onEdit: (expense: any) => void }) => {
  const x = useMotionValue(0);
  const actionsOpacity = useTransform(x, [-120, -60], [1, 0]);
  const actionsScale = useTransform(x, [-120, -60], [1, 0.8]);

  return (
    <div className="relative overflow-hidden rounded-2xl">
      {/* Action Buttons (behind the card) */}
      <motion.div
        style={{ opacity: actionsOpacity, scale: actionsScale }}
        className="absolute right-0 top-0 bottom-0 flex items-center gap-2 pr-3"
      >
        <button
          onClick={() => onEdit(expense)}
          className="bg-blue-500 text-white p-3 rounded-xl shadow-lg active:scale-90 transition-transform"
        >
          <FiEdit2 size={18} />
        </button>
        <button
          onClick={() => onDelete(expense._id)}
          className="bg-red-500 text-white p-3 rounded-xl shadow-lg active:scale-90 transition-transform"
        >
          <FiTrash2 size={18} />
        </button>
      </motion.div>

      {/* Swipeable Card */}
      <motion.div
        style={{ x }}
        drag="x"
        dragConstraints={{ left: -120, right: 0 }}
        dragElastic={0.1}
        onDragEnd={(_, info) => {
          if (info.offset.x < -100) {
            // Keep open at -120
          } else {
            x.set(0);
          }
        }}
        className="bg-white p-4 flex justify-between items-center shadow-sm border border-slate-50 relative z-10 cursor-grab active:cursor-grabbing"
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
    </div>
  );
};

const Expenses = () => {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [filteredByCalendar, setFilteredByCalendar] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editExpense, setEditExpense] = useState<EditExpense | null>(null);
  const [editLoading, setEditLoading] = useState(false);

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

  useEffect(() => {
    fetchExpenses();
  }, []);

  const handleFilteredExpenses = useCallback((filtered: any[]) => {
    setFilteredByCalendar(filtered);
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/expenses/${id}`);
      setExpenses(prev => prev.filter(e => e._id !== id));
      toast.success('Expense deleted');
    } catch (error) {
      toast.error('Failed to delete expense');
    }
  };

  const handleEditSave = async () => {
    if (!editExpense) return;
    setEditLoading(true);
    try {
      const { data } = await api.put(`/expenses/${editExpense._id}`, {
        amount: editExpense.amount,
        category: editExpense.category,
        remark: editExpense.remark,
        date: editExpense.date,
        paymentMethod: editExpense.paymentMethod,
      });
      setExpenses(prev => prev.map(e => e._id === data._id ? data : e));
      setEditExpense(null);
      toast.success('Expense updated');
    } catch (error) {
      toast.error('Failed to update expense');
    } finally {
      setEditLoading(false);
    }
  };

  const displayExpenses = filteredByCalendar.filter(e =>
    e.remark.toLowerCase().includes(search.toLowerCase()) ||
    e.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="pt-12 px-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800">All Expenses</h1>
      </div>

      <div className="relative mb-5">
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

      <CalendarExpenseView expenses={expenses} onFilteredExpenses={handleFilteredExpenses} />

      <p className="text-xs text-slate-400 mb-3 px-1">← Swipe left on any expense to edit or delete</p>

      {loading ? (
        <div className="space-y-4 animate-pulse">
          {[1,2,3,4,5].map(i => <div key={i} className="h-20 bg-slate-200 rounded-2xl"></div>)}
        </div>
      ) : (
        <div className="space-y-3">
          {displayExpenses.length === 0 ? (
            <p className="text-center text-slate-400 py-10">No expenses found for this period.</p>
          ) : (
            displayExpenses.map((expense) => (
              <SwipeableExpenseCard
                key={expense._id}
                expense={expense}
                onDelete={handleDelete}
                onEdit={(e) => setEditExpense({
                  _id: e._id,
                  amount: e.amount,
                  category: e.category,
                  remark: e.remark,
                  date: format(new Date(e.date), 'yyyy-MM-dd'),
                  paymentMethod: e.paymentMethod || 'Cash',
                })}
              />
            ))
          )}
        </div>
      )}

      {/* Edit Modal */}
      <AnimatePresence>
        {editExpense && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="bg-white rounded-t-[2rem] p-6 w-full max-w-lg shadow-2xl"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-slate-800">Edit Expense</h2>
                <button onClick={() => setEditExpense(null)} className="p-2 bg-slate-100 rounded-full">
                  <FiX size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Amount (₹)</label>
                  <input
                    type="number"
                    value={editExpense.amount}
                    onChange={(e) => setEditExpense({ ...editExpense, amount: Number(e.target.value) })}
                    className="input-field h-14 text-xl font-bold"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Category</label>
                  <select
                    value={editExpense.category}
                    onChange={(e) => setEditExpense({ ...editExpense, category: e.target.value })}
                    className="input-field h-14"
                  >
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Remark</label>
                  <input
                    type="text"
                    value={editExpense.remark}
                    onChange={(e) => setEditExpense({ ...editExpense, remark: e.target.value })}
                    className="input-field h-14"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Date</label>
                  <input
                    type="date"
                    value={editExpense.date}
                    onChange={(e) => setEditExpense({ ...editExpense, date: e.target.value })}
                    className="input-field h-14"
                  />
                </div>
              </div>

              <button
                onClick={handleEditSave}
                disabled={editLoading}
                className="w-full mt-6 bg-primary text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 active:scale-95 transition-transform disabled:opacity-70"
              >
                <FiCheck size={20} />
                {editLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Expenses;
