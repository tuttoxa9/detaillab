'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Sidebar from '@/components/layout/Sidebar';
import DailyWorksheet from '@/components/dashboard/DailyWorksheet';
import AppointmentsManager from '@/components/appointments/AppointmentsManager';
import ReportsManager from '@/components/reports/ReportsManager';
import SettingsManager from '@/components/settings/SettingsManager';

export default function HomePage() {
  const [activeSection, setActiveSection] = useState('daily');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);

  const handleAuthRequired = () => {
    setShowAuthPrompt(true);
  };

  const handleAuth = () => {
    const password = prompt('Введите пароль администратора:');
    if (password === 'admin123') { // В реальном приложении это должно быть из настроек
      setIsAuthenticated(true);
      setShowAuthPrompt(false);
    } else {
      alert('Неверный пароль');
    }
  };

  useEffect(() => {
    if (showAuthPrompt) {
      handleAuth();
    }
  }, [showAuthPrompt]);

  const renderContent = () => {
    switch (activeSection) {
      case 'daily':
        return <DailyWorksheet />;
      case 'appointments':
        return <AppointmentsManager />;
      case 'reports':
        return (
          <ReportsManager
            isAuthenticated={isAuthenticated}
            onAuthRequired={handleAuthRequired}
          />
        );
      case 'settings':
        return (
          <SettingsManager
            isAuthenticated={isAuthenticated}
            onAuthRequired={handleAuthRequired}
          />
        );
      default:
        return <DailyWorksheet />;
    }
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 to-slate-100 overflow-hidden">
      <Sidebar
        activeSection={activeSection}
        onSectionChange={setActiveSection}
      />

      <main className="flex-1 overflow-auto md:ml-0">
        <div className="h-full p-4 md:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <div className="mb-6">
              <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-ios p-6 border border-white/20">
                <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">
                  {getSectionTitle(activeSection)}
                </h1>
                <p className="text-slate-600">
                  {getSectionDescription(activeSection)}
                </p>
              </div>
            </div>

            <div className="animate-fade-in">
              {renderContent()}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function getSectionTitle(section: string): string {
  switch (section) {
    case 'daily':
      return 'Ежедневная работа';
    case 'appointments':
      return 'Управление записями';
    case 'reports':
      return 'Отчеты и аналитика';
    case 'settings':
      return 'Настройки системы';
    default:
      return 'Detail Lab';
  }
}

function getSectionDescription(section: string): string {
  switch (section) {
    case 'daily':
      return 'Добавляйте помытые автомобили и отслеживайте ежедневную работу';
    case 'appointments':
      return 'Управляйте записями клиентов и планируйте рабочий день';
    case 'reports':
      return 'Просматривайте отчеты по доходам, зарплатам и работе с организациями';
    case 'settings':
      return 'Настройте систему, управляйте сотрудниками и организациями';
    default:
      return 'Система управления автомойкой';
  }
}
