import { useState, useEffect } from 'react';
import api from '../services/api';
import { toast } from 'react-hot-toast';

const Settings = () => {
  const [settings, setSettings] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data } = await api.get('/settings');
        setSettings(data);
      } catch (error) {
        toast.error('Failed to load settings');
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleToggle = async (key: string, value: boolean) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    try {
      await api.put('/settings', newSettings);
    } catch (e) {
      toast.error('Failed to update setting');
      setSettings(settings); // revert on error
    }
  };

  if (loading) return <div className="p-6 animate-pulse mt-12 h-64 bg-slate-200 rounded-3xl"></div>;

  return (
    <div className="pt-12 px-6">
      <h1 className="text-2xl font-bold text-slate-800 mb-8">Settings</h1>

      <div className="bg-white rounded-[2rem] shadow-sm border border-slate-50 overflow-hidden">
        
        <div className="p-5 flex justify-between items-center border-b border-slate-100">
          <div>
            <p className="font-semibold text-slate-800">Push Notifications</p>
            <p className="text-xs text-slate-400">Receive alerts for budget limits</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              className="sr-only peer" 
              checked={settings.notificationsEnabled}
              onChange={(e) => handleToggle('notificationsEnabled', e.target.checked)} 
            />
            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
          </label>
        </div>

        <div className="p-5 flex justify-between items-center border-b border-slate-100">
          <div>
            <p className="font-semibold text-slate-800">Dark Mode</p>
            <p className="text-xs text-slate-400">Switch to dark theme</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              className="sr-only peer" 
              checked={settings.darkMode}
              onChange={(e) => handleToggle('darkMode', e.target.checked)} 
            />
            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
          </label>
        </div>

        <div className="p-5 flex justify-between items-center">
          <div>
            <p className="font-semibold text-slate-800">Currency</p>
          </div>
          <select 
            value={settings.currency} 
            onChange={(e) => {
              const newSettings = { ...settings, currency: e.target.value };
              setSettings(newSettings);
              api.put('/settings', newSettings);
            }}
            className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1 outline-none text-sm font-medium"
          >
            <option value="INR">₹ INR</option>
            <option value="USD">$ USD</option>
            <option value="EUR">€ EUR</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default Settings;
