import { useState, useMemo } from 'react';
import {
  format,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  addDays,
  addMonths,
  subMonths,
  isSameDay,
  isWithinInterval,
  isSameMonth,
} from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { FiChevronLeft, FiChevronRight, FiCalendar } from 'react-icons/fi';

type ViewMode = 'day' | 'week' | 'month';

interface CalendarExpenseViewProps {
  expenses: any[];
  onFilteredExpenses: (filtered: any[]) => void;
}

const CalendarExpenseView = ({ expenses, onFilteredExpenses }: CalendarExpenseViewProps) => {
  const [viewMode, setViewMode] = useState<ViewMode>('day');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Generate the 7 days of the current week based on selectedDate
  const weekDays = useMemo(() => {
    const start = startOfWeek(selectedDate, { weekStartsOn: 1 }); // Monday start
    return Array.from({ length: 7 }, (_, i) => addDays(start, i));
  }, [selectedDate]);

  // Filter expenses based on viewMode and selectedDate
  const filteredExpenses = useMemo(() => {
    let filtered: any[];

    if (viewMode === 'day') {
      filtered = expenses.filter(e => isSameDay(new Date(e.date), selectedDate));
    } else if (viewMode === 'week') {
      const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
      const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 1 });
      filtered = expenses.filter(e =>
        isWithinInterval(new Date(e.date), { start: weekStart, end: weekEnd })
      );
    } else {
      const monthStart = startOfMonth(currentMonth);
      const monthEnd = endOfMonth(currentMonth);
      filtered = expenses.filter(e =>
        isWithinInterval(new Date(e.date), { start: monthStart, end: monthEnd })
      );
    }

    onFilteredExpenses(filtered);
    return filtered;
  }, [expenses, viewMode, selectedDate, currentMonth, onFilteredExpenses]);

  // Calculate total for the filtered period
  const total = useMemo(() => {
    return filteredExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  }, [filteredExpenses]);

  // Period label
  const periodLabel = useMemo(() => {
    if (viewMode === 'day') return format(selectedDate, 'EEEE, dd MMM yyyy');
    if (viewMode === 'week') {
      const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
      const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 1 });
      return `${format(weekStart, 'dd MMM')} – ${format(weekEnd, 'dd MMM yyyy')}`;
    }
    return format(currentMonth, 'MMMM yyyy');
  }, [viewMode, selectedDate, currentMonth]);

  // Check if a day has expenses
  const dayHasExpenses = (day: Date) => {
    return expenses.some(e => isSameDay(new Date(e.date), day));
  };

  return (
    <div className="mb-6">
      {/* View Mode Tabs */}
      <div className="flex bg-slate-100 rounded-2xl p-1 mb-4">
        {(['day', 'week', 'month'] as ViewMode[]).map(mode => (
          <button
            key={mode}
            onClick={() => setViewMode(mode)}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold capitalize transition-all duration-300 ${
              viewMode === mode
                ? 'bg-gradient-to-r from-primary to-blue-600 text-white shadow-md'
                : 'text-slate-500'
            }`}
          >
            {mode}
          </button>
        ))}
      </div>

      {/* Month Navigator */}
      <div className="flex justify-between items-center mb-3 px-1">
        <button
          onClick={() => {
            setCurrentMonth(prev => subMonths(prev, 1));
            if (viewMode === 'day' || viewMode === 'week') {
              setSelectedDate(prev => addDays(startOfMonth(subMonths(prev, 0)), -7));
            }
          }}
          className="p-2 rounded-full bg-slate-100 text-slate-600 active:scale-90 transition-transform"
        >
          <FiChevronLeft size={18} />
        </button>
        <p className="font-bold text-slate-700 text-sm">
          {format(viewMode === 'month' ? currentMonth : selectedDate, 'MMMM yyyy')}
        </p>
        <button
          onClick={() => {
            setCurrentMonth(prev => addMonths(prev, 1));
            if (viewMode === 'day' || viewMode === 'week') {
              setSelectedDate(prev => addDays(endOfMonth(prev), 7));
            }
          }}
          className="p-2 rounded-full bg-slate-100 text-slate-600 active:scale-90 transition-transform"
        >
          <FiChevronRight size={18} />
        </button>
      </div>

      {/* Calendar Strip (Day and Week modes) */}
      <AnimatePresence mode="wait">
        {viewMode !== 'month' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="flex gap-2 mb-4 overflow-x-auto pb-1 scrollbar-hide">
              {weekDays.map(day => {
                const isSelected = isSameDay(day, selectedDate);
                const hasExpenses = dayHasExpenses(day);
                const isToday = isSameDay(day, new Date());
                const isCurrentMonth = isSameMonth(day, currentMonth);

                return (
                  <button
                    key={day.toISOString()}
                    onClick={() => {
                      setSelectedDate(day);
                      setCurrentMonth(day);
                    }}
                    className={`flex-1 min-w-[46px] flex flex-col items-center py-3 rounded-2xl transition-all duration-300 ${
                      isSelected
                        ? 'bg-gradient-to-b from-primary to-blue-700 text-white shadow-lg shadow-primary/30 scale-105'
                        : isToday
                        ? 'bg-blue-50 text-primary border border-primary/20'
                        : isCurrentMonth
                        ? 'bg-white text-slate-600 border border-slate-100'
                        : 'bg-slate-50 text-slate-300'
                    }`}
                  >
                    <span className={`text-[10px] font-medium uppercase ${isSelected ? 'text-white/70' : 'text-slate-400'}`}>
                      {format(day, 'EEE')}
                    </span>
                    <span className={`text-lg font-bold mt-0.5 ${isSelected ? 'text-white' : ''}`}>
                      {format(day, 'd')}
                    </span>
                    {hasExpenses && (
                      <div className={`w-1.5 h-1.5 rounded-full mt-1 ${isSelected ? 'bg-white' : 'bg-expense'}`} />
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Summary Card */}
      <motion.div
        layout
        className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl p-4 flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="bg-white/10 p-2.5 rounded-xl">
            <FiCalendar className="text-white" size={18} />
          </div>
          <div>
            <p className="text-white/60 text-[10px] uppercase font-medium tracking-wider">
              {viewMode === 'day' ? 'Daily' : viewMode === 'week' ? 'Weekly' : 'Monthly'} Expense
            </p>
            <p className="text-white/50 text-[11px] mt-0.5">{periodLabel}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-white font-bold text-xl">₹{total.toLocaleString()}</p>
          <p className="text-white/40 text-[10px]">{filteredExpenses.length} transaction{filteredExpenses.length !== 1 ? 's' : ''}</p>
        </div>
      </motion.div>
    </div>
  );
};

export default CalendarExpenseView;
