import React, { createContext, useContext, useState } from 'react';
import { Wifi, X } from 'lucide-react';

const SocketAlertContext = createContext();

export const SocketAlertProvider = ({ children }) => {
  const [alerts, setAlerts] = useState([]);

  const triggerAlert = (message, title = 'Socket.io Handshake') => {
    const id = Date.now();
    setAlerts((prev) => [...prev, { id, title, message }]);

    // Auto dismiss after 4 seconds
    setTimeout(() => {
      setAlerts((prev) => prev.filter((alert) => alert.id !== id));
    }, 4000);
  };

  return (
    <SocketAlertContext.Provider value={{ triggerAlert }}>
      {children}
      {/* Toast Alert overlay container */}
      <div className="fixed bottom-5 right-5 z-55 flex flex-col gap-3.5 pointer-events-none max-w-sm w-full px-4 sm:px-0">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className="pointer-events-auto flex gap-3.5 bg-slate-900/95 border border-indigo-500/40 text-slate-100 p-4 rounded-2xl shadow-[0_10px_35px_rgba(99,102,241,0.25)] backdrop-blur-md animate-slide-in relative overflow-hidden group text-left"
          >
            {/* Bottom progress bar timer */}
            <div className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-primary-500 to-accent-500 w-full animate-toast-timer" />
            
            <div className="p-2 bg-indigo-500/10 rounded-xl border border-indigo-500/25 flex-shrink-0 flex items-center justify-center">
              <Wifi className="h-5 w-5 text-indigo-400 animate-pulse" />
            </div>
            
            <div className="flex-grow pr-4">
              <p className="text-xs font-black text-white tracking-wider uppercase flex items-center space-x-1.5">
                <span>{alert.title}</span>
                <span className="flex h-1.5 w-1.5 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                </span>
              </p>
              <p className="text-[11px] text-slate-300 font-semibold leading-relaxed mt-1">{alert.message}</p>
            </div>

            <button
              onClick={() => setAlerts((prev) => prev.filter((a) => a.id !== alert.id))}
              className="text-slate-400 hover:text-slate-200 transition-colors p-1 cursor-pointer absolute top-3.5 right-3.5"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </SocketAlertContext.Provider>
  );
};

export const useSocketAlert = () => {
  const context = useContext(SocketAlertContext);
  if (!context) {
    throw new Error('useSocketAlert must be used within a SocketAlertProvider');
  }
  return context;
};
