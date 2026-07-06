import { useState, useEffect } from 'react';
import api from '../services/api';
import { toast } from 'react-hot-toast';
import PinSetup from '../components/PinSetup';
import { FiLock } from 'react-icons/fi';

const Settings = () => {
  const [settings, setSettings] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [showPinSetup, setShowPinSetup] = useState(false);
  
  // Local security state
  const [pinEnabled, setPinEnabled] = useState(false);
  const [biometricsEnabled, setBiometricsEnabled] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data } = await api.get('/settings');
        setSettings(data);
        
        // Load local security settings
        setPinEnabled(!!localStorage.getItem('extracker_pin'));
        setBiometricsEnabled(localStorage.getItem('extracker_biometrics') === 'true');
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

  const togglePin = () => {
    if (pinEnabled) {
      localStorage.removeItem('extracker_pin');
      localStorage.removeItem('extracker_biometrics');
      setPinEnabled(false);
      setBiometricsEnabled(false);
      toast.success('App lock disabled');
    } else {
      setShowPinSetup(true);
    }
  };

  const toggleBiometrics = () => {
    const newState = !biometricsEnabled;
    setBiometricsEnabled(newState);
    localStorage.setItem('extracker_biometrics', String(newState));
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
      <div className="bg-white rounded-[2rem] shadow-sm border border-slate-50 overflow-hidden mb-10">
        <div className="p-5 border-b border-slate-100 flex flex-col gap-2">
          <label className="font-semibold text-slate-800">Monthly Expense Limit</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">₹</span>
            <input 
              type="number" 
              value={settings.monthlyLimit || ''} 
              onChange={(e) => {
                const newSettings = { ...settings, monthlyLimit: Number(e.target.value) };
                setSettings(newSettings);
              }}
              onBlur={() => api.put('/settings', { monthlyLimit: settings.monthlyLimit })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 outline-none font-semibold text-slate-800 focus:border-primary"
              placeholder="e.g. 4000"
            />
          </div>
        </div>

        <div className="p-5 flex flex-col gap-2 border-b border-slate-100">
          <label className="font-semibold text-slate-800">Daily Expense Limit</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">₹</span>
            <input 
              type="number" 
              value={settings.dailyLimit || ''} 
              onChange={(e) => {
                const newSettings = { ...settings, dailyLimit: Number(e.target.value) };
                setSettings(newSettings);
              }}
              onBlur={() => api.put('/settings', { dailyLimit: settings.dailyLimit })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 outline-none font-semibold text-slate-800 focus:border-primary"
              placeholder="e.g. 200"
            />
          </div>
        </div>

        <div className="p-5 flex justify-between items-center border-b border-slate-100">
          <div>
            <p className="font-semibold text-slate-800">Currency</p>
          </div>
          <select 
            value={settings.currency || 'INR'} 
            onChange={(e) => {
              const newSettings = { ...settings, currency: e.target.value };
              setSettings(newSettings);
              api.put('/settings', { currency: e.target.value });
            }}
            className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1 outline-none text-sm font-medium focus:border-primary"
          >
            <option value="INR">₹ INR</option>
            <option value="USD">$ USD</option>
            <option value="EUR">€ EUR</option>
          </select>
        </div>

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

        <div className="p-5 flex justify-between items-center">
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
      </div>

      <h2 className="text-xl font-bold text-slate-800 mt-10 mb-6 px-1">Security</h2>
      
      <div className="bg-white rounded-[2rem] shadow-sm border border-slate-50 overflow-hidden mb-10">
        <div className="p-5 flex justify-between items-center border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="bg-blue-50 p-2.5 rounded-full text-blue-500">
              <FiLock size={18} />
            </div>
            <div>
              <p className="font-semibold text-slate-800">App Lock (PIN)</p>
              <p className="text-xs text-slate-400">Require PIN to open app</p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              className="sr-only peer" 
              checked={pinEnabled}
              onChange={togglePin} 
            />
            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
          </label>
        </div>

        {pinEnabled && (
          <>
            <div className="p-5 flex justify-between items-center border-b border-slate-100">
              <div>
                <p className="font-semibold text-slate-800">Change PIN</p>
              </div>
              <button onClick={() => setShowPinSetup(true)} className="text-sm font-medium text-primary bg-primary/10 px-4 py-1.5 rounded-lg active:scale-95 transition-transform">
                Change
              </button>
            </div>
            
            <div className="p-5 flex justify-between items-center">
              <div>
                <p className="font-semibold text-slate-800">Use Biometrics</p>
                <p className="text-xs text-slate-400">Unlock with fingerprint/FaceID</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={biometricsEnabled}
                  onChange={toggleBiometrics} 
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
              </label>
            </div>
          </>
        )}
      </div>

      {showPinSetup && (
        <PinSetup 
          onClose={() => setShowPinSetup(false)} 
          onSuccess={() => {
            setShowPinSetup(false);
            setPinEnabled(true);
          }} 
        />
      )}
    </div>
  );
};

export default Settings;
