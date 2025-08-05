'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import {
  Home,
  Calendar,
  BarChart3,
  Settings,
  Car,
  Users,
  Building2,
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const navigation = [
  { id: 'dashboard', label: 'Главный экран', icon: Home },
  { id: 'appointments', label: 'Записи', icon: Calendar },
  { id: 'reports', label: 'Отчёты', icon: BarChart3 },
  { id: 'settings', label: 'Настройки', icon: Settings },
];

export default function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  return (
    <div className="w-64 bg-gradient-to-b from-slate-900 to-slate-800 text-white p-4 shadow-2xl">
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-2">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Car className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Detail Lab
            </h1>
            <p className="text-xs text-slate-400">Управление автомойкой</p>
          </div>
        </div>
      </div>

      <nav className="space-y-2">
        {navigation.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={cn(
                'w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all duration-200',
                activeTab === item.id
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg transform scale-105'
                  : 'text-slate-300 hover:bg-slate-700/50 hover:text-white hover:scale-102'
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="mt-auto pt-8">
        <div className="bg-slate-700/50 rounded-lg p-4">
          <div className="flex items-center space-x-2 text-xs text-slate-400">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>Система активна</span>
          </div>
        </div>
      </div>
    </div>
  );
}
