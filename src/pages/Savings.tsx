import { useState } from 'react';
import { useForm } from 'react-hook-form';
import api from '../services/api';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const Savings = () => {
  const { register, handleSubmit } = useForm();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      await api.post('/savings', data);
      toast.success('Savings updated!');
      navigate('/');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update savings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-12 px-6">
      <h1 className="text-2xl font-bold text-slate-800 mb-8">Savings</h1>

      <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-50 mb-8">
        <h2 className="text-xl font-bold text-slate-700 mb-6">New Transaction</h2>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Type</label>
            <div className="flex gap-4">
              <label className="flex-1">
                <input type="radio" value="Deposit" defaultChecked {...register('type')} className="peer hidden" />
                <div className="p-4 text-center rounded-xl border border-slate-200 peer-checked:border-savings peer-checked:bg-savings/10 peer-checked:text-savings font-semibold transition-all">Deposit</div>
              </label>
              <label className="flex-1">
                <input type="radio" value="Withdrawal" {...register('type')} className="peer hidden" />
                <div className="p-4 text-center rounded-xl border border-slate-200 peer-checked:border-expense peer-checked:bg-expense/10 peer-checked:text-expense font-semibold transition-all">Withdraw</div>
              </label>
            </div>
          </div>

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
            <label className="block text-sm font-medium text-slate-600 mb-1">Remark</label>
            <input
              {...register('remark')}
              type="text"
              className="input-field h-14"
              placeholder="E.g., Emergency Fund"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-savings text-white font-bold py-4 rounded-2xl active:scale-95 transition-transform shadow-lg shadow-savings/30 disabled:opacity-70 mt-4"
          >
            {loading ? 'Processing...' : 'Confirm'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Savings;
