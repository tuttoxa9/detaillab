'use client';

import { useState, useEffect, useCallback } from 'react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Plus, Search, Calendar, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AddAppointmentDialog from './AddAppointmentDialog';
import AppointmentCard from './AppointmentCard';
import AppointmentsCalendar from './AppointmentsCalendar';
import type { Appointment } from '@/types';
import { getAppointments } from '@/lib/firestore';

export default function AppointmentsManager() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    setLoading(true);
    try {
      const data = await getAppointments();
      setAppointments(data);
    } catch (error) {
      console.error('Error loading appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterAppointments = useCallback(() => {
    let filtered = appointments;

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(app => app.status === statusFilter);
    }

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(app =>
        app.clientName.toLowerCase().includes(term) ||
        app.clientPhone.includes(term) ||
        app.carInfo.toLowerCase().includes(term) ||
        (app.service && app.service.toLowerCase().includes(term))
      );
    }

    setFilteredAppointments(filtered);
  }, [appointments, searchTerm, statusFilter]);

  useEffect(() => {
    filterAppointments();
  }, [filterAppointments]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'planned':
        return <Badge className="bg-blue-100 text-blue-800">Запланировано</Badge>;
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Выполнено</Badge>;
      case 'canceled':
        return <Badge className="bg-red-100 text-red-800">Отменено</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getStatusCounts = () => {
    return {
      planned: appointments.filter(app => app.status === 'planned').length,
      completed: appointments.filter(app => app.status === 'completed').length,
      canceled: appointments.filter(app => app.status === 'canceled').length,
    };
  };

  const statusCounts = getStatusCounts();

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
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="w-5 h-5" />
              <span>Управление записями</span>
            </CardTitle>
            <AddAppointmentDialog
              onAppointmentAdded={loadAppointments}
              trigger={
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Новая запись
                </Button>
              }
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Поиск по имени, телефону, авто..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все записи</SelectItem>
                <SelectItem value="planned">Запланированные ({statusCounts.planned})</SelectItem>
                <SelectItem value="completed">Выполненные ({statusCounts.completed})</SelectItem>
                <SelectItem value="canceled">Отмененные ({statusCounts.canceled})</SelectItem>
              </SelectContent>
            </Select>

            {/* View Mode Toggle */}
            <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as 'list' | 'calendar')}>
              <TabsList>
                <TabsTrigger value="list">Список</TabsTrigger>
                <TabsTrigger value="calendar">Календарь</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{appointments.length}</p>
              <p className="text-sm text-gray-600">Всего записей</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-600">{statusCounts.planned}</p>
              <p className="text-sm text-gray-600">Запланировано</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{statusCounts.completed}</p>
              <p className="text-sm text-gray-600">Выполнено</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">{statusCounts.canceled}</p>
              <p className="text-sm text-gray-600">Отменено</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Content */}
      {viewMode === 'list' ? (
        <Card>
          <CardHeader>
            <CardTitle>Список записей</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {filteredAppointments.map((appointment) => (
                <AppointmentCard
                  key={appointment.id}
                  appointment={appointment}
                  onUpdate={loadAppointments}
                />
              ))}
              {filteredAppointments.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  {searchTerm || statusFilter !== 'all'
                    ? 'Записи не найдены'
                    : 'Записей пока нет'
                  }
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <AppointmentsCalendar
          appointments={filteredAppointments}
          onUpdate={loadAppointments}
        />
      )}
    </div>
  );
}
