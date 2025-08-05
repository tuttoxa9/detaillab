'use client';

import { useState, useEffect } from 'react';
import { Settings, Users, Building2, Database, Shield, Image } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import EmployeeManager from './EmployeeManager';
import OrganizationManager from './OrganizationManager';
import DatabaseManager from './DatabaseManager';
import type { Settings as SettingsType } from '@/types';
import { getSettings, updateSettings } from '@/lib/firestore';

interface SettingsManagerProps {
  isAuthenticated: boolean;
  onAuthRequired: () => void;
}

export default function SettingsManager({ isAuthenticated, onAuthRequired }: SettingsManagerProps) {
  const [settings, setSettings] = useState<SettingsType | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      loadSettings();
    }
  }, [isAuthenticated]);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const settingsData = await getSettings();
      if (settingsData) {
        setSettings(settingsData);
      } else {
        // Create default settings
        const defaultSettings: SettingsType = {
          salaryMethod: 'percent',
          salaryPercentValue: 30,
          adminPassword: 'admin',
        };
        setSettings(defaultSettings);
        await updateSettings(defaultSettings);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    if (!settings) return;

    setSaving(true);
    try {
      await updateSettings(settings);
      alert('Настройки сохранены успешно!');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Ошибка при сохранении настроек');
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (key: keyof SettingsType, value: SettingsType[keyof SettingsType]) => {
    if (settings) {
      setSettings({ ...settings, [key]: value });
    }
  };

  if (!isAuthenticated) {
    return (
      <Card className="max-w-md mx-auto mt-20">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="w-5 h-5" />
            <span>Доступ к настройкам</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">
            Для доступа к настройкам требуется авторизация администратора.
          </p>
          <Button onClick={onAuthRequired} className="w-full">
            Войти как администратор
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="w-5 h-5" />
            <span>Настройки системы</span>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Settings Tabs */}
      <Tabs defaultValue="salary" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="salary">Зарплата</TabsTrigger>
          <TabsTrigger value="employees">Сотрудники</TabsTrigger>
          <TabsTrigger value="organizations">Организации</TabsTrigger>
          <TabsTrigger value="database">База данных</TabsTrigger>
          <TabsTrigger value="appearance">Оформление</TabsTrigger>
        </TabsList>

        <TabsContent value="salary">
          <Card>
            <CardHeader>
              <CardTitle>Расчёт заработной платы</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Метод расчёта:</label>
                <Select
                  value={settings?.salaryMethod}
                  onValueChange={(value) => updateSetting('salaryMethod', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percent">Процент от выручки</SelectItem>
                    <SelectItem value="min_plus_percent">Минимальная ставка + %</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  {settings?.salaryMethod === 'percent'
                    ? 'Процент от выручки (%)'
                    : 'Основной процент (%)'
                  }:
                </label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={settings?.salaryPercentValue || ''}
                  onChange={(e) => updateSetting('salaryPercentValue', Number(e.target.value))}
                  placeholder="30"
                />
              </div>

              {settings?.salaryMethod === 'min_plus_percent' && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-2">Минимальная дневная ставка (₽):</label>
                    <Input
                      type="number"
                      min="0"
                      value={settings?.minDailyRate || ''}
                      onChange={(e) => updateSetting('minDailyRate', Number(e.target.value))}
                      placeholder="50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Бонусный процент (%):</label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={settings?.bonusPercentValue || ''}
                      onChange={(e) => updateSetting('bonusPercentValue', Number(e.target.value))}
                      placeholder="27"
                    />
                  </div>
                </>
              )}

              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Как работает расчёт:</h4>
                {settings?.salaryMethod === 'percent' ? (
                  <p className="text-blue-800 text-sm">
                    Сотрудник получает {settings.salaryPercentValue}% от стоимости выполненных им работ.
                  </p>
                ) : (
                  <div className="text-blue-800 text-sm space-y-1">
                    <p>• Если заработок меньше {settings?.minDailyRate || 0} ₽ - выплачивается минимальная ставка</p>
                    <p>• Если больше - выплачивается основной заработок + {settings?.bonusPercentValue || 0}% бонус от общей выручки</p>
                  </div>
                )}
              </div>

              <Button onClick={handleSaveSettings} disabled={saving} className="w-full">
                {saving ? 'Сохранение...' : 'Сохранить настройки зарплаты'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="employees">
          <EmployeeManager />
        </TabsContent>

        <TabsContent value="organizations">
          <OrganizationManager />
        </TabsContent>

        <TabsContent value="database">
          <DatabaseManager />
        </TabsContent>

        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Image className="w-5 h-5" />
                <span>Оформление</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">URL фонового изображения:</label>
                <Input
                  type="url"
                  value={settings?.backgroundImageUrl || ''}
                  onChange={(e) => updateSetting('backgroundImageUrl', e.target.value)}
                  placeholder="https://example.com/background.jpg"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Оставьте пустым для использования стандартного фона
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Пароль администратора:</label>
                <Input
                  type="password"
                  value={settings?.adminPassword || ''}
                  onChange={(e) => updateSetting('adminPassword', e.target.value)}
                  placeholder="admin"
                />
              </div>

              <Button onClick={handleSaveSettings} disabled={saving} className="w-full">
                {saving ? 'Сохранение...' : 'Сохранить настройки оформления'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
