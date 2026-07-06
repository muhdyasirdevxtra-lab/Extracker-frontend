import { useState, useMemo, useCallback } from 'react';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
  isSameDay,
  isSameMonth,
  isToday,
} from 'date-fns';
import { motion } from 'framer-motion';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

interface CalendarExpenseViewProps {
  expenses: any[];
  onFilteredExpenses: (filtered: any[]) => void;
}

const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

const CalendarExpenseView = ({ expenses, onFilteredExpenses }: CalendarExpenseViewProps) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Generate all calendar cells for the current month view (including padding days)
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calStart = startOfWeek(monthStart, { weekStartsOn: 0 }); // Sunday start
    const calEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });

    const days: Date[] = [];
    let day = calStart;
    while (day <= calEnd) {
      days.push(day);
      day = addDays(day, 1);
    }
    return days;
  }, [currentMonth]);

  // Build a Set of date strings that have expenses for fast lookup
  const expenseDateSet = useMemo(() => {
    const set = new Set<string>();
    expenses.forEach(e => {
      set.add(format(new Date(e.date), 'yyyy-MM-dd'));
    });
    return set;
  }, [expenses]);

  // Filter expenses for the selected date
  const filteredExpenses = useMemo(() => {
    const filtered = expenses.filter(e => isSameDay(new Date(e.date), selectedDate));
    onFilteredExpenses(filtered);
    return filtered;
  }, [expenses, selectedDate, onFilteredExpenses]);

  // Total for selected day
  const total = useMemo(() => {
    return filteredExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  }, [filteredExpenses]);

  const goToToday = useCallback(() => {
    const today = new Date();
    setSelectedDate(today);
    setCurrentMonth(today);
  }, []);

  return (
    <div className="mb-6">
      {/* Calendar Card */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center px-4 py-3 border-b border-slate-100">
          <p className="font-bold text-slate-800 text-[15px]">
            {format(currentMonth, 'MMMM yyyy')}
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentMonth(prev => subMonths(prev, 1))}
              className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 active:scale-90 transition-all"
            >
              <FiChevronLeft size={18} />
            </button>
            <button
              onClick={goToToday}
              className="px-3 py-1.5 rounded-lg text-primary font-semibold text-sm hover:bg-primary/5 active:scale-95 transition-all"
            >
              Today
            </button>
            <button
              onClick={() => setCurrentMonth(prev => addMonths(prev, 1))}
              className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 active:scale-90 transition-all"
            >
              <FiChevronRight size={18} />
            </button>
          </div>
        </div>

        {/* Day-of-week headers */}
        <div className="grid grid-cols-7 px-2 pt-2">
          {DAY_LABELS.map((label, i) => (
            <div key={i} className="text-center text-[11px] font-semibold text-slate-400 py-1.5">
              {label}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 px-2 pb-3">
          {calendarDays.map((day, i) => {
            const isCurrentMonth = isSameMonth(day, currentMonth);
            const isSelected = isSameDay(day, selectedDate);
            const isTodayDate = isToday(day);
            const hasExpenses = expenseDateSet.has(format(day, 'yyyy-MM-dd'));

            return (
              <button
                key={i}
                onClick={() => {
                  setSelectedDate(day);
                  if (!isCurrentMonth) setCurrentMonth(day);
                }}
                className="flex flex-col items-center justify-center py-2 relative"
              >
                <div
                  className={`w-9 h-9 flex items-center justify-center rounded-full text-sm font-medium transition-all ${
                    isSelected
                      ? 'bg-primary text-white font-bold shadow-md shadow-primary/30'
                      : isTodayDate
                      ? 'bg-blue-50 text-primary font-bold ring-1 ring-primary/30'
                      : isCurrentMonth
                      ? 'text-slate-700'
                      : 'text-slate-300'
                  }`}
                >
                  {format(day, 'd')}
                </div>
                {/* Expense dot indicator */}
                {hasExpenses && (
                  <div className={`w-1 h-1 rounded-full mt-0.5 ${
                    isSelected ? 'bg-primary' : 'bg-expense'
                  }`} />
                )}
                {!hasExpenses && <div className="w-1 h-1 mt-0.5" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Date Summary */}
      <motion.div
        layout
        className="mt-4 bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl p-4 flex items-center justify-between"
      >
        <div>
          <p className="text-white/50 text-[10px] uppercase font-medium tracking-wider">
            {format(selectedDate, 'EEEE')}
          </p>
          <p className="text-white/80 text-sm font-semibold mt-0.5">
            {format(selectedDate, 'd MMM yyyy')}
          </p>
        </div>
        <div className="text-right">
          <p className="text-white font-bold text-xl">₹{total.toLocaleString()}</p>
          <p className="text-white/40 text-[10px]">
            {filteredExpenses.length} expense{filteredExpenses.length !== 1 ? 's' : ''}
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default CalendarExpenseView;
