import { useState } from 'react';
import { motion, useAnimation, AnimatePresence } from 'framer-motion';
import { FiDelete, FiX } from 'react-icons/fi';
import { toast } from 'react-hot-toast';

interface PinSetupProps {
  onClose: () => void;
  onSuccess: () => void;
}

const PinSetup = ({ onClose, onSuccess }: PinSetupProps) => {
  const [step, setStep] = useState<'create' | 'confirm'>('create');
  const [firstPin, setFirstPin] = useState('');
  const [pin, setPin] = useState('');
  const controls = useAnimation();

  const handleKeyPress = async (num: string) => {
    if (pin.length < 4) {
      const newPin = pin + num;
      setPin(newPin);
      
      if (newPin.length === 4) {
        if (step === 'create') {
          setTimeout(() => {
            setFirstPin(newPin);
            setPin('');
            setStep('confirm');
          }, 300);
        } else {
          if (newPin === firstPin) {
            localStorage.setItem('extracker_pin', newPin);
            toast.success('PIN set successfully!');
            onSuccess();
          } else {
            await controls.start({
              x: [-10, 10, -10, 10, -5, 5, 0],
              transition: { duration: 0.4 }
            });
            setPin('');
            toast.error('PINs do not match. Try again.');
          }
        }
      }
    }
  };

  const handleDelete = () => {
    setPin(pin.slice(0, -1));
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-white rounded-[2rem] p-6 w-full max-w-sm shadow-2xl relative"
        >
          <button onClick={onClose} className="absolute top-6 right-6 p-2 bg-slate-100 rounded-full text-slate-500 hover:bg-slate-200">
            <FiX size={20} />
          </button>
          
          <div className="text-center mb-8 pt-4">
            <h2 className="text-xl font-bold text-slate-800 mb-2">
              {step === 'create' ? 'Create a PIN' : 'Confirm PIN'}
            </h2>
            <p className="text-sm text-slate-500">
              {step === 'create' 
                ? 'Enter a 4-digit PIN to secure your app.' 
                : 'Enter the same PIN again to confirm.'}
            </p>
          </div>

          <motion.div animate={controls} className="flex gap-4 mb-10 justify-center">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className={`w-4 h-4 rounded-full border-2 transition-all duration-200 ${
                  pin.length > i ? 'bg-primary border-primary scale-110' : 'border-slate-300'
                }`}
              />
            ))}
          </motion.div>

          <div className="grid grid-cols-3 gap-4 mx-auto w-full">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
              <button
                key={num}
                onClick={() => handleKeyPress(num.toString())}
                className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-semibold bg-slate-50 text-slate-700 active:bg-slate-100 mx-auto transition-colors"
              >
                {num}
              </button>
            ))}
            <div /> {/* Empty space */}
            <button
              onClick={() => handleKeyPress('0')}
              className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-semibold bg-slate-50 text-slate-700 active:bg-slate-100 mx-auto transition-colors"
            >
              0
            </button>
            <button
              onClick={handleDelete}
              className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-semibold bg-slate-50 text-slate-700 active:bg-slate-100 mx-auto transition-colors"
            >
              <FiDelete size={24} />
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default PinSetup;
