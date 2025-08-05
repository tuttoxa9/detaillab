'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import DailyWorksheet from '@/components/dashboard/DailyWorksheet';
import AppointmentsManager from '@/components/appointments/AppointmentsManager';
import ReportsManager from '@/components/reports/ReportsManager';
import SettingsManager from '@/components/settings/SettingsManager';
import { getSettings } from '@/lib/firestore';

export default function Home() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [authPassword, setAuthPassword] = useState('');
  const [adminPassword, setAdminPassword] = useState('admin');
  const [backgroundImage, setBackgroundImage] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const settings = await getSettings();
      if (settings) {
        setAdminPassword(settings.adminPassword || 'admin');
        setBackgroundImage(settings.backgroundImageUrl || '');
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const handleAuthAttempt = () => {
    if (authPassword === adminPassword) {
      setIsAdminAuthenticated(true);
      setShowAuthDialog(false);
      setAuthPassword('');
      setActiveTab('settings');
    } else {
      alert('Неверный пароль администратора');
      setAuthPassword('');
    }
  };

  const handleTabChange = (tab: string) => {
    if (tab === 'settings' && !isAdminAuthenticated) {
      setShowAuthDialog(true);
    } else {
      setActiveTab(tab);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <DailyWorksheet
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
          />
        );
      case 'appointments':
        return <AppointmentsManager />;
      case 'reports':
        return <ReportsManager />;
      case 'settings':
        return (
          <SettingsManager
            isAuthenticated={isAdminAuthenticated}
            onAuthRequired={() => setShowAuthDialog(true)}
          />
        );
      default:
        return (
          <DailyWorksheet
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
          />
        );
    }
  };

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200"
      style={{
        backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {/* Background overlay for better readability */}
      {backgroundImage && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-0" />
      )}

      <div className="relative z-10 flex h-screen">
        <Sidebar activeTab={activeTab} onTabChange={handleTabChange} />

        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />

          <main className="flex-1 overflow-auto p-6">
            <div className="max-w-7xl mx-auto">
              {renderContent()}
            </div>
          </main>
        </div>
      </div>

      {/* Admin Authentication Dialog */}
      <Dialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Авторизация администратора</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-gray-600">
              Для доступа к настройкам введите пароль администратора:
            </p>
            <Input
              type="password"
              value={authPassword}
              onChange={(e) => setAuthPassword(e.target.value)}
              placeholder="Пароль"
              onKeyDown={(e) => e.key === 'Enter' && handleAuthAttempt()}
            />
            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowAuthDialog(false);
                  setAuthPassword('');
                }}
                className="flex-1"
              >
                Отмена
              </Button>
              <Button onClick={handleAuthAttempt} className="flex-1">
                Войти
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
