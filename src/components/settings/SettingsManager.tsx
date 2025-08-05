'use client';

import { useState, useEffect } from 'react';
import { Settings, Users, Building2, Database, Shield, Image, Palette, Calculator } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import EmployeeManager from './EmployeeManager';
import OrganizationManager from './OrganizationManager';
import DatabaseManager from './DatabaseManager';
import type { Settings as SettingsType, Employee, Organization } from '@/types';
import { getSettings, updateSettings, getEmployees, getOrganizations } from '@/lib/firestore';

interface SettingsManagerProps {
  isAuthenticated: boolean;
  onAuthRequired: () => void;
}

export default function SettingsManager({ isAuthenticated, onAuthRequired }: SettingsManagerProps) {
  const [settings, setSettings] = useState<SettingsType | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('system');

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [settingsData, employeesData, organizationsData] = await Promise.all([
        getSettings(),
        getEmployees(),
        getOrganizations(),
      ]);

      setSettings(settingsData || {
        salaryMethod: 'percent',
        salaryPercentValue: 50,
        minDailyRate: 1000,
        bonusPercentValue: 5,
        backgroundImageUrl: '',
        adminPassword: 'admin123',
      });
      setEmployees(employeesData);
      setOrganizations(organizationsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    if (!settings) return;

    setSaving(true);
    try {
      await updateSettings(settings);
      alert('Настройки сохранены');
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
      <Card className="max-w-md mx-auto">
        <CardHeader className="text-center">
          <Shield className="mx-auto h-12 w-12 text-slate-400 mb-4" />
          <CardTitle>Требуется авторизация</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-slate-600 mb-4">
            Для доступа к настройкам требуется авторизация администратора
          </p>
          <Button onClick={onAuthRequired} variant="gradient">
            Войти как администратор
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-slate-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="system" className="gap-2">
            <Settings className="h-4 w-4" />
            Система
          </TabsTrigger>
          <TabsTrigger value="salary" className="gap-2">
            <Calculator className="h-4 w-4" />
            Зарплата
          </TabsTrigger>
          <TabsTrigger value="employees" className="gap-2">
            <Users className="h-4 w-4" />
            Сотрудники
          </TabsTrigger>
          <TabsTrigger value="organizations" className="gap-2">
            <Building2 className="h-4 w-4" />
            Организации
          </TabsTrigger>
          <TabsTrigger value="database" className="gap-2">
            <Database className="h-4 w-4" />
            База данных
          </TabsTrigger>
        </TabsList>

        {/* System Settings */}
        <TabsContent value="system" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Безопасность и доступ
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Пароль администратора</label>
                <Input
                  type="password"
                  value={settings?.adminPassword || ''}
                  onChange={(e) => updateSetting('adminPassword', e.target.value)}
                  placeholder="Введите пароль"
                />
                <p className="text-xs text-slate-500">
                  Используется для доступа к настройкам и отчетам
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Внешний вид
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">URL фонового изображения</label>
                <Input
                  type="url"
                  value={settings?.backgroundImageUrl || ''}
                  onChange={(e) => updateSetting('backgroundImageUrl', e.target.value)}
                  placeholder="https://example.com/image.jpg"
                />
                <p className="text-xs text-slate-500">
                  Изображение будет использовано как фон приложения
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button onClick={handleSaveSettings} disabled={saving} variant="gradient">
              {saving ? 'Сохранение...' : 'Сохранить настройки'}
            </Button>
          </div>
        </TabsContent>

        {/* Salary Settings */}
        <TabsContent value="salary" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Система расчета зарплаты
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Метод расчета</label>
                  <Select
                    value={settings?.salaryMethod || 'percent'}
                    onValueChange={(value) => updateSetting('salaryMethod', value as 'percent' | 'min_plus_percent')}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percent">Только процент с выручки</SelectItem>
                      <SelectItem value="min_plus_percent">Минимальная ставка + процент</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Процент с выручки (%)</label>
                    <Input
                      type="number"
                      value={settings?.salaryPercentValue || 50}
                      onChange={(e) => updateSetting('salaryPercentValue', Number(e.target.value))}
                      min="0"
                      max="100"
                    />
                  </div>

                  {settings?.salaryMethod === 'min_plus_percent' && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Минимальная дневная ставка (₽)</label>
                      <Input
                        type="number"
                        value={settings?.minDailyRate || 1000}
                        onChange={(e) => updateSetting('minDailyRate', Number(e.target.value))}
                        min="0"
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Бонусный процент (%)</label>
                  <Input
                    type="number"
                    value={settings?.bonusPercentValue || 5}
                    onChange={(e) => updateSetting('bonusPercentValue', Number(e.target.value))}
                    min="0"
                    max="100"
                  />
                  <p className="text-xs text-slate-500">
                    Дополнительный процент за перевыполнение плана
                  </p>
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl">
                <h4 className="font-medium mb-2">Пример расчета:</h4>
                <div className="text-sm text-slate-600 space-y-1">
                  {settings?.salaryMethod === 'percent' ? (
                    <p>Выручка за день: 10,000 ₽ × {settings.salaryPercentValue}% = {(10000 * (settings.salaryPercentValue / 100)).toLocaleString()} ₽</p>
                  ) : (
                    <>
                      <p>Минимальная ставка: {settings?.minDailyRate?.toLocaleString()} ₽</p>
                      <p>Процент с выручки: 10,000 ₽ × {settings?.salaryPercentValue}% = {(10000 * ((settings?.salaryPercentValue || 50) / 100)).toLocaleString()} ₽</p>
                      <p>Итого: {((settings?.minDailyRate || 1000) + (10000 * ((settings?.salaryPercentValue || 50) / 100))).toLocaleString()} ₽</p>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button onClick={handleSaveSettings} disabled={saving} variant="gradient">
              {saving ? 'Сохранение...' : 'Сохранить настройки'}
            </Button>
          </div>
        </TabsContent>

        {/* Employees */}
        <TabsContent value="employees" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Управление сотрудниками
                <Badge variant="outline">{employees.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <EmployeeManager />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Organizations */}
        <TabsContent value="organizations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Управление организациями
                <Badge variant="outline">{organizations.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <OrganizationManager />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Database */}
        <TabsContent value="database" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Управление базой данных
              </CardTitle>
            </CardHeader>
            <CardContent>
              <DatabaseManager />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
