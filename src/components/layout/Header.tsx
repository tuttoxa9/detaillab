'use client';

import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { useState, useEffect } from 'react';
import { Clock, Wifi, Battery } from 'lucide-react';

export default function Header() {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h2 className="text-2xl font-bold text-slate-800">
            {format(currentTime, 'EEEE, d MMMM', { locale: ru })}
          </h2>
        </div>

        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2 text-slate-600">
            <Clock className="w-4 h-4" />
            <span className="font-mono text-sm">
              {format(currentTime, 'HH:mm:ss')}
            </span>
          </div>

          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-1">
              <Wifi className="w-4 h-4 text-green-500" />
            </div>
            <div className="flex items-center space-x-1">
              <Battery className="w-4 h-4 text-green-500" />
              <span className="text-xs text-slate-500">100%</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
