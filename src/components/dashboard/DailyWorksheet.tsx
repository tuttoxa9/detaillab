'use client';

import { useState, useEffect, useCallback } from 'react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Calendar, Plus, Download, Edit, Trash2, CalendarDays } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import AddCarDialog from './AddCarDialog';
import EditCarDialog from './EditCarDialog';
import type { CarWashed, Employee, Appointment } from '@/types';
import { getCarsWashed, getEmployees, getAppointments, createOrUpdateWorkLog } from '@/lib/firestore';
import { formatCurrency, formatTime } from '@/lib/salary';

export default function DailyWorksheet() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const [carsWashed, setCarsWashed] = useState<CarWashed[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [editingCar, setEditingCar] = useState<CarWashed | null>(null);
  const [loading, setLoading] = useState(true);

  const dateString = format(selectedDate, 'yyyy-MM-dd');
  const displayDate = format(selectedDate, 'd MMMM yyyy', { locale: ru });

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [employeesData, carsData, appointmentsData] = await Promise.all([
        getEmployees(),
        getCarsWashed(dateString),
        getAppointments(selectedDate, selectedDate, 'planned'),
      ]);

      setEmployees(employeesData);
      setCarsWashed(carsData);
      setAppointments(appointmentsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedDate, dateString]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSaveWorklog = async () => {
    try {
      await createOrUpdateWorkLog(dateString, selectedEmployees);
      alert('Данные о рабочем дне сохранены');
    } catch (error) {
      console.error('Error saving worklog:', error);
      alert('Ошибка при сохранении данных');
    }
  };

  const totalRevenue = carsWashed.reduce((sum, car) => sum + car.cost, 0);
  const totalCars = carsWashed.length;

  const getPaymentBadgeVariant = (paymentType: string) => {
    switch (paymentType) {
      case 'cash': return 'default';
      case 'card': return 'secondary';
      case 'organization': return 'outline';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
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
      {/* Header with Date Selection */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          <CalendarDays className="h-8 w-8 text-blue-600" />
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Рабочий день</h2>
            <p className="text-slate-600 capitalize">{displayDate}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Input
            type="date"
            value={format(selectedDate, 'yyyy-MM-dd')}
            onChange={(e) => setSelectedDate(new Date(e.target.value))}
            className="w-auto"
          />
          <Button variant="gradient" onClick={handleSaveWorklog}>
            Сохранить день
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 text-sm font-medium">Всего автомобилей</p>
                <p className="text-2xl font-bold text-blue-900">{totalCars}</p>
              </div>
              <div className="p-3 bg-blue-200 rounded-xl">
                <Calendar className="h-6 w-6 text-blue-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 text-sm font-medium">Общий доход</p>
                <p className="text-2xl font-bold text-green-900">{formatCurrency(totalRevenue)}</p>
              </div>
              <div className="p-3 bg-green-200 rounded-xl">
                <Download className="h-6 w-6 text-green-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-600 text-sm font-medium">Записей на день</p>
                <p className="text-2xl font-bold text-purple-900">{appointments.length}</p>
              </div>
              <div className="p-3 bg-purple-200 rounded-xl">
                <CalendarDays className="h-6 w-6 text-purple-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-600 text-sm font-medium">Средний чек</p>
                <p className="text-2xl font-bold text-orange-900">
                  {totalCars > 0 ? formatCurrency(totalRevenue / totalCars) : '0 ₽'}
                </p>
              </div>
              <div className="p-3 bg-orange-200 rounded-xl">
                <Plus className="h-6 w-6 text-orange-700" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Employee Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>Работающие сотрудники</span>
            <Badge variant="outline">{selectedEmployees.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Select
            value=""
            onValueChange={(employeeId) => {
              if (!selectedEmployees.includes(employeeId)) {
                setSelectedEmployees([...selectedEmployees, employeeId]);
              }
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Добавить сотрудника" />
            </SelectTrigger>
            <SelectContent>
              {employees
                .filter(emp => !selectedEmployees.includes(emp.id))
                .map((employee) => (
                  <SelectItem key={employee.id} value={employee.id}>
                    {employee.name}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>

          <div className="flex flex-wrap gap-2 mt-4">
            {selectedEmployees.map((employeeId) => {
              const employee = employees.find(e => e.id === employeeId);
              return (
                <Badge
                  key={employeeId}
                  variant="secondary"
                  className="gap-2 cursor-pointer"
                  onClick={() => setSelectedEmployees(selectedEmployees.filter(id => id !== employeeId))}
                >
                  {employee?.name}
                  <Trash2 className="h-3 w-3" />
                </Badge>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Cars Washed */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Помытые автомобили</CardTitle>
            <AddCarDialog
              logId={dateString}
              onCarAdded={loadData}
              trigger={
                <Button variant="gradient" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Добавить автомобиль
                </Button>
              }
            />
          </div>
        </CardHeader>
        <CardContent>
          {carsWashed.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="mx-auto h-12 w-12 text-slate-400 mb-4" />
              <h3 className="text-lg font-medium text-slate-600 mb-2">Пока нет данных</h3>
              <p className="text-slate-500">Добавьте первый помытый автомобиль</p>
            </div>
          ) : (
            <div className="rounded-xl border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead>Время</TableHead>
                    <TableHead>Автомобиль</TableHead>
                    <TableHead>Услуга</TableHead>
                    <TableHead>Стоимость</TableHead>
                    <TableHead>Оплата</TableHead>
                    <TableHead>Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {carsWashed.map((car) => (
                    <TableRow key={car.id} className="hover:bg-slate-50">
                      <TableCell className="font-medium">{formatTime(car.time)}</TableCell>
                      <TableCell>{car.carName}</TableCell>
                      <TableCell>{car.service}</TableCell>
                      <TableCell className="font-semibold">{formatCurrency(car.cost)}</TableCell>
                      <TableCell>
                        <Badge variant={getPaymentBadgeVariant(car.paymentType)}>
                          {car.paymentType === 'cash' ? 'Наличные' :
                           car.paymentType === 'card' ? 'Карта' : 'Организация'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingCar(car)}
                          className="gap-2"
                        >
                          <Edit className="h-4 w-4" />
                          Изменить
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Car Dialog */}
      {editingCar && (
        <EditCarDialog
          car={editingCar}
          open={!!editingCar}
          onOpenChange={(open) => !open && setEditingCar(null)}
          onSuccess={loadData}
        />
      )}
    </div>
  );
}
