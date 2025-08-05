'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Calendar, Plus, Download, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import AddCarDialog from './AddCarDialog';
import EditCarDialog from './EditCarDialog';
import type { CarWashed, Employee, Appointment } from '@/types';
import { getCarsWashed, getEmployees, getAppointments, createOrUpdateWorkLog } from '@/lib/firestore';
import { formatCurrency, formatTime } from '@/lib/salary';

interface DailyWorksheetProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
}

export default function DailyWorksheet({ selectedDate, onDateChange }: DailyWorksheetProps) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const [carsWashed, setCarsWashed] = useState<CarWashed[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [editingCar, setEditingCar] = useState<CarWashed | null>(null);
  const [loading, setLoading] = useState(true);

  const dateString = format(selectedDate, 'yyyy-MM-dd');

  useEffect(() => {
    loadData();
  }, [selectedDate]);

  const loadData = async () => {
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
  };

  const handleEmployeeChange = async (employeeIds: string[]) => {
    setSelectedEmployees(employeeIds);
    try {
      await createOrUpdateWorkLog(dateString, employeeIds);
    } catch (error) {
      console.error('Error updating work log:', error);
    }
  };

  const handleCarAdded = () => {
    loadData();
  };

  const handleCarUpdated = () => {
    setEditingCar(null);
    loadData();
  };

  const handleAppointmentComplete = (appointment: Appointment) => {
    // This will open the add car dialog with pre-filled data
    // Implementation depends on your AddCarDialog component
  };

  const totalRevenue = carsWashed.reduce((sum, car) => sum + car.cost, 0);

  const getPaymentTypeColor = (type: string) => {
    switch (type) {
      case 'cash': return 'bg-green-100 text-green-800';
      case 'card': return 'bg-blue-100 text-blue-800';
      case 'organization': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentTypeLabel = (type: string) => {
    switch (type) {
      case 'cash': return 'Наличные';
      case 'card': return 'Карта';
      case 'organization': return 'Организация';
      default: return type;
    }
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
      {/* Control Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="w-5 h-5" />
            <span>Управление сменой</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-2">Дата:</label>
              <input
                type="date"
                value={format(selectedDate, 'yyyy-MM-dd')}
                onChange={(e) => onDateChange(new Date(e.target.value))}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex-2">
              <label className="block text-sm font-medium mb-2">Сотрудники на смене:</label>
              <Select
                value={selectedEmployees.join(',')}
                onValueChange={(value) => handleEmployeeChange(value ? value.split(',') : [])}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Выберите сотрудников" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((employee) => (
                    <SelectItem key={employee.id} value={employee.id}>
                      {employee.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex space-x-2">
            <AddCarDialog
              logId={dateString}
              onCarAdded={handleCarAdded}
              trigger={
                <Button className="bg-green-600 hover:bg-green-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Добавить помытую машину
                </Button>
              }
            />

            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Экспорт в Word
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Table */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>Ведомость ежедневных работ</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">№</TableHead>
                    <TableHead>Время</TableHead>
                    <TableHead>Авто</TableHead>
                    <TableHead>Услуга</TableHead>
                    <TableHead>Стоимость</TableHead>
                    <TableHead>Оплата</TableHead>
                    <TableHead className="w-20">Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {carsWashed.map((car, index) => (
                    <TableRow key={car.id}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell className="font-mono">{formatTime(car.time)}</TableCell>
                      <TableCell>{car.carName}</TableCell>
                      <TableCell>{car.service}</TableCell>
                      <TableCell className="font-semibold">{formatCurrency(car.cost)}</TableCell>
                      <TableCell>
                        <Badge className={getPaymentTypeColor(car.paymentType)}>
                          {getPaymentTypeLabel(car.paymentType)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setEditingCar(car)}
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {carsWashed.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-gray-500 py-8">
                        Нет записей за выбранный день
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Appointments */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Ближайшие записи</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {appointments.map((appointment) => (
                  <div key={appointment.id} className="p-3 bg-blue-50 rounded-lg border">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">
                          {format(appointment.dateTime, 'HH:mm')}
                        </p>
                        <p className="text-xs text-gray-600">{appointment.clientName}</p>
                        <p className="text-xs text-gray-500">{appointment.carInfo}</p>
                      </div>
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => handleAppointmentComplete(appointment)}
                      >
                        ✓
                      </Button>
                    </div>
                  </div>
                ))}
                {appointments.length === 0 && (
                  <p className="text-center text-gray-500 py-4">
                    Нет записей на сегодня
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Daily Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Итоги дня</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm text-green-600 font-medium">Итого за день</p>
              <p className="text-2xl font-bold text-green-700">{formatCurrency(totalRevenue)}</p>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-600 font-medium">Количество машин</p>
              <p className="text-2xl font-bold text-blue-700">{carsWashed.length}</p>
            </div>

            <div className="bg-purple-50 p-4 rounded-lg">
              <p className="text-sm text-purple-600 font-medium">Сотрудников на смене</p>
              <p className="text-2xl font-bold text-purple-700">{selectedEmployees.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Car Dialog */}
      {editingCar && (
        <EditCarDialog
          car={editingCar}
          onCarUpdated={handleCarUpdated}
          onClose={() => setEditingCar(null)}
        />
      )}
    </div>
  );
}
