'use client';

import { useState, useEffect, useCallback } from 'react';
import { format, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';
import { ru } from 'date-fns/locale';
import { BarChart3, Download, Calculator, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { Employee, CarWashed, Organization, Settings, SalaryCalculation } from '@/types';
import { getEmployees, getCarsWashed, getOrganizations, getSettings } from '@/lib/firestore';
import { calculatePeriodSalary, formatCurrency } from '@/lib/salary';

type ReportPeriod = 'day' | 'week' | 'month' | 'custom';

export default function ReportsManager() {
  const [period, setPeriod] = useState<ReportPeriod>('day');
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [salaryCalculations, setSalaryCalculations] = useState<SalaryCalculation[]>([]);
  const [organizationReports, setOrganizationReports] = useState<{ id: string; name: string; revenue: number; count: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [employeesData, organizationsData, settingsData] = await Promise.all([
        getEmployees(),
        getOrganizations(),
        getSettings(),
      ]);

      setEmployees(employeesData);
      setOrganizations(organizationsData);
      setSettings(settingsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateDateRange = useCallback(() => {
    const today = new Date();

    switch (period) {
      case 'day':
        setStartDate(today);
        setEndDate(today);
        break;
      case 'week':
        setStartDate(startOfWeek(today, { weekStartsOn: 1 }));
        setEndDate(endOfWeek(today, { weekStartsOn: 1 }));
        break;
      case 'month':
        setStartDate(startOfMonth(today));
        setEndDate(endOfMonth(today));
        break;
      default:
        // Keep current dates for custom period
        break;
    }
  }, [period]);

  useEffect(() => {
    updateDateRange();
  }, [updateDateRange]);

  const generateReports = useCallback(async () => {
    try {
      // Get all car washed data for the period
      const promises = [];
      const currentDate = new Date(startDate);
      const workLogs: { [date: string]: string[] } = {};

      while (currentDate <= endDate) {
        const dateString = format(currentDate, 'yyyy-MM-dd');
        promises.push(getCarsWashed(dateString));
        workLogs[dateString] = []; // This should be populated from work logs
        currentDate.setDate(currentDate.getDate() + 1);
      }

      const carsWashedArrays = await Promise.all(promises);
      const allCarsWashed = carsWashedArrays.flat();

      if (settings) {
        // Calculate salary reports
        const salaryCalcs = calculatePeriodSalary(allCarsWashed, employees, settings, workLogs);
        setSalaryCalculations(salaryCalcs);

        // Generate organization reports
        const orgData: { [orgId: string]: { name: string; revenue: number; count: number } } = {};

        allCarsWashed
          .filter(car => car.paymentType === 'organization' && car.organizationId)
          .forEach(car => {
            const orgId = car.organizationId!;
            const org = organizations.find(o => o.id === orgId);

            if (!orgData[orgId]) {
              orgData[orgId] = {
                name: org?.name || 'Неизвестная организация',
                revenue: 0,
                count: 0,
              };
            }

            orgData[orgId].revenue += car.cost;
            orgData[orgId].count += 1;
          });

        const orgReports = Object.entries(orgData).map(([id, data]) => ({
          id,
          ...data,
        }));
        setOrganizationReports(orgReports);
      }
    } catch (error) {
      console.error('Error generating reports:', error);
    }
  }, [startDate, endDate, settings, employees, organizations]);

  const generateOrganizationReports = useCallback((carsWashed: CarWashed[]) => {
    const orgData: { [orgId: string]: { name: string; revenue: number; count: number } } = {};

    carsWashed
      .filter(car => car.paymentType === 'organization' && car.organizationId)
      .forEach(car => {
        const orgId = car.organizationId!;
        const org = organizations.find(o => o.id === orgId);

        if (!orgData[orgId]) {
          orgData[orgId] = {
            name: org?.name || 'Неизвестная организация',
            revenue: 0,
            count: 0,
          };
        }

        orgData[orgId].revenue += car.cost;
        orgData[orgId].count += 1;
      });

    return Object.entries(orgData).map(([id, data]) => ({
      id,
      ...data,
    }));
  }, [organizations]);

  useEffect(() => {
    if (settings && employees.length > 0) {
      generateReports();
    }
  }, [generateReports, settings, employees]);

  const getTotalRevenue = () => {
    return salaryCalculations.reduce((sum, calc) => sum + calc.totalRevenue, 0);
  };

  const getTotalSalaries = () => {
    return salaryCalculations.reduce((sum, calc) => sum + calc.salary, 0);
  };

  const exportToExcel = () => {
    // Implement Excel export functionality
    console.log('Exporting to Excel...');
  };

  const exportToWord = () => {
    // Implement Word export functionality
    console.log('Exporting to Word...');
  };

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
            <BarChart3 className="w-5 h-5" />
            <span>Отчёты и аналитика</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-2">Период:</label>
              <Select value={period} onValueChange={(value) => setPeriod(value as ReportPeriod)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="day">День</SelectItem>
                  <SelectItem value="week">Неделя</SelectItem>
                  <SelectItem value="month">Месяц</SelectItem>
                  <SelectItem value="custom">Произвольный период</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {period === 'custom' && (
              <>
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-2">С:</label>
                  <input
                    type="date"
                    value={format(startDate, 'yyyy-MM-dd')}
                    onChange={(e) => setStartDate(new Date(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-2">По:</label>
                  <input
                    type="date"
                    value={format(endDate, 'yyyy-MM-dd')}
                    onChange={(e) => setEndDate(new Date(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </>
            )}

            <div className="flex space-x-2 items-end">
              <Button onClick={exportToWord} variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Word
              </Button>
              <Button onClick={exportToExcel} variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Excel
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{formatCurrency(getTotalRevenue())}</p>
              <p className="text-sm text-gray-600">Общая выручка</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{formatCurrency(getTotalSalaries())}</p>
              <p className="text-sm text-gray-600">Общая ЗП</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">
                {formatCurrency(getTotalRevenue() - getTotalSalaries())}
              </p>
              <p className="text-sm text-gray-600">Прибыль</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">{salaryCalculations.length}</p>
              <p className="text-sm text-gray-600">Активных сотрудников</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reports Tabs */}
      <Tabs defaultValue="salary" className="space-y-4">
        <TabsList>
          <TabsTrigger value="salary" className="flex items-center space-x-2">
            <Calculator className="w-4 h-4" />
            <span>Расчёт ЗП</span>
          </TabsTrigger>
          <TabsTrigger value="organizations" className="flex items-center space-x-2">
            <Building2 className="w-4 h-4" />
            <span>Организации</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="salary">
          <Card>
            <CardHeader>
              <CardTitle>Расчёт заработной платы</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Сотрудник</TableHead>
                    <TableHead>Смен</TableHead>
                    <TableHead>Выручка</TableHead>
                    <TableHead>Заработная плата</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {salaryCalculations.map((calc) => (
                    <TableRow key={calc.employeeId}>
                      <TableCell className="font-medium">{calc.employeeName}</TableCell>
                      <TableCell>{calc.shifts}</TableCell>
                      <TableCell>{formatCurrency(calc.totalRevenue)}</TableCell>
                      <TableCell className="font-semibold text-green-600">
                        {formatCurrency(calc.salary)}
                      </TableCell>
                    </TableRow>
                  ))}
                  {salaryCalculations.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-gray-500 py-8">
                        Нет данных за выбранный период
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="organizations">
          <Card>
            <CardHeader>
              <CardTitle>Отчёты по организациям</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Организация</TableHead>
                    <TableHead>Количество услуг</TableHead>
                    <TableHead>Общая сумма</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {organizationReports.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell className="font-medium">{report.name}</TableCell>
                      <TableCell>{report.count}</TableCell>
                      <TableCell className="font-semibold text-blue-600">
                        {formatCurrency(report.revenue)}
                      </TableCell>
                    </TableRow>
                  ))}
                  {organizationReports.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center text-gray-500 py-8">
                        Нет данных за выбранный период
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
