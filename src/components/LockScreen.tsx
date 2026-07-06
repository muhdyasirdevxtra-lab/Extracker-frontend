import { useState, useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { FiDelete } from 'react-icons/fi';
import { toast } from 'react-hot-toast';

interface LockScreenProps {
  onUnlock: () => void;
}

const LockScreen = ({ onUnlock }: LockScreenProps) => {
  const [pin, setPin] = useState('');
  const [savedPin, setSavedPin] = useState<string | null>(null);
  const controls = useAnimation();

  useEffect(() => {
    const stored = localStorage.getItem('extracker_pin');
    setSavedPin(stored);
    
    // Automatically trigger biometrics if enabled
    const biometricsEnabled = localStorage.getItem('extracker_biometrics') === 'true';
    if (biometricsEnabled && window.PublicKeyCredential) {
      // In a real app, you would use WebAuthn API here.
      // For this demo, we simulate a biometric prompt.
      // Note: Full WebAuthn requires a backend registration flow.
    }
  }, []);

  const handleKeyPress = async (num: string) => {
    if (pin.length < 4) {
      const newPin = pin + num;
      setPin(newPin);
      
      if (newPin.length === 4) {
        // Validate PIN
        if (newPin === savedPin) {
          onUnlock();
        } else {
          // Shake animation on wrong PIN
          await controls.start({
            x: [-10, 10, -10, 10, -5, 5, 0],
            transition: { duration: 0.4 }
          });
          setPin('');
          toast.error('Incorrect PIN');
        }
      }
    }
  };

  const handleDelete = () => {
    setPin(pin.slice(0, -1));
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/80 backdrop-blur-xl flex flex-col items-center justify-center p-6 text-white">
      <div className="text-center mb-12">
        <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-primary/30">
          <span className="text-3xl font-bold">E</span>
        </div>
        <h2 className="text-2xl font-bold mb-2">Welcome Back</h2>
        <p className="text-white/60">Enter your PIN to continue</p>
      </div>

      <motion.div animate={controls} className="flex gap-4 mb-16">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`w-4 h-4 rounded-full border-2 transition-all duration-200 ${
              pin.length > i ? 'bg-white border-white scale-110' : 'border-white/30'
            }`}
          />
        ))}
      </motion.div>

      <div className="grid grid-cols-3 gap-6 max-w-[280px] mx-auto w-full">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
          <button
            key={num}
            onClick={() => handleKeyPress(num.toString())}
            className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-semibold bg-white/10 active:bg-white/20 mx-auto transition-colors"
          >
            {num}
          </button>
        ))}
        <div /> {/* Empty space */}
        <button
          onClick={() => handleKeyPress('0')}
          className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-semibold bg-white/10 active:bg-white/20 mx-auto transition-colors"
        >
          0
        </button>
        <button
          onClick={handleDelete}
          className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-semibold bg-white/10 active:bg-white/20 mx-auto transition-colors"
        >
          <FiDelete size={24} />
        </button>
      </div>
    </div>
  );
};

export default LockScreen;
