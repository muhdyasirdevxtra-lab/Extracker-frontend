import { useEffect, useState } from 'react';
import api from '../services/api';
import { FiCreditCard, FiSmartphone, FiDollarSign } from 'react-icons/fi';

interface Account {
  _id: string;
  name: string;
  icon: string;
  color: string;
  balance: number;
}

interface AccountSelectorProps {
  value: string;
  onChange: (accountId: string) => void;
}

const IconMap: Record<string, any> = {
  FiCreditCard,
  FiSmartphone,
  FiDollarSign,
};

const AccountSelector = ({ value, onChange }: AccountSelectorProps) => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const { data } = await api.get('/accounts');
        setAccounts(data);
        if (data.length > 0 && !value) {
          onChange(data[0]._id); // Select first by default
        }
      } catch (error) {
        console.error('Failed to fetch accounts', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAccounts();
  }, []);

  if (loading) {
    return <div className="h-16 bg-slate-200 rounded-xl animate-pulse"></div>;
  }

  return (
    <div className="grid grid-cols-3 gap-3">
      {accounts.map((account) => {
        const Icon = IconMap[account.icon] || FiCreditCard;
        const isSelected = value === account._id;
        
        return (
          <button
            key={account._id}
            type="button"
            onClick={() => onChange(account._id)}
            className={`p-3 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${
              isSelected
                ? 'border-primary bg-primary/5 text-primary'
                : 'border-slate-100 bg-white text-slate-500 hover:border-slate-200'
            }`}
          >
            <div
              className={`p-2 rounded-full ${isSelected ? 'bg-primary text-white' : 'bg-slate-100'}`}
              style={isSelected ? {} : { color: account.color }}
            >
              <Icon size={18} />
            </div>
            <div className="text-center">
              <p className={`text-[11px] font-bold ${isSelected ? 'text-primary' : 'text-slate-600'}`}>
                {account.name}
              </p>
              <p className="text-[9px] text-slate-400">₹{account.balance}</p>
            </div>
          </button>
        );
      })}
    </div>
  );
};

export default AccountSelector;
