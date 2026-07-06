import { useState, useContext } from 'react';
import { useForm } from 'react-hook-form';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import api from '../services/api';
import { FiLock, FiUser } from 'react-icons/fi';

const Login = () => {
  const { login } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit } = useForm();

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      // Create user if not exists, since we need a default seed
      try {
        await api.post('/auth/register', data);
      } catch (e) {
        // Ignore if user already exists
      }

      const response = await api.post('/auth/login', data);
      login(response.data);
      toast.success('Welcome back!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 min-h-screen w-full flex justify-center items-center p-0 sm:p-4">
      <div className="mobile-container flex flex-col justify-center px-8 sm:rounded-[2.5rem] sm:border-[8px] sm:border-slate-800 sm:h-[850px] bg-gradient-to-br from-primary to-slate-900 text-white relative overflow-hidden">
        
        {/* Background Decorations */}
        <div className="absolute top-[-10%] right-[-20%] w-64 h-64 bg-white opacity-5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-10%] left-[-20%] w-80 h-80 bg-savings opacity-20 rounded-full blur-3xl"></div>

        <div className="z-10 w-full max-w-sm mx-auto">
          <div className="mb-12 text-center">
            <h1 className="text-4xl font-bold mb-2">Extracker</h1>
            <p className="text-slate-300 text-sm">Smart Mobile Finance</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                <FiUser />
              </div>
              <input
                {...register('username', { required: true })}
                type="text"
                placeholder="Username"
                className="w-full bg-white/10 border border-white/20 rounded-2xl pl-12 pr-4 py-4 outline-none focus:border-white/50 focus:bg-white/20 transition-all text-white placeholder-slate-300"
              />
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                <FiLock />
              </div>
              <input
                {...register('password', { required: true })}
                type="password"
                placeholder="Password"
                className="w-full bg-white/10 border border-white/20 rounded-2xl pl-12 pr-4 py-4 outline-none focus:border-white/50 focus:bg-white/20 transition-all text-white placeholder-slate-300"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-white text-primary font-bold py-4 rounded-2xl mt-4 active:scale-95 transition-transform shadow-[0_0_20px_rgba(255,255,255,0.3)] disabled:opacity-70"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
          
          <div className="mt-8 text-center text-xs text-white/50">
            <p>Protected by Face ID / Biometrics</p>
            <p className="mt-1">(Coming Soon)</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
