import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';

const categories = ['Food', 'Fuel', 'Travel', 'Medical', 'Shopping', 'Bills', 'Entertainment', 'Investment', 'Education', 'Subscription', 'Others'];

const Add = () => {
  const { register, handleSubmit } = useForm();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      await api.post('/expenses', data);
      toast.success('Expense added successfully!');
      navigate('/');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to add expense');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="bg-white min-h-[calc(100vh-80px)] rounded-t-[2.5rem] pt-6 px-6 shadow-[0_-20px_40px_rgba(0,0,0,0.1)] relative"
    >
      <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-8"></div>
      
      <h2 className="text-2xl font-bold text-slate-800 mb-6">Add Expense</h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 pb-10">
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1">Amount (₹)</label>
          <input
            {...register('amount', { required: true, min: 1 })}
            type="number"
            className="input-field text-2xl font-bold h-16"
            placeholder="0"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1">Category</label>
          <select {...register('category', { required: true })} className="input-field h-14">
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1">Remark</label>
          <input
            {...register('remark', { required: true })}
            type="text"
            className="input-field h-14"
            placeholder="What was this for?"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Date</label>
            <input
              {...register('date')}
              type="date"
              defaultValue={new Date().toISOString().split('T')[0]}
              className="input-field h-14"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Payment</label>
            <select {...register('paymentMethod')} className="input-field h-14">
              <option value="Cash">Cash</option>
              <option value="Card">Card</option>
              <option value="UPI">UPI</option>
            </select>
          </div>
        </div>

        {/* Note: File upload for receipt is omitted for MVP simplicity on mobile, but could be added here */}

        <button
          type="submit"
          disabled={loading}
          className="btn-primary mt-8"
        >
          {loading ? 'Saving...' : 'Save Expense'}
        </button>
      </form>
    </motion.div>
  );
};

export default Add;
