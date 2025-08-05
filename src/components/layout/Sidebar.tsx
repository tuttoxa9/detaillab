'use client';

import { useState } from 'react';
import { Calendar, Car, BarChart3, Settings, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

type SidebarProps = {
  activeSection: string;
  onSectionChange: (section: string) => void;
};

const menuItems = [
  { id: 'daily', label: 'Ежедневная работа', icon: Car },
  { id: 'appointments', label: 'Записи', icon: Calendar },
  { id: 'reports', label: 'Отчеты', icon: BarChart3 },
  { id: 'settings', label: 'Настройки', icon: Settings },
];

export default function Sidebar({ activeSection, onSectionChange }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 md:hidden bg-background/80 backdrop-blur-md shadow-ios"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Backdrop for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed left-0 top-0 h-full w-64 z-50 transform transition-transform duration-300 ease-out
          md:translate-x-0 md:relative md:z-auto
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="h-full bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 backdrop-blur-xl border-r border-slate-700/50 shadow-ios-lg">
          {/* Header */}
          <div className="p-6 border-b border-slate-700/50">
            <h1 className="text-2xl font-bold text-white text-gradient tracking-tight">
              Detail Lab
            </h1>
            <p className="text-slate-400 text-sm mt-1">Управление автомойкой</p>
          </div>

          {/* Navigation */}
          <nav className="p-4 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSectionChange(item.id);
                    setIsOpen(false);
                  }}
                  className={`
                    w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left
                    transition-all duration-200 group relative overflow-hidden
                    ${
                      isActive
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-ios-lg scale-105'
                        : 'text-slate-300 hover:text-white hover:bg-slate-700/50 hover:shadow-ios hover:scale-105'
                    }
                  `}
                >
                  {/* Active indicator */}
                  {isActive && (
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl" />
                  )}

                  <Icon
                    className={`h-5 w-5 relative z-10 transition-transform duration-200 ${
                      isActive ? 'scale-110' : 'group-hover:scale-110'
                    }`}
                  />
                  <span className="font-medium relative z-10">{item.label}</span>

                  {/* Hover effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                </button>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-700/50 bg-slate-900/50 backdrop-blur-md">
            <div className="text-center text-xs text-slate-500">
              <p>v1.0.0</p>
              <p className="mt-1">© 2024 Detail Lab</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
