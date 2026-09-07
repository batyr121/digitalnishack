'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { currentBalance } from '@/lib/actions';
export function CoinNotifier({ initialBalance }: { initialBalance: number }) {
  const router = useRouter();
  const previous = useRef(initialBalance);
  const [gain, setGain] = useState(0);
  const reduced = useReducedMotion();
  useEffect(() => {
    let disposed = false;
    let timeout: ReturnType<typeof setTimeout>;
    const poll = async () => {
      if (document.visibilityState !== 'visible') return;
      const balance = await currentBalance();
      if (disposed || balance === null) return;
      if (balance > previous.current) {
        setGain(balance - previous.current);
        clearTimeout(timeout);
        timeout = setTimeout(() => setGain(0), 5000);
      }
      if (balance !== previous.current) {
        previous.current = balance;
        router.refresh();
      }
    };
    const interval = setInterval(poll, 15000);
    document.addEventListener('visibilitychange', poll);
    return () => {
      disposed = true;
      clearInterval(interval);
      clearTimeout(timeout);
      document.removeEventListener('visibilitychange', poll);
    };
  }, [router]);
  return (
    <AnimatePresence>
      {gain > 0 && (
        <motion.div
          role="status"
          className="coin-toast"
          initial={{ opacity: 0, y: reduced ? 0 : 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
        >
          <strong>+{gain} DIGITAL COINS</strong>
          <small>ACTIVITY COMPLETED</small>
          {!reduced &&
            Array.from({ length: 12 }, (_, i) => (
              <i
                key={i}
                className="coin-particle"
                style={
                  {
                    '--x': `${Math.cos((i * Math.PI) / 6) * 140}px`,
                    '--y': `${Math.sin((i * Math.PI) / 6) * 100}px`,
                  } as React.CSSProperties
                }
              />
            ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
